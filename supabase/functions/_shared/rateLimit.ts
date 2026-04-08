/**
 * Rate Limiting Utilities Module
 * 
 * Purpose: Implement rate limiting to prevent abuse of Edge Functions
 * Responsibilities:
 * - Track request counts per user/IP
 * - Enforce rate limits based on configuration
 * - Return rate limit status headers
 * - Support different rate limit strategies (per-user, per-IP, global)
 * 
 * Usage: Use before processing requests to enforce limits
 * Example: checkRateLimit(userId, 100, 3600) // 100 requests per hour
 */

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

// In-memory store for rate limiting (would use Redis in production)
const rateLimitStore: RateLimitStore = {}

/**
 * Clean up expired rate limit entries
 * Removes entries older than 24 hours to prevent memory buildup
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  const ttl = 24 * 60 * 60 * 1000 // 24 hours
  
  for (const key in rateLimitStore) {
    if (now - rateLimitStore[key].resetTime > ttl) {
      delete rateLimitStore[key]
    }
  }
}

/**
 * Check and enforce rate limit
 * @param identifier - Unique identifier (user ID or IP address)
 * @param limit - Maximum requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns Object with allowed status and headers
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 3600
): { allowed: boolean; headers: Record<string, string> } {
  cleanupExpiredEntries()
  
  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore[key]
  
  if (!entry) {
    // First request from this identifier
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    }
    
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': (limit - 1).toString(),
        'X-RateLimit-Reset': new Date(now + windowSeconds * 1000).toISOString(),
      },
    }
  }
  
  if (now > entry.resetTime) {
    // Reset window has expired
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    }
    
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': (limit - 1).toString(),
        'X-RateLimit-Reset': new Date(now + windowSeconds * 1000).toISOString(),
      },
    }
  }
  
  // Within current window
  entry.count++
  const remaining = Math.max(0, limit - entry.count)
  
  return {
    allowed: remaining > 0,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
    },
  }
}

/**
 * Get current rate limit status for an identifier
 * @param identifier - Unique identifier
 * @returns Current count and reset time
 */
export function getRateLimitStatus(identifier: string): { count: number; resetTime: number } | null {
  return rateLimitStore[identifier] || null
}

/**
 * Reset rate limit for an identifier (useful for testing)
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  delete rateLimitStore[identifier]
}

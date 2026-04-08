/**
 * Authentication Utilities Module
 * 
 * Purpose: Centralized authentication handling for all Supabase Edge Functions
 * Responsibilities:
 * - JWT token validation
 * - User identification from auth headers
 * - Permission verification
 * - Session management
 * 
 * Usage: Import this module in any Edge Function that requires user authentication
 * Example: import { verifyAuth, getUserId } from '../_shared/auth.ts'
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

/**
 * Verify JWT token and return authenticated user
 * @param authHeader - Authorization header from request
 * @returns Decoded JWT payload or null if invalid
 */
export async function verifyAuth(authHeader: string | null) {
  if (!authHeader) return null
  
  try {
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data, error } = await supabase.auth.getUser(token)
    if (error) return null
    
    return data.user
  } catch (error) {
    console.error('Auth verification failed:', error)
    return null
  }
}

/**
 * Extract user ID from authorization header
 * @param authHeader - Authorization header from request
 * @returns User ID or null if not found
 */
export async function getUserId(authHeader: string | null): Promise<string | null> {
  const user = await verifyAuth(authHeader)
  return user?.id || null
}

/**
 * Check if user has required role
 * @param userId - User ID to check
 * @param requiredRole - Role to verify (admin, user, etc)
 * @returns True if user has the role
 */
export async function hasRole(userId: string, requiredRole: string): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) return false
    return data?.role === requiredRole
  } catch (error) {
    console.error('Role check failed:', error)
    return false
  }
}

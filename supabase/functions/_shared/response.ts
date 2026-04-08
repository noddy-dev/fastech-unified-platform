/**
 * Response Handler Utilities Module
 * 
 * Purpose: Standardized response formatting for all Edge Functions
 * Responsibilities:
 * - Format successful responses with consistent structure
 * - Format error responses with appropriate status codes
 * - Handle CORS headers
 * - Set content-type headers
 * 
 * Usage: Import and use in any Edge Function to return standardized responses
 * Example: return successResponse(data, 200)
 */

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

/**
 * Default CORS headers for Edge Functions
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

/**
 * Create a successful response
 * @param data - Response data payload
 * @param statusCode - HTTP status code (default: 200)
 * @returns Response object ready to send
 */
export function successResponse<T>(data: T, statusCode: number = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
  
  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: corsHeaders,
  })
}

/**
 * Create an error response
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 400)
 * @returns Response object ready to send
 */
export function errorResponse(message: string, statusCode: number = 400): Response {
  const response: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }
  
  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: corsHeaders,
  })
}

/**
 * Create an unauthorized response
 * @param message - Optional custom message
 * @returns Response object with 401 status
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): Response {
  return errorResponse(message, 401)
}

/**
 * Create a not found response
 * @param message - Optional custom message
 * @returns Response object with 404 status
 */
export function notFoundResponse(message: string = 'Not Found'): Response {
  return errorResponse(message, 404)
}

/**
 * Create an internal server error response
 * @param message - Optional custom message
 * @returns Response object with 500 status
 */
export function serverErrorResponse(message: string = 'Internal Server Error'): Response {
  return errorResponse(message, 500)
}

/**
 * Supabase Client Initialization Module
 * 
 * Purpose: Centralized Supabase client creation and configuration
 * Responsibilities:
 * - Initialize Supabase client with proper credentials
 * - Manage environment-based configuration
 * - Provide both anon and service role clients
 * - Handle connection pooling and client reuse
 * 
 * Usage: Import and instantiate client as needed
 * Example: const client = createAnonClient() or const client = createServiceClient()
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

let anonClient: SupabaseClient | null = null
let serviceClient: SupabaseClient | null = null

/**
 * Get or create Supabase client with anon key (limited permissions)
 * Uses client caching to avoid recreating clients on each function invocation
 * @returns SupabaseClient instance with anon permissions
 */
export function createAnonClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(supabaseUrl, anonKey)
  }
  return anonClient
}

/**
 * Get or create Supabase client with service role key (full permissions)
 * WARNING: Only use on server-side operations. Never expose service key to clients.
 * Uses client caching to avoid recreating clients on each function invocation
 * @returns SupabaseClient instance with service role permissions
 */
export function createServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl, serviceRoleKey)
  }
  return serviceClient
}

/**
 * Validate Supabase environment variables are set
 * @returns True if all required variables are configured
 */
export function isConfigured(): boolean {
  return !!supabaseUrl && !!anonKey
}

/**
 * Get Supabase URL
 * @returns The configured Supabase URL
 */
export function getSupabaseUrl(): string {
  return supabaseUrl
}

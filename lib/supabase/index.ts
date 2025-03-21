/**
 * This file re-exports all Supabase-related functionality
 * for convenient imports elsewhere in the codebase.
 */

/**
 * Centralized exports for Supabase services
 * Re-exporting client and server functionality for easier imports
 */

// Re-export default client for the most common usage
export { default as supabase } from './client';

// Re-export client-side functions
export {
  createClient,
  createBrowserClient,
  createClientWithToken,
} from './client';

// Re-export server-side functions
export {
  createServerClient,
  createActionClient, 
  createAdminClient,
  getProfileByUserId,
} from './server';

// Browser client for client components 
export { createBrowserClient } from './client';

// Server client for server components and API routes
export { createServerClient } from './server';

// Admin client for authorized access (webhooks, etc.)
export { createAdminClient } from './admin'; 
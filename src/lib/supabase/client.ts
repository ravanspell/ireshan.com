import { createBrowserClient } from '@supabase/ssr';

/**
 * Create Supabase Client for Client Components
 *
 * Creates a Supabase client for use in Client Components.
 * This client is safe to use in the browser.
 *
 * @returns Supabase client instance
 *
 * @example
 * 'use client'
 *
 * import { createClient } from '@lib/supabase/client'
 *
 * export default function MyComponent() {
 *   const supabase = createClient()
 *   // Use supabase client...
 * }
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create Supabase Client for Server Components and Server Actions
 *
 * Creates a Supabase client for use in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 *
 * @returns Supabase client instance
 *
 * @example
 * // In a server action
 * import { createClient } from '@/utils/supabase/server'
 *
 * export async function myAction() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.auth.getUser()
 * }
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

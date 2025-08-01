/// <reference types="@sveltejs/kit" />

declare namespace App {
  interface Locals {
    supabase: import('@supabase/supabase-js').SupabaseClient;
    /**
     * Returns the session and user details after authentication check,
     * along with flags for login and admin status.
     */
    getSession(): Promise<{
      session: import('@supabase/supabase-js').Session | null;
      user: import('@supabase/supabase-js').User | null;
      is_logged_in: boolean;
      is_admin: boolean;
      // cookies?: string[]; // optional if you want to expose cookies as in your hooks
    }>;
  }

  interface PageData {
    session: import('@supabase/supabase-js').Session | null;
    user: import('@supabase/supabase-js').User | null;
    is_logged_in: boolean;
    is_admin: boolean;
  }

  // Optional: Extend error and platform interfaces if needed
  // interface Error {}
  // interface Platform {}
}

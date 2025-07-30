/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface Locals {
		supabase: import('@supabase/supabase-js').SupabaseClient;
		getSession(): Promise<{ session: import('@supabase/supabase-js').Session | null; user: import('@supabase/supabase-js').User | null; is_logged_in: boolean; is_admin: boolean }>;
	}

	interface PageData {
		session: import('@supabase/supabase-js').Session | null;
		user: import('@supabase/supabase-js').User | null;
		is_logged_in: boolean;
		is_admin: boolean;
	}
	// interface Error {}
	// interface Platform {}
}
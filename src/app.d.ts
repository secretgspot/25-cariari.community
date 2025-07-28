/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface Supabase {
		Database: any; // TODO: Replace with actual database types
		SchemaName: 'public';
	}

	// interface Locals {
	// 	currentAdmin: {
	// 		id: string;
	// 		email: string;
	// 	}
	// }

	interface PageData {
		user: import('@supabase/supabase-js').User | null;
		is_admin: boolean;
		cookies?: any[];
	}
	// interface Error {}
	// interface Platform {}
}
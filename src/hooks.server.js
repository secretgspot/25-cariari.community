import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Create Supabase client with latest cookie handling
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			},
		},
	});

	// Securely get authenticated session and verified user
	event.locals.getSession = async () => {
		// First, get the verified user by contacting Supabase Auth server
		const { data: { user }, error: userError } = await event.locals.supabase.auth.getUser();

		if (userError || !user) {
			// No valid user found, treat as logged out
			return {
				session: null,
				user: null,
				is_logged_in: false,
				is_admin: false,
				cookies: event.cookies.getAll(),
			};
		}

		// Optionally get the session metadata (do NOT trust session.user)
		const { data: { session } } = await event.locals.supabase.auth.getSession();

		// Confirm session exists
		if (!session) {
			return {
				session: null,
				user: null,
				is_logged_in: false,
				is_admin: false,
				cookies: event.cookies.getAll(),
			};
		}

		// Check admin claim or other custom claims
		const is_admin = user.app_metadata?.claims_admin || false;

		return {
			session,      // safe to return for expiry or tokens, but do NOT use session.user
			user,         // trusted verified user object for auth & authorization
			is_logged_in: true,
			is_admin,
			cookies: event.cookies.getAll(),
		};
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
	});
}

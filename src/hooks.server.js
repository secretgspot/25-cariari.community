import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * @type {import('@sveltejs/kit').Handle}
 */
export async function handle({ event, resolve }) {
	// Create Supabase client for this request with cookie management
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	// Cache session data per request to avoid duplicate calls
	let cachedSession = null;

	/**
	 * A little helper that is called for every page.
	 * Now with caching to prevent duplicate auth calls per request
	 */
	event.locals.getSession = async () => {
		// Return cached session if already fetched for this request
		if (cachedSession !== null) {
			return cachedSession;
		}

		const {
			data: { user },
			error,
		} = await event.locals.supabase.auth.getUser()

		if (error || !user) {
			console.log('hooks.server.js: getSession - user authentication failed 👎');
			console.log('hooks.server.js: getSession - Error:', error);
			cachedSession = {
				user: null,
				is_logged_in: false,
				is_admin: false
			};
			return cachedSession;
		}

		console.log('hooks.server.js: getSession - user details fetched successfully 👍');
		console.log('hooks.server.js: getSession - User email:', user.email);

		const is_logged_in = true;
		const is_admin = user?.app_metadata?.claims_admin || false;

		cachedSession = {
			user,
			is_admin,
			is_logged_in,
		};

		return cachedSession;
	}

	// REMOVED: onAuthStateChange listener - this belongs on the client side only
	// Server-side auth state changes don't make sense in this context

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			// Filter headers for Supabase compatibility
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
}
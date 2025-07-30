import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (name) => event.cookies.get(name),
			set: (name, value, options) => {
				event.cookies.set(name, value, { ...options, path: '/' });
			},
			remove: (name, options) => {
				event.cookies.delete(name, { ...options, path: '/' });
			},
		},
	});

	/**
	 * A convenience helper so that you can call supabase.auth.getUser() directly in your layouts and pages
	 * Also checks if the user is logged in and if they are an admin
	 */
			event.locals.getSession = async () => {
		const { data: { session } } = await event.locals.supabase.auth.getSession();
		const { data: { user } } = await event.locals.supabase.auth.getUser(); // Use getUser() for authenticity
		const is_logged_in = !!user;
		const is_admin = user?.app_metadata?.claims_admin || false;

		return { session, user, is_logged_in, is_admin, cookies: event.cookies.getAll() };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
	});
}
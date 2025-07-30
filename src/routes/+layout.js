import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';  // <-- changed import

/** @type {import('./$types').LayoutLoad} */
export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: {
				fetch,
			},
			// Remove the cookies handlers here:
			// `createBrowserClient` had extra cookie handling that `createClient` doesn’t use in browser
		}
	);

	// console.log('(app)/+layout: ', data);

	// Fetch user details from supabase public.profiles table to pass to the layout based on currently logged in user. user data already available in `data` from `+layout.server.js`

	return {
		supabase,
		session: data.session,
		user: data.user,
		is_logged_in: data.is_logged_in,
		is_admin: data.is_admin,
		cookies: data.cookies[0] || [], // Ensure cookies is an array
	};
};

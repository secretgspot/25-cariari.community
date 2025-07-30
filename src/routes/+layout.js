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

	return {
		supabase,
		session: data.session,
		user: data.user,
		is_logged_in: data.is_logged_in,
		is_admin: data.is_admin,
	};
};

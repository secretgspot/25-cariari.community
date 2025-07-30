import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createBrowserClient } from '@supabase/ssr';
import { invalidate } from '$app/navigation';

/** @type {import('./$types').LayoutLoad} */
export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createBrowserClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: {
				fetch,
			},
			cookies: {
				get: (name) => data.cookies?.[name],
				set: (name, value, options) => {
					document.cookie = `${name}=${value}; Path=/; ${options?.maxAge ? `Max-Age=${options.maxAge};` : ''} ${options?.expires ? `Expires=${options.expires.toUTCString()};` : ''} ${options?.httpOnly ? 'HttpOnly;' : ''} ${options?.secure ? 'Secure;' : ''} ${options?.sameSite ? `SameSite=${options.sameSite};` : ''}`;
				},
				remove: (name, options) => {
					document.cookie = `${name}=; Path=/; Max-Age=0; ${options?.httpOnly ? 'HttpOnly;' : ''} ${options?.secure ? 'Secure;' : ''} ${options?.sameSite ? `SameSite=${options.sameSite};` : ''}`;
				},
			},
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
/** @type {import('./$types').LayoutServerLoad} */
// import { error } from '@sveltejs/kit';

export async function load({ locals: { getSession } }) {
	const { session, user, is_logged_in, is_admin, cookies } = await getSession();
	// console.log('(app)/+layout.server: session loaded', { is_logged_in, is_admin, cookies });

	return {
		session,
		user,
		is_logged_in,
		is_admin,
		cookies,
	};
}
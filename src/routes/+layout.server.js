/** @type {import('./$types').LayoutServerLoad} */
// import { error } from '@sveltejs/kit';

export async function load({ locals: { getSession, supabase } }) {
	const { session, user, is_logged_in, is_admin } = await getSession();

	// let profile = null;
	// if (user) {
	// 	const { data, error } = await supabase
	// 		.from('profiles')
	// 		.select('username, full_name, avatar_url, bio')
	// 		.eq('id', user.id)
	// 		.single();

	// 	if (error) {
	// 		console.error('(app)/+layout.server: Error fetching profile:', error);
	// 	} else {
	// 		profile = data;
	// 		console.log('(app)/+layout.server: Profile fetched successfully');
	// 	}
	// }


	return {
		session,
		user,
		is_logged_in,
		is_admin,
		// profile,
	};
}
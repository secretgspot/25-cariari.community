/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals: { getSession, supabase } }) {
	console.log('(app)/+layout.server: load function called');

	const sessionData = await getSession();
	const { user, is_logged_in, is_admin } = sessionData;

	if (is_logged_in) {
		console.log('(app)/+layout.server: authenticated user detected 👍');
	}

	let profile = null;
	if (user) {
		const { data, error } = await supabase
			.from('profiles')
			.select('username, full_name, avatar_url, bio')
			.eq('id', user.id)
			.single();

		if (error) {
			console.error('(app)/+layout.server: Error fetching profile:', error);
		} else {
			profile = data;
			console.log('(app)/+layout.server: Profile fetched successfully');
		}
	}

	// Get cookies for client-side Supabase client
	const cookies = []; // Simplified - you may need to pass actual cookies if required

	return {
		user,
		is_logged_in,
		is_admin,
		profile,
		cookies
	};
}
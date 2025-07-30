/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals: { getSession, supabase } }) {
	const { session, user, is_logged_in, is_admin, cookies } = await getSession();

	let userProfile = null;

	// Fetch user details from supabase public.profiles table if user is logged in
	if (user?.id) {
		try {
			// First, try to fetch the profile
			const { data: profiles, error } = await supabase
				.from('profiles')
				.select('user_id, username, full_name, avatar_url, bio, updated_at')
				.eq('user_id', user.id)
				.maybeSingle(); // Use maybeSingle() to handle no results gracefully

			if (error) {
				console.error('Error fetching user profile:', error);
			} else if (profiles) {
				userProfile = profiles;
			} else {
				// Profile doesn't exist - create one
				console.log('No profile found for user:', user.id);

				const { data: newProfile, error: createError } = await supabase
					.from('profiles')
					.insert({
						user_id: user.id,
						updated_at: new Date().toISOString()
					})
					.select()
					.single();

				if (createError) {
					console.error('Error creating profile:', createError);
				} else {
					userProfile = newProfile;
				}
			}
		} catch (err) {
			console.error('Exception while fetching user profile:', err);
		}
	}

	return {
		session,
		user,
		is_logged_in,
		is_admin,
		cookies,
		userProfile, // Now available sitewide
	};
}
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

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
		}
	);

	// console.log('(app)/+layout: ', data);

	let userProfile = null;
	let profileError = null;

	// Fetch user details from supabase public.profiles table if user is logged in
	if (data.user?.id) {
		try {
			// First, try to fetch the profile
			const { data: profiles, error } = await supabase
				.from('profiles')
				.select('user_id, username, full_name, avatar_url, bio, updated_at')
				.eq('user_id', data.user.id)
				.maybeSingle(); // Use maybeSingle() to handle no results gracefully

			if (error) {
				console.error('Error fetching user profile:', error);
				profileError = error;
			} else if (profiles) {
				userProfile = profiles;
			} else {
				// Profile doesn't exist - create one
				console.log('No profile found for user:', data.user.id);

				const { data: newProfile, error: createError } = await supabase
					.from('profiles')
					.insert({
						user_id: data.user.id,
						updated_at: new Date().toISOString()
					})
					.select()
					.single();

				if (createError) {
					console.error('Error creating profile:', createError);
					profileError = createError;
				} else {
					userProfile = newProfile;
				}
			}
		} catch (err) {
			console.error('Exception while fetching user profile:', err);
			profileError = err;
		}
	}

	return {
		supabase,
		session: data.session,
		user: data.user,
		userProfile, // Add the fetched profile data
		is_logged_in: data.is_logged_in,
		is_admin: data.is_admin,
		cookies: data.cookies[0] || [], // Ensure cookies is an array
	};
};
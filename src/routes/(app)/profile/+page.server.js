/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch, parent }) {
	const { user, is_logged_in, is_admin } = await getSession();

	if (!is_logged_in || !user) {
		throw redirect(303, '/login');
	}

	// Get the userProfile from the parent layout
	const { userProfile } = await parent();

	// Make all API calls in parallel for better performance
	const [
		lostAndFoundResponse,
		eventsResponse,
		noticesResponse,
		commentsResponse,
		servicesResponse
	] = await Promise.all([
		fetch(`/api/users/${user.id}/lost-and-found`),
		fetch(`/api/users/${user.id}/events`),
		fetch(`/api/users/${user.id}/notices`),
		fetch(`/api/users/${user.id}/comments`),
		fetch(`/api/users/${user.id}/services`)
	]);

	// Process all responses in parallel
	const [
		lostAndFoundResult,
		eventsResult,
		noticesResult,
		commentsResult,
		servicesResult
	] = await Promise.all([
		lostAndFoundResponse.json().catch(() => []),
		eventsResponse.json().catch(() => []),
		noticesResponse.json().catch(() => []),
		commentsResponse.json().catch(() => []),
		servicesResponse.json().catch(() => [])
	]);

	// Log errors if any API calls failed
	if (!lostAndFoundResponse.ok) {
		console.error('Error fetching lost and found posts from API:', lostAndFoundResult);
	}
	if (!eventsResponse.ok) {
		console.error('Error fetching events from API:', eventsResult);
	}
	if (!noticesResponse.ok) {
		console.error('Error fetching notices from API:', noticesResult);
	}
	if (!commentsResponse.ok) {
		console.error('Error fetching comments from API:', commentsResult);
	}
	if (!servicesResponse.ok) {
		console.error('Error fetching services from API:', servicesResult);
	}

	return {
		user,
		is_logged_in,
		is_admin,
		lostandfounds: lostAndFoundResult || [],
		events: eventsResult || [],
		notices: noticesResult || [],
		comments: commentsResult || [],
		services: servicesResult || [],
	};
}

export const actions = {
	updateProfile: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const username = formData.get('username');
		const full_name = formData.get('full_name');
		const bio = formData.get('bio');
		const avatarFile = formData.get('avatar_url');

		// Get the current avatar_url from the profile, not user_metadata
		const { data: currentProfile } = await supabase
			.from('profiles')
			.select('avatar_url')
			.eq('user_id', session.user.id)
			.single();

		let avatar_url = currentProfile?.avatar_url;

		if (avatarFile && avatarFile.size > 0) {
			const { data, error: uploadError } = await supabase.storage
				.from('uploads')
				.upload(`avatars/${session.user.id}/${Date.now()}_${avatarFile.name}`, avatarFile);

			if (uploadError) {
				console.error('Avatar upload error:', uploadError);
				return fail(500, { message: 'Failed to upload avatar: ' + uploadError.message });
			}

			const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(data.path);
			avatar_url = publicUrlData.publicUrl;
		}

		const { error: profileError } = await supabase.from('profiles').upsert({
			user_id: session.user.id,
			username,
			full_name,
			bio,
			avatar_url,
			updated_at: new Date(),
		});

		if (profileError) {
			console.error('Profile update error:', profileError);
			return fail(500, { message: 'Failed to update profile: ' + profileError.message });
		}

		return { success: true, message: 'Profile updated successfully!' };
	},
};
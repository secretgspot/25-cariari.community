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
		lostandfound: lostAndFoundResult || [],
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

		try {
			const formData = await request.formData();
			const username = formData.get('username')?.toString() || '';
			const full_name = formData.get('full_name')?.toString() || '';
			const bio = formData.get('bio')?.toString() || '';
			const avatarFile = formData.get('avatar_url');

			// Get current profile to handle avatar replacement
			const { data: currentProfile } = await supabase
				.from('profiles')
				.select('avatar_url')
				.eq('user_id', session.user.id)
				.single();

			let avatar_url = currentProfile?.avatar_url;

			// Handle file upload
			if (avatarFile && avatarFile.size > 0) {
				// console.log('🔄 Processing file upload...');

				// Delete old avatar if it exists
				if (avatar_url) {
					const oldAvatarPath = avatar_url.split('/uploads/').pop();
					// console.log('🗑️ Deleting old avatar:', oldAvatarPath);
					await supabase.storage.from('uploads').remove([oldAvatarPath]);
				}

				// Generate unique filename with proper extension
				const fileExtension = avatarFile.name.split('.').pop() || 'jpg';
				const fileName = `${session.user.id}_${Date.now()}.${fileExtension}`;
				const filePath = `avatars/${fileName}`;

				// console.log('⬆️ Uploading to path:', filePath);

				// Upload the file
				const { data: uploadData, error: uploadError } = await supabase.storage
					.from('uploads')
					.upload(filePath, avatarFile, {
						cacheControl: '3600',
						upsert: false
					});

				if (uploadError) {
					console.error('❌ Upload error:', uploadError);
					return fail(500, { message: 'Failed to upload avatar: ' + uploadError.message });
				}

				// console.log('✅ Upload successful:', uploadData);

				// Get public URL
				const { data: publicUrlData } = supabase.storage
					.from('uploads')
					.getPublicUrl(uploadData.path);

				avatar_url = publicUrlData.publicUrl;
				// console.log('🔗 New avatar URL:', avatar_url);
			}

			// Update profile in database
			// console.log('💾 Updating profile in database...');
			const { error: profileError } = await supabase
				.from('profiles')
				.upsert({
					user_id: session.user.id,
					username,
					full_name,
					bio,
					avatar_url,
					updated_at: new Date().toISOString(),
				});

			if (profileError) {
				console.error('❌ Profile update error:', profileError);
				return fail(500, { message: 'Failed to update profile: ' + profileError.message });
			}

			// console.log('✅ Profile updated successfully');
			return {
				type: 'success',
				data: {
					message: 'Profile updated successfully!',
					avatar_url
				}
			};

		} catch (error) {
			console.error('❌ Unexpected error in updateProfile:', error);
			return fail(500, { message: 'An unexpected error occurred: ' + error.message });
		}
	},
};
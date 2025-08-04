import { json } from '@sveltejs/kit';

export async function PATCH({ request, locals: { supabase, getSession } }) {
	let { user } = await getSession();

	

	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { username, full_name, avatar_url, bio } = await request.json();

	// Basic validation
	if (!username) {
		return json({ message: 'Username is required.' }, { status: 400 });
	}

	try {
		const { data: updatedProfile, error } = await supabase
			.from('profiles')
			.upsert(
				{
					user_id: user.id,
					username,
					full_name,
					avatar_url,
					bio,
					updated_at: new Date().toISOString(),
				},
				{ onConflict: 'user_id' }
			)
			.select()
			.single();

		if (error) {
			console.error('Error updating profile:', error);
			return json({ message: 'Failed to update profile: ' + error.message }, { status: 500 });
		}

		return json({ message: 'Profile updated successfully!', profile: updatedProfile }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error updating profile:', err);
		return json({ message: 'An unexpected error occurred while updating the profile.' }, { status: 500 });
	}
}

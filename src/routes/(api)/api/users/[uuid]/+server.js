import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
	let session = await getSession();

	

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { uuid } = params;

	try {
		// Execute all database queries in parallel for better performance
		const profileQuery = await supabase
				.from('profiles')
				.select('username, full_name, bio, avatar_url')
				.eq('user_id', uuid)
				.single();

		const { data: profile, error: profileError } = profileQuery;

		if (profileError || !profile) {
			console.error('Error fetching user profile:', profileError);
			return json({ message: 'User not found.' }, { status: 404 });
		}

		return json(
			{
				profile,
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error('Unexpected error fetching user details:', err);
		return json({ message: 'An unexpected error occurred while fetching user details.' }, { status: 500 });
	}
}

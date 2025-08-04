import { json } from '@sveltejs/kit';

export async function GET({ locals: { supabase, getSession } }) {
	let session = await getSession();

	

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Fetch all users from auth.users (requires appropriate RLS or admin access)
		// Note: Directly querying auth.users might require specific Supabase policies.
		// A safer approach for non-admin users might be to query the 'profiles' table.
		const { data: users, error: usersError } = await supabase.from('profiles').select('user_id, username, full_name, avatar_url, bio');

		if (usersError) {
			console.error('Error fetching users:', usersError);
			return json({ message: 'Failed to fetch users: ' + usersError.message }, { status: 500 });
		}

		return json(users, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching users:', err);
		return json({ message: 'An unexpected error occurred while fetching users.' }, { status: 500 });
	}
}

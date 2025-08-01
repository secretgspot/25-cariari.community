import { json } from '@sveltejs/kit';

export async function GET({ locals: { supabase, getSession } }) {
	let session = await getSession();

	// TEMPORARY: Allow testing with X-Test-User-ID header
	if (!session) {
		const testUserId = url.searchParams.get('X-Test-User-ID');
		if (testUserId) {
			session = { user: { id: testUserId } }; // Mock session for testing
		}
	}

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Fetch all users from profiles table
		const { data: users, error: usersError } = await supabase.from('profiles').select('user_id, username, full_name, avatar_url, bio');

		if (usersError) {
			console.error('Error fetching users:', usersError);
			return json({ message: 'Failed to fetch users: ' + usersError.message }, { status: 500 });
		}

		// Add cache headers for successful responses
		const response = json(users, { status: 200 });

		// Set cache headers (30 seconds cache for user data - relatively static)
		response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30');
		response.headers.set('Surrogate-Control', 'max-age=30');

		return response;
	} catch (err) {
		console.error('Unexpected error fetching users:', err);
		return json({ message: 'An unexpected error occurred while fetching users.' }, { status: 500 });
	}
}

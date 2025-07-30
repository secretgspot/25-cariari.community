import { json } from '@sveltejs/kit';

export async function GET({ url, locals: { supabase, getSession } }) {
	let session = await getSession();

	// TEMPORARY: Allow testing with X-Test-User-ID header
	if (!session) {
		const testUserId = request.headers.get('X-Test-User-ID');
		if (testUserId) {
			session = { user: { id: testUserId } }; // Mock session for testing
		}
	}

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Get limit parameter from query string
		const limit = url.searchParams.get('limit');

		const query = supabase
			.from('notices')
			.select('*', { count: 'exact' })
			.order('created_at', { ascending: false });

		// Apply limit if provided
		if (limit && !isNaN(parseInt(limit))) {
			query.limit(parseInt(limit));
		}

		const { data: notices, count, error: noticesError } = await query;

		if (noticesError) {
			console.error('Error fetching notices:', noticesError);
			return json({ message: 'Failed to fetch notices: ' + noticesError.message }, { status: 500 });
		}

		return json({ notices, total: count }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching notices:', err);
		return json({ message: 'An unexpected error occurred while fetching notices.' }, { status: 500 });
	}
}

export async function POST({ request, locals: { supabase, getSession } }) {
	let { user } = await getSession();

	// TEMPORARY: Allow testing with X-Test-User-ID header
	if (!user) {
		const testUserId = request.headers.get('X-Test-User-ID');
		if (testUserId) {
			user = { id: testUserId };
		}
	}

	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { title, description, urgency, start_date, end_date } = await request.json();

	if (!title || !description) {
		return json({ message: 'Title and description are required.' }, { status: 400 });
	}

	try {
		const { data: newNotice, error } = await supabase.from('notices').insert({
			title,
			description,
			urgency,
			is_published: true,
			user_id: user.id,
			start_date,
			end_date
		}).select().single();

		if (error) {
			console.error('Error creating notice:', error);
			return json({ message: 'Failed to create notice: ' + error.message }, { status: 500 });
		}

		return json({ message: 'Notice created successfully!', notice: newNotice }, { status: 201 });
	} catch (err) {
		console.error('Unexpected error creating notice:', err);
		return json({ message: 'An unexpected error occurred while creating the notice.' }, { status: 500 });
	}
}
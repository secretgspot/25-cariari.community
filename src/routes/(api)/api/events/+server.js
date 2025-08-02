import { json } from '@sveltejs/kit';

export async function GET({ url, request, locals: { supabase, getSession } }) {
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

		let query = supabase
			.from('events')
			.select('*', { count: 'exact' })
			.order('event_start_date', { ascending: true });

		// Apply limit if provided
		if (limit && !isNaN(parseInt(limit))) {
			query.limit(parseInt(limit));
		}

		const { data: events, count, error: eventsError } = await query;

		if (eventsError) {
			console.error('Error fetching events:', eventsError);
			return json({ message: 'Failed to fetch events: ' + eventsError.message }, { status: 500 });
		}

		return json({ events, total: count }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching events:', err);
		return json({ message: 'An unexpected error occurred while fetching events.' }, { status: 500 });
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

	const formData = await request.formData();
	const title = formData.get('title');
	const description = formData.get('description');
	const event_start_date = formData.get('event_start_date');
	const event_end_date = formData.get('event_end_date');
	const location = formData.get('location');
	const image_url = formData.get('image_url');
	const category = formData.get('category');

	if (!title || !description || !event_start_date) {
		return json({ message: 'Title, Description, and Start Date are required.' }, { status: 400 });
	}

	try {
		const { error } = await supabase.from('events').insert({
			title,
			description,
			event_start_date,
			event_end_date: event_end_date || null,
			location: location || null,
			image_url: image_url || null,
			category: category || null,
			is_published: true,
			user_id: user.id,
		});

		if (error) {
			console.error('Error creating event:', error);
			return json({ message: 'Failed to create event: ' + error.message }, { status: 500 });
		}

		return json({ message: 'Event created successfully!' }, { status: 201 });
	} catch (err) {
		console.error('Unexpected error creating event:', err);
		return json({ message: 'An unexpected error occurred while creating the event.' }, { status: 500 });
	}
}

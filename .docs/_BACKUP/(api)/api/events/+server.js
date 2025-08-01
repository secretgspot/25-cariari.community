import { json } from '@sveltejs/kit';

export async function GET({ url, request, locals: { supabase, getSession } }) {
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
		// Get limit parameter from query string
		const limit = url.searchParams.get('limit');

		let query = supabase
			.from('events')
			.select('*', { count: 'exact' })
			.order('event_start_date', { ascending: false });

		// Apply limit if provided
		if (limit && !isNaN(parseInt(limit))) {
			query.limit(parseInt(limit));
		}

		const { data: events, count, error: eventsError } = await query;

		if (eventsError) {
			console.error('Error fetching events:', eventsError);
			return json({ message: 'Failed to fetch events: ' + eventsError.message }, { status: 500 });
		}

		// Add cache headers for successful responses
		const response = json({ events, total: count }, { status: 200 });

		// Set cache headers (30 seconds cache for public data)
		response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30');
		response.headers.set('Surrogate-Control', 'max-age=30');

		return response;
	} catch (err) {
		console.error('Unexpected error fetching events:', err);
		return json({ message: 'An unexpected error occurred while fetching events.' }, { status: 500 });
	}
}

export async function POST({ request, locals: { supabase, getSession } }) {
	let { user } = await getSession();

	// TEMPORARY: Allow testing with X-Test-User-ID header
	if (!user) {
		const testUserId = url.searchParams.get('X-Test-User-ID');
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

		// For POST requests, we typically don't cache the response
		// but we can set no-cache headers
		const response = json({ message: 'Event created successfully!' }, { status: 201 });
		response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');

		return response;
	} catch (err) {
		console.error('Unexpected error creating event:', err);
		return json({ message: 'An unexpected error occurred while creating the event.' }, { status: 500 });
	}
}

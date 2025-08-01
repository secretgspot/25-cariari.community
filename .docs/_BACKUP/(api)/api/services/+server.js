import { json } from '@sveltejs/kit';

export async function GET({ url, locals: { supabase, getSession } }) {
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

		const query = supabase
			.from('services')
			.select('*', { count: 'exact' })
			.order('created_at', { ascending: false });

		// Apply limit if provided
		if (limit && !isNaN(parseInt(limit))) {
			query.limit(parseInt(limit));
		}

		const { data: services, count, error: servicesError } = await query;

		if (servicesError) {
			console.error('Error fetching services:', servicesError);
			return json({ message: 'Failed to fetch services: ' + servicesError.message }, { status: 500 });
		}

		// Add cache headers for successful responses
		const response = json({ services, total: count }, { status: 200 });

		// Set cache headers (30 seconds cache for public data)
		response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30');
		response.headers.set('Surrogate-Control', 'max-age=30');

		return response;
	} catch (err) {
		console.error('Unexpected error fetching services:', err);
		return json({ message: 'An unexpected error occurred while fetching services.' }, { status: 500 });
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
	const category = formData.get('category');
	const image_url = formData.get('image_url');
	const start_date = formData.get('start_date');
	const end_date = formData.get('end_date');

	if (!title || !description) {
		return json({ message: 'Title and description are required.' }, { status: 400 });
	}

	try {
		const { error } = await supabase.from('services').insert({
			title,
			description,
			category,
			image_url,
			is_published: true,
			user_id: user.id,
			start_date,
			end_date
		});

		if (error) {
			console.error('Error creating service:', error);
			return json({ message: 'Failed to create service: ' + error.message }, { status: 500 });
		}

		// For POST requests, we typically don't cache the response
		// but we can set no-cache headers
		const response = json({ message: 'Service created successfully!' }, { status: 201 });
		response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');

		return response;
	} catch (err) {
		console.error('Unexpected error creating service:', err);
		return json({ message: 'An unexpected error occurred while creating the service.' }, { status: 500 });
	}
}

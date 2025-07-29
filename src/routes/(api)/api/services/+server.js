
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

		return json({ services, total: count }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching services:', err);
		return json({ message: 'An unexpected error occurred while fetching services.' }, { status: 500 });
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
	const category = formData.get('category');
    const image_url = formData.get('image_url');
	const start_date = formData.get('service_start_date');
	const end_date = formData.get('service_end_date');

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

		return json({ message: 'Service created successfully!' }, { status: 201 });
	} catch (err) {
		console.error('Unexpected error creating service:', err);
		return json({ message: 'An unexpected error occurred while creating the service.' }, { status: 500 });
	}
}

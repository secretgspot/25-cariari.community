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
			.from('lost_and_found')
			.select('*', { count: 'exact' })
			.order('created_at', { ascending: false });

		// Apply limit if provided
		if (limit && !isNaN(parseInt(limit))) {
			query.limit(parseInt(limit));
		}

		const { data: lostandfound, count, error: postsError } = await query;

		if (postsError) {
			console.error('Error fetching lost and found posts:', postsError);
			return json({ message: 'Failed to fetch lost and found posts: ' + postsError.message }, { status: 500 });
		}

		// Add cache headers for successful responses
		const response = json({ lostandfound, total: count }, { status: 200 });

		// Set cache headers (30 seconds cache for public data)
		response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30');
		response.headers.set('Surrogate-Control', 'max-age=30');

		return response;
	} catch (err) {
		console.error('Unexpected error fetching lost and found posts:', err);
		return json({ message: 'An unexpected error occurred while fetching lost and found posts.' }, { status: 500 });
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
	const date = formData.get('date');
	const location = formData.get('location');
	const contact = formData.get('contact');
	const image_url = formData.get('image_url');

	if (!title || !description || !category || !date || !contact) {
		return json({ message: 'All required fields must be filled.' }, { status: 400 });
	}

	try {
		const { data: newItem, error } = await supabase.from('lost_and_found').insert({
			title,
			description,
			category,
			date,
			location,
			contact,
			image_url,
			user_id: user.id,
			is_published: true,
		}).select().single();

		if (error) {
			console.error('Error creating lost and found post:', error);
			return json({ message: 'Failed to create post: ' + error.message }, { status: 500 });
		}

		// For POST requests, we typically don't cache the response
		// but we can set no-cache headers
		const response = json({
			message: 'Post created successfully!',
			lostandfound: newItem
		}, { status: 201 });
		response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');

		return response;
	} catch (err) {
		console.error('Unexpected error creating lost and found post:', err);
		return json({ message: 'An unexpected error occurred while creating the post.' }, { status: 500 });
	}
}

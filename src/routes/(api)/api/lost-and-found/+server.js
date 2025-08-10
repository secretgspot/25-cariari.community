import { json } from '@sveltejs/kit';

export async function GET({ url, locals: { supabase, getSession } }) {
	let session = await getSession();

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Get limit parameter from query string
		const limit = url.searchParams.get('limit');

		const query = supabase
			.from('lost_and_found')
			.select('*')
			.order('created_at', { ascending: false });

		// Apply limit if provided
		if (limit && !isNaN(parseInt(limit))) {
			query.limit(parseInt(limit));
		}

		const { data: lostandfound, error: postsError } = await query;

		if (postsError) {
			console.error('Error fetching lost and found posts:', postsError);
			return json({ message: 'Failed to fetch lost and found posts: ' + postsError.message }, { status: 500 });
		}

		return json(lostandfound, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching lost and found posts:', err);
		return json({ message: 'An unexpected error occurred while fetching lost and found posts.' }, { status: 500 });
	}
}

export async function POST({ request, locals: { supabase, getSession } }) {
	let { user } = await getSession();

	

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

		return json({
			message: 'Post created successfully!',
			lostandfound: newItem
		}, { status: 201 });
	} catch (err) {
		console.error('Unexpected error creating lost and found post:', err);
		return json({ message: 'An unexpected error occurred while creating the post.' }, { status: 500 });
	}
}
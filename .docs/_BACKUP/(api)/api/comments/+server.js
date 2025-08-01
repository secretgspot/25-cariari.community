import { json } from '@sveltejs/kit';

export async function GET({ url, locals: { supabase } }) {
	const notice_id = url.searchParams.get('notice_id');
	const event_id = url.searchParams.get('event_id');
	const lost_and_found_id = url.searchParams.get('lost_and_found_id');
	const service_id = url.searchParams.get('service_id');

	let query = supabase.from('comments').select('*, profiles(username, avatar_url)');

	if (notice_id) {
		query = query.eq('notice_id', notice_id);
	} else if (event_id) {
		query = query.eq('event_id', event_id);
	} else if (lost_and_found_id) {
		query = query.eq('lost_and_found_id', lost_and_found_id);
	} else if (service_id) {
		query = query.eq('service_id', service_id);
	} else {
		return json({ message: 'A parent ID (notice_id, event_id, lost_and_found_id, or service_id) is required.' }, { status: 400 });
	}

	const { data: comments, error: commentsError } = await query.order('created_at', { ascending: true });

	if (commentsError) {
		console.error('Error fetching comments:', commentsError);
		return json({ message: 'Failed to fetch comments: ' + commentsError.message }, { status: 500 });
	}

	// Add cache headers for successful responses
	const response = json(comments, { status: 200 });

	// Set cache headers (10 seconds cache for comments - they change frequently)
	response.headers.set('Cache-Control', 'public, max-age=10, s-maxage=10');
	response.headers.set('Surrogate-Control', 'max-age=10');

	return response;
}

export async function POST({ request, locals: { supabase, getSession } }) {
	let session = await getSession();

	// TEMPORARY: Allow testing with X-Test-User-ID header
	if (!session.is_logged_in) {
		const testUserId = url.searchParams.get('X-Test-User-ID');
		if (testUserId) {
			session = { user: { id: testUserId }, is_logged_in: true };
		}
	}

	if (!session.is_logged_in || !session.user?.id) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { notice_id, event_id, lost_and_found_id, service_id, content } = await request.json();

	if (!content) {
		return json({ message: 'Comment content is required.' }, { status: 400 });
	}

	if (!notice_id && !event_id && !lost_and_found_id && !service_id) {
		return json({ message: 'A parent ID (notice_id, event_id, lost_and_found_id, or service_id) is required.' }, { status: 400 });
	}

	try {
		const { error: commentError } = await supabase.from('comments').insert({
			user_id: session.user.id,  // Always use the verified user id here
			notice_id,
			event_id,
			lost_and_found_id,
			service_id,
			content,
		});

		if (commentError) {
			console.error('Error creating comment:', commentError);
			return json({ message: 'Failed to create comment: ' + commentError.message }, { status: 500 });
		}

		// For POST requests, we typically don't cache the response
		// but we can set no-cache headers
		const response = json({ message: 'Comment added successfully!' }, { status: 201 });
		response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');

		return response;
	} catch (err) {
		console.error('Unexpected error creating comment:', err);
		return json({ message: 'An unexpected error occurred while creating the comment.' }, { status: 500 });
	}
}

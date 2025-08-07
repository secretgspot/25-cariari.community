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

	return json(comments, { status: 200 });
}

export async function POST({ request, locals: { supabase, getSession } }) {
	let session = await getSession();

	

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
		const { data: newComment, error: commentError } = await supabase
			.from('comments')
			.insert({
				user_id: session.user.id,  // Always use the verified user id here
				notice_id,
				event_id,
				lost_and_found_id,
				service_id,
				content,
			})
			.select('*, profiles(username, avatar_url)') // Select the newly inserted comment with profile data
			.single();

		if (commentError) {
			console.error('Error creating comment:', commentError);
			return json({ message: 'Failed to create comment: ' + commentError.message }, { status: 500 });
		}

		return json(newComment, { status: 201 });
	} catch (err) {
		console.error('Unexpected error creating comment:', err);
		return json({ message: 'An unexpected error occurred while creating the comment.' }, { status: 500 });
	}
}

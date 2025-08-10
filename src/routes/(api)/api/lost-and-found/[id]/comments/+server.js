import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
	let session = await getSession();

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;

	try {
		// Fetch comments for this post
		const { data: comments, error: commentsError } = await supabase
			.from('comments')
			.select('id, content, created_at, user_id, user_data:profiles(username, full_name, avatar_url)')
			.eq('lost_and_found_id', id)
			.order('created_at', { ascending: true });

		if (commentsError) {
			console.error('Error fetching comments:', commentsError?.message, commentsError?.details);
			return json({ message: 'Error fetching comments.' }, { status: 500 });
		}

		return json(comments || [], { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching comments:', err);
		return json({ message: 'An unexpected error occurred while fetching comments.' }, { status: 500 });
	}
}
import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
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

	const { id } = params;

	try {
		// Fetch the specific lost and found post
		const { data: lostandfound, error: postError } = await supabase
			.from('lost_and_found')
			.select('*')
			.eq('id', id)
			.single();

		if (postError || !lostandfound) {
			console.error('Error fetching lost and found post:', postError?.message, postError?.details);
			return json({ message: 'Lost and Found post not found.' }, { status: 404 });
		}

		// Fetch comments for this post
		const { data: comments, error: commentsError } = await supabase
			.from('comments')
			.select('id, content, created_at, user_id')
			.eq('lost_and_found_id', lostandfound.id)
			.order('created_at', { ascending: true });

		if (commentsError) {
			console.error('Error fetching comments:', commentsError?.message, commentsError?.details);
		}

		// Fetch user data for each comment
		const commentsWithUserData = await Promise.all(
			(comments || []).map(async (comment) => {
				if (comment.user_id) {
					const { data: userData, error: userError } = await supabase
						.from('profiles')
						.select('username, full_name, avatar_url')
						.eq('id', comment.user_id)
						.single();

					if (userError) {
						console.error('Error fetching user data for comment:', userError?.message, userError?.details);
						return { ...comment, user_data: null };
					}
					return { ...comment, user_data: userData };
				}
				return { ...comment, user_data: null };
			})
		);

		return json(
			{
				lostandfound,
				comments: commentsWithUserData || [],
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error('Unexpected error fetching lost and found post details and comments:', err);
		return json({ message: 'An unexpected error occurred while fetching lost and found post details and comments.' }, { status: 500 });
	}
}
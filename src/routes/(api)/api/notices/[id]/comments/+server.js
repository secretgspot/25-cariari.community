import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
	let session = await getSession();

	

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;

	try {
		// Fetch the specific notice
		const { data: notice, error: noticeError } = await supabase
			.from('notices')
			.select('*')
			.eq('id', id)
			.single();

		if (noticeError || !notice) {
			console.error('Error fetching notice:', noticeError?.message, noticeError?.details);
			return json({ message: 'Notice not found.' }, { status: 404 });
		}

		// Fetch comments for this notice
		const { data: comments, error: commentsError } = await supabase
			.from('comments')
			.select('id, content, created_at, user_id')
			.eq('notice_id', notice.id)
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
				notice,
				comments: commentsWithUserData || [],
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error('Unexpected error fetching notice details and comments:', err);
		return json({ message: 'An unexpected error occurred while fetching notice details and comments.' }, { status: 500 });
	}
}

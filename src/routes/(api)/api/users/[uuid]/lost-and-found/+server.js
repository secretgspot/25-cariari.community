import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
	let session = await getSession();

	

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { uuid } = params;

	try {
		const { data: posts, error: postsError } = await supabase
			.from('lost_and_found')
			.select('*')
			.eq('user_id', uuid)
			.order('created_at', { ascending: false })
			.limit(50); // Limit to 50 most recent lost-and-found posts for better performance

		if (postsError) {
			console.error('Error fetching user lost and found posts:', postsError);
			return json({ message: 'Failed to fetch user lost and found posts: ' + postsError.message }, { status: 500 });
		}

		return json(posts, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching user lost and found posts:', err);
		return json({ message: 'An unexpected error occurred while fetching user lost and found posts.' }, { status: 500 });
	}
}

export async function DELETE({ params, locals: { supabase, getSession } }) {
	const { uuid } = params;
	let { user } = await getSession();

	

	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Get IDs of all lost_and_found posts by this user
		const { data: userPosts, error: fetchPostsError } = await supabase
			.from('lost_and_found')
			.select('id')
			.eq('user_id', uuid);

		if (fetchPostsError) {
			console.error('Error fetching user posts for deletion:', fetchPostsError?.message, fetchPostsError?.details);
			return json({ message: 'Failed to fetch user posts for deletion.' }, { status: 500 });
		}

		const postIds = userPosts.map(post => post.id);

		// Delete comments associated with these posts
		if (postIds.length > 0) {
			const { error: deleteCommentsError } = await supabase
				.from('comments')
				.delete()
				.in('lost_and_found_id', postIds);

			if (deleteCommentsError) {
				console.error('Error deleting comments for user posts:', deleteCommentsError?.message, deleteCommentsError?.details);
				return json({ message: 'Failed to delete associated comments.' }, { status: 500 });
			}
		}

		// Now delete the lost_and_found posts
		const { error: deleteError } = await supabase
			.from('lost_and_found')
			.delete()
			.eq('user_id', uuid);

		if (deleteError) {
			console.error('Error deleting all user lost and found posts:', deleteError?.message, deleteError?.details);
			return json({ message: 'Failed to delete all lost and found posts: ' + deleteError.message }, { status: 500 });
		}

		return json({ message: 'All lost and found posts deleted successfully!' }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error deleting all user lost and found posts:', err);
		return json({ message: 'An unexpected error occurred while deleting all lost and found posts.' }, { status: 500 });
	}
}

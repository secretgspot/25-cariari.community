import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
	let session = await getSession();

	

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { uuid } = params;

	try {
		const { data: comments, error: commentsError } = await supabase
			.from('comments')
			.select('id, content, created_at')
			.eq('user_id', uuid)
			.order('created_at', { ascending: false })
			.limit(100); // Limit to 100 most recent comments for better performance

		if (commentsError) {
			console.error('Error fetching user comments:', commentsError);
			return json({ message: 'Failed to fetch user comments: ' + commentsError.message }, { status: 500 });
		}

		return json(comments, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching user comments:', err);
		return json({ message: 'An unexpected error occurred while fetching user comments.' }, { status: 500 });
	}
}

export async function DELETE({ params, locals: { supabase, getSession } }) {
	const { uuid } = params;
	let { user } = await getSession();

	

	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { error: deleteError } = await supabase
			.from('comments')
			.delete()
			.eq('user_id', uuid);

		if (deleteError) {
			console.error('Error deleting all user comments:', deleteError?.message, deleteError?.details);
			return json({ message: 'Failed to delete all comments.' }, { status: 500 });
		}

		return json({ message: 'All comments deleted successfully!' }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error deleting all user comments:', err);
		return json({ message: 'An unexpected error occurred while deleting all comments.' }, { status: 500 });
	}
}
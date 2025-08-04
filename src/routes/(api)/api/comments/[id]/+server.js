import { json } from '@sveltejs/kit';

export async function PATCH({ request, params, locals: { supabase, getSession } }) {
	const { id } = params;
	let { user, is_admin } = await getSession();

	

	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { content } = await request.json();

	if (!content) {
		return json({ message: 'Comment content is required.' }, { status: 400 });
	}

	try {
		// Verify that the user is the author of the comment
		const { data: comment, error: fetchError } = await supabase
			.from('comments')
			.select('user_id')
			.eq('id', id)
			.single();

		if (fetchError || !comment) {
			console.error('Error fetching comment for update:', fetchError?.message, fetchError?.details);
			return json({ message: 'Comment not found or you do not have permission to update it.' }, { status: 404 });
		}

		if (comment.user_id !== user.id && !is_admin) {
			return json({ message: 'You do not have permission to update this comment.' }, { status: 403 });
		}

		// Perform the update
		const { data: updatedComment, error: updateError } = await supabase
			.from('comments')
			.update({ content, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (updateError) {
			console.error('Error updating comment:', updateError?.message, updateError?.details);
			return json({ message: 'Failed to update comment: ' + updateError.message }, { status: 500 });
		}

		return json({ message: 'Comment updated successfully!', comment: updatedComment }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error updating comment:', err);
		return json({ message: 'An unexpected error occurred while updating the comment.' }, { status: 500 });
	}
}

export async function DELETE({ params, request, locals: { supabase, getSession } }) {
	const { id } = params;
	let { user, is_admin } = await getSession();

	

	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	// Verify that the user is the author of the comment
	const { data: comment, error: fetchError } = await supabase
		.from('comments')
		.select('user_id')
		.eq('id', id)
		.single();

	if (fetchError || !comment) {
		console.error('Error fetching comment for deletion:', fetchError?.message, fetchError?.details);
		return json({ message: 'Comment not found or you do not have permission to delete it.' }, { status: 404 });
	}

	if (comment.user_id !== user.id && !is_admin) {
		return json({ message: 'You do not have permission to delete this comment.' }, { status: 403 });
	}

	// Perform the deletion
	const { error: deleteError } = await supabase
		.from('comments')
		.delete()
		.eq('id', id);

	if (deleteError) {
		console.error('Error deleting comment:', deleteError?.message, deleteError?.details);
		return json({ message: 'Failed to delete comment.' }, { status: 500 });
	}

	return json({ message: 'Comment deleted successfully!' }, { status: 200 });
}
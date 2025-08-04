import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
	let session = await getSession();

	

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;

	try {
		const { data: notice, error: noticeError } = await supabase
			.from('notices')
			.select('*')
			.eq('id', id)
			.single();

		if (noticeError || !notice) {
			console.error('Error fetching notice:', noticeError?.message, noticeError?.details);
			return json({ message: 'Notice not found.' }, { status: 404 });
		}

		// Count comments for this notice
		const { count: commentsCount, error: commentsError } = await supabase
			.from('comments')
			.select('id', { count: 'exact' })
			.eq('notice_id', notice.id);

		if (commentsError) {
			console.error('Error counting comments for notice:', commentsError?.message, commentsError?.details);
		}

		return json({ ...notice, comments_count: commentsCount || 0 }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching notice:', err);
		return json({ message: 'An unexpected error occurred while fetching the notice.' }, { status: 500 });
	}
}

export async function PATCH({ request, params, locals: { supabase, getSession } }) {
	const { id } = params;
	let { user, is_admin } = await getSession();

	

	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const updates = await request.json();

	try {
		// Verify that the user is the author of the notice
		const { data: notice, error: fetchError } = await supabase
			.from('notices')
			.select('user_id, id')
			.eq('id', id)
			.single();

		if (fetchError || !notice) {
			console.error('Error fetching notice for update:', fetchError?.message, fetchError?.details);
			return json({ message: 'Notice not found or you do not have permission to update it.' }, { status: 404 });
		}

		if (notice.user_id !== user.id && !is_admin) {
			return json({ message: 'You do not have permission to update this notice.' }, { status: 403 });
		}

		// Perform the update (always use the actual UUID for update)
		const { data: updatedNotice, error: updateError } = await supabase
			.from('notices')
			.update({ ...updates, updated_at: new Date().toISOString() })
			.eq('id', notice.id)
			.select()
			.single();

		if (updateError) {
			console.error('Error updating notice:', updateError?.message, updateError?.details);
			return json({ message: 'Failed to update notice: ' + updateError.message }, { status: 500 });
		}

		return json({ message: 'Notice updated successfully!', notice: updatedNotice }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error updating notice:', err);
		return json({ message: 'An unexpected error occurred while updating the notice.' }, { status: 500 });
	}
}

export async function DELETE({ params, locals: { supabase, getSession } }) {
	const { id } = params;
	let { user, is_admin } = await getSession();

	

	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Verify that the user is the author of the notice
		const { data: notice, error: fetchError } = await supabase
			.from('notices')
			.select('user_id, id')
			.eq('id', id)
			.single();

		if (fetchError || !notice) {
			console.error('Error fetching notice for deletion:', fetchError?.message, fetchError?.details);
			return json({ message: 'Notice not found or you do not have permission to delete it.' }, { status: 404 });
		}

		if (notice.user_id !== user.id && !is_admin) {
			return json({ message: 'You do not have permission to delete this notice.' }, { status: 403 });
		}

		// Perform the deletion (always use the actual UUID for deletion)
		const { error: deleteError } = await supabase
			.from('notices')
			.delete()
			.eq('id', notice.id);

		if (deleteError) {
			console.error('Error deleting notice:', deleteError?.message, deleteError?.details);
			return json({ message: 'Failed to delete notice.' }, { status: 500 });
		}

		return json({ message: 'Notice deleted successfully!' }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error deleting notice:', err);
		return json({ message: 'An unexpected error occurred while deleting the notice.' }, { status: 500 });
	}
}
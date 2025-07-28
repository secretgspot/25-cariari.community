import { json } from '@sveltejs/kit';

export async function DELETE({ params, locals: { supabase, getSession } }) {
  const { uuid, id } = params;
  const { user } = await getSession();

  if (!user || user.id !== uuid) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify that the user is the author of the notice
    const { data: notice, error: fetchError } = await supabase
      .from('news')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !notice) {
      console.error('Error fetching notice for deletion:', fetchError?.message, fetchError?.details);
      return json({ message: 'Notice not found or you do not have permission to delete it.' }, { status: 404 });
    }

    if (notice.user_id !== user.id) {
      return json({ message: 'You do not have permission to delete this notice.' }, { status: 403 });
    }

    // Perform the deletion
    const { error: deleteError } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

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

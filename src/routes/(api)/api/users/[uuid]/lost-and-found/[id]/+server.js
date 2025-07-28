import { json } from '@sveltejs/kit';

export async function DELETE({ params, locals: { supabase, getSession } }) {
  const { uuid, id } = params;
  const { user } = await getSession();

  if (!user || user.id !== uuid) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify that the user is the author of the post
    const { data: post, error: fetchError } = await supabase
      .from('lost_and_found')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      console.error('Error fetching lost and found post for deletion:', fetchError?.message, fetchError?.details);
      return json({ message: 'Post not found or you do not have permission to delete it.' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return json({ message: 'You do not have permission to delete this post.' }, { status: 403 });
    }

    // Perform the deletion
    const { error: deleteError } = await supabase
      .from('lost_and_found')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting lost and found post:', deleteError?.message, deleteError?.details);
      return json({ message: 'Failed to delete post.' }, { status: 500 });
    }

    return json({ message: 'Post deleted successfully!' }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error deleting lost and found post:', err);
    return json({ message: 'An unexpected error occurred while deleting the post.' }, { status: 500 });
  }
}

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
    const { data: post, error: postError } = await supabase
      .from('lost_and_found')
      .select('*')
      .eq('id', id)
      .single();

    if (postError || !post) {
      console.error('Error fetching lost and found post:', postError?.message, postError?.details);
      return json({ message: 'Lost and Found post not found.' }, { status: 404 });
    }

    // Count comments for this post
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('lost_and_found_id', post.id);

    if (commentsError) {
      console.error('Error counting comments for post:', commentsError?.message, commentsError?.details);
    }

    return json({ ...post, comments_count: commentsCount || 0 }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error fetching lost and found post:', err);
    return json({ message: 'An unexpected error occurred while fetching the lost and found post.' }, { status: 500 });
  }
}

export async function PATCH({ request, params, locals: { supabase, getSession } }) {
  const { id } = params;
  let { user } = await getSession();

  // TEMPORARY: Allow testing with X-Test-User-ID header
  if (!user) {
    const testUserId = request.headers.get('X-Test-User-ID');
    if (testUserId) {
      user = { id: testUserId };
    }
  }

  if (!user) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }

  const updates = await request.json();

  try {
    // Verify that the user is the author of the post
    const { data: post, error: fetchError } = await supabase
      .from('lost_and_found')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      console.error('Error fetching lost and found post for update:', fetchError?.message, fetchError?.details);
      return json({ message: 'Post not found or you do not have permission to update it.' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return json({ message: 'You do not have permission to update this post.' }, { status: 403 });
    }

    // Perform the update
    const { data: updatedPost, error: updateError } = await supabase
      .from('lost_and_found')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating lost and found post:', updateError?.message, updateError?.details);
      return json({ message: 'Failed to update post: ' + updateError.message }, { status: 500 });
    }

    return json({ message: 'Post updated successfully!', post: updatedPost }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error updating lost and found post:', err);
    return json({ message: 'An unexpected error occurred while updating the post.' }, { status: 500 });
  }
}

export async function DELETE({ params, locals: { supabase, getSession } }) {
  const { id } = params;
  let { user } = await getSession();

  // TEMPORARY: Allow testing with X-Test-User-ID header
  if (!user) {
    const testUserId = request.headers.get('X-Test-User-ID');
    if (testUserId) {
      user = { id: testUserId };
    }
  }

  if (!user) {
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

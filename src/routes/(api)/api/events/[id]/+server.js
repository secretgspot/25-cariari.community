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
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      console.error('Error fetching event:', eventError?.message, eventError?.details);
      return json({ message: 'Event not found.' }, { status: 404 });
    }

    // Count comments for this event
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('event_id', event.id);

    if (commentsError) {
      console.error('Error counting comments for event:', commentsError?.message, commentsError?.details);
    }

    return json({ ...event, comments_count: commentsCount || 0 }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error fetching event:', err);
    return json({ message: 'An unexpected error occurred while fetching the event.' }, { status: 500 });
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
    // Verify that the user is the author of the event
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('user_id, id')
      .eq('id', id)
      .single();

    if (fetchError || !event) {
      console.error('Error fetching event for update:', fetchError?.message, fetchError?.details);
      return json({ message: 'Event not found or you do not have permission to update it.' }, { status: 404 });
    }

    if (event.user_id !== user.id) {
      return json({ message: 'You do not have permission to update this event.' }, { status: 403 });
    }

    // Perform the update (always use the actual UUID for update)
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', event.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating event:', updateError?.message, updateError?.details);
      return json({ message: 'Failed to update event: ' + updateError.message }, { status: 500 });
    }

    return json({ message: 'Event updated successfully!', event: updatedEvent }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error updating event:', err);
    return json({ message: 'An unexpected error occurred while updating the event.' }, { status: 500 });
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
    // Verify that the user is the author of the event
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('user_id, id')
      .eq('id', id)
      .single();

    if (fetchError || !event) {
      console.error('Error fetching event for deletion:', fetchError?.message, fetchError?.details);
      return json({ message: 'Event not found or you do not have permission to delete it.' }, { status: 404 });
    }

    if (event.user_id !== user.id) {
      return json({ message: 'You do not have permission to delete this event.' }, { status: 403 });
    }

    // Perform the deletion (always use the actual UUID for deletion)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', event.id);

    if (deleteError) {
      console.error('Error deleting event:', deleteError?.message, deleteError?.details);
      return json({ message: 'Failed to delete event.' }, { status: 500 });
    }

    return json({ message: 'Event deleted successfully!' }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error deleting event:', err);
    return json({ message: 'An unexpected error occurred while deleting the event.' }, { status: 500 });
  }
}

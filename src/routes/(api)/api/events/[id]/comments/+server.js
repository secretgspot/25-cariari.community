import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
  let session = await getSession();

  

  if (!session) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    // Fetch the specific event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      console.error('Error fetching event:', eventError?.message, eventError?.details);
      return json({ message: 'Event not found.' }, { status: 404 });
    }

    // Fetch comments for this event
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id')
      .eq('event_id', event.id)
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
        event,
        comments: commentsWithUserData || [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error fetching event details and comments:', err);
    return json({ message: 'An unexpected error occurred while fetching event details and comments.' }, { status: 500 });
  }
}

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

  const { uuid } = params;

  try {
    // Execute all database queries in parallel for better performance
    const [
      profileQuery,
      noticesQuery,
      eventsQuery,
      lostAndFoundQuery,
      commentsQuery
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .eq('id', uuid)
        .single(),
      supabase
        .from('news')
        .select('id', { count: 'exact' })
        .eq('user_id', uuid),
      supabase
        .from('events')
        .select('id', { count: 'exact' })
        .eq('user_id', uuid),
      supabase
        .from('lost_and_found')
        .select('id', { count: 'exact' })
        .eq('user_id', uuid),
      supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('user_id', uuid)
    ]);

    const { data: profile, error: profileError } = profileQuery;
    const { count: noticesCount, error: noticesError } = noticesQuery;
    const { count: eventsCount, error: eventsError } = eventsQuery;
    const { count: lostAndFoundCount, error: lostAndFoundError } = lostAndFoundQuery;
    const { count: commentsCount, error: commentsError } = commentsQuery;

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return json({ message: 'User not found.' }, { status: 404 });
    }

    // Log count errors but don't fail the request
    if (noticesError) {
      console.error('Error counting notices:', noticesError);
    }
    if (eventsError) {
      console.error('Error counting events:', eventsError);
    }
    if (lostAndFoundError) {
      console.error('Error counting lost and found posts:', lostAndFoundError);
    }
    if (commentsError) {
      console.error('Error counting comments:', commentsError);
    }

    return json(
      {
        profile,
        counts: {
          notices: noticesCount || 0,
          events: eventsCount || 0,
          lostAndFound: lostAndFoundCount || 0,
          comments: commentsCount || 0,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error fetching user details:', err);
    return json({ message: 'An unexpected error occurred while fetching user details.' }, { status: 500 });
  }
}

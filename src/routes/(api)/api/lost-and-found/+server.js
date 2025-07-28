import { json } from '@sveltejs/kit';

export async function GET({ url, locals: { supabase, getSession } }) {
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

  try {
    // Get limit parameter from query string
    const limit = url.searchParams.get('limit');
    
    const query = supabase
      .from('lost_and_found')
      .select('id, item_name, description, type, date_lost_found, location_lost_found, contact_info, image_url, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Apply limit if provided
    if (limit && !isNaN(parseInt(limit))) {
      query.limit(parseInt(limit));
    }
    
    const { data: posts, count, error: postsError } = await query;

    if (postsError) {
      console.error('Error fetching lost and found posts:', postsError);
      return json({ message: 'Failed to fetch lost and found posts: ' + postsError.message }, { status: 500 });
    }

    return json({ posts, total: count }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error fetching lost and found posts:', err);
    return json({ message: 'An unexpected error occurred while fetching lost and found posts.' }, { status: 500 });
  }
}

export async function POST({ request, locals: { supabase, getSession } }) {
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

  const formData = await request.formData();
  const item_name = formData.get('item_name');
  const description = formData.get('description');
  const type = formData.get('type');
  const date_lost_found = formData.get('date_lost_found');
  const location_lost_found = formData.get('location_lost_found');
  const contact_info = formData.get('contact_info');
  const image_url = formData.get('image_url');

  if (!item_name || !description || !type || !date_lost_found || !contact_info) {
    return json({ message: 'All required fields must be filled.' }, { status: 400 });
  }

  try {
    const { error } = await supabase.from('lost_and_found').insert({
      item_name,
      description,
      type,
      date_lost_found,
      location_lost_found,
      contact_info,
      image_url,
      user_id: user.id,
      is_published: true,
    });

    if (error) {
      console.error('Error creating lost and found post:', error);
      return json({ message: 'Failed to create post: ' + error.message }, { status: 500 });
    }

    return json({ message: 'Post created successfully!' }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating lost and found post:', err);
    return json({ message: 'An unexpected error occurred while creating the post.' }, { status: 500 });
  }
}
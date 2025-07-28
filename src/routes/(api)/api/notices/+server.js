import { json } from '@sveltejs/kit';

function slugify(text) {
  const baseSlug = text
    .toString()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[--]+/g, '-')
    .replace(/-+$/, '');
  
  // Append a short unique identifier to ensure uniqueness
  const uniqueId = Math.random().toString(36).substring(2, 8); // 6 random alphanumeric characters
  return `${baseSlug}-${uniqueId}`;
}

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
      .from('news')
      .select('id, title, content, image_url, category, tags, created_at, slug', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Apply limit if provided
    if (limit && !isNaN(parseInt(limit))) {
      query.limit(parseInt(limit));
    }
    
    const { data: notices, count, error: noticesError } = await query;

    if (noticesError) {
      console.error('Error fetching notices:', noticesError);
      return json({ message: 'Failed to fetch notices: ' + noticesError.message }, { status: 500 });
    }

    return json({ notices, total: count }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error fetching notices:', err);
    return json({ message: 'An unexpected error occurred while fetching notices.' }, { status: 500 });
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
  const title = formData.get('title');
  const content = formData.get('content');
  const image_url = formData.get('image_url');
  const category = formData.get('category');
  const tags = formData.get('tags');

  if (!title || !content) {
    return json({ message: 'Title and Content are required.' }, { status: 400 });
  }

  const slug = slugify(title);

  try {
    const { error } = await supabase.from('news').insert({
      title,
      content,
      slug,
      image_url,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      is_published: true,
      user_id: user.id,
    });

    if (error) {
      console.error('Error creating notice:', error);
      return json({ message: 'Failed to create notice: ' + error.message }, { status: 500 });
    }

    return json({ message: 'Notice created successfully!' }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating notice:', err);
    return json({ message: 'An unexpected error occurred while creating the notice.' }, { status: 500 });
  }
}
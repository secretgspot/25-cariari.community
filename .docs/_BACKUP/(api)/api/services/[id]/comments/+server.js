
import { json } from '@sveltejs/kit';

// GET all comments for a specific service
export async function GET({ params, locals: { supabase, getSession } }) {
    let session = await getSession();

    if (!session) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('service_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
            return json({ message: 'Failed to fetch comments: ' + error.message }, { status: 500 });
        }

        return json({ comments }, { status: 200 });
    } catch (err) {
        console.error('Unexpected error fetching comments:', err);
        return json({ message: 'An unexpected error occurred while fetching comments.' }, { status: 500 });
    }
}

// POST a new comment to a specific service
export async function POST({ request, params, locals: { supabase, getSession } }) {
    let { user } = await getSession();

    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const formData = await request.formData();
    const content = formData.get('content');

    if (!content) {
        return json({ message: 'Content is required.' }, { status: 400 });
    }

    try {
        const { error } = await supabase.from('comments').insert({
            content,
            service_id: id,
            user_id: user.id
        });

        if (error) {
            console.error('Error creating comment:', error);
            return json({ message: 'Failed to create comment: ' + error.message }, { status: 500 });
        }

        return json({ message: 'Comment created successfully!' }, { status: 201 });
    } catch (err) {
        console.error('Unexpected error creating comment:', err);
        return json({ message: 'An unexpected error occurred while creating the comment.' }, { status: 500 });
    }
}

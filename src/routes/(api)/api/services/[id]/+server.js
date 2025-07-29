
import { json } from '@sveltejs/kit';

// GET a specific service by ID
export async function GET({ params, locals: { supabase, getSession } }) {
    let session = await getSession();

    if (!session) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    try {
        const { data: service, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching service:', error);
            return json({ message: 'Failed to fetch service: ' + error.message }, { status: 500 });
        }

        if (!service) {
            return json({ message: 'Service not found' }, { status: 404 });
        }

        return json({ service }, { status: 200 });
    } catch (err) {
        console.error('Unexpected error fetching service:', err);
        return json({ message: 'An unexpected error occurred while fetching the service.' }, { status: 500 });
    }
}

// UPDATE a specific service by ID
export async function PUT({ request, params, locals: { supabase, getSession } }) {
    let { user } = await getSession();

    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const image_url = formData.get('image_url');
    const start_date = formData.get('service_start_date');
    const end_date = formData.get('service_end_date');

    if (!title || !description) {
        return json({ message: 'Title and description are required.' }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('services')
            .update({
                title,
                description,
                category,
                image_url,
                start_date,
                end_date
            })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error updating service:', error);
            return json({ message: 'Failed to update service: ' + error.message }, { status: 500 });
        }

        return json({ message: 'Service updated successfully!' }, { status: 200 });
    } catch (err) {
        console.error('Unexpected error updating service:', err);
        return json({ message: 'An unexpected error occurred while updating the service.' }, { status: 500 });
    }
}

// DELETE a specific service by ID
export async function DELETE({ params, locals: { supabase, getSession } }) {
    let { user } = await getSession();

    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting service:', error);
            return json({ message: 'Failed to delete service: ' + error.message }, { status: 500 });
        }

        return json({ message: 'Service deleted successfully!' }, { status: 200 });
    } catch (err) {
        console.error('Unexpected error deleting service:', err);
        return json({ message: 'An unexpected error occurred while deleting the service.' }, { status: 500 });
    }
}

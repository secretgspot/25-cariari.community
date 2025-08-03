
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
		const { data: service, error: serviceError } = await supabase
			.from('services')
			.select('*')
			.eq('id', id)
			.single();

		if (serviceError || !service) {
			console.error('Error fetching service:', serviceError?.message, serviceError?.details);
			return json({ message: 'Service not found.' }, { status: 404 });
		}

		// Count comments for this service
		const { count: commentsCount, error: commentsError } = await supabase
			.from('comments')
			.select('id', { count: 'exact' })
			.eq('service_id', service.id);

		if (commentsError) {
			console.error('Error counting comments for service:', commentsError?.message, commentsError?.details);
		}

		return json({ ...service, comments_count: commentsCount || 0 }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching service:', err);
		return json({ message: 'An unexpected error occurred while fetching the service.' }, { status: 500 });
	}
}

export async function PATCH({ request, params, locals: { supabase, getSession } }) {
	const { id } = params;
	let { user, is_admin } = await getSession();

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
		// Verify that the user is the author of the service
		const { data: service, error: fetchError } = await supabase
			.from('services')
			.select('user_id, id')
			.eq('id', id)
			.single();

		if (fetchError || !service) {
			console.error('Error fetching service for update:', fetchError?.message, fetchError?.details);
			return json({ message: 'Service not found or you do not have permission to update it.' }, { status: 404 });
		}

		if (service.user_id !== user.id && !is_admin) {
			return json({ message: 'You do not have permission to update this service.' }, { status: 403 });
		}

		// Perform the update (always use the actual UUID for update)
		const { data: updatedService, error: updateError } = await supabase
			.from('services')
			.update({ ...updates, updated_at: new Date().toISOString() })
			.eq('id', service.id)
			.select()
			.single();

		if (updateError) {
			console.error('Error updating service:', updateError?.message, updateError?.details);
			return json({ message: 'Failed to update service: ' + updateError.message }, { status: 500 });
		}

		return json({ message: 'Service updated successfully!', service: updatedService }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error updating service:', err);
		return json({ message: 'An unexpected error occurred while updating the service.' }, { status: 500 });
	}
}

export async function DELETE({ params, locals: { supabase, getSession } }) {
	const { id } = params;
	let { user, is_admin } = await getSession();

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
		// Verify that the user is the author of the service
		const { data: service, error: fetchError } = await supabase
			.from('services')
			.select('user_id, id')
			.eq('id', id)
			.single();

		if (fetchError || !service) {
			console.error('Error fetching service for deletion:', fetchError?.message, fetchError?.details);
			return json({ message: 'Service not found or you do not have permission to delete it.' }, { status: 404 });
		}

		if (service.user_id !== user.id && !is_admin) {
			return json({ message: 'You do not have permission to delete this service.' }, { status: 403 });
		}

		// Perform the deletion (always use the actual UUID for deletion)
		const { error: deleteError } = await supabase
			.from('services')
			.delete()
			.eq('id', service.id);

		if (deleteError) {
			console.error('Error deleting service:', deleteError?.message, deleteError?.details);
			return json({ message: 'Failed to delete service.' }, { status: 500 });
		}

		return json({ message: 'Service deleted successfully!' }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error deleting service:', err);
		return json({ message: 'An unexpected error occurred while deleting the service.' }, { status: 500 });
	}
}

import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
	let session = await getSession();

	

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { uuid } = params;

	try {
		const { data: services, error: servicesError } = await supabase
			.from('services')
			.select('*')
			.eq('user_id', uuid)
			.order('created_at', { ascending: false })
			.limit(50); // Limit to 50 most recent services for better performance

		if (servicesError) {
			console.error('Error fetching user services:', servicesError);
			return json({ message: 'Failed to fetch user services: ' + servicesError.message }, { status: 500 });
		}

		return json(services, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching user services:', err);
		return json({ message: 'An unexpected error occurred while fetching user services.' }, { status: 500 });
	}
}

export async function DELETE({ params, locals: { supabase, getSession } }) {
	const { uuid } = params;
	let { user } = await getSession();

	

	if (!user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { error: deleteError } = await supabase
			.from('services')
			.delete()
			.eq('user_id', uuid);

		if (deleteError) {
			console.error('Error deleting all user services:', deleteError?.message, deleteError?.details);
			return json({ message: 'Failed to delete all services.' }, { status: 500 });
		}

		return json({ message: 'All services deleted successfully!' }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error deleting all user services:', err);
		return json({ message: 'An unexpected error occurred while deleting all services.' }, { status: 500 });
	}
}
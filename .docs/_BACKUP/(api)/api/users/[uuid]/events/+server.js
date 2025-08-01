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
		const { data: events, error: eventsError } = await supabase
			.from('events')
			.select('*')
			.eq('user_id', uuid)
			.order('created_at', { ascending: false })
			.limit(50); // Limit to 50 most recent events for better performance

		if (eventsError) {
			console.error('Error fetching user events:', eventsError);
			return json({ message: 'Failed to fetch user events: ' + eventsError.message }, { status: 500 });
		}

		return json(events, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching user events:', err);
		return json({ message: 'An unexpected error occurred while fetching user events.' }, { status: 500 });
	}
}

export async function DELETE({ params, locals: { supabase, getSession } }) {
	const { uuid } = params;
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
		const { error: deleteError } = await supabase
			.from('events')
			.delete()
			.eq('user_id', uuid);

		if (deleteError) {
			console.error('Error deleting all user events:', deleteError?.message, deleteError?.details);
			return json({ message: 'Failed to delete all events.' }, { status: 500 });
		}

		return json({ message: 'All events deleted successfully!' }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error deleting all user events:', err);
		return json({ message: 'An unexpected error occurred while deleting all events.' }, { status: 500 });
	}
}
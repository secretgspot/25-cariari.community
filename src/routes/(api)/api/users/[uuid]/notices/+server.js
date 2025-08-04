import { json } from '@sveltejs/kit';

export async function GET({ params, locals: { supabase, getSession } }) {
	let session = await getSession();

	

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { uuid } = params;

	try {
		const { data: notices, error: noticesError } = await supabase
			.from('notices')
			.select('*')
			.eq('user_id', uuid)
			.order('created_at', { ascending: false })
			.limit(50); // Limit to 50 most recent notices for better performance

		if (noticesError) {
			console.error('Error fetching user notices:', noticesError);
			return json({ message: 'Failed to fetch user notices: ' + noticesError.message }, { status: 500 });
		}

		return json(notices, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching user notices:', err);
		return json({ message: 'An unexpected error occurred while fetching user notices.' }, { status: 500 });
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
			.from('notices')
			.delete()
			.eq('user_id', uuid);

		if (deleteError) {
			console.error('Error deleting all user notices:', deleteError?.message, deleteError?.details);
			return json({ message: 'Failed to delete all notices.' }, { status: 500 });
		}

		return json({ message: 'All notices deleted successfully!' }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error deleting all user notices:', err);
		return json({ message: 'An unexpected error occurred while deleting all notices.' }, { status: 500 });
	}
}
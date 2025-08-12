import { json } from '@sveltejs/kit';

// GET a specific ad by ID
export async function GET({ params, locals: { supabase } }) {
	const { id } = params;

	try {
		const { data, error } = await supabase.from('ads').select('*').eq('id', id).single();

		if (error) {
			console.error('Error fetching ad:', error);
			return json({ message: 'Failed to fetch ad' }, { status: 500 });
		}

		if (!data) {
			return json({ message: 'Ad not found' }, { status: 404 });
		}

		return json(data, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching ad:', err);
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
}

// PATCH (update) an ad
export async function PATCH({ request, params, locals: { supabase, getSession } }) {
	const { user, is_admin } = await getSession();
	if (!user || !is_admin) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;

	try {
		const body = await request.json();

		const { data, error } = await supabase
			.from('ads')
			.update(body)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating ad:', error);
			return json({ message: 'Failed to update ad' }, { status: 500 });
		}

		return json(data, { status: 200 });
	} catch (err) {
		console.error('Unexpected error updating ad:', err);
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
}

// DELETE an ad
export async function DELETE({ params, locals: { supabase, getSession } }) {
	const { user, is_admin } = await getSession();
	if (!user || !is_admin) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;

	try {
		const { error } = await supabase.from('ads').delete().eq('id', id);

		if (error) {
			console.error('Error deleting ad:', error);
			return json({ message: 'Failed to delete ad' }, { status: 500 });
		}

		return json({ message: 'Ad deleted successfully' }, { status: 200 });
	} catch (err) {
		console.error('Unexpected error deleting ad:', err);
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
}
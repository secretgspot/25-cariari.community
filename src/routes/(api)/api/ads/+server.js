import { json } from '@sveltejs/kit';

export async function GET({ request, locals: { supabase } }) {
	try {
		const { data, error } = await supabase.from('ads').select('*');

		if (error) {
			console.error('Error fetching ads:', error);
			return json({ message: 'Failed to fetch ads' }, { status: 500 });
		}

		return json(data, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching ads:', err);
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
}

export async function POST({ request, locals: { supabase, getSession } }) {
	const { user, is_admin } = await getSession();
	if (!user || !is_admin) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();

		if (!body.title || !body.href) {
			return json({ message: 'Title and Link URL are required.' }, { status: 400 });
		}

		const { data, error } = await supabase
			.from('ads')
			.insert({ ...body, user_id: user.id })
			.select()
			.single();

		if (error) {
			console.error('Error creating ad:', error);
			return json({ message: 'Failed to create ad: ' + error.message }, { status: 500 });
		}

		return json(data, { status: 201 });
	} catch (err) {
		console.error('Unexpected error creating ad:', err);
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
}
import { json } from '@sveltejs/kit';

export async function GET({ url, locals: { supabase } }) {
	try {
		const { data, error } = await supabase
			.from('ads')
			.select('*');

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
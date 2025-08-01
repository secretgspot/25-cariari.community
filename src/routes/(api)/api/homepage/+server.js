// src/routes/api/homepage/+server.js
import { json } from '@sveltejs/kit';

export async function GET({ locals: { supabase } }) {
	try {
		const [
			noticesData,
			eventsData,
			lostAndFoundData,
			servicesData
		] = await Promise.all([
			supabase
				.from('notices')
				.select('*')
				.limit(5)
				.order('created_at', { ascending: false }),

			supabase
				.from('events')
				.select('*')
				.limit(5)
				.order('created_at', { ascending: false }),

			supabase
				.from('lost_and_found')
				.select('*')
				.limit(4)
				.order('created_at', { ascending: false }),

			supabase
				.from('services')
				.select('*')
				.limit(5)
				.order('created_at', { ascending: false })
		]);

		return json({
			notices: noticesData.data || [],
			events: eventsData.data || [],
			lostAndFound: lostAndFoundData.data || [],
			services: servicesData.data || []
		});
	} catch (error) {
		console.error('API error in homepage:', error);
		return json({
			error: 'Failed to fetch data'
		}, {
			status: 500
		});
	}
}

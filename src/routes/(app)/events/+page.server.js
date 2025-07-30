/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { is_logged_in } = await getSession();

	if (!is_logged_in) {
		throw redirect(303, '/login');
	}

	try {
		const response = await fetch('/api/events');

		if (!response.ok) {
			console.error('Error fetching events from API, status:', response.status);
			return { events: [] };
		}

		const result = await response.json();

		// Handle both array response and object with events property
		const events = Array.isArray(result) ? result : (result.events || []);

		return { events };
	} catch (error) {
		console.error('Error fetching events:', error);
		return { events: [] };
	}
}

export const actions = {
	createEvent: async ({ request, fetch, locals: { getSession } }) => {
		const { is_logged_in } = await getSession();

		if (!is_logged_in) {
			return fail(401, { message: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();

			// Send the FormData directly to your API endpoint
			// since it expects multipart/form-data or application/x-www-form-urlencoded
			const response = await fetch('/api/events', {
				method: 'POST',
				body: formData, // Send FormData directly, not JSON
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, {
					message: result.message || 'Failed to create a event',
					...result
				});
			}

			return {
				success: true,
				message: result.message || 'Event created successfully!',
				event: result.event || {}
			};
		} catch (error) {
			console.error('Error creating event:', error);
			return fail(500, {
				message: 'An unexpected error occurred while creating the event'
			});
		}
	},
};
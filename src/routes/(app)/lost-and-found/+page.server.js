/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { is_logged_in } = await getSession();

	if (!is_logged_in) {
		throw redirect(303, '/login');
	}

	try {
		const response = await fetch('/api/lost-and-found');

		if (!response.ok) {
			console.error('Error fetching lost and found from API, status:', response.status);
			return { lostandfound: [] };
		}

		const result = await response.json();

		// Handle both array response and object with lostandfound property
		const lostandfound = Array.isArray(result) ? result : (result.lostandfound || []);

		return { lostandfound };
	} catch (error) {
		console.error('Error fetching lost and found:', error);
		return { lostandfound: [] };
	}
}

export const actions = {
	createLostAndFound: async ({ request, fetch, locals: { getSession } }) => {
		const { is_logged_in } = await getSession();

		if (!is_logged_in) {
			return fail(401, { message: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();

			// Send the FormData directly to your API endpoint
			// since it expects multipart/form-data or application/x-www-form-urlencoded
			const response = await fetch('/api/lost-and-found', {
				method: 'POST',
				body: formData, // Send FormData directly, not JSON
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, {
					message: result.message || 'Failed to create a lost and found item',
					...result
				});
			}

			return {
				success: true,
				message: result.message || 'Lost and Found created successfully!',
				lostandfound: result.lostandfound || {}
			};
		} catch (error) {
			console.error('Error creating lost and found:', error);
			return fail(500, {
				message: 'An unexpected error occurred while creating the lost and found item'
			});
		}
	},
};
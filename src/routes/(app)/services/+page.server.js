/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { is_logged_in } = await getSession();

	if (!is_logged_in) {
		throw redirect(303, '/login');
	}

	try {
		const response = await fetch('/api/services');

		if (!response.ok) {
			console.error('Error fetching services from API, status:', response.status);
			return { services: [] };
		}

		const result = await response.json();

		// Handle both array response and object with services property
		const services = Array.isArray(result) ? result : (result.services || []);

		return { services };
	} catch (error) {
		console.error('Error fetching services:', error);
		return { services: [] };
	}
}

export const actions = {
	createService: async ({ request, fetch, locals: { getSession } }) => {
		const { is_logged_in } = await getSession();

		if (!is_logged_in) {
			return fail(401, { message: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();

			// Send the FormData directly to your API endpoint
			// since it expects multipart/form-data or application/x-www-form-urlencoded
			const response = await fetch('/api/services', {
				method: 'POST',
				body: formData, // Send FormData directly, not JSON
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, {
					message: result.message || 'Failed to create a service',
					...result
				});
			}

			return {
				success: true,
				message: result.message || 'Service created successfully!',
				service: result.service || {}
			};
		} catch (error) {
			console.error('Error creating service:', error);
			return fail(500, {
				message: 'An unexpected error occurred while creating the service'
			});
		}
	},
};
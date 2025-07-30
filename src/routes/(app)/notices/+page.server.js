/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { is_logged_in } = await getSession();

	if (!is_logged_in) {
		throw redirect(303, '/login');
	}

	try {
		const response = await fetch('/api/notices');

		if (!response.ok) {
			console.error('Error fetching notices from API, status:', response.status);
			return { notices: [] };
		}

		const result = await response.json();

		// Handle both array response and object with notices property
		const notices = Array.isArray(result) ? result : (result.notices || []);

		return { notices };
	} catch (error) {
		console.error('Error fetching notices:', error);
		return { notices: [] };
	}
}

export const actions = {
	createNotice: async ({ request, fetch, locals: { getSession } }) => {
		const { is_logged_in } = await getSession();

		if (!is_logged_in) {
			return fail(401, { message: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();

			const response = await fetch('/api/notices', {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, {
					message: result.message || 'Failed to create notice',
					...result
				});
			}

			return {
				success: true,
				message: result.message || 'Notice created successfully!',
				notice: result.notice
			};
		} catch (error) {
			console.error('Error creating notice:', error);
			return fail(500, {
				message: 'An unexpected error occurred while creating the notice'
			});
		}
	},
};
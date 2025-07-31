
/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ params, locals: { getSession }, fetch }) {
	const { user, is_logged_in } = await getSession();

	const { id } = params;

	const response = await fetch(`/api/services/${id}`);

	if (!response.ok) {
		const result = await response.json();
		throw error(response.status, result.message || 'Could not fetch service');
	}

	const service = await response.json();

	return {
		service,
		user,
		is_logged_in,
		isOwner: user && service.user_id === user.id
	};
}

export const actions = {
	updateService: async ({ request, params, fetch }) => {
		const { id } = params;
		const formData = await request.formData();

		const updateData = {
			title: formData.get('title'),
			description: formData.get('description'),
			category: formData.get('category'),
			image_url: formData.get('image_url') || null,
			start_date: formData.get('start_date'),
			end_date: formData.get('end_date'),
		};

		const response = await fetch(`/api/services/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(updateData)
		});

		const result = await response.json();

		if (!response.ok) {
			return fail(response.status, result);
		}

		return { success: true, message: result.message };
	},

	deleteService: async ({ params, fetch }) => {
		const { id } = params;
		const response = await fetch(`/api/services/${id}`, {
			method: 'DELETE'
		});

		const result = await response.json();

		if (!response.ok) {
			return fail(response.status, result);
		}

		// Redirect to services list after successful deletion
		throw redirect(303, '/services');
	}
};

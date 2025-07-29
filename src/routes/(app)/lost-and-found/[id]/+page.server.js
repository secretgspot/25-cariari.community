/** @type {import('./$types').PageServerLoad} */
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals: { getSession }, fetch }) {
	const { user, is_logged_in } = await getSession();
	const { id } = params;
	const response = await fetch(`/api/lost-and-found/${id}`);

	if (!response.ok) {
		const result = await response.json();
		throw error(response.status, result.message || 'Could not fetch lost and found post');
	}

	const post = await response.json();

	return {
		post,
		user,
		is_logged_in,
		isOwner: user && post.user_id === user.id
	};
}

export const actions = {
	updatePost: async ({ request, params, fetch }) => {
		const { id } = params;
		const formData = await request.formData();

		const updateData = {
			item_name: formData.get('item_name'),
			description: formData.get('description'),
			type: formData.get('type'),
			date_lost_found: formData.get('date_lost_found'),
			location_lost_found: formData.get('location_lost_found'),
			contact_info: formData.get('contact_info'),
			image_url: formData.get('image_url') || null
		};

		const response = await fetch(`/api/lost-and-found/${id}`, {
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

	deletePost: async ({ params, fetch }) => {
		const { id } = params;
		const response = await fetch(`/api/lost-and-found/${id}`, {
			method: 'DELETE'
		});

		const result = await response.json();

		if (!response.ok) {
			return fail(response.status, result);
		}

		// Redirect to lost-and-found list after successful deletion
		throw redirect(303, '/lost-and-found');
	}
};

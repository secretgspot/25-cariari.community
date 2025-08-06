import { error, fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals: { getSession }, fetch }) {
	const { user, is_logged_in, is_admin } = await getSession();
	const { id } = params;
	const response = await fetch(`/api/notices/${id}`);

	if (!response.ok) {
		const result = await response.json();
		throw error(response.status, result.message || 'Could not fetch notice');
	}

	const notice = await response.json();

	return {
		notice,
		user,
		is_logged_in,
		is_admin,
		isOwner: user && (notice.user_id === user.id || is_admin)
	};
}

export const actions = {
	updateNotice: async ({ request, params, fetch, locals: { getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const { id } = params;
		const formData = await request.formData();

		const updateData = {
			title: formData.get('title'),
			description: formData.get('description'),
			urgency: formData.get('urgency') || 'Default',
			start_date: formData.get('start_date') || null,
			end_date: formData.get('end_date') || null
		};

		const response = await fetch(`/api/notices/${id}`, {
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

		return {
			message: result.message || 'Notice updated successfully!'
		};
	},

	deleteNotice: async ({ params, fetch, locals: { getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const { id } = params;
		const response = await fetch(`/api/notices/${id}`, {
			method: 'DELETE'
		});

		const result = await response.json();

		if (!response.ok) {
			return fail(response.status, result);
		}

		return {
			message: result.message || 'Notice deleted successfully!'
		};
	}
};
import { redirect, fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { getSession }, fetch }) {
	const { is_logged_in, is_admin } = await getSession();

	if (!is_logged_in || !is_admin) {
		throw redirect(303, '/login');
	}

	try {
		const usersResponse = await fetch('/api/users');

		if (!usersResponse.ok) {
			console.error('Error fetching users from API, status:', usersResponse.status);
		}

		const usersResult = usersResponse.ok ? await usersResponse.json() : [];
		const users = Array.isArray(usersResult) ? usersResult : usersResult.users || [];

		return { users };
	} catch (error) {
		console.error('Error fetching data in load function:', error);
		return { users: [] };
	}
}

export const actions = {
	// All ads-related actions have been removed
};
/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { user, is_logged_in, is_admin } = await getSession();

	if (!is_logged_in || !user) {
		throw redirect(303, '/login');
	}

	// Make all API calls in parallel for better performance
	const [
		profileResponse,
		lostAndFoundResponse,
		eventsResponse,
		noticesResponse,
		commentsResponse,
		servicesResponse
	] = await Promise.all([
		fetch(`/api/users/${user.id}`),
		fetch(`/api/users/${user.id}/lost-and-found`),
		fetch(`/api/users/${user.id}/events`),
		fetch(`/api/users/${user.id}/notices`),
		fetch(`/api/users/${user.id}/comments`),
		fetch(`/api/users/${user.id}/services`)
	]);

	// Process all responses in parallel
	const [
		profileResult,
		lostAndFoundResult,
		eventsResult,
		noticesResult,
		commentsResult,
		servicesResult
	] = await Promise.all([
		profileResponse.json().catch(() => ({ profile: null })),
		lostAndFoundResponse.json().catch(() => []),
		eventsResponse.json().catch(() => []),
		noticesResponse.json().catch(() => []),
		commentsResponse.json().catch(() => []),
		servicesResponse.json().catch(() => [])
	]);

	// Log errors if any API calls failed
	if (!profileResponse.ok) {
		console.error('Error fetching profile from API:', profileResult);
	}
	if (!lostAndFoundResponse.ok) {
		console.error('Error fetching lost and found posts from API:', lostAndFoundResult);
	}
	if (!eventsResponse.ok) {
		console.error('Error fetching events from API:', eventsResult);
	}
	if (!noticesResponse.ok) {
		console.error('Error fetching notices from API:', noticesResult);
	}
	if (!commentsResponse.ok) {
		console.error('Error fetching comments from API:', commentsResult);
	}
	if (!servicesResponse.ok) {
		console.error('Error fetching services from API:', servicesResult);
	}

	return {
		user,
		is_logged_in,
		is_admin,
		lostAndFoundPosts: lostAndFoundResult || [],
		events: eventsResult || [],
		notices: noticesResult || [],
		comments: commentsResult || [],
		services: servicesResult || [],
	};
}

export const actions = {
	updateProfile: async ({ request, fetch }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const full_name = formData.get('full_name');
		const avatar_url = formData.get('avatar_url');
		const bio = formData.get('bio');

		const response = await fetch('/api/profile', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, full_name, avatar_url, bio }),
		});
		const result = await response.json();

		if (!response.ok) {
			return fail(response.status, result);
		}

		return { success: true, message: result.message, profile: result.profile };
	},
};
/** @type {import('./$types').PageServerLoad} */
import { redirect, error, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { user, is_logged_in } = await getSession();

	// Fetch latest data for homepage in parallel for better performance
	const [
		noticesResponse,
		eventsResponse,
		lostAndFoundResponse,
		servicesResponse
	] = await Promise.all([
		fetch('/api/notices?limit=5'),
		fetch('/api/events?limit=5'),
		fetch('/api/lost-and-found?limit=4'),
		fetch('/api/services?limit=5')
	]);

	// Process all responses in parallel
	const [
		noticesResult,
		eventsResult,
		lostAndFoundResult
	] = await Promise.all([
		noticesResponse.json().catch(() => ({ notices: [] })),
		eventsResponse.json().catch(() => ({ events: [] })),
		lostAndFoundResponse.json().catch(() => ({ posts: [] })),
		servicesResponse.json().catch(() => ({ posts: [] }))
	]);

	return {
		user,
		is_logged_in,
		noticesPosts: noticesResult.notices || [],
		eventsPosts: eventsResult.events || [],
		lostAndFoundPosts: lostAndFoundResult.posts || [],
		servicesPosts: servicesResponse.posts || []
	};
};

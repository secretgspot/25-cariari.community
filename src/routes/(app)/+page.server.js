/** @type {import('./$types').PageServerLoad} */
import { redirect, error, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { user, is_logged_in } = await getSession();

	// If not logged in, return early with empty data
	if (!is_logged_in) {
		return {
			user,
			is_logged_in,
			noticesPosts: [],
			eventsPosts: [],
			lostAndFoundPosts: [],
			servicesPosts: []
		};
	}

	let homepageData = {
		notices: [],
		events: [],
		lostAndFound: [],
		services: []
	};

	try {
		// Fetch from your new API endpoint
		const response = await fetch('/api/homepage', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			// Add timeout handling
			signal: AbortSignal.timeout(10000) // 10 second timeout
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		homepageData = await response.json();
	} catch (err) {
		console.error('Error fetching homepage data:', err);
		// Return empty arrays to prevent app crash
		// This ensures your app doesn't break if API is down
	}

	return {
		user,
		is_logged_in,
		noticesPosts: homepageData.notices || [],
		eventsPosts: homepageData.events || [],
		lostAndFoundPosts: homepageData.lostAndFound || [],
		servicesPosts: homepageData.services || []
	};
}

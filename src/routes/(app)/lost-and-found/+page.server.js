/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { is_logged_in } = await getSession();

	if (!is_logged_in) {
		throw redirect(303, '/login');
	}

	try {
		console.log('Fetching from /api/lost-and-found...');
		const response = await fetch('/api/lost-and-found');
		console.log('Response status:', response.status);
		console.log('Response ok:', response.ok);

		if (!response.ok) {
			console.error('Error fetching lost and found from API, status:', response.status);
			return { lostandfound: [] };
		}

		const result = await response.json();
		console.log('Raw API result:', JSON.stringify(result, null, 2));
		console.log('Is result an array?', Array.isArray(result));
		console.log('Result keys:', Object.keys(result));

		// Handle both array response and object with lostandfound property
		let lostandfound;
		if (Array.isArray(result)) {
			lostandfound = result;
			console.log('Using result as array, length:', result.length);
		} else if (result.lostandfound) {
			lostandfound = result.lostandfound;
			console.log('Using result.lostandfound, length:', result.lostandfound.length);
		} else {
			// Check for other possible property names
			const possibleKeys = ['items', 'data', 'lost_and_found', 'lostAndFound', 'notices'];
			let found = false;

			for (const key of possibleKeys) {
				if (result[key] && Array.isArray(result[key])) {
					lostandfound = result[key];
					console.log(`Found data in result.${key}, length:`, result[key].length);
					found = true;
					break;
				}
			}

			if (!found) {
				console.log('No array found in result, using empty array');
				lostandfound = [];
			}
		}

		console.log('Final lostandfound array length:', lostandfound.length);
		if (lostandfound.length > 0) {
			console.log('First item:', JSON.stringify(lostandfound[0], null, 2));
		}

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
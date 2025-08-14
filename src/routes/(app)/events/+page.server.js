/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { is_logged_in } = await getSession();

	if (!is_logged_in) {
		throw redirect(303, '/login');
	}

	try {
		const response = await fetch('/api/events');

		if (!response.ok) {
			console.error('Error fetching events from API, status:', response.status);
			return { events: [] };
		}

		const result = await response.json();

		// Handle both array response and object with events property
		const events = Array.isArray(result) ? result : (result.events || []);

		return { events };
	} catch (error) {
		console.error('Error fetching events:', error);
		return { events: [] };
	}
}

export const actions = {
	createEvent: async ({ request, fetch, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();
			const imageFile = formData.get('image_file');

			// Handle file upload if provided
			if (imageFile && imageFile.size > 0) {
				// console.log('🔄 Processing event image upload...');

				// Generate unique filename with proper extension
				const fileExtension = imageFile.name.split('.').pop() || 'jpg';
				const fileName = `${session.user.id}_${Date.now()}.${fileExtension}`;
				const filePath = `events/${fileName}`;

				// console.log('⬆️ Uploading to path:', filePath);

				// Upload the file
				const { data: uploadData, error: uploadError } = await supabase.storage
					.from('uploads')
					.upload(filePath, imageFile, {
						cacheControl: '3600',
						upsert: false
					});

				if (uploadError) {
					console.error('❌ Upload error:', uploadError);
					return fail(500, { message: 'Failed to upload image: ' + uploadError.message });
				}

				// console.log('✅ Upload successful:', uploadData);

				// Get public URL
				const { data: publicUrlData } = supabase.storage
					.from('uploads')
					.getPublicUrl(uploadData.path);

				// Set the uploaded image URL, overriding any provided image_url
				formData.set('image_url', publicUrlData.publicUrl);
				// console.log('🔗 New image URL:', publicUrlData.publicUrl);
			}

			// Convert empty date strings to null
			if (formData.get('start_date') === '') {
				formData.set('start_date', null);
			}
			if (formData.get('end_date') === '') {
				formData.set('end_date', null);
			}

			// Send the FormData directly to your API endpoint
			// since it expects multipart/form-data or application/x-www-form-urlencoded
			const response = await fetch('/api/events', {
				method: 'POST',
				body: formData, // Send FormData directly, not JSON
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, {
					message: result.message || 'Failed to create a event',
					...result
				});
			}

			return {
				success: true,
				message: result.message || 'Event created successfully!',
				event: result.event || {}
			};
		} catch (error) {
			console.error('Error creating event:', error);
			return fail(500, {
				message: 'An unexpected error occurred while creating the event'
			});
		}
	},
};
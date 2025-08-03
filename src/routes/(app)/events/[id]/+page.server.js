/** @type {import('./$types').PageServerLoad} */
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals: { getSession }, fetch }) {
	const { user, is_logged_in, is_admin } = await getSession();

	const { id } = params;

	const response = await fetch(`/api/events/${id}`);

	if (!response.ok) {
		const result = await response.json();
		throw error(response.status, result.message || 'Could not fetch event');
	}

	const event = await response.json();

	return {
		event,
		user,
		is_logged_in,
		isOwner: user && (event.user_id === user.id || is_admin)
	};
}

export const actions = {
	updateEvent: async ({ request, params, fetch, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const { id } = params;

		try {
			const formData = await request.formData();
			const imageFile = formData.get('image_file');

			// Get current event data to check for existing image
			const currentEventResponse = await fetch(`/api/events/${id}`);
			const currentEvent = currentEventResponse.ok ? await currentEventResponse.json() : null;

			let newImageUrl = currentEvent?.image_url || null;

			// Handle file upload if provided
			if (imageFile && imageFile.size > 0) {
				// console.log('🔄 Processing event image upload...');

				// Delete old image if it exists
				if (currentEvent?.image_url) {
					const oldImagePath = currentEvent.image_url.split('/uploads/').pop();
					if (oldImagePath) {
						// console.log('🗑️ Deleting old image:', oldImagePath);
						await supabase.storage.from('uploads').remove([oldImagePath]);
					}
				}

				// Generate unique filename with proper extension
				const fileExtension = imageFile.name.split('.').pop() || 'jpg';
				const fileName = `${session.user.id}_${Date.now()}.${fileExtension}`;
				const filePath = `events/${fileName}`;

				// console.log('⬆️ Uploading to path:', filePath);

				// Upload the new file
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

				newImageUrl = publicUrlData.publicUrl;
				// console.log('🔗 New image URL:', newImageUrl);
			}

			const updateData = {
				title: formData.get('title'),
				description: formData.get('description'),
				event_start_date: formData.get('event_start_date'),
				event_end_date: formData.get('event_end_date') || null,
				location: formData.get('location') || null,
				image_url: newImageUrl,
				category: formData.get('category') || null
			};

			const response = await fetch(`/api/events/${id}`, {
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

			// console.log('✅ Event updated successfully');
			// Return success data directly (no type/data wrapper)
			return {
				message: result.message || 'Event updated successfully!'
			};

		} catch (error) {
			console.error('❌ Unexpected error in updateEvent:', error);
			return fail(500, {
				message: 'An unexpected error occurred while updating the event: ' + error.message
			});
		}
	},

	deleteEvent: async ({ params, fetch, locals: { supabase } }) => {
		const { id } = params;

		try {
			// Get current event data to delete associated image
			const currentEventResponse = await fetch(`/api/events/${id}`);
			const currentEvent = currentEventResponse.ok ? await currentEventResponse.json() : null;

			// Delete associated image from storage if it exists
			if (currentEvent?.image_url) {
				const imagePath = currentEvent.image_url.split('/uploads/').pop();
				if (imagePath) {
					// console.log('🗑️ Deleting event image:', imagePath);
					await supabase.storage.from('uploads').remove([imagePath]);
				}
			}

			// Delete the event
			const response = await fetch(`/api/events/${id}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, result);
			}

			// console.log('✅ Event and associated files deleted successfully');
			// Redirect to events list after successful deletion
			throw redirect(303, '/events');

		} catch (error) {
			if (error.status === 303) {
				// Re-throw redirect
				throw error;
			}
			console.error('❌ Unexpected error in deleteEvent:', error);
			return fail(500, {
				message: 'An unexpected error occurred while deleting the event: ' + error.message
			});
		}
	}
};
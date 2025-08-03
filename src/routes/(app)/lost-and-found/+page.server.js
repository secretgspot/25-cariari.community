/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
	const { is_logged_in } = await getSession();

	if (!is_logged_in) {
		throw redirect(303, '/login');
	}

	try {
		const response = await fetch('/api/lost-and-found');

		if (!response.ok) {
			console.error('Error fetching lost and found from API, status:', response.status);
			return { lostandfound: [] };
		}

		const result = await response.json();

		// Handle both array response and object with lostandfound property
		const lostandfound = Array.isArray(result) ? result : (result.lostandfound || []);

		return { lostandfound };
	} catch (error) {
		console.error('Error fetching lost and found:', error);
		return { lostandfound: [] };
	}
}

export const actions = {
	createLostAndFound: async ({ request, fetch, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();
			const imageFile = formData.get('image_file');

			// Handle file upload if provided
			if (imageFile && imageFile.size > 0) {
				// console.log('🔄 Processing lost and found image upload...');

				// Generate unique filename with proper extension
				const fileExtension = imageFile.name.split('.').pop() || 'jpg';
				const fileName = `${session.user.id}_${Date.now()}.${fileExtension}`;
				const filePath = `lost-and-found/${fileName}`;

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
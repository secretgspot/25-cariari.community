/** @type {import('./$types').PageServerLoad} */
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals: { getSession }, fetch }) {
	const { user, is_logged_in, is_admin } = await getSession();

	const { id } = params;

	const response = await fetch(`/api/services/${id}`);

	if (!response.ok) {
		const result = await response.json();
		throw error(response.status, result.message || 'Could not fetch service');
	}

	const service = await response.json();

	return {
		service,
		user,
		is_logged_in,
		is_admin,
		isOwner: user && service.user_id === user.id
	};
}

export const actions = {
	updateService: async ({ request, params, fetch, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const { id } = params;

		try {
			const formData = await request.formData();
			const imageFile = formData.get('image_file');

			// Get current service data to check for existing image
			const currentServiceResponse = await fetch(`/api/services/${id}`);
			const currentService = currentServiceResponse.ok ? await currentServiceResponse.json() : null;

			let newImageUrl = currentService?.image_url || null;

			// Handle file upload if provided
			if (imageFile && imageFile.size > 0) {
				// console.log('🔄 Processing service image upload...');

				// Delete old image if it exists
				if (currentService?.image_url) {
					const oldImagePath = currentService.image_url.split('/uploads/').pop();
					if (oldImagePath) {
						// console.log('🗑️ Deleting old image:', oldImagePath);
						await supabase.storage.from('uploads').remove([oldImagePath]);
					}
				}

				// Generate unique filename with proper extension
				const fileExtension = imageFile.name.split('.').pop() || 'jpg';
				const fileName = `${session.user.id}_${Date.now()}.${fileExtension}`;
				const filePath = `services/${fileName}`;

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
				category: formData.get('category'),
				image_url: newImageUrl,
				start_date: formData.get('start_date'),
				end_date: formData.get('end_date'),
			};

			const response = await fetch(`/api/services/${id}`, {
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

			// console.log('✅ Service updated successfully');
			// Return success data directly (no type/data wrapper)
			return {
				message: result.message || 'Service updated successfully!'
			};

		} catch (error) {
			console.error('❌ Unexpected error in updateService:', error);
			return fail(500, {
				message: 'An unexpected error occurred while updating the service: ' + error.message
			});
		}
	},

	deleteService: async ({ params, fetch, locals: { supabase } }) => {
		const { id } = params;

		try {
			// Get current service data to delete associated image
			const currentServiceResponse = await fetch(`/api/services/${id}`);
			const currentService = currentServiceResponse.ok ? await currentServiceResponse.json() : null;

			// Delete associated image from storage if it exists
			if (currentService?.image_url) {
				const imagePath = currentService.image_url.split('/uploads/').pop();
				if (imagePath) {
					// console.log('🗑️ Deleting service image:', imagePath);
					await supabase.storage.from('uploads').remove([imagePath]);
				}
			}

			// Delete the service
			const response = await fetch(`/api/services/${id}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, result);
			}

			// console.log('✅ Service and associated files deleted successfully');
			// Redirect to services list after successful deletion
			throw redirect(303, '/services');

		} catch (error) {
			if (error.status === 303) {
				// Re-throw redirect
				throw error;
			}
			console.error('❌ Unexpected error in deleteService:', error);
			return fail(500, {
				message: 'An unexpected error occurred while deleting the service: ' + error.message
			});
		}
	}
};
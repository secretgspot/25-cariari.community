/** @type {import('./$types').PageServerLoad} */
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals: { getSession }, fetch }) {
	const { user, is_logged_in, is_admin } = await getSession();
	const { id } = params;
	const response = await fetch(`/api/lost-and-found/${id}`);

	if (!response.ok) {
		const result = await response.json();
		throw error(response.status, result.message || 'Could not fetch lost and found post');
	}

	const post = await response.json();

	return {
		post,
		user,
		is_logged_in,
		isOwner: user && (post.user_id === user.id || is_admin)
	};
}

export const actions = {
	updatePost: async ({ request, params, fetch, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const { id } = params;

		try {
			const formData = await request.formData();
			const imageFile = formData.get('image_file');

			// Get current post data to check for existing image
			const currentPostResponse = await fetch(`/api/lost-and-found/${id}`);
			const currentPost = currentPostResponse.ok ? await currentPostResponse.json() : null;

			let newImageUrl = currentPost?.image_url || null;

			// Handle file upload if provided
			if (imageFile && imageFile.size > 0) {
				// console.log('🔄 Processing lost and found image upload...');

				// Delete old image if it exists
				if (currentPost?.image_url) {
					const oldImagePath = currentPost.image_url.split('/uploads/').pop();
					if (oldImagePath) {
						// console.log('🗑️ Deleting old image:', oldImagePath);
						await supabase.storage.from('uploads').remove([oldImagePath]);
					}
				}

				// Generate unique filename with proper extension
				const fileExtension = imageFile.name.split('.').pop() || 'jpg';
				const fileName = `${session.user.id}_${Date.now()}.${fileExtension}`;
				const filePath = `lost-and-found/${fileName}`;

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
				date: formData.get('date'),
				location: formData.get('location') || null,
				contact: formData.get('contact'),
				image_url: newImageUrl
			};

			const response = await fetch(`/api/lost-and-found/${id}`, {
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

			// console.log('✅ Lost and Found post updated successfully');
			// Return success data directly (no type/data wrapper)
			return {
				message: result.message || 'Lost and Found post updated successfully!'
			};

		} catch (error) {
			console.error('❌ Unexpected error in updatePost:', error);
			return fail(500, {
				message: 'An unexpected error occurred while updating the post: ' + error.message
			});
		}
	},

	deletePost: async ({ params, fetch, locals: { supabase } }) => {
		const { id } = params;

		try {
			// Get current post data to delete associated image
			const currentPostResponse = await fetch(`/api/lost-and-found/${id}`);
			const currentPost = currentPostResponse.ok ? await currentPostResponse.json() : null;

			// Delete associated image from storage if it exists
			if (currentPost?.image_url) {
				const imagePath = currentPost.image_url.split('/uploads/').pop();
				if (imagePath) {
					// console.log('🗑️ Deleting lost and found image:', imagePath);
					await supabase.storage.from('uploads').remove([imagePath]);
				}
			}

			// Delete the post
			const response = await fetch(`/api/lost-and-found/${id}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, result);
			}

			// console.log('✅ Lost and Found post and associated files deleted successfully');
			// Redirect to lost-and-found list after successful deletion
			throw redirect(303, '/lost-and-found');

		} catch (error) {
			if (error.status === 303) {
				// Re-throw redirect
				throw error;
			}
			console.error('❌ Unexpected error in deletePost:', error);
			return fail(500, {
				message: 'An unexpected error occurred while deleting the post: ' + error.message
			});
		}
	}
};

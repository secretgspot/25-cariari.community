import { redirect, fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { getSession }, fetch }) {
	const { is_logged_in, is_admin } = await getSession();

	if (!is_logged_in || !is_admin) {
		throw redirect(303, '/login');
	}

	try {
		const response = await fetch('/api/ads');

		if (!response.ok) {
			console.error('Error fetching ads from API, status:', response.status);
			return { ads: [] };
		}

		const result = await response.json();

		const ads = Array.isArray(result) ? result : (result.ads || []);

		return { ads };
	} catch (error) {
		console.error('Error fetching ads in load function:', error);
		return { ads: [] };
	}
}

export const actions = {
	createAd: async ({ request, locals: { supabase, getSession } }) => {
		try {
			const { user, is_admin } = await getSession();
			if (!user || !is_admin) {
				return fail(401, { success: false, message: 'Unauthorized' });
			}

			const formData = await request.formData();
			const imageFile = formData.get('image_file');
			const title = formData.get('title');
			const href = formData.get('href');
			const width = parseInt(formData.get('width')) || 320;
			const height = parseInt(formData.get('height')) || 100;
			const weight = parseInt(formData.get('weight')) || 1;
			const active = formData.get('active') === 'true';

			let imageUrl = null;

			if (imageFile && imageFile.size > 0) {
				const fileExtension = imageFile.name.split('.').pop() || 'jpg';
				const fileName = `${user.id}_${Date.now()}.${fileExtension}`;
				const filePath = `ads/${fileName}`;

				const { data: uploadData, error: uploadError } = await supabase.storage
					.from('uploads')
					.upload(filePath, imageFile, {
						cacheControl: '3600',
						upsert: false
					});

				if (uploadError) {
					console.error('❌ Upload error:', uploadError);
					return fail(500, { success: false, message: 'Failed to upload image: ' + uploadError.message });
				}

				const { data: publicUrlData } = supabase.storage
					.from('uploads')
					.getPublicUrl(uploadData.path);
				imageUrl = publicUrlData.publicUrl;
			}

			const { data, error } = await supabase
				.from('ads')
				.insert({
					user_id: user.id, // Add this line - this was missing!
					file: imageUrl,
					title,
					href,
					width,
					height,
					weight,
					active
				})
				.select()
				.single();

			if (error) {
				console.error('Error creating ad:', error);
				return fail(500, { success: false, message: 'Failed to create ad: ' + error.message });
			}

			return { success: true, message: 'Ad created successfully!', ad: data };
		} catch (error) {
			console.error('Unexpected error in createAd:', error);
			return fail(500, { success: false, message: 'An unexpected error occurred' });
		}
	},

	updateAd: async ({ request, locals: { supabase, getSession } }) => {
		const { user, is_admin } = await getSession();
		if (!user || !is_admin) {
			return fail(401, { success: false, message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id');
		const imageFile = formData.get('image_file');
		const title = formData.get('title');
		const href = formData.get('href');
		const width = parseInt(formData.get('width')) || 320;
		const height = parseInt(formData.get('height')) || 100;
		const weight = parseInt(formData.get('weight')) || 1;
		const active = formData.get('active') === 'true';

		if (!id || id === 'null') {
			return fail(400, { success: false, message: 'Valid Ad ID is required' });
		}

		// Fetch the current ad
		const { data: currentAd, error: fetchError } = await supabase
			.from('ads')
			.select('file')
			.eq('id', id)
			.single();

		if (fetchError) {
			return fail(500, { success: false, message: 'Failed to retrieve current ad details' });
		}

		let updateObject = {
			title,
			href,
			width,
			height,
			weight,
			active,
			file: currentAd.file
		};

		if (imageFile && imageFile.size > 0) {
			const fileExtension = imageFile.name.split('.').pop() || 'jpg';
			const fileName = `${user.id}_${Date.now()}.${fileExtension}`;
			const filePath = `ads/${fileName}`;

			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('uploads')
				.upload(filePath, imageFile, {
					cacheControl: '3600',
					upsert: false
				});

			if (uploadError) {
				return fail(500, { success: false, message: 'Failed to upload new image' });
			}

			const { data: publicUrlData } = supabase.storage
				.from('uploads')
				.getPublicUrl(uploadData.path);

			updateObject.file = publicUrlData.publicUrl;

			if (currentAd.file) {
				try {
					const oldPath = currentAd.file.split('/uploads/').pop();
					if (oldPath) {
						await supabase.storage.from('uploads').remove([oldPath]);
					}
				} catch (e) {
					// Ignore cleanup errors
				}
			}
		}

		const { data, error } = await supabase
			.from('ads')
			.update(updateObject)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			return fail(500, { success: false, message: 'Failed to update ad' });
		}

		return { success: true, message: 'Ad updated successfully!', ad: data };
	},

	deleteAd: async ({ request, locals: { supabase, getSession } }) => {
		try {
			const { user, is_admin } = await getSession();
			if (!user || !is_admin) {
				return fail(401, { success: false, message: 'Unauthorized' });
			}

			const formData = await request.formData();
			const id = formData.get('id');

			if (!id) {
				return fail(400, { success: false, message: 'Ad ID is required' });
			}

			// Get the file name before deleting the ad entry
			const { data: ad, error: fetchError } = await supabase
				.from('ads')
				.select('file')
				.eq('id', id)
				.single();

			if (fetchError) {
				console.error('Error fetching ad for deletion:', fetchError);
				return fail(500, { success: false, message: 'Failed to fetch ad for deletion' });
			}

			const { error } = await supabase.from('ads').delete().eq('id', id);

			if (error) {
				console.error('Error deleting ad:', error);
				return fail(500, { success: false, message: 'Failed to delete ad: ' + error.message });
			}

			// Delete the associated file from storage
			if (ad.file) {
				try {
					const oldAdPath = ad.file.split('/uploads/').pop();
					const { error: deleteError } = await supabase.storage.from('uploads').remove([oldAdPath]);
					if (deleteError) {
						console.error('Failed to delete ad image from storage:', deleteError);
					}
				} catch (deleteErr) {
					console.error('Error parsing image path for deletion:', deleteErr);
				}
			}

			return { success: true, message: 'Ad deleted successfully!' };
		} catch (error) {
			console.error('Unexpected error in deleteAd:', error);
			return fail(500, { success: false, message: 'An unexpected error occurred' });
		}
	}
};
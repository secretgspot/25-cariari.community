import { json } from '@sveltejs/kit';

// GET a specific ad by ID
export async function GET({ params, locals: { supabase } }) {
	const { id } = params;

	try {
		const { data, error } = await supabase
			.from('ads')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error fetching ad:', error);
			return json({ message: 'Failed to fetch ad' }, { status: 500 });
		}

		if (!data) {
			return json({ message: 'Ad not found' }, { status: 404 });
		}

		return json(data, { status: 200 });
	} catch (err) {
		console.error('Unexpected error fetching ad:', err);
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
}

// PATCH (update) an ad
export async function PATCH({ request, params, locals: { supabase, getSession } }) {
	const { user, is_admin } = await getSession();
	if (!user || !is_admin) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;
	const formData = await request.formData();
	const file = formData.get('file');
	const title = formData.get('title');
	const href = formData.get('href');
	const width = formData.get('width');
	const height = formData.get('height');
	const weight = formData.get('weight');
	const tags = formData.get('tags')?.split(',').map(tag => tag.trim());
	const start_date = formData.get('start_date');
	const end_date = formData.get('end_date');
	const active = formData.get('active') === 'true';

	try {
		// Get the current ad to check the old file name
		const { data: currentAd, error: fetchError } = await supabase
			.from('ads')
			.select('file')
			.eq('id', id)
			.single();

		if (fetchError) {
			return json({ message: 'Failed to fetch ad for update' }, { status: 500 });
		}

		let filePath = currentAd.file;
		if (file) {
			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('uploads')
				.upload(`ads/${Date.now()}-${file.name}`, file);

			if (uploadError) {
				return json({ message: 'Failed to upload ad image' }, { status: 500 });
			}
			filePath = uploadData.path;

			// If the file has changed, delete the old one
			if (currentAd.file) {
					const oldAdPath = currentAd.file.split('/uploads/').pop();
					await supabase.storage.from('uploads').remove([oldAdPath]);
				}
		}

		const { data, error } = await supabase
			.from('ads')
			.update({
				file: filePath,
				title,
				href,
				width,
				height,
				weight,
				tags,
				start_date,
				end_date,
				active,
			})
			.eq('id', id)
			.select()
			.single();

		if (error) {
			return json({ message: 'Failed to update ad' }, { status: 500 });
		}

		return json(data, { status: 200 });
	} catch (err) {
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
}

// DELETE an ad

export async function DELETE({ params, locals: { supabase, getSession } }) {
	const { user, is_admin } = await getSession();
	if (!user || !is_admin) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;

	try {
		// Get the file name before deleting the ad entry
		const { data: ad, error: fetchError } = await supabase
			.from('ads')
			.select('file')
			.eq('id', id)
			.single();

		if (fetchError) {
			return json({ message: 'Failed to fetch ad for deletion' }, { status: 500 });
		}

		const { error } = await supabase.from('ads').delete().eq('id', id);

		if (error) {
			return json({ message: 'Failed to delete ad' }, { status: 500 });
		}

		// Delete the associated file from storage
		if (ad.file) {
			const oldAdPath = ad.file.split('/uploads/').pop();
			const { error: deleteError } = await supabase.storage.from('uploads').remove([oldAdPath]);
			if (deleteError) {
				console.error('Failed to delete ad image:', deleteError);
			}
		}

		return json({ message: 'Ad deleted successfully' }, { status: 200 });
	} catch (err) {
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
}



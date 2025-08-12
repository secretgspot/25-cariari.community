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
        console.error('Error fetching ads:', error);
        return { ads: [] };
    }
}

export const actions = {
    createAd: async ({ request, locals: { supabase, getSession } }) => {
        const { user, is_admin } = await getSession();
        if (!user || !is_admin) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const imageFile = formData.get('image_file');
        const title = formData.get('title');
        const href = formData.get('href');
        const width = formData.get('width');
        const height = formData.get('height');
        const weight = formData.get('weight');
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
                return fail(500, { message: 'Failed to upload image: ' + uploadError.message });
            }

            const { data: publicUrlData } = supabase.storage
                .from('uploads')
                .getPublicUrl(uploadData.path);
            imageUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('ads')
            .insert({
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
            return fail(500, { message: 'Failed to create ad: ' + error.message });
        }

        return { success: true, message: 'Ad created successfully!', ad: data };
    },

    updateAd: async ({ request, locals: { supabase, getSession } }) => {
        const { user, is_admin } = await getSession();
        if (!user || !is_admin) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const id = formData.get('id');
        const imageFile = formData.get('image_file');
        const title = formData.get('title');
        const href = formData.get('href');
        const width = formData.get('width');
        const height = formData.get('height');
        const weight = formData.get('weight');
        const active = formData.get('active') === 'true';

        // Fetch the current ad's image URL from the database
        const { data: currentAd, error: fetchCurrentAdError } = await supabase
            .from('ads')
            .select('file')
            .eq('id', id)
            .single();

        if (fetchCurrentAdError) {
            console.error('Error fetching current ad for update:', fetchCurrentAdError);
            return fail(500, { message: 'Failed to retrieve current ad details.' });
        }

        let updateObject = {
            title,
            href,
            width,
            height,
            weight,
            active
        };

        if (imageFile && imageFile.size > 0) {
            // New image provided, handle upload
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
                return fail(500, { message: 'Failed to upload new image: ' + uploadError.message });
            }

            const { data: publicUrlData } = supabase.storage
                .from('uploads')
                .getPublicUrl(uploadData.path);
            
            updateObject.file = publicUrlData.publicUrl; // Set file in updateObject only if new image is uploaded

            // Delete old image if it exists and is different from the new one
            if (currentAd.file && currentAd.file !== updateObject.file) {
                const oldAdPath = currentAd.file.split('/uploads/').pop();
                const { error: deleteError } = await supabase.storage.from('uploads').remove([oldAdPath]);
                if (deleteError) {
                    console.error('Failed to delete old ad image:', deleteError);
                }
            }
        } else {
            // No new image uploaded. Ensure the 'file' column retains its current value from the database.
            // This is crucial for NOT NULL constraints.
            updateObject.file = currentAd.file;
        }

        const { data, error } = await supabase
            .from('ads')
            .update(updateObject)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating ad:', error);
            return fail(500, { message: 'Failed to update ad: ' + error.message });
        }

        return { success: true, message: 'Ad updated successfully!', ad: data };
    },

    deleteAd: async ({ request, locals: { supabase, getSession } }) => {
        const { user, is_admin } = await getSession();
        if (!user || !is_admin) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const id = formData.get('id');

        // Get the file name before deleting the ad entry
        const { data: ad, error: fetchError } = await supabase
            .from('ads')
            .select('file')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching ad for deletion:', fetchError);
            return fail(500, { message: 'Failed to fetch ad for deletion' });
        }

        const { error } = await supabase.from('ads').delete().eq('id', id);

        if (error) {
            console.error('Error deleting ad:', error);
            return fail(500, { message: 'Failed to delete ad: ' + error.message });
        }

        // Delete the associated file from storage
        if (ad.file) {
            const oldAdPath = ad.file.split('/uploads/').pop();
            const { error: deleteError } = await supabase.storage.from('uploads').remove([oldAdPath]);
            if (deleteError) {
                console.error('Failed to delete ad image from storage:', deleteError);
            }
        }

        return { success: true, message: 'Ad deleted successfully!' };
    }
};
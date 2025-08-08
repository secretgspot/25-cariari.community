import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET({ params, locals: { supabase, getSession } }) {
	let session = await getSession();

	

	if (!session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { uuid } = params;

	try {
		// Execute all database queries in parallel for better performance
		const profileQuery = await supabase
				.from('profiles')
				.select('username, full_name, bio, avatar_url')
				.eq('user_id', uuid)
				.single();

		const { data: profile, error: profileError } = profileQuery;

		if (profileError || !profile) {
			console.error('Error fetching user profile:', profileError);
			return json({ message: 'User not found.' }, { status: 404 });
		}

		return json(
			{
				profile,
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error('Unexpected error fetching user details:', err);
		return json({ message: 'An unexpected error occurred while fetching user details.' }, { status: 500 });
	}
}

export async function DELETE({ params, locals: { supabase, getSession } }) {
    const session = await getSession();

    if (!session) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Assuming only admins can delete users
    const { data: { user: requestingUser } } = await supabaseAdmin.auth.admin.getUserById(session.user.id);

    if (!requestingUser || !requestingUser.app_metadata.admin) {
        return json({ message: 'Forbidden: Only administrators can delete users.' }, { status: 403 });
    }

    const { uuid } = params;

    try {
        // Delete user profile from 'profiles' table
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('user_id', uuid);

        if (profileError) {
            console.error('Error deleting user profile:', profileError);
            return json({ message: 'Failed to delete user profile.' }, { status: 500 });
        }

        // Delete the user from Supabase auth using the admin client
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(uuid);
        if (authError) {
            console.error('Error deleting user from auth:', authError);
            return json({ message: 'Failed to delete user from authentication.' }, { status: 500 });
        }

        return json({ message: 'User and associated profile deleted successfully.' }, { status: 200 });
    } catch (err) {
        console.error('Unexpected error deleting user:', err);
        return json({ message: 'An unexpected error occurred while deleting the user.' }, { status: 500 });
    }
}
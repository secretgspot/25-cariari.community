// /admin/+page.server.js
import { redirect, fail } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { getSession }, fetch }) {
	const session = await getSession();
	const { is_admin, user_id } = session;

	if (!is_admin) {
		throw redirect(303, '/');
	}

	if (!SUPABASE_SERVICE_ROLE_KEY) {
		console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
		throw fail(500, { message: 'Server configuration error: Supabase service role key is missing.' });
	}

	try {
		const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

		// Fetch users from profiles table and auth users in parallel
		const [usersResponse, authUsersResult] = await Promise.all([
			fetch('/api/users'),
			supabaseAdmin.auth.admin.listUsers()
		]);

		// Handle profiles response
		if (!usersResponse.ok) {
			console.error('Error fetching users from API, status:', usersResponse.status);
			return { users: [], error: 'Failed to fetch user profiles', currentUserId: user_id };
		}

		const usersData = await usersResponse.json();
		const profiles = Array.isArray(usersData) ? usersData : usersData.users || [];

		// Handle auth users response
		if (authUsersResult.error) {
			console.error('Error fetching auth users:', authUsersResult.error);
			return { users: [], error: 'Failed to fetch authentication data', currentUserId: user_id };
		}

		const authUsers = authUsersResult.data?.users || [];

		// Merge profile data with auth user data more efficiently
		const authUserMap = new Map(authUsers.map(user => [user.id, user]));

		const users = profiles.map(profile => {
			const authUser = authUserMap.get(profile.user_id);
			return {
				...profile,
				app_metadata: authUser?.app_metadata || {}
			};
		});

		return { users, currentUserId: user_id };
	} catch (error) {
		console.error('Error fetching data in load function:', error);
		return { users: [], error: 'An unexpected error occurred while loading users', currentUserId: user_id };
	}
}

export const actions = {
	makeAdmin: async ({ request, locals: { getSession } }) => {
		// Verify admin permissions for this action
		const session = await getSession();
		const { is_logged_in, is_admin, user_id: currentUserId } = session;

		if (!is_admin) {
			return fail(403, { message: 'Unauthorized: Admin access required' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId');

		// Validate input
		if (!userId || typeof userId !== 'string') {
			return fail(400, { message: 'Invalid user ID provided' });
		}

		if (!SUPABASE_SERVICE_ROLE_KEY) {
			console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
			return fail(500, { message: 'Server configuration error: Supabase service role key is missing.' });
		}

		try {
			const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

			// Fetch the user to get current app_metadata
			const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

			if (userError) {
				console.error('Error fetching user:', userError);
				return fail(404, { message: 'User not found: ' + userError.message });
			}

			if (!userData.user) {
				return fail(404, { message: 'User not found' });
			}

			const currentAdminStatus = userData.user.app_metadata?.admin || false;
			const newAdminStatus = !currentAdminStatus;

			// Update user metadata
			const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
				app_metadata: {
					...userData.user.app_metadata, // Preserve existing metadata
					admin: newAdminStatus
				}
			});

			if (updateError) {
				console.error('Error updating user claims:', updateError);
				return fail(500, { message: 'Failed to update user permissions: ' + updateError.message });
			}

			const action = newAdminStatus ? 'granted' : 'revoked';
			return {
				success: true,
				message: `Admin permissions ${action} successfully!`,
				newAdminStatus
			};
		} catch (err) {
			console.error('Unexpected error updating user claims:', err);
			return fail(500, { message: 'An unexpected error occurred while updating user permissions.' });
		}
	}
};
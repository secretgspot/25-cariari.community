# working admin claim toggle

```txt
<!-- UserManagement.svelte -->
<script>
 import { addToast } from '$lib/toasts';
 import Divider from '$lib/Divider.svelte';
 import Dialog from '$lib/Dialog.svelte';
 import Button from '$lib/buttons/Button.svelte';
 import Icon from '$lib/Icon.svelte';

 import { enhance } from '$app/forms';

 let formMessage = $state('');

 let { users = [] } = $props(); // Get users from props

 let userToDelete = $state(null);
 let loading = $state(false);
 let showDeleteDialog = $state(false);

 function confirmDelete(user) {
  userToDelete = user;
  showDeleteDialog = true;
 }



 async function deleteUser() {
  if (userToDelete) {
   try {
    const response = await fetch(`/api/users/${userToDelete.user_id}`, {
     method: 'DELETE',
    });
    if (!response.ok) {
     throw new Error(`HTTP error! status: ${response.status}`);
    }
    addToast({
     message: `${userToDelete.user_id} deleted successfully!`,
     type: 'success',
     timeout: 1200,
    });
    users = users.filter((user) => user.user_id !== userToDelete.user_id);
    userToDelete = null;
    showDeleteDialog = false;
   } catch (error) {
    addToast({
     message: `Failed to delete user, ${error}`,
     type: 'error',
     dismissible: true,
     timeout: 0,
    });
    console.error('Error deleting user:', error);
   }
  }
 }
</script>

<Divider>Users Management - ({users.length})</Divider>
{#if users.length > 0}
 <ul>
  {#each users as user (user.user_id)}
   <li>
    <div class="user">
     {#if user?.avatar_url}
      <img
       src={user.avatar_url}
       alt="{user?.username || 'User'} avatar"
       class="avatar" />
     {:else}
      <div class="placeholder-image">👤</div>
     {/if}
     <span>{user.username}</span>
     <span>{user.user_id}</span>
    </div>

    <form method="POST" action="?/makeAdmin" use:enhance={() => { return async ({ result, update }) => {
     if (result.type === 'success') {
      formMessage = result.data.message;
      // Update the user's admin status in the local 'users' array
      users = users.map(u =>
       u.user_id === user.user_id ? { ...u, app_metadata: { ...u.app_metadata, admin: result.data.newAdminStatus } } : u
      );
     } else if (result.type === 'error' || result.type === 'failure') {
      formMessage = result.data.message;
     }
     update();
    }; }} class="admin-toggle-form">
     <input type="hidden" name="userId" value={user.user_id} />
     <label>
      Admin:
      <input
       type="checkbox"
       name="adminStatus"
       checked={user.app_metadata.admin}
       onchange={(e) => e.target.form.requestSubmit()}
      />
     </label>
    </form>

    <Button
     size="icon"
     aria-label="Delete {user.username}"
     onclick={() => confirmDelete(user)}
     {loading}
     disabled={loading}>
     {#snippet icon()}
      <Icon kind="delete" size="12" />
     {/snippet}
    </Button>
   </li>
  {/each}
 </ul>
{:else}
 <p class="no-users">No users found.</p>
{/if}

<Dialog
 open={showDeleteDialog}
 title="Delete"
 message="You are about to delete user: {userToDelete?.username}. This action cannot be undone."
 type="confirm"
 onConfirm={deleteUser}
 onCancel={() => (showDeleteDialog = false)} />

<style>
 .user {
  font-size: small;
  display: flex;
  align-items: center;
  gap: var(--size-3);

  .avatar,
  .placeholder-image {
   aspect-ratio: 1;
   object-fit: cover;
   width: 30px;
   height: 30px;
   border-radius: var(--radius-blob-3);
  }
  .placeholder-image {
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: var(--radius-blob-3);
   background: var(--gray-3);
  }
 }

 .no-users {
  text-align: center;
 }

 ul {
  list-style: none;
  padding: 0;

  li {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: var(--size-2);
   border-bottom: var(--border-size-1) solid var(--surface-2);

   &:last-child {
    border-bottom: none;
   }

   &:hover {
    background-color: var(--surface-2);
   }
  }
 }
</style>
```

```txt
// /admin/+page.server.js
import { redirect, fail } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { getSession }, fetch }) {
 const { is_logged_in, is_admin } = await getSession();

 if (!is_logged_in || !is_admin) {
  throw redirect(303, '/login');
 }

 if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
  throw fail(500, { message: 'Server configuration error: Supabase service role key is missing.' });
 }

 try {
  const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch users from profiles table (via API)
  const usersResponse = await fetch('/api/users');
  if (!usersResponse.ok) {
   console.error('Error fetching users from API, status:', usersResponse.status);
   return { users: [] }; // Return empty array on error
  }
  const usersData = await usersResponse.json(); // Call .json() only once
  const profiles = Array.isArray(usersData) ? usersData : usersData.users || [];

  // Fetch users from Supabase auth.admin (for app_metadata)
  const { data: authUsersData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
  if (authUsersError) {
   console.error('Error fetching auth users:', authUsersError);
   return { users: [] }; // Return empty array on error
  }
  const authUsers = authUsersData.users || [];

  // Merge profile data with auth user data
  const users = profiles.map(profile => {
   const authUser = authUsers.find(au => au.id === profile.user_id);
   return {
    ...profile,
    app_metadata: authUser ? authUser.app_metadata : {}
   };
  });

  return { users };
 } catch (error) {
  console.error('Error fetching data in load function:', error);
  return { users: [] };
 }
}

export const actions = {
 // All ads-related actions have been removed
 makeAdmin: async ({ request }) => {
  const formData = await request.formData();
  const userId = formData.get('userId');

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
    return fail(500, { message: 'Failed to fetch user: ' + userError.message });
   }

   const currentAdminStatus = userData.user?.app_metadata?.admin || false;
   const newAdminStatus = !currentAdminStatus;

   const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: {
     admin: newAdminStatus
    }
   });

   if (error) {
    console.error('Error updating user claims:', error);
    return fail(500, { message: 'Failed to update user claims: ' + error.message });
   }

   return { success: true, message: 'User claims updated successfully!', newAdminStatus };
  } catch (err) {
   console.error('Unexpected error updating user claims:', err);
   return fail(500, { message: 'An unexpected error occurred while updating user claims.' });
  }
 }
};
```

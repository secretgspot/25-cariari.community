/** @type {import('./$types').PageServerLoad} */
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals: { getSession }, fetch }) {
  const { user, is_logged_in } = await getSession();
  const { id } = params;
  const response = await fetch(`/api/notices/${id}`);

  if (!response.ok) {
    const result = await response.json();
    throw error(response.status, result.message || 'Could not fetch notice');
  }

  const notice = await response.json();

  return { 
    notice, 
    user, 
    is_logged_in,
    isOwner: user && notice.user_id === user.id
  };
}

export const actions = {
  

  deleteNotice: async ({ params, fetch }) => {
    const { id } = params;
    const response = await fetch(`/api/notices/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      return fail(response.status, result);
    }

    // Redirect to notices list after successful deletion
    throw redirect(303, '/notices');
  }
};

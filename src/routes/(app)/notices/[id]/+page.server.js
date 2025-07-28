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
  updateNotice: async ({ request, params, fetch }) => {
    const { id } = params;
    const formData = await request.formData();
    
    const updateData = {
      title: formData.get('title'),
      content: formData.get('content'),
      image_url: formData.get('image_url') || null,
      category: formData.get('category') || null,
      tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
    };

    const response = await fetch(`/api/notices/${id}`, {
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

    return { success: true, message: result.message };
  },

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


/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ params, locals: { getSession }, fetch }) {
  const { user, is_logged_in } = await getSession();

  if (!is_logged_in) {
    throw redirect(303, '/login');
  }

  const { id } = params;
  const [serviceResponse, commentsResponse] = await Promise.all([
    fetch(`/api/services/${id}`),
    fetch(`/api/services/${id}/comments`),
  ]);

  const serviceResult = await serviceResponse.json();
  const commentsResult = await commentsResponse.json();

  if (!serviceResponse.ok) {
    console.error('Error fetching service from API:', serviceResult);
    return { service: null, comments: [] };
  }

  return {
    service: serviceResult.service,
    comments: commentsResult.comments || [],
    user,
    is_logged_in
  };
}

export const actions = {
  updateService: async ({ request, params, fetch }) => {
    const { id } = params;
    const formData = await request.formData();
    
    const updateData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      image_url: formData.get('image_url') || null,
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
    };

    const response = await fetch(`/api/services/${id}`, {
      method: 'PUT',
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

  deleteService: async ({ params, fetch }) => {
    const { id } = params;
    const response = await fetch(`/api/services/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      return fail(response.status, result);
    }

    // Redirect to services list after successful deletion
    throw redirect(303, '/services');
  },
  addComment: async ({ request, params, fetch }) => {
    const formData = await request.formData();
    const { id } = params;
    const response = await fetch(`/api/services/${id}/comments`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();

    if (!response.ok) {
      return fail(response.status, result);
    }

    return { success: true, message: result.message };
  },
};


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

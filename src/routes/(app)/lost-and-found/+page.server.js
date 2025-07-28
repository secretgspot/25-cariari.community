/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
  const { is_logged_in } = await getSession();

  if (!is_logged_in) {
    throw redirect(303, '/login');
  }

  const response = await fetch('/api/lost-and-found');
  const result = await response.json();

  if (!response.ok) {
    console.error('Error fetching lost and found posts from API:', result);
    return { posts: [] };
  }

  return { posts: result.posts };
}

export const actions = {
  createPost: async ({ request, fetch }) => {
    const formData = await request.formData();
    const response = await fetch('/api/lost-and-found', {
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
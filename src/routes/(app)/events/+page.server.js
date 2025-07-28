/** @type {import('./$types').PageServerLoad} */
import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals: { getSession }, fetch }) {
  const { is_logged_in } = await getSession();

  if (!is_logged_in) {
    throw redirect(303, '/login');
  }

  const response = await fetch('/api/events');
  const result = await response.json();

  if (!response.ok) {
    console.error('Error fetching events from API:', result);
    return { events: [] };
  }

  return { events: result.events };
}

export const actions = {
  createEvent: async ({ request, fetch }) => {
    const formData = await request.formData();
    const response = await fetch('/api/events', {
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
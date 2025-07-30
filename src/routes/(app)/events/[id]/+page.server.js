/** @type {import('./$types').PageServerLoad} */
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals: { getSession }, fetch }) {
  const { user, is_logged_in } = await getSession();
  const eventId = params.id; // Use params.id as the event ID
  const response = await fetch(`/api/events/${eventId}`);

  if (!response.ok) {
    const result = await response.json();
    throw error(response.status, result.message || 'Could not fetch event');
  }

  const event = await response.json();

  return { 
    event, 
    user, 
    is_logged_in,
    isOwner: user && event.user_id === user.id
  };
}

export const actions = {
  updateEvent: async ({ request, params, fetch }) => {
    const eventId = params.id;
    const formData = await request.formData();
    
    const updateData = {
      title: formData.get('title'),
      description: formData.get('description'),
      event_start_date: formData.get('event_start_date'),
      event_end_date: formData.get('event_end_date') || null,
      location: formData.get('location') || null,
      image_url: formData.get('image_url') || null,
      category: formData.get('category') || null
    };

    const response = await fetch(`/api/events/${eventId}`, {
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

  deleteEvent: async ({ params, fetch }) => {
    const eventId = params.id;
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      return fail(response.status, result);
    }

    // Redirect to events list after successful deletion
    throw redirect(303, '/events');
  }
};

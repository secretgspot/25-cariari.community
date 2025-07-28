<script>
  import { enhance } from '$app/forms';
  import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';

  let { data } = $props();

  let showForm = $state(false);
  let formMessage = $state('');
  let isSubmitting = $state(false);

  function toggleForm() {
    showForm = !showForm;
    formMessage = ''; // Clear message when toggling
  }

  const submitForm = () => {
    return async ({ result, update }) => {
      isSubmitting = false;
      
      if (result.type === 'success') {
        formMessage = result.data.message;
        showForm = false; // Hide form on success
      } else if (result.type === 'error') {
        formMessage = result.data.message || 'An error occurred';
      } else if (result.type === 'failure') {
        formMessage = result.data?.message || 'Form submission failed';
      }
      await update();
    };
  };

  function handleSubmit() {
    isSubmitting = true;
    formMessage = '';
  }
</script>

<div class="events-container">
  <h1>Community Events</h1>

  <button onclick={toggleForm} class="toggle-form-button">
    {showForm ? 'Hide Form' : 'Add New Event'}
  </button>

  {#if formMessage}
    <p class="form-message">{formMessage}</p>
  {/if}

  {#if showForm}
    <form method="POST" action="?/createEvent" use:enhance={submitForm} class="event-form" onsubmit={handleSubmit}>
      <label for="title">Title:</label>
      <input type="text" id="title" name="title" required disabled={isSubmitting} />

      <label for="description">Description (Markdown supported):</label>
      <textarea id="description" name="description" required disabled={isSubmitting} placeholder="Use **bold**, *italic*, and [links](url) for formatting"></textarea>

      <label for="event_start_date">Start Date:</label>
      <input type="datetime-local" id="event_start_date" name="event_start_date" required disabled={isSubmitting} />

      <label for="event_end_date">End Date (Optional):</label>
      <input type="datetime-local" id="event_end_date" name="event_end_date" disabled={isSubmitting} />

      <label for="location">Location (Optional):</label>
      <input type="text" id="location" name="location" disabled={isSubmitting} placeholder="Where is this event taking place?" />

      <label for="image_url">Image URL (Optional):</label>
      <input type="url" id="image_url" name="image_url" disabled={isSubmitting} placeholder="https://example.com/image.jpg" />

      <label for="category">Category (Optional):</label>
      <select id="category" name="category" disabled={isSubmitting}>
        <option value="">Select a category</option>
        <option value="cultural">Cultural</option>
        <option value="sports">Sports</option>
        <option value="workshop">Workshop</option>
        <option value="community-meeting">Community Meeting</option>
        <option value="social">Social</option>
        <option value="educational">Educational</option>
        <option value="other">Other</option>
      </select>

      <button type="submit" disabled={isSubmitting} class="submit-btn">
        {isSubmitting ? 'Creating Event...' : 'Create Event'}
      </button>
    </form>
  {/if}

  <div class="events-list">
    {#if data.events && data.events.length > 0}
      {#each data.events as event}
        <a href="/events/{event.slug}" class="event-card-link">
          <div class="event-card">
            <h3>{event.title}</h3>
            {#if event.image_url}
              <img src={event.image_url} alt={event.title} class="event-image" />
            {/if}
            <div class="event-description">{@html formatText(truncateText(stripMarkdown(event.description), 200))}</div>
            <p class="event-meta">
              <strong>Date:</strong> {new Date(event.event_start_date).toLocaleDateString()} {new Date(event.event_start_date).toLocaleTimeString()}
              {#if event.event_end_date}
                - {new Date(event.event_end_date).toLocaleDateString()} {new Date(event.event_end_date).toLocaleTimeString()}
              {/if}
            </p>
            {#if event.location}
              <p><strong>Location:</strong> {event.location}</p>
            {/if}
            {#if event.category}
              <p><strong>Category:</strong> {event.category}</p>
            {/if}
            <p class="event-date">Posted: {new Date(event.created_at).toLocaleDateString()}</p>
          </div>
        </a>
      {/each}
    {:else}
      <p>No events available yet.</p>
    {/if}
  </div>
</div>

<style>
  .events-container {
    max-width: 800px;
    margin: 2em auto;
    padding: 2em;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h1 {
    color: #333;
    margin-bottom: 1em;
  }

  .toggle-form-button {
    background-color: #007bff;
    color: white;
    padding: 0.8em 1.2em;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 1.5em;
  }

  .toggle-form-button:hover {
    background-color: #0056b3;
  }

  .form-message {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    padding: 1em;
    border-radius: 5px;
    margin-bottom: 1.5em;
  }

  .event-form label {
    display: block;
    margin-bottom: 0.5em;
    font-weight: bold;
  }

  .event-form input[type="text"],
  .event-form input[type="datetime-local"],
  .event-form input[type="url"],
  .event-form textarea,
  .event-form select {
    width: 100%;
    padding: 0.8em;
    margin-bottom: 1em;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .event-form textarea {
    min-height: 100px;
    resize: vertical;
  }

  .event-form button[type="submit"] {
    background-color: #28a745;
    color: white;
    padding: 0.8em 1.5em;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .event-form button[type="submit"]:hover {
    background-color: #218838;
  }

  .events-list {
    margin-top: 2em;
    display: grid;
    gap: 1.5em;
  }

  .event-card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5em;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .event-card h3 {
    color: #007bff;
    margin-top: 0;
    margin-bottom: 0.5em;
  }

  .event-card p {
    margin-bottom: 0.5em;
    color: #555;
  }

  .event-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin-bottom: 1em;
  }

  .event-date {
    font-size: 0.9em;
    color: #888;
  }

  .event-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .event-card-link:hover .event-card {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    transition: all 0.2s ease-in-out;
  }
</style>
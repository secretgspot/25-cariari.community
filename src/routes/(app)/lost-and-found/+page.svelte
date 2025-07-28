<script>
  import { enhance } from '$app/forms';

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
      if (result.type === 'success') {
        formMessage = result.data.message;
        showForm = false; // Hide form on success
        // Optionally, clear form fields here if needed
      } else if (result.type === 'error') {
        formMessage = result.data.message;
      } else if (result.type === 'failure') {
        formMessage = result.data.message;
      }
      update();
    };
  };
</script>

<div class="lost-and-found-container">
  <h1>Lost & Found</h1>

  <button on:click={toggleForm} class="toggle-form-button">
    {showForm ? 'Hide Form' : 'Add New Post'}
  </button>

  {#if formMessage}
    <p class="form-message">{formMessage}</p>
  {/if}

  {#if showForm}
    <form method="POST" action="?/createPost" use:enhance={submitForm} class="post-form">
      <label for="item_name">Item Name:</label>
      <input type="text" id="item_name" name="item_name" required />

      <label for="description">Description:</label>
      <textarea id="description" name="description" required></textarea>

      <label for="type">Type:</label>
      <select id="type" name="type" required>
        <option value="">Select Type</option>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <label for="date_lost_found">Date Lost/Found:</label>
      <input type="date" id="date_lost_found" name="date_lost_found" required />

      <label for="location_lost_found">Location Lost/Found (Optional):</label>
      <input type="text" id="location_lost_found" name="location_lost_found" />

      <label for="contact_info">Contact Info:</label>
      <input type="text" id="contact_info" name="contact_info" required />

      <label for="image_url">Image URL (Optional):</label>
      <input type="url" id="image_url" name="image_url" />

      <button type="submit">Submit Post</button>
    </form>
  {/if}

  <div class="posts-list">
    {#if data.posts && data.posts.length > 0}
      {#each data.posts as post}
        <a href="/lost-and-found/{post.id}" class="post-card-link">
          <div class="post-card">
            <h3>{post.item_name} ({post.type})</h3>
            <p>{post.description}</p>
            <p><strong>Date:</strong> {new Date(post.date_lost_found).toLocaleDateString()}</p>
            {#if post.location_lost_found}
              <p><strong>Location:</strong> {post.location_lost_found}</p>
            {/if}
            <p><strong>Contact:</strong> {post.contact_info}</p>
            {#if post.image_url}
              <img src={post.image_url} alt={post.item_name} class="post-image" />
            {/if}
            <p class="post-status">Status: {post.status}</p>
            <p class="post-date">Posted: {new Date(post.created_at).toLocaleDateString()}</p>
          </div>
        </a>
      {/each}
    {:else}
      <p>No lost and found posts available yet.</p>
    {/if}
  </div>
</div>

<style>
  .lost-and-found-container {
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

  .post-form label {
    display: block;
    margin-bottom: 0.5em;
    font-weight: bold;
  }

  .post-form input[type="text"],
  .post-form input[type="date"],
  .post-form input[type="url"],
  .post-form textarea,
  .post-form select {
    width: 100%;
    padding: 0.8em;
    margin-bottom: 1em;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box; /* Ensure padding doesn't increase width */
  }

  .post-form textarea {
    min-height: 100px;
    resize: vertical;
  }

  .post-form button[type="submit"] {
    background-color: #28a745;
    color: white;
    padding: 0.8em 1.5em;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .post-form button[type="submit"]:hover {
    background-color: #218838;
  }

  .posts-list {
    margin-top: 2em;
    display: grid;
    gap: 1.5em;
  }

  .post-card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5em;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .post-card h3 {
    color: #007bff;
    margin-top: 0;
    margin-bottom: 0.5em;
  }

  .post-card p {
    margin-bottom: 0.5em;
    color: #555;
  }

  .post-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin-top: 1em;
  }

  .post-status {
    font-weight: bold;
    color: #6c757d;
  }

  .post-date {
    font-size: 0.9em;
    color: #888;
  }

  .post-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .post-card-link:hover .post-card {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    transition: all 0.2s ease-in-out;
  }
</style>
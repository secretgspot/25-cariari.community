<script>
	import { invalidateAll } from '$app/navigation';
	import AddLostFoundForm from './AddLostFoundForm.svelte';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';

	let { data } = $props();

	console.log('/lost-and-found data: ', data);

	let showForm = $state(false);
	let formMessage = $state('');

	function toggleForm() {
		showForm = !showForm;
		formMessage = ''; // Clear message when toggling
	}

	async function handleLostAndFoundAdded(lostandfound) {
		formMessage = 'Lost/Found added successfully!';
		showForm = false; // Hide form after successful submission

		// Refresh the data from the server
		await invalidateAll();
	}
</script>

<div class="lost-and-found-container">
	<h1>Lost & Found</h1>

	<button onclick={toggleForm} class="toggle-form-button">
		{showForm ? 'Hide Form' : 'Add New Lost/Found'}
	</button>

	{#if formMessage}
		<p class="form-message">{formMessage}</p>
	{/if}

	{#if showForm}
		<AddLostFoundForm onLostAndFoundAdded={handleLostAndFoundAdded} />
	{/if}

	<div class="lost-and-found-list">
		{#if data.lostandfound && data.lostandfound.length > 0}
			{#each data.lostandfound as post}
				<a href="/lost-and-found/{post.id}" class="post-card-link">
					<div class="post-card">
						<h3>{post.title} ({post.category})</h3>
						<p>{post.description}</p>
						<p>
							<strong>Date:</strong>
							{new Date(post.date).toLocaleDateString()}
						</p>
						{#if post.location}
							<p><strong>Location:</strong> {post.location}</p>
						{/if}
						<p><strong>Contact:</strong> {post.contact}</p>
						{#if post.image_url}
							<img src={post.image_url} alt={post.title} class="post-image" />
						{/if}
						<p class="post-date">
							Posted: {new Date(post.created_at).toLocaleDateString()}
						</p>
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

	.lost-and-found-list {
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

<script>
	import { invalidateAll } from '$app/navigation';
	import AddLostFoundForm from './AddLostFoundForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';

	let { data } = $props();

	// console.log('/lost-and-found data: ', data);

	let showForm = $state(false);

	function toggleForm() {
		showForm = !showForm;
	}

	async function handleLostAndFoundAdded(lostandfound) {
		showForm = false; // Hide form after successful submission

		addToast({
			message: `Lost/Found added successfully!`,
			type: 'success',
			timeout: 1200,
		});

		// Refresh the data from the server
		await invalidateAll();
	}
</script>

<div class="lost-and-found-container">
	<h1>Lost & Found</h1>

	<Button onclick={toggleForm}>
		{#snippet icon()}
			➕
		{/snippet}
		{showForm ? 'Hide Form' : 'Add New Lost/Found'}
	</Button>

	{#if showForm}
		<AddLostFoundForm onLostAndFoundAdded={handleLostAndFoundAdded} />
	{/if}

	<div class="lost-and-found-list">
		{#if data.lostandfound && data.lostandfound.length > 0}
			{#each data.lostandfound as post}
				<a href="/lost-and-found/{post.id}" class="post-card-link">
					<div class="post-card">
						<h3>{post.title} ({post.category})</h3>
						<p>{@html formatText(truncateText(stripMarkdown(post.description), 200))}</p>
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
		h1 {
			color: #333;
			margin-bottom: 1em;
		}
	}

	.lost-and-found-list {
		margin-block: var(--size-6);
		display: grid;
		gap: var(--size-3);
	}

	.post-card {
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--radius-2);
		padding: var(--size-3);

		h3 {
			margin: 0;
			display: flex;
			align-items: center;
			gap: var(--size-3);
		}

		p {
			margin-bottom: 0.5em;
			color: #555;
		}
	}

	.post-image {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-2);
		margin-bottom: var(--size-6);
	}

	.post-date {
		font-size: 0.9em;
		color: var(--stone-9);
	}

	.post-card-link {
		text-decoration: none;
		color: inherit;
		display: block;

		&:hover .post-card {
			box-shadow: 0 2px var(--stone-9);
			transform: translateY(-3px);
		}
	}
</style>

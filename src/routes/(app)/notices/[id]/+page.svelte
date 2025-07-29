<script>
	import Comments from '$lib/Comments.svelte';
	import { formatText } from '$lib/utils/markdown.js';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data } = $props();

	async function updateNotice(event) {
		const formData = new FormData(event.target);

		const response = await fetch(event.target.action, {
			method: 'POST',
			body: formData,
		});

		if (response.ok) {
			// Refresh the page to show updated content
			window.location.reload();
		}
	}

	async function deleteNotice(event) {
		if (confirm('Are you sure you want to delete this notice?')) {
			const response = await fetch(event.target.action, {
				method: 'POST',
				body: new FormData(event.target),
			});

			if (response.ok) {
				goto('/notices');
			}
		}
	}
</script>

<div class="notice-detail-container">
	{#if data.notice}
		<h1>{data.notice.title}</h1>
		{#if data.notice.image_url}
			<img
				src={data.notice.image_url}
				alt={data.notice.title}
				class="notice-detail-image" />
		{/if}
		<div class="notice-description">{@html formatText(data.notice.content)}</div>
		{#if data.notice.category}
			<p><strong>Category:</strong> {data.notice.category}</p>
		{/if}
		{#if data.notice.tags && data.notice.tags.length > 0}
			<p><strong>Tags:</strong> {data.notice.tags.join(', ')}</p>
		{/if}
		<p class="notice-detail-date">
			Posted: {new Date(data.notice.created_at).toLocaleDateString()}
		</p>

		{#if data.isOwner}
			<details style="margin-top: 1em;">
				<summary>Manage Notice</summary>
				<form method="POST" action="?/updateNotice" onsubmit={updateNotice}>
					<input
						type="text"
						name="title"
						bind:value={data.notice.title}
						placeholder="Title"
						required
						class="input" />
					<textarea
						name="content"
						bind:value={data.notice.content}
						placeholder="Content"
						required
						class="textarea"></textarea>
					<button type="submit" class="button">Update</button>
				</form>
				<form
					method="POST"
					action="?/deleteNotice"
					onsubmit={deleteNotice}
					style="margin-top: 1em;">
					<button type="submit" class="button is-danger">Delete</button>
				</form>
			</details>
		{/if}

		<Comments parentId={data.notice.id} type="news_id" userData={data} />
	{:else}
		<p>Notice not found.</p>
	{/if}
</div>

<style>
	.notice-detail-container {
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

	.notice-detail-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1em;
	}

	.notice-detail-date {
		font-size: 0.9em;
		color: #555;
	}

	details {
		background-color: #f0f0f0;
		padding: 1em;
		border-radius: 4px;
		margin-top: 1em;
	}

	summary {
		cursor: pointer;
		font-weight: bold;
		margin-bottom: 1em;
	}

	.input,
	.textarea {
		width: 100%;
		padding: 0.5em;
		margin-bottom: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-family: inherit;
	}

	.textarea {
		min-height: 100px;
		resize: vertical;
	}

	.button {
		padding: 0.5em 1em;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
		background-color: #007bff;
		color: white;
	}

	.button:hover {
		background-color: #0056b3;
	}

	.button.is-danger {
		background-color: #dc3545;
	}

	.button.is-danger:hover {
		background-color: #c82333;
	}
</style>

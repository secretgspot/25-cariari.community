<script>
	import Comments from '$lib/Comments.svelte';
	import ManageLostAndFound from './ManageLostAndFound.svelte';
	import { formatText } from '$lib/utils/markdown.js';
	import { timeFrom } from '$lib/utils/time.js';

	let { data } = $props();
</script>

<div class="post-detail-container">
	{#if data.post}
		<h1>{data.post.title} ({data.post.category})</h1>
		{#if data.post.image_url}
			<img src={data.post.image_url} alt={data.post.title} class="post-detail-image" />
		{/if}
		<p>{@html formatText(data.post.description)}</p>
		<p class="post-detail-meta">
			<strong>Date Lost/Found:</strong>
			{new Date(data.post.date).toLocaleDateString()}
		</p>
		{#if data.post.location}
			<p><strong>Location:</strong> {data.post.location}</p>
		{/if}
		<p><strong>Contact:</strong> {data.post.contact}</p>
		<p class="post-detail-date">
			Posted: {new Date(data.post.created_at).toLocaleDateString()}
		</p>

		<ManageLostAndFound post={data.post} isOwner={data.isOwner} />

		<Comments parentId={data.post.id} type="lost_and_found_id" userData={data} />
	{:else}
		<p>Post not found.</p>
	{/if}
</div>

<style>
	.post-detail-container {
	}

	h1 {
		color: #333;
		margin-bottom: 1em;
	}

	.post-detail-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1em;
	}

	.post-detail-meta,
	.post-detail-date {
		font-size: 0.9em;
		color: #555;
	}
</style>

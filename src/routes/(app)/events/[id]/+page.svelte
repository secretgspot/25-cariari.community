<script>
	import Comments from '$lib/Comments.svelte';
	import ManageEvent from './ManageEvent.svelte';
	import { formatText } from '$lib/utils/markdown.js';

	let { data } = $props();
	console.log('Event/[id] data: ', data);
</script>

<div class="event-detail-container">
	{#if data.event}
		<h1>{data.event.title}</h1>
		{#if data.event.image_url}
			<img src={data.event.image_url} alt={data.event.title} class="event-detail-image" />
		{/if}
		<div class="event-description">{@html formatText(data.event.description)}</div>
		<p class="event-detail-meta">
			<strong>Date:</strong>
			{new Date(data.event.event_start_date).toLocaleDateString()}
			{new Date(data.event.event_start_date).toLocaleTimeString()}
			{#if data.event.event_end_date}
				- {new Date(data.event.event_end_date).toLocaleDateString()}
				{new Date(data.event.event_end_date).toLocaleTimeString()}
			{/if}
		</p>
		{#if data.event.location}
			<p><strong>Location:</strong> {data.event.location}</p>
		{/if}
		{#if data.event.category}
			<p><strong>Category:</strong> {data.event.category}</p>
		{/if}
		<p class="event-detail-date">
			Posted: {new Date(data.event.created_at).toLocaleDateString()}
		</p>

		<ManageEvent event={data.event} isOwner={data.isOwner} />

		<Comments parentId={data.event.id} type="event_id" userData={data} />
	{:else}
		<p>Event not found.</p>
	{/if}
</div>

<style>
	.event-detail-container {
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

	.event-detail-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1em;
	}

	.event-detail-meta,
	.event-detail-date {
		font-size: 0.9em;
		color: #555;
	}
</style>

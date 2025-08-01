<script>
	import Comments from '$lib/Comments.svelte';
	import ManageService from './ManageService.svelte';
	import { formatText } from '$lib/utils/markdown.js';

	let { data } = $props();
</script>

<div class="service-detail-container">
	{#if data.service}
		<h1>{data.service.title}</h1>
		{#if data.service.image_url}
			<img
				src={data.service.image_url}
				alt={data.service.title}
				class="service-detail-image" />
		{/if}
		<p class="service-content">{data.service.description}</p>
		{#if data.service.category}
			<p><strong>Category:</strong> {data.service.category}</p>
		{/if}
		<p class="service-detail-date">
			Posted on: {new Date(data.service.created_at).toLocaleDateString()}
		</p>

		<ManageService service={data.service} isOwner={data.isOwner} />

		<Comments parentId={data.service.id} type="service_id" userData={data} />
	{:else}
		<p>Service not found.</p>
	{/if}
</div>

<style>
	.service-detail-container {
	}

	h1 {
		color: #333;
		margin-bottom: 1em;
	}

	.service-detail-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1em;
	}

	.service-detail-date {
		font-size: 0.9em;
		color: #555;
	}
</style>

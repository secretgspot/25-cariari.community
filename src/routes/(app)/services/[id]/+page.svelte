<script>
	import Comments from '$lib/Comments.svelte';
	import ManageService from './ManageService.svelte';
	import { formatText } from '$lib/utils/markdown.js';
	import { timeFrom } from '$lib/utils/time.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.service.title} - Services - Cariari Community</title>
	<meta name="description" content={data.service.description} />
</svelte:head>

<div class="service-detail-container">
	{#if data.service}
		<h1>{data.service.title}</h1>

		<div class="meta">
			<span>Posted: {timeFrom(data.service.start_date)}</span>
			<span>Expires: {timeFrom(data.service.end_date)}</span>
		</div>
		{#if data.service.image_url}
			<img src={data.service.image_url} alt={data.service.title} class="image" />
		{/if}

		<div class="description">{@html formatText(data.service.description)}</div>

		{#if data.service.category}
			<span class="category">{data.service.category}</span>
		{/if}

		<ManageService service={data.service} isOwner={data.isOwner} />

		<Comments parentId={data.service.id} type="service_id" userData={data} />
	{:else}
		<p>Service not found.</p>
	{/if}
</div>

<style>
	.service-detail-container {
		position: relative;
		h1 {
			margin-bottom: var(--size-3);
		}

		.category {
			position: absolute;
			top: 0;
			right: 0;
		}

		.meta {
			display: flex;
			justify-content: space-between;
			font-size: small;
			color: var(--stone-9);
			margin-inline: var(--size-3);
			margin-block: var(--size-1);
		}

		.image {
			max-width: 100%;
			width: 100%;
			height: auto;
			border-radius: var(--radius-2);
			margin-bottom: 0;
		}

		.description {
			margin-block: var(--size-3);
		}
	}
</style>

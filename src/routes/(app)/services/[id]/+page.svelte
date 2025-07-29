<script>
	import { enhance } from '$app/forms';
	import Comments from '$lib/Comments.svelte';

	let { data } = $props();
	let { service, comments } = data;

	let formMessage = $state('');
	let isSubmitting = $state(false);

	const submitCommentForm = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				formMessage = result.data.message;
			} else if (result.type === 'error') {
				formMessage = result.data.message;
			} else if (result.type === 'failure') {
				formMessage = result.data.message;
			}
			update();
		};
	};
</script>

<div class="service-detail-container">
	{#if service}
		<article class="service-article">
			<h1>{service.title}</h1>
			{#if service.image_url}
				<img src={service.image_url} alt={service.title} class="service-image" />
			{/if}
			<p class="service-content">{service.description}</p>
			{#if service.category}
				<p><strong>Category:</strong> {service.category}</p>
			{/if}
			<p class="service-date">
				Posted on: {new Date(service.created_at).toLocaleDateString()}
			</p>
		</article>

		<Comments parentId={service.id} type="service_id" userData={data} />
	{:else}
		<p>Service not found.</p>
	{/if}
</div>

<style>
	.service-detail-container {
		max-width: 800px;
		margin: 2em auto;
		padding: 2em;
		background-color: #f9f9f9;
		border-radius: 8px;
	}

	.service-article {
		margin-bottom: 2em;
	}

	.service-image {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		margin-bottom: 1em;
	}

	.service-content {
		line-height: 1.6;
		color: #333;
	}

	.service-date {
		font-size: 0.9em;
		color: #888;
		margin-top: 1em;
	}
</style>

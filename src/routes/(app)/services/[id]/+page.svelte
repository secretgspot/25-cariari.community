<script>
	import Comments from '$lib/Comments.svelte';
	import ManageService from './ManageService.svelte';
	import { formatText } from '$lib/utils/markdown.js';

	let { data } = $props();
	console.log('Service/[id] data: ', data);
</script>

<div class="service-detail-container">
	{#if data.service}
		<h1>{data.service.title}</h1>
		{#if data.service.image_url}
			<img src={data.service.image_url} alt={data.service.title} class="service-image" />
		{/if}
		<p class="service-content">{data.service.description}</p>
		{#if data.service.category}
			<p><strong>Category:</strong> {data.service.category}</p>
		{/if}
		<p class="service-date">
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

	.service-detail-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1em;
	}

	.service-detail-meta,
	.service-detail-date {
		font-size: 0.9em;
		color: #555;
	}

	.service-actions {
		margin: 2em 0;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 0;
		background-color: #fff;
	}

	.service-actions summary {
		padding: 1em;
		cursor: pointer;
		background-color: #f8f9fa;
		border-radius: 8px 8px 0 0;
		font-weight: bold;
		color: #495057;
	}

	.service-actions summary:hover {
		background-color: #e9ecef;
	}

	.service-actions[open] summary {
		border-bottom: 1px solid #ddd;
		border-radius: 8px 8px 0 0;
	}

	.edit-form {
		padding: 1.5em;
		border-bottom: 1px solid #eee;
	}

	.delete-form {
		padding: 1em 1.5em;
		text-align: center;
	}

	.edit-form h3 {
		margin-top: 0;
		margin-bottom: 1em;
		color: #333;
	}

	.edit-form label {
		display: block;
		margin-bottom: 0.5em;
		font-weight: bold;
		color: #555;
	}

	.edit-form input,
	.edit-form textarea,
	.edit-form select {
		width: 100%;
		padding: 0.8em;
		margin-bottom: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
		font-family: inherit;
	}

	.edit-form textarea {
		min-height: 100px;
		resize: vertical;
	}

	.form-actions {
		display: flex;
		gap: 1em;
		margin-top: 1.5em;
	}

	.update-btn {
		background-color: #28a745;
		color: white;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-weight: bold;
	}

	.update-btn:hover:not(:disabled) {
		background-color: #218838;
	}

	.update-btn:disabled {
		background-color: #6c757d;
		cursor: not-allowed;
	}

	.delete-btn {
		background-color: #dc3545;
		color: white;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-weight: bold;
	}

	.delete-btn:hover {
		background-color: #c82333;
	}

	.form-message {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 1em;
		border-radius: 5px;
		margin-bottom: 1em;
	}
</style>

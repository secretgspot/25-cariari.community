<script>
	import { enhance } from '$app/forms';
	import Comments from '$lib/Comments.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let formMessage = $state('');
	let isSubmitting = $state(false);

	// Initialize form data with current service data
	let editFormData = $state({
		title: data.service?.title || '',
		description: data.service?.description || '',
		category: data.service?.category || '',
		image_url: data.service?.image_url || '',
		start_date: data.service?.start_date ? new Date(data.service.start_date).toISOString().slice(0, 10) : '',
		end_date: data.service?.end_date ? new Date(data.service.end_date).toISOString().slice(0, 10) : '',
	});

	const submitUpdateForm = () => {
		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				formMessage = result.data.message;
			} else if (result.type === 'error') {
				formMessage = result.data.message || 'An error occurred';
			} else if (result.type === 'failure') {
				formMessage = result.data?.message || 'Update failed';
			}
			await update();
		};
	};

	const submitDeleteForm = () => {
		return async ({ result }) => {
			if (result.type === 'failure') {
				formMessage = result.data?.message || 'Delete failed';
			} else if (result.type === 'success') {
				// Redirect is handled by the server action on success
			}
		};
	};

	function handleUpdateSubmit() {
		isSubmitting = true;
		formMessage = '';
	}

	function handleDelete() {
		return confirm('Are you sure you want to delete this service? This action cannot be undone.');
	}
</script>

<div class="service-detail-container">
	{#if data.service}
		<article class="service-article">
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
		</article>

		<!-- Edit/Delete section for service owner -->
		{#if data.isOwner}
			<details class="service-actions">
				<summary>Manage Service</summary>

				{#if formMessage}
					<p class="form-message">{formMessage}</p>
				{/if}

				<form
					method="POST"
					action="?/updateService"
					use:enhance={submitUpdateForm}
					class="edit-form"
					onsubmit={handleUpdateSubmit}>
					<h3>Edit Service</h3>

					<label for="title">Title:</label>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={editFormData.title}
						required
						disabled={isSubmitting} />

					<label for="description">Description (Markdown supported):</label>
					<textarea
						id="description"
						name="description"
						bind:value={editFormData.description}
						required
						disabled={isSubmitting}
						placeholder="Use **bold**, *italic*, and [links](url) for formatting"></textarea>

					<label for="category">Category:</label>
					<select
						id="category"
						name="category"
						bind:value={editFormData.category}
						required
						disabled={isSubmitting}>
						<option value="offering">Offering</option>
						<option value="wanted">Wanted</option>
					</select>

					<label for="image_url">Image URL (Optional):</label>
					<input
						type="url"
						id="image_url"
						name="image_url"
						bind:value={editFormData.image_url}
						disabled={isSubmitting} />

					<label for="start_date">Start Date:</label>
					<input
						type="date"
						id="start_date"
						name="start_date"
						bind:value={editFormData.start_date}
						disabled={isSubmitting} />

					<label for="end_date">End Date (Optional):</label>
					<input
						type="date"
						id="end_date"
						name="end_date"
						bind:value={editFormData.end_date}
						disabled={isSubmitting} />

					<div class="form-actions">
						<button type="submit" disabled={isSubmitting} class="update-btn">
							{isSubmitting ? 'Updating...' : 'Update Service'}
						</button>
					</div>
				</form>

				<form
					method="POST"
					action="?/deleteService"
					use:enhance={submitDeleteForm}
					class="delete-form">
					<button type="submit" class="delete-btn" onclick={handleDelete}>
						Delete Service
					</button>
				</form>
			</details>
		{/if}

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

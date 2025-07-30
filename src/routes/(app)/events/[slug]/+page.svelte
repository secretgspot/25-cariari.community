<script>
	import Comments from '$lib/Comments.svelte';
	import { formatText } from '$lib/utils/markdown.js';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let formMessage = $state('');
	let isSubmitting = $state(false);

	// Category options matching the add form structure
	const categoryOptions = [
		'Cultural',
		'Sports',
		'Workshop',
		'Community Meeting',
		'Social',
		'Educational',
		'Other',
	];

	// Initialize form data with current event data
	let editFormData = $state({
		title: data.event?.title || '',
		description: data.event?.description || '',
		event_start_date: data.event?.event_start_date
			? new Date(data.event.event_start_date).toISOString().slice(0, 16)
			: '',
		event_end_date: data.event?.event_end_date
			? new Date(data.event.event_end_date).toISOString().slice(0, 16)
			: '',
		location: data.event?.location || '',
		image_url: data.event?.image_url || '',
		category: data.event?.category || '',
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
			// Delete form handles redirect automatically if successful
			if (result.type === 'failure') {
				formMessage = result.data?.message || 'Delete failed';
			}
		};
	};

	function handleUpdateSubmit() {
		isSubmitting = true;
		formMessage = '';
	}

	function handleDelete() {
		return confirm(
			'Are you sure you want to delete this event? This action cannot be undone.',
		);
	}
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

		<!-- Edit/Delete section for event owner -->
		{#if data.isOwner}
			<details class="event-actions">
				<summary>Manage Event</summary>

				{#if formMessage}
					<p class="form-message">{formMessage}</p>
				{/if}

				<form
					method="POST"
					action="?/updateEvent"
					use:enhance={submitUpdateForm}
					class="edit-form"
					onsubmit={handleUpdateSubmit}>
					<h3>Edit Event</h3>

					<div class="form-group">
						<label for="title" class="form-label">Title</label>
						<input
							type="text"
							id="title"
							name="title"
							bind:value={editFormData.title}
							required
							disabled={isSubmitting}
							class="form-input" />
					</div>

					<div class="form-group">
						<label for="description" class="form-label"
							>Description (supports Markdown)</label>
						<textarea
							id="description"
							name="description"
							bind:value={editFormData.description}
							required
							disabled={isSubmitting}
							rows="5"
							placeholder="Use **bold**, *italic*, and [links](url) for formatting"
							class="form-textarea"></textarea>
					</div>

					<div class="form-group">
						<label for="event_start_date" class="form-label">Start Date (Required)</label>
						<input
							type="datetime-local"
							id="event_start_date"
							name="event_start_date"
							bind:value={editFormData.event_start_date}
							required
							disabled={isSubmitting}
							class="form-input" />
					</div>

					<div class="form-group">
						<label for="event_end_date" class="form-label">End Date (Optional)</label>
						<input
							type="datetime-local"
							id="event_end_date"
							name="event_end_date"
							bind:value={editFormData.event_end_date}
							disabled={isSubmitting}
							class="form-input" />
					</div>

					<div class="form-group">
						<label for="location" class="form-label">Location (Optional)</label>
						<input
							type="text"
							id="location"
							name="location"
							bind:value={editFormData.location}
							disabled={isSubmitting}
							class="form-input" />
					</div>

					<div class="form-group">
						<label for="image_url" class="form-label">Image URL (Optional)</label>
						<input
							type="text"
							id="image_url"
							name="image_url"
							bind:value={editFormData.image_url}
							disabled={isSubmitting}
							class="form-input" />
					</div>

					<div class="form-group">
						<label for="category" class="form-label">Category</label>
						<select
							id="category"
							name="category"
							bind:value={editFormData.category}
							disabled={isSubmitting}
							class="form-select">
							<option value="">Select a category</option>
							{#each categoryOptions as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
					</div>

					<div class="form-actions">
						<button type="submit" disabled={isSubmitting} class="update-btn">
							{isSubmitting ? 'Updating...' : 'Update Event'}
						</button>
					</div>
				</form>

				<form
					method="POST"
					action="?/deleteEvent"
					use:enhance={submitDeleteForm}
					class="delete-form">
					<button type="submit" class="delete-btn" onclick={handleDelete}>
						Delete Event
					</button>
				</form>
			</details>
		{/if}

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

	.event-actions {
		margin: 2em 0;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 0;
		background-color: #fff;
	}

	.event-actions summary {
		padding: 1em;
		cursor: pointer;
		background-color: #f8f9fa;
		border-radius: 8px 8px 0 0;
		font-weight: bold;
		color: #495057;
	}

	.event-actions summary:hover {
		background-color: #e9ecef;
	}

	.event-actions[open] summary {
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
		margin-bottom: 1.5em;
		color: #333;
		font-size: 1.25em;
		font-weight: 600;
	}

	.form-group {
		margin-bottom: 1.5em;
	}

	.form-label {
		display: block;
		font-size: 0.9em;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5em;
	}

	.form-input,
	.form-textarea,
	.form-select {
		width: 100%;
		padding: 0.75em;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.9em;
		box-sizing: border-box;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.form-input:focus,
	.form-textarea:focus,
	.form-select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.form-textarea {
		resize: vertical;
		min-height: 120px;
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

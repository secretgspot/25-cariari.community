<script>
	import Comments from '$lib/Comments.svelte';
	import { formatText } from '$lib/utils/markdown.js';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let formMessage = $state('');
	let isSubmitting = $state(false);

	// Initialize form data with current notice data
	let editFormData = $state({
		title: data.notice?.title || '',
		description: data.notice?.description || '',
		urgency: data.notice?.urgency || 'Default',
		start_date: data.notice?.start_date
			? new Date(data.notice.start_date).toISOString().slice(0, 10)
			: '',
		end_date: data.notice?.end_date
			? new Date(data.notice.end_date).toISOString().slice(0, 10)
			: '',
	});

	const urgencyOptions = ['Default', 'Low', 'Medium', 'High'];

	const submitDeleteForm = () => {
		return async ({ result }) => {
			if (result.type === 'failure') {
				formMessage = result.data?.message || 'Delete failed';
			} else if (result.type === 'success') {
				// Redirect is handled by the server action on success
			}
		};
	};

	async function handleUpdateSubmit(event) {
		event.preventDefault(); // Manually prevent default form submission
		isSubmitting = true;
		formMessage = '';

		

		try {
			const response = await fetch(`/api/notices/${data.notice.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(editFormData),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Failed to update notice.');
			}

			formMessage = result.message;
			// Update the data object to reflect changes immediately
			data.notice = { ...data.notice, ...editFormData };
		} catch (e) {
			formMessage = e.message;
			console.error('Error updating notice:', e);
		} finally {
			isSubmitting = false;
		}
	}

	function handleDelete() {
		return confirm(
			'Are you sure you want to delete this notice? This action cannot be undone.',
		);
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
		<div class="notice-description">{@html formatText(data.notice.description)}</div>
		{#if data.notice.category}
			<p><strong>Category:</strong> {data.notice.category}</p>
		{/if}
		{#if data.notice.tags && data.notice.tags.length > 0}
			<p><strong>Tags:</strong> {data.notice.tags.join(', ')}</p>
		{/if}
		<p class="notice-detail-date">
			Posted: {new Date(data.notice.created_at).toLocaleDateString()}
		</p>

		<!-- Edit/Delete section for notice owner -->
		{#if data.isOwner}
			<details class="notice-actions">
				<summary>Manage Notice</summary>

				{#if formMessage}
					<p class="form-message">{formMessage}</p>
				{/if}

				<form
					class="edit-form"
					onsbmit={handleUpdateSubmit}>
					<h3>Edit Notice</h3>

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
						placeholder="Use **bold**, *italic*, and [links](url) for formatting"
					></textarea>

					<label for="urgency">Urgency:</label>
					<select
						id="urgency"
						name="urgency"
						bind:value={editFormData.urgency}
						disabled={isSubmitting}
					>
						{#each urgencyOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>

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
							{isSubmitting ? 'Updating...' : 'Update Notice'}
						</button>
					</div>
				</form>

				<form
					method="POST"
					action="?/deleteNotice"
					use:enhance={submitDeleteForm}
					class="delete-form">
					<button type="submit" class="delete-btn" onclick={handleDelete}>
						Delete Notice
					</button>
				</form>
			</details>
		{/if}

		<Comments parentId={data.notice.id} type="notice_id" userData={data} />
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

	.notice-actions {
		margin: 2em 0;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 0;
		background-color: #fff;
	}

	.notice-actions summary {
		padding: 1em;
		cursor: pointer;
		background-color: #f8f9fa;
		border-radius: 8px 8px 0 0;
		font-weight: bold;
		color: #495057;
	}

	.notice-actions summary:hover {
		background-color: #e9ecef;
	}

	.notice-actions[open] summary {
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

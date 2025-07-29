<script>
	import Comments from '$lib/Comments.svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let formMessage = $state('');
	let isSubmitting = $state(false);

	// Initialize form data with current post data
	let editFormData = $state({
		item_name: data.post?.item_name || '',
		description: data.post?.description || '',
		type: data.post?.type || '',
		date_lost_found: data.post?.date_lost_found
			? new Date(data.post.date_lost_found).toISOString().split('T')[0]
			: '',
		location_lost_found: data.post?.location_lost_found || '',
		contact_info: data.post?.contact_info || '',
		image_url: data.post?.image_url || '',
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
			'Are you sure you want to delete this post? This action cannot be undone.',
		);
	}
</script>

<div class="post-detail-container">
	{#if data.post}
		<h1>{data.post.item_name} ({data.post.type})</h1>
		{#if data.post.image_url}
			<img
				src={data.post.image_url}
				alt={data.post.item_name}
				class="post-detail-image" />
		{/if}
		<p>{data.post.description}</p>
		<p class="post-detail-meta">
			<strong>Date Lost/Found:</strong>
			{new Date(data.post.date_lost_found).toLocaleDateString()}
		</p>
		{#if data.post.location_lost_found}
			<p><strong>Location:</strong> {data.post.location_lost_found}</p>
		{/if}
		<p><strong>Contact:</strong> {data.post.contact_info}</p>
		<p class="post-detail-date">
			Posted: {new Date(data.post.created_at).toLocaleDateString()}
		</p>

		<!-- Edit/Delete section for post owner -->
		{#if data.isOwner}
			<details class="post-actions">
				<summary>Manage Post</summary>

				{#if formMessage}
					<p class="form-message">{formMessage}</p>
				{/if}

				<form
					method="POST"
					action="?/updatePost"
					use:enhance={submitUpdateForm}
					class="edit-form"
					onsubmit={handleUpdateSubmit}>
					<h3>Edit Lost & Found Post</h3>

					<label for="item_name">Item Name:</label>
					<input
						type="text"
						id="item_name"
						name="item_name"
						bind:value={editFormData.item_name}
						required
						disabled={isSubmitting} />

					<label for="description">Description:</label>
					<textarea
						id="description"
						name="description"
						bind:value={editFormData.description}
						required
						disabled={isSubmitting}></textarea>

					<label for="type">Type:</label>
					<select
						id="type"
						name="type"
						bind:value={editFormData.type}
						required
						disabled={isSubmitting}>
						<option value="lost">Lost</option>
						<option value="found">Found</option>
					</select>

					<label for="date_lost_found">Date Lost/Found:</label>
					<input
						type="date"
						id="date_lost_found"
						name="date_lost_found"
						bind:value={editFormData.date_lost_found}
						required
						disabled={isSubmitting} />

					<label for="location_lost_found">Location:</label>
					<input
						type="text"
						id="location_lost_found"
						name="location_lost_found"
						bind:value={editFormData.location_lost_found}
						disabled={isSubmitting} />

					<label for="contact_info">Contact Info:</label>
					<input
						type="text"
						id="contact_info"
						name="contact_info"
						bind:value={editFormData.contact_info}
						required
						disabled={isSubmitting} />

					<label for="image_url">Image URL (Optional):</label>
					<input
						type="url"
						id="image_url"
						name="image_url"
						bind:value={editFormData.image_url}
						disabled={isSubmitting} />

					<div class="form-actions">
						<button type="submit" disabled={isSubmitting} class="update-btn">
							{isSubmitting ? 'Updating...' : 'Update Post'}
						</button>
					</div>
				</form>

				<form
					method="POST"
					action="?/deletePost"
					use:enhance={submitDeleteForm}
					class="delete-form">
					<button type="submit" class="delete-btn" onclick={handleDelete}>
						Delete Post
					</button>
				</form>
			</details>
		{/if}

		<Comments parentId={data.post.id} type="lost_and_found_id" userData={data} />
	{:else}
		<p>Post not found.</p>
	{/if}
</div>

<style>
	.post-detail-container {
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

	.post-actions {
		margin: 2em 0;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 0;
		background-color: #fff;
	}

	.post-actions summary {
		padding: 1em;
		cursor: pointer;
		background-color: #f8f9fa;
		border-radius: 8px 8px 0 0;
		font-weight: bold;
		color: #495057;
	}

	.post-actions summary:hover {
		background-color: #e9ecef;
	}

	.post-actions[open] summary {
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
		min-height: 80px;
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

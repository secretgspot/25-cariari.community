<script>
	import { enhance } from '$app/forms';

	let { post, isOwner } = $props();
	let formMessage = $state('');
	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	console.log('lost and found iswoenr: ', isOwner);

	// Form state
	let formData = $state({
		title: post?.title || '',
		description: post?.description || '',
		category: post?.category || 'Lost',
		date: post?.date ? new Date(post.date).toISOString().split('T')[0] : '',
		location: post?.location || '',
		contact: post?.contact || '',
		image_url: post?.image_url || '',
	});

	// Update form data when post data changes
	$effect(() => {
		if (post) {
			formData = {
				title: post.title || '',
				description: post.description || '',
				category: post.category || 'Lost',
				date: post.date ? new Date(post.date).toISOString().split('T')[0] : '',
				location: post.location || '',
				contact: post.contact || '',
				image_url: post.image_url || '',
			};
		}
	});

	const submitUpdateForm = async ({ form, data, action, cancel, submitter }) => {
		isSubmitting = true;
		formMessage = '';

		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				formMessage = result.data.message;
				await update();
			} else if (result.type === 'error') {
				formMessage = result.data.message || 'An error occurred';
			} else if (result.type === 'failure') {
				formMessage = result.data?.message || 'Update failed';
			}
		};
	};

	const submitDeleteForm = ({ formElement, formData, action, cancel }) => {
		// Show confirmation dialog
		if (
			!confirm('Are you sure you want to delete this post? This action cannot be undone.')
		) {
			cancel(); // Cancel the form submission
			return;
		}

		isDeleting = true;
		formMessage = '';

		return async ({ result }) => {
			const { applyAction } = await import('$app/forms');

			isDeleting = false;

			if (result.type === 'failure') {
				formMessage = result.data?.message || 'Delete failed';
			} else if (result.type === 'error') {
				formMessage = result.data?.message || 'An error occurred during deletion';
			} else if (result.type === 'redirect') {
				// Let applyAction handle the redirect
				await applyAction(result);
			}
		};
	};
</script>

{#if isOwner}
	<details class="post-actions">
		<summary>Manage Post</summary>

		{#if formMessage}
			<p
				class="form-message"
				class:error={formMessage.includes('required') ||
					formMessage.includes('failed') ||
					formMessage.includes('error')}>
				{formMessage}
			</p>
		{/if}

		<form
			method="POST"
			action="?/updatePost"
			use:enhance={submitUpdateForm}
			class="edit-form">
			<h3>Edit Lost & Found Post</h3>

			<!-- Add hidden inputs to ensure data is sent -->
			<input type="hidden" name="id" value={post?.id || ''} />

			<label for="title">Title: <span class="required">*</span></label>
			<input
				type="text"
				id="title"
				name="title"
				bind:value={formData.title}
				required
				disabled={isSubmitting}
				placeholder="Enter a title for your post" />

			<label for="description">Description: <span class="required">*</span></label>
			<textarea
				id="description"
				name="description"
				bind:value={formData.description}
				required
				disabled={isSubmitting}
				placeholder="Describe the item in detail"></textarea>

			<label for="category">Category: <span class="required">*</span></label>
			<select
				id="category"
				name="category"
				bind:value={formData.category}
				required
				disabled={isSubmitting}>
				<option value="Lost">Lost</option>
				<option value="Found">Found</option>
			</select>

			<label for="date">Date Lost/Found:</label>
			<input
				type="date"
				id="date"
				name="date"
				bind:value={formData.date}
				required
				disabled={isSubmitting} />

			<label for="location">Location:</label>
			<input
				type="text"
				id="location"
				name="location"
				bind:value={formData.location}
				disabled={isSubmitting}
				placeholder="Where was it lost/found?" />

			<label for="contact">Contact Info: <span class="required">*</span></label>
			<input
				type="text"
				id="contact"
				name="contact"
				bind:value={formData.contact}
				required
				disabled={isSubmitting}
				placeholder="Email, phone, or other contact method" />

			<label for="image_url">Image URL (Optional):</label>
			<input
				type="url"
				id="image_url"
				name="image_url"
				bind:value={formData.image_url}
				disabled={isSubmitting}
				placeholder="https://example.com/image.jpg" />

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
			<button type="submit" class="delete-btn" disabled={isDeleting}>
				{isDeleting ? 'Deleting...' : 'Delete Post'}
			</button>
		</form>
	</details>
{/if}

<style>
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

	.required {
		color: #dc3545;
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

	.delete-btn:hover:not(:disabled) {
		background-color: #c82333;
	}

	.delete-btn:disabled {
		background-color: #6c757d;
		cursor: not-allowed;
	}

	.form-message {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 1em;
		border-radius: 5px;
		margin-bottom: 1em;
	}

	.form-message.error {
		background-color: #f8d7da;
		color: #721c24;
		border-color: #f5c6cb;
	}
</style>

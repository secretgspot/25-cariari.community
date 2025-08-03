<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';
	import { addToast } from '$lib/toasts';
	import { compressFile } from '$lib/utils/file.js';

	let { post, isOwner } = $props();
	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	// File upload states
	let compressedFile = $state(null);
	let previewUrl = $state(null);
	let fileInput = $state();

	// Form state
	let formData = $state({
		title: post?.title || '',
		description: post?.description || '',
		category: post?.category || 'Lost',
		date: post?.date ? new Date(post.date).toISOString().split('T')[0] : '',
		location: post?.location || '',
		contact: post?.contact || '',
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
			};
		}
	});

	async function handleFileChange(event) {
		const file = event.target.files[0];
		if (!file) {
			resetFileState();
			return;
		}

		try {
			const { file: compressed, previewUrl: url } = await compressFile(file);
			compressedFile = compressed;
			previewUrl = url;
		} catch (err) {
			console.error('Compression error:', err);
			addToast({
				message: 'Image compression failed.',
				type: 'error',
				dismissible: true,
				timeout: 0,
			});
			resetFileState();
		}
	}

	function resetFileState() {
		compressedFile = null;
		previewUrl = null;
		if (fileInput) fileInput.value = '';
	}

	const submitUpdateForm = async ({
		form,
		formData: enhanceFormData,
		action,
		cancel,
		submitter,
	}) => {
		isSubmitting = true;

		// Add compressed file to form data if available
		if (compressedFile) {
			enhanceFormData.append('image_file', compressedFile);
		}

		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				resetFileState(); // Clear file state on successful update
				addToast({
					message: result.data.message,
					type: 'success',
					timeout: 1200,
				});
				await update(); // Update form data
			} else if (result.type === 'error') {
				addToast({
					message: result.data.message || 'An error occurred',
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
			} else if (result.type === 'failure') {
				addToast({
					message: result.data?.message || 'Update failed',
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
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

		return async ({ result }) => {
			const { applyAction } = await import('$app/forms');

			isDeleting = false;

			if (result.type === 'failure') {
				addToast({
					message: result.data?.message || 'Delete failed',
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
			} else if (result.type === 'error') {
				addToast({
					message: result.data?.message || 'An error occurred during deletion',
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
			} else if (result.type === 'redirect') {
				// Let applyAction handle the redirect
				await applyAction(result);
			}
		};
	};
</script>

{#if isOwner}
	<details class="manage-actions">
		<summary>Manage Lost/Found</summary>

		<form
			method="POST"
			action="?/updatePost"
			enctype="multipart/form-data"
			use:enhance={submitUpdateForm}
			class="edit-form">
			<h3>Edit Lost & Found Post</h3>

			<div class="form-group">
				<label for="title" class="form-label"
					>Title <span class="required">*</span></label>
				<input
					type="text"
					id="title"
					name="title"
					bind:value={formData.title}
					required
					disabled={isSubmitting}
					placeholder="Enter a title for your post"
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="description" class="form-label"
					>Description <span class="required">*</span></label>
				<textarea
					id="description"
					name="description"
					bind:value={formData.description}
					required
					disabled={isSubmitting}
					placeholder="Use **bold**, *italic*, and [links](url) for formatting"
					class="form-textarea"></textarea>
			</div>

			<div class="form-group">
				<label for="category" class="form-label"
					>Category <span class="required">*</span></label>
				<select
					id="category"
					name="category"
					bind:value={formData.category}
					required
					disabled={isSubmitting}
					class="form-select">
					<option value="Lost">Lost</option>
					<option value="Found">Found</option>
				</select>
			</div>

			<div class="form-group">
				<label for="image_upload" class="form-label">Item Image</label>

				{#if previewUrl}
					<img src={previewUrl} alt="preview" class="image-preview" />
				{/if}

				<input
					type="file"
					id="image_upload"
					name="image_upload"
					class="form-input"
					accept="image/*"
					disabled={isSubmitting}
					bind:this={fileInput}
					onchange={handleFileChange} />
			</div>

			<div class="form-group">
				<label for="date" class="form-label"
					>Date Lost/Found <span class="required">*</span></label>
				<input
					type="date"
					id="date"
					name="date"
					bind:value={formData.date}
					required
					disabled={isSubmitting}
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="location" class="form-label">Location</label>
				<input
					type="text"
					id="location"
					name="location"
					bind:value={formData.location}
					disabled={isSubmitting}
					placeholder="Where was it lost/found?"
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="contact" class="form-label"
					>Contact Info <span class="required">*</span></label>
				<input
					type="text"
					id="contact"
					name="contact"
					bind:value={formData.contact}
					required
					disabled={isSubmitting}
					placeholder="Email, phone, or other contact method"
					class="form-input" />
			</div>

			<div class="form-actions">
				<Button type="submit" green loading={isSubmitting} disabled={isSubmitting}>
					{#snippet icon()}
						👍
					{/snippet}
					{isSubmitting ? 'Updating...' : 'Update Lost/Found'}
				</Button>
			</div>
		</form>

		<form
			method="POST"
			action="?/deletePost"
			use:enhance={submitDeleteForm}
			class="delete-form">
			<Button type="submit" red loading={isDeleting} disabled={isDeleting}>
				{#snippet icon()}
					❌
				{/snippet}
				{isDeleting ? 'Deleting...' : 'Delete Notice'}
			</Button>
		</form>
	</details>
{/if}

<style>
</style>

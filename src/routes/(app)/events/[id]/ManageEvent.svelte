<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';
	import { addToast } from '$lib/toasts';

	import Compressor from 'compressorjs';

	let { event, isOwner } = $props();
	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	// File upload states
	let compressedFile = $state(null);
	let previewUrl = $state(null);
	let fileInput = $state();

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

	// Form state
	let formData = $state({
		title: event?.title || '',
		description: event?.description || '',
		event_start_date: event?.event_start_date
			? new Date(event.event_start_date).toISOString().slice(0, 16)
			: '',
		event_end_date: event?.event_end_date
			? new Date(event.event_end_date).toISOString().slice(0, 16)
			: '',
		location: event?.location || '',
		category: event?.category || '',
	});

	// Update form data when event data changes
	$effect(() => {
		if (event) {
			formData = {
				title: event.title || '',
				description: event.description || '',
				event_start_date: event.event_start_date
					? new Date(event.event_start_date).toISOString().slice(0, 16)
					: '',
				event_end_date: event.event_end_date
					? new Date(event.event_end_date).toISOString().slice(0, 16)
					: '',
				location: event.location || '',
				category: event.category || '',
			};
		}
	});

	function compressFile(file) {
		return new Promise((resolve, reject) => {
			new Compressor(file, {
				quality: 0.7,
				maxWidth: 800,
				maxHeight: 600,
				mimeType: 'image/jpeg',
				convertSize: 100000,
				success(result) {
					previewUrl = URL.createObjectURL(result);
					const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
					const compressedFileObj = new File([result], fileName, { type: 'image/jpeg' });
					resolve(compressedFileObj);
				},
				error: reject,
			});
		});
	}

	async function handleFileChange(event) {
		const file = event.target.files[0];
		if (!file) {
			resetFileState();
			return;
		}

		compressedFile = await compressFile(file).catch((error) => {
			console.error('Compression error:', error);
			addToast({
				message: 'Image compression failed.',
				type: 'error',
				dismissible: true,
				timeout: 0,
			});
			resetFileState();
			return null;
		});
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
				await update(); // Update form data like ManageLostAndFound
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
			!confirm(
				'Are you sure you want to delete this event? This action cannot be undone.',
			)
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
		<summary>Manage Event</summary>

		<form
			method="POST"
			action="?/updateEvent"
			enctype="multipart/form-data"
			use:enhance={submitUpdateForm}
			class="edit-form">
			<h3>Edit Event</h3>

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
					placeholder="Enter a title for your event"
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
				<label for="event_start_date" class="form-label"
					>Start Date <span class="required">*</span></label>
				<input
					type="datetime-local"
					id="event_start_date"
					name="event_start_date"
					bind:value={formData.event_start_date}
					required
					disabled={isSubmitting}
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="event_end_date" class="form-label">End Date</label>
				<input
					type="datetime-local"
					id="event_end_date"
					name="event_end_date"
					bind:value={formData.event_end_date}
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
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="image_upload" class="form-label">Event Image</label>

				<!-- Show new preview only when file is selected -->
				{#if previewUrl}
					<div class="new-image">
						<img src={previewUrl} alt="preview" class="image-preview" />
						<small class="form-help">New image preview</small>
					</div>
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
				<small class="form-help">Upload a new image to replace the current one</small>
			</div>

			<div class="form-group">
				<label for="category" class="form-label"
					>Category <span class="required">*</span></label>
				<select
					id="category"
					name="category"
					bind:value={formData.category}
					disabled={isSubmitting}
					class="form-select">
					<option value="">Select a category</option>
					{#each categoryOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</div>

			<div class="form-actions">
				<Button type="submit" green loading={isSubmitting} disabled={isSubmitting}>
					{#snippet icon()}
						👍
					{/snippet}
					{isSubmitting ? 'Updating...' : 'Update Event'}
				</Button>
			</div>
		</form>

		<form
			method="POST"
			action="?/deleteEvent"
			use:enhance={submitDeleteForm}
			class="delete-form">
			<Button type="submit" red loading={isDeleting} disabled={isDeleting}>
				{#snippet icon()}
					❌
				{/snippet}
				{isDeleting ? 'Deleting...' : 'Delete Event'}
			</Button>
		</form>
	</details>
{/if}

<style>
	.image-preview {
		max-width: 300px;
		max-height: 200px;
		border-radius: 8px;
		object-fit: cover;
		margin-bottom: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.new-image {
		margin-bottom: 1rem;
	}

	.form-help {
		display: block;
		margin-top: 0.25rem;
		color: #666;
		font-size: 0.875rem;
	}
</style>

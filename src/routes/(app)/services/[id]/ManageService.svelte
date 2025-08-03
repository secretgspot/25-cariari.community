<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';
	import { addToast } from '$lib/toasts';
	import { compressFile } from '$lib/utils/file.js';

	let { service, isOwner, is_admin } = $props();
	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	// File upload states
	let compressedFile = $state(null);
	let previewUrl = $state(null);
	let fileInput = $state();

	// Form state
	let formData = $state({
		title: service?.title || '',
		description: service?.description || '',
		category: service?.category || '',
		start_date: service?.start_date
			? new Date(service.start_date).toISOString().slice(0, 10)
			: '',
		end_date: service?.end_date
			? new Date(service.end_date).toISOString().slice(0, 10)
			: '',
	});

	// Update form data when service data changes
	$effect(() => {
		if (service) {
			formData = {
				title: service.title || '',
				description: service.description || '',
				category: service.category || '',
				start_date: service.start_date
					? new Date(service.start_date).toISOString().slice(0, 10)
					: '',
				end_date: service.end_date
					? new Date(service.end_date).toISOString().slice(0, 10)
					: '',
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
			!confirm(
				'Are you sure you want to delete this service? This action cannot be undone.',
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

{#if isOwner || is_admin}
	<details class="manage-actions">
		<summary>Manage Service</summary>

		<form
			method="POST"
			action="?/updateService"
			enctype="multipart/form-data"
			use:enhance={submitUpdateForm}
			class="edit-form">
			<h3>Edit Service</h3>

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
					class="form-input"
					placeholder="Enter a title for your service" />
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
					rows="5"
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
					<option value="">Select a category</option>
					<option value="Offering">Offering</option>
					<option value="Wanted">Wanted</option>
				</select>
			</div>

			<div class="form-group">
				<label for="image_upload" class="form-label">Service Image</label>

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
				<label for="start_date" class="form-label">Start Date</label>
				<input
					type="date"
					id="start_date"
					name="start_date"
					bind:value={formData.start_date}
					disabled={isSubmitting}
					readonly
					class="form-input" />
				<!-- Hidden input to ensure the value is submitted -->
				<input type="hidden" name="start_date" value={formData.start_date} />
			</div>

			<div class="form-group">
				<label for="end_date" class="form-label">End Date</label>
				<input
					type="date"
					id="end_date"
					name="end_date"
					bind:value={formData.end_date}
					disabled={isSubmitting}
					readonly
					class="form-input" />
				<!-- Hidden input to ensure the value is submitted -->
				<input type="hidden" name="end_date" value={formData.end_date} />
			</div>

			<div class="form-actions">
				<Button type="submit" green loading={isSubmitting} disabled={isSubmitting}>
					{#snippet icon()}
						👍
					{/snippet}
					{isSubmitting ? 'Updating...' : 'Update Service'}
				</Button>
			</div>
		</form>

		<form
			method="POST"
			action="?/deleteService"
			use:enhance={submitDeleteForm}
			class="delete-form">
			<Button type="submit" size="small" red loading={isDeleting} disabled={isDeleting}>
				{#snippet icon()}
					❌
				{/snippet}
				{isDeleting ? 'Deleting...' : 'Delete Service'}
			</Button>
		</form>
	</details>
{/if}

<style>
</style>

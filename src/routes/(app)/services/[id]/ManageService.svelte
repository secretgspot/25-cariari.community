<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';
	import { addToast } from '$lib/toasts';
	import { compressFile } from '$lib/utils/file.js';
	import Dialog from '$lib/Dialog.svelte';
	import { goto } from '$app/navigation';

	let { service, isOwner, is_admin } = $props();
	let isSubmitting = $state(false);
	let showDeleteDialog = $state(false);

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
</script>

{#if isOwner || is_admin}
	<details class="manage-actions">
		<summary>
			<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
				<path d="M5 2 L12 8 L5 14"></path>
			</svg>
			Manage Service
		</summary>

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

			<input type="hidden" name="start_date" value={formData.start_date} />
			<input type="hidden" name="end_date" value={formData.end_date} />

			<div class="form-actions">
				<Button
					type="submit"
					right
					green
					white
					loading={isSubmitting}
					disabled={isSubmitting}>
					{#snippet icon()}
						<svg
							width="21"
							height="21"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 719 724">
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-width="50"
								d="M331.645 553 117 338.355" /><path
								fill="var(--red-6)"
								d="M546.396 72.066c11.785-20.413 17.678-30.619 27.68-33.3 10.003-2.68 20.209 3.213 40.621 14.998L633.7 64.736c20.412 11.785 30.619 17.677 33.299 27.68 2.68 10.002-3.213 20.208-14.998 40.621l-214.64 371.767c-2.415 4.183-3.623 6.275-5.197 8.088-1.573 1.812-3.475 3.301-7.279 6.279l-23.12 18.104c-41.442 32.45-62.162 48.674-76.783 40.233-14.62-8.441-10.93-34.498-3.548-86.612l4.118-29.075c.677-4.783 1.016-7.175 1.798-9.444.783-2.269 1.991-4.361 4.406-8.544l214.64-371.767Z" /></svg>
					{/snippet}
					{isSubmitting ? 'Updating...' : 'Update'}
				</Button>

				<Button
					type="button"
					size="small"
					red
					white
					loading={isSubmitting}
					disabled={isSubmitting}
					onclick={() => (showDeleteDialog = true)}>
					{#snippet icon()}
						<svg
							width="21"
							height="21"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 271 297">
							<path
								stroke="var(--red-6)"
								stroke-linecap="round"
								stroke-width="50"
								d="M25-25h298.265"
								transform="scale(.94832 1.04914) rotate(45 -30.53 13.668)" />
							<path
								stroke="var(--red-6)"
								stroke-linecap="round"
								stroke-width="50"
								d="M25-25h298.265"
								transform="scale(.94832 1.04914) rotate(-45 361.132 94.18)" />
						</svg>
					{/snippet}
					Delete
				</Button>
			</div>
		</form>
	</details>
{/if}

<Dialog
	open={showDeleteDialog}
	title="Delete Service"
	type="confirm"
	onCancel={() => (showDeleteDialog = false)}>
	{#snippet children()}
		<form
			method="POST"
			action="?/deleteService"
			use:enhance={() => {
				isSubmitting = true;
				showDeleteDialog = false;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						addToast({
							message: result.data?.message || 'Service deleted successfully',
							type: 'success',
						});
						goto('/services');
					} else {
						addToast({
							message: result.data?.message || 'Failed to delete service',
							type: 'error',
							dismissible: true,
							timeout: 0,
						});
					}
				};
			}}>
			<p>Are you sure you want to delete this service? This action cannot be undone.</p>
		</form>
	{/snippet}
</Dialog>

<style>
</style>

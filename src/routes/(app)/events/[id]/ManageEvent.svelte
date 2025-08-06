<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';
	import { addToast } from '$lib/toasts';
	import { compressFile } from '$lib/utils/file.js';
	import Dialog from '$lib/Dialog.svelte';
	import { goto } from '$app/navigation';

	let { event, isOwner, is_admin } = $props();
	let isSubmitting = $state(false);
	let showDeleteDialog = $state(false);

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
</script>

{#if isOwner || is_admin}
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
								d="M691 358c0-156.978 0-235.467-48.768-284.233C593.468 25 514.976 25 358 25c-156.978 0-235.467 0-284.233 48.767C25 122.533 25 201.022 25 358c0 156.976 0 235.468 48.767 284.232C122.533 691 201.022 691 358 691h156M283 353h172M372 444V272" /><path
								fill="var(--red-6)"
								d="m556.79 623.045 55.327-206.482c.761-2.839 1.666-6.354 2.945-9.213 1.447-3.237 4.15-7.526 9.942-10.228l.272-.124c5.704-2.569 11.483-2.292 15.568-1.677 3.667.552 7.836 1.7 11.219 2.607l16.794 4.5 16.795 4.5c3.382.906 7.566 1.996 11.018 3.352 3.845 1.51 8.989 4.159 12.644 9.236l.173.244.17.245c3.501 5.149 3.686 10.112 3.327 13.583-.322 3.116-1.296 6.613-2.057 9.452l-55.326 206.482c-.22.82-.737 3.021-1.849 5.113-1.112 2.091-2.684 3.818-3.253 4.481l-26.173 30.501c-4.68 5.453-9.21 10.793-13.384 14.366-3.634 3.109-12.048 9.36-24.245 6.224l-.289-.076c-12.353-3.31-16.568-13.046-18.172-17.591-1.829-5.182-3.082-12.071-4.408-19.134l-7.417-39.501c-.161-.859-.659-3.139-.576-5.507.072-2.071.581-3.988.855-4.984l.1-.369Zm128.862-216.117-16.795-4.5-16.794-4.5 33.589 9Z" /></svg>
					{/snippet}
					{isSubmitting ? 'Updating...' : 'Update'}
				</Button>

				<Button
					type="button"
					size="small"
					red
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
	title="Delete Event"
	type="confirm"
	onCancel={() => (showDeleteDialog = false)}>
	{#snippet children()}
		<form
			method="POST"
			action="?/deleteEvent"
			use:enhance={() => {
				isSubmitting = true;
				showDeleteDialog = false;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						addToast({
							message: result.data?.message || 'Event deleted successfully',
							type: 'success',
						});
						goto('/events');
					} else {
						addToast({
							message: result.data?.message || 'Failed to delete event',
							type: 'error',
							dismissible: true,
							timeout: 0,
						});
					}
				};
			}}>
			<p>Are you sure you want to delete this event? This action cannot be undone.</p>
		</form>
	{/snippet}
</Dialog>

<style>
</style>

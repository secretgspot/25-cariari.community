<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/buttons/Button.svelte';
	import Compressor from 'compressorjs';

	let { onEventAdded } = $props();

	let formData = $state({
		title: '',
		description: '',
		category: '',
		startDate: '',
		endDate: '',
		location: '',
		image_url: '',
	});

	let loading = $state(false);
	let error = $state(null);
	let success = $state(false);

	// File upload states
	let compressedFile = $state(null);
	let previewUrl = $state(null);
	let fileInput = $state();

	const categoryOptions = [
		'Cultural',
		'Sports',
		'Workshop',
		'Community Meeting',
		'Social',
		'Educational',
		'Other',
	];

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
			error = 'Image compression failed.';
			resetFileState();
			return null;
		});
	}

	function resetFileState() {
		compressedFile = null;
		previewUrl = null;
		if (fileInput) fileInput.value = '';
	}

	// Clear form function
	function clearForm() {
		formData = {
			title: '',
			description: '',
			category: '',
			startDate: '',
			endDate: '',
			location: '', // Fixed typo: was 'locatoin'
			image_url: '',
		};
		resetFileState();
	}
</script>

<form
	method="POST"
	action="?/createEvent"
	enctype="multipart/form-data"
	use:enhance={({
		formElement,
		formData: enhanceFormData,
		action,
		cancel,
		submitter,
	}) => {
		loading = true;
		error = null;
		success = false;

		// Add compressed file to form data if available
		if (compressedFile) {
			enhanceFormData.append('image_file', compressedFile);
		}

		return async ({ result, update }) => {
			loading = false;

			if (result.type === 'success') {
				success = true;
				clearForm();

				// Call the callback function
				if (onEventAdded && result.data?.event) {
					onEventAdded(result.data.event);
				}
			} else if (result.type === 'failure') {
				error = result.data?.message || 'Failed to add event';
			} else if (result.type === 'error') {
				error = 'An unexpected error occurred';
			}

			// Update the page
			await update();
		};
	}}
	class="add-form">
	<div class="form-title">
		<h2>Add New Event</h2>
		<p>
			Community Events feature a diverse range of happenings open to everyone. Events are
			automatically removed upon reaching their specified end date and time.
		</p>
	</div>

	<div class="form-group">
		<label for="title" class="form-label">Title <span class="required">*</span></label>
		<input
			type="text"
			id="title"
			name="title"
			bind:value={formData.title}
			required
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
			class="form-select">
			<option value="">Select a category</option>
			{#each categoryOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="startDate" class="form-label"
			>Start Date <span class="required">*</span></label>
		<input
			type="datetime-local"
			id="startDate"
			name="event_start_date"
			bind:value={formData.startDate}
			required
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="endDate" class="form-label"
			>End Date <span class="required">*</span></label>
		<input
			type="datetime-local"
			id="endDate"
			name="event_end_date"
			bind:value={formData.endDate}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="location" class="form-label">Location</label>
		<input
			type="text"
			id="location"
			name="location"
			bind:value={formData.location}
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
			bind:this={fileInput}
			onchange={handleFileChange} />
	</div>

	<div class="form-group">
		<label for="image_url" class="form-label">Image URL</label>
		<input
			type="text"
			id="image_url"
			name="image_url"
			bind:value={formData.image_url}
			class="form-input" />
	</div>

	{#if error}
		<p class="error-message">{error}</p>
	{/if}

	{#if success}
		<p class="success-message">Notice added successfully!</p>
	{/if}

	<Button type="submit" {loading} disabled={loading}>
		{#snippet icon()}
			📌
		{/snippet}
		{loading ? 'Adding...' : 'Add Event'}
	</Button>
</form>

<style>
	.image-preview {
		max-width: 300px;
		max-height: 200px;
		border-radius: 8px;
		object-fit: cover;
		margin-bottom: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
</style>

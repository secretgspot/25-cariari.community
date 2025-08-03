<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/buttons/Button.svelte';
	import { compressFile } from '$lib/utils/file.js';

	let { onLostAndFoundAdded } = $props();

	const today = new Date();
	const sevenDaysFromNow = new Date();
	sevenDaysFromNow.setDate(today.getDate() + 7);
	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	let formData = $state({
		title: '',
		description: '',
		category: 'Lost',
		date: formatDate(today),
		location: '',
		contact: '',
	});

	let loading = $state(false);
	let error = $state(null);
	let success = $state(false);

	// File upload states
	let compressedFile = $state(null);
	let previewUrl = $state(null);
	let fileInput = $state();

	const categoryOptions = ['Lost', 'Found'];

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
			error = 'Image compression failed.';
			resetFileState();
		}
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
			category: 'Lost',
			date: formatDate(today),
			location: '',
			contact: '',
		};
		resetFileState();
	}
</script>

<form
	method="POST"
	action="?/createLostAndFound"
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
				if (onLostAndFoundAdded && result.data?.lostandfound) {
					onLostAndFoundAdded(result.data.lostandfound);
				}
			} else if (result.type === 'failure') {
				error = result.data?.message || 'Failed to add lost and found';
			} else if (result.type === 'error') {
				error = 'An unexpected error occurred';
			}

			// Update the page
			await update();
		};
	}}
	class="add-form">
	<div class="form-title">
		<h2>Add New Lost & Found</h2>
		<p>
			The Lost and Found section is for reporting items or pets that have been misplaced
			or discovered within the community.
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
			{#each categoryOptions as option}
				<option value={option}>{option}</option>
			{/each}
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
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="location" class="form-label"
			>Location Lost/Found <span class="required">*</span></label>
		<input
			type="text"
			id="location"
			name="location"
			bind:value={formData.location}
			required
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
			class="form-input" />
	</div>

	{#if error}
		<p class="error-message">{error}</p>
	{/if}

	{#if success}
		<p class="success-message">Lost/Found added successfully!</p>
	{/if}

	<Button type="submit" {loading} disabled={loading}>
		{#snippet icon()}
			📌
		{/snippet}
		{loading ? 'Adding...' : 'Add Lost/Found'}
	</Button>
</form>

<style>
</style>

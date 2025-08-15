<!-- AddServiceForm.svelte -->
<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/buttons/Button.svelte';
	import { compressFile } from '$lib/utils/file.js';
	import Textarea from '$lib/Textarea.svelte';

	let { onServiceAdded } = $props();

	const today = new Date();
	const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

	let formData = $state({
		title: '',
		description: '',
		category: 'Offering',
		start_date: today.toISOString(),
		end_date: sevenDaysFromNow.toISOString(),
	});

	let loading = $state(false);
	let error = $state(null);
	let success = $state(false);

	// File upload states
	let compressedFile = $state(null);
	let previewUrl = $state(null);
	let fileInput = $state();

	const categoryOptions = ['Offering', 'Wanted'];

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

	// Update the clearForm function:
	function clearForm() {
		const newToday = new Date();
		const newSevenDaysFromNow = new Date(newToday.getTime() + 7 * 24 * 60 * 60 * 1000);

		formData = {
			title: '',
			description: '',
			category: 'Offering',
			start_date: newToday.toISOString(),
			end_date: newSevenDaysFromNow.toISOString(),
		};
		resetFileState();
	}
</script>

<form
	method="POST"
	action="?/createService"
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
				if (onServiceAdded && result.data?.service) {
					onServiceAdded(result.data.service);
				}
			} else if (result.type === 'failure') {
				error = result.data?.message || 'Failed to add service';
			} else if (result.type === 'error') {
				error = 'An unexpected error occurred';
			}

			// Update the page
			await update();
		};
	}}
	class="add-form">
	<div class="form-title">
		<h2>Add New Service</h2>
		<p>
			The Services section is for both offering your skills (Offering) and seeking
			assistance (Wanted) within the community. All service listings expire after one
			week.
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
		<Textarea name="description" bind:value={formData.description} required />
		<!-- <textarea
			id="description"
			name="description"
			bind:value={formData.description}
			required
			placeholder="Use **bold**, *italic*, and [links](url) for formatting"
			class="form-textarea"></textarea> -->
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
			bind:this={fileInput}
			onchange={handleFileChange} />
	</div>

	<input type="hidden" name="start_date" value={formData.start_date} />
	<input type="hidden" name="end_date" value={formData.end_date} />

	<Button type="submit" white outline right {loading} disabled={loading}>
		{#snippet icon()}
			📌
		{/snippet}
		{loading ? 'Adding...' : 'Add Service'}
	</Button>

	{#if error}
		<p class="error-message">{error}</p>
	{/if}

	{#if success}
		<p class="success-message">Service added successfully!</p>
	{/if}
</form>

<style>
</style>

<!-- AddServiceForm.svelte -->
<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/buttons/Button.svelte';

	let { onServiceAdded } = $props();

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
		category: 'Offering',
		image_url: '',
		start_date: formatDate(today),
		end_date: formatDate(sevenDaysFromNow),
	});

	let loading = $state(false);
	let error = $state(null);
	let success = $state(false);

	const categoryOptions = ['Offering', 'Wanted'];

	// Clear form function
	function clearForm() {
		formData = {
			title: '',
			description: '',
			category: 'Offering',
			image_url: '',
			start_date: formatDate(today),
			end_date: formatDate(sevenDaysFromNow),
		};
	}
</script>

<form
	method="POST"
	action="?/createService"
	use:enhance={({ formElement, formData, action, cancel, submitter }) => {
		loading = true;
		error = null;
		success = false;

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
	<h2 class="form-title">Add New Service</h2>

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
		<label for="image_url" class="form-label">Image URL</label>
		<input
			type="text"
			id="image_url"
			name="image_url"
			bind:value={formData.image_url}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="start_date" class="form-label">Start Date</label>
		<input
			type="date"
			id="start_date"
			name="start_date"
			bind:value={formData.start_date}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="end_date" class="form-label">End Date</label>
		<input
			type="date"
			id="end_date"
			name="end_date"
			bind:value={formData.end_date}
			class="form-input" />
	</div>

	{#if error}
		<p class="error-message">{error}</p>
	{/if}

	{#if success}
		<p class="success-message">Service added successfully!</p>
	{/if}

	<Button type="submit" {loading} disabled={loading}>
		{#snippet icon()}
			📌
		{/snippet}
		{loading ? 'Adding...' : 'Add Service'}
	</Button>
</form>

<style>
</style>

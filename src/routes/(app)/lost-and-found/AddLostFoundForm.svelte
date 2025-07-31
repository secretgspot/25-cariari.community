<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/buttons/Button.svelte';

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
		image_url: '',
		date: formatDate(today),
		location: '',
		contact: '',
	});

	let loading = $state(false);
	let error = $state(null);
	let success = $state(false);

	const categoryOptions = ['Lost', 'Found'];

	// Clear form function
	function clearForm() {
		formData = {
			title: '',
			description: '',
			category: 'Lost',
			image_url: '',
			date: formatDate(today),
			location: '',
			contact: '',
		};
	}
</script>

<form
	method="POST"
	action="?/createLostAndFound"
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
	class="lost-found-form">
	<h2 class="form-title">Add New Lost & Found</h2>

	<div class="form-group">
		<label for="title" class="form-label">Title</label>
		<input
			type="text"
			id="title"
			name="title"
			bind:value={formData.title}
			required
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="description" class="form-label">Description (supports Markdown)</label>
		<textarea
			id="description"
			name="description"
			bind:value={formData.description}
			required
			rows="5"
			placeholder="Use **bold**, *italic*, and [links](url) for formatting"
			class="form-textarea"></textarea>
	</div>

	<div class="form-group">
		<label for="category" class="form-label">Category</label>
		<select
			id="category"
			name="category"
			bind:value={formData.category}
			class="form-select">
			{#each categoryOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="image_url" class="form-label">Image URL (Optional):</label>
		<input
			type="text"
			id="image_url"
			name="image_url"
			bind:value={formData.image_url}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="date" class="form-label">Date Lost/Found</label>
		<input
			type="date"
			id="date"
			name="date"
			bind:value={formData.date}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="location" class="form-label">Location Lost/Found</label>
		<input
			type="text"
			id="location"
			name="location"
			bind:value={formData.location}
			required
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="contact" class="form-label">Contact Info</label>
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
	.lost-found-form {
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--border-size-3);
		padding: var(--size-6);
		margin-block: var(--size-3);
	}

	.form-title {
		font-size: 1.25em;
		font-weight: 600;
		margin-bottom: 1.5em;
		color: #333;
	}

	.form-group {
		margin-bottom: 1.5em;
	}

	.form-label {
		display: block;
		font-size: 0.9em;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5em;
	}

	.form-input,
	.form-textarea,
	.form-select {
		width: 100%;
		padding: 0.75em;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.9em;
		box-sizing: border-box;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.form-input:focus,
	.form-textarea:focus,
	.form-select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.form-textarea {
		resize: vertical;
		min-height: 120px;
	}

	.error-message {
		color: #ef4444;
		font-size: 0.9em;
		margin-bottom: 1em;
		padding: 0.75em;
		background-color: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 4px;
	}

	.success-message {
		color: #10b981;
		font-size: 0.9em;
		margin-bottom: 1em;
		padding: 0.75em;
		background-color: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 4px;
	}
</style>

<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/buttons/Button.svelte';

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

	const categoryOptions = [
		'Cultural',
		'Sports',
		'Workshop',
		'Community Meeting',
		'Social',
		'Educational',
		'Other',
	];

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
	}
</script>

<form
	method="POST"
	action="?/createEvent"
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
	class="event-form">
	<h2 class="form-title">Add New Event</h2>

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
			<option value="">Select a category</option>
			{#each categoryOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="startDate" class="form-label">Start Date (Required)</label>
		<input
			type="datetime-local"
			id="startDate"
			name="event_start_date"
			bind:value={formData.startDate}
			required
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="endDate" class="form-label">End Date (Optional)</label>
		<input
			type="datetime-local"
			id="endDate"
			name="event_end_date"
			bind:value={formData.endDate}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="location" class="form-label">Location (Optional)</label>
		<input
			type="text"
			id="location"
			name="location"
			bind:value={formData.location}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="image_url" class="form-label">Image URL (Optional)</label>
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

	<Button type="submit" disabled={loading}>
		{#snippet icon()}
			📌
		{/snippet}
		{loading ? 'Adding...' : 'Add Event'}
	</Button>
</form>

<style>
	.event-form {
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

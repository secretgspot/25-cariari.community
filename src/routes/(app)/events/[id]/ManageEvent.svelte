<script>
	import { enhance } from '$app/forms';

	let { event, isOwner } = $props();
	let formMessage = $state('');
	let isSubmitting = $state(false);
	let isDeleting = $state(false);

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
		image_url: event?.image_url || '',
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
				image_url: event.image_url || '',
				category: event.category || '',
			};
		}
	});

	const submitUpdateForm = async ({ form, data, action, cancel, submitter }) => {
		isSubmitting = true;
		formMessage = '';

		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				formMessage = result.data.message;
				await update();
			} else if (result.type === 'error') {
				formMessage = result.data.message || 'An error occurred';
			} else if (result.type === 'failure') {
				formMessage = result.data?.message || 'Update failed';
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
		formMessage = '';

		return async ({ result }) => {
			const { applyAction } = await import('$app/forms');

			isDeleting = false;

			if (result.type === 'failure') {
				formMessage = result.data?.message || 'Delete failed';
			} else if (result.type === 'error') {
				formMessage = result.data?.message || 'An error occurred during deletion';
			} else if (result.type === 'redirect') {
				// Let applyAction handle the redirect
				await applyAction(result);
			}
		};
	};
</script>

{#if isOwner}
	<details class="event-actions">
		<summary>Manage Event</summary>

		{#if formMessage}
			<p
				class="form-message"
				class:error={formMessage.includes('required') ||
					formMessage.includes('failed') ||
					formMessage.includes('error')}>
				{formMessage}
			</p>
		{/if}

		<form
			method="POST"
			action="?/updateEvent"
			use:enhance={submitUpdateForm}
			class="edit-form">
			<h3>Edit Event</h3>

			<div class="form-group">
				<label for="title" class="form-label">Title</label>
				<input
					type="text"
					id="title"
					name="title"
					bind:value={formData.title}
					required
					disabled={isSubmitting}
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="description" class="form-label"
					>Description (supports Markdown)</label>
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
				<label for="event_start_date" class="form-label">Start Date (Required)</label>
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
				<label for="event_end_date" class="form-label">End Date (Optional)</label>
				<input
					type="datetime-local"
					id="event_end_date"
					name="event_end_date"
					bind:value={formData.event_end_date}
					disabled={isSubmitting}
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="location" class="form-label">Location (Optional)</label>
				<input
					type="text"
					id="location"
					name="location"
					bind:value={formData.location}
					disabled={isSubmitting}
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="image_url" class="form-label">Image URL (Optional)</label>
				<input
					type="text"
					id="image_url"
					name="image_url"
					bind:value={formData.image_url}
					disabled={isSubmitting}
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="category" class="form-label">Category</label>
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
				<button type="submit" disabled={isSubmitting} class="update-btn">
					{isSubmitting ? 'Updating...' : 'Update Event'}
				</button>
			</div>
		</form>

		<form
			method="POST"
			action="?/deleteEvent"
			use:enhance={submitDeleteForm}
			class="delete-form">
			<button type="submit" class="delete-btn" disabled={isDeleting}>
				{isDeleting ? 'Deleting...' : 'Delete Event'}
			</button>
		</form>
	</details>
{/if}

<style>
	.event-actions {
		margin: 2em 0;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 0;
		background-color: #fff;
	}

	.event-actions summary {
		padding: 1em;
		cursor: pointer;
		background-color: #f8f9fa;
		border-radius: 8px 8px 0 0;
		font-weight: bold;
		color: #495057;
	}

	.event-actions summary:hover {
		background-color: #e9ecef;
	}

	.event-actions[open] summary {
		border-bottom: 1px solid #ddd;
		border-radius: 8px 8px 0 0;
	}

	.edit-form {
		padding: 1.5em;
		border-bottom: 1px solid #eee;
	}

	.delete-form {
		padding: 1em 1.5em;
		text-align: center;
	}

	.edit-form h3 {
		margin-top: 0;
		margin-bottom: 1.5em;
		color: #333;
		font-size: 1.25em;
		font-weight: 600;
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

	.form-actions {
		display: flex;
		gap: 1em;
		margin-top: 1.5em;
	}

	.update-btn {
		background-color: #28a745;
		color: white;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-weight: bold;
	}

	.update-btn:hover:not(:disabled) {
		background-color: #218838;
	}

	.update-btn:disabled {
		background-color: #6c757d;
		cursor: not-allowed;
	}

	.delete-btn {
		background-color: #dc3545;
		color: white;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-weight: bold;
	}

	.delete-btn:hover:not(:disabled) {
		background-color: #c82333;
	}

	.delete-btn:disabled {
		background-color: #6c757d;
		cursor: not-allowed;
	}

	.form-message {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 1em;
		border-radius: 5px;
		margin-bottom: 1em;
	}

	.form-message.error {
		background-color: #f8d7da;
		color: #721c24;
		border-color: #f5c6cb;
	}
</style>

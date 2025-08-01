<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';

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
	<details class="manage-actions">
		<summary>Manage Event</summary>

		<form
			method="POST"
			action="?/updateEvent"
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
				<label for="image_url" class="form-label">Image URL</label>
				<input
					type="text"
					id="image_url"
					name="image_url"
					bind:value={formData.image_url}
					disabled={isSubmitting}
					class="form-input" />
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
						👍
					{/snippet}
					{isSubmitting ? 'Updating...' : 'Update Event'}
				</Button>
			</div>
		</form>

		<form
			method="POST"
			action="?/deleteEvent"
			use:enhance={submitDeleteForm}
			class="delete-form">
			<Button type="submit" red loading={isDeleting} disabled={isDeleting}>
				{#snippet icon()}
					❌
				{/snippet}
				{isDeleting ? 'Deleting...' : 'Delete Event'}
			</Button>
		</form>

		{#if formMessage}
			<p
				class="form-message"
				class:error={formMessage.includes('required') ||
					formMessage.includes('failed') ||
					formMessage.includes('error')}>
				{formMessage}
			</p>
		{/if}
	</details>
{/if}

<style>
</style>

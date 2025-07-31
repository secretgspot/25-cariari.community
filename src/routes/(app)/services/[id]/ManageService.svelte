<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';

	let { service, isOwner } = $props();
	let formMessage = $state('');
	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	// Form state
	let formData = $state({
		title: service?.title || '',
		description: service?.description || '',
		category: service?.category || '',
		image_url: service?.image_url || '',
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
				image_url: service.image_url || '',
				start_date: service.start_date
					? new Date(service.start_date).toISOString().slice(0, 10)
					: '',
				end_date: service.end_date
					? new Date(service.end_date).toISOString().slice(0, 10)
					: '',
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
				'Are you sure you want to delete this service? This action cannot be undone.',
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
	<details class="service-actions">
		<summary>Manage Service</summary>

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
			action="?/updateService"
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
					>Description (Markdown supported) <span class="required">*</span></label>
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
				<label for="image_url" class="form-label">Image URL (Optional)</label>
				<input
					type="url"
					id="image_url"
					name="image_url"
					bind:value={formData.image_url}
					disabled={isSubmitting}
					class="form-input"
					placeholder="https://example.com/image.jpg" />
			</div>

			<div class="form-group">
				<label for="start_date" class="form-label">Start Date</label>
				<input
					type="date"
					id="start_date"
					name="start_date"
					bind:value={formData.start_date}
					disabled={isSubmitting}
					class="form-input" />
			</div>

			<div class="form-group">
				<label for="end_date" class="form-label">End Date (Optional)</label>
				<input
					type="date"
					id="end_date"
					name="end_date"
					bind:value={formData.end_date}
					disabled={isSubmitting}
					class="form-input" />
			</div>

			<div class="form-actions">
				<Button type="submit" green loading={isSubmitting} disabled={isSubmitting}>
					{#snippet icon()}
						👍
					{/snippet}
					{isSubmitting ? 'Updating...' : 'Update Service'}
				</Button>
			</div>
		</form>

		<form
			method="POST"
			action="?/deleteService"
			use:enhance={submitDeleteForm}
			class="delete-form">
			<Button type="submit" red loading={isDeleting} disabled={isDeleting}>
				{#snippet icon()}
					❌
				{/snippet}
				{isDeleting ? 'Deleting...' : 'Delete Service'}
			</Button>
		</form>
	</details>
{/if}

<style>
	.service-actions {
		margin: 2em 0;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 0;
		background-color: #fff;
	}

	.service-actions summary {
		padding: 1em;
		cursor: pointer;
		background-color: #f8f9fa;
		border-radius: 8px 8px 0 0;
		font-weight: bold;
		color: #495057;
	}

	.service-actions summary:hover {
		background-color: #e9ecef;
	}

	.service-actions[open] summary {
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

	.required {
		color: #dc3545;
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

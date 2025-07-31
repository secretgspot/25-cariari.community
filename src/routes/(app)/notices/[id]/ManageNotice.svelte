<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';

	let { notice, isOwner } = $props();
	let formMessage = $state('');
	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	// Urgency options matching the add form structure
	const urgencyOptions = ['Default', 'Low', 'Medium', 'High'];

	// Form state
	let formData = $state({
		title: notice?.title || '',
		description: notice?.description || '',
		urgency: notice?.urgency || 'Default',
		start_date: notice?.start_date
			? new Date(notice.start_date).toISOString().slice(0, 10)
			: '',
		end_date: notice?.end_date
			? new Date(notice.end_date).toISOString().slice(0, 10)
			: '',
	});

	// Update form data when notice data changes
	$effect(() => {
		if (notice) {
			formData = {
				title: notice.title || '',
				description: notice.description || '',
				urgency: notice.urgency || 'Default',
				start_date: notice.start_date
					? new Date(notice.start_date).toISOString().slice(0, 10)
					: '',
				end_date: notice.end_date
					? new Date(notice.end_date).toISOString().slice(0, 10)
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
				'Are you sure you want to delete this notice? This action cannot be undone.',
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
	<details class="notice-actions">
		<summary>Manage Notice</summary>

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
			action="?/updateNotice"
			use:enhance={submitUpdateForm}
			class="edit-form">
			<h3>Edit Notice</h3>

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
				<label for="urgency" class="form-label">Urgency</label>
				<select
					id="urgency"
					name="urgency"
					bind:value={formData.urgency}
					disabled={isSubmitting}
					class="form-select">
					{#each urgencyOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="start_date" class="form-label">Start Date (Optional)</label>
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
					{isSubmitting ? 'Updating...' : 'Update Notice'}
				</Button>
			</div>
		</form>

		<form
			method="POST"
			action="?/deleteNotice"
			use:enhance={submitDeleteForm}
			class="delete-form">
			<Button type="submit" red loading={isDeleting} disabled={isDeleting}>
				{#snippet icon()}
					❌
				{/snippet}
				{isDeleting ? 'Deleting...' : 'Delete Notice'}
			</Button>
		</form>
	</details>
{/if}

<style>
	.notice-actions {
		margin: 2em 0;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 0;
		background-color: #fff;
	}

	.notice-actions summary {
		padding: 1em;
		cursor: pointer;
		background-color: #f8f9fa;
		border-radius: 8px 8px 0 0;
		font-weight: bold;
		color: #495057;
	}

	.notice-actions summary:hover {
		background-color: #e9ecef;
	}

	.notice-actions[open] summary {
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

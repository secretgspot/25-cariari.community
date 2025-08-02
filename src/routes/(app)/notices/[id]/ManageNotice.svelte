<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';
	import { addToast } from '$lib/toasts';

	let { notice, isOwner } = $props();
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

		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				addToast({
					message: result.data.message,
					type: 'success',
					timeout: 1200,
				});
				await update();
			} else if (result.type === 'error') {
				addToast({
					message: result.data.message || 'An error occurred',
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
			} else if (result.type === 'failure') {
				addToast({
					message: result.data?.message || 'Update failed',
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
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

		return async ({ result }) => {
			const { applyAction } = await import('$app/forms');

			isDeleting = false;

			if (result.type === 'failure') {
				addToast({
					message: result.data?.message || 'Delete failed',
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
			} else if (result.type === 'error') {
				addToast({
					message: result.data?.message || 'An error occurred during deletion',
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
			} else if (result.type === 'redirect') {
				// Let applyAction handle the redirect
				await applyAction(result);
			}
		};
	};
</script>

{#if isOwner}
	<details class="manage-actions">
		<summary>Manage Notice</summary>

		<form
			method="POST"
			action="?/updateNotice"
			use:enhance={submitUpdateForm}
			class="edit-form">
			<h3>Edit Notice</h3>

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
					placeholder="Enter a title for your notice"
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
				<label for="urgency" class="form-label"
					>Urgency <span class="required">*</span></label>
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
				<label for="end_date" class="form-label">End Date</label>
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
</style>

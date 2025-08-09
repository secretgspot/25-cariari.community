<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/buttons';
	import { addToast } from '$lib/toasts';
	import Dialog from '$lib/Dialog.svelte';
	import { goto } from '$app/navigation';

	let { notice, isOwner, is_admin } = $props();
	let isSubmitting = $state(false);
	let showDeleteDialog = $state(false);

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
</script>

{#if isOwner || is_admin}
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
				<Button
					type="submit"
					right
					green
					white
					loading={isSubmitting}
					disabled={isSubmitting}>
					{#snippet icon()}
						<svg
							width="21"
							height="21"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 719 724">
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-width="50"
								d="M331.645 553 117 338.355" /><path
								fill="var(--red-6)"
								d="M546.396 72.066c11.785-20.413 17.678-30.619 27.68-33.3 10.003-2.68 20.209 3.213 40.621 14.998L633.7 64.736c20.412 11.785 30.619 17.677 33.299 27.68 2.68 10.002-3.213 20.208-14.998 40.621l-214.64 371.767c-2.415 4.183-3.623 6.275-5.197 8.088-1.573 1.812-3.475 3.301-7.279 6.279l-23.12 18.104c-41.442 32.45-62.162 48.674-76.783 40.233-14.62-8.441-10.93-34.498-3.548-86.612l4.118-29.075c.677-4.783 1.016-7.175 1.798-9.444.783-2.269 1.991-4.361 4.406-8.544l214.64-371.767Z" /></svg>
					{/snippet}
					{isSubmitting ? 'Updating...' : 'Update'}
				</Button>

				<Button
					type="button"
					size="small"
					red
					white
					loading={isSubmitting}
					disabled={isSubmitting}
					onclick={() => (showDeleteDialog = true)}>
					{#snippet icon()}
						<svg
							width="21"
							height="21"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 271 297">
							<path
								stroke="var(--red-6)"
								stroke-linecap="round"
								stroke-width="50"
								d="M25-25h298.265"
								transform="scale(.94832 1.04914) rotate(45 -30.53 13.668)" />
							<path
								stroke="var(--red-6)"
								stroke-linecap="round"
								stroke-width="50"
								d="M25-25h298.265"
								transform="scale(.94832 1.04914) rotate(-45 361.132 94.18)" />
						</svg>
					{/snippet}
					Delete
				</Button>
			</div>
		</form>
	</details>
{/if}

<Dialog
	open={showDeleteDialog}
	title="Delete Notice"
	type="confirm"
	onCancel={() => (showDeleteDialog = false)}>
	{#snippet children()}
		<form
			method="POST"
			action="?/deleteNotice"
			use:enhance={() => {
				isSubmitting = true;
				showDeleteDialog = false;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						addToast({
							message: result.data?.message || 'Notice deleted successfully',
							type: 'success',
						});
						goto('/notices'); // Assuming '/notices' is the correct redirect path
					} else {
						addToast({
							message: result.data?.message || 'Failed to delete notice',
							type: 'error',
							dismissible: true,
							timeout: 0,
						});
					}
				};
			}}>
			<p>Are you sure you want to delete this notice? This action cannot be undone.</p>
		</form>
	{/snippet}
</Dialog>

<style>
</style>

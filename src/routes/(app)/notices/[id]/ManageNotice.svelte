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
				<Button type="submit" green white loading={isSubmitting} disabled={isSubmitting}>
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
								d="M691 358c0-156.978 0-235.467-48.768-284.233C593.468 25 514.976 25 358 25c-156.978 0-235.467 0-284.233 48.767C25 122.533 25 201.022 25 358c0 156.976 0 235.468 48.767 284.232C122.533 691 201.022 691 358 691h156M283 353h172M372 444V272" /><path
								fill="var(--red-6)"
								d="m556.79 623.045 55.327-206.482c.761-2.839 1.666-6.354 2.945-9.213 1.447-3.237 4.15-7.526 9.942-10.228l.272-.124c5.704-2.569 11.483-2.292 15.568-1.677 3.667.552 7.836 1.7 11.219 2.607l16.794 4.5 16.795 4.5c3.382.906 7.566 1.996 11.018 3.352 3.845 1.51 8.989 4.159 12.644 9.236l.173.244.17.245c3.501 5.149 3.686 10.112 3.327 13.583-.322 3.116-1.296 6.613-2.057 9.452l-55.326 206.482c-.22.82-.737 3.021-1.849 5.113-1.112 2.091-2.684 3.818-3.253 4.481l-26.173 30.501c-4.68 5.453-9.21 10.793-13.384 14.366-3.634 3.109-12.048 9.36-24.245 6.224l-.289-.076c-12.353-3.31-16.568-13.046-18.172-17.591-1.829-5.182-3.082-12.071-4.408-19.134l-7.417-39.501c-.161-.859-.659-3.139-.576-5.507.072-2.071.581-3.988.855-4.984l.1-.369Zm128.862-216.117-16.795-4.5-16.794-4.5 33.589 9Z" /></svg>
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

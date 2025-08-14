<!-- AddNoticeForm.svelte -->
<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/buttons/Button.svelte';

	let { onNoticeAdded } = $props();

	let formData = $state({
		title: '',
		description: '',
		urgency: 'Default',
		start_date: '',
		end_date: '',
	});

	let loading = $state(false);
	let error = $state(null);
	let success = $state(false);

	const urgencyOptions = ['Default', 'Low', 'Medium', 'High'];

	function clearForm() {
		formData = {
			title: '',
			description: '',
			urgency: 'Default',
			start_date: '',
			end_date: '',
		};
	}
</script>

<form
	method="POST"
	action="?/createNotice"
	use:enhance={() => {
		loading = true;
		error = null;
		success = false;

		return async ({ result, update }) => {
			loading = false;

			if (result.type === 'success') {
				success = true;
				clearForm();

				if (onNoticeAdded && result.data?.notice) {
					onNoticeAdded(result.data.notice);
				}
			} else if (result.type === 'failure') {
				error = result.data?.message || 'Failed to add notice';
			} else if (result.type === 'error') {
				error = 'An unexpected error occurred';
			}

			await update();
		};
	}}
	class="add-form {formData.urgency.toLocaleLowerCase()}">
	<div class="form-title">
		<h2>Add New Notice</h2>
		<p>
			Community Notices are for important announcements and updates relevant to the
			community. Urgency levels help prioritize information. Unless an End Date is
			provided, notices will expire in 30 days.
		</p>
	</div>

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
		<label for="urgency" class="form-label"
			>Urgency <span class="required">*</span></label>
		<select id="urgency" name="urgency" bind:value={formData.urgency} class="form-select">
			{#each urgencyOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="start_date" class="form-label">Start Date</label>
		<input
			type="datetime-local"
			id="start_date"
			name="start_date"
			bind:value={formData.start_date}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="end_date" class="form-label">End Date</label>
		<input
			type="datetime-local"
			id="end_date"
			name="end_date"
			bind:value={formData.end_date}
			class="form-input" />
	</div>

	{#if error}
		<p class="error-message">{error}</p>
	{/if}

	{#if success}
		<p class="success-message">Notice added successfully!</p>
	{/if}

	<Button type="submit" white outline right {loading} disabled={loading}>
		{#snippet icon()}
			📌
		{/snippet}
		{loading ? 'Adding...' : 'Add Notice'}
	</Button>
</form>

<style>
	.add-form {
		&.default {
			border-color: var(--stone-3);
		}
		&.low {
			border-color: var(--yellow-3);
		}
		&.medium {
			border-color: var(--orange-3);
		}
		&.high {
			border-color: var(--red-3);
		}
	}
</style>

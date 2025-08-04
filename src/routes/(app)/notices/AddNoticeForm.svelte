<!-- AddNoticeForm.svelte -->
<script>
	import Button from '$lib/buttons/Button.svelte';

	let { onNoticeAdded } = $props();

	let formData = $state({
		title: '',
		description: '',
		urgency: 'Default',
		startDate: '',
		endDate: '',
	});

	let loading = $state(false);
	let error = $state(null);
	let success = $state(false);

	const urgencyOptions = ['Default', 'Low', 'Medium', 'High'];

	async function handleSubmit() {
		loading = true;
		error = null;
		success = false;

		const newNotice = {
			title: formData.title,
			description: formData.description,
			urgency: formData.urgency,
			start_date: formData.startDate || null,
			end_date: formData.endDate || null,
		};

		try {
			const response = await fetch('/api/notices', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newNotice),
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.message || 'Failed to add notice.');
			}

			const result = await response.json();
			success = true;

			// Call the callback function instead of dispatching
			if (onNoticeAdded) {
				onNoticeAdded(result.notice);
			}

			// Clear form
			formData = {
				title: '',
				description: '',
				urgency: 'Default',
				startDate: '',
				endDate: '',
			};
		} catch (e) {
			error = e.message;
			console.error('Error adding notice:', e);
		} finally {
			loading = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="add-form">
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
			bind:value={formData.title}
			required
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="description" class="form-label"
			>Description <span class="required">*</span></label>
		<textarea
			id="description"
			bind:value={formData.description}
			required
			placeholder="Use **bold**, *italic*, and [links](url) for formatting"
			class="form-textarea"></textarea>
	</div>

	<div class="form-group">
		<label for="urgency" class="form-label"
			>Urgency <span class="required">*</span></label>
		<select id="urgency" bind:value={formData.urgency} class="form-select">
			{#each urgencyOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="startDate" class="form-label">Start Date</label>
		<input
			type="date"
			id="startDate"
			bind:value={formData.startDate}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="endDate" class="form-label">End Date</label>
		<input type="date" id="endDate" bind:value={formData.endDate} class="form-input" />
	</div>

	{#if error}
		<p class="error-message">{error}</p>
	{/if}

	{#if success}
		<p class="success-message">Notice added successfully!</p>
	{/if}

	<Button type="submit" {loading} disabled={loading}>
		{#snippet icon()}
			📌
		{/snippet}
		{loading ? 'Adding...' : 'Add Notice'}
	</Button>
</form>

<style>
</style>

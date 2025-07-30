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

<form onsubmit={handleSubmit} class="notice-form">
	<h2 class="form-title">Add New Notice</h2>

	<div class="form-group">
		<label for="title" class="form-label">Title</label>
		<input
			type="text"
			id="title"
			bind:value={formData.title}
			required
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="description" class="form-label">Description (supports Markdown)</label>
		<textarea
			id="description"
			bind:value={formData.description}
			required
			rows="5"
			class="form-textarea"></textarea>
	</div>

	<div class="form-group">
		<label for="urgency" class="form-label">Urgency</label>
		<select id="urgency" bind:value={formData.urgency} class="form-select">
			{#each urgencyOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="startDate" class="form-label">Start Date (Optional)</label>
		<input
			type="date"
			id="startDate"
			bind:value={formData.startDate}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="endDate" class="form-label">End Date (Optional)</label>
		<input type="date" id="endDate" bind:value={formData.endDate} class="form-input" />
	</div>

	{#if error}
		<p class="error-message">{error}</p>
	{/if}

	{#if success}
		<p class="success-message">Notice added successfully!</p>
	{/if}

	<Button type="submit" disabled={loading}>
		{loading ? 'Adding...' : 'Add Notice'}
	</Button>
</form>

<style>
	.notice-form {
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 2em;
		margin-bottom: 2em;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

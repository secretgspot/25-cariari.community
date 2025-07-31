<script>
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Comments from '$lib/Comments.svelte';
	import { Button } from '$lib/buttons';
	import { formatText } from '$lib/utils/markdown.js';
	import { timeFrom } from '$lib/utils/time.js';

	let { data } = $props();
	let formMessage = $state('');
	let isSubmitting = $state(false);

	// Initialize form data with current notice data
	let editFormData = $state({
		title: data.notice?.title || '',
		description: data.notice?.description || '',
		urgency: data.notice?.urgency || 'Default',
		start_date: data.notice?.start_date
			? new Date(data.notice.start_date).toISOString().slice(0, 10)
			: '',
		end_date: data.notice?.end_date
			? new Date(data.notice.end_date).toISOString().slice(0, 10)
			: '',
	});

	const urgencyOptions = ['Default', 'Low', 'Medium', 'High'];

	const submitDeleteForm = () => {
		return async ({ result }) => {
			if (result.type === 'failure') {
				formMessage = result.data?.message || 'Delete failed';
			} else if (result.type === 'success') {
				// Redirect is handled by the server action on success
			}
		};
	};

	async function handleUpdateSubmit(event) {
		event.preventDefault(); // Manually prevent default form submission
		isSubmitting = true;
		formMessage = '';

		try {
			const response = await fetch(`/api/notices/${data.notice.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(editFormData),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Failed to update notice.');
			}

			formMessage = result.message;
			// Update the data object to reflect changes immediately
			data.notice = { ...data.notice, ...editFormData };
		} catch (e) {
			formMessage = e.message;
			console.error('Error updating notice:', e);
		} finally {
			isSubmitting = false;
		}
	}

	function handleDelete() {
		return confirm(
			'Are you sure you want to delete this notice? This action cannot be undone.',
		);
	}
</script>

<div class="notice-detail-container">
	{#if data.notice}
		<header class="notice-header">
			<div class="title-wrap">
				<h1>
					<span class="urgency {data.notice.urgency.toLowerCase()}"></span>
					{data.notice.title}
				</h1>
				<p class="notice-date">
					Posted: {new Date(data.notice.created_at).toLocaleDateString()}
				</p>
			</div>
			<div class="details-wrap">
				{#if data.notice.start_date}
					<span class="time-starts">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 320 320">
							<path
								fill="#000"
								d="M103.06 144A14.96 14.96 0 0 0 88 158.9a15.04 15.04 0 0 0 14.94 15.1l.13-30Zm175.79 26.74a15 15 0 0 0 .09-21.2L183.9 53.45a15 15 0 0 0-21.22-.14 15 15 0 0 0-.09 21.21l84.48 85.4-85.21 84.3a15 15 0 0 0-.1 21.22 15 15 0 0 0 21.22.13l95.87-94.84ZM103 159l-.06 15 165.28 1.07.07-15 .06-15L103.06 144l-.06 15Z" />
							<path
								stroke="#000"
								stroke-linecap="round"
								stroke-width="30"
								d="M54 65v192" />
						</svg>
						{timeFrom(data.notice.start_date)}
					</span>
				{/if}
				{#if data.notice.end_date}
					<span class="time-expires">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 320 320">
							<path
								fill="#000"
								d="M50.06 144A14.96 14.96 0 0 0 35 158.9 15.04 15.04 0 0 0 49.94 174l.12-30Zm175.79 26.74a15 15 0 0 0 .09-21.2L130.9 53.45a15 15 0 0 0-21.22-.14 15 15 0 0 0-.09 21.21l84.48 85.4-85.21 84.3a15 15 0 0 0-.1 21.22 15 15 0 0 0 21.22.13l95.87-94.84ZM50 159l-.06 15 165.28 1.07.07-15 .06-15L50.06 144 50 159Z" />
							<path
								stroke="#000"
								stroke-linecap="round"
								stroke-width="30"
								d="M265 64v192" />
						</svg>
						{timeFrom(data.notice.end_date)}
					</span>
				{/if}
			</div>
		</header>
		{#if data.notice.image_url}
			<img
				src={data.notice.image_url}
				alt={data.notice.title}
				class="notice-detail-image" />
		{/if}
		<div class="notice-description">{@html formatText(data.notice.description)}</div>
		<!-- {#if data.notice.urgency}
			<p><strong>Urgency:</strong> {data.notice.urgency}</p>
		{/if} -->

		<!-- Edit/Delete section for notice owner -->
		{#if data.isOwner}
			<details class="notice-actions">
				<summary>Manage Notice</summary>

				{#if formMessage}
					<p class="form-message">{formMessage}</p>
				{/if}

				<form class="edit-form" onsbmit={handleUpdateSubmit}>
					<h3>Edit Notice</h3>

					<label for="title">Title:</label>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={editFormData.title}
						required
						disabled={isSubmitting} />

					<label for="description">Description (Markdown supported):</label>
					<textarea
						id="description"
						name="description"
						bind:value={editFormData.description}
						required
						disabled={isSubmitting}
						placeholder="Use **bold**, *italic*, and [links](url) for formatting"
					></textarea>

					<label for="urgency">Urgency:</label>
					<select
						id="urgency"
						name="urgency"
						bind:value={editFormData.urgency}
						disabled={isSubmitting}>
						{#each urgencyOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>

					<label for="start_date">Start Date:</label>
					<input
						type="date"
						id="start_date"
						name="start_date"
						bind:value={editFormData.start_date}
						disabled={isSubmitting} />

					<label for="end_date">End Date (Optional):</label>
					<input
						type="date"
						id="end_date"
						name="end_date"
						bind:value={editFormData.end_date}
						disabled={isSubmitting} />

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
					<Button
						type="submit"
						onclick={handleDelete}
						red
						loading={isSubmitting}
						disabled={isSubmitting}>
						{#snippet icon()}
							❌
						{/snippet}
						Delete Notice
					</Button>
				</form>
			</details>
		{/if}

		<Comments parentId={data.notice.id} type="notice_id" userData={data} />
	{:else}
		<p>Notice not found.</p>
	{/if}
</div>

<style>
	.notice-detail-container {
	}

	.notice-header {
		display: flex;
		justify-content: space-between;

		h1 {
			margin: 0;
			display: flex;
			align-items: center;
			gap: var(--size-3);
		}

		.urgency {
			display: inline-block;
			width: 21px;
			height: 21px;
			aspect-ratio: 1;
			border-radius: var(--radius-round);
			&.default {
				background: var(--stone-3);
			}
			&.low {
				background: var(--yellow-6);
			}
			&.medium {
				background: var(--orange-6);
			}
			&.high {
				background: var(--red-6);
			}
		}

		.time-starts,
		.time-expires {
			display: flex;
			align-items: center;
			gap: var(--size-1);
			font-size: smaller;
			white-space: nowrap;
			svg {
				width: 12px;
				height: 12px;
			}
		}
	}

	.notice-detail-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1em;
	}

	.notice-detail-date {
		font-size: 0.9em;
		color: #555;
	}

	.notice-actions {
		margin-block: var(--size-7);
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--radius-2);
	}

	.notice-actions summary {
		padding: var(--size-3);
		cursor: pointer;
		background-color: var(--gray-1);
		border-radius: var(--radius-2) var(--radius-2) 0 0;
		font-weight: bold;
		color: var(--stone-9);
	}

	.notice-actions summary:hover {
		background-color: var(--gray-2);
	}

	.notice-actions[open] summary {
		border-bottom: var(--border-size-1) solid var(--gray-2);
		border-radius: var(--radius-2) var(--radius-2) 0 0;
	}

	.edit-form {
		padding: var(--size-6);
		border-bottom: var(--border-size-1) solid var(--gray-1);
	}

	.delete-form {
		padding: var(--size-6);
		text-align: center;
	}

	.edit-form h3 {
		margin-top: 0;
		margin-bottom: var(--size-6);
		color: var(--stone-9);
	}

	.edit-form label {
		display: block;
		margin-bottom: var(--size-1);
		font-weight: bold;
		color: var(--stone-7);
	}

	.edit-form input,
	.edit-form textarea,
	.edit-form select {
		width: 100%;
		padding: var(--size-3) var(--size-2);
		margin-bottom: var(--size-6);
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--radius-2);
		box-sizing: border-box;
		font-family: inherit;
	}

	.edit-form textarea {
		min-height: 300px;
		resize: vertical;
	}

	.form-actions {
		display: flex;
		gap: var(--size-3);
		margin-top: var(--size-6);
	}

	.form-message {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 1em;
		border-radius: 5px;
		margin-bottom: 1em;
	}
</style>

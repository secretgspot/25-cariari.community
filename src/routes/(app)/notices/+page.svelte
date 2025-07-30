<!-- /notices/+page.svelte -->
<script>
	import { invalidateAll } from '$app/navigation';
	import AddNoticeForm from './AddNoticeForm.svelte';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';

	let { data } = $props();

	let showForm = $state(false);
	let formMessage = $state('');

	function toggleForm() {
		showForm = !showForm;
		formMessage = ''; // Clear message when toggling
	}

	async function handleNoticeAdded(notice) {
		formMessage = 'Notice added successfully!';
		showForm = false; // Hide form after successful submission

		// Refresh the data from the server
		await invalidateAll();
	}
</script>

<div class="notices-container">
	<h1>Community Notices</h1>

	<button onclick={toggleForm} class="toggle-form-button">
		{showForm ? 'Hide Form' : 'Add New Notice'}
	</button>

	{#if formMessage}
		<p class="form-message">{formMessage}</p>
	{/if}

	{#if showForm}
		<AddNoticeForm onNoticeAdded={handleNoticeAdded} />
	{/if}

	<div class="notices-list">
		{#if data.notices && data.notices.length > 0}
			{#each data.notices as notice}
				<a href="/notices/{notice.id}" class="notice-card-link">
					<div class="notice-card">
						<h3>{notice.title}</h3>
						{#if notice.image_url}
							<img src={notice.image_url} alt={notice.title} class="notice-image" />
						{/if}
						<p>{notice.content}</p>
						{#if notice.category}
							<p><strong>Category:</strong> {notice.category}</p>
						{/if}
						{#if notice.tags && notice.tags.length > 0}
							<p><strong>Tags:</strong> {notice.tags.join(', ')}</p>
						{/if}
						<p class="notice-date">
							Posted: {new Date(notice.created_at).toLocaleDateString()}
						</p>
					</div>
				</a>
			{/each}
		{:else}
			<p>No notices available yet.</p>
		{/if}
	</div>
</div>

<style>
	.notices-container {
		max-width: 800px;
		margin: 2em auto;
		padding: 2em;
		background-color: #f9f9f9;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	h1 {
		color: #333;
		margin-bottom: 1em;
	}

	.toggle-form-button {
		background-color: #007bff;
		color: white;
		padding: 0.8em 1.2em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		margin-bottom: 1.5em;
		font-size: 0.95em;
		transition: background-color 0.2s;
	}

	.toggle-form-button:hover {
		background-color: #0056b3;
	}

	.form-message {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 1em;
		border-radius: 5px;
		margin-bottom: 1.5em;
		font-size: 0.9em;
	}

	.notices-list {
		margin-top: 2em;
		display: grid;
		gap: 1.5em;
	}

	.notice-card {
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1.5em;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		transition: all 0.2s ease-in-out;
	}

	.notice-card h3 {
		color: #007bff;
		margin-top: 0;
		margin-bottom: 0.5em;
		font-size: 1.1em;
	}

	.notice-card p {
		margin-bottom: 0.5em;
		color: #555;
		line-height: 1.5;
	}

	.notice-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1em;
	}

	.notice-date {
		font-size: 0.9em;
		color: #888;
		margin-top: 1em;
		border-top: 1px solid #eee;
		padding-top: 0.5em;
	}

	.notice-card-link {
		text-decoration: none;
		color: inherit;
		display: block;
	}

	.notice-card-link:hover .notice-card {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}
</style>

<script>
	import AddNoticeForm from './AddNoticeForm.svelte';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';

	let { data } = $props();

	let showForm = $state(false);
	let formMessage = $state('');
	let noticesList = $state(data.notices); // Local state for reactivity

	function toggleForm() {
		showForm = !showForm;
		formMessage = ''; // Clear message when toggling
	}

	function handleNoticeAdded(event) {
		noticesList = [...noticesList, event.detail];
		formMessage = 'Notice added successfully!';
		showForm = false; // Hide form after successful submission
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
		<AddNoticeForm on:noticeAdded={handleNoticeAdded} />
	{/if}

	<div class="notices-list">
		{#if noticesList && noticesList.length > 0}
			{#each noticesList as notice}
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
	}

	.notice-form label {
		display: block;
		margin-bottom: 0.5em;
		font-weight: bold;
	}

	.notice-form input[type='text'],
	.notice-form textarea {
		width: 100%;
		padding: 0.8em;
		margin-bottom: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
	}

	.notice-form textarea {
		min-height: 100px;
		resize: vertical;
	}

	.notice-form button[type='submit'] {
		background-color: #28a745;
		color: white;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.notice-form button[type='submit']:hover {
		background-color: #218838;
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
	}

	.notice-card h3 {
		color: #007bff;
		margin-top: 0;
		margin-bottom: 0.5em;
	}

	.notice-card p {
		margin-bottom: 0.5em;
		color: #555;
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
	}

	.notice-card-link {
		text-decoration: none;
		color: inherit;
		display: block;
	}

	.notice-card-link:hover .notice-card {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
		transition: all 0.2s ease-in-out;
	}
	/* Added a comment to force re-compilation */
</style>

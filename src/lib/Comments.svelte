<script>
	import { onMount } from 'svelte';
	import { ago } from '$lib/utils/time.js';

	let { parentId, type, userData } = $props();

	let comments = $state([]);
	let newCommentContent = $state('');
	let loading = $state(true);
	let error = $state(null);

	async function fetchComments() {
		loading = true;
		error = null;
		try {
			const url = `/api/comments?${type}=${parentId}`;
			// console.log('Fetching comments from:', url);
			// console.log('parentId:', parentId, 'type:', type);

			const response = await fetch(url);
			// console.log('Response status:', response.status, 'ok:', response.ok);

			if (!response.ok) {
				const errData = await response.json();
				console.error('API error response:', errData);
				throw new Error(errData.message || 'Failed to fetch comments');
			}

			const data = await response.json();
			comments = data;
		} catch (e) {
			error = e.message;
			console.error('Error fetching comments:', e);
		} finally {
			loading = false;
		}
	}

	async function submitComment() {
		if (!newCommentContent.trim()) {
			error = 'Comment cannot be empty.';
			return;
		}

		loading = true;
		error = null;
		try {
			const body = {
				content: newCommentContent,
			};
			if (type === 'notice_id') body.notice_id = parentId;
			if (type === 'event_id') body.event_id = parentId;
			if (type === 'lost_and_found_id') body.lost_and_found_id = parentId;
			if (type === 'service_id') body.service_id = parentId;

			const response = await fetch(`/api/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.message || 'Failed to add comment');
			}

			newCommentContent = ''; // Clear input
			await fetchComments(); // Refresh comments
		} catch (e) {
			error = e.message;
			console.error('Error submitting comment:', e);
		} finally {
			loading = false;
		}
	}

	// TODO: Implement edit and delete functionality
	async function editComment(commentId, currentContent) {
		const updatedContent = prompt('Edit your comment:', currentContent);
		if (!updatedContent || !updatedContent.trim()) return;

		loading = true;
		error = null;
		try {
			const response = await fetch(`/api/comments/${commentId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content: updatedContent }),
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.message || 'Failed to update comment');
			}
			await fetchComments();
		} catch (e) {
			error = e.message;
			console.error('Error editing comment:', e);
		} finally {
			loading = false;
		}
	}

	async function deleteComment(commentId) {
		if (!confirm('Are you sure you want to delete this comment?')) return;

		loading = true;
		error = null;
		try {
			const response = await fetch(`/api/comments/${commentId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.message || 'Failed to delete comment');
			}
			await fetchComments();
		} catch (e) {
			error = e.message;
			console.error('Error deleting comment:', e);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchComments();
	});
</script>

<div class="comments-section">
	<h2>Comments</h2>

	{#if userData?.is_logged_in}
		<div class="new-comment-form">
			<textarea bind:value={newCommentContent} placeholder="Add a comment..."></textarea>
			<button onclick={submitComment} disabled={loading}>Submit Comment</button>
		</div>
	{:else}
		<p>Please <a href="/login">log in</a> to add comments.</p>
	{/if}

	{#if loading}
		<p>Loading comments...</p>
	{:else if error}
		<p class="error-message">Error: {error}</p>
	{:else if comments.length === 0}
		<p>No comments yet. Be the first to comment!</p>
	{:else}
		<div class="comments-list">
			{#each comments as comment (comment.id)}
				<div class="comment-card">
					<div class="comment-header">
						{#if comment.profiles?.avatar_url}
							<img
								src={comment.profiles.avatar_url}
								alt="Avatar"
								class="comment-avatar" />
						{/if}
						<span class="comment-author"
							>{comment.profiles?.username || 'Anonymous'}</span>
						<span class="comment-date">{ago(comment.created_at)} ago</span>
					</div>
					<p class="comment-content">{comment.content}</p>
					{#if userData?.user?.id === comment.user_id}
						<div class="comment-actions">
							<button onclick={() => editComment(comment.id, comment.content)}
								>Edit</button>
							<button onclick={() => deleteComment(comment.id)}>Delete</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.comments-section {
		margin-top: 2em;
		padding: 1.5em;
		background-color: #f0f2f5;
		border-radius: 8px;
	}

	h2 {
		color: #333;
		margin-bottom: 1em;
	}

	.new-comment-form {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		margin-bottom: 1.5em;
	}

	.new-comment-form textarea {
		width: 100%;
		min-height: 80px;
		padding: 0.8em;
		border: 1px solid #ccc;
		border-radius: 4px;
		resize: vertical;
	}

	.new-comment-form button {
		align-self: flex-end;
		background-color: #007bff;
		color: white;
		padding: 0.6em 1em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.new-comment-form button:hover {
		background-color: #0056b3;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.comment-card {
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1em;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}

	.comment-header {
		display: flex;
		align-items: center;
		gap: 0.5em;
		margin-bottom: 0.5em;
	}

	.comment-avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		object-fit: cover;
	}

	.comment-author {
		font-weight: bold;
		color: #555;
	}

	.comment-date {
		font-size: 0.8em;
		color: #888;
	}

	.comment-content {
		margin-bottom: 0.5em;
		color: #333;
	}

	.comment-actions button {
		background: none;
		border: none;
		color: #007bff;
		cursor: pointer;
		font-size: 0.8em;
		margin-right: 0.5em;
	}

	.comment-actions button:hover {
		text-decoration: underline;
	}

	.error-message {
		color: red;
		margin-top: 1em;
	}
</style>

<script>
	import { onMount } from 'svelte';
	import Button from '$lib/buttons/Button.svelte';
	import { timeFrom } from '$lib/utils/time.js';
	import { addToast } from '$lib/toasts';

	let { parentId, type, userData } = $props();

	let comments = $state([]);
	let newCommentContent = $state('');
	let loading = $state(true);
	let error = $state(null);

	let formError = $state(null);

	async function fetchComments() {
		loading = true;
		error = null;
		try {
			const url = `/api/comments?${type}=${parentId}`;
			const response = await fetch(url);

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
			// formError = 'Comment cannot be empty.';
			addToast({
				message: 'Comment cannot be empty.',
				type: 'error',
				timeout: 3000,
			});
			return;
		}

		loading = true;
		formError = null; // Clear form error
		error = null; // Clear API error

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

			<Button onclick={submitComment} {loading} disabled={loading}>
				{#snippet icon()}
					👍
				{/snippet}
				{loading ? 'Adding...' : 'Submit Comment'}
			</Button>

			{#if formError}
				<div class="form-message">{formError}</div>
			{/if}
		</div>
	{:else}
		<p>Please <a href="/login">log in</a> to add comments.</p>
	{/if}

	{#if loading}
		<p class="loading-comments">Loading comments...</p>
	{:else if error}
		<p class="error-message">Error: {error}</p>
	{:else if comments.length === 0}
		<p class="no-comments">No comments yet. Be the first to comment!</p>
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
							>{comment.profiles?.username || 'Community Member'}</span>
						<span class="comment-date">{timeFrom(comment.created_at)}</span>
					</div>
					<p class="comment-content">{comment.content}</p>
					{#if userData?.user?.id === comment.user_id || userData?.is_admin}
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
		margin-block-start: var(--size-9);
		h2 {
			color: var(--stone-11);
			margin-bottom: var(--size-3);
		}
	}

	.new-comment-form {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		margin-bottom: var(--size-8);

		textarea {
			width: auto;
			min-height: 90px;
			padding: var(--size-2);
			border: var(--border-size-1) solid var(--gray-1);
			border-radius: var(--border-size-3);
			resize: vertical;
		}

		:global(button) {
			align-self: end;
		}
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.comment-card {
		position: relative;
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--border-size-3);
		padding: var(--size-2);

		.comment-header {
			display: flex;
			align-items: center;
			gap: var(--size-2);
			margin-bottom: var(--size-3);
			font-size: small;

			.comment-avatar {
				width: 18px;
				height: 18px;
				border-radius: var(--radius-round);
				object-fit: cover;
				aspect-ratio: 1;
			}

			.comment-author {
				font-weight: bold;
				color: var(--stone-7);
			}

			.comment-date {
				color: var(--stone-6);
			}
		}

		.comment-content {
			margin-block: var(--size-1);
			color: var(--stone-11);
			font-size: smaller;
		}

		.comment-actions {
			position: absolute;
			top: 0;
			right: 0;

			button {
				background: none;
				border: none;
				color: var(--blue-6);
				cursor: pointer;
				font-size: x-small;
				&:hover {
					text-decoration: underline;
				}
			}
		}
	}

	.form-message {
		border: var(--border-size-1) solid var(--red-3);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		margin-block: var(--size-6);
		/* &.success {
			border-color: var(--green-3);
		} */
	}

	.error-message {
		border: var(--border-size-1) solid var(--red-3);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		margin-block: var(--size-6);
	}

	.no-comments,
	.loading-comments {
		border: var(--border-size-1) solid var(--gray-1);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		margin-block: var(--size-6);
	}
	.loading-comments {
		text-align: center;
	}
</style>

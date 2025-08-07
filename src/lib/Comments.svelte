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

			<Button right outline onclick={submitComment} {loading} disabled={loading}>
				{#snippet icon()}
					<svg
						width="21"
						height="21"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 800 800"
						><path
							fill="currentColor"
							d="M210.77 66.592A179.995 179.995 0 0 0 31 246.36v227.078a179.995 179.995 0 0 0 179.77 179.769h384.932a47.167 47.167 0 0 1 33.494 13.852l91.361 91.36a28.39 28.39 0 0 0 30.918 6.142A28.39 28.39 0 0 0 769 738.36v-492A179.996 179.996 0 0 0 589.23 66.592H210.77Zm378.46 56.768a123.15 123.15 0 0 1 123 123v423.461l-42.917-42.88a103.297 103.297 0 0 0-33.747-22.633 103.29 103.29 0 0 0-39.864-7.87H210.77a123.156 123.156 0 0 1-123-123V246.36a123.152 123.152 0 0 1 123-123h378.46Zm-179.011 34.819c-15.677 0-28.385 12.708-28.385 28.384v124.893H239.911c-15.676 0-28.385 12.708-28.385 28.385.001 15.676 12.709 28.384 28.385 28.384h141.923v139.652c0 15.676 12.708 28.385 28.385 28.385 15.676 0 28.385-12.709 28.385-28.385V368.225h122.621c15.676 0 28.384-12.708 28.384-28.384 0-15.677-12.708-28.385-28.384-28.385H438.604V186.563c0-15.676-12.709-28.384-28.385-28.384Z" /></svg>
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
		text-align: center;
	}
</style>

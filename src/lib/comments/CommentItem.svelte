<!-- CommentItem.svelte -->
<script>
	import { timeFrom } from '$lib/utils/time.js';
	import { addToast } from '$lib/toasts';

	let {
		comment,
		userData,
		onCommentUpdated,
		onCommentDeleted,
		onOptimisticUpdate,
		onOptimisticRemove,
	} = $props();

	let loading = $state(false);

	async function editComment() {
		const updatedContent = prompt('Edit your comment:', comment.content);
		if (!updatedContent || !updatedContent.trim()) return;

		loading = true;

		// Optimistic update
		const originalContent = comment.content;
		onOptimisticUpdate(comment.id, {
			content: updatedContent,
			isOptimistic: true,
		});

		try {
			const response = await fetch(`/api/comments/${comment.id}`, {
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

			const updatedComment = await response.json();
			onCommentUpdated({ ...updatedComment, isOptimistic: false });

			addToast({
				message: 'Comment updated!',
				type: 'success',
				timeout: 1200,
			});
		} catch (e) {
			// Revert optimistic update
			onOptimisticUpdate(comment.id, {
				content: originalContent,
				isOptimistic: false,
			});

			addToast({
				message: e.message || 'Failed to update comment',
				type: 'error',
				timeout: 3000,
			});
			console.error('Error editing comment:', e);
		} finally {
			loading = false;
		}
	}

	async function deleteComment() {
		if (!confirm('Are you sure you want to delete this comment?')) return;

		loading = true;

		// Optimistic removal
		const wasOptimistic = comment.isOptimistic;
		onOptimisticRemove(comment.id);

		try {
			const response = await fetch(`/api/comments/${comment.id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.message || 'Failed to delete comment');
			}

			onCommentDeleted(comment.id);

			addToast({
				message: 'Comment deleted!',
				type: 'success',
				timeout: 1200,
			});
		} catch (e) {
			// Revert optimistic removal if it wasn't already optimistic
			if (!wasOptimistic) {
				onOptimisticUpdate(comment.id, comment);
			}

			addToast({
				message: e.message || 'Failed to delete comment',
				type: 'error',
				timeout: 3000,
			});
			console.error('Error deleting comment:', e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="comment-card" class:optimistic={comment.isOptimistic}>
	<div class="comment-header">
		{#if comment.profiles?.avatar_url}
			<img
				width="27px"
				height="27px"
				src={comment.profiles.avatar_url}
				alt="Avatar"
				class="comment-avatar" />
		{/if}
		<span class="comment-author">{comment.profiles?.username || 'Community Member'}</span>
		<span class="comment-date">{timeFrom(comment.created_at)}</span>
	</div>
	<p class="comment-content">{comment.content}</p>
	{#if userData?.user?.id === comment.user_id || userData?.is_admin}
		<div class="comment-actions">
			{#if loading}
				<span class="comment-loading">Processing...</span>
			{:else}
				<button onclick={editComment}>Edit</button>
				<button onclick={deleteComment}>Delete</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.comment-card {
		position: relative;
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--border-size-3);
		padding: var(--size-2);
		transition: opacity 0.2s ease;

		&.optimistic {
			border-color: var(--stone-3);
		}

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

			.comment-loading {
				font-size: x-small;
				color: var(--stone-6);
				font-style: italic;
			}

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
</style>

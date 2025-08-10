<!-- CommentsList.svelte -->
<script>
	import CommentItem from './CommentItem.svelte';

	let {
		comments,
		userData,
		initialLoading,
		error,
		onCommentUpdated,
		onCommentDeleted,
		onOptimisticUpdate,
		onOptimisticRemove,
	} = $props();
</script>

{#if initialLoading}
	<p class="loading-comments">Loading comments...</p>
{:else if error}
	<p class="error-message">Error: {error}</p>
{:else if comments.length === 0}
	<p class="no-comments">No comments yet. Be the first to comment!</p>
{:else}
	<div class="comments-list">
		{#each comments as comment (comment.id)}
			<CommentItem
				{comment}
				{userData}
				{onCommentUpdated}
				{onCommentDeleted}
				{onOptimisticUpdate}
				{onOptimisticRemove} />
		{/each}
	</div>
{/if}

<style>
	.comments-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.error-message {
		border: var(--border-size-1) solid var(--red-3);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		margin-block: var(--size-6);
	}

	.no-comments,
	.loading-comments {
		border: var(--border-size-1) solid var(--surface-3);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		margin-block: var(--size-6);
		text-align: center;
		color: var(--text-2);
	}
</style>

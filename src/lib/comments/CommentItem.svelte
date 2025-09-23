<!-- CommentItem.svelte -->
<script>
	import { timeFrom } from '$lib/utils/time.js';
	import { addToast } from '$lib/toasts';
	import Dialog from '$lib/Dialog.svelte';
	import { Button } from '$lib/buttons';
	import Actions from '$lib/comments/Actions.svelte';
	import Icon from '$lib/Icon.svelte';

	let {
		comment,
		userData,
		onCommentUpdated,
		onCommentDeleted,
		onOptimisticUpdate,
		onOptimisticRemove,
	} = $props();

	let loading = $state(false);
	let showEditDialog = $state(false);
	let showDeleteDialog = $state(false);
	let editedContent = $state(comment.content);

	$effect(() => {
		editedContent = comment.content;
	});

	async function handleEditConfirm() {
		if (!editedContent || !editedContent.trim()) {
			addToast({
				message: 'Comment cannot be empty.',
				type: 'error',
				timeout: 3000,
			});
			return;
		}

		showEditDialog = false;
		loading = true;

		// Optimistic update
		const originalContent = comment.content;
		onOptimisticUpdate(comment.id, {
			content: editedContent,
			isOptimistic: true,
		});

		try {
			const response = await fetch(`/api/comments/${comment.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content: editedContent }),
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

	async function handleDeleteConfirm() {
		showDeleteDialog = false;
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
	<div class="avatar-wrap">
		{#if comment.profiles?.avatar_url}
			<img
				width="27px"
				height="27px"
				src={comment.profiles.avatar_url}
				alt="Avatar"
				class="avatar" />
		{/if}
	</div>
	<div class="header">
		<div class="user">
			<span class="author">{comment.profiles?.username || 'Anon'}</span>
			<span class="date">{timeFrom(comment.created_at)}</span>
		</div>

		{#if userData?.user?.id === comment.user_id || userData?.is_admin}
			<div class="actions">
				{#if loading}
					<span class="loading">Processing...</span>
				{:else}
					<Actions>
						<Button
							onclick={() => (showEditDialog = true)}
							size="icon"
							sound_pattern="tick"
							class="button">
							{#snippet icon()}
								<Icon kind="edit" size="18" />
							{/snippet}
						</Button>

						<Button
							onclick={() => (showDeleteDialog = true)}
							size="icon"
							sound_pattern="tick"
							class="button">
							{#snippet icon()}
								<Icon kind="delete" size="18" />
							{/snippet}
						</Button>
					</Actions>
				{/if}
			</div>
		{/if}
	</div>
	<div class="comment">
		<p class="content">{comment.content}</p>
	</div>
</div>

<Dialog
	open={showEditDialog}
	title="Edit Comment"
	type="confirm"
	onConfirm={handleEditConfirm}
	onCancel={() => (showEditDialog = false)}>
	{#snippet children()}
		<textarea bind:value={editedContent} rows="5" class="form-textarea"></textarea>
	{/snippet}
</Dialog>

<Dialog
	open={showDeleteDialog}
	title="Delete Comment"
	type="confirm"
	onConfirm={handleDeleteConfirm}
	onCancel={() => (showDeleteDialog = false)}>
	{#snippet children()}
		<p>Are you sure you want to delete this comment? This action cannot be undone.</p>
	{/snippet}
</Dialog>

<style>
	.comment-card {
		transition: opacity var(--transition) ease;
		display: grid;
		grid-template-columns: min-content 1fr;
		grid-template-areas:
			'avatar header'
			'avatar comment';
		row-gap: var(--size-1);

		&.optimistic {
			border-color: var(--surface-4);
		}

		.avatar-wrap {
			grid-area: avatar;
			padding-inline-end: var(--size-3);
			.avatar {
				border-radius: var(--radius-round);
				object-fit: cover;
				aspect-ratio: 1;
			}
		}

		.header {
			grid-area: header;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--size-2);

			.user {
				display: flex;
				align-items: center;
				gap: var(--size-2);
				line-height: 1;
			}

			.author {
				font-weight: bold;
				color: var(--text-2);
			}

			.date {
				color: var(--text-2);
				font-size: smaller;
			}
		}

		.comment {
			grid-area: comment;
			.content {
				margin-block: var(--size-1);
				color: var(--text-1);
			}
		}

		.actions {
			display: flex;
			.loading {
				font-size: x-small;
				color: var(--text-1);
				font-style: italic;
			}

			:global(button.button) {
				border: none;
			}
		}
	}
</style>

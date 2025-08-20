<!-- CommentForm.svelte -->
<script>
	import { addToast } from '$lib/toasts';
	import Button from '$lib/buttons/Button.svelte';
	import Icon from '$lib/Icon.svelte';

	let { parentId, type, userData, onCommentAdded } = $props();

	let newCommentContent = $state('');
	let submitting = $state(false);

	async function submitComment() {
		if (!newCommentContent.trim()) {
			addToast({
				message: 'Comment cannot be empty.',
				type: 'error',
				timeout: 3000,
			});
			return;
		}

		submitting = true;
		const commentContent = newCommentContent;
		newCommentContent = ''; // Clear input immediately

		try {
			const body = {
				content: commentContent,
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

			const newComment = await response.json();

			// Trigger a refresh of the comments list instead of adding directly
			onCommentAdded(newComment);

			addToast({
				message: 'Comment added!',
				type: 'success',
				timeout: 1200,
			});
		} catch (e) {
			// Restore content on error
			newCommentContent = commentContent;

			addToast({
				message: e.message || 'Failed to add comment',
				type: 'error',
				timeout: 3000,
			});
			console.error('Error submitting comment:', e);
		} finally {
			submitting = false;
		}
	}
</script>

<div class="comment-form">
	<textarea
		id="comment-input"
		class="form-textarea"
		bind:value={newCommentContent}
		placeholder="Add a comment..."
		disabled={submitting}></textarea>

	<Button right onclick={submitComment} loading={submitting} disabled={submitting}>
		{#snippet icon()}
			<Icon kind="add_comment" size="21" />
		{/snippet}
		{submitting ? 'Adding...' : 'Submit Comment'}
	</Button>
</div>

<style>
	.comment-form {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		margin-bottom: var(--size-8);
	}
</style>

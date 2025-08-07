<!-- CommentForm.svelte -->
<script>
	import Button from '$lib/buttons/Button.svelte';
	import { addToast } from '$lib/toasts';

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
			onCommentAdded();

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
		bind:value={newCommentContent}
		placeholder="Add a comment..."
		disabled={submitting}></textarea>

	<Button
		right
		outline
		onclick={submitComment}
		loading={submitting}
		disabled={submitting}>
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
		{submitting ? 'Adding...' : 'Submit Comment'}
	</Button>
</div>

<style>
	.comment-form {
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

		textarea:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}

		:global(button) {
			align-self: end;
		}
	}
</style>

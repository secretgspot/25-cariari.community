<!-- CommentsSection.svelte (Main Component) -->
<script>
	import { onMount } from 'svelte';
	import CommentForm from './CommentForm.svelte';
	import CommentsList from './CommentsList.svelte';
	import { addToast } from '$lib/toasts';

	let { parentId, type, userData } = $props();

	let comments = $state([]);
	let initialLoading = $state(true);
	let error = $state(null);

	async function fetchComments() {
		initialLoading = true;
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
			initialLoading = false;
		}
	}

	const handleCommentAdded = (newComment) => {
		const enrichedComment = {
			...newComment,
			profiles: userData?.userProfile, // Add the current user's profile, safely access
			created_at: newComment.created_at || new Date().toISOString(), // Use API's timestamp or fallback
		};
		comments = [enrichedComment, ...comments];
	};

	const handleCommentUpdated = (updatedComment) => {
		comments = comments.map((c) => (c.id === updatedComment.id ? updatedComment : c));
	};

	const handleCommentDeleted = (commentId) => {
		comments = comments.filter((c) => c.id !== commentId);
	};

	const handleOptimisticAdd = (optimisticComment) => {
		comments = [optimisticComment, ...comments];
	};

	const handleOptimisticRemove = (commentId) => {
		comments = comments.filter((c) => c.id !== commentId);
	};

	const handleOptimisticUpdate = (commentId, updates) => {
		comments = comments.map((c) => (c.id === commentId ? { ...c, ...updates } : c));
	};

	onMount(() => {
		fetchComments();
	});
</script>

<div class="comments-section">
	<h2>Comments</h2>

	{#if userData?.is_logged_in}
		<CommentForm {parentId} {type} {userData} onCommentAdded={handleCommentAdded} />
	{:else}
		<p>Please <a href="/login">log in</a> to add comments.</p>
	{/if}

	<CommentsList
		{comments}
		{userData}
		{initialLoading}
		{error}
		onCommentUpdated={handleCommentUpdated}
		onCommentDeleted={handleCommentDeleted}
		onOptimisticUpdate={handleOptimisticUpdate}
		onOptimisticRemove={handleOptimisticRemove} />
</div>

<style>
	.comments-section {
		margin-block-start: var(--size-9);
		h2 {
			color: var(--text-2);
			margin-bottom: var(--size-3);
		}
	}
</style>

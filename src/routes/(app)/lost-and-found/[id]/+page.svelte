<script>
	import CommentsSection from '$lib/comments/CommentsSection.svelte';
	// import Comments from '$lib/Comments.svelte';
	import ManageLostAndFound from './ManageLostAndFound.svelte';
	import { formatText } from '$lib/utils/markdown.js';
	import {
		timeFrom,
		timeFromLong,
		getExpirationDate,
		formatDate,
	} from '$lib/utils/time.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.post.title} - Lost & Found - Cariari Community</title>
	<meta name="description" content={data.post.description} />
</svelte:head>

<div class="lost-found-detail-container">
	{#if data.post}
		<h1>{data.post.title} ({data.post.category})</h1>

		<div class="meta">
			<span>Posted: {timeFrom(data.post.created_at)}</span>
			<span>Expires in: {timeFromLong(getExpirationDate(data.post.created_at, 14))}</span>
		</div>

		{#if data.post.image_url}
			<img src={data.post.image_url} alt={data.post.title} class="image" />
		{/if}

		<div class="description">{@html formatText(data.post.description)}</div>

		<fieldset class="details">
			<legend>Details</legend>

			{#if data.post.location}
				<p><strong>Location:</strong> {data.post.location}</p>
			{/if}

			<p><strong>Contact:</strong> {data.post.contact}</p>

			<p class="date">
				<strong>Date:</strong>
				{formatDate(data.post.created_at)}
			</p>
		</fieldset>

		<ManageLostAndFound post={data.post} isOwner={data.isOwner} />

		<!-- <Comments parentId={data.post.id} type="lost_and_found_id" userData={data} /> -->
		<CommentsSection parentId={data.post.id} type="lost_and_found_id" userData={data} />
	{:else}
		<p>Post not found.</p>
	{/if}
</div>

<style>
	.lost-found-detail-container {
		position: relative;
		max-width: 72ch;
		width: 100%;
		place-self: center;
		/* Tablets and small laptops (769px - 1024px) */
		@media (min-width: 769px) {
			margin-block: var(--size-8);
		}

		/* Large desktops and high-resolution screens (1025px and up) */
		@media (min-width: 1025px) {
			margin-block: var(--size-9);
		}

		h1 {
			margin-bottom: var(--size-3);
		}

		.meta {
			display: flex;
			justify-content: space-between;
			font-size: small;
			color: var(--stone-9);
			margin-inline: var(--size-3);
			margin-block: var(--size-1);
		}

		.image {
			max-width: 100%;
			width: 100%;
			height: auto;
			border-radius: var(--radius-2);
			margin-bottom: 0;
		}

		.description {
			margin-inline: var(--size-3);
		}

		.details {
			margin-block-start: var(--size-6);
			border-radius: var(--border-size-3);
			display: flex;
			flex-direction: column;
			gap: var(--size-1);
			p {
				margin-block: var(--size-1);
				strong {
					font-size: smaller;
				}
			}
		}
	}
</style>

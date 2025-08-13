<script>
	import CommentsSection from '$lib/comments/CommentsSection.svelte';
	import ManageNotice from './ManageNotice.svelte';
	import { formatText } from '$lib/utils/markdown.js';
	import { timeFrom, timeFromLong } from '$lib/utils/time.js';
	import Icon from '$lib/Icon.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.notice.title} - Notices - Cariari Community</title>
	<meta name="description" content={data.notice.description} />
</svelte:head>

<div class="notice-detail-container">
	{#if data.notice}
		<header class="notice-header">
			<div class="title-wrap">
				<p class="posted">
					Posted: {timeFromLong(data.notice.created_at)}
				</p>
				<h1>
					<span class="urgency {data.notice.urgency.toLowerCase()}"></span>
					{data.notice.title}
				</h1>
			</div>
			<div class="details-wrap">
				{#if data.notice.start_date}
					<span class="time-starts">
						<Icon kind="start" size="9" />
						{timeFrom(data.notice.start_date)}
					</span>
				{/if}
				{#if data.notice.end_date}
					<span class="time-expires">
						<Icon kind="end" size="9" />
						{timeFrom(data.notice.end_date)}
					</span>
				{/if}
			</div>
		</header>

		<div class="description">{@html formatText(data.notice.description)}</div>

		<!-- Use the extracted ManageNotice component -->
		<ManageNotice notice={data.notice} isOwner={data.isOwner} />

		<!-- <Comments parentId={data.notice.id} type="notice_id" userData={data} /> -->
		<CommentsSection parentId={data.notice.id} type="notice_id" userData={data} />
	{:else}
		<p>Notice not found.</p>
	{/if}
</div>

<style>
	.notice-detail-container {
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
	}

	.notice-header {
		display: flex;
		justify-content: space-between;
		margin-block-end: var(--size-9);

		h1 {
			margin: 0;
			display: flex;
			align-items: center;
			gap: var(--size-3);
			color: var(--text-1);
		}

		.urgency {
			display: inline-block;
			width: 21px;
			height: 21px;
			aspect-ratio: 1;
			border-radius: var(--radius-round);
			&.default {
				background: var(--stone-6);
			}
			&.low {
				background: var(--yellow-6);
			}
			&.medium {
				background: var(--orange-6);
			}
			&.high {
				background: var(--red-6);
			}
		}

		.time-starts,
		.time-expires {
			display: flex;
			align-items: center;
			gap: var(--size-1);
			font-size: smaller;
			white-space: nowrap;
			color: var(--text-2);
		}
	}

	.posted {
		font-size: small;
		margin-top: 0;
		color: var(--stone-6);
	}

	.description {
		margin-block: var(--size-3);
	}
</style>

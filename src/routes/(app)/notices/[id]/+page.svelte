<script>
	import CommentsSection from '$lib/comments/CommentsSection.svelte';
	// import Comments from '$lib/Comments.svelte';
	import ManageNotice from './ManageNotice.svelte';
	import { formatText } from '$lib/utils/markdown.js';
	import { timeFrom } from '$lib/utils/time.js';

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
					Posted: {timeFrom(data.notice.created_at)}
				</p>
				<h1>
					<span class="urgency {data.notice.urgency.toLowerCase()}"></span>
					{data.notice.title}
				</h1>
			</div>
			<div class="details-wrap">
				{#if data.notice.start_date}
					<span class="time-starts">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 320 320">
							<path
								fill="#000"
								d="M103.06 144A14.96 14.96 0 0 0 88 158.9a15.04 15.04 0 0 0 14.94 15.1l.13-30Zm175.79 26.74a15 15 0 0 0 .09-21.2L183.9 53.45a15 15 0 0 0-21.22-.14 15 15 0 0 0-.09 21.21l84.48 85.4-85.21 84.3a15 15 0 0 0-.1 21.22 15 15 0 0 0 21.22.13l95.87-94.84ZM103 159l-.06 15 165.28 1.07.07-15 .06-15L103.06 144l-.06 15Z" />
							<path
								stroke="#000"
								stroke-linecap="round"
								stroke-width="30"
								d="M54 65v192" />
						</svg>
						{timeFrom(data.notice.start_date)}
					</span>
				{/if}
				{#if data.notice.end_date}
					<span class="time-expires">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 320 320">
							<path
								fill="#000"
								d="M50.06 144A14.96 14.96 0 0 0 35 158.9 15.04 15.04 0 0 0 49.94 174l.12-30Zm175.79 26.74a15 15 0 0 0 .09-21.2L130.9 53.45a15 15 0 0 0-21.22-.14 15 15 0 0 0-.09 21.21l84.48 85.4-85.21 84.3a15 15 0 0 0-.1 21.22 15 15 0 0 0 21.22.13l95.87-94.84ZM50 159l-.06 15 165.28 1.07.07-15 .06-15L50.06 144 50 159Z" />
							<path
								stroke="#000"
								stroke-linecap="round"
								stroke-width="30"
								d="M265 64v192" />
						</svg>
						{timeFrom(data.notice.end_date)}
					</span>
				{/if}
			</div>
		</header>
		{#if data.notice.image_url}
			<img src={data.notice.image_url} alt={data.notice.title} class="image" />
		{/if}
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
		}

		.urgency {
			display: inline-block;
			width: 21px;
			height: 21px;
			aspect-ratio: 1;
			border-radius: var(--radius-round);
			&.default {
				background: var(--stone-3);
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
			svg {
				width: 12px;
				height: 12px;
			}
		}
	}

	.image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1em;
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

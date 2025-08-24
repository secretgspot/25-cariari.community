<script>
	import { LinkButton } from '$lib/buttons';
	import ExpirationIndicator from '$lib/ExpirationIndicator.svelte';
	import { isExpired, getExpirationDate } from '$lib/utils/time.js';

	let { data } = $props();
</script>

<fieldset class="lost-found-container">
	<legend>
		<span>Lost & Found</span> •
		<LinkButton href="/lost-and-found" class="view-all">View all</LinkButton>
	</legend>

	<div class="items-grid">
		{#each data as post}
			<LinkButton
				href={`/lost-and-found/${post.id}`}
				underline={false}
				sound_pattern="swipe"
				class="post">
				<span
					class="category"
					class:lost={post.category === 'Lost'}
					class:found={post.category === 'Found'}>
					{post.category}
				</span>

				{#if post.image_url}
					<img class="image" src={post.image_url} alt={post.title} />
				{:else}
					<div class="placeholder-image">
						<span>{post.category === 'Lost' ? '🔍' : '✋'}</span>
					</div>
				{/if}
				<h3 class="title">{post.title}</h3>

				<ExpirationIndicator
					start_date={post.created_at}
					end_date={getExpirationDate(post.created_at, 14)} />
			</LinkButton>
		{/each}
	</div>
</fieldset>

<style>
	.lost-found-container {
		border-radius: var(--radius-2);
		border: none;

		legend {
			span {
				font-weight: 600;
				color: var(--text-2);
			}
		}
	}

	.items-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--size-3);
		margin-block: var(--size-3);
		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
		}

		/* Tablets and small laptops (769px - 1024px) */
		@media (min-width: 769px) {
			grid-template-columns: repeat(4, 1fr);
		}

		/* Large desktops and high-resolution screens (1025px and up) */
		@media (min-width: 1025px) {
		}

		/* Extra-large screens (1440px and up) */
		@media (min-width: 1440px) {
		}

		:global(a.post) {
			display: grid;
			color: inherit;
			position: relative;
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			justify-content: normal;
			box-shadow: 0px 2px 0px 0px var(--surface-4);
			&:hover,
			&:active {
				box-shadow: 0px 0px 0px 0px var(--surface-4);
				transform: translateY(2px);
			}

			.category {
				padding: var(--size-1) var(--size-2);
				border-radius: var(--radius-2);
				display: inline-block;
				position: absolute;
				top: var(--size-3);
				font-size: small;
				background: var(--surface-1);
				&.lost {
					left: 0;
					border-bottom-left-radius: 0;
					border-top-left-radius: 0;
				}
				&.found {
					right: 0;
					border-bottom-right-radius: 0;
					border-top-right-radius: 0;
				}
			}

			.image {
				width: 100%;
				object-fit: cover;
				aspect-ratio: 1;
				border-radius: inherit;
			}

			.title {
				margin-block: var(--size-3);
				margin-inline: var(--size-2);
				font-size: smaller;
				color: var(--text-1);
				font-weight: 500;
			}
		}

		.placeholder-image {
			width: 100%;
			height: 100%;
			background: var(--gradient-23);
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 2em;
			aspect-ratio: 1;
		}
	}
</style>

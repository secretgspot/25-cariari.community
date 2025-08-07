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
			<div class="item-card" class:expired={isExpired(post.created_at, 14)}>
				<a href={`/lost-and-found/${post.id}`} class="item-link">
					<span
						class="category"
						class:lost={post.category === 'Lost'}
						class:found={post.category === 'Found'}>
						{post.category}
					</span>

					{#if post.image_url}
						<img src={post.image_url} alt={post.title} />
					{:else}
						<div class="placeholder-image">
							<span>{post.category === 'Lost' ? '🔍' : '✋'}</span>
						</div>
					{/if}
					<h3 class="title">{post.title}</h3>

					<!-- <div class="info">
						<div class="date">
							{new Date(post.date).toLocaleDateString()}
						</div>
					</div> -->
				</a>
				<ExpirationIndicator
					start_date={post.created_at}
					end_date={getExpirationDate(post.created_at, 14)} />
			</div>
		{/each}
	</div>
</fieldset>

<style>
	.lost-found-container {
		border-radius: var(--border-size-3);
		border: none;

		legend {
			span {
				font-weight: 600;
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
	}

	.item-card {
		position: relative;
		border-radius: var(--border-size-3);
		overflow: hidden;
		border: var(--border-size-1) solid var(--gray-1);
		&:hover {
			box-shadow: var(--shadow-1);
		}
		&.expired {
			opacity: 0.6;
		}

		img {
			width: 100%;
			/* height: 120px; */
			object-fit: cover;
			aspect-ratio: 1;
		}

		.item-link {
			display: block;
			text-decoration: none;
			color: inherit;
			position: relative;
		}
	}

	.placeholder-image {
		width: 100%;
		height: 120px;
		background: var(--gradient-23);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2em;
	}

	.category {
		margin: 0 0 var(--size-1) 0;
		padding: var(--size-1) var(--size-2);
		border-radius: var(--border-size-3);
		font-weight: bold;
		text-transform: uppercase;
		display: inline-block;
		position: absolute;
		font-size: small;
		&.lost {
			background-color: var(--red-1);
			color: var(--red-6);
		}
		&.found {
			background-color: var(--green-1);
			color: var(--green-6);
		}
	}

	.title {
		margin-block: var(--size-3);
		margin-inline: var(--size-2);
		font-size: smaller;
	}
</style>

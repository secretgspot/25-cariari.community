<script>
	import { LinkButton } from '$lib/buttons';
	import ExpirationIndicator from '$lib/ExpirationIndicator.svelte';
	import { timeFromLong } from '$lib/utils/time.js';

	let { data } = $props();
</script>

<fieldset class="events-container">
	<legend>
		<span>Upcoming Events</span> •
		<LinkButton href="/events" class="view-all">View all</LinkButton>
	</legend>

	<div class="slider-container">
		<div class="slides">
			{#each data as event}
				<div class="slide">
					<a href={`/events/${event.id}`} class="event-link">
						<time class="event-date">
							{timeFromLong(event.event_start_date)}
						</time>
						{#if event.image_url}
							<img src={event.image_url} alt={event.title} />
						{:else}
							<div class="placeholder-image">
								<span>No Image</span>
							</div>
						{/if}
						<div class="event-info">
							<h4 class="title">{event.title}</h4>
						</div>
					</a>
					<ExpirationIndicator
						start_date={event.created_at}
						end_date={event.event_end_date} />
				</div>
			{/each}
		</div>
	</div>
</fieldset>

<style>
	.events-container {
		border-radius: var(--border-size-3);
		border: none;
		min-width: 0;

		legend span {
			font-weight: 600;
		}
	}

	.slider-container {
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: var(--blue-6) var(--gray-3);
		margin-block: var(--size-3);
		width: 100%;
		cursor: grab;
		&:active {
			cursor: grabbing;
		}
		/* Webkit scrollbar styling */
		&::scrollbar {
			height: 9px;
		}

		&::scrollbar-track {
			background: transparent;
			border-radius: var(--border-size-3);
		}

		&::scrollbar-thumb {
			background: var(--blue-6);
			border-radius: var(--border-size-3);
		}

		&::scrollbar-thumb:hover {
			background: var(--blue-9);
		}
	}

	.slides {
		display: flex;
		gap: var(--size-2);
		min-width: 0;
	}

	.slide {
		flex: 0 0 calc(100% - var(--size-6));
		overflow: hidden;
		position: relative;
		border-radius: var(--border-size-5);
		/* Responsive slide widths */
		@media (min-width: 480px) {
			flex: 0 0 calc(70% - var(--size-3));
		}

		@media (min-width: 768px) {
			flex: 0 0 calc(50% - var(--size-3));
		}

		@media (min-width: 1024px) {
			flex: 0 0 calc(33.333% - var(--size-3));
		}

		@media (min-width: 1200px) {
			flex: 0 0 calc(25% - var(--size-3));
		}

		.event-date {
			background: white;
			padding: var(--size-3);
			border-radius: var(--border-size-4);
			font-size: smaller;
			white-space: nowrap;
			position: absolute;
			top: 0;
			right: 0;
			z-index: 1;
			border-top-left-radius: 0;
			border-bottom-right-radius: 0;
		}

		img {
			width: 100%;
			object-fit: cover;
			aspect-ratio: 1;
			display: block;
		}

		.placeholder-image {
			width: 100%;
			background: var(--gradient-23);
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--gray-0);
			aspect-ratio: 1;
		}

		.event-info {
			padding: var(--size-3);
			line-height: normal;
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			gap: var(--size-2);
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 1;
			color: white;

			.title {
				margin: 0;
				flex: 1;
			}
		}
	}

	.event-link {
		display: block;
		text-decoration: none;
		color: inherit;
		line-height: 0;
		position: relative;
		&::after {
			content: '';
			display: block;
			position: absolute;
			height: 100%;
			width: 100%;
			left: 0;
			top: 0;
			background-image: linear-gradient(
				180deg,
				rgba(0, 0, 0, 0) 50%,
				rgba(0, 0, 0, 1) 100%
			);
		}
	}
</style>

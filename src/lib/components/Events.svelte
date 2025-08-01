<script>
	import { timeFromShort } from '$lib/utils/time.js';
	import { dragable } from '$lib/utils/dragable.js';

	let { data } = $props();
</script>

<fieldset class="events-container">
	<legend>
		<span>Upcoming Events</span> •
		<a href="/events" class="view-all">View all</a>
	</legend>
	<div class="slider-container" use:dragable>
		<div class="slides">
			{#each data as event}
				<div class="slide">
					<a href={`/events/${event.id}`} class="event-link">
						{#if event.image_url}
							<img src={event.image_url} alt={event.title} />
						{:else}
							<div class="placeholder-image">
								<span>No Image</span>
							</div>
						{/if}
						<div class="event-info">
							<h3>{event.title}</h3>
							<p class="event-date">
								{timeFromShort(event.event_start_date)}
							</p>
						</div>
					</a>
				</div>
			{/each}
		</div>
	</div>
</fieldset>

<style>
	.events-container {
		border-radius: var(--border-size-3);
		border: none;
		/* Prevent the fieldset from contributing to page overflow */
		min-width: 0;
	}

	.events-container legend {
		font-weight: 600;
	}

	.events-container legend span {
		font-weight: 600;
	}

	.slider-container {
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: var(--blue-6) var(--gray-3);
		margin-block: var(--size-3);
		/* Ensure container doesn't exceed parent width */
		width: 100%;
		box-sizing: border-box;

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
			&:hover {
				background: var(--blue-9);
			}
		}
	}

	.slides {
		display: flex;
		gap: var(--size-3);
		/* Ensure slides container can shrink */
		min-width: 0;
	}

	.slide {
		/* Mobile first: 1 event visible at a time with small gap visible */
		flex: 0 0 calc(100% - var(--size-6));
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--border-size-2);
		overflow: hidden;
		box-sizing: border-box;

		img {
			width: 100%;
			object-fit: cover;
			aspect-ratio: 1;
			display: block;
		}
	}

	.event-link {
		display: block;
		text-decoration: none;
		color: inherit;
		/* Ensure link doesn't add extra space */
		line-height: 0;
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
		gap: var(--size-2);

		h3 {
			margin: 0 0 var(--size-2) 0;
			font-size: 1.1em;
			line-height: 1.3;
		}

		.event-date {
			margin: 0;
			color: var(--stone-9);
			font-weight: 600;
			/* white-space: nowrap; */
		}
	}

	.view-all {
		display: inline-block;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}

	/* Responsive adjustments - mobile first */
	@media (min-width: 480px) {
		.slide {
			/* Small tablets: show 1.5 events */
			flex: 0 0 calc(70% - var(--size-3));
		}
	}

	@media (min-width: 768px) {
		.slide {
			/* Tablets: show 2 events */
			flex: 0 0 calc(50% - var(--size-3));
		}
	}

	@media (min-width: 1024px) {
		.slide {
			/* Desktop: show 3 events */
			flex: 0 0 calc(33.333% - var(--size-3));
		}
	}

	@media (min-width: 1200px) {
		.slide {
			/* Large desktop: show 4 events */
			flex: 0 0 calc(25% - var(--size-3));
		}
	}
</style>

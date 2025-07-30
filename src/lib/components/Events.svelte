<script>
	import { dragable } from '$lib/utils/dragable.js';

	let { data } = $props();
</script>

<fieldset class="events-container">
	<legend
		><span>Upcoming Events</span> •
		<a href="/events" class="view-all">View all</a></legend>
	<div class="slider-container" use:dragable>
		<div class="slides">
			{#each data as event}
				<div class="slide">
					<a href={`/events/${event.slug}`} class="event-link">
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
								{new Date(event.event_start_date).toLocaleDateString()}
								{new Date(event.event_start_date).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
								})}
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
	}

	legend {
		span {
			font-weight: 600;
		}
	}

	.slider-container {
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		scrollbar-color: #007bff #f1f1f1;
		margin-block: 1rem;
	}

	.slider-container::-webkit-scrollbar {
		height: 9px;
	}

	.slider-container::-webkit-scrollbar-track {
		background: transparent;
		border-radius: var(--border-size-3);
	}

	.slider-container::-webkit-scrollbar-thumb {
		background: var(--blue-6);
		border-radius: var(--border-size-3);
	}

	.slider-container::-webkit-scrollbar-thumb:hover {
		background: var(--blue-9);
	}

	.slides {
		display: flex;
		gap: var(--size-3);
	}

	.slide {
		flex: 0 0 99%;
		border: var(--border-size-1) solid var(--gray-1);
	}

	.event-link {
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.slide img {
		width: 100%;
		/* height: 180px; */
		object-fit: cover;
		aspect-ratio: 1;
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
	}

	.event-info h3 {
		margin: 0 0 0.5em 0;
		font-size: 1.1em;
		line-height: 1.3;
	}

	.event-date {
		margin: 0;
		color: var(--gray-6);
		font-size: 0.9em;
	}

	.view-all {
		display: inline-block;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
</style>

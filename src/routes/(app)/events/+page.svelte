<script>
	import { invalidateAll } from '$app/navigation';
	import AddEventForm from './AddEventForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';

	let { data } = $props();

	let showForm = $state(false);
	let searchTerm = $state('');

	const filteredEvents = $derived.by(() => {
		if (!searchTerm) {
			return data.events;
		}

		const lowerCaseSearchTerm = searchTerm.toLowerCase();
		return data.events.filter(
			(event) =>
				event.title.toLowerCase().includes(lowerCaseSearchTerm) ||
				event.description.toLowerCase().includes(lowerCaseSearchTerm),
		);
	});

	function toggleForm() {
		showForm = !showForm;
	}

	async function handleEventAdded(event) {
		showForm = false; // Hide form after successful submission

		addToast({
			message: `Event added successfully!`,
			type: 'success',
			timeout: 1200,
		});

		// Refresh the data from the server
		await invalidateAll();
	}
</script>

<div class="events-container">
	<h1>Community Events</h1>

	<nav class="options">
		<Button onclick={toggleForm}>
			{#snippet icon()}
				<svg
					width="21"
					height="21"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 716 716">
					{#if showForm}
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-width="50"
							d="M93 158.2h322m0 0h82.93c87.659 0 131.485 0 159.976 25.623a99.36 99.36 0 0 1 7.47 7.472C691 219.783 691 263.612 691 351.27v73.33c0 125.581 0 188.375-39.014 227.386C612.975 691 550.181 691 424.6 691H291.4c-125.582 0-188.373 0-227.387-39.014C25 612.975 25 550.181 25 424.6V189.827c0-29.389 0-44.083 2.31-56.323C37.474 79.622 79.621 37.476 133.503 27.309 145.744 25 160.438 25 189.827 25c12.876 0 19.314 0 25.501.579a133.204 133.204 0 0 1 72.607 30.074c4.784 3.966 9.336 8.519 18.44 17.624L324.7 91.6c17.933 18.767 61.1 58.36 90.3 66.6ZM217 426h283M367 574V291" />
					{:else}
						<path
							stroke="currentColor"
							stroke-width="50"
							d="M25 189.83c0-29.4 0-44.09 2.3-56.33A133.2 133.2 0 0 1 133.5 27.3c12.24-2.3 26.94-2.3 56.33-2.3 12.87 0 19.31 0 25.5.58a133.2 133.2 0 0 1 72.6 30.07c4.79 3.97 9.34 8.52 18.44 17.63L324.7 91.6c27.17 27.17 40.75 40.75 57.01 49.8 8.94 4.97 18.42 8.9 28.25 11.7 17.9 5.1 37.1 5.1 75.53 5.1h12.44c87.66 0 131.48 0 159.98 25.62a99.36 99.36 0 0 1 7.47 7.47C691 219.8 691 263.62 691 351.27v73.33c0 125.58 0 188.38-39.01 227.39C612.98 691 550.19 691 424.6 691H291.4c-125.58 0-188.37 0-227.39-39.01C25 612.98 25 550.19 25 424.6V189.83ZM217 400h283M367 548V265" />
					{/if}
				</svg>
			{/snippet}
			{showForm ? 'Hide Form' : 'Add New Event'}
		</Button>

		<input
			type="search"
			name="filter"
			class="form-input"
			placeholder="Filter"
			autocomplete="off"
			bind:value={searchTerm} />
	</nav>

	{#if showForm}
		<AddEventForm onEventAdded={handleEventAdded} />
	{/if}

	<div class="events-list">
		{#if filteredEvents && filteredEvents.length > 0}
			{#each filteredEvents as event}
				<a href="/events/{event.id}" class="event-card-link">
					<div class="event-card">
						<h3>{event.title}</h3>

						<div class="meta">
							<div class="date">
								<span>
									<strong>Starts:</strong>
									{timeFrom(event.event_start_date)}
								</span>
								{#if event.event_end_date}
									<span>
										<strong>Ends:</strong>
										{timeFrom(event.event_end_date)}
									</span>
								{/if}
							</div>
							{#if event.location}
								<div class="location">
									<strong>Location:</strong>
									{event.location}
								</div>
							{/if}
						</div>

						{#if event.image_url}
							<img src={event.image_url} alt={event.title} class="image" />
						{:else}
							<div class="placeholder-image">
								<span>No Image</span>
							</div>
						{/if}

						<p class="posted">
							Posted: {timeFrom(event.created_at)}
						</p>

						<div class="description">
							{@html formatText(truncateText(stripMarkdown(event.description), 200))}
						</div>

						{#if event.category}
							<span class="category">{event.category}</span>
						{/if}
					</div>
				</a>
			{/each}
		{:else}
			<p class="no-records">No events match your search.</p>
		{/if}
	</div>
</div>

<style>
	.events-container {
		position: relative;
		h1 {
			margin-bottom: var(--size-6);
		}

		nav.options {
			display: flex;
			justify-content: space-between;

			input[type='search'] {
				max-width: 150px;
				box-shadow: var(--shadow-1);
			}
		}

		.no-records {
			text-align: center;
			margin-block: var(--size-10);
		}
	}

	.events-list {
		margin-block: var(--size-6);
		display: grid;
		gap: var(--size-3);
	}

	.event-card {
		position: relative;
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--radius-2);

		h3 {
			display: flex;
			align-items: center;
			gap: var(--size-3);
			color: var(--stone-11);
			margin: var(--size-3);
		}

		.meta {
			color: var(--stone-9);
			margin: var(--size-3);

			.date {
				display: flex;
				gap: var(--size-4);
			}
			strong {
				font-size: small;
			}
		}

		.category {
			position: absolute;
			top: 0;
			right: 0;
			font-size: small;
			margin: var(--size-2);
		}

		.description {
			margin: var(--size-3);
		}

		.image {
			max-width: 100%;
			width: 100%;
			height: auto;
			margin-bottom: 0;
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

		.posted {
			font-size: small;
			margin: 0 var(--size-1);
			display: none; /* do we need it */
		}
	}

	.event-card-link {
		text-decoration: none;
		color: inherit;
		display: block;

		&:hover .event-card {
			box-shadow: var(--shadow-1);
			transform: translateY(-3px);
		}
	}
</style>

<script>
	import { invalidateAll } from '$app/navigation';
	import AddEventForm from './AddEventForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';
	import Icon from '$lib/Icon.svelte';

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
				event.category.toLowerCase().includes(lowerCaseSearchTerm) ||
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

<svelte:head>
	<title>Events - Cariari Community</title>
	<meta
		name="description"
		content="View upcoming community events and activities for Cariari." />
</svelte:head>

<div class="events-container">
	<h1>Community Events</h1>

	<nav class="options">
		<Button onclick={toggleForm}>
			{#snippet icon()}
				{#if showForm}
					<Icon kind="folder_open" size="21" />
				{:else}
					<Icon kind="folder_closed" size="21" />
				{/if}
			{/snippet}
			{showForm ? 'Hide Form' : 'Add New Event'}
		</Button>

		<div class="search-input">
			<Icon kind="search" size="16" />
			<input
				type="search"
				name="filter"
				class="form-input filter"
				placeholder="Filter"
				autocomplete="off"
				bind:value={searchTerm} />
		</div>
	</nav>

	{#if showForm}
		<AddEventForm onEventAdded={handleEventAdded} />
	{/if}

	<div class="events-list">
		{#if filteredEvents && filteredEvents.length > 0}
			{#each filteredEvents as event}
				<a href="/events/{event.id}" class="event-card-link">
					<div class="event-card">
						<div class="category">{event.category}</div>

						<div class="start-date">
							{timeFrom(event.event_start_date, { short: false })}
						</div>

						{#if event.image_url}
							<img src={event.image_url} alt={event.title} class="image" />
						{:else}
							<div class="placeholder-image">
								<span>No Image</span>
							</div>
						{/if}

						<h3 class="title">{event.title}</h3>

						<div class="description">
							{@html formatText(truncateText(stripMarkdown(event.description), 90))}
						</div>
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
		grid-template-columns: repeat(1, 1fr);
		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			grid-template-columns: repeat(2, 1fr);
		}

		/* Tablets and small laptops (769px - 1024px) */
		@media (min-width: 769px) {
			grid-template-columns: repeat(3, 1fr);
		}

		/* Large desktops and high-resolution screens (1025px and up) */
		@media (min-width: 1025px) {
			grid-template-columns: repeat(4, 1fr);
		}

		/* Extra-large screens (1440px and up) */
		@media (min-width: 1440px) {
		}
	}

	.event-card {
		.category {
			position: absolute;
			top: 0;
			left: 0;
			font-size: small;
			padding: var(--size-1);
			color: var(--text-1);
			text-shadow: 1px 1px var(--surface-1);
		}

		.start-date {
			position: absolute;
			top: 0;
			right: 0;
			padding: var(--size-2);
			border-radius: var(--radius-2);
			border-bottom-right-radius: 0;
			border-top-left-radius: 0;
			background: var(--surface-3);
		}

		.image {
			display: block;
			max-width: 100%;
			width: 100%;
			height: auto;
			margin-bottom: 0;
			aspect-ratio: 1;
			object-fit: cover;
			border-radius: var(--radius-2);
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}

		.placeholder-image {
			width: 100%;
			background: var(--gradient-23);
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--text-2);
			aspect-ratio: 1;
			border-radius: var(--radius-2);
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}

		.title {
			display: flex;
			align-items: center;
			gap: var(--size-3);
			color: var(--text-1);
			margin-inline: var(--size-3);
			margin-block-start: var(--size-3);
			margin-block-end: var(--size-1);
		}

		.description {
			margin: var(--size-3);
			color: var(--text-2);
		}
	}

	.event-card-link {
		text-decoration: none;
		color: inherit;
		display: inline-flex;
		flex-direction: column;
		width: 100%;
		break-inside: avoid;
		border-radius: var(--radius-2);
		/* border: var(--border-size-1) solid var(--surface-3); */
		outline: var(--border-size-2) solid var(--surface-3);
		position: relative;
		transition: transform var(--transition) ease;

		&:hover {
			outline-color: var(--surface-4);
		}
	}
</style>

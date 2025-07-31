<script>
	import { invalidateAll } from '$app/navigation';
	import AddEventForm from './AddEventForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';

	let { data } = $props();

	let showForm = $state(false);
	let formMessage = $state('');

	function toggleForm() {
		showForm = !showForm;
		formMessage = ''; // Clear message when toggling
	}

	async function handleEventAdded(event) {
		formMessage = 'Event added successfully!';
		showForm = false; // Hide form after successful submission

		// Refresh the data from the server
		await invalidateAll();
	}
</script>

<div class="events-container">
	<h1>Community Events</h1>

	<Button onclick={toggleForm}>
		{#snippet icon()}
			➕
		{/snippet}
		{showForm ? 'Hide Form' : 'Add New Event'}
	</Button>

	{#if formMessage}
		<p class="form-message">{formMessage}</p>
	{/if}

	{#if showForm}
		<AddEventForm onEventAdded={handleEventAdded} />
	{/if}

	<div class="events-list">
		{#if data.events && data.events.length > 0}
			{#each data.events as event}
				<a href="/events/{event.id}" class="event-card-link">
					<div class="event-card">
						<h3>{event.title}</h3>
						{#if event.image_url}
							<img src={event.image_url} alt={event.title} class="event-image" />
						{/if}
						<div class="event-description">
							{@html formatText(truncateText(stripMarkdown(event.description), 200))}
						</div>
						<p class="event-meta">
							<strong>Date:</strong>
							{new Date(event.event_start_date).toLocaleDateString()}
							{new Date(event.event_start_date).toLocaleTimeString()}
							{#if event.event_end_date}
								- {new Date(event.event_end_date).toLocaleDateString()}
								{new Date(event.event_end_date).toLocaleTimeString()}
							{/if}
						</p>
						{#if event.location}
							<p><strong>Location:</strong> {event.location}</p>
						{/if}
						{#if event.category}
							<p><strong>Category:</strong> {event.category}</p>
						{/if}
						<p class="event-date">
							Posted: {new Date(event.created_at).toLocaleDateString()}
						</p>
					</div>
				</a>
			{/each}
		{:else}
			<p>No events available yet.</p>
		{/if}
	</div>
</div>

<style>
	.events-container {
		h1 {
			color: #333;
			margin-bottom: 1em;
		}

		.form-message {
			border: var(--border-size-1) solid var(--gray-1);
			padding: var(--size-3);
			border-radius: var(--radius-3);
		}
	}

	.events-list {
		margin-block: var(--size-6);
		display: grid;
		gap: var(--size-3);
	}

	.event-card {
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--radius-2);
		padding: var(--size-3);

		h3 {
			margin: 0;
			display: flex;
			align-items: center;
			gap: var(--size-3);
		}

		p {
			margin-bottom: 0.5em;
			color: #555;
		}
	}

	.event-image {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-2);
		margin-bottom: var(--size-6);
	}

	.event-date {
		font-size: 0.9em;
		color: var(--stone-9);
	}

	.event-card-link {
		text-decoration: none;
		color: inherit;
		display: block;

		&:hover .event-card {
			box-shadow: 0 2px var(--stone-9);
			transform: translateY(-3px);
		}
	}
</style>

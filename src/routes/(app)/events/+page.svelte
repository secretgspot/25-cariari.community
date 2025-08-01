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
			<p>No events available yet.</p>
		{/if}
	</div>
</div>

<style>
	.events-container {
		position: relative;
		h1 {
			color: var(--stone-11);
			margin-bottom: var(--size-6);
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

		.posted {
			font-size: small;
			margin: 0 var(--size-1);
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

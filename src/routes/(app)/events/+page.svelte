<script>
	import { invalidateAll } from '$app/navigation';
	import AddEventForm from './AddEventForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';

	let { data } = $props();

	let showForm = $state(false);

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

	<Button onclick={toggleForm}>
		{#snippet icon()}
			➕
		{/snippet}
		{showForm ? 'Hide Form' : 'Add New Event'}
	</Button>

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

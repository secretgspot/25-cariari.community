<script>
	import Comments from '$lib/Comments.svelte';
	import ManageEvent from './ManageEvent.svelte';
	import { formatText } from '$lib/utils/markdown.js';
	import { timeFrom } from '$lib/utils/time.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.event.title} - Events - Cariari Community</title>
	<meta name="description" content={data.event.description} />
</svelte:head>

<div class="event-detail-container">
	{#if data.event}
		<h1>{data.event.title}</h1>

		<div class="meta">
			<div class="date">
				<span>
					<strong>Starts:</strong>
					{timeFrom(data.event.event_start_date)}
				</span>
				{#if data.event.event_end_date}
					<span>
						<strong>Ends:</strong>
						{timeFrom(data.event.event_end_date)}
					</span>
				{/if}
			</div>
			{#if data.event.location}
				<div class="location">
					<strong>Location:</strong>
					{data.event.location}
				</div>
			{/if}
		</div>

		{#if data.event.image_url}
			<img src={data.event.image_url} alt={data.event.title} class="image" />
		{:else}
			<div class="placeholder-image">
				<span>No Image</span>
			</div>
		{/if}

		<p class="posted">
			Posted: {timeFrom(data.event.created_at)}
		</p>

		<div class="description">{@html formatText(data.event.description)}</div>

		{#if data.event.category}
			<span class="category">{data.event.category}</span>
		{/if}

		<ManageEvent event={data.event} isOwner={data.isOwner} />

		<Comments parentId={data.event.id} type="event_id" userData={data} />
	{:else}
		<p>Event not found.</p>
	{/if}
</div>

<style>
	.event-detail-container {
		position: relative;
		h1 {
			color: var(--stone-11);
			margin-bottom: var(--size-1);
		}

		.meta {
			color: var(--stone-9);
			margin-block: 0 var(--size-2);

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
		}

		.image {
			max-width: 100%;
			width: 100%;
			height: auto;
			border-radius: var(--radius-2);
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
			margin-top: 0;
			color: var(--stone-6);
		}

		.description {
			margin-block: var(--size-6);
		}
	}
</style>

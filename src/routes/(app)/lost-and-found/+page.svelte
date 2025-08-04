<script>
	import { invalidateAll } from '$app/navigation';
	import AddLostFoundForm from './AddLostFoundForm.svelte';
	import { Button } from '$lib/buttons';
	import {
		timeFrom,
		timeFromLong,
		timeFromPrecise,
		getExpirationDate,
	} from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';

	let { data } = $props();

	// console.log('/lost-and-found data: ', data);

	let showForm = $state(false);

	function toggleForm() {
		showForm = !showForm;
	}

	async function handleLostAndFoundAdded(lostandfound) {
		showForm = false; // Hide form after successful submission

		addToast({
			message: `Lost/Found added successfully!`,
			type: 'success',
			timeout: 1200,
		});

		// Refresh the data from the server
		await invalidateAll();
	}
</script>

<div class="lost-and-found-container">
	<h1>Lost & Found</h1>

	<Button onclick={toggleForm}>
		{#snippet icon()}
			<svg
				width="21"
				height="21"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 716 716">
				<path
					stroke="currentColor"
					stroke-width="50"
					d="M25 189.83c0-29.4 0-44.09 2.3-56.33A133.2 133.2 0 0 1 133.5 27.3c12.24-2.3 26.94-2.3 56.33-2.3 12.87 0 19.31 0 25.5.58a133.2 133.2 0 0 1 72.6 30.07c4.79 3.97 9.34 8.52 18.44 17.63L324.7 91.6c27.17 27.17 40.75 40.75 57.01 49.8 8.94 4.97 18.42 8.9 28.25 11.7 17.9 5.1 37.1 5.1 75.53 5.1h12.44c87.66 0 131.48 0 159.98 25.62a99.36 99.36 0 0 1 7.47 7.47C691 219.8 691 263.62 691 351.27v73.33c0 125.58 0 188.38-39.01 227.39C612.98 691 550.19 691 424.6 691H291.4c-125.58 0-188.37 0-227.39-39.01C25 612.98 25 550.19 25 424.6V189.83Z" />
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-width="50"
					d="M217 400h283M367 548V265" />
			</svg>
		{/snippet}
		{showForm ? 'Hide Form' : 'Add New Lost/Found'}
	</Button>

	{#if showForm}
		<AddLostFoundForm onLostAndFoundAdded={handleLostAndFoundAdded} />
	{/if}

	<div class="lost-and-found-list">
		{#if data.lostandfound && data.lostandfound.length > 0}
			{#each data.lostandfound as post}
				<a href="/lost-and-found/{post.id}" class="post-card-link">
					<div class="post-card">
						{#if post.image_url}
							<img src={post.image_url} alt={post.title} class="image" />
						{/if}
						<!-- {#if post.image_url}
							<img src={post.image_url} alt={post.title} class="image" />
						{:else}
							<div class="placeholder-image">
								<span>No Image</span>
							</div>
						{/if} -->

						<div class="meta">
							<span>Posted: {timeFrom(post.created_at)}</span>
							<span
								>Expires in: {timeFromLong(getExpirationDate(post.created_at, 14))}</span>
						</div>
						<h3 class="title">{post.title} ({post.category})</h3>
						<div class="description">
							{@html formatText(truncateText(stripMarkdown(post.description), 200))}
						</div>
						<!-- <p>
							<strong>Date:</strong>
							{new Date(post.date).toLocaleDateString()}
						</p> -->
						<!-- {#if post.location}
							<p><strong>Location:</strong> {post.location}</p>
						{/if} -->
						<!-- <p><strong>Contact:</strong> {post.contact}</p> -->
					</div>
				</a>
			{/each}
		{:else}
			<p>No lost and found posts available yet.</p>
		{/if}
	</div>
</div>

<style>
	.lost-and-found-container {
		h1 {
			margin-bottom: var(--size-7);
		}
	}

	.lost-and-found-list {
		margin-block: var(--size-6);
		display: grid;
		gap: var(--size-3);
	}

	.post-card {
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--radius-2);
		/* padding: var(--size-3); */

		.image {
			max-width: 100%;
			width: 100%;
			height: auto;
			object-fit: cover;
			aspect-ratio: 1;
			border-radius: var(--radius-2);
		}

		/* .placeholder-image {
			width: 100%;
			background: var(--gradient-23);
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--gray-0);
			aspect-ratio: 1;
			border-radius: var(--radius-2);
		} */

		.meta {
			display: flex;
			justify-content: space-between;
			font-size: small;
			color: var(--stone-9);
			margin-inline: var(--size-3);
			margin-block: var(--size-1);
		}

		.title {
			margin-block: var(--size-3);
			margin-inline: var(--size-3);
		}

		.description {
			margin-inline: var(--size-3);
		}
	}

	.post-card-link {
		text-decoration: none;
		color: inherit;
		display: block;

		&:hover .post-card {
			box-shadow: 0 2px var(--stone-9);
			transform: translateY(-3px);
		}
	}
</style>

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
	let searchTerm = $state('');

	const filteredLostAndFound = $derived.by(() => {
		if (!searchTerm) {
			return data.lostandfound;
		}

		const lowerCaseSearchTerm = searchTerm.toLowerCase();
		return data.lostandfound.filter(
			(post) =>
				post.title.toLowerCase().includes(lowerCaseSearchTerm) ||
				post.description.toLowerCase().includes(lowerCaseSearchTerm),
		);
	});

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

<svelte:head>
	<title>Lost & Found - Cariari Community</title>
	<meta
		name="description"
		content="Browse lost and found items in the Cariari community." />
</svelte:head>

<div class="lost-and-found-container">
	<h1>Lost & Found</h1>

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
			{showForm ? 'Hide Form' : 'Add New Lost/Found'}
		</Button>

		<div class="search-input">
			<svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path
					d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 3.73-1.09l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
					fill="currentColor" />
			</svg>
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
		<AddLostFoundForm onLostAndFoundAdded={handleLostAndFoundAdded} />
	{/if}

	<div class="lost-and-found-list">
		{#if filteredLostAndFound && filteredLostAndFound.length > 0}
			{#each filteredLostAndFound as post}
				<a href="/lost-and-found/{post.id}" class="post-card-link">
					<div class="post-card">
						<span class="category">{post.category}</span>
						<!-- {#if post.image_url}
							<img src={post.image_url} alt={post.title} class="image" />
						{/if} -->
						{#if post.image_url}
							<img src={post.image_url} alt={post.title} class="image" />
						{:else}
							<div class="placeholder-image">
								<span>No Image</span>
							</div>
						{/if}

						<div class="meta">
							<span>Posted: {timeFromLong(post.created_at)}</span>
							<span
								>Expires in: {timeFromLong(getExpirationDate(post.created_at, 14))}</span>
						</div>

						<h3 class="title">{post.title}</h3>

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
			<p class="no-records">No lost and found posts match your search.</p>
		{/if}
	</div>
</div>

<style>
	.lost-and-found-container {
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

	.lost-and-found-list {
		margin-block: var(--size-6);
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: var(--size-3);
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

	.post-card {
		.category {
			position: absolute;
			padding: var(--size-1) var(--size-2);
			background: var(--surface-3);
			border-radius: var(--radius-2);
			border-bottom-left-radius: 0;
			border-top-right-radius: 0;
		}

		.image {
			display: block;
			max-width: 100%;
			width: 100%;
			height: auto;
			object-fit: cover;
			aspect-ratio: 1;
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

		.meta {
			display: flex;
			justify-content: space-between;
			font-size: small;
			color: var(--text-2);
			margin-inline: var(--size-3);
			margin-block: var(--size-1);
		}

		.title {
			margin-block: var(--size-3);
			margin-inline: var(--size-3);
		}

		.description {
			margin-inline: var(--size-3);
			margin-block-end: var(--size-3);
			color: var(--text-2);
		}
	}

	.post-card-link {
		text-decoration: none;
		color: inherit;
		display: inline-flex;
		flex-direction: column;
		width: 100%;
		break-inside: avoid;
		border-radius: var(--radius-2);
		/* border: var(--border-size-1) solid var(--gray-1); */
		outline: var(--border-size-2) solid var(--surface-3);
		position: relative;
		transition: transform var(--transition) ease;

		&:hover {
			box-shadow: var(--shadow-1);
			transform: translateY(-3px);
		}
	}
</style>

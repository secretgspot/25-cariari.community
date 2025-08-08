<script>
	import { invalidateAll } from '$app/navigation';
	import AddServiceForm from './AddServiceForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';

	let { data } = $props();

	let showForm = $state(false);
	let searchTerm = $state('');

	const filteredServices = $derived.by(() => {
		if (!searchTerm) {
			return data.services;
		}

		const lowerCaseSearchTerm = searchTerm.toLowerCase();
		return data.services.filter(
			(service) =>
				service.title.toLowerCase().includes(lowerCaseSearchTerm) ||
				service.description.toLowerCase().includes(lowerCaseSearchTerm),
		);
	});

	function toggleForm() {
		showForm = !showForm;
	}

	async function handleServiceAdded(service) {
		showForm = false; // Hide form after successful submission

		addToast({
			message: `Service added successfully!`,
			type: 'success',
			timeout: 1200,
		});

		// Refresh the data from the server
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Services - Cariari Community</title>
	<meta name="description" content="Browse community services offered in Cariari." />
</svelte:head>

<div class="services-container">
	<h1>Community Services</h1>

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
			{showForm ? 'Hide Form' : 'Add New Service'}
		</Button>

		<input
			type="search"
			name="filter"
			class="form-input filter"
			placeholder="Filter"
			autocomplete="off"
			bind:value={searchTerm} />
	</nav>

	{#if showForm}
		<AddServiceForm onServiceAdded={handleServiceAdded} />
	{/if}

	<div class="services-list">
		{#if filteredServices && filteredServices.length > 0}
			{#each filteredServices as service}
				<a href="/services/{service.id}" class="service-card-link">
					<div class="service-card">
						{#if service.category}
							<span class="category">{service.category}</span>
						{/if}

						{#if service.image_url}
							<img src={service.image_url} alt={service.title} class="image" />
						{/if}

						<h3 class="title">{service.title}</h3>

						<div class="description">
							{@html formatText(truncateText(stripMarkdown(service.description), 90))}
						</div>

						<!-- <p class="posted">
							Posted: {timeFrom(service.created_at)}
						</p> -->
					</div>
				</a>
			{/each}
		{:else}
			<p class="no-records">No services match your search.</p>
		{/if}
	</div>
</div>

<style>
	.services-container {
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

	.services-list {
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

	.service-card {
		.title {
			margin-block: var(--size-3);
			margin-inline: var(--size-3);
		}

		.category {
			position: absolute;
			top: 0;
			right: 0;
			font-size: small;
			border-radius: var(--border-size-3);
			color: var(--stone-12);
			text-shadow: 1px 1px var(--stone-0);
			background: var(--stone-3);
			padding: var(--size-1);
			border-bottom-right-radius: 0;
			border-top-left-radius: 0;
		}

		.image {
			display: block;
			max-width: 100%;
			width: 100%;
			height: auto;
			border-radius: var(--radius-2);
			object-fit: cover;
			aspect-ratio: 1;
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}

		.description {
			margin-inline: var(--size-3);
			margin-block-end: var(--size-3);
		}
	}

	.service-card-link {
		text-decoration: none;
		color: inherit;
		display: inline-flex;
		flex-direction: column;
		width: 100%;
		break-inside: avoid;
		border-radius: var(--border-size-3);
		/* border: var(--border-size-1) solid var(--gray-1); */
		outline: var(--border-size-2) solid var(--stone-3);
		position: relative;
		transition: transform 0.2s ease;

		&:hover {
			box-shadow: var(--shadow-1);
			transform: translateY(-3px);
		}
	}
</style>

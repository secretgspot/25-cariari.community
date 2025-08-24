<script>
	import { invalidateAll } from '$app/navigation';
	import AddServiceForm from './AddServiceForm.svelte';
	import { Button, LinkButton } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';
	import Icon from '$lib/Icon.svelte';

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
		<Button onclick={toggleForm} shadow sound_pattern="click">
			{#snippet icon()}
				{#if showForm}
					<Icon kind="folder_open" size="21" />
				{:else}
					<Icon kind="folder_closed" size="21" />
				{/if}
			{/snippet}
			{showForm ? 'Hide Form' : 'Add New Service'}
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
		<AddServiceForm onServiceAdded={handleServiceAdded} />
	{/if}

	<div class="services-list">
		{#if filteredServices && filteredServices.length > 0}
			{#each filteredServices as service}
				<LinkButton
					href={`/services/${service.id}`}
					underline={false}
					sound_pattern="swipe"
					class="service-card">
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
				</LinkButton>
			{/each}
		{:else}
			<p class="no-records">No services were found.</p>
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

	:global(a.service-card) {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: start;
		width: 100%;
		border-radius: var(--radius-2);
		position: relative;
		transition: transform var(--transition) ease;
		white-space: normal;
		box-shadow: 0px 2px 0px 1px var(--surface-4);
		&:hover,
		&:active {
			color: inherit;
			box-shadow: 0px 0px 0px 1px var(--surface-4);
			transform: translateY(2px);
		}

		.title {
			margin-block: var(--size-6) var(--size-3);
			margin-inline: var(--size-3);
		}

		.category {
			position: absolute;
			top: 0;
			right: 0;
			font-size: small;
			border-radius: var(--radius-2);
			color: var(--text-1);
			background: var(--surface-1);
			padding: var(--size-1) var(--size-2);
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
			color: var(--text-2);
		}
	}
</style>

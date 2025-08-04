<script>
	import { invalidateAll } from '$app/navigation';
	import AddServiceForm from './AddServiceForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';

	let { data } = $props();

	let showForm = $state(false);

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

<div class="services-container">
	<h1>Community Services</h1>

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
		{showForm ? 'Hide Form' : 'Add New Service'}
	</Button>

	{#if showForm}
		<AddServiceForm onServiceAdded={handleServiceAdded} />
	{/if}

	<div class="services-list">
		{#if data.services && data.services.length > 0}
			{#each data.services as service}
				<a href="/services/{service.id}" class="service-card-link">
					<div class="service-card">
						<h3>{service.title}</h3>

						{#if service.image_url}
							<img src={service.image_url} alt={service.title} class="image" />
						{/if}

						<div class="description">
							{@html formatText(truncateText(stripMarkdown(service.description), 200))}
						</div>

						{#if service.category}
							<span class="category">{service.category}</span>
						{/if}

						<p class="posted">
							Posted: {timeFrom(service.created_at)}
						</p>
					</div>
				</a>
			{/each}
		{:else}
			<p>No services available yet.</p>
		{/if}
	</div>
</div>

<style>
	.services-container {
		position: relative;
		h1 {
			color: var(--stone-11);
			margin-bottom: var(--size-6);
		}
	}

	.services-list {
		margin-block: var(--size-6);
		display: grid;
		gap: var(--size-3);
	}

	.service-card {
		position: relative;
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--radius-2);
		padding: var(--size-3) var(--size-3) var(--size-6);

		h3 {
			display: flex;
			align-items: center;
			gap: var(--size-3);
			color: var(--stone-11);
			margin-block: var(--size-3);
		}

		.category {
			position: absolute;
			top: 0;
			right: 0;
			font-size: small;
			margin: var(--size-2);
		}

		.image {
			max-width: 100%;
			width: 100%;
			height: auto;
			border-radius: var(--radius-2);
		}

		.posted {
			position: absolute;
			bottom: 0;
			left: 0;
			font-size: small;
			margin: var(--size-2);
			color: var(--stone-6);
		}

		.description {
			margin-block: var(--size-3);
		}
	}

	.service-card-link {
		text-decoration: none;
		color: inherit;
		display: block;

		&:hover .service-card {
			box-shadow: var(--shadow-1);
			transform: translateY(-3px);
		}
	}
</style>

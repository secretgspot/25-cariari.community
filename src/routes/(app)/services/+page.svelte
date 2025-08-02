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
			➕
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

<script>
	import { invalidateAll } from '$app/navigation';
	import AddServiceForm from './AddServiceForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';

	let { data } = $props();

	console.log('services data: ', data);

	let showForm = $state(false);
	let formMessage = $state('');

	function toggleForm() {
		showForm = !showForm;
		formMessage = ''; // Clear message when toggling
	}

	async function handleServiceAdded(service) {
		formMessage = 'Service added successfully!';
		showForm = false; // Hide form after successful submission

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

	{#if formMessage}
		<p class="form-message">{formMessage}</p>
	{/if}

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
							<img src={service.image_url} alt={service.title} class="service-image" />
						{/if}
						<p>{service.description}</p>
						{#if service.category}
							<p><strong>Category:</strong> {service.category}</p>
						{/if}
						<p class="service-date">
							Posted: {new Date(service.created_at).toLocaleDateString()}
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

	.services-list {
		margin-block: var(--size-6);
		display: grid;
		gap: var(--size-3);
	}

	.service-card {
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

	.service-image {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-2);
		margin-bottom: var(--size-6);
	}

	.service-date {
		font-size: 0.9em;
		color: var(--stone-9);
	}

	.service-card-link {
		text-decoration: none;
		color: inherit;
		display: block;

		&:hover .service-card {
			box-shadow: 0 2px var(--stone-9);
			transform: translateY(-3px);
		}
	}
</style>

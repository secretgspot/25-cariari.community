
<script>
	import { enhance } from '$app/forms';

	let { data } = $props();

	let showForm = $state(false);
	let formMessage = $state('');
	let isSubmitting = $state(false);

    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

	function toggleForm() {
		showForm = !showForm;
		formMessage = ''; // Clear message when toggling
	}

	const submitForm = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				formMessage = result.data.message;
				showForm = false; // Hide form on success
			} else if (result.type === 'error') {
				formMessage = result.data.message;
			} else if (result.type === 'failure') {
				formMessage = result.data.message;
			}
			update();
		};
	};
</script>

<div class="services-container">
	<h1>Community Services</h1>

	<button onclick={toggleForm} class="toggle-form-button">
		{showForm ? 'Hide Form' : 'Add New Service'}
	</button>

	{#if formMessage}
		<p class="form-message">{formMessage}</p>
	{/if}

	{#if showForm}
		<form
			method="POST"
			action="?/createService"
			use:enhance={submitForm}
			class="service-form">
			<label for="title">Title:</label>
			<input type="text" id="title" name="title" required />

			<label for="description">Description (Markdown supported):</label>
			<textarea
				id="description"
				name="description"
				required
				disabled={isSubmitting}
				placeholder="Use **bold**, *italic*, and [links](url) for formatting"></textarea>

			<label for="category">Category:</label>
			<select id="category" name="category" required>
				<option value="offering">Offering</option>
				<option value="wanted">Wanted</option>
			</select>

            <label for="image_url">Image URL (Optional):</label>
            <input type="text" id="image_url" name="image_url" />

			<label for="service_start_date">Start Date:</label>
			<input
				type="date"
				id="service_start_date"
				name="service_start_date"
				required
                value={formatDate(today)}
				disabled={isSubmitting} />

			<label for="service_end_date">End Date:</label>
			<input
				type="date"
				id="service_end_date"
				name="service_end_date"
                value={formatDate(sevenDaysFromNow)}
				disabled={isSubmitting} />

			<button type="submit" disabled={isSubmitting} class="submit-btn">
				{isSubmitting ? 'Creating Service...' : 'Create Service'}
			</button>
		</form>
	{/if}

	<div class="services-list">
		{#if data.services && data.services.length > 0}
			{#each data.services as service}
				<a
					href="/services/{service.id}"
					class="service-card-link">
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
		max-width: 800px;
		margin: 2em auto;
		padding: 2em;
		background-color: #f9f9f9;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	h1 {
		color: #333;
		margin-bottom: 1em;
	}

	.toggle-form-button {
		background-color: #007bff;
		color: white;
		padding: 0.8em 1.2em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		margin-bottom: 1.5em;
	}

	.toggle-form-button:hover {
		background-color: #0056b3;
	}

	.form-message {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 1em;
		border-radius: 5px;
		margin-bottom: 1.5em;
	}

	.service-form label {
		display: block;
		margin-bottom: 0.5em;
		font-weight: bold;
	}

	.service-form input[type='text'],
    .service-form input[type='date'],
    .service-form select,
	.service-form textarea {
		width: 100%;
		padding: 0.8em;
		margin-bottom: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
	}

	.service-form textarea {
		min-height: 100px;
		resize: vertical;
	}

	.service-form button[type='submit'] {
		background-color: #28a745;
		color: white;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.service-form button[type='submit']:hover {
		background-color: #218838;
	}

	.services-list {
		margin-top: 2em;
		display: grid;
		gap: 1.5em;
	}

	.service-card {
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1.5em;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}

	.service-card h3 {
		color: #007bff;
		margin-top: 0;
		margin-bottom: 0.5em;
	}

	.service-card p {
		margin-bottom: 0.5em;
		color: #555;
	}

	.service-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1em;
	}

	.service-date {
		font-size: 0.9em;
		color: #888;
	}

	.service-card-link {
		text-decoration: none;
		color: inherit;
		display: block;
	}

	.service-card-link:hover .service-card {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
		transition: all 0.2s ease-in-out;
	}
</style>

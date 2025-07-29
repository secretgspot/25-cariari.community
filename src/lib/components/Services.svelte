<script>
	let { services } = $props();
</script>

<fieldset class="services-container">
	<legend
		><span>Newest Services</span> •
		<a href="/services" class="view-all">View all</a></legend>
	<div class="services-wrap">
		{#each services as service}
			<a href={`/services/${service.id}`}>
				<strong class="message">{service.title}</strong>
			</a>
		{/each}
	</div>
</fieldset>

<style>
	.services-container {
		border-radius: var(--border-size-3);
		border: none;
		padding-inline: 0;
	}

	legend {
		span {
			font-weight: 600;
		}
	}

	.services-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		margin-block: var(--size-3);

		a {
			text-decoration: none;
			display: flex;
			flex: 1;
			justify-content: space-between;
			align-items: center;
			padding: var(--size-3);
			gap: var(--size-3);
			border: var(--border-size-1) solid var(--gray-1);
			border-radius: var(--border-size-3);
			color: var(--blue-6);
			&:hover {
				color: var(--blue-9);
				box-shadow: var(--shadow-2);
			}
		}
	}

	.message {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.view-all {
		display: inline-block;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
</style>

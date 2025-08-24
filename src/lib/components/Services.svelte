<script>
	import { LinkButton } from '$lib/buttons';
	import Icon from '$lib/Icon.svelte';
	import ExpirationIndicator from '$lib/ExpirationIndicator.svelte';
	import { isExpired } from '$lib/utils/time.js';

	let { data } = $props();
</script>

<fieldset class="services-container">
	<legend>
		<span>Newest Services</span> •
		<LinkButton href="/services" class="view-all">View all</LinkButton>
	</legend>
	<div class="services-wrap">
		{#each data as service}
			<LinkButton
				href={`/services/${service.id}`}
				underline={false}
				sound_pattern="swipe"
				class="service">
				{#if service.image_url}
					<img class="image" src={service.image_url} alt={service.title} />
				{:else}
					<div class="placeholder-image">
						<span>{service.category == 'Wanted' ? '🔍' : '✋'}</span>
					</div>
				{/if}
				<strong class="message">{service.title}</strong>
				<Icon size="21" kind={service.category.toLowerCase()} />
				<ExpirationIndicator
					start_date={service.start_date}
					end_date={service.end_date} />
			</LinkButton>
		{/each}
	</div>
</fieldset>

<style>
	.services-container {
		border-radius: var(--radius-2);
		border: none;
		padding-inline: 0;

		legend {
			span {
				font-weight: 600;
				color: var(--text-2);
			}
		}
	}

	.services-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		margin-block: var(--size-3);

		:global(a.service) {
			position: relative;
			text-decoration: none;
			display: flex;
			flex: 1;
			justify-content: space-between;
			align-items: center;
			padding: var(--size-2);
			gap: var(--size-3);
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			color: var(--text-1);
			box-shadow: 0px 2px 0px 0px var(--surface-4);
			&:hover {
				background: var(--surface-2);
			}
			&:active {
				box-shadow: 0px 0px 0px 0px var(--surface-4);
				transform: translateY(2px);
			}
			& > :global(svg) {
				color: var(--text-1);
			}
		}
	}

	.placeholder-image {
		width: auto;
		height: 60px;
		background: var(--gradient-23);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2em;
		aspect-ratio: 1;
		border-radius: var(--radius-2);
	}

	.image {
		max-width: 60px;
		aspect-ratio: 1;
		border-radius: var(--radius-2);
		object-fit: cover;
	}

	.message {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;
	}
</style>

<script>
	import { navigating } from '$app/state';
	import { Spinner } from '$lib/loaders';
	import { playChime, playChimeSequence, chimePatterns } from '$lib/utils/audio.js';
	import { vibrate, vibratePatterns } from '$lib/utils/vibrate.js';

	let {
		size = 'medium', // icon, small, medium, block
		disabled = false,
		outline = false,
		right = false,
		loading = false,
		shadow = false,
		isLink = false,
		href = false,
		external = false,
		sound = true,
		sound_pattern = 'click',
		buzz = true,
		buzz_pattern = 'click',
		icon,
		children,
		onclick,
		...rest
	} = $props();

	function handleClick(event) {
		// Play sound if enabled locally
		if (sound) {
			const pattern = chimePatterns[sound_pattern];
			if (pattern) {
				if (Array.isArray(pattern)) {
					playChimeSequence(pattern);
				} else {
					playChime(
						pattern.frequency,
						pattern.duration,
						pattern.volume,
						pattern.waveType,
					);
				}
			}
		}

		// Trigger vibration if enabled locally
		if (buzz) {
			const pattern = vibratePatterns[buzz_pattern];
			if (pattern) {
				vibrate(pattern);
			}
		}

		// Call the original onclick handler
		if (rest.onclick) {
			rest.onclick(event);
		}
	}

	// Only keep the derived values we actually need
	const isDisabled = $derived(disabled || loading || navigating.complete);
	const isLinkType = $derived(isLink || href);
	const linkHref = $derived(href ?? 'javascript:void(0);');
	const linkTarget = $derived(external ? '_blank' : null);
</script>

<!-- Icon Content Component -->
{#snippet iconContent()}
	<div class="icon_wrap">
		{#if loading}
			<Spinner size={16} />
		{:else if icon}
			{@render icon()}
		{:else}
			🧵
		{/if}
	</div>
{/snippet}

<!-- Text Content Component -->
{#snippet textContent()}
	<div class="content_wrap">
		{#if size === 'block'}
			<span class="title">
				{#if loading}<Spinner size={16} />{/if}
				{@render children?.()}
			</span>
		{:else}
			<b class="title">{@render children?.()}</b>
		{/if}
	</div>
{/snippet}

<!-- Button Content Component -->
{#snippet buttonContent()}
	{#if size === 'icon'}
		{@render iconContent()}
	{:else if size === 'block'}
		{@render textContent()}
	{:else}
		{@render iconContent()}
		{@render textContent()}
	{/if}
{/snippet}

<!-- Main Template -->
{#if isLinkType}
	<a
		class="button {size} {rest.class ?? ''}"
		class:disabled={isDisabled}
		class:shadow
		class:outline
		class:right
		href={linkHref}
		target={linkTarget}
		role="button"
		data-sveltekit-prefetch
		{...rest}
		onclick={handleClick}>
		{@render buttonContent()}
	</a>
{:else}
	<button
		class="button {size} {rest.class ?? ''}"
		class:disabled={isDisabled}
		class:shadow
		class:outline
		class:right
		disabled={isDisabled}
		{...rest}
		onclick={handleClick}>
		{@render buttonContent()}
	</button>
{/if}

<style>
	.button {
		display: flex;
		width: auto;
		height: min-content;
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--border-size-3);
		background: transparent;
		text-decoration: none;
		padding: 0;
		cursor: pointer;
		user-select: none;
		transition: background var(--transition, 0.3s) cubic-bezier(0.33, 1, 0.69, 1);
		touch-action: manipulation;
		/* z-index: 2; */
		&:hover,
		&:active,
		&:focus,
		&.active {
			background: var(--stone-1);
		}
	}

	.outline {
		outline: 1px solid var(--blue-0);
		&:hover,
		&:active,
		&:focus,
		&.active {
			background: var(--stone-1);
			outline: 2px solid var(--blue-3);
		}
	}

	.shadow {
		box-shadow: var(--shadow-1);
		&:hover,
		&:active {
			box-shadow: var(--shadow-2);
		}
	}

	.icon_wrap {
		display: flex;
	}

	.content_wrap {
		display: flex;
		flex-flow: column;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		border-radius: var(--border-size-3);
		justify-content: center;
		width: inherit;
		height: inherit;
		background: transparent;
		/* color: var(--primary); */
		&:hover {
			background: transparent;
			/* color: var(--primary-content); */
			outline: solid 3px var(--stone-1);
		}

		.icon_wrap {
			padding: var(--size-1);
		}
	}

	.small {
		align-items: center;
		white-space: nowrap;
		box-shadow: var(--shadow-1);
		&:active,
		&:focus,
		&:hover {
			background: var(--primary);
			border-style: solid;
		}
		.icon_wrap {
			padding: var(--size-2);
		}

		.content_wrap {
			padding: 0 calc(var(--size-2) * 2);
			border-left: var(--border-size-1) solid var(--stone-3);
		}
	}

	.medium {
		align-items: center;
		box-shadow: var(--shadow-1);

		&:active,
		&:focus,
		&:hover {
			border-style: solid;
		}

		.icon_wrap {
			display: flex;
			flex-flow: row wrap;
			justify-content: flex-start;
			align-items: center;
			padding: var(--size-3);
		}

		.content_wrap {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: flex-start;
			flex: 1 0 auto;
			padding: var(--size-3);
			border-left: var(--border-size-1) solid var(--stone-3);
		}
	}

	.block {
		width: 100%;
		padding: var(--padding-small);
		font-weight: 600;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		&:active,
		&:focus,
		&:hover {
			border-style: solid;
		}

		.content_wrap {
			flex: 1;

			.title {
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}

	.right {
		flex-flow: row-reverse;
		place-self: end;
		.content_wrap {
			border-left: 0;
			border-right: var(--border-size-1) solid var(--stone-3);
		}
	}

	[disabled],
	.disabled {
		cursor: pointer;
		background: var(--primary-focus);
		opacity: 0.6;
		pointer-events: none;

		&:hover,
		&:focus {
			background: var(--primary-focus);
			box-shadow: none;
			opacity: 0.6;
		}
	}

	[white] {
		background: white;
	}

	[green] {
		border-color: var(--green-3);
		&:hover {
			border-color: var(--green-4);
		}
	}

	[red] {
		border-color: var(--red-3);
		&:hover {
			border-color: var(--red-4);
		}
	}
</style>

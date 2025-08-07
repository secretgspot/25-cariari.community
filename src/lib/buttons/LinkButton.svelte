<script>
	import { playChime, playChimeSequence, chimePatterns } from '$lib/utils/audio.js';
	import { vibrate, vibratePatterns } from '$lib/utils/vibrate.js';
	import { button_sounds, button_buzz } from '$lib/stores/settings';

	/** @type {{disabled?: boolean, isLink?: boolean, href?: any, external?: boolean, children?: import('svelte').Snippet, [key: string]: any}} */
	let {
		disabled = false,
		isLink = false,
		href = null,
		external = false,
		underline = true,
		sound = true,
		sound_pattern = 'tick', // basic, successA, successB, successC, failA, failB, failC, notification, warning, tick, swipe, bell, click
		buzz = true,
		children,
		...rest
	} = $props();

	function handleClick(event) {
		if (sound && $button_sounds) {
			const selectedPattern = chimePatterns[sound_pattern];
			if (selectedPattern) {
				if (Array.isArray(selectedPattern)) {
					playChimeSequence(selectedPattern);
				} else {
					playChime(
						selectedPattern.frequency,
						selectedPattern.duration,
						selectedPattern.volume,
						selectedPattern.waveType,
					);
				}
			}
		}

		if (buzz && $button_buzz) {
			vibrate(vibratePatterns.basic);
		}

		if (rest.onclick) {
			rest.onclick(event);
		}
	}
</script>

{#if isLink || href}
	<a
		class:disabled
		class:underline
		data-sveltekit-prefetch
		{...rest}
		role="button"
		href={href ?? 'javascript:void(0);'}
		target={external ? '_blank' : null}
		onclick={handleClick}>
		{@render children?.()}
	</a>
{:else}
	<button {...rest} class:disabled class:underline {disabled} onclick={handleClick}>
		{@render children?.()}
	</button>
{/if}

<style>
	button,
	a {
		border: none;
		background: none;
		cursor: pointer;
		font-size: inherit;
		text-decoration: none;

		color: var(--blue-6);
		padding-bottom: 2px;
		transition: box-shadow calc(var(--transition, 0.3ms) / 2) ease-in-out;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		white-space: nowrap;
		&:hover {
			color: var(--blue-9);
		}
		&.active {
			box-shadow: var(--blue-9) inset 0 -5px 0 -1px;
			color: var(--blue-9);
		}
		&.underline {
			box-shadow: var(--blue-9) 0 -2px 0 -1px inset;
			&:hover {
				box-shadow: var(--blue-9) inset 0 -3px 0 -1px;
			}
		}
	}
</style>

<script>
	import { fade } from 'svelte/transition';
	import { settings } from '$lib/settings/settings.js';
	import { playChimeSequence } from '$lib/utils/audio.js';
	import { vibrate } from '$lib/utils/vibrate.js';

	/** @type {{type?: string, dismissible?: boolean, children?: import('svelte').Snippet, ondismiss?: () => void}} */
	let { type = '', dismissible = true, children, ondismiss } = $props();

	$effect(() => {
		// Only play sounds if the master switch is on
		if (!$settings.notification_sound) return;

		const playSound = (patternKey) => {
			const pattern = $settings.audio_patterns[patternKey];
			if (pattern) {
				playChimeSequence(pattern);
			}
		};

		const playVibration = (patternKey) => {
			const pattern = $settings.vibration_patterns[patternKey];
			if (pattern) {
				vibrate(pattern);
			}
		};

		switch (type) {
			case 'success':
				playSound($settings.notification_success_sound_pattern);
				if ($settings.notification_buzz) playVibration($settings.notification_success_vibration_pattern);
				break;
			case 'error':
				playSound($settings.notification_error_sound_pattern);
				if ($settings.notification_buzz) playVibration($settings.notification_error_vibration_pattern);
				break;
			default:
				playSound($settings.notification_sound_pattern);
				if ($settings.notification_buzz) playVibration($settings.notification_vibration_pattern);
				break;
		}
	});

	function handleDismiss() {
		ondismiss?.();
	}
</script>

<i class="toast {type}" role="alert" transition:fade|global>
	{#if type === 'success'}
		👍
	{:else if type === 'error'}
		👎
	{:else}
		👀
	{/if}

	<div class="text">
		{@render children?.()}
	</div>

	{#if dismissible}
		<button class="close" onclick={handleDismiss}> ❌ </button>
	{/if}
</i>

<style>
	.toast {
		display: flex;
		border-radius: var(--border-size-3);
		border: var(--border-size-1) solid var(--gray-1);
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		align-items: center;
		padding: var(--size-1);
		gap: var(--size-2);
		pointer-events: auto;
	}
	.error {
		background: var(--red-1);
		border-color: var(--red-3);
		color: var(--red-11);
	}
	.success {
		background: var(--green-1);
		border-color: var(--green-3);
		color: var(--green-11);
	}
	.info {
		background: var(--blue-1);
		border-color: var(--blue-3);
		color: var(--blue-11);
	}
	.text {
		font-size: smaller;
	}
	.close {
		background: transparent;
		border: 0 none;
		padding: 0;
		cursor: pointer;
		pointer-events: auto;
		&:hover {
			opacity: 0.7;
		}
	}
</style>
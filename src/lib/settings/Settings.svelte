<!-- Settings.svelte -->
<script>
	import {
		button_sounds,
		button_buzz,
		navigation_sound,
		navigation_buzz,
		notification_sound,
	} from '$lib/stores/settings';
	import Divider from '$lib/Divider.svelte';
	import AudioEffectsGroup from '$lib/settings/AudioEffectsGroup.svelte';
	import VibrationEffectsGroup from '$lib/settings/VibrationEffectsGroup.svelte';
</script>

<div class="site-settings">
	<Divider>Site Settings</Divider>
	<div class="form-items-wrap">
		<!-- Button Effects -->
		<AudioEffectsGroup
			bind:enabled={$button_sounds}
			label="Button sound effects"
			patternKey="basic" />

		<VibrationEffectsGroup
			bind:enabled={$button_buzz}
			label="Button vibration effects"
			patternKey="basic" />

		<!-- Navigation Effects -->
		<AudioEffectsGroup
			bind:enabled={$navigation_sound}
			label="Navigation sound effects"
			patternKey="notification" />

		<VibrationEffectsGroup
			bind:enabled={$navigation_buzz}
			label="Navigation vibration effects"
			patternKey="tick" />

		<!-- Notification Effects -->
		<AudioEffectsGroup
			bind:enabled={$notification_sound}
			label="Notification sound effects"
			patternKey="notification" />
	</div>
</div>

<style>
	.site-settings {
		:global(.text-divider) {
			margin-block: 0 var(--size-6);
		}
		.form-items-wrap {
			display: grid;
			gap: var(--size-4);
		}
	}
</style>

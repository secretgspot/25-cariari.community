<!-- Settings.svelte -->
<script>
	import { settings, resetSettings } from './settings.js';
	import Divider from '$lib/Divider.svelte';
	import SoundEffectsGroup from './SoundEffectsGroup.svelte';
	import VibrationEffectsGroup from './VibrationEffectsGroup.svelte';
	import NotificationSoundGroup from './NotificationSoundGroup.svelte';
	import NotificationVibrationGroup from './NotificationVibrationGroup.svelte';

	let currentSettings = $state($settings);

	$effect(() => {
		$settings = currentSettings;
	});
</script>

<div class="site-settings">
	<Divider>Site Settings</Divider>
	<div class="form-items-wrap">
		<!-- Button Effects -->
		<SoundEffectsGroup
			bind:enabled={currentSettings.button_sounds}
			label="Button sound effects"
			patternKey={currentSettings.button_sound_pattern} />

		<VibrationEffectsGroup
			bind:enabled={currentSettings.button_buzz}
			label="Button vibration effects"
			patternKey={currentSettings.button_vibration_pattern} />

		<!-- Navigation Effects -->
		<SoundEffectsGroup
			bind:enabled={currentSettings.navigation_sound}
			label="Navigation sound effects"
			patternKey={currentSettings.navigation_sound_pattern} />

		<VibrationEffectsGroup
			bind:enabled={currentSettings.navigation_buzz}
			label="Navigation vibration effects"
			patternKey={currentSettings.navigation_vibration_pattern} />

		<!-- Notification Effects -->
		<NotificationSoundGroup />
		<NotificationVibrationGroup />

		<!-- Settings Actions -->
		<div class="settings-actions">
			<button type="button" class="reset-button" onclick={resetSettings}>
				Reset All Settings
			</button>
		</div>
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

	.settings-actions {
		grid-column: 1 / -1;
		display: flex;
		justify-content: center;
		padding-top: var(--size-4);
		border-top: 1px solid var(--border-color);
	}

	.reset-button {
		padding: var(--size-2) var(--size-4);
		font-size: var(--font-size-1);
		border: 1px solid var(--red-6);
		border-radius: var(--radius-2);
		background: var(--red-2);
		color: var(--red-9);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.reset-button:hover {
		background: var(--red-3);
		border-color: var(--red-7);
	}
</style>

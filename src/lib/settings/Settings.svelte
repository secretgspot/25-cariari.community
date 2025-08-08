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
		<div class="parent-group">
			<SoundEffectsGroup
				bind:enabled={currentSettings.button_sounds}
				label="Button sounds"
				patternKey={currentSettings.button_sound_pattern} />

			<VibrationEffectsGroup
				bind:enabled={currentSettings.button_buzz}
				label="Button vibration"
				patternKey={currentSettings.button_vibration_pattern} />
		</div>

		<!-- Navigation Effects -->
		<div class="parent-group">
			<SoundEffectsGroup
				bind:enabled={currentSettings.navigation_sound}
				label="Navigation sounds"
				patternKey={currentSettings.navigation_sound_pattern} />

			<VibrationEffectsGroup
				bind:enabled={currentSettings.navigation_buzz}
				label="Navigation vibration"
				patternKey={currentSettings.navigation_vibration_pattern} />
		</div>

		<!-- Notification Effects -->
		<div class="parent-group">
			<NotificationSoundGroup />
			<NotificationVibrationGroup />
		</div>

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

	.parent-group {
		display: grid;
		gap: var(--size-2);
		grid-template-columns: 1fr;
		margin-bottom: var(--size-3);
		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>

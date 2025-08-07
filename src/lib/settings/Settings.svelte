<!-- Settings.svelte -->
<script>
	import { settings } from './settings.js';
	import Divider from '$lib/Divider.svelte';
	import AudioEffectsGroup from './AudioEffectsGroup.svelte';
	import VibrationEffectsGroup from './VibrationEffectsGroup.svelte';

	// Reactive settings object
	let currentSettings = $state($settings);

	// Update local state when settings change
	$effect(() => {
		currentSettings = $settings;
	});

	// Helper functions to update settings
	function updateSetting(key, value) {
		settings.set(key, value);
	}
</script>

<div class="site-settings">
	<Divider>Site Settings</Divider>
	<div class="form-items-wrap">
		<!-- Button Effects -->
		<AudioEffectsGroup
			enabled={currentSettings.button_sounds}
			onEnabledChange={(value) => updateSetting('button_sounds', value)}
			label="Button sound effects"
			patternKey={currentSettings.button_sound_pattern || 'basic'} />

		<VibrationEffectsGroup
			enabled={currentSettings.button_buzz}
			onEnabledChange={(value) => updateSetting('button_buzz', value)}
			label="Button vibration effects"
			patternKey={currentSettings.button_vibration_pattern || 'basic'} />

		<!-- Navigation Effects -->
		<AudioEffectsGroup
			enabled={currentSettings.navigation_sound}
			onEnabledChange={(value) => updateSetting('navigation_sound', value)}
			label="Navigation sound effects"
			patternKey={currentSettings.navigation_sound_pattern || 'notification'} />

		<VibrationEffectsGroup
			enabled={currentSettings.navigation_buzz}
			onEnabledChange={(value) => updateSetting('navigation_buzz', value)}
			label="Navigation vibration effects"
			patternKey={currentSettings.navigation_vibration_pattern || 'tick'} />

		<!-- Notification Effects -->
		<AudioEffectsGroup
			enabled={currentSettings.notification_sound}
			onEnabledChange={(value) => updateSetting('notification_sound', value)}
			label="Notification sound effects"
			patternKey={currentSettings.notification_sound_pattern || 'notification'} />

		<!-- Settings Actions -->
		<div class="settings-actions">
			<button type="button" class="reset-button" onclick={() => settings.reset()}>
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

<!-- Settings.svelte -->
<script>
	import { settings, resetSettings } from './settings.js';
	import Divider from '$lib/Divider.svelte';
	import Toggle from '$lib/Toggle.svelte';

	let currentSettings = $state($settings);

	$effect(() => {
		$settings = currentSettings;
	});
</script>

<div class="site-settings">
	<Divider>Site Settings</Divider>
	<div class="form-items-wrap">
		<Toggle bind:checked={currentSettings.button_sounds} label="Button sounds" />
		<Toggle bind:checked={currentSettings.button_buzz} label="Button vibrations" />
		<Toggle bind:checked={currentSettings.navigation_sound} label="Navigation sounds" />
		<Toggle
			bind:checked={currentSettings.navigation_buzz}
			label="Navigation vibrations" />
		<Toggle
			bind:checked={currentSettings.notification_sound}
			label="Notification sounds" />
		<Toggle
			bind:checked={currentSettings.notification_buzz}
			label="Notification vibrations" />

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
</style>

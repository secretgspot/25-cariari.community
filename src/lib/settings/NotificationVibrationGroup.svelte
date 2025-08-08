<!-- src/lib/settings/NotificationVibrationGroup.svelte -->
<script>
	import { settings } from './settings.js';
	import { vibrate } from '$lib/utils/vibrate.js';
	import VibrationPatternEditor from './VibrationPatternEditor.svelte';

	let currentSettings = $state($settings);

	$effect(() => {
		$settings = currentSettings;
	});

	function testPattern(patternKey) {
		vibrate(currentSettings.vibration_patterns[patternKey], true);
	}
</script>

<fieldset>
	<legend>
		<input
			type="checkbox"
			id="enable-vibration-notifications"
			bind:checked={currentSettings.notification_buzz} />
		<label for="enable-vibration-notifications">Notification vibration effects</label>
	</legend>

	{#if currentSettings.notification_buzz}
		<div class="notification-controls">
			<div class="group">
				<div class="group-header">
					<span>Default Notification</span>
					<button
						type="button"
						class="test-button"
						onclick={() => testPattern(currentSettings.notification_vibration_pattern)}
						>Test</button>
				</div>
				<VibrationPatternEditor
					bind:pattern={
						currentSettings.vibration_patterns[
							currentSettings.notification_vibration_pattern
						]
					}
					label="default-notification-vibration" />
			</div>

			<div class="group">
				<div class="group-header">
					<span>Success Notification</span>
					<button
						type="button"
						class="test-button"
						onclick={() =>
							testPattern(currentSettings.notification_success_vibration_pattern)}
						>Test</button>
				</div>
				<VibrationPatternEditor
					bind:pattern={
						currentSettings.vibration_patterns[
							currentSettings.notification_success_vibration_pattern
						]
					}
					label="success-notification-vibration" />
			</div>

			<div class="group">
				<div class="group-header">
					<span>Error Notification</span>
					<button
						type="button"
						class="test-button"
						onclick={() =>
							testPattern(currentSettings.notification_error_vibration_pattern)}
						>Test</button>
				</div>
				<VibrationPatternEditor
					bind:pattern={
						currentSettings.vibration_patterns[
							currentSettings.notification_error_vibration_pattern
						]
					}
					label="error-notification-vibration" />
			</div>
		</div>
	{/if}
</fieldset>

<style>
	.notification-controls {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		margin-top: var(--size-2);
	}
	.group {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}
	.group-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 500;
		font-size: small;
	}
</style>

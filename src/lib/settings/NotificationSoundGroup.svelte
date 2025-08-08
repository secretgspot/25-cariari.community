<!-- src/lib/settings/NotificationSoundGroup.svelte -->
<script>
	import { settings } from './settings.js';
	import { playChimeSequence } from '$lib/utils/audio.js';
	import SoundPatternEditor from './SoundPatternEditor.svelte';

	let currentSettings = $state($settings);

	$effect(() => {
		$settings = currentSettings;
	});

	function testPattern(patternKey) {
		playChimeSequence(currentSettings.audio_patterns[patternKey]);
	}
</script>

<fieldset>
	<legend>
		<input
			type="checkbox"
			id="enable-notifications"
			bind:checked={currentSettings.notification_sound} />
		<label for="enable-notifications">Notification sounds</label>
	</legend>

	{#if currentSettings.notification_sound}
		<div class="notification-controls">
			<div class="group">
				<div class="group-header">
					<span>Default Notification</span>
					<button
						type="button"
						class="test-button"
						onclick={() => testPattern(currentSettings.notification_sound_pattern)}
						>Test</button>
				</div>
				<SoundPatternEditor
					bind:pattern={
						currentSettings.audio_patterns[currentSettings.notification_sound_pattern]
					}
					label="default-notification" />
			</div>

			<div class="group">
				<div class="group-header">
					<span>Success Notification</span>
					<button
						type="button"
						class="test-button"
						onclick={() =>
							testPattern(currentSettings.notification_success_sound_pattern)}
						>Test</button>
				</div>
				<SoundPatternEditor
					bind:pattern={
						currentSettings.audio_patterns[
							currentSettings.notification_success_sound_pattern
						]
					}
					label="success-notification" />
			</div>

			<div class="group">
				<div class="group-header">
					<span>Error Notification</span>
					<button
						type="button"
						class="test-button"
						onclick={() => testPattern(currentSettings.notification_error_sound_pattern)}
						>Test</button>
				</div>
				<SoundPatternEditor
					bind:pattern={
						currentSettings.audio_patterns[
							currentSettings.notification_error_sound_pattern
						]
					}
					label="error-notification" />
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

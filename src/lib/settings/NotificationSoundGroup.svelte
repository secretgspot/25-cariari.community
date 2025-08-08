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
		<input type="checkbox" id="enable-notifications" bind:checked={currentSettings.notification_sound} />
		<label for="enable-notifications">Notification sound effects</label>
	</legend>

	{#if currentSettings.notification_sound}
		<div class="notification-controls">
			<div class="group">
				<div class="group-header">
					<span>Default Notification</span>
					<button type="button" class="test-button" onclick={() => testPattern(currentSettings.notification_sound_pattern)}>Test</button>
				</div>
				<SoundPatternEditor bind:pattern={currentSettings.audio_patterns[currentSettings.notification_sound_pattern]} label="default-notification" />
			</div>

			<div class="group">
				<div class="group-header">
					<span>Success Notification</span>
					<button type="button" class="test-button" onclick={() => testPattern(currentSettings.notification_success_sound_pattern)}>Test</button>
				</div>
				<SoundPatternEditor bind:pattern={currentSettings.audio_patterns[currentSettings.notification_success_sound_pattern]} label="success-notification" />
			</div>

			<div class="group">
				<div class="group-header">
					<span>Error Notification</span>
					<button type="button" class="test-button" onclick={() => testPattern(currentSettings.notification_error_sound_pattern)}>Test</button>
				</div>
				<SoundPatternEditor bind:pattern={currentSettings.audio_patterns[currentSettings.notification_error_sound_pattern]} label="error-notification" />
			</div>
		</div>
	{/if}
</fieldset>

<style>
	fieldset {
		margin: 0;
		padding: 0;
		border: none;
	}
	legend {
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: var(--size-2);
		width: 100%;
	}
	.notification-controls {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		margin-top: var(--size-2);
		padding-left: var(--size-4); /* Indent the controls */
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
	}
	.test-button {
		padding: var(--size-1) var(--size-2);
		font-size: var(--font-size-0);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-1);
		background: var(--surface-2);
		color: var(--text-color);
		cursor: pointer;
	}
</style>

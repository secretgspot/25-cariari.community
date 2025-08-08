<!-- src/lib/settings/AudioEffectsGroup.svelte -->
<script>
	import { settings } from './settings.js';
	import { playChimeSequence } from '$lib/utils/audio.js';
	import SoundPatternEditor from './SoundPatternEditor.svelte';

	let { enabled = false, label = 'Audio Effects', patternKey = 'basic' } = $props();

	let currentSettings = $state($settings);

	$effect(() => {
		$settings = currentSettings;
	});

	function testPattern() {
		playChimeSequence(currentSettings.audio_patterns[patternKey]);
	}
</script>

<fieldset>
	<legend>
		<input type="checkbox" id="enable-{label}" bind:checked={enabled} />
		<label for="enable-{label}">{label}</label>
		{#if enabled}
			<button type="button" class="test-button" onclick={testPattern}>Test</button>
		{/if}
	</legend>
	{#if enabled}
		<SoundPatternEditor
			bind:pattern={currentSettings.audio_patterns[patternKey]}
			{label} />
	{/if}
</fieldset>

<style>
</style>

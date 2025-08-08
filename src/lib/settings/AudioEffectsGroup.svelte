<!-- src/lib/settings/AudioEffectsGroup.svelte -->
<script>
	import { settings } from './settings.js';
	import { playChimeSequence } from '$lib/utils/audio.js';
	import SoundPatternEditor from './SoundPatternEditor.svelte';

	let {
		enabled = false,
		label = 'Audio Effects',
		patternKey = 'basic'
	} = $props();

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
		<SoundPatternEditor bind:pattern={currentSettings.audio_patterns[patternKey]} {label} />
	{/if}
</fieldset>

<style>
	fieldset {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		padding: 0;
		border: none;
	}
	legend {
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: var(--size-2);
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

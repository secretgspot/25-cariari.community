<!-- AudioEffectsGroup.svelte -->
<script>
	import { settings } from './settings.js';
	import { playChimeSequence } from '$lib/utils/audio.js';

	// Props
	let {
		enabled = false,
		onEnabledChange = () => {},
		label = 'Audio Effects',
		patternKey = 'basic',
	} = $props();

	let currentSettings = $state($settings);

	$effect(() => {
		$settings = currentSettings;
	});

	const waveTypes = ['sine', 'square', 'sawtooth', 'triangle'];

	// Get the settings for the specific pattern directly from the main store
	const currentPatternSettings = $derived(currentSettings.audio_patterns[patternKey]);

	// Function to test the current pattern
	function testPattern() {
		playChimeSequence(currentSettings.audio_patterns[patternKey]);
	}

	// Handle enabled change
	function handleEnabledChange(event) {
		onEnabledChange(event.target.checked);
	}
</script>

<fieldset>
	<legend>
		<input
			type="checkbox"
			id="enable-{label}"
			checked={enabled}
			onchange={handleEnabledChange} />
		<label for="enable-{label}">{label}</label>
		{#if enabled}
			<button type="button" class="test-button" onclick={testPattern}>Test</button>
		{/if}
	</legend>
	{#if enabled}
		<div class="pattern-controls">
			{#if Array.isArray(currentPatternSettings)}
				{#each currentPatternSettings as object, i}
					<div class="sound-object-group">
						<div class="input-group">
							<label for="freq-{label}-{i}">Frequency (Hz)</label>
							<input
								type="number"
								id="freq-{label}-{i}"
								bind:value={currentSettings.audio_patterns[patternKey][i].frequency}
								min={10}
								max={2000}
								step={1} />
						</div>
						<div class="input-group">
							<label for="dur-{label}-{i}">Duration (ms)</label>
							<input
								type="number"
								id="dur-{label}-{i}"
								bind:value={currentSettings.audio_patterns[patternKey][i].duration}
								min={10}
								max={1000}
								step={1} />
						</div>
						<div class="input-group">
							<label for="delay-{label}-{i}">Delay (ms)</label>
							<input
								type="number"
								id="delay-{label}-{i}"
								bind:value={currentSettings.audio_patterns[patternKey][i].delay}
								min={0}
								max={1000}
								step={1} />
						</div>
						<div class="input-group">
							<label for="vol-{label}-{i}">Volume</label>
							<input
								type="number"
								id="vol-{label}-{i}"
								bind:value={currentSettings.audio_patterns[patternKey][i].volume}
								min={0}
								max={1}
								step={0.01} />
						</div>
						<div class="input-group">
							<label for="wave-{label}-{i}">Wave Type</label>
							<select
								id="wave-{label}-{i}"
								bind:value={currentSettings.audio_patterns[patternKey][i].waveType}>
								{#each waveTypes as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</div>
					</div>
				{/each}
			{:else}
				<div class="sound-object-group">
					<div class="input-group">
						<label for="freq-{label}-single">Frequency (Hz)</label>
						<input
							type="number"
							id="freq-{label}-single"
							bind:value={currentSettings.audio_patterns[patternKey].frequency}
							min={20}
							max={2000}
							step={1} />
					</div>
					<div class="input-group">
						<label for="dur-{label}-single">Duration (ms)</label>
						<input
							type="number"
							id="dur-{label}-single"
							bind:value={currentSettings.audio_patterns[patternKey].duration}
							min={10}
							max={1000}
							step={1} />
					</div>
					{#if currentPatternSettings.delay !== undefined}
						<div class="input-group">
							<label for="delay-{label}-single">Delay (ms)</label>
							<input
								type="number"
								id="delay-{label}-single"
								bind:value={currentSettings.audio_patterns[patternKey].delay}
								min={0}
								max={1000}
								step={1} />
						</div>
					{/if}
					<div class="input-group">
						<label for="vol-{label}-single">Volume</label>
						<input
							type="number"
							id="vol-{label}-single"
							bind:value={currentSettings.audio_patterns[patternKey].volume}
							min={0}
							max={1}
							step={0.01} />
					</div>
					{#if currentPatternSettings.waveType !== undefined}
						<div class="input-group">
							<label for="wave-{label}-single">Wave Type</label>
							<select
								id="wave-{label}-single"
								bind:value={currentSettings.audio_patterns[patternKey].waveType}>
								{#each waveTypes as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</fieldset>

<style>
	fieldset {
		margin: 0;
		display: flex;
		gap: var(--size-2);
		flex-direction: column;
	}

	legend {
		padding: 0 var(--size-1);
		font-weight: 600;
		color: var(--text-color);
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	legend input[type='checkbox'] {
		margin-inline-end: 0;
	}

	legend label {
		font-weight: inherit;
		color: inherit;
		cursor: pointer;
		flex: 1;
	}

	.test-button {
		padding: var(--size-1) var(--size-2);
		font-size: var(--font-size-0);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-1);
		background: var(--surface-2);
		color: var(--text-color);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.test-button:hover {
		background: var(--surface-3);
		border-color: var(--accent-color);
	}

	.pattern-controls {
		display: flex;
		gap: var(--size-3);
		flex-wrap: wrap;
		font-size: small;
	}

	.input-group {
		display: grid;
		gap: var(--size-1);
	}

	.sound-object-group {
		display: flex;
		gap: var(--size-2);
		justify-content: space-between;
		flex: 1;
	}
</style>
<!-- AudioEffectsGroup.svelte -->
<script>
	import { playChimeSequence, chimePatterns } from '$lib/utils/audio.js';

	// Props
	let {
		enabled = false,
		onEnabledChange = () => {},
		label = 'Audio Effects',
		patternKey = 'basic',
	} = $props();

	// Create a deeply reactive copy of the chimePatterns object
	const reactiveChimePatterns = $state(structuredClone(chimePatterns));

	let selectedPattern = $state(patternKey);

	const waveTypes = ['sine', 'square', 'sawtooth', 'triangle'];
	const patternOptions = Object.keys(reactiveChimePatterns);

	// Use a derived state to get the settings for the currently selected pattern
	const currentPatternSettings = $derived(reactiveChimePatterns[selectedPattern]);

	// Function to test the current pattern
	function testPattern() {
		playChimeSequence(reactiveChimePatterns[selectedPattern]);
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
			<label for="pattern-select-{label}">Select a Pattern</label>
			<select id="pattern-select-{label}" bind:value={selectedPattern}>
				{#each patternOptions as pattern}
					<option value={pattern}>{pattern}</option>
				{/each}
			</select>

			{#if Array.isArray(currentPatternSettings)}
				{#each currentPatternSettings as object, i}
					<div class="sound-object-group">
						<hgroup>
							<h4>Sound Object {i + 1}</h4>
							<p>A pattern can be composed of multiple sound objects.</p>
						</hgroup>
						<div class="input-group">
							<label for="freq-{label}-{i}">Frequency (Hz): {object.frequency}</label>
							<input
								type="range"
								id="freq-{label}-{i}"
								bind:value={object.frequency}
								min={20}
								max={2000}
								step={1} />
						</div>
						<div class="input-group">
							<label for="dur-{label}-{i}">Duration (ms): {object.duration}</label>
							<input
								type="range"
								id="dur-{label}-{i}"
								bind:value={object.duration}
								min={10}
								max={1000}
								step={1} />
						</div>
						<div class="input-group">
							<label for="delay-{label}-{i}">Delay (ms): {object.delay}</label>
							<input
								type="range"
								id="delay-{label}-{i}"
								bind:value={object.delay}
								min={0}
								max={1000}
								step={1} />
						</div>
						<div class="input-group">
							<label for="vol-{label}-{i}">Volume: {object.volume}</label>
							<input
								type="range"
								id="vol-{label}-{i}"
								bind:value={object.volume}
								min={0}
								max={1}
								step={0.01} />
						</div>
						<div class="input-group">
							<label for="wave-{label}-{i}">Wave Type</label>
							<select id="wave-{label}-{i}" bind:value={object.waveType}>
								{#each waveTypes as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</div>
					</div>
				{/each}
			{:else}
				<div class="input-group">
					<label for="freq-{label}-single"
						>Frequency (Hz): {currentPatternSettings.frequency}</label>
					<input
						type="range"
						id="freq-{label}-single"
						bind:value={currentPatternSettings.frequency}
						min={20}
						max={2000}
						step={1} />
				</div>
				<div class="input-group">
					<label for="dur-{label}-single"
						>Duration (ms): {currentPatternSettings.duration}</label>
					<input
						type="range"
						id="dur-{label}-single"
						bind:value={currentPatternSettings.duration}
						min={10}
						max={1000}
						step={1} />
				</div>
				{#if currentPatternSettings.delay !== undefined}
					<div class="input-group">
						<label for="delay-{label}-single"
							>Delay (ms): {currentPatternSettings.delay}</label>
						<input
							type="range"
							id="delay-{label}-single"
							bind:value={currentPatternSettings.delay}
							min={0}
							max={1000}
							step={1} />
					</div>
				{/if}
				<div class="input-group">
					<label for="vol-{label}-single">Volume: {currentPatternSettings.volume}</label>
					<input
						type="range"
						id="vol-{label}-single"
						bind:value={currentPatternSettings.volume}
						min={0}
						max={1}
						step={0.01} />
				</div>
				{#if currentPatternSettings.waveType !== undefined}
					<div class="input-group">
						<label for="wave-{label}-single">Wave Type</label>
						<select id="wave-{label}-single" bind:value={currentPatternSettings.waveType}>
							{#each waveTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</fieldset>

<style>
	fieldset {
		grid-column: 1 / -1;
		border: 1px solid var(--border-color);
		border-radius: var(--radius-2);
		padding: var(--size-3);
		margin: 0;
		display: grid;
		gap: var(--size-2);
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
		display: grid;
		gap: var(--size-3);
		padding-top: var(--size-2);
		border-top: 1px solid var(--border-color);
	}

	.input-group {
		display: grid;
		gap: var(--size-1);
	}

	.sound-object-group {
		border: 1px dashed var(--border-color);
		border-radius: var(--radius-2);
		padding: var(--size-3);
		display: grid;
		gap: var(--size-2);
	}

	.sound-object-group hgroup {
		margin: 0;
	}

	.sound-object-group hgroup h4 {
		margin: 0;
		font-size: var(--font-size-2);
	}

	.sound-object-group hgroup p {
		margin: 0;
		font-size: var(--font-size-1);
		color: var(--text-color-light);
	}
</style>

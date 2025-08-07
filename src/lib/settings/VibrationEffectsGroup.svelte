<!-- VibrationEffectsGroup.svelte -->
<script>
	import { vibrate, vibratePatterns } from '$lib/utils/vibrate.js';

	// Props
	let {
		enabled = false,
		onEnabledChange = () => {},
		label = 'Vibration Effects',
		patternKey = 'basic',
	} = $props();

	// Create a deeply reactive copy of the vibratePatterns object
	const reactiveVibratePatterns = $state(structuredClone(vibratePatterns));

	let selectedPattern = $state(patternKey);

	const patternOptions = Object.keys(reactiveVibratePatterns);

	// Use a derived state to get the settings for the currently selected pattern
	const currentPatternSettings = $derived(reactiveVibratePatterns[selectedPattern]);

	// Function to test the current pattern
	function testPattern() {
		vibrate(reactiveVibratePatterns[selectedPattern], true); // Force enabled for testing
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
				{#each currentPatternSettings as duration, i}
					<div class="vibration-segment-group">
						<hgroup>
							<h4>{i % 2 === 0 ? 'Vibrate' : 'Pause'} {Math.floor(i / 2) + 1}</h4>
							<p>Vibration patterns alternate between vibrate and pause durations.</p>
						</hgroup>
						<div class="input-group">
							<label for="duration-{label}-{i}">
								{i % 2 === 0 ? 'Vibration' : 'Pause'} Duration (ms): {duration}
							</label>
							<input
								type="range"
								id="duration-{label}-{i}"
								bind:value={currentPatternSettings[i]}
								min={0}
								max={500}
								step={5} />
						</div>
					</div>
				{/each}
				<div class="pattern-actions">
					<button
						type="button"
						class="add-button"
						onclick={() => {
							currentPatternSettings.push(50);
							reactiveVibratePatterns[selectedPattern] = [...currentPatternSettings];
						}}>
						Add {currentPatternSettings.length % 2 === 0 ? 'Vibration' : 'Pause'}
					</button>
					{#if currentPatternSettings.length > 1}
						<button
							type="button"
							class="remove-button"
							onclick={() => {
								currentPatternSettings.pop();
								reactiveVibratePatterns[selectedPattern] = [...currentPatternSettings];
							}}>
							Remove Last
						</button>
					{/if}
				</div>
			{:else}
				<div class="input-group">
					<label for="duration-{label}-single"
						>Duration (ms): {currentPatternSettings}</label>
					<input
						type="range"
						id="duration-{label}-single"
						bind:value={reactiveVibratePatterns[selectedPattern]}
						min={5}
						max={500}
						step={5} />
				</div>
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

	.vibration-segment-group {
		border: 1px dashed var(--border-color);
		border-radius: var(--radius-2);
		padding: var(--size-3);
		display: grid;
		gap: var(--size-2);
	}

	.vibration-segment-group hgroup {
		margin: 0;
	}

	.vibration-segment-group hgroup h4 {
		margin: 0;
		font-size: var(--font-size-2);
	}

	.vibration-segment-group hgroup p {
		margin: 0;
		font-size: var(--font-size-1);
		color: var(--text-color-light);
	}

	.pattern-actions {
		display: flex;
		gap: var(--size-2);
		justify-content: flex-start;
		flex-wrap: wrap;
	}

	.add-button,
	.remove-button {
		padding: var(--size-1) var(--size-2);
		font-size: var(--font-size-0);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-1);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.add-button {
		background: var(--green-2);
		color: var(--green-9);
		border-color: var(--green-6);
	}

	.add-button:hover {
		background: var(--green-3);
		border-color: var(--green-7);
	}

	.remove-button {
		background: var(--red-2);
		color: var(--red-9);
		border-color: var(--red-6);
	}

	.remove-button:hover {
		background: var(--red-3);
		border-color: var(--red-7);
	}
</style>

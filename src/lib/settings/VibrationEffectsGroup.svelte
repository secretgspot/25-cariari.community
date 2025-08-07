<!-- VibrationEffectsGroup.svelte -->
<script>
	import { vibrationPatterns } from './settings.js';
	import { vibrate } from '$lib/utils/vibrate.js';

	// Props
	let {
		enabled = false,
		onEnabledChange = () => {},
		label = 'Vibration Effects',
		patternKey = 'basic',
	} = $props();

	let selectedPattern = $state(patternKey);

	const patternOptions = Object.keys($vibrationPatterns);

	// Use a derived state to get the settings for the currently selected pattern
	const currentPatternSettings = $derived($vibrationPatterns[selectedPattern]);

	// Function to test the current pattern
	function testPattern() {
		vibrate($vibrationPatterns[selectedPattern], true); // Force enabled for testing
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
						<div class="input-group">
							<label for="duration-{label}-{i}">
								{i % 2 === 0 ? 'Vibration' : 'Pause'} Duration (ms)
							</label>
							<input
								type="number"
								id="duration-{label}-{i}"
								bind:value={$vibrationPatterns[selectedPattern][i]}
								min={0}
								max={500}
								step={5} />
						</div>
					</div>
				{/each}
			{:else}
				<div class="vibration-segment-group">
					<div class="input-group">
						<label for="duration-{label}-single">Duration (ms)</label>
						<input
							type="number"
							id="duration-{label}-single"
							bind:value={$vibrationPatterns[selectedPattern]}
							min={5}
							max={500}
							step={5} />
					</div>
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

	.vibration-segment-group {
		display: flex;
		gap: var(--size-2);
		justify-content: space-between;
		flex: 1;
	}
</style>

<script>
	import { settings } from './settings.js';
	import { vibrate } from '$lib/utils/vibrate.js';

	// Props
	let {
		enabled = false,
		onEnabledChange = () => {},
		label = 'Vibration Effects',
		patternKey = 'basic',
	} = $props();

	let currentSettings = $state($settings);

	$effect(() => {
		$settings = currentSettings;
	});

	// Get the settings for the specific pattern directly from the main store
	const currentPatternSettings = $derived(currentSettings.vibration_patterns[patternKey]);

	// Function to test the current pattern
	function testPattern() {
		vibrate(currentSettings.vibration_patterns[patternKey], true); // Force enabled for testing
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
				{#each currentPatternSettings as _, i}
					{#if i % 2 === 0}
						<div class="vibration-segment-group">
							<div class="input-group">
								<label for="duration-{label}-{i}">Vibration Duration (ms)</label>
								<input
									type="number"
									id="duration-{label}-{i}"
									bind:value={currentSettings.vibration_patterns[patternKey][i]}
									min={0}
									max={500}
									step={5} />
							</div>
							<div class="input-group">
								<label for="duration-{label}-{i + 1}">Pause Duration (ms)</label>
								<input
									type="number"
									id="duration-{label}-{i + 1}"
									bind:value={currentSettings.vibration_patterns[patternKey][i + 1]}
									min={0}
									max={500}
									step={5} />
							</div>
						</div>
					{/if}
				{/each}
			{:else}
				<div class="vibration-segment-group">
					<div class="input-group">
						<label for="duration-{label}-single">Duration (ms)</label>
						<input
							type="number"
							id="duration-{label}-single"
							bind:value={currentSettings.vibration_patterns[patternKey]}
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
		flex-direction: column; /* Use column to stack the pattern selector and the input groups */
		gap: var(--size-3);
		font-size: small;
	}

	.pattern-select-group {
		display: flex;
		align-items: center;
		gap: var(--size-1);
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
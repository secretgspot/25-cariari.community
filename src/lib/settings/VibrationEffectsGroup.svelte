<script>
	import { settings } from './settings.js';
	import { vibrate } from '$lib/utils/vibrate.js';

	// Props
	let { enabled = $bindable(), label = 'Vibration Effects', patternKey = 'basic' } = $props();

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
		<div class="pattern-editor">
			{#if Array.isArray(currentPatternSettings)}
				{#each currentPatternSettings as _, i}
					{#if i % 2 === 0}
						<div class="segment-group">
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
				<div class="segment-group">
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
	.pattern-editor {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		width: 100%;
	}

	.segment-group {
		display: flex;
		gap: var(--size-2);
		justify-content: space-between;
		flex-wrap: wrap;
		padding: var(--size-2);
		font-size: x-small;
		&:nth-child(even) {
			background: var(--gray-0);
		}
	}

	.input-group {
		display: grid;
		gap: var(--size-1);
	}
</style>
<!-- src/lib/settings/VibrationPatternEditor.svelte -->
<script>
	let { pattern = {}, label = '' } = $props();
</script>

<div class="pattern-editor">
	{#if Array.isArray(pattern)}
		{#each pattern as _, i}
			{#if i % 2 === 0}
				<div class="segment-group">
					<div class="input-group">
						<label for="duration-{label}-{i}">Vibration Duration (ms)</label>
						<input
							type="number"
							id="duration-{label}-{i}"
							bind:value={pattern[i]}
							min={0}
							max={500}
							step={5} />
					</div>
					<div class="input-group">
						<label for="duration-{label}-{i + 1}">Pause Duration (ms)</label>
						<input
							type="number"
							id="duration-{label}-{i + 1}"
							bind:value={pattern[i + 1]}
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
					bind:value={pattern}
					min={5}
					max={500}
					step={5} />
			</div>
		</div>
	{/if}
</div>

<style>
	.pattern-editor {
		display: flex;
		gap: var(--size-2);
		width: 100%;
		flex-wrap: wrap;
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

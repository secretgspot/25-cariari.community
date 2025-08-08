<!-- src/lib/settings/SoundPatternEditor.svelte -->
<script>
	let { pattern = {}, label = '' } = $props();

	const waveTypes = ['sine', 'square', 'sawtooth', 'triangle'];
</script>

<div class="pattern-editor">
	{#if Array.isArray(pattern)}
		{#each pattern as _, i}
			<div class="segment-group">
				<div class="input-group">
					<label for="freq-{label}-{i}">Frequency (Hz)</label>
					<input
						type="number"
						id="freq-{label}-{i}"
						bind:value={pattern[i].frequency}
						min={10}
						max={2000}
						step={1} />
				</div>
				<div class="input-group">
					<label for="dur-{label}-{i}">Duration (ms)</label>
					<input
						type="number"
						id="dur-{label}-{i}"
						bind:value={pattern[i].duration}
						min={10}
						max={1000}
						step={1} />
				</div>
				<div class="input-group">
					<label for="delay-{label}-{i}">Delay (ms)</label>
					<input
						type="number"
						id="delay-{label}-{i}"
						bind:value={pattern[i].delay}
						min={0}
						max={1000}
						step={1} />
				</div>
				<div class="input-group">
					<label for="vol-{label}-{i}">Volume</label>
					<input
						type="number"
						id="vol-{label}-{i}"
						bind:value={pattern[i].volume}
						min={0}
						max={1}
						step={0.01} />
				</div>
				<div class="input-group">
					<label for="wave-{label}-{i}">Wave Type</label>
					<select id="wave-{label}-{i}" bind:value={pattern[i].waveType}>
						{#each waveTypes as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
			</div>
		{/each}
	{:else}
		<div class="segment-group">
			<div class="input-group">
				<label for="freq-{label}-single">Frequency (Hz)</label>
				<input
					type="number"
					id="freq-{label}-single"
					bind:value={pattern.frequency}
					min={20}
					max={2000}
					step={1} />
			</div>
			<div class="input-group">
				<label for="dur-{label}-single">Duration (ms)</label>
				<input
					type="number"
					id="dur-{label}-single"
					bind:value={pattern.duration}
					min={10}
					max={1000}
					step={1} />
			</div>
			{#if pattern.delay !== undefined}
				<div class="input-group">
					<label for="delay-{label}-single">Delay (ms)</label>
					<input
						type="number"
						id="delay-{label}-single"
						bind:value={pattern.delay}
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
					bind:value={pattern.volume}
					min={0}
					max={1}
					step={0.01} />
			</div>
			{#if pattern.waveType !== undefined}
				<div class="input-group">
					<label for="wave-{label}-single">Wave Type</label>
					<select id="wave-{label}-single" bind:value={pattern.waveType}>
						{#each waveTypes as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
			{/if}
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

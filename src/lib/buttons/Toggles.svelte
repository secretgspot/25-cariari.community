<!-- Toggles.svelte -->
<script>
	import { playButtonSound } from '$lib/utils/audio.js';
	import { vibrateButton } from '$lib/utils/vibrate.js';

	let {
		value = $bindable(),
		options = [],
		label = '',
		sound = true,
		sound_pattern = 'basic',
		buzz = true,
		buzz_pattern = 'click',
	} = $props();

	// Generate a unique name for the radio group to avoid conflicts
	const groupName = 'toggle-group-' + Math.random().toString(36).substring(2, 9);

	function handleChange() {
		if (sound) {
			playButtonSound(sound_pattern);
		}
		if (buzz) {
			vibrateButton(buzz_pattern);
		}
	}
</script>

<div
	class="toggle-group-container"
	role="radiogroup"
	aria-labelledby="group-label-{groupName}">
	{#if label}
		<span id="group-label-{groupName}" class="group-label">{label}</span>
	{/if}
	<div class="toggles" style="--count: {options.length};">
		{#each options as option, i}
			<input
				type="radio"
				id="{groupName}-{option}"
				name={groupName}
				bind:group={value}
				value={option}
				onchange={handleChange}
				checked={value === option} />
			<label for="{groupName}-{option}">{option}</label>
		{/each}
		<div
			class="highlight"
			style="transform: translateX(calc({options.indexOf(value) * 100}%));">
		</div>
	</div>
</div>

<style>
	.toggle-group-container {
		display: grid;
		gap: var(--size-2);
		grid-column: 1 / -1;
	}

	.group-label {
		font-size: var(--font-size-0);
		color: var(--text-2);
		padding-inline-start: var(--size-2);
	}

	.toggles {
		display: grid;
		grid-template-columns: repeat(var(--count), 1fr);
		position: relative;
		background: var(--surface-2);
		border-radius: var(--radius-2);
		padding: var(--size-1);

		input {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			margin: -1px;

			&:checked + label {
				color: var(--text-1);
			}

			&:not(:checked) + label:hover {
				color: var(--text-1);
				background: var(--surface-3);
			}
		}

		label {
			display: grid;
			place-items: center;
			padding: var(--size-2) var(--size-3);
			border-radius: var(--radius-2);
			cursor: pointer;
			color: var(--text-2);
			transition: color 0.2s ease-in-out;
			z-index: 1;
		}
	}

	.highlight {
		position: absolute;
		top: var(--size-1);
		left: var(--size-1);
		height: calc(100% - (var(--size-1) * 2));
		width: calc((100% - (var(--size-1) * 2)) / var(--count));
		background: var(--surface-4);
		border-radius: var(--radius-2);
		transition: transform var(--transition) ease-out;
		z-index: 0;
	}
</style>

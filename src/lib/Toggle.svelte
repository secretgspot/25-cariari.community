<!-- Toggle.svelte -->
<script>
	let { checked = $bindable(false), label } = $props();
</script>

<label class="toggle-container">
	<input type="checkbox" bind:checked />
	<div class="toggle-switch"></div>
	<span class="toggle-label">{label}</span>
</label>

<style>
	.toggle-container {
		display: flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
		gap: var(--size-3); /* Adjust as needed */
	}

	.toggle-container input {
		display: none;
	}

	.toggle-switch {
		position: relative;
		width: 40px; /* Width of the switch track */
		height: 20px; /* Height of the switch track */
		outline: 1px solid var(--gray-1);
		border-radius: var(--border-size-3); /* Half of height for pill shape */
	}

	.toggle-switch::before {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px; /* Size of the toggle knob */
		height: 16px; /* Size of the toggle knob */
		background-color: var(--stone-12); /* Knob color */
		border-radius: var(--border-size-3);
		transition: transform 0.1s ease-in-out;
	}

	.toggle-container input:checked + .toggle-switch {
		outline-color: var(--green-6); /* On state background */
	}

	.toggle-container input:checked + .toggle-switch::before {
		transform: translateX(20px); /* Move knob to the right */
	}

	.toggle-label {
		color: inherit; /* Adjust text color as needed */
	}
</style>

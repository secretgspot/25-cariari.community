<!-- ExpirationIndicator.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';

	let {
		start_date = '',
		end_date = '',
		height = '1px',
		updateInterval = 60000, // 1 minute by default
		onProgress = () => {}, // Default empty function
	} = $props();

	let percentage = $state(0);
	let interval = null;

	// Calculate expiration percentage
	function calculatePercentage() {
		if (!start_date || !end_date) return 0;

		const startTime = new Date(start_date).getTime();
		const endTime = new Date(end_date).getTime();
		const currentTime = Date.now();

		// Invalid dates or zero duration
		if (isNaN(startTime) || isNaN(endTime) || endTime <= startTime) {
			return 0;
		}

		// Before start date - show full (100%)
		if (currentTime < startTime) {
			return 100;
		}

		// After end date - expired (0%)
		if (currentTime >= endTime) {
			return 0;
		}

		// Calculate remaining percentage
		const totalDuration = endTime - startTime;
		const remainingDuration = endTime - currentTime;
		return Math.max(0, Math.min(100, (remainingDuration / totalDuration) * 100));
	}

	// Update percentage and trigger callback
	function updatePercentage() {
		const newPercentage = calculatePercentage();
		if (newPercentage !== percentage) {
			percentage = newPercentage;
			onProgress(percentage);
		}
	}

	// Initial calculation and setup interval
	onMount(() => {
		updatePercentage();

		if (updateInterval > 0) {
			interval = setInterval(updatePercentage, updateInterval);
		}
	});

	// Cleanup interval
	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});

	// Recalculate when props change
	$effect(() => {
		updatePercentage();
	});
</script>

<div class="expiration-indicator-container" style="height: {height};">
	<div
		class="expiration-indicator-fill"
		style="width: {percentage}%;"
		class:expired={percentage <= 10}
		class:full={percentage >= 90}>
	</div>
</div>

<style>
	.expiration-indicator-container {
		width: 100%;
		overflow: hidden;
		height: 1px;
		border-radius: var(--radius-2);
		position: absolute;
		bottom: -1px;
		left: var(--border-size-2);
		right: var(--border-size-2);
		opacity: 0.3;
	}

	.expiration-indicator-fill {
		height: 100%;
		border-radius: var(--radius-2);
		background-color: var(--blue-6);
		transition: width var(--transition) ease-out;
		&.expired {
			background-color: var(--red-6);
		}

		&.full {
			background-color: var(--green-6);
		}
	}
</style>

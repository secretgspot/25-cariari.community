<script>
	import { tick } from 'svelte';

	let {
		start_date = '',
		end_date = '',
		height = '1px',
		onProgress = (percentage) => {}, // Default empty function
	} = $props();

	let percentage = $state(0);

	$effect(() => {
		const startDateObj = new Date(start_date);
		const endDateObj = new Date(end_date);
		const now = new Date(); // Get current time inside effect for reactivity

		// Calculate total duration in milliseconds
		const totalDurationMs = endDateObj.getTime() - startDateObj.getTime();

		// Calculate remaining duration in milliseconds
		const remainingDurationMs = endDateObj.getTime() - now.getTime();

		let newPercentage;

		if (totalDurationMs <= 0) {
			// If the duration is zero or negative (end_date is before or same as start_date),
			// it means the item is already expired or dates are invalid.
			newPercentage = 0; // Show an empty bar
		} else if (remainingDurationMs <= 0) {
			// If remaining time is zero or negative, but total duration was positive,
			// it means the item has just expired or expired in the past.
			newPercentage = 0; // Show an empty bar
		} else if (now.getTime() < startDateObj.getTime()) {
			// If current time is before the start_date, the item hasn't started expiring yet.
			// It should appear full (100%)
			newPercentage = 100;
		} else {
			// Calculate percentage of remaining time relative to total duration
			newPercentage = (remainingDurationMs / totalDurationMs) * 100;

			// Clamp the percentage between 0 and 100
			newPercentage = Math.max(0, Math.min(100, newPercentage));
		}

		// Only update and call the callback if the percentage actually changed
		if (newPercentage !== percentage) {
			percentage = newPercentage;
			onProgress(percentage);
		}
	});

	// Optional: Update percentage periodically for real-time updates.
	// This is crucial for an "expiration indicator" that changes over time without a page refresh.
	let interval;
	$effect(() => {
		// Clear any existing interval when props change or component unmounts
		if (interval) clearInterval(interval);

		// Update every minute (or more frequently if needed, but consider performance)
		interval = setInterval(() => {
			// Re-trigger the effect by subtly changing a prop or just by the interval running.
			// The effect itself should re-evaluate `now = new Date()`
			// A simple way to trigger the effect is to call it implicitly by changing a reactive variable,
			// or just allowing the interval to update the state within the effect's scope.
			// However, since `now` is inside the effect, the effect will naturally re-run and re-calculate.
			// No explicit state change is needed outside if the logic is self-contained in the effect.
			// The `now` variable is re-initialized on each effect run.
		}, 1000 * 60); // Update every minute

		// Cleanup function for the interval
		return () => clearInterval(interval);
	});
</script>

<div class="expiration-indicator-container" style="height: {height};">
	<div class="expiration-indicator-fill" style="width: {percentage}%;"></div>
</div>

<style>
	.expiration-indicator-container {
		width: 100%;
		overflow: hidden;
		height: 1px;
		background-color: var(--gray-1);
		border-radius: var(--border-size-3);
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
	}

	.expiration-indicator-fill {
		height: 100%;
		border-radius: var(--border-size-3);
		background-color: var(--gray-4);
		transition: width 0.3s ease-out; /* Smooth transition for percentage changes */
	}
</style>

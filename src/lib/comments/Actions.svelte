<script>
	let { children } = $props();

	let isOpen = $state(false);
	let timeoutId = $state(null);

	function handleMouseEnter() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		isOpen = true;
	}

	function handleMouseLeave() {
		timeoutId = setTimeout(() => {
			isOpen = false;
		}, 120);
	}
</script>

<div
	class="actions-container"
	class:open={isOpen}
	role="button"
	tabindex="0"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}>
	<button class="dots-button" type="button" aria-label="Actions">
		<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
			<circle cx="3" cy="8" r="1.5" />
			<circle cx="8" cy="8" r="1.5" />
			<circle cx="13" cy="8" r="1.5" />
		</svg>
	</button>

	{#if isOpen}
		<div class="dropdown">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.actions-container {
		position: relative;
		display: inline-block;
		&.open {
			.dots-button {
				color: var(--text-2);
			}
		}

		.dots-button {
			background: none;
			border: none;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0;
		}

		.dropdown {
			position: absolute;
			top: 0;
			right: 100%;
			background: var(--surface-1);
			border-radius: var(--radius-2);
			padding-inline: var(--size-2);
			padding-block: var(--size-1);
			z-index: 2;
			display: flex;
			gap: var(--size-2);
		}
	}
</style>

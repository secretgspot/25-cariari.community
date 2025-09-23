<script>
	let { children } = $props();

	let isOpen = $state(false);
	let timeoutId;

	const showDropdown = () => {
		clearTimeout(timeoutId);
		isOpen = true;
	};

	const hideDropdown = () => {
		timeoutId = setTimeout(() => (isOpen = false), 120);
	};
</script>

<div
	class="dropdown-container"
	class:open={isOpen}
	role="button"
	tabindex="0"
	onmouseenter={showDropdown}
	onmouseleave={hideDropdown}>
	<button class="trigger" type="button" aria-label="Actions">
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
	.dropdown-container {
		position: relative;
		display: inline-block;

		&.open .trigger {
			color: var(--text-2);
		}
	}

	.trigger {
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
		padding: var(--size-1) var(--size-2);
		z-index: 2;
		display: flex;
		gap: var(--size-2);
	}
</style>

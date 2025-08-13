<script>
	/**
	 * @typedef {Object} AdData
	 * @property {string} file - Image filename
	 * @property {string} title - Ad title/alt text
	 * @property {string} href - Click destination URL
	 * @property {number} width - Ad width in pixels
	 * @property {number} height - Ad height in pixels
	 */

	/**
	 * @type {{
	 *   width: number,
	 *   height: number,
	 *   children?: import('svelte').Snippet,
	 *   loading?: 'lazy' | 'eager',
	 *   onclick?: (event: MouseEvent) => void,
	 *   'aria-label'?: string
	 * }}
	 */
	let {
		width,
		height,
		children,
		loading = 'lazy',
		onclick,
		'aria-label': ariaLabel = `Advertisement ${width}x${height}`,
	} = $props();

	// Calculate aspect ratio for responsive behavior
	const aspectRatio = $derived((height / width) * 100);

	function handleClick(event) {
		onclick?.(event);
	}
</script>

<div
	class="advertising"
	style="width:{width}px; height:{height}px; aspect-ratio:{width}/{height};"
	role="banner"
	aria-label={ariaLabel}
	onclick={handleClick}>
	{#if children}
		{@render children()}
	{:else}
		<small class="placeholder">
			{width}×{height}<br />
			<span class="ad-text">AD</span>
		</small>
	{/if}
</div>

<style>
	.advertising {
		position: relative;
		background: var(--surface-2);
		color: var(--text-1);
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: var(--radius-2);
		text-align: center;
		cursor: pointer;

		&:hover {
			filter: brightness(1.05);
		}

		&::after {
			content: 'ad';
			position: absolute;
			top: var(--size-1);
			right: var(--size-1);
			color: var(--text-2);
			line-height: 1;
			text-transform: uppercase;
			background: var(--surface-1);
			padding: calc(var(--size-1) / 2) var(--size-1);
			border-radius: var(--border-size-3);
			pointer-events: none;
			font-size: xx-small;
		}

		:global(a) {
			display: block;
			line-height: 0;
			width: 100%;
			height: 100%;
			text-decoration: none;
			border-radius: inherit;
		}

		:global(img) {
			width: 100%;
			height: 100%;
			object-fit: cover;
			border-radius: inherit;
		}
	}

	.placeholder {
		font-size: 12px;
		font-weight: 500;
		user-select: none;
	}

	.ad-text {
		font-weight: 700;
		opacity: 0.7;
	}
</style>

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
		'aria-label': ariaLabel = `Advertisement ${width}x${height}`
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
	onclick={handleClick}
>
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
		background: var(--surface-2, #f5f5f5);
		color: var(--text-1, #333);
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: var(--shadow-1, 0 1px 3px rgba(0, 0, 0, 0.12));
		border-radius: var(--radius-2, 8px);
		text-align: center;
		opacity: var(--brightness, 1);
		transition: opacity 0.2s ease, transform 0.2s ease;
		overflow: hidden;
		min-width: 0; /* Allows flex shrinking */
		cursor: pointer;
	}

	.advertising:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.advertising::after {
		content: 'ad';
		position: absolute;
		top: 4px;
		right: 4px;
		font-size: 9px;
		color: var(--text-2, #666);
		line-height: 1;
		text-transform: uppercase;
		background: rgba(255, 255, 255, 0.8);
		padding: 2px 4px;
		border-radius: 2px;
		pointer-events: none;
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

	/* Global styles for content */
	.advertising :global(a) {
		display: block;
		line-height: 0;
		width: 100%;
		height: 100%;
		text-decoration: none;
	}

	.advertising :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--radius-2, 8px);
		transition: transform 0.2s ease;
	}

	.advertising:hover :global(img) {
		transform: scale(1.02);
	}

	/* Responsive behavior */
	@media (max-width: 768px) {
		.advertising {
			max-width: 100%;
			height: auto;
		}
		
		.advertising :global(img) {
			height: auto;
		}
	}

	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		.advertising,
		.advertising :global(img) {
			transition: none;
		}
		
		.advertising:hover {
			transform: none;
		}
		
		.advertising:hover :global(img) {
			transform: none;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.advertising {
			border: 2px solid var(--text-1, #333);
		}
		
		.advertising::after {
			background: var(--surface-1, #fff);
			border: 1px solid var(--text-2, #666);
		}
	}
</style>
<script>
	/** @type {{disabled?: boolean, isLink?: boolean, href?: any, external?: boolean, children?: import('svelte').Snippet, [key: string]: any}} */
	let {
		disabled = false,
		isLink = false,
		href = null,
		external = false,
		children,
		...rest
	} = $props();

	function handleClick(event) {
		if (rest.onclick) {
			rest.onclick(event);
		}
	}
</script>

{#if isLink || href}
	<a
		class:disabled
		data-sveltekit-prefetch
		{...rest}
		role="button"
		href={href ?? 'javascript:void(0);'}
		target={external ? '_blank' : null}
		onclick={handleClick}>
		{@render children?.()}
	</a>
{:else}
	<button {...rest} class:disabled {disabled} onclick={handleClick}>
		{@render children?.()}
	</button>
{/if}

<style>
	button,
	a {
		border: none;
		background: none;
		cursor: pointer;
		font-size: inherit;
		text-decoration: none;
		box-shadow: var(--accent) 0 -2px 0 -1px inset;
		color: var(--primary-content);
		padding-bottom: 2px;
		transition: box-shadow calc(var(--transition) / 2) ease-in-out;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		white-space: nowrap;
	}
	button:hover,
	a:hover {
		box-shadow: var(--accent) inset 0 -3px 0 -1px;
		color: var(--accent);
	}
	button.active,
	a.active {
		box-shadow: var(--accent) inset 0 -5px 0 -1px;
		color: var(--accent);
	}
</style>

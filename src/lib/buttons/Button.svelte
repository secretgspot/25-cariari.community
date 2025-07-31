<script>
	import { navigating } from '$app/stores';
	import { computeClasses } from './utils.js';
	import { Spinner } from '$lib/loaders';

	let {
		size = 'medium',
		disabled = false,
		outline = false,
		right = false,
		loading = false,
		shadow = false,
		isLink = false,
		href = false,
		external = false,
		icon,
		children,
		onclick,
		...rest
	} = $props();

	function handleClick(event) {
		if (onclick) {
			onclick(event);
		}
	}

	const classes = $derived(
		`button ${rest.class ?? ''} ${computeClasses('btn', {
			size,
			shadow,
			outline,
			right,
		})}`,
	);

	const isDisabled = $derived(disabled || loading || $navigating);
	const isLinkType = $derived(isLink || href);
	const linkHref = $derived(href ?? 'javascript:void(0);');
	const linkTarget = $derived(external ? '_blank' : null);

	// Spinner sizes based on button size
	const getSpinnerSize = $derived.by(() => {
		if (size === 'icon') return '21';
		if (size === 'block') return '15';
		if (size === 'small') return '12';
		return '18';
	});

	// Spinner sizes for icon state specifically
	const getIconSpinnerSize = $derived.by(() => {
		if (size === 'icon') return '21';
		if (size === 'small') return '27';
		return '36';
	});
</script>

{#if isLinkType}
	<a
		class:disabled={isDisabled}
		class={classes}
		data-sveltekit-prefetch
		role="button"
		href={linkHref}
		target={linkTarget}
		onclick={handleClick}
		{...rest}>
		{#if size === 'icon'}
			<div class="icon_wrap">
				{#if loading}
					<Spinner size={getSpinnerSize} />
				{:else if icon}
					{@render icon()}
				{:else}
					🧵
				{/if}
			</div>
		{:else if size === 'block'}
			<div class="content_wrap">
				<span class="title">
					{#if loading}<Spinner size={getSpinnerSize} />{/if}
					{@render children?.()}
				</span>
			</div>
		{:else}
			<div class="icon_wrap">
				{#if loading}
					<Spinner size={getIconSpinnerSize} />
				{:else if icon}
					{@render icon()}
				{:else}
					🧵
				{/if}
			</div>
			<div class="content_wrap">
				<b class="title">{@render children?.()}</b>
			</div>
		{/if}
	</a>
{:else}
	<button
		{...rest}
		class:disabled={isDisabled}
		class={classes}
		disabled={isDisabled}
		onclick={handleClick}>
		{#if size === 'icon'}
			<div class="icon_wrap">
				{#if loading}
					<Spinner size={getSpinnerSize} />
				{:else if icon}
					{@render icon()}
				{:else}
					🧵
				{/if}
			</div>
		{:else if size === 'block'}
			<div class="content_wrap">
				<span class="title">
					{#if loading}<Spinner size={getSpinnerSize} />{/if}
					{@render children?.()}
				</span>
			</div>
		{:else}
			<div class="icon_wrap">
				{#if loading}
					<Spinner size={getIconSpinnerSize} />
				{:else if icon}
					{@render icon()}
				{:else}
					🧵
				{/if}
			</div>
			<div class="content_wrap">
				<b class="title">{@render children?.()}</b>
			</div>
		{/if}
	</button>
{/if}

<style>
	.button {
		display: flex;
		width: auto;
		height: min-content;
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--border-size-3);
		background: var(--stone-1);
		/* color: var(--primary-content); */
		text-decoration: none;
		padding: 0;
		cursor: pointer;
		user-select: none;
		transition: background var(--transition, 0.3s) cubic-bezier(0.33, 1, 0.69, 1);
		touch-action: manipulation;
		z-index: 2;
	}
	.button:hover,
	.button:active,
	.button:focus,
	.button.active {
		background: var(--stone-2);
	}
	.shadow {
		box-shadow: var(--shadow-1);
	}
	.shadow:hover,
	.shadow:active {
		box-shadow: var(--shadow-2);
	}
	.icon_wrap {
		display: flex;
	}
	.content_wrap {
		display: flex;
		flex-flow: column;
	}

	.btn-icon {
		display: inline-flex;
		align-items: center;
		border-radius: var(--border-size-3);
		/* box-shadow: inherit; */
		justify-content: center;
		width: inherit;
		height: inherit;
		/* border-color: transparent; */
		background: transparent;
		color: var(--primary);
	}
	.btn-icon:hover {
		background: transparent;
		color: var(--primary-content);
		outline: solid 6px var(--stone-6);
	}
	.btn-icon .icon_wrap {
		padding: var(--size-1);
	}

	.btn-small {
		align-items: center;
		white-space: nowrap;
	}
	.btn-small:active,
	.btn-small:focus,
	.btn-small:hover {
		background: var(--primary);
		/* border-color: var(--accent); */
		border-style: solid;
	}
	.btn-small .icon_wrap {
		padding: var(--size-2);
	}
	.btn-small .content_wrap {
		padding: 0 calc(var(--size-2) * 2);
		border-left: var(--border-size-1) solid var(--stone-3);
	}

	.btn-medium {
		/* width: 270px; */
		align-items: center;
		/* box-shadow: var(--shadow-small); */
	}
	.btn-medium:active,
	.btn-medium:focus,
	.btn-medium:hover {
		border-style: solid;
		/* border-color: var(--accent); */
	}
	.btn-medium .icon_wrap {
		display: flex;
		flex-flow: row wrap;
		justify-content: flex-start;
		align-items: center;
		padding: var(--size-3);
	}
	.btn-medium .content_wrap {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: flex-start;
		flex: 1 0 auto;
		padding: var(--size-3);
		border-left: var(--border-size-1) solid var(--stone-3);
	}

	.btn-block {
		width: 100%;
		padding: var(--padding-small);
		/* text-shadow: 0 1px 0 var(--base-300); */
		font-weight: 600;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
	.btn-block:active,
	.btn-block:focus,
	.btn-block:hover {
		border-style: solid;
		/* border-color: var(--accent); */
	}
	.btn-block .content_wrap {
		flex: 1;
	}
	.btn-block .content_wrap .title {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.right {
		flex-flow: row-reverse;
	}
	.right .content_wrap {
		border-left: 0;
		border-right: var(--border-size-1) solid var(--stone-3);
	}
	[disabled],
	.disabled {
		cursor: pointer;
		background: var(--primary-focus);
		opacity: 0.6;
		pointer-events: none;
	}
	[disabled]:hover,
	[disabled]:focus,
	.disabled:focus,
	.disabled:hover {
		background: var(--primary-focus);
		box-shadow: none;
		opacity: 0.6;
	}
	[green] {
		border-color: var(--green-3);
	}
	[green]:hover {
		border-color: var(--green-4);
	}
	[red] {
		border-color: var(--red-3);
	}
	[red]:hover {
		border-color: var(--red-4);
	}
</style>

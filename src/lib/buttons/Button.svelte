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

	// Derived values
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

	// Simplified spinner size logic
	const spinnerSizes = {
		icon: { normal: '21', whenIcon: '12' },
		block: { normal: '15', whenIcon: '15' },
		small: { normal: '12', whenIcon: '15' },
		medium: { normal: '18', whenIcon: '16' },
	};

	const getSpinnerSize = $derived(spinnerSizes[size]?.normal || '18');
	const getIconSpinnerSize = $derived(spinnerSizes[size]?.whenIcon || '16');

	// Component props for common elements
	const commonProps = $derived({
		class: classes,
		'class:disabled': isDisabled,
		onclick: handleClick,
		...rest,
	});

	const linkProps = $derived({
		...commonProps,
		'data-sveltekit-prefetch': true,
		role: 'button',
		href: linkHref,
		target: linkTarget,
	});

	const buttonProps = $derived({
		...commonProps,
		disabled: isDisabled,
	});
</script>

<!-- Icon Content Component -->
{#snippet iconContent()}
	<div class="icon_wrap">
		{#if loading}
			<Spinner size={size === 'icon' ? getSpinnerSize : getIconSpinnerSize} />
		{:else if icon}
			{@render icon()}
		{:else}
			🧵
		{/if}
	</div>
{/snippet}

<!-- Text Content Component -->
{#snippet textContent()}
	<div class="content_wrap">
		{#if size === 'block'}
			<span class="title">
				{#if loading}<Spinner size={getSpinnerSize} />{/if}
				{@render children?.()}
			</span>
		{:else}
			<b class="title">{@render children?.()}</b>
		{/if}
	</div>
{/snippet}

<!-- Button Content Component -->
{#snippet buttonContent()}
	{#if size === 'icon'}
		{@render iconContent()}
	{:else if size === 'block'}
		{@render textContent()}
	{:else}
		{@render iconContent()}
		{@render textContent()}
	{/if}
{/snippet}

<!-- Main Template -->
{#if isLinkType}
	<a {...linkProps}>
		{@render buttonContent()}
	</a>
{:else}
	<button {...buttonProps}>
		{@render buttonContent()}
	</button>
{/if}

<style>
	.button {
		display: flex;
		width: auto;
		height: min-content;
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--border-size-3);
		background: transparent;
		text-decoration: none;
		padding: 0;
		cursor: pointer;
		user-select: none;
		transition: background var(--transition, 0.3s) cubic-bezier(0.33, 1, 0.69, 1);
		touch-action: manipulation;
		z-index: 2;
		&:hover,
		&:active,
		&:focus,
		&.active {
			background: var(--stone-2);
		}
	}

	.shadow {
		box-shadow: var(--shadow-1);
		&:hover,
		&:active {
			box-shadow: var(--shadow-2);
		}
	}

	.icon_wrap {
		display: flex;
	}

	.content_wrap {
		display: flex;
		flex-flow: column;
	}

	/* Size-specific styles */
	.btn-icon {
		display: inline-flex;
		align-items: center;
		border-radius: var(--border-size-3);
		justify-content: center;
		width: inherit;
		height: inherit;
		background: transparent;
		color: var(--primary);
		&:hover {
			background: transparent;
			color: var(--primary-content);
			outline: solid 3px var(--stone-1);
		}

		.icon_wrap {
			padding: var(--size-1);
		}
	}

	.btn-small {
		align-items: center;
		white-space: nowrap;
		box-shadow: var(--shadow-1);
		&:active,
		&:focus,
		&:hover {
			background: var(--primary);
			border-style: solid;
		}
		.icon_wrap {
			padding: var(--size-2);
		}

		.content_wrap {
			padding: 0 calc(var(--size-2) * 2);
			border-left: var(--border-size-1) solid var(--stone-3);
		}
	}

	.btn-medium {
		align-items: center;
		box-shadow: var(--shadow-1);

		&:active,
		&:focus,
		&:hover {
			border-style: solid;
		}

		.icon_wrap {
			display: flex;
			flex-flow: row wrap;
			justify-content: flex-start;
			align-items: center;
			padding: var(--size-3);
		}

		.content_wrap {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: flex-start;
			flex: 1 0 auto;
			padding: var(--size-3);
			border-left: var(--border-size-1) solid var(--stone-3);
		}
	}

	.btn-block {
		width: 100%;
		padding: var(--padding-small);
		font-weight: 600;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		&:active,
		&:focus,
		&:hover {
			border-style: solid;
		}

		.content_wrap {
			flex: 1;

			.title {
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}

	.right {
		flex-flow: row-reverse;
		.content_wrap {
			border-left: 0;
			border-right: var(--border-size-1) solid var(--stone-3);
		}
	}

	[disabled],
	.disabled {
		cursor: pointer;
		background: var(--primary-focus);
		opacity: 0.6;
		pointer-events: none;

		&:hover,
		&:focus {
			background: var(--primary-focus);
			box-shadow: none;
			opacity: 0.6;
		}
	}

	[green] {
		border-color: var(--green-3);
		&:hover {
			border-color: var(--green-4);
		}
	}

	[red] {
		border-color: var(--red-3);
		&:hover {
			border-color: var(--red-4);
		}
	}
</style>

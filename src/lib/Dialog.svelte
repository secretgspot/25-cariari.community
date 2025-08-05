<script>
	import { Button } from '$lib/buttons';

	const {
		title = 'Dialog Title',
		message = 'This is a message from the dialog.',
		type = 'alert',
		open = false,
		onConfirm = () => {},
		onCancel = () => {},
	} = $props();

	let dialogRef;

	$effect(() => {
		if (dialogRef && open) {
			dialogRef.showModal();
		} else if (dialogRef && !open) {
			dialogRef.close();
		}
	});
</script>

<dialog
	bind:this={dialogRef}
	class="modal dialog"
	aria-modal="true"
	aria-labelledby="dialog-title"
	aria-describedby="dialog-description">
	<header>
		<h2 id="dialog-title">{title}</h2>
		<Button size="icon" aria-label="Close dialog" onclick={onCancel}>
			{#snippet icon()}
				<svg
					width="15"
					height="15"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 271 297">
					<path
						stroke="var(--red-6)"
						stroke-linecap="round"
						stroke-width="50"
						d="M25-25h298.265"
						transform="scale(.94832 1.04914) rotate(45 -30.53 13.668)" />
					<path
						stroke="var(--red-6)"
						stroke-linecap="round"
						stroke-width="50"
						d="M25-25h298.265"
						transform="scale(.94832 1.04914) rotate(-45 361.132 94.18)" />
				</svg>
			{/snippet}
		</Button>
	</header>

	<div id="dialog-description">
		<p>{message}</p>
	</div>

	<footer>
		{#if type === 'alert'}
			<Button type="button" size="block" onclick={onConfirm}>OKAY</Button>
		{:else if type === 'confirm'}
			<Button onclick={onCancel}>
				{#snippet icon()}
					<svg
						width="15"
						height="15"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 271 297">
						<path
							stroke="var(--red-6)"
							stroke-linecap="round"
							stroke-width="50"
							d="M25-25h298.265"
							transform="scale(.94832 1.04914) rotate(45 -30.53 13.668)" />
						<path
							stroke="var(--red-6)"
							stroke-linecap="round"
							stroke-width="50"
							d="M25-25h298.265"
							transform="scale(.94832 1.04914) rotate(-45 361.132 94.18)" />
					</svg>
				{/snippet}
				Cancel
			</Button>

			<Button type="button" red onclick={onConfirm}>
				{#snippet icon()}
					👍
				{/snippet}
				Confirm
			</Button>
		{/if}
	</footer>
</dialog>

<style>
	dialog {
		--transition: 0.3s;
		display: grid;
		grid-template-rows: min-content 1fr min-content;
		align-items: center;
		min-width: 369px;
		width: min-content;
		height: min-content;
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--border-size-3);
		pointer-events: none;
		z-index: 6;
		position: fixed;
		align-self: anchor-center;

		&,
		&::backdrop {
			backdrop-filter: blur(12px);
			transition:
				display var(--transition) allow-discrete,
				overlay var(--transition) allow-discrete,
				transform var(--transition),
				opacity var(--transition);
			opacity: 0;
		}

		&[open] {
			opacity: 1;
			pointer-events: auto;
			transform: scale(1);
			&::backdrop {
				opacity: 1;
			}
		}

		@starting-style {
			&[open],
			&[open]::backdrop {
				opacity: 0;
			}
		}

		@media (prefers-reduced-motion: no-preference) {
			transform: scale(0.93);
		}

		header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			#dialog-title {
				margin: 0;
				flex: 1;
				text-align: left;
			}
		}

		#dialog-description {
			margin: var(--size-3);
		}

		footer {
			display: flex;
			gap: var(--size-3);
			justify-content: space-around;
		}
	}
</style>

<!-- ContentItem.svelte -->
<script>
	import Button from '$lib/buttons/Button.svelte';
	import Dialog from '$lib/Dialog.svelte';

	let { item, itemKey, linkPrefix, type, onDelete } = $props();

	let loading = $state(false);
	let showDeleteDialog = $state(false);

	const handleDelete = () => {
		showDeleteDialog = true;
	};

	const confirmDelete = async () => {
		showDeleteDialog = false; // Close dialog immediately
		loading = true;
		try {
			await onDelete(item.id, type);
		} finally {
			loading = false;
		}
	};
</script>

<li class="content-item">
	<div class="item-info">
		{#if linkPrefix}
			<a href="{linkPrefix}/{item.id}" class="item-link">
				{item[itemKey]}
			</a>
		{:else}
			<span class="item-title">{item[itemKey]}</span>
		{/if}
	</div>

	<Button
		size="icon"
		aria-label="Delete {type}"
		onclick={handleDelete}
		{loading}
		disabled={loading}>
		{#snippet icon()}
			<svg
				width="16"
				height="16"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 271 297"
				aria-hidden="true">
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
</li>

<Dialog
	open={showDeleteDialog}
	title="Delete {type}"
	message="Are you sure you want to delete this {type}? This action cannot be undone."
	type="confirm"
	onConfirm={confirmDelete}
	onCancel={() => (showDeleteDialog = false)} />

<style>
	.content-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--size-2);
		border-bottom: var(--border-size-1) solid var(--stone-3);
	}

	.content-item:last-child {
		border-bottom: none;
	}

	.item-info {
		flex: 1;
	}

	.item-link {
		color: var(--blue-6);
		text-decoration: none;
		font-weight: 500;
	}

	.item-link:hover {
		text-decoration: underline;
	}

	.item-title {
		font-weight: 500;
	}
</style>

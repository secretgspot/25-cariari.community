<!-- ContentItem.svelte -->
<script>
	import { Button, LinkButton } from '$lib/buttons';
	import Dialog from '$lib/Dialog.svelte';
	import Icon from '$lib/Icon.svelte';

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
			<LinkButton
				href="{linkPrefix}/{item.id}"
				underline={false}
				sound_pattern="swipe"
				class="item-link">
				{item[itemKey]}
			</LinkButton>
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
			<Icon kind="delete" size="12" />
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
		border-bottom: var(--border-size-1) solid var(--surface-3);
		&:last-child {
			border-bottom: none;
		}
		&:hover {
			background-color: var(--surface-2);
		}

		.item-info {
			flex: 1;

			:global(a.item-link) {
				color: var(--text-1);
				text-decoration: none;
				/* font-weight: 500; */
				white-space: normal;
			}
			/* .item-title {
				font-weight: 500;
			} */
		}
	}
</style>

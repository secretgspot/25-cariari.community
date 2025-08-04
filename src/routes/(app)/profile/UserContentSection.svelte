<!-- UserContentSection.svelte -->
<script>
	import Button from '$lib/buttons/Button.svelte';

	let { title, items, itemKey, linkPrefix, type, onDelete } = $props();

	let loading = $state(false);

	const handleDelete = async (id) => {
		if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
		await onDelete(id, type);
	};
</script>

{#if items && items.length > 0}
	<section class="content-section">
		<h2>{title}</h2>
		<ul class="content-list">
			{#each items as item}
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
						onclick={() => handleDelete(item.id)}
						{loading}
						disabled={loading}>
						{#snippet icon()}
							<svg
								width="12"
								height="12"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 271 297"
								><path
									stroke="var(--red-6)"
									stroke-linecap="round"
									stroke-width="50"
									d="M25-25h298.265"
									transform="scale(.94832 1.04914) rotate(45 -30.53 13.668)" /><path
									stroke="var(--red-6)"
									stroke-linecap="round"
									stroke-width="50"
									d="M25-25h298.265"
									transform="scale(.94832 1.04914) rotate(-45 361.132 94.18)" /></svg>
						{/snippet}
					</Button>
				</li>
			{/each}
		</ul>
	</section>
{:else}
	<section class="content-section">
		<h2>{title}</h2>
		<p class="no-items">No items found.</p>
	</section>
{/if}

<style>
	.content-section {
		margin-block: var(--size-8);

		h2 {
			color: #333;
			margin-bottom: 1em;
			font-size: 1.25em;
		}
	}

	.content-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

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
		color: #007bff;
		text-decoration: none;
		font-weight: 500;
	}

	.item-link:hover {
		text-decoration: underline;
	}

	.item-title {
		font-weight: 500;
		color: #333;
	}

	.no-items {
		color: #666;
		font-style: italic;
	}
</style>

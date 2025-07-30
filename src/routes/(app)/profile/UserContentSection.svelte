<!-- UserContentSection.svelte -->
<script>
	let { title, items, itemKey, linkPrefix, type, onDelete, formatAdditionalInfo } =
		$props();

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
						{#if formatAdditionalInfo}
							<span class="item-details">{formatAdditionalInfo(item)}</span>
						{/if}
					</div>
					<button
						class="delete-btn"
						onclick={() => handleDelete(item.id)}
						aria-label="Delete {type}">
						Delete
					</button>
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
		margin: 2em 0;
		padding: 1.5em;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	h2 {
		color: #333;
		margin-bottom: 1em;
		font-size: 1.25em;
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
		padding: 1em;
		border-bottom: 1px solid #eee;
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

	.item-details {
		display: block;
		margin-top: 0.25em;
		color: #666;
		font-size: 0.9em;
	}

	.delete-btn {
		background-color: #dc3545;
		color: white;
		border: none;
		padding: 0.5em 1em;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9em;
	}

	.delete-btn:hover {
		background-color: #c82333;
	}

	.no-items {
		color: #666;
		font-style: italic;
	}
</style>

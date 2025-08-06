<!-- UserContentList.svelte -->
<script>
	let { title, items, children } = $props();
</script>

<section class="content-section">
	<h2>{title}</h2>
	{#if items && items.length > 0}
		<ul class="content-list">
			{@render children(items)}
		</ul>
	{:else}
		<p class="no-items">No items found.</p>
	{/if}
</section>

<style>
	.content-section {
		margin-block: var(--size-9);

		h2 {
			margin-bottom: var(--size-3);
		}
	}

	.content-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.no-items {
		font-style: italic;
	}
</style>

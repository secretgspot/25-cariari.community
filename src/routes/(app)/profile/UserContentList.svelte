<script>
	import { ago } from '$lib/utils/time.js';

	let {
		title,
		items,
		type,
		itemKey,
		dateKey = 'created_at',
		linkPrefix,
		additionalInfo,
		deleteHandler,
	} = $props();

	function getCommentLink(item) {
		if (item.event_id) return `/events/${item.event_id}`;
		if (item.notice_id) return `/notices/${item.notice_id}`;
		if (item.lost_and_found_id) return `/lost-and-found/${item.lost_and_found_id}`;
		return '#'; // Fallback if no parent ID is found
	}
</script>

<div class="user-content-list">
	<h2>{title}</h2>
	{#if items && items.length > 0}
		<ul>
			{#each items as item (item.id)}
				<li class="list-item">
					<a
						href={type === 'comment' ? getCommentLink(item) : `${linkPrefix}/${item.id}`}
						class="item-content">
						<div class="main-info">
							<strong>{item[itemKey]}</strong>
							{#if additionalInfo}
								{@render additionalInfo({ item })}
							{/if}
						</div>
						<div class="date-info">
							{ago(item[dateKey])} ago
						</div>
					</a>
					{#if deleteHandler}
						<button onclick={() => deleteHandler(item.id, type)} class="delete-button"
							>Delete</button>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p>No {title.toLowerCase()} yet.</p>
	{/if}
</div>

<style>
	.user-content-list {
		margin-top: 1.5em;
		border-top: 1px solid #eee;
		padding-top: 1.5em;
	}

	h2 {
		color: #555;
		margin-bottom: 1em;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	.list-item {
		margin-bottom: 0.8em;
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 5px;
		padding: 1em;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
		display: flex; /* Use flexbox */
		justify-content: space-between; /* Space out content and button */
		align-items: center; /* Vertically align items */
	}

	.item-content {
		text-decoration: none;
		color: #333;
		display: flex; /* Use flexbox for content */
		flex-grow: 1; /* Allow content to take available space */
		justify-content: space-between;
		align-items: center;
	}

	.item-content:hover {
		color: #007bff;
	}

	.main-info {
		flex-grow: 1;
	}

	.date-info {
		font-size: 0.8em;
		color: #888;
		white-space: nowrap; /* Prevent date from wrapping */
		margin-left: 1em;
	}

	strong {
		color: #007bff;
	}

	.delete-button {
		background-color: #dc3545; /* Red color for delete */
		color: white;
		border: none;
		padding: 0.5em 1em;
		border-radius: 4px;
		cursor: pointer;
		margin-left: 1em; /* Space from content */
		flex-shrink: 0; /* Prevent button from shrinking */
	}

	.delete-button:hover {
		background-color: #c82333;
	}
</style>

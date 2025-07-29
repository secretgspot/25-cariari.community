<script>
	let { posts } = $props();
</script>

<fieldset class="lost-found-container">
	<legend
		><span>Lost & Found</span> •
		<a href="/lost-and-found" class="view-all">View all</a></legend>

	<div class="items-grid">
		{#each posts as post}
			<div class="item-card">
				<a href={`/lost-and-found/${post.id}`} class="item-link">
					{#if post.image_url}
						<img src={post.image_url} alt={post.item_name} />
					{:else}
						<div class="placeholder-image">
							<span>{post.type === 'lost' ? '🔍' : '✋'}</span>
						</div>
					{/if}
					<div class="item-info">
						<h3>{post.item_name}</h3>
						<p
							class="item-type"
							class:lost={post.type === 'lost'}
							class:found={post.type === 'found'}>
							{post.type.toUpperCase()}
						</p>
						<p class="item-date">
							{new Date(post.date_lost_found).toLocaleDateString()}
						</p>
						<p class="item-location">
							{post.location_lost_found || 'Location not specified'}
						</p>
					</div>
				</a>
			</div>
		{/each}
	</div>
</fieldset>

<style>
	.lost-found-container {
		border-radius: var(--border-size-3);
		border: none;
	}

	legend {
		span {
			font-weight: 600;
		}
	}
	.items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		/* grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); */
		gap: var(--size-3);
		margin-block: var(--size-3);
	}

	.item-card {
		border-radius: var(--border-size-3);
		overflow: hidden;
		border: var(--border-size-1) solid var(--gray-1);
		&:hover {
			box-shadow: var(--shadow-2);
		}
	}

	.item-link {
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.item-card img {
		width: 100%;
		height: 120px;
		object-fit: cover;
	}

	.placeholder-image {
		width: 100%;
		height: 120px;
		background: var(--gradient-23);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2em;
	}

	.item-info {
		padding: var(--size-3);
	}

	.item-info h3 {
		margin: 0 0 0.5em 0;
		font-size: 1em;
		line-height: 1.3;
	}

	.item-type {
		margin: 0 0 0.3em 0;
		padding: 0.2em 0.5em;
		border-radius: 12px;
		font-size: 0.7em;
		font-weight: bold;
		text-transform: uppercase;
		display: inline-block;
		&.lost {
			background-color: var(--red-1);
			color: var(--red-6);
		}

		&.found {
			background-color: var(--green-1);
			color: var(--green-6);
		}
	}

	.item-date,
	.item-location {
		margin: 0.3em 0;
		color: var(--gray-5);
		font-size: 0.8em;
	}

	.item-location {
		color: var(--gray-6);
	}

	.view-all {
		display: inline-block;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
</style>

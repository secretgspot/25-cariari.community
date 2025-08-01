<script>
	let { data } = $props();
</script>

<fieldset class="lost-found-container">
	<legend
		><span>Lost & Found</span> •
		<a href="/lost-and-found" class="view-all">View all</a></legend>

	<div class="items-grid">
		{#each data as post}
			<div class="item-card">
				<a href={`/lost-and-found/${post.id}`} class="item-link">
					{#if post.image_url}
						<img src={post.image_url} alt={post.title} />
					{:else}
						<div class="placeholder-image">
							<span>{post.category === 'Lost' ? '🔍' : '✋'}</span>
						</div>
					{/if}
					<div class="item-info">
						<h3>{post.title}</h3>
						<p
							class="item-type"
							class:lost={post.category === 'Lost'}
							class:found={post.category === 'Found'}>
							{post.category}
						</p>
						<p class="item-date">
							{new Date(post.date).toLocaleDateString()}
						</p>
						<p class="item-location">
							{post.location || 'Location not specified'}
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

		legend {
			span {
				font-weight: 600;
			}
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
			box-shadow: var(--shadow-1);
		}

		img {
			width: 100%;
			height: 120px;
			object-fit: cover;
		}

		.item-link {
			display: block;
			text-decoration: none;
			color: inherit;
		}
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

		h3 {
			margin: 0 0 var(--size-2) 0;
			font-size: 1em;
			line-height: 1.3;
		}

		.item-type {
			margin: 0 0 var(--size-1) 0;
			padding: var(--size-1) var(--size-2);
			border-radius: var(--border-size-3);
			font-size: var(--size-3);
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
			margin: var(--size-2) 0;
			color: var(--gray-5);
			font-size: small;
		}

		.item-location {
			color: var(--gray-6);
		}
	}

	.view-all {
		display: inline-block;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}
</style>

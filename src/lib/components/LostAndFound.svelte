<script>
  let { posts } = $props();
</script>

<div class="lost-found-container">
  <h2>Lost & Found</h2>
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
            <p class="item-type" class:lost={post.type === 'lost'} class:found={post.type === 'found'}>
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
  <a href="/lost-and-found" class="view-all">View all Lost & Found</a>
</div>

<style>
  .lost-found-container {
    margin: 2em 0;
    padding: 1.5em;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: #333;
    margin-bottom: 1em;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1em;
    margin-bottom: 1em;
  }

  .item-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .item-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2em;
  }

  .item-info {
    padding: 1em;
  }

  .item-info h3 {
    margin: 0 0 0.5em 0;
    color: #333;
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
  }

  .item-type.lost {
    background-color: #ffe6e6;
    color: #d32f2f;
  }

  .item-type.found {
    background-color: #e8f5e8;
    color: #2e7d32;
  }

  .item-date,
  .item-location {
    margin: 0.3em 0;
    color: #666;
    font-size: 0.8em;
  }

  .item-location {
    color: #888;
  }

  .view-all {
    display: inline-block;
    margin-top: 1em;
    color: #0056b3;
    font-weight: bold;
    text-decoration: none;
  }

  .view-all:hover {
    text-decoration: underline;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .items-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .item-card img,
    .placeholder-image {
      height: 100px;
    }
    
    .item-info {
      padding: 0.8em;
    }
    
    .item-info h3 {
      font-size: 0.9em;
    }
  }
</style>

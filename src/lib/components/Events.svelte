<script>
  import { dragable } from '$lib/utils/dragable.js';
  
  let { events } = $props();
</script>

<div class="events-container">
  <h2>Upcoming Events</h2>
  <div class="slider-container" use:dragable>
    <div class="slides">
      {#each events as event}
        <div class="slide">
          <a href={`/events/${event.slug}`} class="event-link">
            {#if event.image_url}
              <img src={event.image_url} alt={event.title} />
            {:else}
              <div class="placeholder-image">
                <span>No Image</span>
              </div>
            {/if}
            <div class="event-info">
              <h3>{event.title}</h3>
              <p class="event-date">
                {new Date(event.event_start_date).toLocaleDateString()}
                {new Date(event.event_start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </a>
        </div>
      {/each}
    </div>
  </div>
  <a href="/events" class="view-all">View all Events</a>
</div>

<style>
  .events-container {
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

  .slider-container {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #007bff #f1f1f1;
  }

  .slider-container::-webkit-scrollbar {
    height: 8px;
  }

  .slider-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .slider-container::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 4px;
  }

  .slider-container::-webkit-scrollbar-thumb:hover {
    background: #0056b3;
  }

  .slides {
    display: flex;
    gap: 1em;
    padding-bottom: 0.5em;
  }

  .slide {
    flex: 0 0 280px;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .slide:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .event-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .slide img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  .placeholder-image {
    width: 100%;
    height: 180px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
  }

  .event-info {
    padding: 1em;
  }

  .event-info h3 {
    margin: 0 0 0.5em 0;
    color: #333;
    font-size: 1.1em;
    line-height: 1.3;
  }

  .event-date {
    margin: 0;
    color: #666;
    font-size: 0.9em;
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
    .slider-container {
      margin: 0 -1.5em;
      padding: 0 1.5em;
    }
    
    .slide {
      flex: 0 0 250px;
    }
  }
</style>

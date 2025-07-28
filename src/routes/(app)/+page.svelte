<script>
  import Notices from '$lib/components/Notices.svelte';
  import Events from '$lib/components/Events.svelte';
  import LostAndFound from '$lib/components/LostAndFound.svelte';

  let { data } = $props();
</script>

<main>
  <header class="hero">
    <h1>Welcome to Cariari Community!</h1>
    <p>Stay connected with your community through events, notices, and lost & found items.</p>
  </header>

  <div class="content">
    <!-- Notices Section -->
    {#if data.notices && data.notices.length > 0}
      <Notices notices={data.notices} />
    {/if}

    <!-- Events Section -->
    {#if data.events && data.events.length > 0}
      <Events events={data.events} />
    {/if}

    <!-- Lost and Found Section -->
    {#if data.lostAndFoundPosts && data.lostAndFoundPosts.length > 0}
      <LostAndFound posts={data.lostAndFoundPosts} />
    {/if}
  </div>
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2em;
  }

  .hero {
    text-align: center;
    margin-bottom: 3em;
    padding: 2em 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
  }

  .hero h1 {
    font-size: 2.5em;
    margin-bottom: 0.5em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .hero p {
    font-size: 1.2em;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2em;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    main {
      padding: 1em;
    }
    
    .hero {
      margin-bottom: 2em;
      padding: 1.5em 1em;
    }
    
    .hero h1 {
      font-size: 2em;
    }
    
    .hero p {
      font-size: 1em;
    }
  }
</style>

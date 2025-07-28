<script>
  let { notices } = $props();
</script>

<div class="notices-container">
  <h2>Latest Notices</h2>
  <ul>
    {#each notices as notice}
      <li>
        <a href={`/notices/${notice.id}`} target="_blank">
          <strong>{notice.title}</strong>
          <span>Posted on: {new Date(notice.created_at).toLocaleDateString()}</span>
        </a>
      </li>
    {/each}
  </ul>
  <a href="/notices" class="view-all">View all Notices</a>
</div>

<style>
  .notices-container {
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

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 0.5em;
  }

  a {
    text-decoration: none;
    color: #007bff;
  }

  a.view-all {
    display: inline-block;
    margin-top: 1em;
    color: #0056b3;
    font-weight: bold;
  }
</style>

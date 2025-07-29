<script>
	import Notices from '$lib/components/Notices.svelte';
	import Events from '$lib/components/Events.svelte';
	import LostAndFound from '$lib/components/LostAndFound.svelte';
	import Services from '$lib/components/Services.svelte';

	let { data } = $props();
</script>

<header class="hero">
	<h1>Welcome to Cariari Community!</h1>
	<p>
		Stay connected with your community through events, notices, lost & found and services.
	</p>
</header>

<!-- Notices Section -->
{#if data.noticesPosts && data.noticesPosts.length > 0}
	<Notices notices={data.noticesPosts} />
{/if}

<!-- Events Section -->
{#if data.eventsPosts && data.eventsPosts.length > 0}
	<Events events={data.eventsPosts} />
{/if}

<!-- Lost and Found Section -->
{#if data.lostAndFoundPosts && data.lostAndFoundPosts.length > 0}
	<LostAndFound posts={data.lostAndFoundPosts} />
{/if}

<!-- Services Section -->
{#if data.servicesPosts && data.servicesPosts.length > 0}
	<Services posts={data.servicesPosts} />
{/if}

<style>
	.hero {
		text-align: center;
		padding-block: var(--size-3);

		h1 {
		}

		p {
			max-width: 30ch;
			margin: 0 auto;
		}
	}
</style>

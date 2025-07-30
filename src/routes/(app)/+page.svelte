<script>
	import Notices from '$lib/components/Notices.svelte';
	import Events from '$lib/components/Events.svelte';
	import LostAndFound from '$lib/components/LostAndFound.svelte';
	import Services from '$lib/components/Services.svelte';

	let { data } = $props();

	console.log('(app)/+page.svelte data: ', data);
</script>

<header class="hero">
	<h1>Welcome to Cariari Community!</h1>
	<p>
		Stay connected with your community through events, notices, lost & found and services.
	</p>
</header>

<!-- Notices Section -->
{#if data.noticesPosts && data.noticesPosts.length > 0}
	<Notices data={data.noticesPosts} />
{/if}

<!-- Events Section -->
{#if data.eventsPosts && data.eventsPosts.length > 0}
	<Events data={data.eventsPosts} />
{/if}

<!-- Lost and Found Section -->
{#if data.lostAndFoundPosts && data.lostAndFoundPosts.length > 0}
	<LostAndFound data={data.lostAndFoundPosts} />
{/if}

<!-- Services Section -->
{#if data.servicesPosts && data.servicesPosts.length > 0}
	<Services data={data.servicesPosts} />
{/if}

<style>
	.hero {
		text-align: center;
		padding-block: var(--size-3);

		/* h1 {
		} */

		p {
			max-width: 30ch;
			margin: 0 auto;
		}
	}
</style>

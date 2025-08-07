<script>
	import Notices from '$lib/components/Notices.svelte';
	import Events from '$lib/components/Events.svelte';
	import LostAndFound from '$lib/components/LostAndFound.svelte';
	import Services from '$lib/components/Services.svelte';
	import Map from '$lib/components/Map.svelte';

	let { data } = $props();

	// console.log('(app)/+page.svelte data: ', data);
</script>

<header class="hero">
	<h1>Welcome to Cariari Community!</h1>
	<p>
		Stay connected with your community through events, notices, lost & found and services.
	</p>
</header>

<Map />

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

		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
		}

		/* Tablets and small laptops (769px - 1024px) */
		@media (min-width: 769px) {
		}

		/* Large desktops and high-resolution screens (1025px and up) */
		@media (min-width: 1025px) {
			margin-block: var(--size-10) var(--size-6);
		}

		/* Extra-large screens (1440px and up) */
		@media (min-width: 1440px) {
		}

		p {
			max-width: 30ch;
			margin: 0 auto;
			/* Tablets and small laptops (769px - 1024px) */
			@media (min-width: 769px) {
				max-width: 40ch;
			}
			/* Large desktops and high-resolution screens (1025px and up) */
			@media (min-width: 1025px) {
			}
		}
	}
</style>

<script>
	import { navigating } from '$app/state';
	import { invalidate } from '$app/navigation';
	import Nav from '$lib/Nav.svelte';
	import 'open-props/style';

	let { children, data } = $props();

	let authSubscription = null;

	$effect(() => {
		if (data.supabase && !authSubscription) {
			const {
				data: { subscription },
			} = data.supabase.auth.onAuthStateChange((event, session) => {
				if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
					invalidate('supabase:auth');
				}
			});
			authSubscription = subscription;

			// Cleanup function for $effect
			return () => {
				if (authSubscription) {
					authSubscription.unsubscribe();
					authSubscription = null;
				}
			};
		}
	});
</script>

<Nav {data} />

<main>
	<!-- TODO: check why !navigating.complete and not navigating.complete -->
	{#if !navigating.complete}
		{@render children?.()}
	{:else}
		<p>Loading...</p>
	{/if}
</main>

<style>
	main {
		display: grid;
		margin-block: var(--size-8);
		gap: var(--size-8);
		margin-inline: var(--size-3);
	}
</style>

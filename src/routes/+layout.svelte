<script>
	import { navigating } from '$app/state';
	import { invalidate } from '$app/navigation';
	import Nav from '$lib/Nav.svelte';
	import 'open-props/style';

	let { children, data } = $props();

	// Set up auth state listener with proper cleanup
	$effect(() => {
		// Guard clause - exit early if supabase isn't available
		if (!data.supabase) return;

		const {
			data: { subscription },
		} = data.supabase.auth.onAuthStateChange((event, session) => {
			// Only invalidate on auth state changes that matter for the app
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				invalidate('supabase:auth');
			}
		});

		// Return cleanup function
		return () => {
			subscription?.unsubscribe();
		};
	});
</script>

<Nav {data} />

<main>
	{#if navigating.complete}
		<div class="loading-indicator" aria-live="polite">
			<p>Loading...</p>
		</div>
	{:else}
		{@render children?.()}
	{/if}
</main>

<style>
	main {
		display: grid;
		margin-block: var(--size-8);
		gap: var(--size-8);
		margin-inline: var(--size-3);
	}

	.loading-indicator {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
	}
</style>

<script>
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Nav from '$lib/Nav.svelte';
	import 'open-props/style';

	let { children, data } = $props();

	onMount(() => {
		// console.log('layout.svelte: onMount fired.');
		const {
			data: { subscription },
		} = data.supabase.auth.onAuthStateChange((event, session) => {
			// console.log('layout.svelte: Auth state changed:', event, session);
			// Only invalidate; the load function will provide the updated data.
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				// Invalidate on both sign in and sign out
				// console.log('layout.svelte: Invalidating supabase:auth due to state change.');
				invalidate('supabase:auth');
			}
		});

		return () => {
			// console.log('layout.svelte: Unsubscribing from auth state changes.');
			subscription.unsubscribe();
		};
	});
</script>

<Nav {data} />

<main>
	{@render children?.()}
</main>

<style>
	main {
		display: grid;
		margin-block: var(--size-8);
		gap: var(--size-8);
		margin-inline: var(--size-3);
	}
</style>

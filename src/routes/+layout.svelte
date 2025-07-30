<script>
	import { navigating, page } from '$app/state';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Nav from '$lib/Nav.svelte';
	import 'open-props/style';

	let { children, data } = $props();

	// console.log('🍖 page:', data);

	let { is_logged_in, is_admin, supabase } = $state(data);
	let loading = $state(true); // Add a local loading state

	onMount(async () => {
		const {
			data: { user },
			error,
		} = await data.supabase.auth.getUser();
		if (!error && user) {
			is_logged_in = true;
			is_admin = user?.app_metadata?.claims_admin || false;
		}
		loading = false;

		const {
			data: { subscription },
		} = data.supabase.auth.onAuthStateChange(async (event) => {
			if (event === 'SIGNED_IN') {
				const {
					data: { user },
					error,
				} = await data.supabase.auth.getUser();
				if (!error && user) {
					is_logged_in = true;
					is_admin = user?.app_metadata?.claims_admin || false;
				}
			} else if (event === 'SIGNED_OUT') {
				is_logged_in = false;
				is_admin = false;
			}
			invalidate('supabase:auth');
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<Nav {data} />

<main>
	{#if navigating.complete || loading}
		<p>Loading...</p>
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
</style>

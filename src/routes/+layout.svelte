<script>
	import { navigating } from '$app/state';
	import { onNavigate, invalidate } from '$app/navigation';
	import Nav from '$lib/Nav.svelte';
	import Footer from '$lib/Footer.svelte';
	import FixedLine from '$lib/loaders/FixedLine.svelte';
	import Splash from '$lib/loaders/Splash.svelte';
	import { Toasts } from '$lib/toasts';
	import 'open-props/style';
	import { playChimeSequence, chimePatterns } from '$lib/utils/audio.js';
	import { vibrate, vibratePatterns } from '$lib/utils/vibrate.js';
	import { settings } from '$lib/settings/settings.js';

	let { children, data } = $props();

	// Get current settings reactively
	let currentSettings = $state($settings);

	// Update when settings change
	$effect(() => {
		currentSettings = $settings;
	});

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

	onNavigate((navigation) => {
		// Play navigation sound if enabled
		if (currentSettings.navigation_sound) {
			const pattern = currentSettings.navigation_sound_pattern || 'swipe';
			playChimeSequence(chimePatterns[pattern]);
		}

		// Trigger navigation vibration if enabled
		if (currentSettings.navigation_buzz) {
			const pattern = currentSettings.navigation_vibration_pattern || 'tick';
			vibrate(vibratePatterns[pattern]);
		}
	});
</script>

<Toasts />

{#if navigating.complete}
	<FixedLine kind="spiral" size="1" />
	<Splash />
{:else}
	<Nav {data} />
	<main>
		{@render children?.()}
		<Footer />
	</main>
{/if}

<style>
	main {
		display: grid;
		margin-block-start: var(--size-8);
		gap: var(--size-8);
		margin-inline: var(--size-3);

		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
		}

		/* Tablets and small laptops (769px - 1024px) */
		@media (min-width: 769px) {
		}

		/* Large desktops and high-resolution screens (1025px and up) */
		@media (min-width: 1025px) {
			background: white;
			padding: var(--size-3);
			border-radius: var(--border-size-3);
		}

		/* Extra-large screens (1440px and up) */
		@media (min-width: 1440px) {
		}
	}
</style>

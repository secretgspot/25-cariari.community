<script>
	import { LinkButton } from './buttons';
	import Logo from './Logo.svelte';
	import Ads from '$lib/components/Ads.svelte';
</script>

<Ads />

<footer class="site-footer">
	<!-- Footer info -->
	<div class="info-wrapper">
		©{new Date().getFullYear()} •
		<LinkButton href="/about" title="About CC">About</LinkButton>
		• <LinkButton href="/about#privacy" title="Privacy Policy">Privacy</LinkButton>
		• <LinkButton href="/about#terms" title="Terms of Service">Terms</LinkButton>
	</div>

	<!-- Brand/Logo Section -->
	<LinkButton href="/" underline={false} class="logo-link">
		<Logo size="30px" title="Cariari Community" />
	</LinkButton>
</footer>

<style>
	footer.site-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding: var(--size-3);

		.info-wrapper {
			font-size: small;
			color: var(--text-2);
		}

		:global(.logo-link) {
			color: var(--text-1);
		}
	}

	:global(.advertising) {
		place-self: center;
	}
</style>

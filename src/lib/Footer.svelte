<script>
	import { LinkButton } from './buttons';
	import Logo from './Logo.svelte';
	import Ad from '$lib/Ad.svelte';

	const ads = [
		{
			file: 'cariari.agency-300x100.webp',
			title: 'Cariari Agency - Real Estate Listings',
			href: 'https://cariari.agency',
			width: 320,
			height: 100,
		},
		{
			file: 'pintar.cariari-300x100.webp',
			title: 'Pintar Cariari - Professional Painting Services',
			href: 'https://25-cariaripintor.vercel.app',
			width: 320,
			height: 100,
		},
	];

	const randomAd = ads[Math.floor(Math.random() * ads.length)];
</script>

<Ad width={randomAd.width} height={randomAd.height}>
	<a href={randomAd.href} target="_blank" rel="noreferrer" title={randomAd.title}>
		<img src={`/ads/${randomAd.file}`} alt={randomAd.title} loading="lazy" />
	</a>
</Ad>

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

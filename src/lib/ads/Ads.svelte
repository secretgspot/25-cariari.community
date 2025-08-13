<script>
	import { onMount } from 'svelte';
	import Ad from './Ad.svelte';

	/**
	 * @typedef {Object} AdConfig
	 * @property {string} file - Image filename
	 * @property {string} title - Ad title/alt text
	 * @property {string} href - Click destination URL
	 * @property {number} width - Ad width in pixels
	 * @property {number} height - Ad height in pixels
	 * @property {number} [weight] - Weight for random selection (higher = more likely)
	 * @property {boolean} [active] - Whether the ad is currently active
	 */

	/** @type {AdConfig[]} */
	let ads = $state([]);
	/** @type {AdConfig | null} */
	let selectedAd = $state(null);
	let impressionLogged = $state(false);

	/**
	 * Filters ads based on current date and other criteria
	 * @param {AdConfig[]} adList
	 * @returns {AdConfig[]}
	 */
	function getActiveAds(adList) {
		return adList.filter((ad) => ad.active !== false);
	}

	/**
	 * Selects a random ad based on weights
	 * @param {AdConfig[]} adList
	 * @returns {AdConfig | null}
	 */
	function selectWeightedRandomAd(adList) {
		if (adList.length === 0) return null;

		const totalWeight = adList.reduce((sum, ad) => sum + (ad.weight || 1), 0);
		let random = Math.random() * totalWeight;

		for (const ad of adList) {
			random -= ad.weight || 1;
			if (random <= 0) return ad;
		}

		return adList[0]; // Fallback
	}

	/**
	 * Logs ad impression for analytics
	 * @param {AdConfig} ad
	 */
	async function logImpression(ad) {
		if (impressionLogged) return;
		impressionLogged = true;

		try {
			const response = await fetch(`/api/ads/${ad.id}/impression`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				console.error(
					'Failed to log ad impression:',
					response.status,
					response.statusText,
				);
			}
		} catch (error) {
			console.error('Error logging ad impression:', error);
		}
	}

	/**
	 * Logs ad click for analytics
	 * @param {AdConfig} ad
	 * @param {MouseEvent} event
	 */
	async function logClick(ad, event) {
		try {
			const response = await fetch(`/api/ads/${ad.id}/click`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				console.error('Failed to log ad click:', response.status, response.statusText);
			}
		} catch (error) {
			console.error('Error logging ad click:', error);
		}
	}

	onMount(async () => {
		const response = await fetch('/api/ads');
		if (response.ok) {
			const allAds = await response.json();
			const activeAds = getActiveAds(allAds);
			selectedAd = selectWeightedRandomAd(activeAds);

			if (selectedAd) {
				// Log impression after a short delay to ensure visibility
				setTimeout(() => logImpression(selectedAd), 1000);
			}
		}
	});

	// Use $effect instead of $: for reactive logging
	$effect(() => {
		if (selectedAd && !impressionLogged) {
			logImpression(selectedAd);
		}
	});
</script>

{#if selectedAd}
	<Ad
		width={selectedAd.width}
		height={selectedAd.height}
		aria-label={selectedAd.title}>
		<a
			href={selectedAd.href}
			target="_blank"
			rel="noopener noreferrer"
			title={selectedAd.title}
			aria-label={selectedAd.title}
			onclick={(event) => logClick(selectedAd, event)}>
			<img
				src={selectedAd.file}
				alt={selectedAd.title}
				width={selectedAd.width}
				height={selectedAd.height}
				loading="lazy"
				decoding="async" />
		</a>
	</Ad>
{:else}
	<!-- Fallback placeholder -->
	<Ad width={320} height={100} aria-label="Advertisement placeholder" />
{/if}

<style>
	/* Add any additional styling if needed */
</style>

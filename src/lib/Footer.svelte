<script>
	import { page } from '$app/state';
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';

	let { data } = $props();
	// console.log('Nav data: ', data);
	// console.log('Nav page data: ', page.data); // DO NOT NEED PAGEDATA in NAV, IT BRINGS TOO MUCH DATA SUCH AS noticesPosts, servicesPosts and everything else that's available in data
</script>

<footer class="site-footer">
	<!-- Footer info -->
	<div class="info-wrapper">
		©{new Date().getFullYear()} Cariari Community
	</div>

	<!-- Brand/Logo Section -->
	<a href="/">
		<Logo size="30px" title="Cariari Community" />
	</a>
</footer>

<style>
	footer.site-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding: var(--size-3);

		.info-wrapper {
			font-size: small;
			color: var(--color-text-secondary);
		}
	}
</style>

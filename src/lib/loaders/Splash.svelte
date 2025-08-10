<script>
	import { fly, fade } from 'svelte/transition';
	import LogoSvg from '$lib/LogoSvg.svelte';
</script>

<div transition:fade class="splash">
	<div class="backdrop"></div>

	<LogoSvg animate={true} invert={true} ring={false} kind="gold" size="69" time={3} />
</div>

<style>
	.splash {
		z-index: 9;
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.backdrop {
		z-index: 8;
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		backdrop-filter: blur(30px);
		background: var(--surface-1);
	}
</style>

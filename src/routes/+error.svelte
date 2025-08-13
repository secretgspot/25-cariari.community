<script>
	import { page } from '$app/stores';
	import Icon from '$lib/Icon.svelte';
</script>

<div class="error-wrapper">
	<h1>{$page.status}: {$page.error.message}</h1>

	<Icon kind="404" size="300" />
</div>

<style>
	.error-wrapper {
		display: grid;
		justify-items: center;
		align-content: center;

		& * {
			grid-area: 1/1;
		}

		h1 {
			align-content: center;
			z-index: 1;
		}

		:global(svg) {
			max-width: 300px;
			color: var(--surface-3);
			grid-area: 1/1;
		}
	}
</style>

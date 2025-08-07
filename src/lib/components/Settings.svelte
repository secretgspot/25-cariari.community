<!-- src/lib/components/Settings.svelte -->
<script>
	import {
		button_sounds,
		button_buzz,
		navigation_sound,
		navigation_buzz,
	} from '$lib/stores/settings';
	import Divider from '$lib/Divider.svelte';
</script>

<aside class="site-settings">
	<Divider>Site Settings</Divider>

	<div class="form-items-wrap">
		<div class="form-group">
			<input type="checkbox" id="button_sounds" bind:checked={$button_sounds} />
			<label for="button_sounds">Button sound</label>
		</div>
		<div class="form-group">
			<input type="checkbox" id="button_buzz" bind:checked={$button_buzz} />
			<label for="button_buzz">Button haptic</label>
		</div>
		<div class="form-group">
			<input type="checkbox" id="navigation_sound" bind:checked={$navigation_sound} />
			<label for="navigation_sound">Navigation sound</label>
		</div>
		<div class="form-group">
			<input type="checkbox" id="navigation_buzz" bind:checked={$navigation_buzz} />
			<label for="navigation_buzz">Navigation haptic</label>
		</div>
	</div>
</aside>

<style>
	.site-settings {
		:global(.text-divider) {
			margin-block: 0 var(--size-6);
		}

		.form-items-wrap {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: var(--size-1);
		}
	}
</style>

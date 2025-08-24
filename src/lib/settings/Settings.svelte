<!-- Settings.svelte -->
<script>
	import { settings } from './settings.js';
	import Divider from '$lib/Divider.svelte';
	import Toggle from '$lib/buttons/Toggle.svelte';
</script>

<div class="site-settings">
	<Divider>Site Settings</Divider>
	<div class="site-buttons-group">
		<Toggle bind:checked={$settings.dark_theme} label="Dark Theme" />
		<div class="group">
			<Toggle bind:checked={$settings.button_sounds} label="Button sounds" />
			<Toggle bind:checked={$settings.button_buzz} label="Button buzz" />
		</div>

		<div class="group">
			<Toggle bind:checked={$settings.navigation_sound} label="Navigation sounds" />
			<Toggle bind:checked={$settings.navigation_buzz} label="Navigation buzz" />
		</div>

		<div class="group">
			<Toggle
				bind:checked={$settings.notification_sound}
				label="Notification sounds" />
			<Toggle
				bind:checked={$settings.notification_buzz}
				label="Notification buzz" />
		</div>
	</div>
</div>

<style>
	.site-settings {
		:global(.text-divider) {
			margin-block: 0 var(--size-6);
			z-index: 1;
		}
		.site-buttons-group {
			font-size: small;
			display: grid;
			gap: var(--size-3);
			grid-template-columns: 1fr 1fr;
			margin: var(--size-1);
			/* Small tablets and larger mobile devices (481px - 768px) */
			@media (min-width: 481px) {
				grid-template-columns: 1fr 1fr 1fr;
			}
			.group {
				display: grid;
				gap: var(--size-2);
			}
		}
	}
</style>
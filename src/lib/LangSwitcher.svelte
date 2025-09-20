<script>
	import { settings } from '$lib/settings/settings.js';
</script>

<select name="lang-selector" class="gen-select lang" bind:value={$settings.locale}>
	<option value="en">English</option>
	<option value="es">Español</option>
</select>

<style>
	.lang {
		border-right: none;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		padding-inline-end: var(--size-3);
		margin-inline-end: var(--size-000);
		outline: none;
		font-size: small;
	}
</style>

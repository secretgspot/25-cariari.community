<script>
	import { enhance } from '$app/forms';
	import { Button, LinkButton } from '$lib/buttons';
	import Icon from '$lib/Icon.svelte';

	let { form } = $props();

	let loading = $state(false);
</script>

<div class="login-form-container">
	<h1>Register</h1>
	<form method="POST" action="?/register" use:enhance>
		<div class="form-group">
			<label for="email" class="form-label">Email <span class="required">*</span></label>
			<input
				type="email"
				class="form-input"
				id="email"
				name="email"
				value={form?.values?.email ?? ''}
				required />
		</div>

		<div class="form-group">
			<label for="password" class="form-label"
				>Password <span class="required">*</span></label>
			<input type="password" class="form-input" id="password" name="password" required />
		</div>

		<div class="form-group">
			<label for="passwordConfirm" class="form-label"
				>Confirm Password <span class="required">*</span></label>
			<input
				type="password"
				class="form-input"
				id="passwordConfirm"
				name="passwordConfirm"
				required />
		</div>

		<Button type="submit" {loading} disabled={loading}>
			{#snippet icon()}
				<Icon kind="user" size="21" />
			{/snippet}
			{loading ? 'Registering...' : 'Register'}
		</Button>

		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}
	</form>
	<p>
		Already have an account? <LinkButton href="/login" sound_pattern="basic"
			>Login</LinkButton>
	</p>
</div>

<style>
	.login-form-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--size-6);
		margin-block: var(--size-6);
	}

	form {
		display: flex;
		flex-direction: column;
		width: 300px;
		gap: var(--size-5);
	}

	.form-group {
		margin-bottom: 0;
	}

	.error {
		border: var(--border-size-1) solid var(--red-6);
		padding: var(--size-3);
		border-radius: var(--radius-2);
	}
</style>

<script>
	import { enhance } from '$app/forms';
	import Button from '$lib/buttons/Button.svelte';

	let { form } = $props();

	let loading = $state(false);
</script>

<div class="login-form-container">
	<h1>Login</h1>
	<form method="POST" action="?/login" use:enhance>
		<label for="email">Email</label>
		<input
			type="email"
			id="email"
			name="email"
			value={form?.values?.email ?? ''}
			required />

		<label for="password">Password</label>
		<input type="password" id="password" name="password" required />

		<Button type="submit" {loading} disabled={loading}>
			{#snippet icon()}
				👤
			{/snippet}
			{loading ? 'Login in...' : 'Login'}
		</Button>

		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}
	</form>
</div>

<style>
	.login-form-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	h1 {
		margin-bottom: 1rem;
	}

	form {
		display: flex;
		flex-direction: column;
		width: 300px;
	}

	label {
		margin-top: 0.5rem;
	}

	input {
		padding: 0.5rem;
		margin-bottom: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.error {
		color: red;
		margin-bottom: 1rem;
	}

	button {
		padding: 0.75rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}
</style>

<!-- ProfileForm.svelte -->
<script>
	import { enhance, applyAction } from '$app/forms';
	import Button from '$lib/buttons/Button.svelte';

	let { userProfile, onMessage } = $props();

	let loading = $state(false);

	// Rune-based Reactive State for form fields
	let profileFormData = $state({
		username: userProfile?.username || '',
		full_name: userProfile?.full_name || '',
		avatar_url: userProfile?.avatar_url || '',
		bio: userProfile?.bio || '',
	});

	// Update form data when userProfile changes
	$effect(() => {
		if (userProfile) {
			profileFormData = {
				username: userProfile.username || '',
				full_name: userProfile.full_name || '',
				avatar_url: userProfile.avatar_url || '',
				bio: userProfile.bio || '',
			};
		}
	});

	const submitForm = () => {
		return async ({ result, update }) => {
			loading = true;
			const message = result.data?.message || 'An error occurred';

			if (result.type === 'success') {
				loading = false;
				onMessage({ message, success: true });
				await applyAction(result);
				await update({ reset: false });
			} else if (result.type === 'error' || result.type === 'failure') {
				loading = false;
				onMessage({ message, success: false });
				await applyAction(result);
				await update({ reset: false });
			}
		};
	};
</script>

<form
	method="POST"
	action="?/updateProfile"
	use:enhance={submitForm}
	class="profile-form">
	<label for="username">Username</label>
	<input
		type="text"
		id="username"
		name="username"
		bind:value={profileFormData.username}
		required />

	<label for="full_name">Full Name</label>
	<input
		type="text"
		id="full_name"
		name="full_name"
		bind:value={profileFormData.full_name} />

	<label for="avatar_url">Avatar URL</label>
	<input
		type="url"
		id="avatar_url"
		name="avatar_url"
		bind:value={profileFormData.avatar_url} />

	<label for="bio">Bio:</label>
	<textarea id="bio" name="bio" bind:value={profileFormData.bio}></textarea>

	<Button type="submit" {loading} disabled={loading}>
		{#snippet icon()}
			📌
		{/snippet}
		{loading ? 'Saving...' : 'Save Changes'}
	</Button>
</form>

<style>
	.profile-form {
		margin-block: var(--size-6);

		label {
			display: block;
			margin-bottom: 0.5em;
			font-weight: bold;
		}
		input[type='text'],
		input[type='url'],
		textarea {
			width: 100%;
			padding: 0.8em;
			margin-bottom: 1em;
			border: 1px solid #ccc;
			border-radius: 4px;
			box-sizing: border-box;
		}
		textarea {
			min-height: 100px;
			resize: vertical;
		}
	}
</style>

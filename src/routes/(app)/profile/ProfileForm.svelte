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
	enctype="multipart/form-data"
	class="profile-form">
	<div class="form-group">
		<label for="username" class="form-label">Username</label>
		<input
			type="text"
			id="username"
			name="username"
			bind:value={profileFormData.username}
			required
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="full_name" class="form-label">Full Name</label>
		<input
			type="text"
			id="full_name"
			name="full_name"
			bind:value={profileFormData.full_name}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="avatar_url" class="form-label">Avatar</label>
		<input
			type="file"
			id="avatar_url"
			name="avatar_url"
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="bio" class="form-label">Bio:</label>
		<textarea id="bio" name="bio" bind:value={profileFormData.bio} class="form-textarea"
		></textarea>
	</div>

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
	}
</style>

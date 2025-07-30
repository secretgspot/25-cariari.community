<!-- ProfileForm.svelte -->
<script>
	import { enhance, applyAction } from '$app/forms';

	let { userProfile, onMessage } = $props();

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
			const message = result.data?.message || 'An error occurred';

			if (result.type === 'success') {
				onMessage(message);
				await applyAction(result);
				await update({ reset: false });
			} else if (result.type === 'error' || result.type === 'failure') {
				onMessage(message);
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
	<label for="username">Username:</label>
	<input
		type="text"
		id="username"
		name="username"
		bind:value={profileFormData.username}
		required />

	<label for="full_name">Full Name:</label>
	<input
		type="text"
		id="full_name"
		name="full_name"
		bind:value={profileFormData.full_name} />

	<label for="avatar_url">Avatar URL:</label>
	<input
		type="url"
		id="avatar_url"
		name="avatar_url"
		bind:value={profileFormData.avatar_url} />

	<label for="bio">Bio:</label>
	<textarea id="bio" name="bio" bind:value={profileFormData.bio}></textarea>

	<button type="submit">Save Changes</button>
</form>

<style>
	.profile-form label {
		display: block;
		margin-bottom: 0.5em;
		font-weight: bold;
	}

	.profile-form input[type='text'],
	.profile-form input[type='url'],
	.profile-form textarea {
		width: 100%;
		padding: 0.8em;
		margin-bottom: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
	}

	.profile-form textarea {
		min-height: 100px;
		resize: vertical;
	}

	.profile-form button[type='submit'] {
		background-color: #28a745;
		color: white;
		padding: 0.8em 1.5em;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.profile-form button[type='submit']:hover {
		background-color: #218838;
	}
</style>

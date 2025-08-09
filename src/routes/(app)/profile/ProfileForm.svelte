<!-- ProfileForm.svelte -->
<script>
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/buttons/Button.svelte';
	import { compressFile } from '$lib/utils/file.js';
	import Divider from '$lib/Divider.svelte';

	let { userProfile, onMessage } = $props();

	let loading = $state(false);
	let compressedFile = $state(null);
	let previewUrl = $state(null); // Only for new file preview
	let fileInput = $state();

	// Form state
	let formData = $state({
		username: '',
		full_name: '',
		bio: '',
	});

	// Update form data when userProfile changes
	$effect(() => {
		if (userProfile) {
			Object.assign(formData, {
				username: userProfile.username || '',
				full_name: userProfile.full_name || '',
				bio: userProfile.bio || '',
			});
		}
	});

	async function handleFileChange(event) {
		const file = event.target.files[0];
		if (!file) {
			resetFileState();
			return;
		}

		try {
			const { file: compressed, previewUrl: url } = await compressFile(file);
			compressedFile = compressed;
			previewUrl = url;
		} catch (err) {
			console.error('Compression error:', err);
			onMessage({ message: 'Image compression failed.', success: false });
			resetFileState();
		}
	}

	function resetFileState() {
		compressedFile = null;
		previewUrl = null;
		if (fileInput) fileInput.value = '';
	}

	async function handleSubmit(event) {
		event.preventDefault();
		loading = true;

		const submitFormData = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			submitFormData.append(key, value);
		});

		if (compressedFile) {
			submitFormData.append('avatar_url', compressedFile);
		}

		const response = await fetch('/profile?/updateProfile', {
			method: 'POST',
			body: submitFormData,
		}).catch((error) => {
			console.error('Submit error:', error);
			onMessage({ message: 'Failed to update profile', success: false });
			loading = false;
			return null;
		});

		if (!response) return;

		const result = await response.json().catch((error) => {
			console.error('JSON parse error:', error);
			onMessage({ message: 'Invalid server response', success: false });
			loading = false;
			return null;
		});

		if (!result) return;

		if (result.type === 'success') {
			resetFileState();
			await invalidateAll();
			onMessage({
				message: result.data?.message || 'Profile updated successfully!',
				success: true,
			});
		} else {
			onMessage({ message: result.data?.message || 'Update failed', success: false });
		}

		loading = false;
	}
</script>

<form class="user-form" onsubmit={handleSubmit}>
	<Divider>Profile</Divider>

	<div class="form-group">
		<label for="username" class="form-label">Username</label>
		<input
			type="text"
			id="username"
			name="username"
			bind:value={formData.username}
			required
			disabled={loading}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="full_name" class="form-label">Full Name</label>
		<input
			type="text"
			id="full_name"
			name="full_name"
			bind:value={formData.full_name}
			disabled={loading}
			class="form-input" />
	</div>

	<div class="form-group">
		<label for="avatar_url" class="form-label">Avatar</label>
		{#if previewUrl}
			<img src={previewUrl} alt="Avatar preview" class="avatar-preview" />
		{/if}
		<input
			type="file"
			id="avatar_url"
			name="avatar_url"
			class="form-input"
			accept="image/*"
			disabled={loading}
			bind:this={fileInput}
			onchange={handleFileChange} />
	</div>

	<div class="form-group">
		<label for="bio" class="form-label">Bio</label>
		<textarea
			id="bio"
			name="bio"
			bind:value={formData.bio}
			disabled={loading}
			class="form-textarea"></textarea>
	</div>

	<Button type="submit" right outline {loading} disabled={loading}>
		{#snippet icon()}
			<svg
				width="21"
				height="21"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 719 724">
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-width="50"
					d="M331.645 553 117 338.355" /><path
					fill="var(--red-6)"
					d="M546.396 72.066c11.785-20.413 17.678-30.619 27.68-33.3 10.003-2.68 20.209 3.213 40.621 14.998L633.7 64.736c20.412 11.785 30.619 17.677 33.299 27.68 2.68 10.002-3.213 20.208-14.998 40.621l-214.64 371.767c-2.415 4.183-3.623 6.275-5.197 8.088-1.573 1.812-3.475 3.301-7.279 6.279l-23.12 18.104c-41.442 32.45-62.162 48.674-76.783 40.233-14.62-8.441-10.93-34.498-3.548-86.612l4.118-29.075c.677-4.783 1.016-7.175 1.798-9.444.783-2.269 1.991-4.361 4.406-8.544l214.64-371.767Z" /></svg>
		{/snippet}
		{loading ? 'Saving...' : 'Save Changes'}
	</Button>
</form>

<style>
	.user-form {
		:global(.text-divider) {
			margin-block: 0 var(--size-6);
		}
	}
	.avatar-preview {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		object-fit: cover;
		margin-bottom: 1rem;
	}

	.form-input:disabled,
	.form-textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>

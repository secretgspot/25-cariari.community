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

	<Button type="submit" right {loading} disabled={loading}>
		{#snippet icon()}
			<svg
				width="21"
				height="21"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 719 724"
				><path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-width="50"
					d="M691 358c0-156.978 0-235.467-48.768-284.233C593.468 25 514.976 25 358 25c-156.978 0-235.467 0-284.233 48.767C25 122.533 25 201.022 25 358c0 156.976 0 235.468 48.767 284.232C122.533 691 201.022 691 358 691h156M283 353h172M372 444V272" /><path
					fill="var(--red-6)"
					d="m556.79 623.045 55.327-206.482c.761-2.839 1.666-6.354 2.945-9.213 1.447-3.237 4.15-7.526 9.942-10.228l.272-.124c5.704-2.569 11.483-2.292 15.568-1.677 3.667.552 7.836 1.7 11.219 2.607l16.794 4.5 16.795 4.5c3.382.906 7.566 1.996 11.018 3.352 3.845 1.51 8.989 4.159 12.644 9.236l.173.244.17.245c3.501 5.149 3.686 10.112 3.327 13.583-.322 3.116-1.296 6.613-2.057 9.452l-55.326 206.482c-.22.82-.737 3.021-1.849 5.113-1.112 2.091-2.684 3.818-3.253 4.481l-26.173 30.501c-4.68 5.453-9.21 10.793-13.384 14.366-3.634 3.109-12.048 9.36-24.245 6.224l-.289-.076c-12.353-3.31-16.568-13.046-18.172-17.591-1.829-5.182-3.082-12.071-4.408-19.134l-7.417-39.501c-.161-.859-.659-3.139-.576-5.507.072-2.071.581-3.988.855-4.984l.1-.369Zm128.862-216.117-16.795-4.5-16.794-4.5 33.589 9Z" /></svg>
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

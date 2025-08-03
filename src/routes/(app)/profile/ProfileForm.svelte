<!-- ProfileForm.svelte -->
<script>
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/buttons/Button.svelte';
	import Compressor from 'compressorjs';

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

	function compressFile(file) {
		return new Promise((resolve, reject) => {
			new Compressor(file, {
				quality: 0.7,
				maxWidth: 222,
				maxHeight: 222,
				mimeType: 'image/jpeg',
				convertSize: 100000,
				success(result) {
					previewUrl = URL.createObjectURL(result);
					const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
					const compressedFileObj = new File([result], fileName, { type: 'image/jpeg' });
					resolve(compressedFileObj);
				},
				error: reject,
			});
		});
	}

	async function handleFileChange(event) {
		const file = event.target.files[0];
		if (!file) {
			resetFileState();
			return;
		}

		compressedFile = await compressFile(file).catch((error) => {
			console.error('Compression error:', error);
			onMessage({ message: 'Image compression failed.', success: false });
			resetFileState();
			return null;
		});
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

<form onsubmit={handleSubmit}>
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

	<Button type="submit" {loading} disabled={loading}>
		{#snippet icon()}
			📌
		{/snippet}
		{loading ? 'Saving...' : 'Save Changes'}
	</Button>
</form>

<style>
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

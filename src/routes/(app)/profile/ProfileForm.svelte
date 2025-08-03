<!-- ProfileForm.svelte -->
<script>
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/buttons/Button.svelte';
	import Compressor from 'compressorjs';

	let { userProfile, onMessage } = $props();

	let loading = $state(false);
	let compressedFile = $state(null);
	let previewUrl = $state(userProfile?.avatar_url || null);
	let fileInput = $state();

	// Form state
	let formData = $state({
		username: userProfile?.username || '',
		full_name: userProfile?.full_name || '',
		bio: userProfile?.bio || '',
	});

	// Update form data when userProfile changes
	$effect(() => {
		if (userProfile) {
			if (formData.username !== (userProfile.username || ''))
				formData.username = userProfile.username || '';
			if (formData.full_name !== (userProfile.full_name || ''))
				formData.full_name = userProfile.full_name || '';
			if (formData.bio !== (userProfile.bio || '')) formData.bio = userProfile.bio || '';
			if (!previewUrl && userProfile.avatar_url) previewUrl = userProfile.avatar_url;
		}
	});

	async function handleFileChange(event) {
		const file = event.target.files[0];
		if (!file) {
			compressedFile = null;
			previewUrl = userProfile?.avatar_url || null;
			return;
		}

		console.log('🔵 Original file:', {
			name: file.name,
			type: file.type,
			size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
		});

		try {
			compressedFile = await new Promise((resolve, reject) => {
				new Compressor(file, {
					quality: 0.7,
					maxWidth: 1024,
					maxHeight: 1024,
					mimeType: 'image/jpeg',
					convertSize: 100000,
					success(result) {
						previewUrl = URL.createObjectURL(result);
						const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
						const compressedFileObj = new File([result], fileName, {
							type: 'image/jpeg',
						});

						console.log('🟢 Compressed file created:', {
							name: compressedFileObj.name,
							type: compressedFileObj.type,
							size: `${(compressedFileObj.size / 1024 / 1024).toFixed(2)}MB`,
						});

						resolve(compressedFileObj);
					},
					error: reject,
				});
			});
		} catch (error) {
			console.error('Compression error:', error);
			onMessage({ message: 'Image compression failed.', success: false });
			compressedFile = null;
			previewUrl = userProfile?.avatar_url || null;
		}
	}

	async function handleSubmit(event) {
		event.preventDefault();
		loading = true;

		try {
			const submitFormData = new FormData();

			// Add text fields
			submitFormData.append('username', formData.username);
			submitFormData.append('full_name', formData.full_name);
			submitFormData.append('bio', formData.bio);

			// Add compressed file if we have one
			if (compressedFile) {
				submitFormData.append('avatar_url', compressedFile);
				console.log('📤 Submitting with compressed file:', {
					name: compressedFile.name,
					type: compressedFile.type,
					size: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
				});
			}

			const response = await fetch('/profile?/updateProfile', {
				method: 'POST',
				body: submitFormData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.type === 'success') {
				// Reset form
				if (fileInput) fileInput.value = '';
				compressedFile = null;
				previewUrl = userProfile?.avatar_url || null;

				// Invalidate to refresh data
				await invalidateAll();

				onMessage({ message: result.data.message, success: true });
			} else {
				onMessage({ message: result.data?.message || 'Update failed', success: false });
			}
		} catch (error) {
			console.error('Submit error:', error);
			onMessage({ message: 'Failed to update profile', success: false });
		} finally {
			loading = false;
		}
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

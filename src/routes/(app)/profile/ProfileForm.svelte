<!-- ProfileForm.svelte -->
<script>
	import { invalidateAll } from '$app/navigation';
	import { compressFile } from '$lib/utils/file.js';
	import Divider from '$lib/Divider.svelte';
	import { Spinner } from '$lib/loaders';

	let { userProfile, onMessage } = $props();

	let loading = $state(false);
	let compressedFile = $state(null);
	let previewUrl = $state(null);
	let fileInput = $state();
	let pendingFields = $state(new Set());

	let formData = $state({ username: '', full_name: '', bio: '' });
	let cleanFormData = { username: '', full_name: '', bio: '' };

	$effect(() => {
		if (userProfile) {
			const initialData = {
				username: userProfile.username || '',
				full_name: userProfile.full_name || '',
				bio: userProfile.bio || '',
			};
			Object.assign(formData, initialData);
			cleanFormData = { ...initialData };
		}
	});

	async function handleBlur(fieldName) {
		// Prevent duplicate requests for the same field
		if (loading || pendingFields.has(fieldName)) return;

		// Only save if the value actually changed
		if (formData[fieldName] !== cleanFormData[fieldName]) {
			pendingFields.add(fieldName);
			try {
				await handleSubmit();
			} finally {
				pendingFields.delete(fieldName);
			}
		}
	}

	async function handleFileChange(event) {
		const file = event.target.files[0];
		if (!file) {
			resetFileState();
			return;
		}

		// Prevent file upload if already processing
		if (loading) return;

		try {
			const { file: compressed, previewUrl: url } = await compressFile(file);
			compressedFile = compressed;
			previewUrl = url;
			await handleSubmit();
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

	async function handleSubmit() {
		// Prevent concurrent requests
		if (loading) return;

		loading = true;

		const submitFormData = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			submitFormData.append(key, value);
		});

		if (compressedFile) {
			submitFormData.append('avatar_url', compressedFile);
		}

		try {
			const response = await fetch('/profile?/updateProfile', {
				method: 'POST',
				body: submitFormData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.type === 'success') {
				// Update clean data to reflect saved state
				cleanFormData = { ...formData };
				// Force reactivity by reassigning formData
				formData = { ...formData };
				resetFileState();
				await invalidateAll();
				onMessage({
					message: result.data?.message || 'Profile updated successfully!',
					success: true,
				});
			} else {
				onMessage({
					message: result.data?.message || 'Update failed',
					success: false,
				});
			}
		} catch (error) {
			console.error('Submit error:', error);
			onMessage({
				message: 'Failed to update profile. Please try again.',
				success: false,
			});
		} finally {
			loading = false;
		}
	}

	// Helper function to check if field has unsaved changes
	function hasUnsavedChanges(fieldName) {
		return formData[fieldName] !== cleanFormData[fieldName];
	}

	// Helper function to check if field is currently being saved
	function isFieldPending(fieldName) {
		return pendingFields.has(fieldName);
	}
</script>

<form class="user-form" onsubmit={(e) => e.preventDefault()}>
	<Divider>
		Profile
		{#if loading}
			<Spinner size={16} />
		{/if}
	</Divider>

	<div class="form-group">
		<label for="username" class="form-label">
			Username
			{#if hasUnsavedChanges('username')}
				<span class="unsaved-indicator">👀</span>
			{/if}
		</label>
		<input
			type="text"
			id="username"
			name="username"
			autocomplete="off"
			bind:value={formData.username}
			required
			disabled={loading}
			onblur={() => handleBlur('username')}
			class="form-input"
			class:pending={isFieldPending('username')} />
	</div>

	<div class="form-group">
		<label for="full_name" class="form-label">
			Full Name
			{#if hasUnsavedChanges('full_name')}
				<span class="unsaved-indicator">👀</span>
			{/if}
		</label>
		<input
			type="text"
			id="full_name"
			name="full_name"
			bind:value={formData.full_name}
			disabled={loading}
			onblur={() => handleBlur('full_name')}
			class="form-input"
			class:pending={isFieldPending('full_name')} />
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
		<label for="bio" class="form-label">
			Bio
			{#if hasUnsavedChanges('bio')}
				<span class="unsaved-indicator">👀</span>
			{/if}
		</label>
		<textarea
			id="bio"
			name="bio"
			bind:value={formData.bio}
			disabled={loading}
			onblur={() => handleBlur('bio')}
			class="form-textarea"
			class:pending={isFieldPending('bio')}></textarea>
	</div>
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

	.unsaved-indicator {
		font-size: small;
		line-height: 1;
	}
</style>

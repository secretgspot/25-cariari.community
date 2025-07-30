<script>
	import { enhance, applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import UserContentList from './UserContentList.svelte';

	let { data } = $props();
	console.log('/profile/+page: ', data);

	let formMessage = $state('');

	// Rune-based Reactive State for form fields
	let profileFormData = $state({
		username: data.profile?.username || '',
		full_name: data.profile?.full_name || '',
		avatar_url: data.profile?.avatar_url || '',
		bio: data.profile?.bio || '',
	});

	// This effect will run whenever `data.profile` changes (e.g., after a successful update)
	$effect(() => {
		if (data.profile) {
			profileFormData = {
				username: data.profile.username || '',
				full_name: data.profile.full_name || '',
				avatar_url: data.profile.avatar_url || '',
				bio: data.profile.bio || '',
			};
		}
	});

	const submitForm = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				formMessage = result.data.message;
				await applyAction(result); // Apply the action result to the page
				await update({ reset: false }); // Re-run load function without resetting form
			} else if (result.type === 'error') {
				formMessage = result.data.message;
				await applyAction(result);
				await update({ reset: false });
			} else if (result.type === 'failure') {
				formMessage = result.data.message;
				await applyAction(result);
				await update({ reset: false });
			}
		};
	};

	const deleteItem = async (id, type) => {
		console.log(`Attempting to delete ${type}: ${id}`);
		if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

		try {
			const response = await fetch(`/api/${type}s/${id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.message || `Failed to delete ${type}`);
			}
			await invalidateAll();
		} catch (e) {
			console.error(`Error deleting ${type}:`, e);
			formMessage = `Error deleting ${type}: ${e.message}`;
		}
	};

	const deleteComment = async (commentId) => {
		console.log(`Attempting to delete comment: ${commentId}`);
		if (!confirm('Are you sure you want to delete this comment?')) return;

		try {
			const response = await fetch(`/api/comments/${commentId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.message || 'Failed to delete comment');
			}
			// Refresh comments data after deletion
			await invalidateAll();
		} catch (e) {
			console.error('Error deleting comment:', e);
			formMessage = `Error deleting comment: ${e.message}`;
		}
	};
</script>

<div class="profile-container">
	<h1>User Profile</h1>

	{#if data.user}
		<p><strong>Email:</strong> {data.user.email}</p>
		<p>
			<strong>Member Since:</strong>
			{new Date(data.user.created_at).toLocaleDateString()}
		</p>

		{#if formMessage}
			<p class="form-message">{formMessage}</p>
		{/if}

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

		<UserContentList
			title="My Lost & Found Posts"
			items={data.lostAndFoundPosts}
			itemKey="item_name"
			linkPrefix="/lost-and-found"
			type="lost-and-found"
			deleteHandler={deleteItem}>
			<svelte:fragment slot="additionalInfo" let:item>
				- {item.description} ({item.type})
			</svelte:fragment>
		</UserContentList>

		<UserContentList
			title="My Events"
			items={data.events}
			itemKey="title"
			linkPrefix="/events"
			type="event"
			deleteHandler={deleteItem}>
			<svelte:fragment slot="additionalInfo" let:item>
				- {item.description} (Date: {new Date(item.event_start_date).toLocaleDateString()}
				{new Date(item.event_start_date).toLocaleTimeString()}{#if item.event_end_date}
					- {new Date(item.event_end_date).toLocaleDateString()}
					{new Date(item.event_end_date).toLocaleTimeString()}{/if})
			</svelte:fragment>
		</UserContentList>

		<UserContentList
			title="My Notices"
			items={data.notices}
			itemKey="title"
			linkPrefix="/notices"
			type="notice"
			deleteHandler={deleteItem}>
			<svelte:fragment slot="additionalInfo" let:item>
				- {item.content} (Posted: {new Date(item.created_at).toLocaleDateString()})
			</svelte:fragment>
		</UserContentList>

		<UserContentList
			title="My Services"
			items={data.services}
			itemKey="title"
			linkPrefix="/services"
			type="service"
			deleteHandler={deleteItem}>
			<svelte:fragment slot="additionalInfo" let:item>
				- {item.description} ({item.category})
			</svelte:fragment>
		</UserContentList>

		<UserContentList
			title="My Comments"
			items={data.comments}
			itemKey="content"
			type="comment"
			deleteHandler={deleteComment}>
			<svelte:fragment slot="additionalInfo" let:item>
				({new Date(item.created_at).toLocaleDateString()})
			</svelte:fragment>
		</UserContentList>
	{:else}
		<p>Please log in to view your profile.</p>
	{/if}
</div>

<style>
	.profile-container {
		max-width: 800px;
		margin: 2em auto;
		padding: 2em;
		background-color: #f9f9f9;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	h1 {
		color: #333;
		margin-bottom: 1em;
	}

	p {
		margin-bottom: 0.5em;
		color: #666;
	}

	strong {
		color: #333;
	}

	.form-message {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 1em;
		border-radius: 5px;
		margin-bottom: 1.5em;
	}

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

<script>
	import { invalidateAll } from '$app/navigation';
	import ProfileForm from './ProfileForm.svelte';
	import UserContentSection from './UserContentSection.svelte';
	import { deleteItem } from '$lib/utils/api_helpers.js';
	import { addToast } from '$lib/toasts';

	let { data } = $props();

	// Generic delete handler that works for all content types
	const handleDelete = async (id, type) => {
		const endpoint = type === 'comment' ? `/api/comments/${id}` : `/api/${type}s/${id}`;

		try {
			await deleteItem(endpoint, type);
			await invalidateAll();
		} catch (error) {
			addToast({
				message: `Error deleting ${type}: ${error.message}`,
				type: 'error',
				dismissible: true,
				timeout: 0,
			});
		}
	};

	const handleFormMessage = (message) => {
		addToast({
			message: message.message,
			type: message.success ? 'success' : 'error',
			dismissible: !message.success,
			timeout: message.success ? 1200 : 0,
		});
	};
</script>

<div class="profile-container">
	<h1>User Profile</h1>

	{#if data.user}
		<div class="user-info">
			<p><strong>Email:</strong> {data.user.email}</p>
			<p>
				<strong>Member Since:</strong>
				{new Date(data.user.created_at).toLocaleDateString()}
			</p>
		</div>

		<ProfileForm userProfile={data.userProfile} onMessage={handleFormMessage} />

		<UserContentSection
			title="My Lost & Found Posts"
			items={data.lostandfounds}
			itemKey="title"
			linkPrefix="/lost-and-found"
			type="lost-and-found"
			onDelete={handleDelete} />

		<UserContentSection
			title="My Events"
			items={data.events}
			itemKey="title"
			linkPrefix="/events"
			type="event"
			onDelete={handleDelete} />

		<UserContentSection
			title="My Notices"
			items={data.notices}
			itemKey="title"
			linkPrefix="/notices"
			type="notice"
			onDelete={handleDelete} />

		<UserContentSection
			title="My Services"
			items={data.services}
			itemKey="title"
			linkPrefix="/services"
			type="service"
			onDelete={handleDelete} />

		<UserContentSection
			title="My Comments"
			items={data.comments}
			itemKey="content"
			type="comment"
			onDelete={handleDelete} />
	{:else}
		<p>Please log in to view your profile.</p>
	{/if}
</div>

<style>
	.profile-container {
		h1 {
			color: var(--stone-11);
			margin-bottom: var(--size-3);
		}
		p {
			margin-bottom: var(--size-2);
			color: var(--stone-11);
		}

		strong {
			color: var(--stone-6);
		}

		.user-info {
			font-size: small;
		}
	}
</style>

<script>
	import { invalidateAll } from '$app/navigation';
	import ProfileForm from './ProfileForm.svelte';
	import UserContentSection from './UserContentSection.svelte';
	import { deleteItem } from '$lib/utils/api_helpers.js';

	let { data } = $props();

	let formMessage = $state('');
	let formStatus = $state();

	// Generic delete handler that works for all content types
	const handleDelete = async (id, type) => {
		const endpoint = type === 'comment' ? `/api/comments/${id}` : `/api/${type}s/${id}`;

		try {
			await deleteItem(endpoint, type);
			await invalidateAll();
		} catch (error) {
			formMessage = `Error deleting ${type}: ${error.message}`;
		}
	};

	const handleFormMessage = (message) => {
		formMessage = message.message;
		formStatus = message.success;
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

		{#if formMessage}
			<div class="form-message" class:success={formStatus}>{formMessage}</div>
		{/if}

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

		.user-info {
			font-size: small;
		}
	}

	.form-message {
		border: var(--border-size-1) solid var(--red-3);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		margin-block: var(--size-6);
		&.success {
			border-color: var(--green-3);
		}
	}
</style>

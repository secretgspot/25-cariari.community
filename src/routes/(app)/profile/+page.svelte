<script>
	import { invalidateAll } from '$app/navigation';
	import ProfileForm from './ProfileForm.svelte';
	import UserContentSection from './UserContentSection.svelte';
	import { deleteItem } from '$lib/utils/api_helpers.js';

	let { data } = $props();

	let formMessage = $state('');

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
		formMessage = message;
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

		{#if formMessage}
			<div class="form-message">{formMessage}</div>
		{/if}

		<ProfileForm userProfile={data.userProfile} onMessage={handleFormMessage} />

		<UserContentSection
			title="My Lost & Found Posts"
			items={data.lostAndFoundPosts}
			itemKey="item_name"
			linkPrefix="/lost-and-found"
			type="lost-and-found"
			onDelete={handleDelete}
			formatAdditionalInfo={(item) => `${item.description} (${item.type})`} />

		<UserContentSection
			title="My Events"
			items={data.events}
			itemKey="title"
			linkPrefix="/events"
			type="event"
			onDelete={handleDelete}
			formatAdditionalInfo={(item) => {
				const startDate = new Date(item.event_start_date);
				const endDate = item.event_end_date ? new Date(item.event_end_date) : null;
				return `${item.description} (Date: ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}${endDate ? ` - ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}` : ''})`;
			}} />

		<UserContentSection
			title="My Notices"
			items={data.notices}
			itemKey="title"
			linkPrefix="/notices"
			type="notice"
			onDelete={handleDelete}
			formatAdditionalInfo={(item) =>
				`${item.content} (Posted: ${new Date(item.created_at).toLocaleDateString()})`} />

		<UserContentSection
			title="My Services"
			items={data.services}
			itemKey="title"
			linkPrefix="/services"
			type="service"
			onDelete={handleDelete}
			formatAdditionalInfo={(item) => `${item.description} (${item.category})`} />

		<UserContentSection
			title="My Comments"
			items={data.comments}
			itemKey="content"
			type="comment"
			onDelete={handleDelete}
			formatAdditionalInfo={(item) =>
				`(${new Date(item.created_at).toLocaleDateString()})`} />
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

	.user-info p {
		margin-bottom: 0.5em;
		color: #666;
	}

	.user-info strong {
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
</style>

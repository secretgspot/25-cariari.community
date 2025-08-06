<!-- /profile/+page.svelte -->
<script>
	import { invalidateAll } from '$app/navigation';
	import ProfileForm from './ProfileForm.svelte';
	import UserContentList from './UserContentList.svelte';
	import ContentItem from './ContentItem.svelte';
	import { deleteItem, buildDeleteEndpoint, ApiError } from '$lib/utils/api_helpers.js';
	import { addToast } from '$lib/toasts';

	let { data } = $props();

	const handleDelete = async (id, type) => {
		const endpoint = buildDeleteEndpoint(type, id);

		try {
			await deleteItem(endpoint, type);
			addToast({
				message: `${type} deleted successfully!`,
				type: 'success',
				timeout: 1200,
			});
			await invalidateAll();
		} catch (error) {
			const message =
				error instanceof ApiError ? error.message : `Unexpected error deleting ${type}`;

			addToast({
				message,
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

		<UserContentList title="My Lost & Found Posts" items={data.lostandfound}>
			{#snippet children(items)}
				{#each items as item}
					<ContentItem
						{item}
						itemKey="title"
						linkPrefix="/lost-and-found"
						type="lost-and-found"
						onDelete={handleDelete} />
				{/each}
			{/snippet}
		</UserContentList>

		<UserContentList title="My Events" items={data.events}>
			{#snippet children(items)}
				{#each items as item}
					<ContentItem
						{item}
						itemKey="title"
						linkPrefix="/events"
						type="event"
						onDelete={handleDelete} />
				{/each}
			{/snippet}
		</UserContentList>

		<UserContentList title="My Notices" items={data.notices}>
			{#snippet children(items)}
				{#each items as item}
					<ContentItem
						{item}
						itemKey="title"
						linkPrefix="/notices"
						type="notice"
						onDelete={handleDelete} />
				{/each}
			{/snippet}
		</UserContentList>

		<UserContentList title="My Services" items={data.services}>
			{#snippet children(items)}
				{#each items as item}
					<ContentItem
						{item}
						itemKey="title"
						linkPrefix="/services"
						type="service"
						onDelete={handleDelete} />
				{/each}
			{/snippet}
		</UserContentList>

		<UserContentList title="My Comments" items={data.comments}>
			{#snippet children(items)}
				{#each items as item}
					<ContentItem {item} itemKey="content" type="comment" onDelete={handleDelete} />
				{/each}
			{/snippet}
		</UserContentList>
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

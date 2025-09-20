<script>
	import { invalidateAll } from '$app/navigation';
	import ProfileForm from './ProfileForm.svelte';
	import UserContentList from './UserContentList.svelte';
	import ContentItem from './ContentItem.svelte';
	import { deleteItem, buildDeleteEndpoint, ApiError } from '$lib/utils/api_helpers.js';
	import { addToast } from '$lib/toasts';
	import Settings from '$lib/settings/Settings.svelte';
	import { timeFrom, timeFromLong } from '$lib/utils/time.js';
	import { Button, LinkButton } from '$lib/buttons';
	import Icon from '$lib/Icon.svelte';

	let { data } = $props();
	// const isAdmin = data.is_admin;

	// Only need to track active tab
	let activeTabId = $state('profile');

	const changeTab = (id) => {
		activeTabId = id;
	};

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

<div class="profile-container" data-active-tab={activeTabId}>
	<aside class="index">
		<div class="options">
			<Button
				sound_pattern="tick"
				active={activeTabId === 'profile'}
				onclick={() => changeTab('profile')}
				size="block">
				Profile
			</Button>

			<Button
				sound_pattern="tick"
				active={activeTabId === 'settings'}
				onclick={() => changeTab('settings')}
				size="block">
				Settings
			</Button>

			<Button
				sound_pattern="tick"
				active={activeTabId === 'notices'}
				onclick={() => changeTab('notices')}
				size="block">
				Notices
			</Button>

			<Button
				sound_pattern="tick"
				active={activeTabId === 'events'}
				onclick={() => changeTab('events')}
				size="block">
				Events
			</Button>

			<Button
				sound_pattern="tick"
				active={activeTabId === 'lostandfound'}
				onclick={() => changeTab('lostandfound')}
				size="block">
				Lost & Found
			</Button>

			<Button
				sound_pattern="tick"
				active={activeTabId === 'services'}
				onclick={() => changeTab('services')}
				size="block">
				Services
			</Button>

			<Button
				sound_pattern="tick"
				active={activeTabId === 'comments'}
				onclick={() => changeTab('comments')}
				size="block">
				Comments
			</Button>
		</div>
	</aside>

	{#if data.user}
		<div class="user-info">
			<div class="identity-wrap">
				<div class="identity">
					<h1>{data.user.email.split('@')[0]}</h1>
					<div class="email">{data.user.email}</div>
				</div>

				<form action="/logout" method="post" class="logout-form">
					<LinkButton
						sound={true}
						sound_pattern="logout"
						underline={false}
						title="Logout"
						class="logout-btn">
						<Icon kind="logout" size="27" />
					</LinkButton>
				</form>
			</div>

			<div class="joined">
				<strong>Joined:</strong>
				{timeFromLong(data.user.created_at)}
			</div>
		</div>

		<div id="profile" class="content-section" data-tab="profile">
			<ProfileForm userProfile={data.userProfile} onMessage={handleFormMessage} />
		</div>

		<div id="settings" class="content-section" data-tab="settings">
			<Settings />
		</div>

		<UserContentList
			id="notices"
			title="My Notices"
			items={data.notices}
			class="content-section"
			data-tab="notices">
			{#snippet children(items)}
				{#each items as item (item.id)}
					<ContentItem
						{item}
						itemKey="title"
						linkPrefix="/notices"
						type="notice"
						onDelete={handleDelete} />
				{/each}
			{/snippet}
		</UserContentList>

		<UserContentList
			id="events"
			title="My Events"
			items={data.events}
			class="content-section"
			data-tab="events">
			{#snippet children(items)}
				{#each items as item (item.id)}
					<ContentItem
						{item}
						itemKey="title"
						linkPrefix="/events"
						type="event"
						onDelete={handleDelete} />
				{/each}
			{/snippet}
		</UserContentList>

		<UserContentList
			id="lostandfound"
			title="My Lost & Found Posts"
			items={data.lostandfound}
			class="content-section"
			data-tab="lostandfound">
			{#snippet children(items)}
				{#each items as item (item.id)}
					<ContentItem
						{item}
						itemKey="title"
						linkPrefix="/lost-and-found"
						type="lost-and-found"
						onDelete={handleDelete} />
				{/each}
			{/snippet}
		</UserContentList>

		<UserContentList
			id="services"
			title="My Services"
			items={data.services}
			class="content-section"
			data-tab="services">
			{#snippet children(items)}
				{#each items as item (item.id)}
					<ContentItem
						{item}
						itemKey="title"
						linkPrefix="/services"
						type="service"
						onDelete={handleDelete} />
				{/each}
			{/snippet}
		</UserContentList>

		<UserContentList
			id="comments"
			title="My Comments"
			items={data.comments}
			class="content-section"
			data-tab="comments">
			{#snippet children(items)}
				{#each items as item (item.id)}
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
		display: flex;
		flex-direction: column;
		gap: var(--size-9);

		/* Desktop layout */
		@container (min-width: 769px) {
			display: grid;
			grid-template-columns: 300px 1fr;
			grid-template-rows: 90px 1fr;
			grid-template-areas:
				'head head'
				'nav main';
			gap: 0;
		}

		p {
			margin-bottom: var(--size-2);
		}

		.user-info {
			display: flex;
			gap: var(--size-3);
			justify-content: space-between;
			align-items: flex-end;

			@container (min-width: 769px) {
				grid-area: head;
				background: var(--surface-1);
				position: sticky;
				top: 64px;
				z-index: 1;
			}

			.identity-wrap {
				display: flex;
				align-items: center;
				gap: var(--size-2);

				h1 {
					margin: 0;
				}

				:global(.logout-btn) {
					padding: 0;
					color: var(--text-1);
				}
			}

			strong {
				color: var(--text-2);
			}

			.email,
			.joined {
				font-size: small;
			}
		}

		.index {
			/* Hide navigation on mobile */
			display: none;

			@container (min-width: 769px) {
				display: block;
				grid-area: nav;
			}

			.options {
				display: flex;
				flex-direction: column;
				position: sticky;
				top: 180px;
				margin-inline-end: var(--size-9);

				:global(.button) {
					border: 0;
					justify-content: start;
				}
				:global(.button .content_wrap) {
					padding: var(--size-2);
				}
			}
		}

		/* Content sections - visible on mobile, tabs on desktop */
		:global(.content-section) {
			/* Show all sections on mobile */
			display: block;

			@container (min-width: 769px) {
				grid-area: main;
				/* Hide all sections by default on desktop */
				display: none;
			}
		}

		/* Show active section on desktop */
		@container (min-width: 769px) {
			&[data-active-tab='profile'] :global(.content-section[data-tab='profile']),
			&[data-active-tab='settings'] :global(.content-section[data-tab='settings']),
			&[data-active-tab='notices'] :global(.content-section[data-tab='notices']),
			&[data-active-tab='events'] :global(.content-section[data-tab='events']),
			&[data-active-tab='lostandfound']
				:global(.content-section[data-tab='lostandfound']),
			&[data-active-tab='services'] :global(.content-section[data-tab='services']),
			&[data-active-tab='comments'] :global(.content-section[data-tab='comments']) {
				display: block;
			}
		}

		:global(.text-divider) {
			position: sticky;
			top: var(--size-9);
			background: var(--surface-1);
			@container (min-width: 769px) {
				top: 154px;
			}
		}
	}
</style>

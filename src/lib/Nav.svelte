<script>
	import { page } from '$app/state';
	import { LinkButton } from '$lib/buttons';
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';

	let { data } = $props();
	// console.log('Nav data: ', data);
	// console.log('Nav page data: ', page.data); // DO NOT NEED PAGEDATA in NAV, IT BRINGS TOO MUCH DATA SUCH AS noticesPosts, servicesPosts and everything else that's available in data
</script>

<header class="site-header">
	<!-- Brand/Logo Section -->
	<LinkButton href="/" underline={false} sound_pattern="tick" class="logo-link">
		<Logo size="30px" title="Cariari Community" />
	</LinkButton>

	<!-- Navigation Menu -->
	<nav class="site-nav" aria-label="Main navigation">
		{#if data?.is_logged_in}
			<!-- Main Navigation Links -->
			<LinkButton
				href="/notices"
				underline={false}
				sound_pattern="basic"
				class="nav-link">
				<span class="nav-icon"><Icon kind="notices" size="27" /></span>
				<span class="nav-text">Notices</span>
			</LinkButton>

			<LinkButton href="/events" underline={false} sound_pattern="basic" class="nav-link">
				<span class="nav-icon"><Icon kind="events" size="27" /></span>
				<span class="nav-text">Events</span>
			</LinkButton>

			<LinkButton
				href="/lost-and-found"
				underline={false}
				sound_pattern="basic"
				class="nav-link">
				<span class="nav-icon"><Icon kind="lost-and-found" size="27" /></span>
				<span class="nav-text">Lost & Found</span>
			</LinkButton>

			<LinkButton
				href="/services"
				underline={false}
				sound_pattern="basic"
				class="nav-link">
				<span class="nav-icon"><Icon kind="services" size="27" /></span>
				<span class="nav-text">Services</span>
			</LinkButton>

			<!-- User Section -->
			<LinkButton
				href="/profile"
				underline={false}
				sound_pattern="bell"
				class="profile-link">
				{#if data.is_admin}<span title="admin" class="admin-indicator">🜲</span>{/if}
				{#if data.userProfile?.avatar_url}
					<img
						src={data.userProfile.avatar_url}
						alt="{data.userProfile?.username || 'User'} avatar"
						class="avatar-image" />
				{:else}
					<Icon kind="user" size="27" />
				{/if}

				<span class="nav-text profile-name">
					{#if data.userProfile?.username}
						{data.userProfile.username}
					{:else if data.user?.email}
						{data.user.email.split('@')[0]}
					{:else}
						Profile
					{/if}
				</span>
			</LinkButton>
		{:else}
			<!-- Guest Navigation -->
			<div class="guest-section">
				<LinkButton href="/login" underline={false} class="nav-link">
					<span class="signin-icon" aria-hidden="true">👤</span>
					<span>Sign In</span>
				</LinkButton>
			</div>
		{/if}

		{#if data.is_admin}
			<LinkButton href="/admin" underline={false} class="nav-link">
				<span class="nav-icon"><Icon kind="admin" size="27" /></span>
				<span class="nav-text">Admin</span>
			</LinkButton>
		{/if}
	</nav>
</header>

<style>
	header.site-header {
		display: flex;
		justify-content: space-between;
		position: sticky;
		top: 0;
		padding: var(--size-3);
		background-color: var(--surface-1);
		z-index: 3;

		:global(.logo-link) {
			color: var(--text-1);
		}
	}

	nav.site-nav {
		display: flex;
		flex-direction: row;
		gap: var(--size-3);
		align-items: center;
		.nav-text {
			display: none;
			color: var(--text-2);
			@media (min-width: 481px) {
				display: block;
			}
		}
		:global(.nav-link) {
			display: flex;
			align-items: center;
			text-decoration: none;
			gap: var(--size-2);
			color: var(--text-1);
			&:hover {
				color: var(--text-2);
			}
		}
		:global(.profile-link) {
			position: relative;
			display: flex;
			gap: var(--size-2);
			color: var(--text-1);
			&:hover {
				color: var(--text-2);
			}
			.admin-indicator {
				position: absolute;
				top: -13px;
				left: 3px;
				color: var(--brand);
				font-size: x-large;
			}
			.avatar-image {
				border-radius: var(--radius-round);
				aspect-ratio: 1;
				max-height: 27px;
				object-fit: cover;
				z-index: 1;
			}
		}
	}
</style>

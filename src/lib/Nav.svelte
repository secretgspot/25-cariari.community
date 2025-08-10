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
	<LinkButton href="/" underline={false} class="logo-link">
		<Logo size="30px" title="Cariari Community" />
	</LinkButton>

	<!-- Navigation Menu -->
	<nav class="site-nav" aria-label="Main navigation">
		{#if data?.is_logged_in}
			<!-- Main Navigation Links -->
			<LinkButton href="/notices" underline={false} class="nav-link">
				<span class="nav-icon"><Icon kind="notices" size="27" /></span>
				<span class="nav-text">Notices</span>
			</LinkButton>

			<LinkButton href="/events" underline={false} class="nav-link">
				<span class="nav-icon"><Icon kind="events" size="27" /></span>
				<span class="nav-text">Events</span>
			</LinkButton>

			<LinkButton href="/lost-and-found" underline={false} class="nav-link">
				<span class="nav-icon"><Icon kind="lost-and-found" size="27" /></span>
				<span class="nav-text">Lost & Found</span>
			</LinkButton>

			<LinkButton href="/services" underline={false} class="nav-link">
				<span class="nav-icon"><Icon kind="services" size="27" /></span>
				<span class="nav-text">Services</span>
			</LinkButton>

			<!-- User Section -->
			<LinkButton href="/profile" underline={false} class="profile-link">
				{#if data.is_admin}<span title="admin" class="admin-indicator">🔥</span>{/if}
				{#if data.userProfile?.avatar_url}
					<img
						src={data.userProfile.avatar_url}
						alt="{data.userProfile?.username || 'User'} avatar"
						class="avatar-image" />
				{:else}
					👤
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
			<form action="/logout" method="post" class="logout-form">
				<LinkButton
					sound={true}
					sound_pattern="logout"
					underline={false}
					class="logout-btn">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
						<path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="32"
							d="M304 336v40a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V136a40 40 0 0 1 40-40h152c22.09 0 48 17.91 48 40v40M368 336l80-80-80-80M176 256h256">
						</path>
					</svg>
				</LinkButton>
			</form>
		{:else}
			<!-- Guest Navigation -->
			<div class="guest-section">
				<LinkButton href="/login" underline={false} class="nav-link">
					<span class="signin-icon" aria-hidden="true">👤</span>
					<span>Sign In</span>
				</LinkButton>
			</div>
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
		/* Small tablets and larger mobile devices (481px - 768px) */
		@media (min-width: 481px) {
		}

		/* Tablets and small laptops (769px - 1024px) */
		@media (min-width: 769px) {
		}

		/* Large desktops and high-resolution screens (1025px and up) */
		@media (min-width: 1025px) {
			border-radius: var(--border-size-3);
		}

		/* Extra-large screens (1440px and up) */
		@media (min-width: 1440px) {
		}

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
		}
		:global(.profile-link) {
			position: relative;
			display: flex;
			gap: var(--size-2);
			.admin-indicator {
				position: absolute;
				bottom: 0px;
				left: 0px;
				z-index: 2;
				font-size: small;
			}
			.avatar-image {
				border-radius: var(--radius-round);
				aspect-ratio: 1;
				max-height: 27px;
				object-fit: cover;
			}
		}
		:global(.logout-btn) {
			padding: 0;
			svg {
				color: var(--text-1);
				height: 27px;
				vertical-align: middle;
			}
		}
	}
</style>

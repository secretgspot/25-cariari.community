<script>
	import { page } from '$app/state';
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';

	let { data } = $props();
	// console.log('Nav data: ', data);
	// console.log('Nav page data: ', page.data); // DO NOT NEED PAGEDATA in NAV, IT BRINGS TOO MUCH DATA SUCH AS noticesPosts, servicesPosts and everything else that's available in data
</script>

<header class="site-header">
	<!-- Brand/Logo Section -->
	<a href="/">
		<Logo size="30px" title="Cariari Community" />
	</a>

	<!-- Navigation Menu -->
	<nav class="site-nav" aria-label="Main navigation">
		{#if data?.is_logged_in}
			<!-- Main Navigation Links -->
			<a href="/notices" class="nav-link">
				<span class="nav-icon"><Icon kind="notices" size="27" /></span>
				<span class="nav-text">Notices</span>
			</a>
			<a href="/events" class="nav-link">
				<span class="nav-icon"><Icon kind="events" size="27" /></span>
				<span class="nav-text">Events</span>
			</a>
			<a href="/lost-and-found" class="nav-link">
				<span class="nav-icon"><Icon kind="lost-and-found" size="27" /></span>
				<span class="nav-text">Lost & Found</span>
			</a>
			<a href="/services" class="nav-link">
				<span class="nav-icon"><Icon kind="services" size="27" /></span>
				<span class="nav-text">Services</span>
			</a>

			<!-- User Section -->
			<a href="/profile" class="profile-link">
				{#if data.is_admin}<span title="admin">🔥</span>{/if}
				{#if data.profile?.avatar_url}
					<img
						src={data.profile.avatar_url}
						alt="{data.profile?.username || 'User'} avatar"
						class="avatar-image" />
				{/if}

				<span class="profile-name">
					{#if data.profile?.username}
						{data.profile.username}
					{:else if data.user?.email}
						{data.user.email.split('@')[0]}
					{:else}
						Profile
					{/if}
				</span>
			</a>
			<form action="/logout" method="post" class="logout-form">
				<button type="submit" class="logout-btn" aria-label="Sign out">
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
				</button>
			</form>
		{:else}
			<!-- Guest Navigation -->
			<div class="guest-section">
				<a href="/login" class="signin-btn">
					<span class="signin-icon" aria-hidden="true">👤</span>
					<span>Sign In</span>
				</a>
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
		background-color: rgb(255 255 255 / 90%);
		backdrop-filter: blur(10px);
	}

	nav.site-nav {
		display: flex;
		flex-direction: row;
		gap: var(--size-3);
		align-items: center;
		.nav-text {
			display: none;
			@media (min-width: 481px) {
				display: block;
			}
		}
		a {
			display: flex;
			align-items: center;
			text-decoration: none;
			gap: var(--size-2);
		}
		.profile-link {
			display: flex;
			gap: var(--size-2);
			.avatar-image {
				border-radius: var(--radius-round);
				max-height: 27px;
			}
			.profile-name {
				display: none;
				@media (min-width: 481px) {
					display: block;
				}
			}
		}
		button.logout-btn {
			padding: 0;
			background: transparent;
			border: none;
			svg {
				height: 21px;
				vertical-align: middle;
			}
		}
	}
</style>

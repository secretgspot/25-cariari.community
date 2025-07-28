<script>
  import Logo from './Logo.svelte';
  import { page } from '$app/stores';
  
  let { data } = $props();
  let isMobileMenuOpen = $state(false);
  
  // Close mobile menu when clicking outside
  function handleClickOutside(event) {
    if (!event.target.closest('.nav-container') && isMobileMenuOpen) {
      isMobileMenuOpen = false;
    }
  }
  
  // Navigation items configuration
  const navItems = [
    { href: '/events', label: 'Events', icon: '📅' },
    { href: '/lost-and-found', label: 'Lost & Found', icon: '🔍' },
    { href: '/notices', label: 'Notices', icon: '📢' }
  ];
  
  // Check if current page matches nav item
  function isActiveRoute(href) {
    return $page.url.pathname.startsWith(href);
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="nav-header">
  <nav class="nav-container" role="navigation" aria-label="Main navigation">
    <!-- Brand/Logo Section -->
    <div class="nav-brand">
      <a href="/" class="brand-link" aria-label="Cariari Community Home">
        <Logo size="2em" />
        <span class="brand-text">Cariari Community</span>
      </a>
    </div>

    <!-- Mobile Menu Toggle -->
    <button 
      class="mobile-menu-toggle" 
      aria-label="Toggle navigation menu"
      aria-expanded={isMobileMenuOpen}
      onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
    >
      <span class="hamburger-line" class:active={isMobileMenuOpen}></span>
      <span class="hamburger-line" class:active={isMobileMenuOpen}></span>
      <span class="hamburger-line" class:active={isMobileMenuOpen}></span>
    </button>

    <!-- Navigation Menu -->
    <div class="nav-menu" class:open={isMobileMenuOpen}>
      {#if data?.is_logged_in}
        <!-- Main Navigation Links -->
        <ul class="nav-links" role="list">
          {#each navItems as item}
            <li role="listitem">
              <a 
                href={item.href} 
                class="nav-link" 
                class:active={isActiveRoute(item.href)}
                onclick={() => isMobileMenuOpen = false}
              >
                <span class="nav-icon" aria-hidden="true">{item.icon}</span>
                <span class="nav-text">{item.label}</span>
              </a>
            </li>
          {/each}
        </ul>

        <!-- User Section -->
        <div class="user-section">
          <a href="/profile" class="profile-link" onclick={() => isMobileMenuOpen = false}>
            <div class="profile-avatar">
              {#if data.profile?.avatar_url}
                <img 
                  src={data.profile.avatar_url} 
                  alt="{data.profile?.username || 'User'} avatar" 
                  class="avatar-image"
                />
              {:else}
                <div class="avatar-placeholder" aria-hidden="true">
                  {(data.profile?.username?.[0] || data.user?.email?.[0] || 'U').toUpperCase()}
                </div>
              {/if}
            </div>
            <div class="profile-info">
              <span class="profile-name">
                {#if data.profile?.username}
                  {data.profile.username}
                {:else if data.user?.email}
                  {data.user.email.split('@')[0]}
                {:else}
                  Profile
                {/if}
              </span>
              <span class="profile-label">My Account</span>
            </div>
          </a>
          
          <form action="/logout" method="post" class="logout-form">
            <button type="submit" class="logout-btn" aria-label="Sign out">
              <span class="logout-icon" aria-hidden="true">↗</span>
              <span class="logout-text">Sign Out</span>
            </button>
          </form>
        </div>
      {:else}
        <!-- Guest Navigation -->
        <div class="guest-section">
          <a href="/login" class="signin-btn" onclick={() => isMobileMenuOpen = false}>
            <span class="signin-icon" aria-hidden="true">👤</span>
            <span>Sign In</span>
          </a>
        </div>
      {/if}
    </div>
  </nav>
</header>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1em;
    background-color: #f0f0f0;
  }

  nav a {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #333;
  }

  nav a span {
    margin-left: 0.5em;
    font-weight: bold;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
  }

  li {
    margin-left: 1em;
  }

  button {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    font-size: 1em;
  }
  .profile-link {
    display: flex;
    align-items: center;
    gap: 0.5em; /* Space between avatar/text */
  }

  .nav-avatar {
    width: 2em; /* Adjust size as needed */
    height: 2em;
    border-radius: 50%;
    object-fit: cover;
  }
</style>


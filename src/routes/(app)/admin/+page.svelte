<script>
	import { addToast } from '$lib/toasts';
	import UsersManagement from './UsersManagement.svelte';
	import AdManagement from './AdManagement.svelte';

	let { data } = $props();

	// Only need to track active tab
	let activeTabId = $state('users');

	const changeTab = (id) => {
		activeTabId = id;
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

<div class="admin-container" data-active-tab={activeTabId}>
	<aside class="index">
		<div class="options">
			<button class:active={activeTabId === 'users'} onclick={() => changeTab('users')}
				>Users</button>
			<button class:active={activeTabId === 'ads'} onclick={() => changeTab('ads')}
				>Ads</button>
		</div>
	</aside>

	<header class="admin-header">
		<h1>Administration</h1>
	</header>

	<div id="users" class="content-section" data-tab="users">
		<UsersManagement />
	</div>

	<div id="ads" class="content-section" data-tab="ads">
		<AdManagement ads={data.ads} onMessage={handleFormMessage} />
	</div>
</div>

<style>
	.admin-container {
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

		.admin-header {
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

			h1 {
				margin: 0;
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

				button {
					background-color: transparent;
					border: 0;
					text-align: left;
					color: var(--text-1);
					padding: var(--size-2);
					border-radius: var(--radius-2);
					transition: background-color var(--transition) ease;

					&:hover {
						background-color: var(--surface-4);
					}

					&.active {
						font-weight: bold;
						background-color: var(--surface-3);
						color: var(--text-1);
					}
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
			&[data-active-tab='ads'] :global(.content-section[data-tab='ads']),
			&[data-active-tab='users'] :global(.content-section[data-tab='users']) {
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

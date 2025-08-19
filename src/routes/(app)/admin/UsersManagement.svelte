<script>
	import { addToast } from '$lib/toasts';
	import Divider from '$lib/Divider.svelte';
	import Dialog from '$lib/Dialog.svelte';
	import Button from '$lib/buttons/Button.svelte';
	import Icon from '$lib/Icon.svelte';

	let users = $state([]);
	let userToDelete = $state(null);
	let loading = $state(false);
	let showDeleteDialog = $state(false);

	const handleDelete = () => {
		showDeleteDialog = true;
	};

	$effect(() => {
		fetchUsers();
	});

	async function fetchUsers() {
		try {
			const response = await fetch('/api/users');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			users = await response.json();
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	}

	function confirmDelete(user) {
		userToDelete = user;
		showDeleteDialog = true;
	}

	async function deleteUser() {
		if (userToDelete) {
			try {
				const response = await fetch(`/api/users/${userToDelete.user_id}`, {
					method: 'DELETE',
				});
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				addToast({
					message: `${userToDelete.user_id} deleted successfully!`,
					type: 'success',
					timeout: 1200,
				});
				users = users.filter((user) => user.user_id !== userToDelete.user_id);
				userToDelete = null;
				showDeleteDialog = false;
			} catch (error) {
				addToast({
					message: `Failed to delete user, ${error}`,
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
				console.error('Error deleting user:', error);
			}
		}
	}
</script>

<Divider>Users Management - ({users.length})</Divider>
{#if users.length > 0}
	<ul>
		{#each users as user (user.user_id)}
			<li>
				<div class="user">
					{#if user?.avatar_url}
						<img
							src={user.avatar_url}
							alt="{user?.username || 'User'} avatar"
							class="avatar" />
					{:else}
						<div class="placeholder-image">👤</div>
					{/if}
					<span>{user.username}</span>
					<span>{user.user_id}</span>
				</div>

				<Button
					size="icon"
					aria-label="Delete {user.username}"
					onclick={() => confirmDelete(user)}
					{loading}
					disabled={loading}>
					{#snippet icon()}
						<Icon kind="delete" size="12" />
					{/snippet}
				</Button>
			</li>
		{/each}
	</ul>
{:else}
	<p class="no-users">No users found.</p>
{/if}

<Dialog
	open={showDeleteDialog}
	title="Delete"
	message="You are about to delete user: {userToDelete?.username}. This action cannot be undone."
	type="confirm"
	onConfirm={deleteUser}
	onCancel={() => (showDeleteDialog = false)} />

<style>
	.user {
		font-size: small;
		display: flex;
		align-items: center;
		gap: var(--size-3);

		.avatar,
		.placeholder-image {
			aspect-ratio: 1;
			object-fit: cover;
			width: 30px;
			height: 30px;
			border-radius: var(--radius-blob-3);
		}
		.placeholder-image {
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: var(--radius-blob-3);
			background: var(--gray-3);
		}
	}

	.no-users {
		text-align: center;
	}

	ul {
		list-style: none;
		padding: 0;

		li {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: var(--size-2);
			border-bottom: var(--border-size-1) solid var(--surface-2);

			&:last-child {
				border-bottom: none;
			}

			&:hover {
				background-color: var(--surface-2);
			}
		}
	}
</style>

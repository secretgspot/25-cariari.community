<!-- UserManagement.svelte -->
<script>
	import { addToast } from '$lib/toasts';
	import Divider from '$lib/Divider.svelte';
	import Dialog from '$lib/Dialog.svelte';
	import Button from '$lib/buttons/Button.svelte';
	import Icon from '$lib/Icon.svelte';
	import Spinner from '$lib/loaders/Spinner.svelte';

	import { enhance } from '$app/forms';

	let { users = [], currentUserId = null } = $props();

	let userToDelete = $state(null);
	let loading = $state(false);
	let showDeleteDialog = $state(false);
	let adminTogglingUser = $state(null); // Track which user's admin status is being toggled

	function confirmDelete(user) {
		userToDelete = user;
		showDeleteDialog = true;
	}

	async function deleteUser() {
		if (!userToDelete) return;

		loading = true;
		try {
			const response = await fetch(`/api/users/${userToDelete.user_id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
			}

			addToast({
				message: `${userToDelete.username || userToDelete.user_id} deleted successfully!`,
				type: 'success',
				timeout: 3000,
			});

			// Remove user from local state
			users = users.filter((user) => user.user_id !== userToDelete.user_id);
			userToDelete = null;
			showDeleteDialog = false;
		} catch (error) {
			console.error('Error deleting user:', error);
			addToast({
				message: `Failed to delete user: ${error.message}`,
				type: 'error',
				dismissible: true,
				timeout: 0,
			});
		} finally {
			loading = false;
		}
	}

	function cancelDelete() {
		userToDelete = null;
		showDeleteDialog = false;
	}

	// Enhanced admin toggle with better UX
	function createAdminToggleEnhancer(user) {
		return () => {
			adminTogglingUser = user.user_id;
			return async ({ result, update }) => {
				try {
					if (result.type === 'success') {
						// Update the user's admin status in the local 'users' array
						users = users.map((u) =>
							u.user_id === user.user_id
								? {
										...u,
										app_metadata: {
											...u.app_metadata,
											admin: result.data?.newAdminStatus,
										},
									}
								: u,
						);

						addToast({
							message: result.data?.message || 'Admin status updated successfully',
							type: 'success',
							timeout: 2000,
						});
					} else if (result.type === 'error' || result.type === 'failure') {
						const errorMessage = result.data?.message || 'Failed to update admin status';

						addToast({
							message: errorMessage,
							type: 'error',
							timeout: 4000,
						});
					}
				} catch (error) {
					console.error('Error in admin toggle:', error);
					addToast({
						message: 'An unexpected error occurred',
						type: 'error',
						timeout: 4000,
					});
				} finally {
					adminTogglingUser = null;
					await update();
				}
			};
		};
	}

	// Helper function to get display name
	function getDisplayName(user) {
		if (!user) return 'Unknown User';
		return user.username || user.email || user.user_id;
	}
</script>

<Divider>Users Management - ({users.length})</Divider>

{#if users.length > 0}
	<section class="users-wrapper">
		{#each users as user (user.user_id)}
			<div
				class="user"
				class:yourself={user.user_id === currentUserId}
				class:admin={user.app_metadata?.admin}>
				<div class="avatar-wrap">
					{#if user?.avatar_url}
						<img
							src={user.avatar_url}
							alt="{getDisplayName(user)} avatar"
							class="avatar"
							loading="lazy" />
					{:else}
						<div class="placeholder-image">👤</div>
					{/if}
				</div>
				<div class="user-info">
					<span class="username">{getDisplayName(user)}</span>
					<small class="user-id">{user.user_id}</small>
				</div>
				<div class="user-actions">
					{#if user.user_id !== currentUserId}
						<!-- Other users - show role select -->
						<form
							method="POST"
							action="?/makeAdmin"
							use:enhance={createAdminToggleEnhancer(user)}
							class="admin-toggle-form">
							<input type="hidden" name="userId" value={user.user_id} />
							<div class="admin-label">
								{#if adminTogglingUser === user.user_id}
									<Spinner />
								{:else}
									<select
										name="adminStatus"
										value={user.app_metadata?.admin ? 'admin' : 'regular'}
										disabled={adminTogglingUser === user.user_id}
										onchange={(e) => {
											// Convert select value back to boolean for the form
											const isAdmin = e.target.value === 'admin';
											e.target.form.adminStatus.value = isAdmin;
											e.target.form.requestSubmit();
										}}>
										<option value="regular">Regular</option>
										<option value="admin">Admin</option>
									</select>
									<input
										type="hidden"
										name="adminStatus"
										value={user.app_metadata?.admin || false} />
								{/if}
							</div>
						</form>

						<Button
							size="icon"
							variant="ghost"
							aria-label="Delete {getDisplayName(user)}"
							onclick={() => confirmDelete(user)}
							disabled={loading || adminTogglingUser === user.user_id}>
							{#snippet icon()}
								<Icon kind="delete" size="12" />
							{/snippet}
						</Button>
					{/if}
				</div>
			</div>
		{/each}
	</section>
{:else}
	<div class="no-users">
		<p>No users found.</p>
		<p class="hint">Users will appear here once they sign up for your application.</p>
	</div>
{/if}

<Dialog
	open={showDeleteDialog}
	title="Delete User"
	message="You are about to delete user: {userToDelete
		? getDisplayName(userToDelete)
		: 'Unknown User'}. This action cannot be undone."
	type="confirm"
	onConfirm={deleteUser}
	onCancel={cancelDelete}
	confirmLoading={loading} />

<style>
	.users-wrapper {
		display: flex;
		flex-direction: column;
	}

	.user {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-2);
		&:nth-child(even) {
			background: var(--surface-2);
		}
		&:hover {
			background: var(--surface-3);
		}
		&.yourself .username::after {
			content: ' (You)';
			color: var(--blue-5);
			font-size: smaller;
			font-weight: bold;
		}

		&.admin .avatar-wrap::before {
			content: '🜲';
			color: var(--brand);
			position: absolute;
			top: -14px;
			left: 50%;
			font-size: x-large;
			transform: translateX(-50%);
		}

		.avatar-wrap {
			display: flex;
			position: relative;

			.avatar,
			.placeholder-image {
				aspect-ratio: 1;
				object-fit: cover;
				width: 32px;
				height: 32px;
				border-radius: var(--radius-round);
				flex-shrink: 0;
				z-index: 1;
			}

			.placeholder-image {
				display: flex;
				align-items: center;
				justify-content: center;
				background: var(--gray-3);
				color: var(--gray-9);
			}
		}

		.user-info {
			display: flex;
			flex-direction: column;
			flex: 1;
			gap: var(--size-1);

			.username {
				font-weight: 500;
			}

			.user-id {
				color: var(--text-2);
				font-size: x-small;
			}
		}

		.user-actions {
			display: flex;
			align-items: center;
			gap: var(--size-2);
			flex-shrink: 0;

			.admin-toggle-form {
				display: flex;
				align-items: center;
			}
		}
	}

	.admin-label {
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		gap: var(--size-1);
		font-size: small;
		color: var(--text-2);
		cursor: pointer;

		select {
			cursor: pointer;
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			background: var(--surface-1);
			color: var(--text-1);
			appearance: base-select;
			padding: var(--size-2);
			&:disabled {
				cursor: not-allowed;
				opacity: 0.5;
			}
			&:focus {
				outline: 2px solid var(--blue-7);
				outline-offset: 1px;
			}
			&::picker(select) {
				appearance: base-select;
				background: var(--surface-1);
				border: var(--border-size-1) solid var(--surface-3);
				border-radius: var(--radius-2);
			}
			option {
				padding: var(--size-2);
			}
		}
	}

	.no-users {
		text-align: center;
		padding: var(--size-6);
		color: var(--text-1);

		.hint {
			margin-top: var(--size-2);
			color: var(--text-2);
		}
	}
</style>

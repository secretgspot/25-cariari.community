<script>
	import { invalidateAll } from '$app/navigation';
	import AddNoticeForm from './AddNoticeForm.svelte';
	import { Button, LinkButton } from '$lib/buttons';
	import { timeFrom, timeFromLong } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';
	import Icon from '$lib/Icon.svelte';

	let { data } = $props();

	let showForm = $state(false);
	let searchTerm = $state('');

	const filteredNotices = $derived.by(() => {
		if (!searchTerm) {
			return data.notices;
		}

		const lowerCaseSearchTerm = searchTerm.toLowerCase();
		return data.notices.filter(
			(notice) =>
				notice.title.toLowerCase().includes(lowerCaseSearchTerm) ||
				notice.description.toLowerCase().includes(lowerCaseSearchTerm),
		);
	});

	function toggleForm() {
		showForm = !showForm;
	}

	async function handleNoticeAdded(notice) {
		showForm = false; // Hide form after successful submission

		addToast({
			message: `Notice added successfully!`,
			type: 'success',
			timeout: 1200,
		});

		// Refresh the data from the server
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Notices - Cariari Community</title>
	<meta
		name="description"
		content="View community notices and announcements for Cariari." />
</svelte:head>

<div class="notices-container">
	<h1>Community Notices</h1>

	<nav class="options">
		<Button onclick={toggleForm} shadow sound_pattern="click">
			{#snippet icon()}
				{#if showForm}
					<Icon kind="folder_open" size="21" />
				{:else}
					<Icon kind="folder_closed" size="21" />
				{/if}
			{/snippet}
			{showForm ? 'Hide Form' : 'Add New Notice'}
		</Button>

		<div class="search-input">
			<Icon kind="search" size="16" />
			<input
				type="search"
				name="filter"
				class="form-input filter"
				placeholder="Filter"
				autocomplete="off"
				bind:value={searchTerm} />
		</div>
	</nav>

	{#if showForm}
		<AddNoticeForm onNoticeAdded={handleNoticeAdded} />
	{/if}

	<div class="notices-list">
		{#if filteredNotices && filteredNotices.length > 0}
			{#each filteredNotices as notice}
				<LinkButton
					href={`/notices/${notice.id}`}
					underline={false}
					sound_pattern="swipe"
					class="notice-card-link">
					<div class="notice-card">
						<header class="header-wrap">
							<div class="title-wrap">
								<div class="posted">
									Posted: {timeFromLong(notice.created_at)}
								</div>
								<h3 class="title">
									<span class="urgency {notice.urgency.toLowerCase()}"></span>
									{notice.title}
								</h3>
							</div>
							<div class="details-wrap">
								{#if notice.start_date}
									<span class="time-starts">
										<Icon kind="start" size="9" />
										{timeFrom(notice.start_date)}
									</span>
								{/if}
								{#if notice.end_date}
									<span class="time-expires">
										<Icon kind="end" size="9" />
										{timeFrom(notice.end_date)}
									</span>
								{/if}
							</div>
						</header>
						<div class="description">
							{@html truncateText(stripMarkdown(notice.description), 300)}
						</div>
					</div>
				</LinkButton>
			{/each}
		{:else}
			<p class="no-records">No notices were found.</p>
		{/if}
	</div>
</div>

<style>
	.notices-container {
		position: relative;
		h1 {
			margin-bottom: var(--size-6);
		}

		nav.options {
			display: flex;
			justify-content: space-between;
		}

		.no-records {
			text-align: center;
			margin-block: var(--size-10);
		}
	}

	.notices-list {
		margin-block: var(--size-6);
		display: grid;
		gap: var(--size-3);

		:global(a.notice-card-link) {
			padding: var(--size-3);
			text-decoration: none;
			color: inherit;
			display: block;
			width: 100%;
			margin-bottom: var(--size-4);
			border-radius: var(--radius-2);
			position: relative;
			transition: transform var(--transition) ease;
			white-space: normal;
			box-shadow: 0px 2px 0px 1px var(--surface-4);
			&:hover,
			&:active {
				box-shadow: 0px 0px 0px 1px var(--surface-4);
				transform: translateY(2px);
			}

			.header-wrap {
				display: flex;
				flex-direction: column;
				gap: var(--size-3);

				.title-wrap {
					display: flex;
					flex-direction: column;
					gap: var(--size-1);

					.posted {
						color: var(--text-2);
						border-bottom: var(--border-size-1) solid var(--surface-3);
						padding-bottom: var(--size-1);
						font-size: small;
						align-self: end;
					}

					.title {
						margin: 0;
						display: flex;
						align-items: center;
						gap: var(--size-3);
						color: var(--text-1);
					}
				}

				.details-wrap {
					display: flex;
					justify-content: space-between;
					color: var(--text-2);

					.time-starts,
					.time-expires {
						display: flex;
						align-items: center;
						gap: var(--size-1);
						font-size: smaller;
					}
				}
			}

			.description {
				color: var(--text-2);
			}

			.urgency {
				display: inline-block;
				width: 21px;
				height: 21px;
				aspect-ratio: 1;
				border-radius: var(--radius-round);
				&.default {
					background: var(--stone-6);
				}
				&.low {
					background: var(--yellow-6);
				}
				&.medium {
					background: var(--orange-6);
				}
				&.high {
					background: var(--red-6);
				}
			}
		}
	}
</style>

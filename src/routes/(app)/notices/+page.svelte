<script>
	import { invalidateAll } from '$app/navigation';
	import AddNoticeForm from './AddNoticeForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';

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

<div class="notices-container">
	<h1>Community Notices</h1>

	<nav class="options">
		<Button onclick={toggleForm}>
			{#snippet icon()}
				<svg
					width="21"
					height="21"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 716 716">
					{#if showForm}
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-width="50"
							d="M93 158.2h322m0 0h82.93c87.659 0 131.485 0 159.976 25.623a99.36 99.36 0 0 1 7.47 7.472C691 219.783 691 263.612 691 351.27v73.33c0 125.581 0 188.375-39.014 227.386C612.975 691 550.181 691 424.6 691H291.4c-125.582 0-188.373 0-227.387-39.014C25 612.975 25 550.181 25 424.6V189.827c0-29.389 0-44.083 2.31-56.323C37.474 79.622 79.621 37.476 133.503 27.309 145.744 25 160.438 25 189.827 25c12.876 0 19.314 0 25.501.579a133.204 133.204 0 0 1 72.607 30.074c4.784 3.966 9.336 8.519 18.44 17.624L324.7 91.6c17.933 18.767 61.1 58.36 90.3 66.6ZM217 426h283M367 574V291" />
					{:else}
						<path
							stroke="currentColor"
							stroke-width="50"
							d="M25 189.83c0-29.4 0-44.09 2.3-56.33A133.2 133.2 0 0 1 133.5 27.3c12.24-2.3 26.94-2.3 56.33-2.3 12.87 0 19.31 0 25.5.58a133.2 133.2 0 0 1 72.6 30.07c4.79 3.97 9.34 8.52 18.44 17.63L324.7 91.6c27.17 27.17 40.75 40.75 57.01 49.8 8.94 4.97 18.42 8.9 28.25 11.7 17.9 5.1 37.1 5.1 75.53 5.1h12.44c87.66 0 131.48 0 159.98 25.62a99.36 99.36 0 0 1 7.47 7.47C691 219.8 691 263.62 691 351.27v73.33c0 125.58 0 188.38-39.01 227.39C612.98 691 550.19 691 424.6 691H291.4c-125.58 0-188.37 0-227.39-39.01C25 612.98 25 550.19 25 424.6V189.83ZM217 400h283M367 548V265" />
					{/if}
				</svg>
			{/snippet}
			{showForm ? 'Hide Form' : 'Add New Notice'}
		</Button>

		<input
			type="search"
			name="filter"
			class="form-input"
			placeholder="Filter"
			autocomplete="off"
			bind:value={searchTerm} />
	</nav>

	{#if showForm}
		<AddNoticeForm onNoticeAdded={handleNoticeAdded} />
	{/if}

	<div class="notices-list">
		{#if filteredNotices && filteredNotices.length > 0}
			{#each filteredNotices as notice}
				<a href="/notices/{notice.id}" class="notice-card-link">
					<div class="notice-card">
						<header class="notice-header">
							<div class="title-wrap">
								<h3>
									<span class="urgency {notice.urgency.toLowerCase()}"></span>
									{notice.title}
								</h3>
								<p class="notice-date">
									Posted: {timeFrom(notice.created_at)}
								</p>
							</div>
							<div class="details-wrap">
								{#if notice.start_date}
									<span class="time-starts">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 320 320">
											<path
												fill="#000"
												d="M103.06 144A14.96 14.96 0 0 0 88 158.9a15.04 15.04 0 0 0 14.94 15.1l.13-30Zm175.79 26.74a15 15 0 0 0 .09-21.2L183.9 53.45a15 15 0 0 0-21.22-.14 15 15 0 0 0-.09 21.21l84.48 85.4-85.21 84.3a15 15 0 0 0-.1 21.22 15 15 0 0 0 21.22.13l95.87-94.84ZM103 159l-.06 15 165.28 1.07.07-15 .06-15L103.06 144l-.06 15Z" />
											<path
												stroke="#000"
												stroke-linecap="round"
												stroke-width="30"
												d="M54 65v192" />
										</svg>
										{timeFrom(notice.start_date)}
									</span>
								{/if}
								{#if notice.end_date}
									<span class="time-expires">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 320 320">
											<path
												fill="#000"
												d="M50.06 144A14.96 14.96 0 0 0 35 158.9 15.04 15.04 0 0 0 49.94 174l.12-30Zm175.79 26.74a15 15 0 0 0 .09-21.2L130.9 53.45a15 15 0 0 0-21.22-.14 15 15 0 0 0-.09 21.21l84.48 85.4-85.21 84.3a15 15 0 0 0-.1 21.22 15 15 0 0 0 21.22.13l95.87-94.84ZM50 159l-.06 15 165.28 1.07.07-15 .06-15L50.06 144 50 159Z" />
											<path
												stroke="#000"
												stroke-linecap="round"
												stroke-width="30"
												d="M265 64v192" />
										</svg>
										{timeFrom(notice.end_date)}
									</span>
								{/if}
							</div>
						</header>
						<p>
							{@html formatText(truncateText(stripMarkdown(notice.description), 200))}
						</p>
					</div>
				</a>
			{/each}
		{:else}
			<p class="no-records">No notices match your search.</p>
		{/if}
	</div>
</div>

<style>
	.notices-container {
		h1 {
			margin-bottom: var(--size-3);
		}

		nav.options {
			display: flex;
			justify-content: space-between;

			input[type='search'] {
				max-width: 150px;
				box-shadow: var(--shadow-1);
			}
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
	}

	.notice-card {
		border: var(--border-size-1) solid var(--gray-1);
		border-radius: var(--radius-2);
		padding: var(--size-3);

		.notice-header {
			display: flex;
			justify-content: space-between;
		}

		h3 {
			margin: 0;
			display: flex;
			align-items: center;
			gap: var(--size-3);
		}

		.urgency {
			display: inline-block;
			width: 21px;
			height: 21px;
			aspect-ratio: 1;
			border-radius: var(--radius-round);
			&.default {
				background: var(--stone-3);
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

		.time-starts,
		.time-expires {
			display: flex;
			align-items: center;
			gap: var(--size-1);
			font-size: smaller;
			svg {
				width: 12px;
				height: 12px;
			}
		}

		p {
			margin-bottom: 0.5em;
			color: #555;
			line-height: 1.2;
			overflow: hidden;
			display: -webkit-box;
			box-orient: vertical;
			line-clamp: 12;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 12;
			max-height: calc(var(--size-3) * 15);
			text-overflow: ellipsis;
		}
	}

	.notice-image {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-2);
		margin-bottom: var(--size-6);
	}

	.notice-date {
		font-size: 0.9em;
		color: var(--stone-9);
		margin-bottom: var(--size-3);
		border-bottom: var(--border-size-1) solid var(--gray-1);
		padding-bottom: var(--size-1);
	}

	.notice-card-link {
		text-decoration: none;
		color: inherit;
		display: block;

		&:hover .notice-card {
			box-shadow: 0 2px var(--stone-9);
			transform: translateY(-3px);
		}
	}
</style>

<script>
	import { invalidateAll } from '$app/navigation';
	import AddNoticeForm from './AddNoticeForm.svelte';
	import { Button } from '$lib/buttons';
	import { timeFrom } from '$lib/utils/time.js';
	import { formatText, stripMarkdown, truncateText } from '$lib/utils/markdown.js';
	import { addToast } from '$lib/toasts';

	let { data } = $props();

	let showForm = $state(false);

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

	<Button onclick={toggleForm}>
		{#snippet icon()}
			➕
		{/snippet}
		{showForm ? 'Hide Form' : 'Add New Notice'}
	</Button>

	{#if showForm}
		<AddNoticeForm onNoticeAdded={handleNoticeAdded} />
	{/if}

	<div class="notices-list">
		{#if data.notices && data.notices.length > 0}
			{#each data.notices as notice}
				<a href="/notices/{notice.id}" class="notice-card-link">
					<div class="notice-card">
						<header class="notice-header">
							<div class="title-wrap">
								<h3>
									<span class="urgency {notice.urgency.toLowerCase()}"></span>
									{notice.title}
								</h3>
								<p class="notice-date">
									Posted: {new Date(notice.created_at).toLocaleDateString()}
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
						{#if notice.image_url}
							<img src={notice.image_url} alt={notice.title} class="notice-image" />
						{/if}
						<p>
							{@html formatText(truncateText(stripMarkdown(notice.description), 200))}
						</p>
					</div>
				</a>
			{/each}
		{:else}
			<p>No notices available yet.</p>
		{/if}
	</div>
</div>

<style>
	.notices-container {
		h1 {
			color: var(--stone-11);
			margin-bottom: var(--size-3);
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

<!-- Simplified Notices Component (Database handles timezone) -->
<script>
	import { LinkButton } from '$lib/buttons';
	import { getExpirationDate, timeFrom } from '$lib/utils/time.js';
	import ExpirationIndicator from '$lib/ExpirationIndicator.svelte';

	let { data } = $props();

	// Helper to get standardized expiration date
	function getNoticeEndDate(notice) {
		return notice.end_date || getExpirationDate(notice.created_at, 30);
	}

	// Check if notice is expired
	function isNoticeExpiredSimple(notice) {
		const now = new Date();
		const endDate = getNoticeEndDate(notice);
		return now > new Date(endDate);
	}
</script>

<fieldset class="notices-container">
	<legend>
		<span>Latest Notices</span> •
		<LinkButton href="/notices" class="view-all">View all</LinkButton>
	</legend>
	<div class="notices-wrap">
		{#each data as notice}
			{@const endDate = getNoticeEndDate(notice)}
			{@const expired = isNoticeExpiredSimple(notice)}
			<a href={`/notices/${notice.id}`} class:expired>
				<span class="urgency {notice.urgency.toLowerCase()}"></span>
				<strong class="message">{notice.title}</strong>
				<div class="time-wrap">
					{#if notice.start_date}
						<span class="time-starts">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 320 320">
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
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 320 320">
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
				<ExpirationIndicator
					start_date={notice.created_at}
					end_date={endDate}
					updateInterval={30000} />
			</a>
		{/each}
	</div>
</fieldset>

<style>
	.notices-container {
		border-radius: var(--border-size-3);
		border: none;
		padding-inline: 0;
	}

	legend {
		span {
			font-weight: 600;
		}
	}

	.notices-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		margin-block: var(--size-3);

		a {
			position: relative;
			text-decoration: none;
			display: flex;
			flex: 1;
			justify-content: space-between;
			align-items: center;
			padding: var(--size-3);
			gap: var(--size-3);
			border: var(--border-size-1) solid var(--gray-1);
			border-radius: var(--border-size-3);
			color: var(--blue-6);
			&:hover {
				color: var(--blue-9);
				box-shadow: var(--shadow-1);
			}
			&.expired {
				opacity: 0.6;
			}
		}
	}

	.urgency {
		aspect-ratio: 1;
		width: 12px;
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

	.message {
		flex: 1;
		/* white-space: nowrap; */
		/* overflow: hidden; */
		/* text-overflow: ellipsis; */
	}

	.view-all {
		display: inline-block;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}

	.time-starts,
	.time-expires {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		font-size: smaller;
		svg {
			width: 9px;
			height: 9px;
		}
	}
</style>

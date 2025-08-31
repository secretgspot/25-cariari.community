<!-- Simplified Notices Component (Database handles timezone) -->
<script>
	import { LinkButton } from '$lib/buttons';
	import { getExpirationDate, timeFrom } from '$lib/utils/time.js';
	import ExpirationIndicator from '$lib/ExpirationIndicator.svelte';
	import Icon from '$lib/Icon.svelte';

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
			<LinkButton
				href={`/notices/${notice.id}`}
				underline={false}
				sound_pattern="swipe"
				class="notice-card">
				<span class="urgency {notice.urgency.toLowerCase()}"></span>
				<strong class="message">{notice.title}</strong>
				<div class="time-wrap">
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
				<ExpirationIndicator
					start_date={notice.created_at}
					end_date={endDate}
					updateInterval={30000} />
			</LinkButton>
		{/each}
	</div>
</fieldset>

<style>
	.notices-container {
		border-radius: var(--radius-2);
		border: none;
		padding-inline: 0;
	}

	legend {
		span {
			font-weight: 600;
			color: var(--text-2);
		}
	}

	.notices-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		margin-block: var(--size-3);

		:global(a) {
			position: relative;
			text-decoration: none;
			display: flex;
			flex: 1;
			justify-content: space-between;
			align-items: center;
			padding: var(--size-3);
			gap: var(--size-3);
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			color: var(--text-1);
			box-shadow: 0px 2px 0px 0px var(--surface-4);
			white-space: normal;
			&:hover {
				background: var(--surface-2);
			}
			&:active {
				box-shadow: 0px 0px 0px 0px var(--surface-4);
				transform: translateY(2px);
			}
		}
	}

	.urgency {
		aspect-ratio: 1;
		width: 12px;
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

	.message {
		flex: 1;
	}

	.view-all {
		display: inline-block;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
		}
	}

	.time-wrap {
		color: var(--text-2);
	}

	.time-starts,
	.time-expires {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		font-size: smaller;
	}
</style>

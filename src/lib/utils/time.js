export function ago(val) {
	val = 0 | (new Date() - new Date(val)) / 1000;
	var unit, length = {
		sec: 60, min: 60, h: 24, d: 7, w: 4.35,
		m: 12, y: 10000
	}, result;

	for (unit in length) {
		result = val % length[unit];
		if (!(val = 0 | val / length[unit]))
			return result + unit;
	}
}
// ago(new Date('2010-10-11T01:46:25.251Z')); // '8 years'

export function ahead(val) {
	val = 0 | (new Date(val) - new Date()) / 1000;

	// Return empty string or handle negative values (dates in the past)
	if (val <= 0) return '';

	var unit, length = {
		sec: 60, min: 60, h: 24, d: 7, w: 4.35,
		m: 12, y: 10000
	}, result;

	for (unit in length) {
		result = val % length[unit];
		if (!(val = 0 | val / length[unit]))
			return 'in ' + result + unit;
	}
}

// Examples:
// ahead(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)); // 'in 28d'
// ahead(new Date(Date.now() + 3 * 60 * 60 * 1000)); // 'in 3h'
// ahead(new Date(Date.now() + 10 * 60 * 1000)); // 'in 10min'
// ahead(new Date(Date.now() + 5 * 1000)); // 'in 5sec'

/**
 * Universal time difference formatter
 * Handles various date formats including ISO strings, timestamps, Date objects
 * @param {string|number|Date} val - The date to compare against current time
 * @param {Object} options - Configuration options
 * @param {boolean} options.short - Use short format (1d vs 1 day)
 * @param {string} options.locale - Locale for formatting (default: 'en')
 * @param {boolean} options.precise - Show more precise units (seconds vs minutes minimum)
 * @returns {string} Formatted time difference
 */
export function timeFrom(val, options = {}) {
	const {
		short = true,
		locale = 'en',
		precise = false
	} = options;

	// Parse input date - handle various formats
	let targetDate;

	try {
		if (val instanceof Date) {
			targetDate = val;
		} else if (typeof val === 'number') {
			// Handle both seconds and milliseconds timestamps
			targetDate = new Date(val < 10000000000 ? val * 1000 : val);
		} else if (typeof val === 'string') {
			// Handle ISO strings, including timezone offsets
			targetDate = new Date(val);
		} else {
			throw new Error('Invalid date input');
		}

		// Validate the parsed date
		if (isNaN(targetDate.getTime())) {
			throw new Error('Invalid date format');
		}
	} catch (error) {
		console.warn('timeFrom: Invalid date input:', val, error.message);
		return 'Invalid date';
	}

	const now = new Date();
	const diffMs = targetDate.getTime() - now.getTime();
	const diffSeconds = Math.abs(Math.floor(diffMs / 1000));
	const isPast = diffMs < 0;

	// Time units in seconds
	const units = [
		{ key: 'y', seconds: 31536000, short: 'y', long: 'year' },
		{ key: 'm', seconds: 2592000, short: 'mo', long: 'month' }, // 30 days
		{ key: 'w', seconds: 604800, short: 'w', long: 'week' },
		{ key: 'd', seconds: 86400, short: 'd', long: 'day' },
		{ key: 'h', seconds: 3600, short: 'h', long: 'hour' },
		{ key: 'min', seconds: 60, short: 'min', long: 'minute' },
		{ key: 's', seconds: 1, short: 's', long: 'second' }
	];

	// Handle "just now" case
	if (!precise && diffSeconds < 60) {
		return 'just now';
	}

	// Find the appropriate unit
	for (const unit of units) {
		const value = Math.floor(diffSeconds / unit.seconds);
		if (value > 0) {
			const unitText = short ? unit.short : unit.long;
			const pluralSuffix = !short && value !== 1 ? 's' : '';
			const timeText = `${value}${short ? '' : ' '}${unitText}${pluralSuffix}`;

			return isPast ? `${timeText} ago` : `in ${timeText}`;
		}
	}

	// Fallback for edge cases
	return isPast ? 'just now' : 'now';
}

// Additional utility functions for common use cases
export function timeFromShort(val) {
	return timeFrom(val, { short: true });
}

export function timeFromLong(val) {
	return timeFrom(val, { short: false });
}

export function timeFromPrecise(val) {
	return timeFrom(val, { precise: true });
}

// Example usage:
/*
console.log(timeFrom('2025-12-31T16:03:00+00:00')); // "in 5mo"
console.log(timeFrom('2025-12-31 16:03:00+00')); // "in 5mo"
console.log(timeFrom(new Date('2024-01-01'))); // "8mo ago"
console.log(timeFrom(1735660980000)); // timestamp in ms
console.log(timeFrom(1735660980)); // timestamp in seconds
console.log(timeFrom('2025-08-01T10:30:00Z', { short: false })); // "in 9 hours"
console.log(timeFrom('invalid-date')); // "Invalid date"
*/

/**
 * Format date for display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
	return new Date(date).toLocaleDateString();
}

/**
 * Format date and time for display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
	const d = new Date(date);
	return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

/**
 * Calculates the expiration date for an item, based on its creation date and a specified number of days.
 * @param {string|Date} createdAt - The creation date of the item (e.g., post.created_at).
 * @param {number} days - The number of days until the item expires.
 * @returns {Date} The calculated expiration date.
 */
export function getExpirationDate(createdAt, days) {
	const createdDate = new Date(createdAt);
	// Add 'days' in milliseconds: days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds/second
	return new Date(createdDate.getTime() + (days * 24 * 60 * 60 * 1000));
}

/**
 * Checks if an item, based on its creation date and an expiration duration, has already expired.
 * @param {string|Date} createdAt - The creation date of the item.
 * @param {number} expirationDays - The number of days after creation until the item expires.
 * @returns {boolean} - True if the item has expired, false otherwise.
 */
export function isExpired(createdAt, expirationDays) {
	const now = new Date();
	const expirationDate = getExpirationDate(createdAt, expirationDays);

	// Check for invalid date inputs from getExpirationDate
	if (isNaN(expirationDate.getTime())) {
		console.error("Invalid 'createdAt' or 'expirationDays' provided, resulting in an invalid expiration date.");
		return true; // Consider it expired if the date is invalid to prevent indefinite display
	}

	// An item is expired if its expiration date is in the past relative to now
	return expirationDate <= now;
}

// Example Usage (for testing purposes)
/*
// Assume current time is Sunday, August 3, 2025, 8:03:38 PM CST

// Item created 5 days ago, expires after 7 days (should NOT be expired)
const recentItem = "2025-07-29T20:00:00Z"; // August 3 - 5 days = July 29
console.log(`Recent item (created ${recentItem}, 7-day expiration): ${isExpired(recentItem, 7)}`); // Expected: false

// Item created 8 days ago, expires after 7 days (should BE expired)
const oldItem = "2025-07-26T20:00:00Z"; // August 3 - 8 days = July 26
console.log(`Old item (created ${oldItem}, 7-day expiration): ${isExpired(oldItem, 7)}`);     // Expected: true

// Item created right now, expires after 1 day (should NOT be expired)
const newItemNow = new Date().toISOString();
console.log(`New item (created now, 1-day expiration): ${isExpired(newItemNow, 1)}`);     // Expected: false

// Item created 15 days ago, expires after 14 days (should BE expired) - for Lost and Found
const lostAndFoundItem = "2025-07-19T10:00:00Z"; // August 3 - 15 days = July 19
console.log(`Lost and Found (created ${lostAndFoundItem}, 14-day expiration): ${isExpired(lostAndFoundItem, 14)}`); // Expected: true

// Item created 20 days ago, expires after 30 days (should NOT be expired) - for Community Notice
const communityNoticeItem = "2025-07-14T10:00:00Z"; // August 3 - 20 days = July 14
console.log(`Community Notice (created ${communityNoticeItem}, 30-day expiration): ${isExpired(communityNoticeItem, 30)}`); // Expected: false

// Item created 35 days ago, expires after 30 days (should BE expired) - for Community Notice
const oldCommunityNoticeItem = "2025-06-29T10:00:00Z"; // August 3 - 35 days = June 29
console.log(`Old Community Notice (created ${oldCommunityNoticeItem}, 30-day expiration): ${isExpired(oldCommunityNoticeItem, 30)}`); // Expected: true
*/
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

export function timeFrom(val) {
	const diff = (new Date(val) - new Date()) / 1000;
	let val_abs = Math.abs(0 | diff);
	const isPast = diff < 0;

	var unit, length = {
		sec: 60, min: 60, h: 24, d: 7, w: 4.35,
		m: 12, y: 10000
	}, result;

	for (unit in length) {
		result = val_abs % length[unit];
		if (!(val_abs = 0 | val_abs / length[unit])) {
			return isPast ? result + unit + ' ago' : 'in ' + result + unit;
		}
	}
}

// Examples:
// Past dates:
// timeFrom(new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)); // '28d ago'
// timeFrom(new Date(Date.now() - 3 * 60 * 60 * 1000)); // '3h ago'
// timeFrom(new Date(Date.now() - 10 * 60 * 1000)); // '10min ago'
// timeFrom(new Date(Date.now() - 5 * 1000)); // '5sec ago'

// Future dates:
// timeFrom(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)); // 'in 28d'
// timeFrom(new Date(Date.now() + 3 * 60 * 60 * 1000)); // 'in 3h'
// timeFrom(new Date(Date.now() + 10 * 60 * 1000)); // 'in 10min'
// timeFrom(new Date(Date.now() + 5 * 1000)); // 'in 5sec'

// Current time:
// timeFrom(new Date()); // '0sec ago' (or very close to current time)

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
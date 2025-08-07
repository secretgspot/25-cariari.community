// vibrate.js
import { get } from 'svelte/store';

/**
 * Vibration API helper utilities for consistent haptic feedback across components
 * playground: https://svelte.dev/playground/51ad9d1ecf35449eb716cde2c153cb6d?version=5.36.17
 */

/**
 * Trigger device vibration if supported
 * @param {number|number[]} pattern - Vibration pattern (single duration or array of on/off durations)
 * @param {boolean} forceEnabled - Override store check (for testing purposes)
 * @returns {boolean} - Returns true if vibration was triggered, false if not supported
 */
export function vibrate(pattern, forceEnabled = false) {
	// Allow bypassing store check for testing/preview purposes
	if (!forceEnabled) {
		// Note: This would need to be made more flexible to work with different stores
		// For now, we'll always allow vibration in the components and let them handle the store logic
	}

	// Check if the Vibration API is supported by the browser
	if ("vibrate" in navigator) {
		// console.log("Vibration API is supported on this device.");
		navigator.vibrate(pattern);
		return true;
	} else {
		console.log("Vibration API is NOT supported on this device/browser.");
		return false;
	}
}

/**
 * Check if vibration is supported on current device/browser
 * @returns {boolean} - True if vibration API is available
 */
export function isVibrationSupported() {
	return "vibrate" in navigator;
}

/**
 * Stop any ongoing vibration
 */
export function stopVibration() {
	if ("vibrate" in navigator) {
		navigator.vibrate(0);
	}
}

/**
 * Predefined vibration patterns for different UI feedback types
 * Patterns follow mobile UX best practices:
 * - Basic: Subtle for frequent interactions
 * - Success: Gentle, confirmatory feeling
 * - Fail: Attention-grabbing but not annoying
 */
export const vibratePatterns = {
	// Quick, subtle feedback for basic interactions
	basic: 20,

	// Success patterns - gentle, positive feeling
	successA: [50, 30, 100], // Quick buzz, pause, longer buzz
	successB: [40, 20, 40, 20, 80], // Two quick, then longer
	successC: 80, // Single medium buzz

	// Fail patterns - more abrupt, attention-grabbing
	failA: [100, 50, 100, 50, 100], // Three equal buzzes
	failB: [200, 100, 200], // Two strong buzzes
	failC: [50, 30, 50, 30, 150], // Quick-quick-long pattern

	// Additional useful patterns
	notification: [100, 50, 100], // Two medium buzzes
	warning: [150, 100, 150, 100, 150], // Three strong buzzes
	tick: 10, // Very subtle tick for selections
	longPress: 30, // Medium buzz for long press feedback
	swipe: [20, 10, 20], // Quick double tap for swipe actions
};

/**
 * Create a custom vibration pattern
 * @param {...number} durations - Alternating vibrate/pause durations in milliseconds
 * @returns {number[]} - Vibration pattern array
 */
export function createPattern(...durations) {
	return durations;
}
import { settings } from '$lib/settings/settings.js';
import { get } from 'svelte/store';

/**
 * Vibration API helper utilities for consistent haptic feedback across components
 * playground: https://svelte.dev/playground/51ad9d1ecf35449eb716cde2c153cb6d?version=5.36.17
 */

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
	tick: 10,
	click: 30,
	longPress: 30,
	swipe: [20, 10, 20],
	navigate: 60,

	// Success pattern
	success: [40, 20, 40, 20, 80], // Two quick, then longer

	// Fail pattern
	fail: [90, 10, 60], // Two strong buzzes

	// Additional useful patterns
	notification: [100, 50, 100], // Two medium buzzes
	warning: [150, 100, 150, 100, 150], // Three strong buzzes
};

/**
 * Trigger device vibration if supported
 * @param {string} patternName - The name of the vibration pattern to trigger.
 * @param {boolean} isNotification - True if this is a notification vibration, to check notification_buzz setting.
 */
export function triggerVibration(patternName, isNotification = false) {
    const currentSettings = get(settings);

    if (isNotification) {
        if (!currentSettings.notification_buzz) return;
    } else if (patternName === currentSettings.button_vibration_pattern) {
        if (!currentSettings.button_buzz) return;
    } else if (patternName === currentSettings.navigation_vibration_pattern) {
        if (!currentSettings.navigation_buzz) return;
    }

    const pattern = vibratePatterns[patternName];

    if ("vibrate" in navigator && pattern) {
        navigator.vibrate(pattern);
    } else if (!pattern) {
        console.warn(`Vibration pattern '${patternName}' not found.`);
    }
}

/**
 * Triggers a button click vibration.
 */
export function vibrateButton() {
	triggerVibration(get(settings).button_vibration_pattern);
}

/**
 * Triggers a navigation vibration.
 */
export function vibrateNavigation() {
	triggerVibration(get(settings).navigation_vibration_pattern);
}

/**
 * Triggers a notification vibration.
 * @param {'success'|'fail'|'notification'} type - The type of notification.
 */
export function vibrateNotification(type = 'notification') {
	const currentSettings = get(settings);
	let patternName;
	if (type === 'success') {
		patternName = currentSettings.notification_success_vibration_pattern;
	} else if (type === 'fail') {
		patternName = currentSettings.notification_error_vibration_pattern;
	} else {
		patternName = currentSettings.notification_vibration_pattern;
	}
	triggerVibration(patternName, true);
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
 * Create a custom vibration pattern
 * @param {...number} durations - Alternating vibrate/pause durations in milliseconds
 * @returns {number[]} - Vibration pattern array
 */
export function createPattern(...durations) {
	return durations;
}
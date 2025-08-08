import { writable, get } from 'svelte/store';
import { settings } from '$lib/settings/settings.js';
import { playChimeSequence } from '$lib/utils/audio.js';
import { vibrate } from '$lib/utils/vibrate.js';

// Create the writable store for toasts
export const toasts = writable([]);

// Counter for unique IDs
let idCounter = 0;

/**
 * Add a new toast notification
 * @param {Object} toast - Toast configuration object
 * @param {string} toast.message - The message to display
 * @param {string} [toast.type='info'] - Toast type: 'success', 'error', 'info'
 * @param {boolean} [toast.dismissible=false] - Whether to show dismiss button
 * @param {number} [toast.timeout=1200] - Auto-dismiss timeout in ms (0 = no auto-dismiss)
 */
export const addToast = (toast) => {
	const id = `toast_${Date.now()}_${++idCounter}`;

	const defaults = {
		id,
		type: 'info',
		dismissible: false,
		timeout: 1200,
	};

	const newToast = { ...defaults, ...toast };

	// Add toast to the store
	toasts.update(currentToasts => [newToast, ...currentToasts]);

	// Get the latest settings
	const currentSettings = get(settings);

	// Only play sounds if the master switch is on
	if (currentSettings.notification_sound) {
		const playSound = (patternKey) => {
			const pattern = currentSettings.audio_patterns[patternKey];
			if (pattern) {
				playChimeSequence(pattern);
			}
		};

		switch (newToast.type) {
			case 'success':
				playSound(currentSettings.notification_success_sound_pattern);
				break;
			case 'error':
				playSound(currentSettings.notification_error_sound_pattern);
				break;
			default:
				playSound(currentSettings.notification_sound_pattern);
				break;
		}
	}

	// Only play vibration if the master switch is on
	if (currentSettings.notification_buzz) {
		const playVibration = (patternKey) => {
			const pattern = currentSettings.vibration_patterns[patternKey];
			if (pattern) {
				vibrate(pattern);
			}
		};

		switch (newToast.type) {
			case 'success':
				playVibration(currentSettings.notification_success_vibration_pattern);
				break;
			case 'error':
				playVibration(currentSettings.notification_error_vibration_pattern);
				break;
			default:
				playVibration(currentSettings.notification_vibration_pattern);
				break;
		}
	}

	// Auto-dismiss after timeout
	if (newToast.timeout) {
		setTimeout(() => dismissToast(id), newToast.timeout);
	}

	return id; // Return ID in case caller needs it
};

/**
 * Dismiss a specific toast by ID
 * @param {string} id - The toast ID to dismiss
 */
export const dismissToast = (id) => {
	toasts.update(currentToasts => currentToasts.filter(t => t.id !== id));
};

/**
 * Clear all active toasts
 */
export const clearAllToasts = () => {
	toasts.set([]);
};

/**
 * Convenience methods for common toast types
 */
export const showSuccess = (message, options = {}) => {
	return addToast({ message, type: 'success', ...options });
};

export const showError = (message, options = {}) => {
	return addToast({ message, type: 'error', ...options });
};

export const showInfo = (message, options = {}) => {
	return addToast({ message, type: 'info', ...options });
};
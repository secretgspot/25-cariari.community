// $lib/settings/settings.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { chimePatterns as defaultChimePatterns } from '$lib/utils/audio.js';
import { vibratePatterns as defaultVibratePatterns } from '$lib/utils/vibrate.js';

/**
 * Default settings configuration
 */
const DEFAULT_SETTINGS = {
	// Audio Effects
	button_sounds: true,
	navigation_sound: true,
	notification_sound: true,
	notification_error_sound: true,
	notification_success_sound: true,

	// Vibration Effects
	button_buzz: true,
	navigation_buzz: true,
	notification_buzz: true,
	notification_error_buzz: true,
	notification_success_buzz: true,

	// Audio Patterns
	audio_patterns: defaultChimePatterns,
	button_sound_pattern: 'click',
	navigation_sound_pattern: 'navigate',
	notification_sound_pattern: 'notification',
	notification_error_sound_pattern: 'failB',
	notification_success_sound_pattern: 'successA',

	// Vibration Patterns
	vibration_patterns: defaultVibratePatterns,
	button_vibration_pattern: 'click',
	navigation_vibration_pattern: 'navigate',
	notification_vibration_pattern: 'notification',
	notification_error_vibration_pattern: 'failB',
	notification_success_vibration_pattern: 'successB',
};

/**
 * Load settings from localStorage or use defaults
 */
function loadSettings() {
	if (!browser) return DEFAULT_SETTINGS;

	try {
		const storedSettings = localStorage.getItem('app_settings');
		if (storedSettings) {
			const parsed = JSON.parse(storedSettings);
			// Merge stored settings with defaults to ensure all keys are present
			return { ...DEFAULT_SETTINGS, ...parsed };
		}
	} catch (error) {
		console.warn('Failed to load settings from localStorage:', error);
	}

	return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
function saveState(state) {
	if (!browser) return;

	try {
		localStorage.setItem('app_settings', JSON.stringify(state));
	} catch (error) {
		console.error('Failed to save state to localStorage:', error);
	}
}

const initialSettings = loadSettings();

// The store itself is the main export for components to use
export const settings = writable(initialSettings);

// Subscribe to changes and save to localStorage
if (browser) {
	settings.subscribe(saveState);
}

/**
 * Resets all settings to their default values.
 */
export function resetSettings() {
	settings.set(DEFAULT_SETTINGS);
}

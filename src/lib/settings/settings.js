// $lib/settings/settings.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Default settings configuration
 */
const DEFAULT_SETTINGS = {
	// Audio Effects
	button_sounds: true,
	navigation_sound: true,
	notification_sound: true,

	// Vibration Effects
	button_buzz: true,
	navigation_buzz: true,

	// Audio Patterns (could be extended to save custom user patterns)
	button_sound_pattern: 'basic',
	navigation_sound_pattern: 'notification',
	notification_sound_pattern: 'notification',

	// Vibration Patterns
	button_vibration_pattern: 'basic',
	navigation_vibration_pattern: 'tick',
};

/**
 * Load settings from localStorage or use defaults
 */
function loadSettings() {
	if (!browser) return DEFAULT_SETTINGS;

	try {
		const stored = localStorage.getItem('app_settings');
		if (stored) {
			const parsed = JSON.parse(stored);
			// Merge with defaults to handle new settings added in updates
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
function saveSettings(settings) {
	if (!browser) return;

	try {
		localStorage.setItem('app_settings', JSON.stringify(settings));
	} catch (error) {
		console.error('Failed to save settings to localStorage:', error);
	}
}

// Create the main settings store
const settingsStore = writable(loadSettings());

// Subscribe to changes and save to localStorage
if (browser) {
	settingsStore.subscribe(saveSettings);
}

/**
 * Main settings object with helper methods
 */
export const settings = {
	// Subscribe method for reactive usage
	subscribe: settingsStore.subscribe,

	// Get current settings value
	get: () => {
		let value;
		settingsStore.subscribe(v => value = v)();
		return value;
	},

	// Update a single setting
	set: (key, value) => {
		settingsStore.update(current => ({
			...current,
			[key]: value
		}));
	},

	// Update multiple settings at once
	update: (updates) => {
		settingsStore.update(current => ({
			...current,
			...updates
		}));
	},

	// Reset to defaults
	reset: () => {
		settingsStore.set(DEFAULT_SETTINGS);
	},

	// Reset a specific setting to default
	resetKey: (key) => {
		if (key in DEFAULT_SETTINGS) {
			settings.set(key, DEFAULT_SETTINGS[key]);
		}
	}
};

// Derived stores for individual settings (for easier reactivity in components)
export const audioSettings = derived(settingsStore, $settings => ({
	button_sounds: $settings.button_sounds,
	navigation_sound: $settings.navigation_sound,
	notification_sound: $settings.notification_sound,
	button_sound_pattern: $settings.button_sound_pattern,
	navigation_sound_pattern: $settings.navigation_sound_pattern,
	notification_sound_pattern: $settings.notification_sound_pattern,
}));

export const vibrationSettings = derived(settingsStore, $settings => ({
	button_buzz: $settings.button_buzz,
	navigation_buzz: $settings.navigation_buzz,
	button_vibration_pattern: $settings.button_vibration_pattern,
	navigation_vibration_pattern: $settings.navigation_vibration_pattern,
}));

// Individual setting getters (for convenience)
export const getSetting = (key) => {
	const current = settings.get();
	return current[key];
};

// Reactive individual settings (if you prefer this approach)
export const button_sounds = derived(settingsStore, $settings => $settings.button_sounds);
export const button_buzz = derived(settingsStore, $settings => $settings.button_buzz);
export const navigation_sound = derived(settingsStore, $settings => $settings.navigation_sound);
export const navigation_buzz = derived(settingsStore, $settings => $settings.navigation_buzz);
export const notification_sound = derived(settingsStore, $settings => $settings.notification_sound);
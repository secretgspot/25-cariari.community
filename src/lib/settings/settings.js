// $lib/settings/settings.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { chimePatterns } from '$lib/utils/audio.js';
import { vibratePatterns } from '$lib/utils/vibrate.js';

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
	if (!browser) return { settings: DEFAULT_SETTINGS, audio: chimePatterns, vibration: vibratePatterns };

	try {
		const storedSettings = localStorage.getItem('app_settings');
		const storedAudio = localStorage.getItem('app_audio_patterns');
		const storedVibration = localStorage.getItem('app_vibration_patterns');

		const settings = storedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) } : DEFAULT_SETTINGS;
		const audio = storedAudio ? JSON.parse(storedAudio) : chimePatterns;
		const vibration = storedVibration ? JSON.parse(storedVibration) : vibratePatterns;

		return { settings, audio, vibration };
	} catch (error) {
		console.warn('Failed to load settings from localStorage:', error);
	}

	return { settings: DEFAULT_SETTINGS, audio: chimePatterns, vibration: vibratePatterns };
}

/**
 * Save settings to localStorage
 */
function saveState(state) {
	if (!browser) return;

	try {
		localStorage.setItem('app_settings', JSON.stringify(state.settings));
		localStorage.setItem('app_audio_patterns', JSON.stringify(state.audio));
		localStorage.setItem('app_vibration_patterns', JSON.stringify(state.vibration));
	} catch (error) {
		console.error('Failed to save state to localStorage:', error);
	}
}

// Create the main stores
const { settings: initialSettings, audio: initialAudio, vibration: initialVibration } = loadSettings();

const settingsStore = writable(initialSettings);
export const audioPatterns = writable(initialAudio);
export const vibrationPatterns = writable(initialVibration);

// Combined state for saving
const combinedState = derived(
	[settingsStore, audioPatterns, vibrationPatterns],
	([$settings, $audio, $vibration]) => ({
		settings: $settings,
		audio: $audio,
		vibration: $vibration,
	})
);

if (browser) {
	combinedState.subscribe(saveState);
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
		audioPatterns.set(chimePatterns);
		vibrationPatterns.set(vibratePatterns);
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

export default settings;

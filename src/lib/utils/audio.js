import { settings } from '$lib/settings/settings.js';
import { get } from 'svelte/store';

// Global audio context - created lazily to avoid autoplay restrictions
let audioContext = null;

/**
 * Initialize audio context (called automatically when needed)
 * @returns {AudioContext|null} - Audio context or null if not supported
 */
function getAudioContext() {
	if (!audioContext) {
		try {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
		} catch (error) {
			console.log("Web Audio API is not supported on this device/browser.");
			return null;
		}
	}

	// Resume context if suspended (required for user interaction)
	if (audioContext.state === 'suspended') {
		audioContext.resume();
	}

	return audioContext;
}

/**
 * Generate a simple tone/chime
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in milliseconds
 * @param {number} volume - Volume (0-1)
 * @param {string} waveType - Wave type: 'sine', 'square', 'sawtooth', 'triangle'
 * @returns {Promise<boolean>} - Returns true if chime was played, false if not supported
 */
export async function playChime(frequency = 800, duration = 200, volume = 0.3, waveType = 'sine') {
	const currentSettings = get(settings);
	if (!currentSettings.button_sounds) return;
	const ctx = getAudioContext();
	if (!ctx) return false;

	try {
		// Create oscillator for the tone
		const oscillator = ctx.createOscillator();
		const gainNode = ctx.createGain();

		// Configure oscillator
		oscillator.type = waveType;
		oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

		// Configure volume envelope (attack, decay, sustain, release)
		gainNode.gain.setValueAtTime(0, ctx.currentTime);
		gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01); // Quick attack
		gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, ctx.currentTime + duration / 1000 * 0.7); // Sustain
		gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000); // Release

		// Connect audio nodes
		oscillator.connect(gainNode);
		gainNode.connect(ctx.destination);

		// Play the tone
		oscillator.start(ctx.currentTime);
		oscillator.stop(ctx.currentTime + duration / 1000);

		return true;
	} catch (error) {
		console.error("Error playing chime:", error);
		return false;
	}
}

/**
 * Play a sequence of chimes
 * @param {Array} sequence - Array of {frequency, duration, delay, volume, waveType} objects
 * @returns {Promise<boolean>} - Returns true if sequence was started
 */
export async function playChimeSequence(sequence) {
	const currentSettings = get(settings);
	if (!currentSettings.button_sounds) return;
	const ctx = getAudioContext();
	if (!ctx) return false;

	const notes = Array.isArray(sequence) ? sequence : [sequence];

	for (const note of notes) {
		const {
			frequency = 800,
			duration = 200,
			delay = 0,
			volume = 0.3,
			waveType = 'sine'
		} = note;

		setTimeout(() => {
			playChime(frequency, duration, volume, waveType);
		}, delay);
	}

	return true;
}

/**
 * Plays a sound based on the given pattern name and checks if sounds are enabled in settings.
 * @param {string} patternName - The name of the audio pattern to play (e.g., 'click', 'navigate', 'success').
 * @param {boolean} isNotification - True if this is a notification sound, to check notification_sound setting.
 */
export function playSound(pattern) {
	if (!pattern) {
		console.warn(`Audio pattern not found.`);
		return;
	}
	if (Array.isArray(pattern)) {
		playChimeSequence(pattern);
	} else {
		playChime(pattern.frequency, pattern.duration, pattern.volume, pattern.waveType);
	}
}

/**
 * Plays a button click sound.
 */
export function playButtonSound() {
	const currentSettings = get(settings);
	if (!currentSettings.button_sounds) return;
	const pattern = chimePatterns[currentSettings.button_sound_pattern];
	playSound(pattern);
}

/**
 * Plays a navigation sound.
 */
export function playNavigationSound() {
	const currentSettings = get(settings);
	if (!currentSettings.navigation_sound) return;
	const pattern = chimePatterns[currentSettings.navigation_sound_pattern];
	playSound(pattern);
}

/**
 * Plays a notification sound.
 * @param {'success'|'fail'|'notification'} type - The type of notification.
 */
export function playNotificationSound(type = 'notification') {
	const currentSettings = get(settings);
	if (!currentSettings.notification_sound) return;
	let patternName;
	if (type === 'success') {
		patternName = currentSettings.notification_success_sound_pattern;
	} else if (type === 'fail') {
		patternName = currentSettings.notification_error_sound_pattern;
	} else {
		patternName = currentSettings.notification_sound_pattern;
	}
	const pattern = chimePatterns[patternName];
	playSound(pattern);
}

/**
 * Check if Web Audio API is supported
 * @returns {boolean} - True if audio API is available
 */
export function isAudioSupported() {
	return !!(window.AudioContext || window.webkitAudioContext);
}

/**
 * Predefined chime patterns for different UI feedback types
 * Frequencies chosen to be pleasant and distinguishable
 */
export const chimePatterns = {
	// Basic interaction - single pleasant tone
	basic: { frequency: 900, duration: 100, volume: 0.1 },
	tick: { frequency: 90, duration: 60, volume: 0.1 },
	click: { frequency: 60, duration: 60, volume: 0.1, waveType: 'triangle' },
	longPress: { frequency: 400, duration: 150, volume: 0.2 },
	swipe: [
		{ frequency: 30, duration: 300, delay: 0, volume: 0.03 },
		{ frequency: 9, duration: 600, delay: 30, volume: 0.03 }
	],
	navigate: [
		{ frequency: 60, duration: 200, delay: 0, volume: 0.1 },
		{ frequency: 30, duration: 300, delay: 0, volume: 0.1 }
	],
	bell: { frequency: 30, duration: 800, volume: 0.2, waveType: 'triangle' },

	// Success pattern
	success: [
		{ frequency: 120, duration: 100, delay: 0, volume: 0.1, waveType: 'sine' },
		{ frequency: 180, duration: 100, delay: 90, volume: 0.2, waveType: 'sine' },
		{ frequency: 360, duration: 100, delay: 30, volume: 0.1, waveType: 'sine' }
	],

	// Fail pattern
	fail: [
		{ frequency: 90, duration: 100, delay: 0, volume: 0.1, waveType: 'square' },
		{ frequency: 60, duration: 200, delay: 90, volume: 0.1, waveType: 'square' }
	],

	// Additional useful patterns
	notification: [
		{ frequency: 120, duration: 60, delay: 0, volume: 0.1 },
		{ frequency: 180, duration: 90, delay: 90, volume: 0.1 }
	],
	logout: [
		{ frequency: 120, duration: 150, delay: 0, volume: 0.3 },
		{ frequency: 60, duration: 150, delay: 90, volume: 0.3 },
		{ frequency: 30, duration: 200, delay: 120, volume: 0.3 }
	],
};
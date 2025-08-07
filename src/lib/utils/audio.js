import { get } from 'svelte/store';

/**
 * Audio chime utilities for consistent audio feedback across components
 * Uses Web Audio API to generate synthetic chimes and tones
 * playground: https://svelte.dev/playground/8a6890077f664c05ae4eaa90838f91ef?version=5.36.17
 */

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

	// Success patterns - ascending, positive tones
	successA: [
		{ frequency: 110, duration: 300, delay: 0, volume: 0.06, waveType: 'sine' },
		{ frequency: 100, duration: 200, delay: 30, volume: 0.1, waveType: 'sine' },
		{ frequency: 90, duration: 100, delay: 60, volume: 0.03, waveType: 'sine' }
	],
	successB: [
		{ frequency: 369, duration: 120, delay: 0, volume: 0.25 },
		{ frequency: 963, duration: 180, delay: 90, volume: 0.3 }
	],
	successC: { frequency: 666, duration: 300, volume: 0.25 },

	// infoChord, deepDrone

	// Fail patterns - descending, attention-getting tones
	failA: [
		{ frequency: 120, duration: 150, delay: 0, volume: 0.3 },
		{ frequency: 60, duration: 150, delay: 90, volume: 0.3 },
		{ frequency: 30, duration: 200, delay: 120, volume: 0.3 }
	],
	failB: [
		{ frequency: 100, duration: 200, delay: 0, volume: 0.30, waveType: 'square' },
		{ frequency: 50, duration: 300, delay: 150, volume: 0.30, waveType: 'square' }
	],
	failC: { frequency: 60, duration: 300, volume: 0.3, waveType: 'sawtooth' },

	// Additional useful patterns
	notification: [
		{ frequency: 300, duration: 100, delay: 0, volume: 0.25 },
		{ frequency: 600, duration: 100, delay: 150, volume: 0.25 }
	],
	warning: [
		{ frequency: 600, duration: 80, delay: 0, volume: 0.3 },
		{ frequency: 600, duration: 80, delay: 120, volume: 0.3 },
		{ frequency: 600, duration: 120, delay: 240, volume: 0.35 }
	],
	tick: { frequency: 30, duration: 90, volume: 0.11 },
	longPress: { frequency: 400, duration: 150, volume: 0.2 },
	swipe: [
		{ frequency: 30, duration: 300, delay: 0, volume: 0.03 },
		{ frequency: 9, duration: 600, delay: 30, volume: 0.03 }
	],
	bell: { frequency: 30, duration: 800, volume: 0.2, waveType: 'triangle' },
	click: { frequency: 1500, duration: 30, volume: 0.15 }
};

/**
 * Play a musical chord (multiple frequencies simultaneously)
 * @param {number[]} frequencies - Array of frequencies to play together
 * @param {number} duration - Duration in milliseconds
 * @param {number} volume - Volume (0-1)
 * @param {string} waveType - Wave type for all oscillators
 */
export async function playChord(frequencies, duration = 500, volume = 0.2, waveType = 'sine') {
	const ctx = getAudioContext();
	if (!ctx) return false;

	const promises = frequencies.map(freq =>
		playChime(freq, duration, volume / frequencies.length, waveType)
	);

	return Promise.all(promises);
}

/**
 * Common chord patterns
 */
export const chords = {
	major: [523, 659, 784], // C major
	minor: [523, 622, 784], // C minor
	success: [523, 659, 784, 1047], // C major with octave
	error: [30, 40, 50], // Dissonant low frequencies

	// Inversions for different textures
	royal_bass: [130, 329, 392, 523], // C major with low bass - regal and powerful
	crystal: [523, 659, 784, 1047, 1319], // C major high register - bright and crystalline
	velour: [110, 220, 277, 330], // A minor low register - deep and plush
};


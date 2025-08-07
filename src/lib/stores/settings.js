// src/lib/stores/settings.js
import { persistent } from './persistent';

export const button_sounds = persistent('settings_button_sounds', true);
export const button_buzz = persistent('settings_button_buzz', true);
export const navigation_sound = persistent('settings_navigation_sound', true);
export const navigation_buzz = persistent('settings_navigation_buzz', true);
export const notification_sound = persistent('settings_notification_sound', true);

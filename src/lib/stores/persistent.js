import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const persistent = (key, initialValue) => {
    const storedValue = browser ? localStorage.getItem(key) : null;
    const value = storedValue ? JSON.parse(storedValue) : initialValue;
    const store = writable(value);

    if (browser) {
        store.subscribe(($value) => {
            localStorage.setItem(key, JSON.stringify($value));
        });
    }

    return store;
};

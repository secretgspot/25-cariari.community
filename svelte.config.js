import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: { adapter: adapter() },
	preprocess: [],
	extensions: ['.svelte'],
	// vitePlugin: {
	// 	inspector: {
	// 		showToggleButton: 'always',
	// 		toggleButtonPos: 'bottom-right'
	// 	}
	// }
};

export default config;

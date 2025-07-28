import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: { adapter: adapter() },
	preprocess: [mdsvex({
		extensions: ['.svx'],
		layout: {
			_: './src/lib/layouts/mdsvex.svelte'
		}
	})],
	extensions: ['.svelte', '.svx']
};

export default config;

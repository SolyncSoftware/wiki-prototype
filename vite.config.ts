import adapter from '@sveltejs/adapter-bun';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { mdsvexPreprocessor } from './mdsvex.config.js';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			extensions: ['.svelte', '.md'],
			preprocess: [vitePreprocess(), mdsvexPreprocessor],
			adapter: adapter()
		})
	],
	server: {
		// Posting a comment writes JSON here; watching it would full-reload the dev page
		watch: { ignored: ['**/static/comments/**'] }
	}
});

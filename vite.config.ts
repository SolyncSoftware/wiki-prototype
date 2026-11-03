import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		// Posting a comment writes JSON here; watching it would full-reload the dev page
		watch: { ignored: ['**/static/comments/**'] }
	}
});

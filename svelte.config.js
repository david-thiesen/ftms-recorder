import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import config from './src/app.html';

/** @type {import('@sveltejs/kit').Config} */
const svelteConfig = {
	preprocess: preprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html' // create SPA fallback
		}),
		// if serving from https://<user>.github.io/<repo>/ set base:
		paths: {
			base: '/ftms-recorder'
		},
		prerender: {
			default: true
		}
	}
};

export default svelteConfig;

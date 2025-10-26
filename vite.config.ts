import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	plugins: [sveltekit(), basicSsl(), tailwindcss()],
	server: {
		https: true,
		host: true,
		port: 5173
	}
});

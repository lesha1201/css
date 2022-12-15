import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import MasterCSSVitePlugin from '@master/css.vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        MasterCSSVitePlugin({ debug: true }),
    ]
})

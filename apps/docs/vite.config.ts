import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const pkg = (p: string) => fileURLToPath(new URL('../../packages/delish-button/src/' + p, import.meta.url))

// Point at the package source so edits hot-reload in the docs.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^delish-button\/styles\.css$/, replacement: pkg('styles.css') },
      { find: /^delish-button$/, replacement: pkg('index.ts') },
    ],
  },
})

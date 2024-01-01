import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Or for other frameworks:
// import { svelte } from "@sveltejs/vite-plugin-svelte";
// etc.
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import nodePolyfills from "rollup-plugin-node-polyfills";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      events: "rollup-plugin-node-polyfills/polyfills/events",
      assert: "assert",
      crypto: "crypto-browserify",
      util: "util",
      'near-api-js': 'near-api-js/dist/near-api-js.js',
    },
  },
  define: {
    'process.env': process.env,
    global: {},
  },
  build: {
    target: "esnext",
    rollupOptions: {
      plugins: [nodePolyfills({ crypto: true })],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api-mainnet.magiceden.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
});

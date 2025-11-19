import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],

          // Markdown and syntax highlighting
          'markdown': [
            'react-markdown',
            'remark-gfm',
            'remark-math',
            'rehype-katex'
          ],

          // KaTeX (large math library)
          'katex': ['katex'],
        },
      },
    },
    // Increase chunk size warning limit to 600kb (since we're splitting)
    chunkSizeWarningLimit: 600,
  },
});

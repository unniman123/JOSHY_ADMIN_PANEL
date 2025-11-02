import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate TipTap extensions into their own chunk to avoid import issues
          tiptap: ['@tiptap/react', '@tiptap/starter-kit'],
          'tiptap-extensions': [
            '@tiptap/extension-text-style',
            '@tiptap/extension-color',
            '@tiptap/extension-font-family',
            '@tiptap/extension-image',
            '@tiptap/extension-link'
          ]
        }
      }
    },
    // Increase chunk size warning limit for TipTap
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-text-style',
      '@tiptap/extension-color',
      '@tiptap/extension-font-family',
      '@tiptap/extension-image',
      '@tiptap/extension-link'
    ]
  }
}));

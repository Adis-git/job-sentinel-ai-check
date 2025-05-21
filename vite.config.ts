
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        contentScript: resolve(__dirname, "src/chromeExtension/contentScript.ts"),
        background: resolve(__dirname, "src/chromeExtension/background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'contentScript' || chunkInfo.name === 'background' 
            ? '[name].js' 
            : 'assets/js/[name]-[hash].js';
        },
      },
    },
    outDir: "dist",
  }
}));

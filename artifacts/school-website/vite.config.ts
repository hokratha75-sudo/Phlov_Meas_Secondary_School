import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Port — default 3000 for local dev.
// On Replit the PORT env var was required; here we fall back gracefully.
// ---------------------------------------------------------------------------
const port = Number(process.env.PORT ?? process.env.VITE_PORT ?? "3000");

// BASE_PATH — default "/" for local dev (no sub-path hosting).
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // Replit-specific plugins (runtime error modal, cartographer, dev banner)
    // are intentionally omitted here; they are no-ops outside Replit and
    // caused install failures on Windows.
  ],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
      "@assets": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(path.dirname(fileURLToPath(import.meta.url))),
  build: {
    outDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false, // allow imports from outside root (attached_assets)
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

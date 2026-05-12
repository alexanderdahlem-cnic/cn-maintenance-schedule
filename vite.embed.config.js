import { defineConfig } from "vite";

/**
 * Produces dist/maintenance-embed.js (IIFE): one classic script + inlined CSS for embedding
 * on third-party origins where cross-origin ES modules are blocked by CORS.
 *
 * Optional: VITE_ASSET_BASE_URL=https://alexanderdahlem-cnic.github.io/cn-maintenance-schedule npm run build:embed
 * bakes a default public-asset origin for logos (overridable at runtime via window.__MAINTENANCE_PUBLIC_BASE__).
 */
export default defineConfig({
  root: ".",
  publicDir: false,
  define: {
    "import.meta.env.VITE_ASSET_BASE_URL": JSON.stringify(
      process.env.VITE_ASSET_BASE_URL?.trim() ?? "",
    ),
  },
  build: {
    emptyOutDir: false,
    outDir: "dist",
    lib: {
      entry: "src/embed.js",
      name: "MaintenanceEmbed",
      formats: ["iife"],
      fileName: () => "maintenance-embed.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

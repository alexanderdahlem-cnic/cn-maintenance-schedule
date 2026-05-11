import { defineConfig } from "vite";

/**
 * Local dev: `/`. CI (GitHub Pages): `./` so JS/CSS and `public/` assets resolve next to
 * `index.html` — fixes 404 + wrong MIME on Pages preview URLs and project pages.
 * Override with `VITE_BASE=/my-repo/` if you need absolute subpaths only.
 */
function viteBase() {
  const v = process.env.VITE_BASE;
  if (!v || v === "/") return "/";
  if (v === "." || v === "./") return "./";
  const s = v.startsWith("/") ? v : `/${v}`;
  return s.endsWith("/") ? s : `${s}/`;
}

export default defineConfig({
  base: viteBase(),
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

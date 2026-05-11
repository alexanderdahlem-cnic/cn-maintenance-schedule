import { defineConfig } from "vite";

/** GitHub project pages need base `/<repo>/`; `*.github.io` repos use `/`. CI sets `VITE_BASE`. */
function viteBase() {
  const v = process.env.VITE_BASE;
  if (!v || v === "/") return "/";
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

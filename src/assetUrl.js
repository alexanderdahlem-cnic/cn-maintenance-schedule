/**
 * Resolve `/public`-style paths: same-origin via BASE_URL, or absolute origin when
 * embedded (window.__MAINTENANCE_PUBLIC_BASE__ / VITE_ASSET_BASE_URL).
 */

/**
 * @param {string} path config path like "/assets/logos/default.svg"
 * @returns {string}
 */
export function resolvePublicUrl(path) {
  const p = String(path || "").trim();
  if (!p.startsWith("/")) {
    return p;
  }
  const rest = p.slice(1);

  // Embed on another host: logos must load from the real static origin (e.g. GitHub Pages).
  const runtimeBase =
    typeof window !== "undefined" && window.__MAINTENANCE_PUBLIC_BASE__;
  const envAssetBase =
    typeof import.meta.env.VITE_ASSET_BASE_URL === "string"
      ? import.meta.env.VITE_ASSET_BASE_URL.trim()
      : "";
  const absoluteBase =
    (runtimeBase && String(runtimeBase).trim()) || envAssetBase;
  if (absoluteBase) {
    const baseStr = String(absoluteBase).trim().replace(/\/+$/, "");
    return `${baseStr}/${rest}`;
  }

  const base = import.meta.env.BASE_URL ?? "/";
  if (base === "/" || base === "") {
    return `/${rest}`;
  }
  if (base === "./") {
    return `./${rest}`;
  }
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}${rest}`;
}

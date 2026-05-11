/**
 * Prefix absolute public paths with Vite's import.meta.env.BASE_URL so logos work
 * under GitHub Pages project paths or relative deployments (base "./").
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
  const base = import.meta.env.BASE_URL ?? "/";
  const rest = p.slice(1);
  if (base === "/" || base === "") {
    return `/${rest}`;
  }
  if (base === "./") {
    return `./${rest}`;
  }
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}${rest}`;
}

/**
 * Core runtime: resolve config for current hostname and render into a container.
 * Used by index entry (with bundled CSS) and by the cross-origin embed bundle.
 */

import { getConfig } from "./config.js";
import { renderMaintenancePage } from "./renderMaintenancePage.js";

/**
 * @param {HTMLElement} container target mount node (e.g. #app)
 */
export function mountMaintenanceApp(container) {
  const hostname = window.location.hostname;
  const config = getConfig(hostname);

  const lang = config.language && String(config.language).trim();
  if (lang) {
    document.documentElement.lang = lang;
  }

  if (config.title != null && String(config.title).trim()) {
    document.title = String(config.title).trim();
  }

  const brand = config.brandColor && String(config.brandColor).trim();
  if (brand) {
    document.documentElement.style.setProperty("--brand-color", brand);
  }

  container.replaceChildren(renderMaintenancePage(config));
}

/**
 * Core runtime: resolve config for current hostname and render into a container.
 * Used by index entry (with bundled CSS) and by the cross-origin embed bundle.
 */

import { CONFIG, getConfig, resolveConfigKey } from "./config.js";
import {
  createDomainPreviewBar,
  isDomainPreviewEnabled,
  mountDomainPreviewBar,
} from "./domainPreview.js";
import { renderMaintenancePage } from "./renderMaintenancePage.js";

/**
 * @param {object} config resolved page config
 */
function applyPageConfig(config) {
  const lang = config.language && String(config.language).trim();
  if (lang) {
    document.documentElement.lang = lang;
  } else {
    document.documentElement.removeAttribute("lang");
  }

  const pageTitle = config.title != null ? String(config.title).trim() : "";
  const brandName = config.name != null ? String(config.name).trim() : "";
  if (pageTitle) {
    document.title = pageTitle;
  } else if (brandName) {
    document.title = brandName;
  } else {
    document.title = "Maintenance";
  }

  const brand = config.brandColor && String(config.brandColor).trim();
  const fallback = CONFIG.default.brandColor && String(CONFIG.default.brandColor).trim();
  const brandResolved = brand || fallback || "#334155";
  document.documentElement.style.setProperty("--brand-color", brandResolved);

  const button =
    config.buttonColor != null ? String(config.buttonColor).trim() : "";
  document.documentElement.style.setProperty(
    "--button-color",
    button || brandResolved,
  );

  const appearance = config.appearance && String(config.appearance).trim().toLowerCase();
  if (appearance === "light" || appearance === "dark") {
    document.documentElement.dataset.appearance = appearance;
  } else {
    delete document.documentElement.dataset.appearance;
  }
}

/**
 * @param {HTMLElement} container target mount node (e.g. #app)
 * @param {string} hostname hostname or CONFIG key to resolve (preview simulates via suffix match)
 */
export function renderMaintenanceForHostname(container, hostname) {
  const config = getConfig(hostname);
  applyPageConfig(config);
  container.replaceChildren(renderMaintenancePage(config));
}

/**
 * @param {HTMLElement} container target mount node (e.g. #app)
 */
export function mountMaintenanceApp(container) {
  let activeHostname = window.location.hostname;
  const matchedKey = resolveConfigKey(activeHostname);
  const initialPreviewValue = matchedKey ?? activeHostname;

  function rerender() {
    renderMaintenanceForHostname(container, activeHostname);
  }

  if (isDomainPreviewEnabled()) {
    mountDomainPreviewBar(container, initialPreviewValue, (hostname) => {
      activeHostname = hostname;
      rerender();
    });
  }

  rerender();
}

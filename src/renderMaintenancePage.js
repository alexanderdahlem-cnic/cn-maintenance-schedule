/**
 * Hydrate the maintenance layout from maintenance.template.html (bundled as raw markup)
 * and a resolved config object. Prefer editing the HTML template for structure / static text.
 */

import maintenanceMarkup from "./maintenance.template.html?raw";

/**
 * @param {object} config merged config from getConfig()
 * @returns {HTMLElement} root wrapper node
 */
export function renderMaintenancePage(config) {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(
    maintenanceMarkup.trim(),
    "text/html",
  );
  const tplRoot = parsed.querySelector(".maintenance");
  if (!tplRoot) {
    throw new Error("maintenance.template.html: missing .maintenance root");
  }

  const wrapper = document.importNode(tplRoot, true);

  const logoWrap = wrapper.querySelector('[data-slot="logo-wrap"]');
  const logoSrc = config.logo != null ? String(config.logo).trim() : "";
  if (logoWrap) {
    if (logoSrc) {
      const img = document.createElement("img");
      img.className = "maintenance__logo";
      img.src = logoSrc;
      img.alt = "";
      img.width = 160;
      img.height = 48;
      img.decoding = "async";
      logoWrap.appendChild(img);
    } else {
      logoWrap.remove();
    }
  }

  const titleEl = wrapper.querySelector('[data-slot="title"]');
  const titleText = config.title != null ? String(config.title).trim() : "";
  if (titleEl) {
    if (titleText) {
      titleEl.textContent = titleText;
    } else {
      titleEl.remove();
    }
  }

  const textEl = wrapper.querySelector('[data-slot="text"]');
  const bodyText = config.text != null ? String(config.text).trim() : "";
  if (textEl) {
    if (bodyText) {
      textEl.textContent = bodyText;
    } else {
      textEl.remove();
    }
  }

  const actionsEl = wrapper.querySelector('[data-slot="actions"]');
  const supportUrl =
    config.supportUrl != null ? String(config.supportUrl).trim() : "";
  if (actionsEl) {
    if (supportUrl) {
      const a = document.createElement("a");
      a.className = "maintenance__link";
      a.href = supportUrl;
      a.rel = "noopener noreferrer";
      a.textContent = "Status & updates";
      actionsEl.appendChild(a);
    } else {
      actionsEl.remove();
    }
  }

  return wrapper;
}

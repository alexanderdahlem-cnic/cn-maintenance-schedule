/**
 * Domain preview bar: simulate CONFIG for any configured hostname without /etc/hosts.
 * Enabled in Vite dev or with ?domainPreview=1 (use ?domainPreview=0 to hide in dev).
 */

import { listPreviewHostnames } from "./config.js";

const PREVIEW_QUERY = "domainPreview";

/**
 * @returns {boolean}
 */
export function isDomainPreviewEnabled() {
  if (typeof window === "undefined") {
    return false;
  }
  const q = new URLSearchParams(window.location.search);
  if (q.has(PREVIEW_QUERY)) {
    return q.get(PREVIEW_QUERY) !== "0";
  }
  return import.meta.env.DEV;
}

const ACTUAL_HOST_VALUE = "";

/**
 * @param {string} initialHostname
 * @param {(hostname: string) => void} onSelect
 * @returns {HTMLElement}
 */
export function createDomainPreviewBar(initialHostname, onSelect) {
  const bar = document.createElement("div");
  bar.className = "domain-preview";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Domain preview");

  const label = document.createElement("label");
  label.className = "domain-preview__label";
  label.htmlFor = "domain-preview-select";
  label.textContent = "Preview domain";

  const select = document.createElement("select");
  select.id = "domain-preview-select";
  select.className = "domain-preview__select";

  const actual = document.createElement("option");
  actual.value = ACTUAL_HOST_VALUE;
  actual.textContent = `Current host (${window.location.hostname})`;
  select.appendChild(actual);

  for (const key of listPreviewHostnames()) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    select.appendChild(opt);
  }

  const matched = listPreviewHostnames().includes(initialHostname)
    ? initialHostname
    : ACTUAL_HOST_VALUE;
  select.value = matched;

  select.addEventListener("change", () => {
    const value = select.value;
    onSelect(value === ACTUAL_HOST_VALUE ? window.location.hostname : value);
  });

  bar.append(label, select);
  return bar;
}

/**
 * @param {HTMLElement} mountContainer e.g. #app
 * @param {string} initialHostname
 * @param {(hostname: string) => void} onSelect
 */
export function mountDomainPreviewBar(mountContainer, initialHostname, onSelect) {
  const bar = createDomainPreviewBar(initialHostname, onSelect);
  const parent = mountContainer.parentElement ?? document.body;
  parent.insertBefore(bar, mountContainer);
  document.body.classList.add("has-domain-preview");
}

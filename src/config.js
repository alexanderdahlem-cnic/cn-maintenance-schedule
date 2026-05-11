/**
 * Hostname-keyed branding for the maintenance page.
 * Keys use exact hostnames (no protocol, no port). "www." is normalized in getConfig().
 */

const EXAMPLE_EN = {
  logo: "/assets/logos/example.svg",
  title: "We'll be back shortly",
  text: "Our services are temporarily unavailable while we perform scheduled maintenance.",
  supportUrl: "https://status.example.com",
  brandColor: "#0055ff",
  language: "en",
};

const EXAMPLE_DE = {
  logo: "/assets/logos/example-de.svg",
  title: "Wir sind gleich wieder da",
  text:
    "Unsere Dienste sind vorübergehend nicht verfügbar. Wir führen derzeit Wartungsarbeiten durch.",
  supportUrl: "https://status.example.com/de",
  brandColor: "#0d9488",
  language: "de",
};

/** @type {Record<string, typeof EXAMPLE_EN>} */
export const CONFIG = {
  default: {
    logo: "/assets/logos/default.svg",
    title: "We'll be back soon",
    text: "This site is temporarily unavailable. Please try again in a few minutes.",
    supportUrl: "",
    brandColor: "#334155",
    language: "en",
  },

  // Example production-style hosts (replace with your real domains in deployment).
  "example.com": EXAMPLE_EN,
  "example.de": EXAMPLE_DE,

  // Local testing via /etc/hosts (see README).
  "example.test": EXAMPLE_EN,
  "example-de.test": EXAMPLE_DE,
};

/**
 * Normalize hostname for lookup: strip leading "www." once.
 * @param {string} hostname
 * @returns {string}
 */
function normalizeHostname(hostname) {
  const h = String(hostname || "").trim().toLowerCase();
  if (h.startsWith("www.")) {
    return h.slice(4);
  }
  return h;
}

/**
 * Resolve config for the current host. Exact match after optional www. strip; else default.
 * @param {string} hostname from window.location.hostname
 * @returns {typeof CONFIG.default}
 */
export function getConfig(hostname) {
  const key = normalizeHostname(hostname);
  const entry = CONFIG[key];
  if (entry && typeof entry === "object") {
    return { ...CONFIG.default, ...entry };
  }
  return { ...CONFIG.default };
}

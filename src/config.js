/**
 * Hostname-keyed branding for the maintenance page.
 * Keys are DNS suffixes (no protocol, no port). Any subdomain prefix is ignored: the
 * longest matching CONFIG key wins (e.g. pixeldemon.lima-city.de → lima-city.de).
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

/** Test / demo: applies to lima-city.de and any subdomain (e.g. user123.lima-city.de). */
const LIMA_CITY = {
  logo: "/assets/logos/lima-city-logo.svg",
  title: "Wartungsmodus (Test)",
  text: "Diese Demo-Konfiguration ist für lima-city.de hinterlegt. Inhalt nur zu Testzwecken.",
  supportUrl: "https://www.lima-city.de",
  brandColor: "#1a56a8",
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

  // Test branding for Lima-City and all its subdomains.
  "lima-city.de": LIMA_CITY,
};

const DEFAULT_KEY = "default";

/**
 * Longest-suffix-first hostnames to try against CONFIG (minimum two labels, except single-label hosts).
 * foo.bar.example.com → ["foo.bar.example.com", "bar.example.com", "example.com"]
 * @param {string} hostname from window.location.hostname
 * @returns {string[]}
 */
function hostnameSuffixCandidates(hostname) {
  const h = String(hostname || "").trim().toLowerCase();
  const parts = h.split(".").filter(Boolean);
  if (parts.length === 0) {
    return [];
  }
  if (parts.length === 1) {
    return [parts[0]];
  }
  const out = [];
  for (let i = 0; i <= parts.length - 2; i++) {
    out.push(parts.slice(i).join("."));
  }
  return out;
}

/**
 * Resolve config: first CONFIG key that matches a suffix of the hostname (longest match wins), else default.
 * @param {string} hostname from window.location.hostname
 * @returns {typeof CONFIG.default}
 */
export function getConfig(hostname) {
  for (const key of hostnameSuffixCandidates(hostname)) {
    if (key === DEFAULT_KEY) {
      continue;
    }
    const entry = CONFIG[key];
    if (entry && typeof entry === "object") {
      return { ...CONFIG.default, ...entry };
    }
  }
  return { ...CONFIG.default };
}

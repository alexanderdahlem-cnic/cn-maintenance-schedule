/**
 * Hostname-keyed branding for the maintenance page.
 * Keys are DNS suffixes (no protocol, no port). Any subdomain prefix is ignored: the
 * longest matching CONFIG key wins (e.g. pixeldemon.lima-city.de → lima-city.de).
 *
 * Optional **maintenanceWindowsUtc**: weekly slots in UTC. `weekdayUtc` uses the same
 * numbering as `Date.getUTCDay()` — **0 = Sunday … 6 = Saturday**. `start` / `end` are
 * `"HH:mm"` on that UTC calendar day; `end` must be after `start`. No overnight window
 * in one entry — split at midnight into two entries (see README).
 */

/** @typedef {{ weekdayUtc: number, start: string, end: string }} MaintenanceWindowUtc */

const EXAMPLE_EN = {
  logo: "/assets/logos/example.svg",
  title: "We'll be back shortly",
  text: "Our services are temporarily unavailable while we perform scheduled maintenance.",
  supportUrl: "https://status.example.com",
  brandColor: "#0055ff",
  language: "en",
  serverLabel: "Example (demo)",
  maintenanceWindowsUtc: [{ weekdayUtc: 4, start: "11:20", end: "11:40" }],
};

const EXAMPLE_DE = {
  logo: "/assets/logos/example-de.svg",
  title: "Wir sind gleich wieder da",
  text:
    "Unsere Dienste sind vorübergehend nicht verfügbar. Wir führen derzeit Wartungsarbeiten durch.",
  supportUrl: "https://status.example.com/de",
  brandColor: "#0d9488",
  language: "de",
  serverLabel: "Beispiel (Demo)",
  maintenanceWindowsUtc: [{ weekdayUtc: 4, start: "11:20", end: "11:40" }],
};

/** Test / demo: applies to lima-city.de and any subdomain (e.g. user123.lima-city.de). */
const LIMA_CITY = {
  logo: "/assets/logos/lima-city-logo.svg",
  title: "Wartungsmodus (Test)",
  text: "Diese Demo-Konfiguration ist für lima-city.de hinterlegt. Inhalt nur zu Testzwecken.",
  brandColor: "#1a56a8",
  serverLabel: "Lima-City (Test)",
  maintenanceWindowsUtc: [{ weekdayUtc: 4, start: "11:20", end: "11:40" }],
};

/** @type {Record<string, object>} */
export const CONFIG = {
  default: {
    logo: "/assets/logos/default.svg",
    title: "We'll be back soon",
    text: "This site is temporarily unavailable. Please try again in a few minutes.",
    supportUrl: "",
    brandColor: "#334155",
    language: "en",
    maintenanceWindowsUtc: [],
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

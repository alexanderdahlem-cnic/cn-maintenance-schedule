/**
 * Hostname-keyed branding for the maintenance page.
 * Keys are DNS suffixes (no protocol, no port). Any subdomain prefix is ignored: the
 * longest matching CONFIG key wins (e.g. kb.example.com → example.com).
 *
 * Domains set **`serverId`** to pull **`maintenanceWindowsUtc`** and other shared fields from
 * [`servers.js`](./servers.js). Merge order: `default` → server → domain.
 *
 * Per-domain fields: **`name`** (visible under logo), optional **`logo`**, **`brandColor`**,
 * **`language`**, **`appearance`** (`"light"` | `"dark"`). Omit **`logo`** / **`brandColor`** to use
 * defaults. Omit **`title`** / **`text`** to use default copy. Branding fetch report:
 * `scripts/fetch-branding-report.json`.
 */

import { SERVERS } from "./servers.js";

/**
 * @param {object} opts
 * @param {string} opts.serverId
 * @param {string} opts.name
 * @param {string} [opts.logo]
 * @param {string} [opts.brandColor]
 * @param {string} [opts.language]
 * @param {"light" | "dark"} [opts.appearance]
 * @param {string} [opts.supportUrl]
 * @param {string} [opts.buttonColor]
 */
function domain(opts) {
  const entry = {
    serverId: opts.serverId,
    name: opts.name,
  };
  if (opts.logo) entry.logo = opts.logo;
  if (opts.brandColor) entry.brandColor = opts.brandColor;
  if (opts.buttonColor) entry.buttonColor = opts.buttonColor;
  if (opts.language) entry.language = opts.language;
  if (opts.appearance) entry.appearance = opts.appearance;
  if (opts.supportUrl) entry.supportUrl = opts.supportUrl;
  return entry;
}

/** @type {Record<string, object>} */
export const CONFIG = {
  default: {
    logo: "/assets/logos/default.svg",
    title: "Maintenance Notice",
    text:
      "This service is undergoing scheduled maintenance. Planned windows are listed below (UTC and your local time). Access will be restored when the maintenance window ends.",
    supportUrl: "",
    brandColor: "#334155",
    language: "en",
    maintenanceWindowsUtc: [],
  },

  // Production (gweb-prod-*); see scripts/fetch-branding-report.json for fetch status
  "brandshelter.com": domain({
    serverId: "gweb-prod-brandshelter-01",
    name: "BrandShelter",
    logo: "/assets/logos/brandshelter-com.svg",
    appearance: "light",
    supportUrl: "https://www.brandshelter.com/contact/",
    buttonColor: "#28cda0",
  }),
  "centralnicregistry.com": domain({
    serverId: "gweb-prod-centralnicregistry-01",
    name: "CentralNic Registry",
    logo: "/assets/logos/centralnicregistry-com.svg",
    appearance: "light",
    supportUrl: "https://centralnicregistry.com/contact/",
    buttonColor: "#00a3e0",
  }),
  "centralnicreseller.com": domain({
    serverId: "gweb-prod-centralnicreseller-01",
    name: "CentralNic Reseller",
    logo: "/assets/logos/centralnicreseller-com.svg",
    appearance: "light",
    supportUrl: "https://www.centralnicreseller.com/contact/",
    buttonColor: "#003865",
  }),
  "kb.centralnicreseller.com": domain({
    serverId: "gweb-prod-centralnicreseller-01",
    name: "CentralNic Reseller",
    logo: "/assets/logos/kb-centralnicreseller-com.svg",
    appearance: "dark",
    supportUrl: "https://centralnicreseller.com/en/contact",
    buttonColor: "#003865",
  }),
  "upload.teaminternet.com": domain({
    serverId: "gweb-prod-pii-01",
    name: "Team Internet",
    logo: "/assets/logos/teaminternet-com-dark.svg",
    appearance: "light",
    supportUrl: "https://teaminternet.com/contact/",
    buttonColor: "#01153c",
  }),
  "voluum.com": domain({
    serverId: "gweb-prod-safebrands-01",
    name: "Voluum",
    logo: "/assets/logos/voluum-com.svg",
    brandColor: "#0f0045",
    appearance: "light",
    supportUrl: "https://voluum.com/contact/",
    buttonColor: "#7c3aed",
  }),
  "safebrands.fr": domain({
    serverId: "gweb-prod-safebrands-01",
    name: "BrandShelter",
    logo: "/assets/logos/brandshelter-com.svg",
    language: "fr",
    appearance: "light",
    supportUrl: "https://www.brandshelter.com/fr/contact",
    buttonColor: "#28cda0",
  }),
  "teaminternet.com": domain({
    serverId: "gweb-prod-teaminternet-01",
    name: "Team Internet",
    logo: "/assets/logos/teaminternet-com-dark.svg",
    appearance: "light",
    supportUrl: "https://teaminternet.com/contact/",
    buttonColor: "#01153c",
  }),
  "dot.saarland": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "dot Saarland",
    logo: "/assets/logos/nic-saarland.svg",
    appearance: "light",
    supportUrl: "https://nic.saarland/de/kontakt",
    buttonColor: "#00843d",
  }),
  "nic.saarland": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "nic Saarland",
    logo: "/assets/logos/nic-saarland.svg",
    appearance: "light",
    supportUrl: "https://nic.saarland/de/kontakt",
    buttonColor: "#00843d",
  }),
  "dotbrandsolutions.com": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "dot Brand Solutions",
    logo: "/assets/logos/dotbrandsolutions-com.svg",
    appearance: "light",
    supportUrl: "https://www.brandshelter.com/contact/",
    buttonColor: "#28cda0",
  }),
  "blog.moniker.com": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "Moniker",
    logo: "/assets/logos/blog-moniker-com.svg",
    appearance: "dark",
    supportUrl: "https://www.moniker.com/contact",
    buttonColor: "#ffb62b",
  }),
  "registry.co": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "Registry.co",
    logo: "/assets/logos/registry-co.svg",
    appearance: "light",
    supportUrl: "https://support.registry.co/",
    buttonColor: "#33879e",
  }),
  "register.bh": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "register.bh",
    logo: "/assets/logos/register-bh.png",
    brandColor: "#7fbc03",
    appearance: "light",
    supportUrl: "https://register.bh/contact/",
    buttonColor: "#7fbc03",
  }),
  "domains.bh": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "domains.bh",
    logo: "/assets/logos/domains-bh.png",
    brandColor: "#ee4036",
    appearance: "light",
    supportUrl: "https://domains.bh/contact/",
    buttonColor: "#ee4036",
  }),
  "dominic.de": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "dominic.de",
    logo: "/assets/logos/dominic-de.svg",
    appearance: "light",
    supportUrl: "https://dominic.de/contact#contactSupport",
    buttonColor: "#15a1dc",
  }),
  "everythingbeginswitha.name": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "Everything Begins With A Name",
    logo: "/assets/logos/teaminternet-com-dark.svg",
    appearance: "light",
    supportUrl: "https://teaminternet.com/contact/",
    buttonColor: "#01153c",
  }),
  "key-systems.net": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "Key-Systems",
    logo: "/assets/logos/key-systems-net.png",
    appearance: "light",
    supportUrl: "https://www.key-systems.net/kontakt/support/",
    buttonColor: "#2a5e84",
  }),
  "ipm.domains": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "IPM Domains",
    logo: "/assets/logos/ipm-domains.svg",
    appearance: "light",
    supportUrl: "https://www.brandshelter.com/contact/",
    buttonColor: "#28cda0",
  }),
  "whoistrustee.com": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "Whois Trustee",
    logo: "/assets/logos/whoistrustee-com.gif",
    appearance: "light",
    supportUrl: "https://whoistrustee.com/contact",
    buttonColor: "#2a5e84",
  }),
  "ntld.icu": domain({
    serverId: "gweb-prod-miscellaneous-01",
    name: "nTLD",
    logo: "/assets/logos/teaminternet-com-dark.svg",
    appearance: "light",
    supportUrl: "https://teaminternet.com/contact/",
    buttonColor: "#01153c",
  }),
};

const DEFAULT_KEY = "default";

/** Hostnames available in the domain preview select (sorted, excludes `default`). */
export function listPreviewHostnames() {
  return Object.keys(CONFIG)
    .filter((key) => key !== DEFAULT_KEY)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/**
 * CONFIG key that would match this hostname (longest suffix), or null for default-only.
 * @param {string} hostname
 * @returns {string | null}
 */
export function resolveConfigKey(hostname) {
  for (const key of hostnameSuffixCandidates(hostname)) {
    if (key !== DEFAULT_KEY && CONFIG[key] && typeof CONFIG[key] === "object") {
      return key;
    }
  }
  return null;
}

/**
 * @param {object} domainEntry CONFIG entry (may include serverId)
 * @returns {Record<string, unknown>}
 */
function layerFromServer(domainEntry) {
  const sid =
    domainEntry && domainEntry.serverId != null
      ? String(domainEntry.serverId).trim()
      : "";
  if (!sid) {
    return {};
  }
  const srv = SERVERS[sid];
  if (!srv || typeof srv !== "object") {
    return {};
  }
  return { ...srv };
}

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
 * Resolve config: default → matching server (by domain's serverId) → domain entry. Omits serverId from the result.
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
      const serverLayer = layerFromServer(entry);
      const merged = { ...CONFIG.default, ...serverLayer, ...entry };
      const { serverId: _sid, ...out } = merged;
      return out;
    }
  }
  const { serverId: _omit, ...fallback } = { ...CONFIG.default };
  return fallback;
}

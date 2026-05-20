/**
 * Discover support or contact URLs from site homepages.
 * Run: node scripts/fetch-support-urls.mjs
 */

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {{ key: string, url: string }[]} */
const SITES = [
  { key: "brandshelter.com", url: "https://www.brandshelter.com/" },
  { key: "centralnicregistry.com", url: "https://centralnicregistry.com/" },
  { key: "centralnicreseller.com", url: "https://centralnicreseller.com/" },
  { key: "kb.centralnicreseller.com", url: "https://kb.centralnicreseller.com/" },
  { key: "upload.teaminternet.com", url: "https://upload.teaminternet.com/" },
  { key: "voluum.com", url: "https://voluum.com/" },
  { key: "safebrands.fr", url: "https://safebrands.fr/" },
  { key: "teaminternet.com", url: "https://teaminternet.com/" },
  { key: "dot.saarland", url: "https://dot.saarland/" },
  { key: "nic.saarland", url: "https://nic.saarland/" },
  { key: "dotbrandsolutions.com", url: "https://dotbrandsolutions.com/" },
  { key: "blog.moniker.com", url: "https://blog.moniker.com/" },
  { key: "registry.co", url: "https://registry.co/" },
  { key: "register.bh", url: "https://register.bh/" },
  { key: "domains.bh", url: "https://domains.bh/" },
  { key: "dominic.de", url: "https://dominic.de/" },
  { key: "everythingbeginswitha.name", url: "https://everythingbeginswitha.name/" },
  { key: "key-systems.net", url: "https://key-systems.net/" },
  { key: "ipm.domains", url: "https://ipm.domains/" },
  { key: "whoistrustee.com", url: "https://whoistrustee.com/" },
  { key: "ntld.icu", url: "https://ntld.icu/" },
];

const SKIP_HREF =
  /^(#|javascript:|mailto:|tel:)|login|sign-?in|sign-?up|register|cart|privacy|cookie|imprint|impressum|legal|terms|agb|datenschutz|facebook|twitter|linkedin|instagram|youtube/i;

/** @type {Record<string, string>} */
const OVERRIDES = {
  "safebrands.fr": "https://www.brandshelter.com/fr/contact",
  "blog.moniker.com": "https://www.moniker.com/contact",
};

/**
 * @param {string} html
 * @param {string} baseUrl
 */
function extractLinks(html, baseUrl) {
  /** @type {{ url: string, text: string, tier: number }[]} */
  const found = [];
  const re = /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const inner = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const hrefM = attrs.match(/href=["']([^"']+)["']/i);
    if (!hrefM) continue;
    const href = hrefM[1].replace(/&amp;/g, "&");
    if (SKIP_HREF.test(href)) continue;

    let url;
    try {
      url = new URL(href, baseUrl).href;
    } catch {
      continue;
    }
    if (!/^https?:/i.test(url)) continue;

    const blob = `${href} ${inner}`.toLowerCase();
    let tier = 99;
    if (/\b(support|help\s*center|helpdesk|customer\s*support)\b/.test(blob)) {
      tier = 1;
    } else if (/\/support\b|\/help\b|support\.|help\./.test(url.toLowerCase())) {
      tier = 2;
    } else if (/\b(contact|contact\s*us|get\s*in\s*touch|kontakt|nous\s*contacter|contactez)\b/.test(blob)) {
      tier = 3;
    } else if (/\/contact\b|\/kontakt\b|\/contact-us\b/.test(url.toLowerCase())) {
      tier = 4;
    } else {
      continue;
    }

    found.push({ url, text: inner.slice(0, 80), tier });
  }

  found.sort((a, b) => a.tier - b.tier);
  return found;
}

/** @type {Record<string, object>} */
const results = {};

for (const site of SITES) {
  const out = { key: site.key, supportUrl: null, source: null, error: null };
  try {
    if (OVERRIDES[site.key]) {
      out.supportUrl = OVERRIDES[site.key];
      out.source = "override";
    } else {
      const res = await fetch(site.url, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MaintenanceBot/1.0)",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const links = extractLinks(html, res.url);
      if (links[0]) {
        out.supportUrl = links[0].url;
        out.source = `tier-${links[0].tier}: ${links[0].text || links[0].url}`;
      }
    }
  } catch (e) {
    out.error = e instanceof Error ? e.message : String(e);
  }
  results[site.key] = out;
  console.log(
    `${site.key}: ${out.supportUrl || "—"}${out.source ? ` (${out.source})` : ""}${out.error ? ` [${out.error}]` : ""}`,
  );
}

await writeFile(
  join(__dirname, "fetch-support-urls-report.json"),
  JSON.stringify(results, null, 2),
);

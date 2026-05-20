/**
 * Extract typical CTA / primary button colors from site homepages.
 * Run: node scripts/fetch-button-colors.mjs
 */

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

/** @type {Record<string, string>} */
const OVERRIDES = {
  "upload.teaminternet.com": "#01153c",
  "teaminternet.com": "#01153c",
  "everythingbeginswitha.name": "#01153c",
  "ntld.icu": "#01153c",
  "register.bh": "#7fbc03",
  "domains.bh": "#ee4036",
  "voluum.com": "#6b46f2",
  "key-systems.net": "#2a5e84",
};

function normalizeHex(color) {
  const s = String(color || "").trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    const h = m[1];
    if (h.length === 3) {
      return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
    }
    if (h.length === 6) return `#${h}`.toLowerCase();
    return null;
  }
  m = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(s);
  if (m) {
    const hex = (n) => Number(m[n]).toString(16).padStart(2, "0");
    return `#${hex(1)}${hex(2)}${hex(3)}`;
  }
  return null;
}

/**
 * @param {string} html
 */
function extractColors(html) {
  /** @type {{ color: string, score: number }[]} */
  const hits = [];

  const cssVarRe =
    /--(?:wp--preset--color--)?(?:primary|accent|brand|button|cta|main|highlight)[^:]*:\s*(#[0-9a-f]{3,8}|rgb\([^)]+\))/gi;
  let m;
  while ((m = cssVarRe.exec(html)) !== null) {
    const c = normalizeHex(m[1]);
    if (c) hits.push({ color: c, score: 90 });
  }

  const classBgRe =
    /\.(?:btn-primary|button-primary|primary-button|wp-block-button__link|cta-button|btn--primary|main-btn)[^{]*\{[^}]*background(?:-color)?:\s*([^;}\n]+)/gi;
  while ((m = classBgRe.exec(html)) !== null) {
    const c = normalizeHex(m[1].trim());
    if (c && c !== "#ffffff" && c !== "#fff") hits.push({ color: c, score: 85 });
  }

  const tailwindBgRe =
    /class=["'][^"']*\b(?:bg-(?:primary|brand|accent)|btn-primary)[^"']*["']/gi;
  while ((m = tailwindBgRe.exec(html)) !== null) {
    const tag = m[0];
    const bg = tag.match(/\bbg-(?:\[)?([#a-z0-9-]+)(?:\])?/i);
    if (bg && bg[1].startsWith("#")) {
      const c = normalizeHex(bg[1]);
      if (c) hits.push({ color: c, score: 80 });
    }
    const hex = tag.match(/bg-\[(#[0-9a-f]{3,8})\]/i);
    if (hex) {
      const c = normalizeHex(hex[1]);
      if (c) hits.push({ color: c, score: 82 });
    }
  }

  const inlineBtnRe =
    /<a\b[^>]*class=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*style=["'][^"']*background(?:-color)?:\s*([^;"']+)/gi;
  while ((m = inlineBtnRe.exec(html)) !== null) {
    const c = normalizeHex(m[1]);
    if (c) hits.push({ color: c, score: 75 });
  }

  const linkBtnRe =
    /<a\b([^>]*class=["'][^"']*(?:btn|button|wp-block-button)[^"']*["'][^>]*)>/gi;
  while ((m = linkBtnRe.exec(html)) !== null) {
    const attrs = m[1];
    const bgM = attrs.match(/background(?:-color)?:\s*([^;"']+)/i);
    if (bgM) {
      const c = normalizeHex(bgM[1]);
      if (c) hits.push({ color: c, score: 70 });
    }
    if (/bg-(?:primary|brand|accent|\[#)/i.test(attrs)) {
      const hex = attrs.match(/bg-\[(#[0-9a-f]{3,8})\]/i);
      if (hex) {
        const c = normalizeHex(hex[1]);
        if (c) hits.push({ color: c, score: 78 });
      }
    }
  }

  hits.sort((a, b) => b.score - a.score);
  const seen = new Set();
  return hits.filter((h) => {
    if (seen.has(h.color)) return false;
    seen.add(h.color);
    return true;
  });
}

/** @type {Record<string, object>} */
const results = {};

for (const site of SITES) {
  const out = { key: site.key, buttonColor: null, source: null, error: null };
  try {
    if (OVERRIDES[site.key]) {
      out.buttonColor = OVERRIDES[site.key];
      out.source = "override";
    } else {
      const res = await fetch(site.url, {
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const colors = extractColors(html);
      if (colors[0]) {
        out.buttonColor = colors[0].color;
        out.source = `score ${colors[0].score}`;
        if (colors[1]) out.alternates = colors.slice(1, 4).map((c) => c.color);
      }
    }
  } catch (e) {
    out.error = e instanceof Error ? e.message : String(e);
  }
  results[site.key] = out;
  console.log(
    `${site.key}: ${out.buttonColor || "—"}${out.source ? ` (${out.source})` : ""}${out.error ? ` [${out.error}]` : ""}`,
  );
}

await writeFile(
  join(__dirname, "fetch-button-colors-report.json"),
  JSON.stringify(results, null, 2),
);

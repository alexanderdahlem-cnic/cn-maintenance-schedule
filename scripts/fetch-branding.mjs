/**
 * Fetch homepage HTML per domain; prefer header/nav logos (not favicons).
 * Run: node scripts/fetch-branding.mjs
 */

import { writeFile, mkdir, unlink } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGO_DIR = join(__dirname, "../public/assets/logos");

/** @type {{ key: string, serverId: string, name: string, url: string, language?: string }[]} */
const DOMAINS = [
  {
    key: "brandshelter.com",
    serverId: "gweb-prod-brandshelter-01",
    name: "BrandShelter",
    url: "https://www.brandshelter.com/",
  },
  {
    key: "centralnicregistry.com",
    serverId: "gweb-prod-centralnicregistry-01",
    name: "CentralNic Registry",
    url: "https://centralnicregistry.com/",
  },
  {
    key: "centralnicreseller.com",
    serverId: "gweb-prod-centralnicreseller-01",
    name: "CentralNic Reseller",
    url: "https://centralnicreseller.com/",
  },
  {
    key: "kb.centralnicreseller.com",
    serverId: "gweb-prod-centralnicreseller-01",
    name: "CentralNic Reseller",
    url: "https://kb.centralnicreseller.com/",
  },
  {
    key: "upload.teaminternet.com",
    serverId: "gweb-prod-pii-01",
    name: "Team Internet",
    url: "https://upload.teaminternet.com/",
  },
  {
    key: "voluum.com",
    serverId: "gweb-prod-safebrands-01",
    name: "Voluum",
    url: "https://voluum.com/",
  },
  {
    key: "safebrands.fr",
    serverId: "gweb-prod-safebrands-01",
    name: "BrandShelter",
    url: "https://safebrands.fr/",
    language: "fr",
  },
  {
    key: "teaminternet.com",
    serverId: "gweb-prod-teaminternet-01",
    name: "Team Internet",
    url: "https://teaminternet.com/",
  },
  {
    key: "dot.saarland",
    serverId: "gweb-prod-miscellaneous-01",
    name: "dot Saarland",
    url: "https://dot.saarland/",
  },
  {
    key: "nic.saarland",
    serverId: "gweb-prod-miscellaneous-01",
    name: "nic Saarland",
    url: "https://nic.saarland/",
  },
  {
    key: "dotbrandsolutions.com",
    serverId: "gweb-prod-miscellaneous-01",
    name: "dot Brand Solutions",
    url: "https://dotbrandsolutions.com/",
  },
  {
    key: "blog.moniker.com",
    serverId: "gweb-prod-miscellaneous-01",
    name: "Moniker",
    url: "https://blog.moniker.com/",
  },
  {
    key: "registry.co",
    serverId: "gweb-prod-miscellaneous-01",
    name: "Registry.co",
    url: "https://registry.co/",
  },
  {
    key: "register.bh",
    serverId: "gweb-prod-miscellaneous-01",
    name: "register.bh",
    url: "https://register.bh/",
  },
  {
    key: "domains.bh",
    serverId: "gweb-prod-miscellaneous-01",
    name: "domains.bh",
    url: "https://domains.bh/",
  },
  {
    key: "dominic.de",
    serverId: "gweb-prod-miscellaneous-01",
    name: "dominic.de",
    url: "https://dominic.de/",
  },
  {
    key: "everythingbeginswitha.name",
    serverId: "gweb-prod-miscellaneous-01",
    name: "Everything Begins With A Name",
    url: "https://everythingbeginswitha.name/",
  },
  {
    key: "key-systems.net",
    serverId: "gweb-prod-miscellaneous-01",
    name: "Key-Systems",
    url: "https://key-systems.net/",
  },
  {
    key: "ipm.domains",
    serverId: "gweb-prod-miscellaneous-01",
    name: "IPM Domains",
    url: "https://ipm.domains/",
  },
  {
    key: "whoistrustee.com",
    serverId: "gweb-prod-miscellaneous-01",
    name: "Whois Trustee",
    url: "https://whoistrustee.com/",
  },
  {
    key: "ntld.icu",
    serverId: "gweb-prod-miscellaneous-01",
    name: "nTLD",
    url: "https://ntld.icu/",
  },
];

/** Curated logo paths in `config.js` (skip re-downloading wrong nav/favicon assets). */
const LOGO_OVERRIDES = {
  "upload.teaminternet.com": "/assets/logos/teaminternet-com-dark.svg",
  "teaminternet.com": "/assets/logos/teaminternet-com-dark.svg",
  "everythingbeginswitha.name": "/assets/logos/teaminternet-com-dark.svg",
  "ntld.icu": "/assets/logos/teaminternet-com-dark.svg",
  "dot.saarland": "/assets/logos/nic-saarland.svg",
  "safebrands.fr": "/assets/logos/brandshelter-com.svg",
};

const NAV_BLOCK_RE =
  /<(?:header|nav)[^>]*(?:class|id)=["'][^"']*(?:header|nav|navbar|masthead|site-header|main-header|top-bar)[^"']*["'][^>]*>[\s\S]*?<\/(?:header|nav)>/gi;

const HEADER_ANY_RE = /<header[\s\S]*?<\/header>/gi;
const NAV_ANY_RE = /<nav[\s\S]*?<\/nav>/gi;

const PLACEHOLDER_SRC = /^data:image\/(?:gif|svg)/i;

function slug(key) {
  return key.replace(/\./g, "-");
}

/**
 * @param {string} tag
 * @returns {Record<string, string>}
 */
function parseImgTag(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*["']([^"']*)["']/g)) {
    attrs[m[1].toLowerCase()] = m[2];
  }
  return attrs;
}

/**
 * @param {string} html
 * @returns {string[]}
 */
function navHtmlChunks(html) {
  const chunks = [];
  for (const re of [HEADER_ANY_RE, NAV_ANY_RE, NAV_BLOCK_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html)) !== null) {
      if (m[0].length < 50000) chunks.push(m[0]);
    }
  }
  return chunks.length ? chunks : [];
}

/**
 * @param {string} url
 * @param {string} baseUrl
 */
function resolveUrl(url, baseUrl) {
  try {
    return new URL(url.replace(/&amp;/g, "&"), baseUrl).href;
  } catch {
    return null;
  }
}

/**
 * @param {string} tag
 * @param {string} baseUrl
 * @param {{ inNav: boolean, index: number }} ctx
 */
function scoreImgCandidate(tag, baseUrl, ctx) {
  const a = parseImgTag(tag);
  const srcRaw = a.src || "";
  const dataSrc = a["data-src"] || a["data-lazy-src"] || "";
  const src = PLACEHOLDER_SRC.test(srcRaw) && dataSrc ? dataSrc : srcRaw || dataSrc;
  if (!src || PLACEHOLDER_SRC.test(src)) return null;

  const url = resolveUrl(src, baseUrl);
  if (!url) return null;

  const path = url.toLowerCase();
  const cls = (a.class || "").toLowerCase();
  const alt = (a.alt || "").toLowerCase();
  const id = (a.id || "").toLowerCase();
  const w = parseInt(a.width, 10) || 0;
  const h = parseInt(a.height, 10) || 0;

  if (/favicon|apple-touch|icon-\d|\/icons\//i.test(path)) return null;
  if (/wpml-ls-flag|\/flags\//i.test(path + cls)) return null;
  if (/scroll|mouse|decorative|sprite|avatar|gravatar|placeholder/i.test(path + cls + alt)) {
    return null;
  }
  if (/\.(gif)(\?|$)/i.test(path) && !/logo/i.test(path)) return null;

  let score = 0;
  if (ctx.inNav) score += 250;
  if (ctx.index < 3) score += 40 - ctx.index * 10;
  if (/custom-logo|site-logo|navbar-brand|header.*logo|logo.*header/i.test(cls + id)) {
    score += 180;
  }
  if (/\blogo\b/i.test(cls + alt + path)) score += 100;
  if (/brand/i.test(cls + alt + path) && !/rebrand/i.test(path)) score += 40;
  if (/\.svg/i.test(path)) score += 80;
  if (/fetchpriority=["']high/i.test(tag)) score += 50;
  if (w >= 120 || h >= 40) score += Math.min(60, (w + h) / 8);
  if (w > 0 && w < 48 && h > 0 && h < 48 && !/\.svg/i.test(path)) score -= 120;
  if (/logo/i.test(path)) score += 30;
  if (/registry_logo|brandshelter-logo|voluum-logo|team-internet-logo/i.test(path)) {
    score += 60;
  }

  try {
    if (new URL(url).origin === new URL(baseUrl).origin) score += 90;
  } catch {
    /* ignore */
  }
  if (/\/assets\/img\/[^/]*logo|\/assets\/img\/saarland\.svg/i.test(path)) score += 50;
  if (/map|illustration|decorative|icon_mouse/i.test(path)) score -= 150;

  return { url, score, source: ctx.inNav ? "nav" : "page" };
}

/**
 * @param {string} html
 * @param {string} baseUrl
 */
function extractNavLogoUrl(html, baseUrl) {
  /** @type {{ url: string, score: number, source: string }[]} */
  const ranked = [];

  const navChunks = navHtmlChunks(html);
  const searchAreas = [
    ...navChunks.map((chunk) => ({ html: chunk, inNav: true })),
    { html, inNav: false },
  ];

  for (const area of searchAreas) {
    const imgRe = /<img\b[^>]*>/gi;
    let i = 0;
    let m;
    while ((m = imgRe.exec(area.html)) !== null) {
      const hit = scoreImgCandidate(m[0], baseUrl, { inNav: area.inNav, index: i++ });
      if (hit) ranked.push(hit);
    }
  }

  ranked.sort((a, b) => b.score - a.score);
  if (ranked[0]) {
    return { logoUrl: ranked[0].url, pick: ranked[0] };
  }

  const ogImage =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogImage) {
    const url = resolveUrl(ogImage[1], baseUrl);
    if (url && /logo/i.test(url)) return { logoUrl: url, pick: { source: "og:image", score: 10 } };
  }

  return { logoUrl: null, pick: null };
}

/**
 * @param {string} html
 * @param {string} baseUrl
 */
function extractFromHtml(html, baseUrl) {
  const theme =
    html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i);

  const { logoUrl, pick } = extractNavLogoUrl(html, baseUrl);

  let brandColor = theme?.[1]?.trim() || null;
  if (brandColor && !/^#([0-9a-f]{3,8})$/i.test(brandColor)) {
    brandColor = null;
  }

  return { logoUrl, brandColor, pick };
}

/**
 * @param {string} url
 */
async function fetchText(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MaintenancePage-BrandingBot/2.0; +https://github.com/)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { html: await res.text(), finalUrl: res.url };
}

/**
 * @param {string} url
 */
async function downloadBinary(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MaintenancePage-BrandingBot/2.0)",
      Accept: "image/*,*/*",
    },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, contentType: ct };
}

function extFromUrl(url, contentType) {
  const pathExt = extname(new URL(url).pathname).toLowerCase();
  if (pathExt && /^\.(svg|png|jpe?g|webp|gif)$/i.test(pathExt)) return pathExt;
  if (/svg/i.test(contentType)) return ".svg";
  if (/png/i.test(contentType)) return ".png";
  if (/jpeg|jpg/i.test(contentType)) return ".jpg";
  if (/webp/i.test(contentType)) return ".webp";
  return ".png";
}

/** Remove stale logo files for this slug (any extension). */
async function clearSlugFiles(slugName) {
  for (const ext of [".png", ".svg", ".jpg", ".jpeg", ".webp", ".gif"]) {
    try {
      await unlink(join(LOGO_DIR, `${slugName}${ext}`));
    } catch {
      /* ignore */
    }
  }
}

await mkdir(LOGO_DIR, { recursive: true });

/** @type {Record<string, object>} */
const results = {};

for (const d of DOMAINS) {
  const out = {
    key: d.key,
    serverId: d.serverId,
    name: d.name,
    language: d.language,
    logo: null,
    brandColor: null,
    logoSource: null,
    error: null,
  };
  const fileSlug = slug(d.key);
  try {
    if (LOGO_OVERRIDES[d.key]) {
      out.logo = LOGO_OVERRIDES[d.key];
      out.logoSource = "override";
    }
    const { html, finalUrl } = await fetchText(d.url);
    const { logoUrl, brandColor, pick } = extractFromHtml(html, finalUrl);
    if (brandColor) out.brandColor = brandColor;
    if (pick) out.logoSource = pick.source;

    if (logoUrl && !LOGO_OVERRIDES[d.key]) {
      const { buf, contentType } = await downloadBinary(logoUrl);
      if (buf.length < 120) throw new Error("logo too small");
      const ext = extFromUrl(logoUrl, contentType);
      await clearSlugFiles(fileSlug);
      const file = `${fileSlug}${ext}`;
      await writeFile(join(LOGO_DIR, file), buf);
      out.logo = `/assets/logos/${file}`;
      out.logoUrl = logoUrl;
      out.bytes = buf.length;
    }
  } catch (e) {
    out.error = e instanceof Error ? e.message : String(e);
  }
  results[d.key] = out;
  const extra = out.logoSource ? ` [${out.logoSource}]` : "";
  const size = out.bytes ? ` ${out.bytes}B` : "";
  console.log(
    `${d.key}: logo=${out.logo ? "ok" : "—"}${size}${extra} color=${out.brandColor || "—"}${out.error ? ` (${out.error})` : ""}`,
  );
}

const reportPath = join(__dirname, "fetch-branding-report.json");
await writeFile(reportPath, JSON.stringify(results, null, 2));
console.log(`\nWrote ${reportPath}`);

# Static maintenance page

**Repository:** [github.com/alexanderdahlem-cnic/cn-maintenance-schedule](https://github.com/alexanderdahlem-cnic/cn-maintenance-schedule)

A minimal, production-ready **static** maintenance site built with **Vite**, **vanilla JavaScript**, **HTML**, and **CSS**. There is **no backend**, **no framework**, and **no React/Vue**. The built output is plain files in `dist/` suitable for any static host or CDN (including maintenance-mode or failover routing).

## Purpose

Serve a branded “under maintenance” experience per hostname (multi-domain / multi-tenant style), with one codebase and **hostname-based configuration** in JavaScript.

## Architecture

| Piece | Role |
| --- | --- |
| `index.html` | Minimal **bootloader**: charset, viewport, meta, empty `#app`, Vite entry script only. **No maintenance copy** in HTML. |
| `src/main.js` | Reads `window.location.hostname`, resolves config, sets `lang` and `--brand-color`, mounts UI into `#app`. |
| `src/config.js` | Central **CONFIG** map and `getConfig(hostname)` (**suffix match**: any subdomain of a configured domain uses that entry; **`default`** fallback). |
| `src/maintenance.template.html` | **Layout template**: semantic markup and static copy (e.g. footer). Easier to edit than building nodes only in JS. |
| `src/renderMaintenancePage.js` | Parses the template, then fills **`data-slot`** regions from config (logo, title, text, support link) via DOM APIs. |
| `src/style.css` | Layout, tokens, responsive and `prefers-color-scheme` styling. |
| `public/` | Static assets copied as-is to `dist/` (e.g. logos under `/assets/logos/`). |

### Why `index.html` is intentionally content-free

The shipped HTML entry stays a tiny shell so CDNs and static hosts always load the same bootloader. **Structure and static maintenance copy** (footer, element order, extra landmarks) live in **`src/maintenance.template.html`**, which is bundled and rendered at runtime. **Per-host branding** (`title`, `text`, `logo`, etc.) stays in **`config.js`**. That split keeps layout easy to edit in real HTML while `index.html` never diverges per domain.

### Editing the maintenance HTML template

Open **`src/maintenance.template.html`**. Keep the root **`.maintenance`** element and the **`data-slot`** attributes (`logo-wrap`, `title`, `text`, `actions`) so `renderMaintenancePage.js` can inject content. You can change classes (update **`style.css`** accordingly), reorder blocks, or edit static text in the **`<footer>`** without touching `index.html`.

### Hostname-based branding

At runtime, `main.js` uses `window.location.hostname` (no server logic). `getConfig()` walks **suffixes** of the host (longest first): e.g. `www.foo.example.com` tries `www.foo.example.com`, then `foo.example.com`, then `example.com` — the first key found in **`CONFIG`** wins. Any number of subdomain labels in front of your registered domain are ignored for matching purposes.

### Fallback config

If no **suffix** matches any key (other than merging into `default`), **`CONFIG.default`** is used (spread into a fresh object so callers never mutate the canonical default).

## Run locally with Docker (development)

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

Then open **`http://localhost:8000`**. Inside the container Vite listens on **port 80**; Docker maps **host 8000 → container 80**. Source is bind-mounted; **`npm install` runs inside the container** on start (keeps `node_modules` in sync with `package.json`). Vite serves with **hot module reload**.

## Build for production

On your machine (or CI):

```bash
npm install
npm run build
```

Output: **`dist/`** (configured in `vite.config.js`).

Preview locally:

```bash
npm run preview
```

## Deploy to GitHub Pages (`*.github.io`)

This repo includes **`.github/workflows/deploy-github-pages.yml`**. It runs on every push to **`main`**, builds with the correct Vite **`base`** path, and publishes **`dist/`** via GitHub’s **Actions → Pages** flow.

### One-time setup on GitHub

1. Push this repo (including the workflow) to GitHub.
2. Open the repo on GitHub → **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
4. Push to **`main`** (or run **Actions** → **Deploy to GitHub Pages** → **Run workflow**). The first run may ask you to approve the **`github-pages`** environment once.
5. After the workflow succeeds, the site URL appears in the job summary and under Pages settings. Typical URLs:
   - **Project site** (repo name e.g. `maintenance`): **`https://<owner>.github.io/maintenance/`**
   - **Organization/user site** (repo named **`<org>.github.io`**): **`https://<org>.github.io/`**

The workflow sets **`VITE_BASE=./`** so JS, CSS, and `public/` assets use **relative URLs** (`./assets/...`). That matches both **`https://<owner>.github.io/<repo>/`** and GitHub’s **`*.pages.github.io`** preview URLs, and avoids **404 HTML responses** (wrong MIME type on CSS/JS) when absolute **`/<repo>/`** paths don’t match how Pages serves the artifact.

To force an absolute subpath instead (e.g. hosting only at `/<repo>/`), edit the workflow and set **`VITE_BASE=/<repo>/`** before **`npm run build`**.

### Hostname config for GitHub Pages

Visitors hit **`something.github.io`**, not your product domain. Add that hostname to **`CONFIG`** in `src/config.js` (and redeploy) if you want branding distinct from **`CONFIG.default`**, for example:

```js
"your-org.github.io": { /* … */ },
```

Use the **suffix** you configure (e.g. `example.com` covers `app.example.com`). For GitHub Pages preview hosts, the full hostname may still be the right key if you do not share a longer suffix with other sites.

### Private repositories

GitHub Pages availability for **private** repos depends on your **GitHub plan** (e.g. GitHub Enterprise or Team features). If Pages is not available for your private repo, host **`dist/`** elsewhere or make the repo public for free Pages.

---

## Deploy static `dist` files (any host)

Upload or sync the **contents** of `dist/` to any static host or object storage behind a CDN:

- S3 + CloudFront, Azure Static Web Apps, Netlify, GitHub Pages (see above), nginx `root`, etc.
- **No Node process** is required in production—only static files.
- Works behind **CDN maintenance rules** or origin failover as long as the browser receives this HTML/JS/CSS bundle; hostname detection still runs in the client.

### Preview a GitHub Pages–style build locally

Same as CI (relative asset URLs):

```bash
VITE_BASE=./ npm run build
npm run preview
```

Optional: test an absolute subpath with **`VITE_BASE=/your-repo-name/`** if you deploy only that URL layout.

### Embed on another website (third-party origin)

**Why `<script type="module">` from GitHub Pages fails elsewhere**

Browsers enforce **CORS** for **ES modules** loaded cross-origin. GitHub Pages does not send `Access-Control-Allow-Origin` for your lima-city (or other) domain, so **`index-*.js`** from **`dist/assets/`** cannot be loaded from `<script type="module" src="…">` on another host. Separate `<link>` CSS hits the same limitation.

**Use the embed bundle instead**

After **`npm run build && npm run build:embed`** (the GitHub Action runs both), **`dist/maintenance-embed.js`** is a **classic script** (no `type="module"`) with **CSS inlined**. Load **that single file** from the URL where GitHub actually hosts your **`dist/`** output.

#### Canonical URL (`https://<org>.github.io/<repo>/`)

Avoid **`//`** in paths (e.g. not `pages.github.io//repo`). **`script src`** and **`window.__MAINTENANCE_PUBLIC_BASE__`** must use the **same** origin and repository path:

```html
<div id="app"></div>
<script>
  window.__MAINTENANCE_PUBLIC_BASE__ =
    "https://alexanderdahlem-cnic.github.io/cn-maintenance-schedule";
</script>
<script src="https://alexanderdahlem-cnic.github.io/cn-maintenance-schedule/maintenance-embed.js"></script>
```

#### Preview URL only (`https://<id>.pages.github.io/…`)

If only the **Actions deployment / preview** URL exists for now, use **that** hostname (and path, if any) for **both** the script tag and **`__MAINTENANCE_PUBLIC_BASE__`** — not the future canonical URL. Copy it from the workflow run (**deployment** summary / job output) or open the deployed site and copy the origin + path from the address bar (single slashes only).

Example shape:

```html
<div id="app"></div>
<script>
  window.__MAINTENANCE_PUBLIC_BASE__ =
    "https://YOUR_PREVIEW.pages.github.io/cn-maintenance-schedule";
</script>
<script src="https://YOUR_PREVIEW.pages.github.io/cn-maintenance-schedule/maintenance-embed.js"></script>
```

Add **`window.location.hostname`** for this preview (e.g. **`YOUR_PREVIEW.pages.github.io`**) to **`CONFIG`** in **`src/config.js`** if you want branding other than **`CONFIG.default`** (preview hostnames can change when GitHub changes the deployment URL).

**Do not** use **`fetch()`** in the browser console to load `maintenance-embed.js` from another origin — GitHub Pages will not send **CORS** headers for that request; **`fetch` failing does not mean** the embed `<script src>` fails.

#### Smoke test: `test-alert.js`

**`public/test-alert.js`** is copied to **`dist/test-alert.js`** on **`npm run build`** (no bundling). It only runs **`alert(...)`** so you can verify cross-origin `<script src>` from your Pages base URL, e.g.:

```html
<script src="https://YOUR_PREVIEW.pages.github.io/cn-maintenance-schedule/test-alert.js"></script>
```

Remove this script tag (and optionally delete **`public/test-alert.js`**) when testing is done.

Optional: **`window.__MAINTENANCE_ROOT_ID__`** (default **`app`**) if your container id differs.

Subdomains of a configured suffix (e.g. **`pixeldemon.lima-city.de`** under **`lima-city.de`**) use the same **`CONFIG`** entry automatically.

**Alternatives**

- Deploy the full **`dist/`** copy on the same host as the HTML (**same origin** → normal **`index.html`** flow works).
- Or use an **`<iframe src="https://…github.io/repo/">`** — no script embedding or CORS issues for your module bundle.

## Add a new domain config

1. Open `src/config.js`.
2. Add a key for the **registrable suffix** you want to brand (e.g. `"mycompany.com"`). That entry applies to **`mycompany.com`**, **`www.mycompany.com`**, **`app.mycompany.com`**, **`a.b.mycompany.com`**, etc. (longest matching key wins if you add overlapping suffixes).
3. Provide fields such as `logo`, `title`, `text`, `supportUrl`, `brandColor`, `language` (see existing examples).
4. Add logo files under `public/assets/logos/` if needed and reference them with paths like `/assets/logos/your-logo.svg`.
5. Rebuild (`npm run build`) and deploy `dist/`.

**Caveat:** Shared public suffixes (e.g. **`github.io`**) match many unrelated hosts. Prefer a **full hostname** key for those (e.g. **`your-user.github.io`**) instead of **`github.io`** alone.

## Test domains locally via `/etc/hosts`

Point test hostnames to your machine; suffix matching applies (e.g. **`foo.example.test`** uses the **`example.test`** entry if configured):

```
127.0.0.1 example.test
127.0.0.1 example-de.test
```

Then run Vite (or Docker) and visit:

- `http://example.test:8000`
- `http://example-de.test:8000`

You should see **different branding** per hostname. Any hostname not listed falls back to **`CONFIG.default`**.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run build:embed` | **`maintenance-embed.js`** (IIFE, for cross-origin embed) |
| `npm run build:all` | Full site build + embed bundle |
| `npm run preview` | Preview production build |

## License

Private / use as needed for your maintenance deployment.

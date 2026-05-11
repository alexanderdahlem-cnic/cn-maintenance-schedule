# Static maintenance page

A minimal, production-ready **static** maintenance site built with **Vite**, **vanilla JavaScript**, **HTML**, and **CSS**. There is **no backend**, **no framework**, and **no React/Vue**. The built output is plain files in `dist/` suitable for any static host or CDN (including maintenance-mode or failover routing).

## Purpose

Serve a branded “under maintenance” experience per hostname (multi-domain / multi-tenant style), with one codebase and **hostname-based configuration** in JavaScript.

## Architecture

| Piece | Role |
| --- | --- |
| `index.html` | Minimal **bootloader**: charset, viewport, meta, empty `#app`, Vite entry script only. **No maintenance copy** in HTML. |
| `src/main.js` | Reads `window.location.hostname`, resolves config, sets `lang` and `--brand-color`, mounts UI into `#app`. |
| `src/config.js` | Central **CONFIG** map and `getConfig(hostname)` (exact match + optional `www.` normalization + **default** fallback). |
| `src/maintenance.template.html` | **Layout template**: semantic markup and static copy (e.g. footer). Easier to edit than building nodes only in JS. |
| `src/renderMaintenancePage.js` | Parses the template, then fills **`data-slot`** regions from config (logo, title, text, support link) via DOM APIs. |
| `src/style.css` | Layout, tokens, responsive and `prefers-color-scheme` styling. |
| `public/` | Static assets copied as-is to `dist/` (e.g. logos under `/assets/logos/`). |

### Why `index.html` is intentionally content-free

The shipped HTML entry stays a tiny shell so CDNs and static hosts always load the same bootloader. **Structure and static maintenance copy** (footer, element order, extra landmarks) live in **`src/maintenance.template.html`**, which is bundled and rendered at runtime. **Per-host branding** (`title`, `text`, `logo`, etc.) stays in **`config.js`**. That split keeps layout easy to edit in real HTML while `index.html` never diverges per domain.

### Editing the maintenance HTML template

Open **`src/maintenance.template.html`**. Keep the root **`.maintenance`** element and the **`data-slot`** attributes (`logo-wrap`, `title`, `text`, `actions`) so `renderMaintenancePage.js` can inject content. You can change classes (update **`style.css`** accordingly), reorder blocks, or edit static text in the **`<footer>`** without touching `index.html`.

### Hostname-based branding

At runtime, `main.js` uses `window.location.hostname` (no server logic). `getConfig()` picks the entry whose key equals the hostname after stripping a single leading `www.` (e.g. `www.example.com` → lookup `example.com`).

### Fallback config

If no key matches, **`CONFIG.default`** is used (spread into a fresh object so callers never mutate the canonical default).

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

Use the exact hostname shown in the browser (with or without project path—only the **hostname** is used for lookup).

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

After **`npm run build && npm run build:embed`** (the GitHub Action runs both), **`dist/maintenance-embed.js`** is a **classic script** (no `type="module"`) with **CSS inlined**. Load **that single file** from your canonical Pages URL (avoid **`//`** double slashes and prefer **`https://…github.io/<repo>/`** over transient **`*.pages.github.io`** preview hosts).

Example on `https://pixeldemon.lima-city.de`:

```html
<div id="app"></div>
<script>
  // Where logos /public files live (no trailing slash). Required when the page hostname !== GitHub Pages.
  window.__MAINTENANCE_PUBLIC_BASE__ =
    "https://YOUR_ORG.github.io/gweb-maintainance-static";
</script>
<script src="https://YOUR_ORG.github.io/gweb-maintainance-static/maintenance-embed.js"></script>
```

Optional: **`window.__MAINTENANCE_ROOT_ID__`** (default **`app`**) if your container id differs.

Add **`"pixeldemon.lima-city.de"`** (or your real host) to **`CONFIG`** in `src/config.js` so branding matches that hostname.

**Alternatives**

- Deploy the full **`dist/`** copy on the same host as the HTML (**same origin** → normal **`index.html`** flow works).
- Or use an **`<iframe src="https://…github.io/repo/">`** — no script embedding or CORS issues for your module bundle.

## Add a new domain config

1. Open `src/config.js`.
2. Add a key **exactly matching** the hostname visitors use (e.g. `"app.mycompany.com"`).
3. Provide fields such as `logo`, `title`, `text`, `supportUrl`, `brandColor`, `language` (see existing examples).
4. Add logo files under `public/assets/logos/` if needed and reference them with paths like `/assets/logos/your-logo.svg`.
5. Rebuild (`npm run build`) and deploy `dist/`.

Remember: **`www.`** is stripped before lookup, so you usually only need the bare domain key unless you use a hostname that does not follow that pattern.

## Test domains locally via `/etc/hosts`

Point test hostnames to your machine so `window.location.hostname` matches your config keys:

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

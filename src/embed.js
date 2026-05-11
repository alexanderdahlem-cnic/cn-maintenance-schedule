/**
 * Single-file embed entry: inlines CSS so a foreign origin can load one classic script
 * without CORS (no type="module"). Set window.__MAINTENANCE_PUBLIC_BASE__ to your static
 * host URL so /public assets (logos) resolve correctly when the page is on another domain.
 */

import css from "./style.css?inline";
import { mountMaintenanceApp } from "./mountApp.js";

// DEBUG: remove after verifying the embed script runs on the remote host
alert("maintenance-embed.js executed");

const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

function run() {
  const id =
    (typeof window !== "undefined" && window.__MAINTENANCE_ROOT_ID__) || "app";
  const el = document.getElementById(id);
  if (el) {
    mountMaintenanceApp(el);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", run);
} else {
  run();
}

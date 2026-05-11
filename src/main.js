import "./style.css";
import { getConfig } from "./config.js";
import { renderMaintenancePage } from "./renderMaintenancePage.js";

const hostname = window.location.hostname;
alert(hostname);
const config = getConfig(hostname);

const lang = config.language && String(config.language).trim();
if (lang) {
  document.documentElement.lang = lang;
}

if (config.title != null && String(config.title).trim()) {
  document.title = String(config.title).trim();
}

const brand = config.brandColor && String(config.brandColor).trim();
if (brand) {
  document.documentElement.style.setProperty("--brand-color", brand);
}

const root = document.getElementById("app");
if (root) {
  root.replaceChildren(renderMaintenancePage(config));
}

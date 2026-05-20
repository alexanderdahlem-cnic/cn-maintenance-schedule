/**
 * Hydrate the maintenance layout from maintenance.template.html (bundled as raw markup)
 * and a resolved config object. Prefer editing the HTML template for structure / static text.
 */

import maintenanceMarkup from "./maintenance.template.html?raw";
import { resolvePublicUrl } from "./assetUrl.js";
import {
  formatInstant,
  formatWeekdayUtc,
  formatWindowRange,
  getScheduleState,
  scheduleUiLocale,
} from "./maintenanceSchedule.js";

/**
 * @param {string} hex background (#rrggbb)
 * @returns {string} #0f172a or #ffffff
 */
function readableTextOnBackground(hex) {
  const h = String(hex || "").replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(h)) {
    return "#ffffff";
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? "#0f172a" : "#ffffff";
}

/**
 * Button label for the support/contact link.
 * @param {string} supportUrl
 * @param {string | undefined} lang
 */
function supportLinkLabel(supportUrl, lang) {
  const u = String(supportUrl || "").toLowerCase();
  const code = String(lang || "en")
    .trim()
    .toLowerCase()
    .slice(0, 2);
  const isSupport =
    /\/support\b|support\.|\/help\b|help\.|helpcentre|help-center|help-centre|#contactsupport/i.test(
      u,
    );

  if (code === "fr") {
    return isSupport ? "Support" : "Nous contacter";
  }
  if (code === "de" || /\/kontakt\b/.test(u)) {
    return isSupport ? "Support" : "Kontakt";
  }
  return isSupport ? "Support" : "Contact us";
}

/**
 * @param {string | undefined} lang
 */
function scheduleStrings(lang) {
  const de = String(lang || "en")
    .trim()
    .toLowerCase()
    .startsWith("de");
  if (de) {
    return {
      heading: "Geplante Wartungsfenster (UTC)",
      yourTime: "Ihre Ortszeit",
      next: "Nächste Wartung",
      inProgress: "Wartung läuft bis (UTC)",
      inProgressLocal: "Wartung läuft bis (Ihre Ortszeit)",
      recurring: "Wöchentlich (gleiches Fenster in UTC):",
      noUpcoming:
        "Kein anstehendes Fenster im angezeigten Zeitraum (Konfiguration prüfen).",
    };
  }
  return {
    heading: "Scheduled maintenance (UTC)",
    yourTime: "Your time",
    next: "Next downtime",
    inProgress: "Maintenance in progress until (UTC)",
    inProgressLocal: "Maintenance in progress until (your time)",
    recurring: "Weekly (same window in UTC):",
    noUpcoming: "No upcoming window in the displayed horizon (check configuration).",
  };
}

/**
 * @param {HTMLElement} section
 * @param {object} config
 */
function fillScheduleSection(section, config) {
  const windows = config.maintenanceWindowsUtc;
  if (!Array.isArray(windows) || windows.length === 0) {
    section.remove();
    return;
  }

  const locale = scheduleUiLocale(config.language);
  const copy = scheduleStrings(config.language);
  const nowMs = Date.now();

  const heading = document.createElement("h2");
  heading.className = "maintenance__schedule-heading";
  heading.id = "maintenance-schedule-heading";
  heading.textContent = copy.heading;
  section.appendChild(heading);

  const recurring = document.createElement("p");
  recurring.className = "maintenance__schedule-recurring";
  const ruleLines = windows.map((w) => {
    const day = formatWeekdayUtc(w.weekdayUtc, locale);
    return `${day} ${w.start}–${w.end} UTC`;
  });
  recurring.textContent = `${copy.recurring} ${ruleLines.join(" · ")}`;
  section.appendChild(recurring);

  const state = getScheduleState(nowMs, windows);

  if (state.inProgress && state.currentEnd != null) {
    const st = document.createElement("p");
    st.className = "maintenance__schedule-status";
    st.textContent = copy.inProgress;
    section.appendChild(st);
    const utcLine = document.createElement("p");
    utcLine.className = "maintenance__schedule-utc";
    utcLine.textContent = `${formatInstant(state.currentEnd, locale, "UTC")} UTC`;
    section.appendChild(utcLine);
    const loc = document.createElement("p");
    loc.className = "maintenance__schedule-local";
    loc.textContent = `${copy.inProgressLocal}: ${formatInstant(state.currentEnd, locale, undefined)}`;
    section.appendChild(loc);
    return;
  }

  if (state.nextStart != null && state.nextEnd != null) {
    const st = document.createElement("p");
    st.className = "maintenance__schedule-status";
    st.textContent = copy.next;
    section.appendChild(st);
    const utcLine = document.createElement("p");
    utcLine.className = "maintenance__schedule-utc";
    utcLine.textContent = `${formatWindowRange(state.nextStart, state.nextEnd, locale, "UTC")} UTC`;
    section.appendChild(utcLine);
    const loc = document.createElement("p");
    loc.className = "maintenance__schedule-local";
    loc.textContent = `${copy.yourTime}: ${formatWindowRange(state.nextStart, state.nextEnd, locale, undefined)}`;
    section.appendChild(loc);
    return;
  }

  const fallback = document.createElement("p");
  fallback.className = "maintenance__schedule-status";
  fallback.textContent = copy.noUpcoming;
  section.appendChild(fallback);
}

/**
 * @param {object} config merged config from getConfig()
 * @returns {HTMLElement} root wrapper node
 */
export function renderMaintenancePage(config) {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(
    maintenanceMarkup.trim(),
    "text/html",
  );
  const tplRoot = parsed.querySelector(".maintenance");
  if (!tplRoot) {
    throw new Error("maintenance.template.html: missing .maintenance root");
  }

  const wrapper = document.importNode(tplRoot, true);

  const brandName = config.name != null ? String(config.name).trim() : "";

  const logoWrap = wrapper.querySelector('[data-slot="logo-wrap"]');
  const logoSrc = config.logo != null ? String(config.logo).trim() : "";
  if (logoWrap) {
    if (logoSrc) {
      const img = document.createElement("img");
      img.className = "maintenance__logo";
      img.src = resolvePublicUrl(logoSrc);
      img.alt = brandName;
      img.width = 160;
      img.height = 48;
      img.decoding = "async";
      logoWrap.appendChild(img);
    } else {
      logoWrap.remove();
    }
  }

  const nameEl = wrapper.querySelector('[data-slot="name"]');
  if (nameEl) {
    if (brandName) {
      nameEl.textContent = brandName;
    } else {
      nameEl.remove();
    }
  }

  const cardHeader = wrapper.querySelector(".maintenance__card-header");
  if (cardHeader && cardHeader.children.length === 0) {
    cardHeader.remove();
  }

  const titleEl = wrapper.querySelector('[data-slot="title"]');
  const titleText = config.title != null ? String(config.title).trim() : "";
  if (titleEl) {
    if (titleText) {
      titleEl.textContent = titleText;
    } else {
      titleEl.remove();
    }
  }

  const textEl = wrapper.querySelector('[data-slot="text"]');
  const bodyText = config.text != null ? String(config.text).trim() : "";
  if (textEl) {
    if (bodyText) {
      textEl.textContent = bodyText;
    } else {
      textEl.remove();
    }
  }

  const scheduleEl = wrapper.querySelector('[data-slot="schedule"]');
  if (scheduleEl) {
    fillScheduleSection(scheduleEl, config);
  }

  const actionsEl = wrapper.querySelector('[data-slot="actions"]');
  const supportUrl =
    config.supportUrl != null ? String(config.supportUrl).trim() : "";
  if (actionsEl) {
    if (supportUrl) {
      const a = document.createElement("a");
      a.className = "maintenance__link";
      a.href = supportUrl;
      a.rel = "noopener noreferrer";
      a.textContent = supportLinkLabel(supportUrl, config.language);
      const btnHex =
        config.buttonColor != null && String(config.buttonColor).trim()
          ? String(config.buttonColor).trim()
          : config.brandColor != null && String(config.brandColor).trim()
            ? String(config.brandColor).trim()
            : "";
      if (btnHex) {
        a.style.color = readableTextOnBackground(btnHex);
      }
      actionsEl.appendChild(a);
    } else {
      actionsEl.remove();
    }
  }

  return wrapper;
}

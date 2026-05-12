/**
 * Recurring weekly maintenance windows defined in UTC.
 *
 * weekdayUtc: same as Date.prototype.getUTCDay() — 0 = Sunday … 6 = Saturday.
 * start / end: "HH:mm" 24h on that UTC calendar day; end must be after start (same day only;
 * windows crossing UTC midnight are not supported — use two entries).
 */

/** @typedef {{ weekdayUtc: number, start: string, end: string }} MaintenanceWindowUtc */

const MS_PER_DAY = 86400000;

/**
 * @param {string} s "HH:mm"
 * @returns {{ h: number, min: number } | null}
 */
export function parseHm(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    return null;
  }
  return { h, min };
}

/**
 * @param {MaintenanceWindowUtc[]} windows
 * @param {number} fromMs
 * @param {number} toMs
 * @returns {{ start: number, end: number }[]}
 */
export function enumerateOccurrencesUtc(windows, fromMs, toMs) {
  if (!Array.isArray(windows) || windows.length === 0) {
    return [];
  }
  const out = [];
  let dayStart = new Date(fromMs);
  dayStart.setUTCHours(0, 0, 0, 0);
  const limit = toMs;

  for (let t = dayStart.getTime(); t <= limit; t += MS_PER_DAY) {
    const day = new Date(t);
    const y = day.getUTCFullYear();
    const mo = day.getUTCMonth();
    const d = day.getUTCDate();
    const dow = day.getUTCDay();

    for (const w of windows) {
      if (w.weekdayUtc !== dow) continue;
      const ps = parseHm(w.start);
      const pe = parseHm(w.end);
      if (!ps || !pe) continue;
      const start = Date.UTC(y, mo, d, ps.h, ps.min, 0, 0);
      const end = Date.UTC(y, mo, d, pe.h, pe.min, 0, 0);
      if (end <= start) continue;
      out.push({ start, end });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

/**
 * @param {number} nowMs
 * @param {MaintenanceWindowUtc[]} windows
 */
export function getScheduleState(nowMs, windows) {
  const fromMs = nowMs - 14 * MS_PER_DAY;
  const toMs = nowMs + 70 * MS_PER_DAY;
  const occ = enumerateOccurrencesUtc(windows, fromMs, toMs);
  const active = occ.find((o) => nowMs >= o.start && nowMs < o.end);
  if (active) {
    return {
      inProgress: true,
      currentEnd: active.end,
      nextStart: null,
      nextEnd: null,
    };
  }
  const next = occ.find((o) => o.start > nowMs);
  return {
    inProgress: false,
    currentEnd: null,
    nextStart: next ? next.start : null,
    nextEnd: next ? next.end : null,
  };
}

/**
 * @param {string | undefined} lang config.language
 */
export function scheduleUiLocale(lang) {
  const L = String(lang || "en").trim().toLowerCase();
  if (L.startsWith("de")) return "de-DE";
  return "en-GB";
}

/**
 * @param {number} startMs
 * @param {number} endMs
 * @param {string} locale
 * @param {'UTC' | undefined} timeZone undefined = browser local
 */
export function formatWindowRange(startMs, endMs, locale, timeZone) {
  const opts = {
    dateStyle: "medium",
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  };
  const fmt = new Intl.DateTimeFormat(locale, opts);
  return `${fmt.format(startMs)} – ${fmt.format(endMs)}`;
}

/**
 * @param {number} ms
 * @param {string} locale
 * @param {'UTC' | undefined} timeZone
 */
export function formatInstant(ms, locale, timeZone) {
  const opts = {
    dateStyle: "medium",
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  };
  return new Intl.DateTimeFormat(locale, opts).format(ms);
}

/**
 * Long weekday name for a UTC weekday index (0=Sun … 6=Sat).
 * @param {number} weekdayUtc
 * @param {string} locale
 */
export function formatWeekdayUtc(weekdayUtc, locale) {
  const d = new Date(Date.UTC(2001, 0, 7 + weekdayUtc));
  return new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(d);
}

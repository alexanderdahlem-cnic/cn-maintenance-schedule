/**
 * Central server definitions: maintenance windows and shared server copy.
 * Domains in `config.js` reference a server via `serverId`; merged config = default → server → domain.
 *
 * maintenanceWindowsUtc: see README (weekdayUtc 0=Sun … 6=Sat, start/end "HH:mm" UTC same day).
 */

/** @typedef {{ weekdayUtc: number, start: string, end: string }} MaintenanceWindowUtc */

/**
 * @typedef {{
 *   maintenanceWindowsUtc: MaintenanceWindowUtc[],
 * }} ServerProfile
 */

/** @type {Record<string, ServerProfile>} */
export const SERVERS = {
  "gweb-prod-brandshelter-01": {
    maintenanceWindowsUtc: [{ weekdayUtc: 2, start: "02:00", end: "04:00" }],
  },
  "gweb-prod-centralnicregistry-01": {
    maintenanceWindowsUtc: [{ weekdayUtc: 3, start: "03:30", end: "05:00" }],
  },
  "gweb-prod-centralnicreseller-01": {
    maintenanceWindowsUtc: [{ weekdayUtc: 4, start: "01:00", end: "03:00" }],
  },
  "gweb-prod-pii-01": {
    maintenanceWindowsUtc: [{ weekdayUtc: 0, start: "05:00", end: "06:30" }],
  },
  "gweb-prod-safebrands-01": {
    maintenanceWindowsUtc: [{ weekdayUtc: 6, start: "22:00", end: "23:30" }],
  },
  "gweb-prod-teaminternet-01": {
    maintenanceWindowsUtc: [{ weekdayUtc: 1, start: "04:00", end: "06:00" }],
  },
  "gweb-prod-miscellaneous-01": {
    maintenanceWindowsUtc: [{ weekdayUtc: 5, start: "12:00", end: "14:00" }],
  },
};

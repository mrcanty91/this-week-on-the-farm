/**
 * daylabel.js — Shared weekday-from-ISO helpers.
 *
 * Extracted from rules-crops (T4) so rules-crew uses the SAME logic — §9 wants a
 * weekday day reference ("Thursday"), and the PRD reference card reads "...by 6am
 * Thursday." Crew previously rendered "Day N" (T14 review I-2/S1-1).
 *
 * Dates are parsed as LOCAL via explicit (y, m-1, d) to avoid the UTC-midnight
 * off-by-one that `new Date('YYYY-MM-DD')` would hit. Inputs are timezone=auto
 * local timestamps, so the local weekday is the correct one.
 */

/**
 * Weekday name for an ISO local date/timestamp ("YYYY-MM-DD" or "YYYY-MM-DDTHH:00").
 * @param {string} isoDate
 * @returns {string|null} e.g. "Monday", or null if unparseable
 */
export function weekdayFromISODate(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate ?? '');
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Day-of-week label for the hour at `hourIndex`, derived from the actual
 * index-aligned `time` timestamps (NOT a Sunday-anchored index).
 * @param {string[]} time   index-aligned hourly/daily time array
 * @param {number} hourIndex
 * @returns {string} e.g. "Wednesday" (falls back to "Day N" if time is missing)
 */
export function dayLabel(time, hourIndex) {
  return weekdayFromISODate(time?.[hourIndex]) ?? `Day ${Math.floor(hourIndex / 24) + 1}`;
}

/**
 * conus.js — Continental-US guard (T3, Wave 1).
 *
 * Enforced on RESOLVED coordinates BEFORE any forecast call/render. Primary
 * check is the coordinate bbox (works for typed + geolocation paths); when
 * present, country_code=US excluding AK/HI via admin1 may augment the typed
 * path. Spec: PRD §6/§7, PLAN T3.
 */

import { CONUS_BBOX } from './config.js';

/** US state names that are NOT in the lower-48. */
const EXCLUDED_STATES = new Set(['Alaska', 'Hawaii']);

/**
 * Is the resolved location inside the lower-48?
 * @param {{lat: number, lon: number, country_code?: string, admin1?: string}} loc
 * @returns {boolean}
 */
export function isInConus(loc) {
  const { lat, lon, country_code, admin1 } = loc;

  // Primary check: coordinate bounding box (inclusive on all edges).
  // Covers both geolocation and typed paths regardless of metadata presence.
  const inBbox =
    lat >= CONUS_BBOX.LAT_MIN &&
    lat <= CONUS_BBOX.LAT_MAX &&
    lon >= CONUS_BBOX.LON_MIN &&
    lon <= CONUS_BBOX.LON_MAX;

  if (!inBbox) return false;

  // Augment when geocode metadata is present: require US country_code and
  // exclude Alaska & Hawaii by admin1 name.
  if (country_code !== undefined || admin1 !== undefined) {
    if (country_code !== 'US') return false;
    if (admin1 !== undefined && EXCLUDED_STATES.has(admin1)) return false;
  }

  return true;
}

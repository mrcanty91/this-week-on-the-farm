/**
 * conus.js — Continental-US guard (T3, Wave 1). WAVE 0: STUB.
 *
 * Enforced on RESOLVED coordinates BEFORE any forecast call/render. Primary
 * check is the coordinate bbox (works for typed + geolocation paths); when
 * present, country_code=US excluding AK/HI via admin1 may augment the typed
 * path. Spec: PRD §6/§7, PLAN T3.
 */

import { CONUS_BBOX } from './config.js';

/**
 * Is the resolved location inside the lower-48?
 * @param {{lat: number, lon: number, country_code?: string, admin1?: string}} loc
 * @returns {boolean}
 */
export function isInConus(loc) {
  void CONUS_BBOX;
  void loc;
  throw new Error('not implemented: isInConus (Wave 1 / T3)');
}

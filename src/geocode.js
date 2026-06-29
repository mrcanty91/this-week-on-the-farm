/**
 * geocode.js — Place string → coordinates (T1, Wave 1). WAVE 0: STUB.
 *
 * Open-Meteo Geocoding API (no key). Disambiguates multiple matches by
 * `population` (highest wins). Spec: PRD §6, Memo §2 / gotcha #3.
 */

import { GEOCODING_ENDPOINT } from './config.js';

/**
 * A resolved place.
 * @typedef {Object} GeocodeResult
 * @property {number} lat
 * @property {number} lon
 * @property {string} name          resolved place name
 * @property {string} country_code  ISO-2 (e.g. "US")
 * @property {string} admin1        first admin level (US state)
 */

/**
 * Resolve a typed place/postal code to coordinates, or null if no match.
 * @param {string} place
 * @returns {Promise<GeocodeResult|null>}
 */
export async function geocode(place) {
  void GEOCODING_ENDPOINT;
  void place;
  throw new Error('not implemented: geocode (Wave 1 / T1)');
}

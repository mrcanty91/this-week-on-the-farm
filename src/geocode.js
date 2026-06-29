/**
 * geocode.js — Place string → coordinates (T1, Wave 1).
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
  const params = new URLSearchParams({
    name: place,
    count: '10',
    language: 'en',
    format: 'json',
  });

  const response = await fetch(`${GEOCODING_ENDPOINT}?${params}`);
  // Surface a server/network error as a meaningful throw rather than letting a
  // non-JSON error page blow up `.json()` with an opaque SyntaxError. A genuine
  // "no match" still returns null below (the API answers 200 with no `results`).
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();

  const results = data.results;
  if (!results || results.length === 0) {
    return null;
  }

  // Disambiguate by population (highest wins); missing population treated as 0.
  const best = results.reduce((winner, candidate) => {
    const wPop = winner.population ?? 0;
    const cPop = candidate.population ?? 0;
    return cPop > wPop ? candidate : winner;
  });

  return {
    lat: best.latitude,
    lon: best.longitude,
    name: best.name,
    country_code: best.country_code,
    admin1: best.admin1,
  };
}

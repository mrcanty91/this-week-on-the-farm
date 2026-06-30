/**
 * geocode.js — Place string → coordinates (T1, Wave 1; T1b, Wave 2).
 *
 * Open-Meteo Geocoding API (no key). Disambiguates multiple matches by
 * `population` (highest wins). Spec: PRD §6, Memo §2 / gotcha #3.
 *
 * T1b fix: Open-Meteo matches on the place name ONLY and returns 0 results
 * for composite inputs like "Fresno, CA" or "Honolulu, HI". We split on the
 * first comma, query with the city part only, and (when a US state was given)
 * filter the up-to-10 results by admin1 state name.
 *
 * Scope boundary: comma-separated "City, State" ONLY. Space-separated forms
 * like "Fresno CA" are NOT parsed — too ambiguous ("Carson City", "Kansas
 * City") — and are queried as-is (today's behavior for no-comma strings).
 */

import { GEOCODING_ENDPOINT } from './config.js';

// ---------------------------------------------------------------------------
// US State map — 50 states + DC.
// Keys: 2-letter USPS code (uppercase). Values: full state name as returned
// by Open-Meteo's `admin1` field.
// Alaska and Hawaii are included so geocode() succeeds and the downstream
// CONUS guard (conus.js) can reject them with the right message.
// ---------------------------------------------------------------------------
const US_STATE_MAP = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DC: 'District of Columbia',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

// Reverse map: full name (lowercased) → full name (canonical casing).
// Lets us accept "california" or "CALIFORNIA" as input.
const US_STATE_FULL_NAME_MAP = Object.fromEntries(
  Object.values(US_STATE_MAP).map((name) => [name.toLowerCase(), name])
);

/**
 * Resolve a region string (2-letter code or full name, case-insensitive) to
 * the canonical full state name, or null if unrecognised.
 * @param {string} region
 * @returns {string|null}
 */
function resolveState(region) {
  const trimmed = region.trim();

  // Try 2-letter code first
  const byCode = US_STATE_MAP[trimmed.toUpperCase()];
  if (byCode) return byCode;

  // Try full name (case-insensitive)
  const byName = US_STATE_FULL_NAME_MAP[trimmed.toLowerCase()];
  if (byName) return byName;

  return null;
}

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
 *
 * Supports "City, State" inputs: splits on the first comma, queries the API
 * with the city part only, and (when a recognised US state is given) filters
 * results to that state. State-specified but no match → null.
 *
 * @param {string} place
 * @returns {Promise<GeocodeResult|null>}
 */
export async function geocode(place) {
  // --- Parse ---------------------------------------------------------------
  const commaIdx = place.indexOf(',');
  let cityPart = place;
  let resolvedState = null; // null = no filter applied

  if (commaIdx !== -1) {
    cityPart = place.slice(0, commaIdx).trim();
    const regionPart = place.slice(commaIdx + 1).trim();
    if (regionPart) {
      resolvedState = resolveState(regionPart);
      // If unrecognised, resolvedState stays null → fall back to population ranking
    }
  }

  // --- Fetch ---------------------------------------------------------------
  const params = new URLSearchParams({
    name: cityPart,
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

  let results = data.results;
  if (!results || results.length === 0) {
    return null;
  }

  // --- Filter by state (when resolved) -------------------------------------
  if (resolvedState !== null) {
    const stateMatches = results.filter(
      (r) => (r.admin1 ?? '').toLowerCase() === resolvedState.toLowerCase()
    );
    // State was explicitly given but nothing matched → signal no match
    if (stateMatches.length === 0) {
      return null;
    }
    results = stateMatches;
  }

  // --- Disambiguate by population (highest wins) ---------------------------
  // Missing population is treated as 0.
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

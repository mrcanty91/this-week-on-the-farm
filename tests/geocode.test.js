/**
 * geocode.test.js — Unit tests for T1 geocode() (Wave 1) + T1b City,State fix.
 *
 * All tests mock global.fetch — NO live network calls.
 * Original cases (Wave 1):
 *  1. Single match (e.g. "Fresno") → mapped GeocodeResult
 *  2. Multiple matches ("Springfield") with differing population → picks highest
 *  3. Gibberish → empty/absent results → null
 *  4. Absent results key → null
 *  5. Non-OK HTTP → throws
 * New cases (T1b — City,State fix):
 *  6. "Fresno, CA" → queries name=Fresno, returns California match
 *  7. "Fresno, California" (full state name) → same California result
 *  8. "Honolulu, HI" → resolves (non-null) so CONUS guard can reject it
 *  9. "Springfield, IL" → state filter wins over higher-population Missouri
 * 10. "Fresno, TX" → state specified but no Texas match → null
 * 11. "Paris, Texasland" (bogus region) → falls back to highest-population (not null)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geocode } from '../src/geocode.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Install a one-shot fetch mock that returns the given Open-Meteo-shaped body.
 * Also captures the URL called so tests can assert query params.
 * Returns { restore, getLastUrl } — call restore() after the test.
 */
function mockFetch(responseBody) {
  const original = globalThis.fetch;
  let lastUrl = null;
  globalThis.fetch = async (url) => {
    lastUrl = url;
    return {
      ok: true,
      json: async () => responseBody,
    };
  };
  return {
    restore: () => { globalThis.fetch = original; },
    getLastUrl: () => lastUrl,
  };
}

/**
 * Legacy helper for tests that don't need URL capture — keeps existing
 * test call-sites unchanged.
 */
function mockFetchSimple(responseBody) {
  const { restore } = mockFetch(responseBody);
  return restore;
}

// ---------------------------------------------------------------------------
// Test 1 — Single clean match (Fresno, CA)
// ---------------------------------------------------------------------------
test('geocode: single match resolves to mapped GeocodeResult', async () => {
  const restore = mockFetchSimple({
    results: [
      {
        id: 1,
        name: 'Fresno',
        latitude: 36.7468,
        longitude: -119.7726,
        country_code: 'US',
        admin1: 'California',
        population: 542107,
      },
    ],
  });

  try {
    const result = await geocode('Fresno');
    assert.ok(result !== null, 'expected non-null result');
    assert.equal(result.lat, 36.7468);
    assert.equal(result.lon, -119.7726);
    assert.equal(result.name, 'Fresno');
    assert.equal(result.country_code, 'US');
    assert.equal(result.admin1, 'California');
  } finally {
    restore();
  }
});

// ---------------------------------------------------------------------------
// Test 2 — Multiple matches ("Springfield") → picks highest population
// ---------------------------------------------------------------------------
test('geocode: multiple matches with differing population selects highest population', async () => {
  // Springfield, MO (pop 169,176) should beat Springfield, IL (pop 114,394)
  // and Springfield, OR (pop 62,256 — missing here to also test missing-pop
  // treated as lowest).
  const restore = mockFetchSimple({
    results: [
      {
        id: 10,
        name: 'Springfield',
        latitude: 37.2153,
        longitude: -93.2982,
        country_code: 'US',
        admin1: 'Missouri',
        population: 169176,
      },
      {
        id: 11,
        name: 'Springfield',
        latitude: 39.7817,
        longitude: -89.6501,
        country_code: 'US',
        admin1: 'Illinois',
        population: 114394,
      },
      {
        id: 12,
        name: 'Springfield',
        latitude: 44.0462,
        longitude: -123.0220,
        country_code: 'US',
        admin1: 'Oregon',
        // population intentionally omitted — treated as 0 / lowest
      },
    ],
  });

  try {
    const result = await geocode('Springfield');
    assert.ok(result !== null, 'expected non-null result');
    // Must pick Missouri (highest population = 169176)
    assert.equal(result.lat, 37.2153, 'should pick Missouri lat (highest pop)');
    assert.equal(result.lon, -93.2982, 'should pick Missouri lon (highest pop)');
    assert.equal(result.admin1, 'Missouri');
  } finally {
    restore();
  }
});

// ---------------------------------------------------------------------------
// Test 3 — Gibberish → empty results → null
// ---------------------------------------------------------------------------
test('geocode: gibberish place with empty results returns null', async () => {
  const restore = mockFetchSimple({
    // Open-Meteo returns no `results` key (or an empty array) for no match
    results: [],
  });

  try {
    const result = await geocode('xyzzy_gibberish_place_12345');
    assert.equal(result, null, 'expected null for no match');
  } finally {
    restore();
  }
});

// ---------------------------------------------------------------------------
// Test 4 — Absent `results` key also returns null
// ---------------------------------------------------------------------------
test('geocode: response with absent results key returns null', async () => {
  const restore = mockFetchSimple({});

  try {
    const result = await geocode('nowhere');
    assert.equal(result, null, 'expected null when results key is absent');
  } finally {
    restore();
  }
});

// ---------------------------------------------------------------------------
// Test 5 — A non-OK HTTP status throws (not an opaque .json() SyntaxError,
// and NOT silently treated as "no match"). A server error is distinct from
// a genuine empty result.
// ---------------------------------------------------------------------------
test('geocode: non-OK HTTP status throws a meaningful error', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 503,
    statusText: 'Service Unavailable',
    json: async () => { throw new SyntaxError('Unexpected token < in JSON'); },
  });
  try {
    await assert.rejects(() => geocode('Fresno'), /503|Geocoding API error/);
  } finally {
    globalThis.fetch = original;
  }
});

// ===========================================================================
// T1b — City,State parsing tests (Wave 2 integration fix)
// ===========================================================================

// ---------------------------------------------------------------------------
// Test 6 — "Fresno, CA" queries name=Fresno, returns California match
// ---------------------------------------------------------------------------
test('geocode: "Fresno, CA" queries API with city only and returns California match', async () => {
  const { restore, getLastUrl } = mockFetch({
    results: [
      {
        id: 1,
        name: 'Fresno',
        latitude: 36.7468,
        longitude: -119.7726,
        country_code: 'US',
        admin1: 'California',
        population: 542107,
      },
      {
        id: 2,
        name: 'Fresno',
        latitude: 40.6064,
        longitude: -82.0127,
        country_code: 'US',
        admin1: 'Ohio',
        population: 500,
      },
    ],
  });

  try {
    const result = await geocode('Fresno, CA');

    // Assert the API was queried with city name only (not "Fresno, CA")
    const url = new URL(getLastUrl());
    assert.equal(
      url.searchParams.get('name'),
      'Fresno',
      'name param must be city only, not "Fresno, CA"'
    );

    // Assert state filter picked California result
    assert.ok(result !== null, 'expected non-null result');
    assert.equal(result.lat, 36.7468);
    assert.equal(result.lon, -119.7726);
    assert.equal(result.admin1, 'California');
  } finally {
    restore();
  }
});

// ---------------------------------------------------------------------------
// Test 7 — "Fresno, California" (full state name) → same California result
// ---------------------------------------------------------------------------
test('geocode: "Fresno, California" (full state name) returns California match', async () => {
  const { restore, getLastUrl } = mockFetch({
    results: [
      {
        id: 1,
        name: 'Fresno',
        latitude: 36.7468,
        longitude: -119.7726,
        country_code: 'US',
        admin1: 'California',
        population: 542107,
      },
      {
        id: 2,
        name: 'Fresno',
        latitude: 40.6064,
        longitude: -82.0127,
        country_code: 'US',
        admin1: 'Ohio',
        population: 500,
      },
    ],
  });

  try {
    const result = await geocode('Fresno, California');

    const url = new URL(getLastUrl());
    assert.equal(url.searchParams.get('name'), 'Fresno', 'name param must be city only');

    assert.ok(result !== null, 'expected non-null result');
    assert.equal(result.admin1, 'California');
    assert.equal(result.lat, 36.7468);
  } finally {
    restore();
  }
});

// ---------------------------------------------------------------------------
// Test 8 — "Honolulu, HI" resolves (non-null) so CONUS guard can reject it
// ---------------------------------------------------------------------------
test('geocode: "Honolulu, HI" resolves non-null (CONUS guard rejects later, not here)', async () => {
  const { restore } = mockFetch({
    results: [
      {
        id: 50,
        name: 'Honolulu',
        latitude: 21.3069,
        longitude: -157.8583,
        country_code: 'US',
        admin1: 'Hawaii',
        population: 374658,
      },
    ],
  });

  try {
    const result = await geocode('Honolulu, HI');
    assert.ok(result !== null, 'Honolulu,HI must geocode successfully');
    assert.equal(result.admin1, 'Hawaii');
    assert.equal(result.name, 'Honolulu');
  } finally {
    restore();
  }
});

// ---------------------------------------------------------------------------
// Test 9 — "Springfield, IL" state filter wins over higher-population Missouri
// ---------------------------------------------------------------------------
test('geocode: "Springfield, IL" picks Illinois result even though Missouri has higher population', async () => {
  const { restore } = mockFetch({
    results: [
      {
        id: 10,
        name: 'Springfield',
        latitude: 37.2153,
        longitude: -93.2982,
        country_code: 'US',
        admin1: 'Missouri',
        population: 169176,
      },
      {
        id: 11,
        name: 'Springfield',
        latitude: 39.7817,
        longitude: -89.6501,
        country_code: 'US',
        admin1: 'Illinois',
        population: 114394,
      },
    ],
  });

  try {
    const result = await geocode('Springfield, IL');
    assert.ok(result !== null, 'expected non-null result');
    assert.equal(result.admin1, 'Illinois', 'state filter must override population ranking');
    assert.equal(result.lat, 39.7817);
  } finally {
    restore();
  }
});

// ---------------------------------------------------------------------------
// Test 10 — "Fresno, TX" state specified but no Texas match → null
// ---------------------------------------------------------------------------
test('geocode: "Fresno, TX" returns null when no Texas result exists', async () => {
  const { restore } = mockFetch({
    results: [
      {
        id: 1,
        name: 'Fresno',
        latitude: 36.7468,
        longitude: -119.7726,
        country_code: 'US',
        admin1: 'California',
        population: 542107,
      },
      {
        id: 2,
        name: 'Fresno',
        latitude: 40.6064,
        longitude: -82.0127,
        country_code: 'US',
        admin1: 'Ohio',
        population: 500,
      },
    ],
  });

  try {
    const result = await geocode('Fresno, TX');
    assert.equal(result, null, 'state specified but no Texas Fresno → must return null');
  } finally {
    restore();
  }
});

// ---------------------------------------------------------------------------
// Test 11 — "Paris, Texasland" (bogus region) falls back to highest-population
// ---------------------------------------------------------------------------
test('geocode: unrecognized region "Texasland" is ignored; returns highest-population result', async () => {
  const { restore } = mockFetch({
    results: [
      {
        id: 20,
        name: 'Paris',
        latitude: 33.6609,
        longitude: -95.5555,
        country_code: 'US',
        admin1: 'Texas',
        population: 25171,
      },
      {
        id: 21,
        name: 'Paris',
        latitude: 38.2098,
        longitude: -84.2529,
        country_code: 'US',
        admin1: 'Kentucky',
        population: 9183,
      },
    ],
  });

  try {
    const result = await geocode('Paris, Texasland');
    assert.ok(result !== null, 'bogus region must not cause null; fall back to highest-pop');
    assert.equal(result.admin1, 'Texas', 'highest-population result should be Texas Paris');
  } finally {
    restore();
  }
});

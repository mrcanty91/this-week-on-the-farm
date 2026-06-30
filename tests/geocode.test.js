/**
 * geocode.test.js — Unit tests for T1 geocode() (Wave 1).
 *
 * All tests mock global.fetch — NO live network calls.
 * Three cases:
 *  1. Single match (e.g. "Fresno") → mapped GeocodeResult
 *  2. Multiple matches ("Springfield") with differing population → picks highest
 *  3. Gibberish → empty/absent results → null
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geocode } from '../src/geocode.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Install a one-shot fetch mock that returns the given Open-Meteo-shaped body.
 * Returns a restore function — call it after the test.
 */
function mockFetch(responseBody) {
  const original = globalThis.fetch;
  globalThis.fetch = async (_url) => ({
    ok: true,
    json: async () => responseBody,
  });
  return () => {
    globalThis.fetch = original;
  };
}

// ---------------------------------------------------------------------------
// Test 1 — Single clean match (Fresno, CA)
// ---------------------------------------------------------------------------
test('geocode: single match resolves to mapped GeocodeResult', async () => {
  const restore = mockFetch({
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
  const restore = mockFetch({
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
  const restore = mockFetch({
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
  const restore = mockFetch({});

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

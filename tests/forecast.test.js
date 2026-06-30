/**
 * forecast.test.js — Unit tests for getForecast() (T2, Wave 1).
 *
 * Mocks global.fetch — NO live network. Restored after each test.
 *
 * Critical contract tested here: ET₀ is passed through in inches
 * with NO second conversion (the API already converts it because
 * we request precipitation_unit=inch). A double conversion would
 * produce ~0.012 in instead of ~0.303 in, silently suppressing
 * every irrigation call.
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { getForecast } from '../src/forecast.js';

// ---------------------------------------------------------------------------
// Realistic fake Open-Meteo response.
// et0_fao_evapotranspiration is in INCHES because the request includes
// precipitation_unit=inch (the API converts for us — no ÷25.4 needed).
// ---------------------------------------------------------------------------
const FAKE_LAT = 36.7468;
const FAKE_LON = -119.7726;

const FAKE_HOURLY_TIMES = [
  '2026-06-29T00:00', '2026-06-29T01:00', '2026-06-29T02:00',
  '2026-06-29T03:00', '2026-06-29T04:00', '2026-06-29T05:00',
  '2026-06-29T06:00', '2026-06-29T07:00', '2026-06-29T08:00',
  '2026-06-29T09:00', '2026-06-29T10:00', '2026-06-29T11:00',
  '2026-06-29T12:00', '2026-06-29T13:00', '2026-06-29T14:00',
  '2026-06-29T15:00', '2026-06-29T16:00', '2026-06-29T17:00',
  '2026-06-29T18:00', '2026-06-29T19:00', '2026-06-29T20:00',
  '2026-06-29T21:00', '2026-06-29T22:00', '2026-06-29T23:00',
  '2026-06-30T00:00', '2026-06-30T01:00', '2026-06-30T02:00',
  '2026-06-30T03:00', '2026-06-30T04:00', '2026-06-30T05:00',
  '2026-06-30T06:00', '2026-06-30T07:00', '2026-06-30T08:00',
  '2026-06-30T09:00', '2026-06-30T10:00', '2026-06-30T11:00',
  '2026-06-30T12:00', '2026-06-30T13:00', '2026-06-30T14:00',
  '2026-06-30T15:00', '2026-06-30T16:00', '2026-06-30T17:00',
  '2026-06-30T18:00', '2026-06-30T19:00', '2026-06-30T20:00',
  '2026-06-30T21:00', '2026-06-30T22:00', '2026-06-30T23:00',
  '2026-07-01T00:00', '2026-07-01T01:00', '2026-07-01T02:00',
  '2026-07-01T03:00', '2026-07-01T04:00', '2026-07-01T05:00',
  '2026-07-01T06:00', '2026-07-01T07:00', '2026-07-01T08:00',
  '2026-07-01T09:00', '2026-07-01T10:00', '2026-07-01T11:00',
  '2026-07-01T12:00', '2026-07-01T13:00', '2026-07-01T14:00',
  '2026-07-01T15:00', '2026-07-01T16:00', '2026-07-01T17:00',
  '2026-07-01T18:00', '2026-07-01T19:00', '2026-07-01T20:00',
  '2026-07-01T21:00', '2026-07-01T22:00', '2026-07-01T23:00',
  '2026-07-02T00:00', '2026-07-02T01:00', '2026-07-02T02:00',
  '2026-07-02T03:00', '2026-07-02T04:00', '2026-07-02T05:00',
  '2026-07-02T06:00', '2026-07-02T07:00', '2026-07-02T08:00',
  '2026-07-02T09:00', '2026-07-02T10:00', '2026-07-02T11:00',
  '2026-07-02T12:00', '2026-07-02T13:00', '2026-07-02T14:00',
  '2026-07-02T15:00', '2026-07-02T16:00', '2026-07-02T17:00',
  '2026-07-02T18:00', '2026-07-02T19:00', '2026-07-02T20:00',
  '2026-07-02T21:00', '2026-07-02T22:00', '2026-07-02T23:00',
  '2026-07-03T00:00', '2026-07-03T01:00', '2026-07-03T02:00',
  '2026-07-03T03:00', '2026-07-03T04:00', '2026-07-03T05:00',
  '2026-07-03T06:00', '2026-07-03T07:00', '2026-07-03T08:00',
  '2026-07-03T09:00', '2026-07-03T10:00', '2026-07-03T11:00',
  '2026-07-03T12:00', '2026-07-03T13:00', '2026-07-03T14:00',
  '2026-07-03T15:00', '2026-07-03T16:00', '2026-07-03T17:00',
  '2026-07-03T18:00', '2026-07-03T19:00', '2026-07-03T20:00',
  '2026-07-03T21:00', '2026-07-03T22:00', '2026-07-03T23:00',
  '2026-07-04T00:00', '2026-07-04T01:00', '2026-07-04T02:00',
  '2026-07-04T03:00', '2026-07-04T04:00', '2026-07-04T05:00',
  '2026-07-04T06:00', '2026-07-04T07:00', '2026-07-04T08:00',
  '2026-07-04T09:00', '2026-07-04T10:00', '2026-07-04T11:00',
  '2026-07-04T12:00', '2026-07-04T13:00', '2026-07-04T14:00',
  '2026-07-04T15:00', '2026-07-04T16:00', '2026-07-04T17:00',
  '2026-07-04T18:00', '2026-07-04T19:00', '2026-07-04T20:00',
  '2026-07-04T21:00', '2026-07-04T22:00', '2026-07-04T23:00',
  '2026-07-05T00:00', '2026-07-05T01:00', '2026-07-05T02:00',
  '2026-07-05T03:00', '2026-07-05T04:00', '2026-07-05T05:00',
  '2026-07-05T06:00', '2026-07-05T07:00', '2026-07-05T08:00',
  '2026-07-05T09:00', '2026-07-05T10:00', '2026-07-05T11:00',
  '2026-07-05T12:00', '2026-07-05T13:00', '2026-07-05T14:00',
  '2026-07-05T15:00', '2026-07-05T16:00', '2026-07-05T17:00',
  '2026-07-05T18:00', '2026-07-05T19:00', '2026-07-05T20:00',
  '2026-07-05T21:00', '2026-07-05T22:00', '2026-07-05T23:00',
];

// 168 entries (7 days × 24 hours), all same value for simplicity
function makeHourlyArr(value) {
  return Array(168).fill(value);
}

const FAKE_DAILY_TIMES = [
  '2026-06-29', '2026-06-30', '2026-07-01',
  '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05',
];

// ET₀ already in inches (API converts because we pass precipitation_unit=inch)
const FAKE_ET0_IN_INCHES = [0.303, 0.331, 0.295, 0.312, 0.288, 0.345, 0.299];

const FAKE_RESPONSE = {
  latitude: FAKE_LAT,
  longitude: FAKE_LON,
  timezone: 'America/Los_Angeles',
  utc_offset_seconds: -25200,
  hourly_units: {
    time: 'iso8601',
    temperature_2m: '°F',
    apparent_temperature: '°F',
    precipitation: 'inch',
    precipitation_probability: '%',
    wind_speed_10m: 'mph',
    weather_code: 'wmo code',
  },
  hourly: {
    time: FAKE_HOURLY_TIMES,
    temperature_2m: makeHourlyArr(75.5),
    apparent_temperature: makeHourlyArr(78.2),
    precipitation: makeHourlyArr(0.0),
    precipitation_probability: makeHourlyArr(10),
    wind_speed_10m: makeHourlyArr(8.5),
    weather_code: makeHourlyArr(1),
  },
  daily_units: {
    time: 'iso8601',
    et0_fao_evapotranspiration: 'inch',
    precipitation_sum: 'inch',
    temperature_2m_max: '°F',
    temperature_2m_min: '°F',
    weather_code: 'wmo code',
  },
  daily: {
    time: FAKE_DAILY_TIMES,
    et0_fao_evapotranspiration: FAKE_ET0_IN_INCHES,
    precipitation_sum: [0.0, 0.1, 0.0, 0.0, 0.2, 0.0, 0.0],
    temperature_2m_max: [95.1, 97.3, 93.4, 91.2, 88.6, 96.0, 94.5],
    temperature_2m_min: [62.3, 64.1, 60.8, 59.4, 58.7, 63.2, 61.9],
    weather_code: [1, 2, 1, 0, 3, 1, 2],
  },
};

// Helper to create a mock fetch that returns a successful response
function makeMockFetch(responseBody, status = 200) {
  return async (_url) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => responseBody,
  });
}

describe('getForecast', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // -------------------------------------------------------------------------
  // Top-level structure
  // -------------------------------------------------------------------------
  test('returns a NormalizedForecast with correct top-level scalar fields', async () => {
    globalThis.fetch = makeMockFetch(FAKE_RESPONSE);
    const result = await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });

    assert.equal(result.latitude, FAKE_LAT);
    assert.equal(result.longitude, FAKE_LON);
    assert.equal(result.timezone, 'America/Los_Angeles');
    assert.equal(result.utc_offset_seconds, -25200);
  });

  // -------------------------------------------------------------------------
  // Hourly arrays — presence and index-alignment
  // -------------------------------------------------------------------------
  test('hourly object has all required fields and they are index-aligned to time', async () => {
    globalThis.fetch = makeMockFetch(FAKE_RESPONSE);
    const result = await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });
    const { hourly } = result;

    assert.ok(Array.isArray(hourly.time), 'hourly.time should be an array');
    assert.equal(hourly.time.length, 168);

    const requiredHourlyFields = [
      'temperature_2m',
      'apparent_temperature',
      'precipitation',
      'precipitation_probability',
      'wind_speed_10m',
      'weather_code',
    ];

    for (const field of requiredHourlyFields) {
      assert.ok(Array.isArray(hourly[field]), `hourly.${field} should be an array`);
      assert.equal(
        hourly[field].length,
        hourly.time.length,
        `hourly.${field} length should equal hourly.time.length`,
      );
    }
  });

  test('hourly arrays contain correct values from the API response', async () => {
    globalThis.fetch = makeMockFetch(FAKE_RESPONSE);
    const result = await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });
    const { hourly } = result;

    assert.deepEqual(hourly.time, FAKE_HOURLY_TIMES);
    assert.deepEqual(hourly.temperature_2m, makeHourlyArr(75.5));
    assert.deepEqual(hourly.apparent_temperature, makeHourlyArr(78.2));
    assert.deepEqual(hourly.precipitation, makeHourlyArr(0.0));
    assert.deepEqual(hourly.precipitation_probability, makeHourlyArr(10));
    assert.deepEqual(hourly.wind_speed_10m, makeHourlyArr(8.5));
    assert.deepEqual(hourly.weather_code, makeHourlyArr(1));
  });

  // -------------------------------------------------------------------------
  // Daily arrays — presence and index-alignment
  // -------------------------------------------------------------------------
  test('daily object has all required fields and they are index-aligned to time', async () => {
    globalThis.fetch = makeMockFetch(FAKE_RESPONSE);
    const result = await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });
    const { daily } = result;

    assert.ok(Array.isArray(daily.time), 'daily.time should be an array');
    assert.equal(daily.time.length, 7);

    const requiredDailyFields = [
      'et0',
      'precipitation_sum',
      'temperature_2m_max',
      'temperature_2m_min',
      'weather_code',
    ];

    for (const field of requiredDailyFields) {
      assert.ok(Array.isArray(daily[field]), `daily.${field} should be an array`);
      assert.equal(
        daily[field].length,
        daily.time.length,
        `daily.${field} length should equal daily.time.length`,
      );
    }
  });

  test('daily arrays contain correct values from the API response', async () => {
    globalThis.fetch = makeMockFetch(FAKE_RESPONSE);
    const result = await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });
    const { daily } = result;

    assert.deepEqual(daily.time, FAKE_DAILY_TIMES);
    assert.deepEqual(daily.precipitation_sum, [0.0, 0.1, 0.0, 0.0, 0.2, 0.0, 0.0]);
    assert.deepEqual(daily.temperature_2m_max, [95.1, 97.3, 93.4, 91.2, 88.6, 96.0, 94.5]);
    assert.deepEqual(daily.temperature_2m_min, [62.3, 64.1, 60.8, 59.4, 58.7, 63.2, 61.9]);
    assert.deepEqual(daily.weather_code, [1, 2, 1, 0, 3, 1, 2]);
  });

  // -------------------------------------------------------------------------
  // ET₀ CONVERSION REGRESSION GUARD (CRITICAL - PM-CONFIRMED CONTRACT)
  //
  // The API returns et0_fao_evapotranspiration already in INCHES because
  // we request precipitation_unit=inch. T2 MUST pass through unchanged.
  // A second ÷25.4 would double-convert (0.303 → 0.012 in) and silently
  // suppress every irrigation call.
  // -------------------------------------------------------------------------
  test('ET₀ is passed through in inches unchanged — no second conversion applied', async () => {
    globalThis.fetch = makeMockFetch(FAKE_RESPONSE);
    const result = await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });

    // These are the raw inch values the API returns. They must be unchanged.
    assert.deepEqual(
      result.daily.et0,
      [0.303, 0.331, 0.295, 0.312, 0.288, 0.345, 0.299],
      'ET₀ must equal the raw API inch values — no ÷25.4 applied',
    );
  });

  test('ET₀ values are NOT double-converted (÷25.4 would give ~0.012)', async () => {
    globalThis.fetch = makeMockFetch(FAKE_RESPONSE);
    const result = await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });

    // If double-converted, first value would be ~0.303/25.4 ≈ 0.01193
    const firstET0 = result.daily.et0[0];
    assert.ok(
      firstET0 > 0.1,
      `ET₀[0] = ${firstET0} is suspiciously small — likely double-converted. Expected ~0.303`,
    );
    assert.ok(
      Math.abs(firstET0 - 0.303) < 0.001,
      `ET₀[0] should be 0.303 (pass-through), got ${firstET0}`,
    );
  });

  // -------------------------------------------------------------------------
  // Malformed-response guard (T14 review I-1)
  //
  // Open-Meteo answers HTTP 200 with {error:true, reason:'...'} for some bad
  // requests (no hourly/daily). getForecast must throw a CATCHABLE, MEANINGFUL
  // Error — not an opaque "Cannot read properties of undefined (reading 'time')"
  // TypeError that violates the module's documented "throws a meaningful Error".
  // -------------------------------------------------------------------------
  test('throws a meaningful error on a 200 response with an error body (no hourly/daily)', async () => {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ error: true, reason: 'Latitude must be in range -90 to 90' }),
    });

    await assert.rejects(
      getForecast({ lat: 999, lon: 999 }),
      (err) =>
        err instanceof Error &&
        /Latitude must be in range|malformed/i.test(err.message) &&
        !/Cannot read properties/.test(err.message),
      'must throw a meaningful Error citing the API reason, not a TypeError',
    );
  });

  // -------------------------------------------------------------------------
  // API field mapping: et0_fao_evapotranspiration → daily.et0
  // -------------------------------------------------------------------------
  test('maps et0_fao_evapotranspiration API field to daily.et0 in the result', async () => {
    globalThis.fetch = makeMockFetch(FAKE_RESPONSE);
    const result = await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });

    // The normalized key must be 'et0', not 'et0_fao_evapotranspiration'
    assert.ok('et0' in result.daily, 'result.daily.et0 must exist');
    assert.equal(
      'et0_fao_evapotranspiration' in result.daily,
      false,
      'raw API key et0_fao_evapotranspiration must not leak into normalized result',
    );
  });

  // -------------------------------------------------------------------------
  // URL / param construction — uses FORECAST_ENDPOINT + buildForecastParams
  // -------------------------------------------------------------------------
  test('fetches from the Open-Meteo forecast endpoint with correct params', async () => {
    let capturedUrl;
    globalThis.fetch = async (url) => {
      capturedUrl = url;
      return { ok: true, json: async () => FAKE_RESPONSE };
    };

    await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });

    assert.ok(
      capturedUrl.startsWith('https://api.open-meteo.com/v1/forecast'),
      `URL should start with forecast endpoint, got: ${capturedUrl}`,
    );
    assert.ok(
      capturedUrl.includes(`latitude=${FAKE_LAT}`),
      'URL must include latitude param',
    );
    assert.ok(
      capturedUrl.includes(`longitude=${FAKE_LON}`),
      'URL must include longitude param',
    );
    assert.ok(
      capturedUrl.includes('precipitation_unit=inch'),
      'URL must include precipitation_unit=inch (drives ET₀ conversion)',
    );
    assert.ok(
      capturedUrl.includes('timezone=auto'),
      'URL must include timezone=auto',
    );
    assert.ok(
      capturedUrl.includes('forecast_days=7'),
      'URL must include forecast_days=7',
    );
  });

  // -------------------------------------------------------------------------
  // Error handling — non-OK HTTP status throws, never returns partial object
  // -------------------------------------------------------------------------
  test('throws an Error on non-OK HTTP status (500) and does not return a partial object', async () => {
    globalThis.fetch = makeMockFetch({ error: 'internal server error' }, 500);

    await assert.rejects(
      () => getForecast({ lat: FAKE_LAT, lon: FAKE_LON }),
      (err) => {
        assert.ok(err instanceof Error, 'must throw an Error instance');
        return true;
      },
    );
  });

  test('throws an Error on 404 Not Found', async () => {
    globalThis.fetch = makeMockFetch({ reason: 'not found' }, 404);

    await assert.rejects(
      () => getForecast({ lat: FAKE_LAT, lon: FAKE_LON }),
      (err) => {
        assert.ok(err instanceof Error);
        return true;
      },
    );
  });

  test('throws an Error when fetch itself rejects (network failure)', async () => {
    globalThis.fetch = async () => {
      throw new Error('Network connection refused');
    };

    await assert.rejects(
      () => getForecast({ lat: FAKE_LAT, lon: FAKE_LON }),
      (err) => {
        assert.ok(err instanceof Error, 'must propagate as an Error');
        return true;
      },
    );
  });

  test('never returns a partial object on network failure (PRD §10)', async () => {
    globalThis.fetch = async () => {
      throw new Error('timeout');
    };

    let result;
    let threw = false;
    try {
      result = await getForecast({ lat: FAKE_LAT, lon: FAKE_LON });
    } catch {
      threw = true;
    }

    assert.ok(threw, 'must throw, not return');
    assert.equal(result, undefined, 'must not return a partial object');
  });
});

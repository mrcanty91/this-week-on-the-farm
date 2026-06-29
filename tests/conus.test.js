/**
 * conus.test.js — Unit tests for isInConus (T3, Wave 1).
 *
 * Two entry paths tested:
 *   1. Coordinate-only: {lat, lon} — primary check (covers geolocation path)
 *   2. Augmented: {lat, lon, country_code, admin1} — typed-path with geocode fields
 *
 * Spec refs: PRD §6, §7; PLAN T3; CONUS_BBOX in config.js.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isInConus } from '../src/conus.js';

/* ================================================================
   PATH 1 — coordinate-only inputs (bbox check)
   ================================================================ */

test('Fresno CA coord → true (CONUS interior)', () => {
  assert.equal(isInConus({ lat: 36.7, lon: -119.8 }), true);
});

test('Honolulu HI coord → false (outside bbox lon)', () => {
  assert.equal(isInConus({ lat: 21.3, lon: -157.8 }), false);
});

test('coord in Pacific outside bbox west boundary → false', () => {
  // Longitude -157.8 is west of LON_MIN (-125), unambiguously outside bbox.
  assert.equal(isInConus({ lat: 35.0, lon: -157.8 }), false);
});

test('lat below LAT_MIN (23°N) → false', () => {
  assert.equal(isInConus({ lat: 23, lon: -100 }), false);
});

test('lat above LAT_MAX (51°N) → false', () => {
  assert.equal(isInConus({ lat: 51, lon: -100 }), false);
});

test('lon west of LON_MIN (-126°W) → false', () => {
  assert.equal(isInConus({ lat: 40, lon: -126 }), false);
});

test('lon east of LON_MAX (-65°W) → false', () => {
  assert.equal(isInConus({ lat: 40, lon: -65 }), false);
});

test('exact bbox corner LAT_MIN/LON_MIN → true (inclusive bounds)', () => {
  // Boundary values: 24°N, -125°W — included
  assert.equal(isInConus({ lat: 24, lon: -125 }), true);
});

test('exact bbox corner LAT_MAX/LON_MAX → true (inclusive bounds)', () => {
  // Boundary values: 50°N, -66°W — included
  assert.equal(isInConus({ lat: 50, lon: -66 }), true);
});

test('Phoenix AZ coord → true', () => {
  assert.equal(isInConus({ lat: 33.4, lon: -112.1 }), true);
});

/* ================================================================
   PATH 2 — augmented inputs: {lat, lon, country_code, admin1}
   ================================================================ */

test('US + California → true', () => {
  assert.equal(isInConus({ lat: 36.7, lon: -119.8, country_code: 'US', admin1: 'California' }), true);
});

test('US + Alaska → false (excluded even if coord could slip bbox edge)', () => {
  // Juneau AK: lat ~58.3 is outside bbox anyway, but admin1 must also exclude it
  assert.equal(isInConus({ lat: 58.3, lon: -134.4, country_code: 'US', admin1: 'Alaska' }), false);
});

test('US + Hawaii → false', () => {
  assert.equal(isInConus({ lat: 21.3, lon: -157.8, country_code: 'US', admin1: 'Hawaii' }), false);
});

test('CA (Canada) + Ontario → false (non-US country_code)', () => {
  // Toronto: lat/lon is inside CONUS bbox, but country_code is not US
  assert.equal(isInConus({ lat: 43.6, lon: -79.4, country_code: 'CA', admin1: 'Ontario' }), false);
});

test('US + Texas → true', () => {
  assert.equal(isInConus({ lat: 31.9, lon: -99.9, country_code: 'US', admin1: 'Texas' }), true);
});

test('US + Florida → true', () => {
  assert.equal(isInConus({ lat: 27.9, lon: -82.4, country_code: 'US', admin1: 'Florida' }), true);
});

test('US + Washington → true', () => {
  assert.equal(isInConus({ lat: 47.5, lon: -120.5, country_code: 'US', admin1: 'Washington' }), true);
});

test('MX (Mexico) + Sonora → false', () => {
  assert.equal(isInConus({ lat: 30.0, lon: -110.0, country_code: 'MX', admin1: 'Sonora' }), false);
});

/* ================================================================
   PRD §6 canonical spec examples (spec says these specifically)
   ================================================================ */

test('spec example: Fresno → true', () => {
  assert.equal(isInConus({ lat: 36.7, lon: -119.8 }), true);
});

test('spec example: Honolulu → false', () => {
  assert.equal(isInConus({ lat: 21.3, lon: -157.8 }), false);
});

test('spec example: Toronto → false (via augmented path)', () => {
  // Toronto coord is inside the bbox; only fails when country_code supplied
  assert.equal(isInConus({ lat: 43.6, lon: -79.4, country_code: 'CA', admin1: 'Ontario' }), false);
});

/* ================================================================
   admin1 present but country_code absent must NOT falsely reject —
   admin1 alone is not enough to invoke the country exclusion path.
   ================================================================ */

test('admin1-only (no country_code), in-bbox → true (bbox governs)', () => {
  assert.equal(isInConus({ lat: 36.7, lon: -119.8, admin1: 'California' }), true);
});

test('admin1-only Alaska name but in-bbox coord, no country_code → true (not rejected on admin1 alone)', () => {
  // Without country_code we cannot trust admin1 to exclude; bbox is authoritative.
  assert.equal(isInConus({ lat: 36.7, lon: -119.8, admin1: 'Alaska' }), true);
});

/**
 * contract.test.js — WAVE 0 module-contract guard.
 *
 * Proves every PLAN-architecture module resolves and exposes its named entry
 * point as a function (so the Wave-1 fan-out can import against a stable
 * surface), and pins the ET₀ regression guard that the whole WAVE 0 hinges on.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getForecast } from '../src/forecast.js';
import { geocode } from '../src/geocode.js';
import { isInConus } from '../src/conus.js';
import { cropCards } from '../src/rules-crops.js';
import { crewCards } from '../src/rules-crew.js';
import { prioritize } from '../src/prioritize.js';
import { renderCard } from '../src/card.js';
import { renderStrip } from '../src/strip.js';
import { mountLocationInput } from '../src/locationInput.js';
import { UNITS, DAILY_FIELDS } from '../src/config.js';

test('every module exposes its named entry point as a function', () => {
  for (const fn of [
    getForecast, geocode, isInConus, cropCards, crewCards,
    prioritize, renderCard, renderStrip, mountLocationInput,
  ]) {
    assert.equal(typeof fn, 'function');
  }
});

// NOTE (WAVE 1): the Wave-0 "stubs throw 'not implemented'" guards were retired
// here once the parallel implementers began landing real bodies — each module is
// now covered by its own tests/<module>.test.js. The entry-point surface check
// above and the ET₀ contract guard below remain the cross-module invariants.

/**
 * ET₀ REGRESSION GUARD (the WAVE-0 smoke-test finding).
 *
 * Live Open-Meteo returns et0_fao_evapotranspiration in INCHES whenever
 * precipitation_unit=inch is requested (verified 2026-06-29). Because the
 * forecast call MUST request inches for precipitation, ET₀ arrives in inches
 * and T2 must NOT apply a second ÷25.4 (that would double-convert and silently
 * suppress every irrigation call). This test pins the two invariants that keep
 * that contract intact:
 *   1. the request asks for inches (so the API converts ET₀ for us), and
 *   2. ET₀ is a daily field consumed downstream as inches.
 */
test('ET₀-in-inches contract: precipitation_unit=inch drives ET₀ conversion', () => {
  assert.equal(UNITS.precipitation_unit, 'inch');
  assert.ok(DAILY_FIELDS.includes('et0_fao_evapotranspiration'));
});

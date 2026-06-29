/**
 * config.test.js — WAVE 0 contract guard for src/config.js.
 *
 * Locks the §8 thresholds, the CONUS bbox, imperial units, the underscore
 * parameter names, and the ET₀ handling against accidental drift. These run in
 * CI on every PR (node --test), so a Wave-1 change that, say, reverts a
 * threshold or reintroduces a legacy param name fails the build.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as cfg from '../src/config.js';

test('§8 Crops thresholds match the spec exactly', () => {
  assert.equal(cfg.SKIP_IRRIGATION_PRECIP_IN, 0.3);
  assert.equal(cfg.IRRIGATION_LOOKAHEAD_HOURS, 48);
  assert.equal(cfg.ET0_DEFICIT_HIGH_IN_PER_DAY, 0.5);
  assert.equal(cfg.PRECIP_PROBABILITY_LOW_PCT, 40);
  assert.equal(cfg.IRRIGATE_ET0_IN_PER_DAY, 0.3);
  assert.equal(cfg.SPRAY_WIND_MAX_MPH, 10);
  assert.equal(cfg.SPRAY_PRECIP_WINDOW_HOURS, 4);
  assert.equal(cfg.SPRAY_TEMP_MIN_F, 50);
  assert.equal(cfg.SPRAY_TEMP_MAX_F, 90);
  assert.equal(cfg.FROST_TEMP_F, 34);
  assert.equal(cfg.HARD_FROST_TEMP_F, 28);
});

test('§8 Crew thresholds match the spec exactly', () => {
  assert.equal(cfg.WORKABLE_SUSTAINED_RAIN_HOURS, 1);
  assert.equal(cfg.WORKABLE_MAX_TEMP_F, 100);
  assert.equal(cfg.EARLY_START_TEMP_F, 95);
  assert.equal(cfg.NORMAL_HOURS_HIGH_BELOW_F, 90);
  assert.equal(cfg.HEAT_RISK_APPARENT_F, 103);
  assert.equal(cfg.HEAT_DANGER_APPARENT_F, 125);
});

test('§8 card count + priority ladder', () => {
  assert.equal(cfg.CARD_TARGET_MIN, 4);
  assert.equal(cfg.CARD_TARGET_MAX, 6);
  assert.equal(cfg.CARD_FLOOR, 4);
  // Frost is top priority; Irrigate is lowest (§8 ladder).
  assert.ok(cfg.CARD_PRIORITY.FROST < cfg.CARD_PRIORITY.HEAT);
  assert.equal(cfg.CARD_PRIORITY.FROST, 1);
  assert.equal(cfg.CARD_PRIORITY.IRRIGATE, 6);
});

test('§6 CONUS bbox is the lower-48 box (~24–50°N, −125 to −66°W)', () => {
  assert.equal(cfg.CONUS_BBOX.LAT_MIN, 24);
  assert.equal(cfg.CONUS_BBOX.LAT_MAX, 50);
  assert.equal(cfg.CONUS_BBOX.LON_MIN, -125);
  assert.equal(cfg.CONUS_BBOX.LON_MAX, -66);
});

test('§7 imperial units', () => {
  assert.equal(cfg.UNITS.temperature_unit, 'fahrenheit');
  assert.equal(cfg.UNITS.wind_speed_unit, 'mph');
  assert.equal(cfg.UNITS.precipitation_unit, 'inch');
});

test('§7 field lists use MODERN underscore names, no legacy spellings', () => {
  const all = [...cfg.HOURLY_FIELDS, ...cfg.DAILY_FIELDS];
  assert.ok(cfg.HOURLY_FIELDS.includes('wind_speed_10m'));
  assert.ok(all.includes('weather_code'));
  assert.ok(cfg.DAILY_FIELDS.includes('et0_fao_evapotranspiration'));
  // Legacy aliases must never appear.
  for (const f of all) {
    assert.notEqual(f, 'windspeed_10m');
    assert.notEqual(f, 'weathercode');
  }
});

test('ET0_MM_TO_IN is the mm→inch factor', () => {
  assert.equal(cfg.ET0_MM_TO_IN, 1 / 25.4);
});

test('buildForecastParams emits the production query (underscore params, imperial, tz=auto, 7 days)', () => {
  const p = cfg.buildForecastParams(36.7468, -119.7726);
  assert.equal(p.get('latitude'), '36.7468');
  assert.equal(p.get('longitude'), '-119.7726');
  assert.equal(p.get('timezone'), 'auto'); // §7 directive — local-time correctness
  assert.equal(p.get('forecast_days'), '7');
  assert.equal(p.get('temperature_unit'), 'fahrenheit');
  assert.equal(p.get('wind_speed_unit'), 'mph');
  // precipitation_unit=inch is THE mechanism that makes the API return ET₀ in
  // inches already — see the ET₀ regression guard in contract.test.js.
  assert.equal(p.get('precipitation_unit'), 'inch');
  assert.ok(p.get('hourly').includes('wind_speed_10m'));
  assert.ok(p.get('daily').includes('et0_fao_evapotranspiration'));
});

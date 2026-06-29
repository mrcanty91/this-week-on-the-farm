/**
 * rules-crops.test.js — TDD tests for CR-01..04 crop rules (T4, Wave 1).
 *
 * Fixtures use ET₀ in INCHES (the normalized forecast contract — see forecast.js
 * header and ET₀-in-inches contract). All comparisons are direct; never re-convert.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { cropCards } from '../src/rules-crops.js';
import {
  CARD_PRIORITY,
  SKIP_IRRIGATION_PRECIP_IN,
  IRRIGATE_ET0_IN_PER_DAY,
  ET0_DEFICIT_HIGH_IN_PER_DAY,
  PRECIP_PROBABILITY_LOW_PCT,
  FROST_TEMP_F,
  HARD_FROST_TEMP_F,
  SPRAY_WIND_MAX_MPH,
  SPRAY_TEMP_MIN_F,
  SPRAY_TEMP_MAX_F,
} from '../src/config.js';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

/**
 * Build a minimal NormalizedForecast with N*24 hours (7 days default).
 * All hourly arrays are parallel and index-aligned to `hourly.time`.
 *
 * @param {object} opts
 * @param {number[]} [opts.hourly_temp]          temperature_2m per hour (°F)
 * @param {number[]} [opts.hourly_precip]        precipitation per hour (in)
 * @param {number[]} [opts.hourly_precip_prob]   precipitation_probability per hour (%)
 * @param {number[]} [opts.hourly_wind]          wind_speed_10m per hour (mph)
 * @param {number[]} [opts.daily_et0]            ET₀ per day (in/day) — INCHES
 * @param {number[]} [opts.daily_precip_sum]     precipitation_sum per day (in)
 * @returns {import('../src/forecast.js').NormalizedForecast}
 */
function makeForecast({
  hourly_temp = null,
  hourly_precip = null,
  hourly_precip_prob = null,
  hourly_wind = null,
  daily_et0 = null,
  daily_precip_sum = null,
} = {}) {
  const HOURS = 7 * 24; // 168 hours
  const DAYS = 7;

  const times = Array.from({ length: HOURS }, (_, i) => {
    const d = new Date(2026, 5, 29, i % 24, 0, 0); // June 29, 2026
    return d.toISOString();
  });

  const dailyTimes = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(2026, 5, 29 + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  return {
    latitude: 36.7,
    longitude: -119.8,
    timezone: 'America/Los_Angeles',
    utc_offset_seconds: -25200,
    hourly: {
      time: times,
      temperature_2m: hourly_temp ?? Array(HOURS).fill(72),
      apparent_temperature: Array(HOURS).fill(72),
      precipitation: hourly_precip ?? Array(HOURS).fill(0),
      precipitation_probability: hourly_precip_prob ?? Array(HOURS).fill(10),
      wind_speed_10m: hourly_wind ?? Array(HOURS).fill(5),
      weather_code: Array(HOURS).fill(0),
    },
    daily: {
      time: dailyTimes,
      et0: daily_et0 ?? Array(DAYS).fill(0.2),        // INCHES — already converted
      precipitation_sum: daily_precip_sum ?? Array(DAYS).fill(0),
      temperature_2m_max: Array(DAYS).fill(80),
      temperature_2m_min: Array(DAYS).fill(60),
      weather_code: Array(DAYS).fill(0),
    },
  };
}

// ─── CR-01 Skip Irrigation ────────────────────────────────────────────────────

describe('CR-01 Skip Irrigation', () => {
  test('fires when precipitation ≥ 0.3in in next 48h', () => {
    // Put 0.35in of precip in hour 10 (within the 48h lookahead window)
    const precip = Array(168).fill(0);
    precip[10] = SKIP_IRRIGATION_PRECIP_IN + 0.05; // 0.35in

    const forecast = makeForecast({ hourly_precip: precip });
    const cards = cropCards(forecast);

    const skipCard = cards.find(c => c.ruleId === 'CR-01');
    assert.ok(skipCard, 'CR-01 card should fire when precip ≥ 0.3in in 48h');
    assert.equal(skipCard.group, 'CROPS');
    assert.equal(skipCard.ruleId, 'CR-01');
    assert.equal(skipCard.priority, CARD_PRIORITY.SPRAY_OR_SKIP);
    assert.ok(!skipCard.call.includes('!'), 'call must not include exclamation marks');
    assert.ok(skipCard.call.length <= 80, 'call must be ≤ 80 chars');
    assert.ok(skipCard.title.length <= 40, 'title must be ≤ 40 chars');
    assert.ok(skipCard.numberLine.length <= 100, 'numberLine must be ≤ 100 chars');
    assert.ok(skipCard.confidence.length <= 100, 'confidence must be ≤ 100 chars');
    // Call should start with Skip
    assert.match(skipCard.call, /^Skip/i, 'CR-01 call must start with "Skip"');
    // numberLine should reference a real number derived from forecast data
    assert.match(skipCard.numberLine, /\d/, 'numberLine must contain at least one number');
  });

  test('does NOT fire when precipitation < 0.3in in next 48h', () => {
    const precip = Array(168).fill(0);
    precip[5] = 0.1; // only 0.1in — below threshold

    const forecast = makeForecast({
      hourly_precip: precip,
      daily_et0: Array(7).fill(0.1), // low ET₀ so CR-02 also doesn't fire
    });
    const cards = cropCards(forecast);
    const skipCard = cards.find(c => c.ruleId === 'CR-01');
    assert.equal(skipCard, undefined, 'CR-01 should not fire on < 0.3in precip');
  });

  test('does NOT fire when precip is only beyond 48h window', () => {
    const precip = Array(168).fill(0);
    precip[72] = 1.0; // 0.5in at hour 72 — outside 48h window

    const forecast = makeForecast({
      hourly_precip: precip,
      daily_et0: Array(7).fill(0.1),
    });
    const cards = cropCards(forecast);
    const skipCard = cards.find(c => c.ruleId === 'CR-01');
    assert.equal(skipCard, undefined, 'CR-01 should not fire when precip is outside 48h window');
  });

  test('counter-rule: high ET₀ + low precip probability overrides Skip → returns Irrigate (CR-02)', () => {
    // Set up: 0.4in of precip in 48h (would fire Skip) BUT high ET₀ + low precip prob
    const precip = Array(168).fill(0);
    precip[10] = 0.4; // 0.4in — above Skip threshold

    const precip_prob = Array(168).fill(PRECIP_PROBABILITY_LOW_PCT - 5); // 35% — below threshold

    const forecast = makeForecast({
      hourly_precip: precip,
      hourly_precip_prob: precip_prob,
      // ET₀ > 0.5in/day (high deficit)
      daily_et0: Array(7).fill(ET0_DEFICIT_HIGH_IN_PER_DAY + 0.1), // 0.6in/day
    });
    const cards = cropCards(forecast);

    // Skip card should NOT be present
    const skipCard = cards.find(c => c.ruleId === 'CR-01');
    assert.equal(skipCard, undefined, 'CR-01 Skip should not fire when counter-rule is active');

    // Irrigate card should be present
    const irrigateCard = cards.find(c => c.ruleId === 'CR-02');
    assert.ok(irrigateCard, 'CR-02 Irrigate should fire when counter-rule overrides Skip');
    assert.match(irrigateCard.call, /^Irrigate/i, 'CR-02 call must start with "Irrigate"');
  });
});

// ─── CR-02 Irrigate ───────────────────────────────────────────────────────────

describe('CR-02 Irrigate', () => {
  test('fires when ET₀ > 0.3in/day AND no rain in 48h', () => {
    const forecast = makeForecast({
      hourly_precip: Array(168).fill(0),   // no rain
      daily_et0: Array(7).fill(IRRIGATE_ET0_IN_PER_DAY + 0.01), // 0.31in — just above threshold
    });
    const cards = cropCards(forecast);

    const irrigateCard = cards.find(c => c.ruleId === 'CR-02');
    assert.ok(irrigateCard, 'CR-02 should fire when ET₀ > 0.3 and no rain');
    assert.equal(irrigateCard.group, 'CROPS');
    assert.equal(irrigateCard.priority, CARD_PRIORITY.IRRIGATE);
    assert.match(irrigateCard.call, /^Irrigate/i, 'call must start with "Irrigate"');
    assert.ok(!irrigateCard.call.includes('!'), 'call must not include exclamation marks');
    assert.ok(irrigateCard.call.length <= 80, 'call ≤ 80 chars');
    assert.ok(irrigateCard.title.length <= 40, 'title ≤ 40 chars');
    assert.match(irrigateCard.numberLine, /\d/, 'numberLine must contain a real number');
  });

  test('ET₀ threshold is compared in inches — 0.31in counts as > 0.3', () => {
    // 0.31in is just above 0.3 threshold (inches comparison — NOT mm)
    const forecast = makeForecast({
      hourly_precip: Array(168).fill(0),
      daily_et0: Array(7).fill(0.31),
    });
    const cards = cropCards(forecast);
    const irrigateCard = cards.find(c => c.ruleId === 'CR-02');
    assert.ok(irrigateCard, '0.31in ET₀ should be > 0.3in threshold (comparison in inches)');
  });

  test('does NOT fire when ET₀ ≤ 0.3in/day', () => {
    const forecast = makeForecast({
      hourly_precip: Array(168).fill(0),
      daily_et0: Array(7).fill(0.3), // exactly 0.3 — not > 0.3
    });
    const cards = cropCards(forecast);
    const irrigateCard = cards.find(c => c.ruleId === 'CR-02');
    assert.equal(irrigateCard, undefined, 'CR-02 should not fire at exactly 0.3in/day (need > not ≥)');
  });

  test('does NOT fire when there is rain in 48h', () => {
    const precip = Array(168).fill(0);
    precip[5] = 0.05; // small rain — enough to count as "rain in 48h"

    const forecast = makeForecast({
      hourly_precip: precip,
      daily_et0: Array(7).fill(0.5), // high ET₀
    });
    const cards = cropCards(forecast);
    const irrigateCard = cards.find(c => c.ruleId === 'CR-02');
    // If rain > skip threshold, CR-01 fires instead; if rain is small but still present, CR-02 should not fire
    // Any hourly precip > 0 in 48h counts as rain
    // Note: CR-01 fires if precip ≥ 0.3in total; here we only have 0.05in so no Skip either
    // CR-02 checks "no rain in 48h" — 0.05in should count as rain
    assert.equal(irrigateCard, undefined, 'CR-02 should not fire when any rain in 48h');
  });

  test('does NOT fire when Skip rule already fired', () => {
    const precip = Array(168).fill(0);
    precip[5] = 0.5; // 0.5in in 48h — triggers Skip

    const forecast = makeForecast({
      hourly_precip: precip,
      hourly_precip_prob: Array(168).fill(60), // high prob — no counter-rule
      daily_et0: Array(7).fill(0.5),
    });
    const cards = cropCards(forecast);

    const skipCard = cards.find(c => c.ruleId === 'CR-01');
    const irrigateCard = cards.find(c => c.ruleId === 'CR-02');
    assert.ok(skipCard, 'CR-01 should fire');
    assert.equal(irrigateCard, undefined, 'CR-02 should not fire when Skip rule fired');
  });
});

// ─── CR-03 Spray Window ───────────────────────────────────────────────────────

describe('CR-03 Spray Window', () => {
  test('fires when a window exists: wind < 10mph, no precip ±4h, temp 50–90°F', () => {
    // Create ideal conditions at hours 24–30 (day 2, daytime)
    const wind = Array(168).fill(15); // too windy by default
    const precip = Array(168).fill(0);
    const temp = Array(168).fill(72);

    // Set a clean window at hours 26–30
    for (let h = 24; h <= 36; h++) {
      wind[h] = SPRAY_WIND_MAX_MPH - 1; // 9mph — just under threshold
    }

    const forecast = makeForecast({
      hourly_temp: temp,
      hourly_precip: precip,
      hourly_wind: wind,
    });
    const cards = cropCards(forecast);

    const sprayCard = cards.find(c => c.ruleId === 'CR-03');
    assert.ok(sprayCard, 'CR-03 should fire when a spray window exists');
    assert.equal(sprayCard.group, 'CROPS');
    assert.equal(sprayCard.priority, CARD_PRIORITY.SPRAY_OR_SKIP);
    assert.match(sprayCard.call, /^Spray/i, 'call must start with "Spray"');
    assert.ok(!sprayCard.call.includes('!'), 'call must not include exclamation marks');
    assert.ok(sprayCard.call.length <= 80, 'call ≤ 80 chars');
    assert.ok(sprayCard.title.length <= 40, 'title ≤ 40 chars');
    assert.match(sprayCard.numberLine, /\d/, 'numberLine must contain a real number');
  });

  test('no-window fallback: renders card with specific copy when no window in 7 days', () => {
    // All hours have wind too high (no spray window possible)
    const wind = Array(168).fill(SPRAY_WIND_MAX_MPH + 5); // 15mph — exceeds limit

    const forecast = makeForecast({
      hourly_wind: wind,
      hourly_temp: Array(168).fill(72),
      hourly_precip: Array(168).fill(0),
    });
    const cards = cropCards(forecast);

    const sprayCard = cards.find(c => c.ruleId === 'CR-03');
    assert.ok(sprayCard, 'CR-03 should still produce a card when no window exists');
    assert.match(
      sprayCard.call,
      /no spray window this week/i,
      'no-window fallback must say "No spray window this week"'
    );
    assert.match(
      sprayCard.call,
      /wind or rain/i,
      'no-window fallback copy must mention wind or rain'
    );
  });

  test('does NOT open spray window when temp is out of range (too cold)', () => {
    const wind = Array(168).fill(5); // perfect wind
    const precip = Array(168).fill(0);
    const temp = Array(168).fill(SPRAY_TEMP_MIN_F - 5); // 45°F — too cold

    const forecast = makeForecast({
      hourly_temp: temp,
      hourly_precip: precip,
      hourly_wind: wind,
    });
    const cards = cropCards(forecast);

    const sprayCard = cards.find(c => c.ruleId === 'CR-03');
    assert.ok(sprayCard, 'CR-03 should still produce a card (no-window fallback)');
    assert.match(sprayCard.call, /no spray window this week/i, 'should use no-window copy when too cold');
  });

  test('does NOT open spray window when precip within ±4h of candidate hour', () => {
    const wind = Array(168).fill(5); // good wind
    const temp = Array(168).fill(72); // good temp
    const precip = Array(168).fill(0);

    // Put precip within 4h of every otherwise-good hour in first 48h
    // Strategy: sprinkle precip every 4 hours so there's never a clean ±4h window
    for (let h = 0; h < 168; h += 4) {
      precip[h] = 0.1;
    }

    const forecast = makeForecast({
      hourly_temp: temp,
      hourly_precip: precip,
      hourly_wind: wind,
    });
    const cards = cropCards(forecast);

    const sprayCard = cards.find(c => c.ruleId === 'CR-03');
    assert.ok(sprayCard, 'CR-03 card should still render');
    assert.match(sprayCard.call, /no spray window this week/i, 'should use no-window copy when precip blocks all windows');
  });
});

// ─── CR-04 Frost Risk ─────────────────────────────────────────────────────────

describe('CR-04 Frost Risk', () => {
  test('fires when any hourly temp ≤ 34°F (frost)', () => {
    const temp = Array(168).fill(50);
    temp[6] = FROST_TEMP_F; // exactly 34°F — frost threshold

    const forecast = makeForecast({ hourly_temp: temp });
    const cards = cropCards(forecast);

    const frostCard = cards.find(c => c.ruleId === 'CR-04');
    assert.ok(frostCard, 'CR-04 should fire when any hourly temp ≤ 34°F');
    assert.equal(frostCard.group, 'CROPS');
    assert.equal(frostCard.priority, CARD_PRIORITY.FROST);
    assert.match(frostCard.call, /^(Cover|Watch)/i, 'frost call must start with Cover or Watch');
    assert.ok(!frostCard.call.includes('!'), 'call must not include exclamation marks');
    assert.ok(frostCard.call.length <= 80, 'call ≤ 80 chars');
    assert.ok(frostCard.title.length <= 40, 'title ≤ 40 chars');
    assert.match(frostCard.numberLine, /\d/, 'numberLine must contain a real forecast number');
  });

  test('fires when any hourly temp ≤ 28°F (hard frost)', () => {
    const temp = Array(168).fill(50);
    temp[3] = HARD_FROST_TEMP_F; // 28°F — hard frost threshold

    const forecast = makeForecast({ hourly_temp: temp });
    const cards = cropCards(forecast);

    const frostCard = cards.find(c => c.ruleId === 'CR-04');
    assert.ok(frostCard, 'CR-04 should fire on hard frost (≤ 28°F)');
    // Hard frost should be in the title or call
    const combinedText = (frostCard.title + ' ' + frostCard.call).toLowerCase();
    assert.ok(
      combinedText.includes('hard frost') || combinedText.includes('hard-frost') || combinedText.includes('28'),
      'hard frost (≤28°F) must be distinguished from regular frost in title or call'
    );
  });

  test('confidence is always HIGH — never hedged', () => {
    const temp = Array(168).fill(50);
    temp[12] = 32; // below frost threshold

    const forecast = makeForecast({ hourly_temp: temp });
    const cards = cropCards(forecast);

    const frostCard = cards.find(c => c.ruleId === 'CR-04');
    assert.ok(frostCard, 'CR-04 should fire');

    const confidence = frostCard.confidence.toLowerCase();
    // Should NOT contain hedging language
    assert.ok(!confidence.includes('may'), 'frost confidence must not hedge with "may"');
    assert.ok(!confidence.includes('might'), 'frost confidence must not hedge with "might"');
    assert.ok(!confidence.includes('could'), 'frost confidence must not hedge with "could"');
    assert.ok(!confidence.includes('possible'), 'frost confidence must not hedge with "possible"');
    assert.ok(!confidence.includes('if forecast holds'), 'frost confidence must not hedge with "if forecast holds"');
    // Should be high confidence
    assert.ok(
      confidence.includes('high') || confidence.includes('certain') || confidence.includes('confirmed') || confidence.includes('forecast'),
      'frost confidence should convey high certainty'
    );
  });

  test('does NOT fire when all temps are above 34°F', () => {
    const temp = Array(168).fill(40); // 40°F — above frost threshold

    const forecast = makeForecast({ hourly_temp: temp });
    const cards = cropCards(forecast);

    const frostCard = cards.find(c => c.ruleId === 'CR-04');
    assert.equal(frostCard, undefined, 'CR-04 should not fire when all temps > 34°F');
  });

  test('numberLine references the actual forecast temperature', () => {
    const temp = Array(168).fill(50);
    temp[8] = 29; // 29°F

    const forecast = makeForecast({ hourly_temp: temp });
    const cards = cropCards(forecast);

    const frostCard = cards.find(c => c.ruleId === 'CR-04');
    assert.ok(frostCard, 'frost card should fire');
    assert.match(frostCard.numberLine, /29/, 'numberLine should contain the actual low temperature (29°F)');
  });
});

// ─── §9 Card spec compliance ─────────────────────────────────────────────────

describe('§9 Card spec compliance', () => {
  test('all firing cards have required fields: group, ruleId, priority, title, call, numberLine, confidence', () => {
    // Scenario that fires CR-01, CR-03, CR-04
    const precip = Array(168).fill(0);
    precip[5] = 0.5; // triggers Skip

    const wind = Array(168).fill(5);
    const temp = Array(168).fill(72);
    temp[100] = 30; // frost

    const forecast = makeForecast({
      hourly_precip: precip,
      hourly_wind: wind,
      hourly_temp: temp,
      hourly_precip_prob: Array(168).fill(70), // high prob — no counter-rule
    });
    const cards = cropCards(forecast);
    assert.ok(cards.length > 0, 'should return at least one card');

    for (const card of cards) {
      assert.equal(card.group, 'CROPS', 'group must be CROPS');
      assert.ok(typeof card.ruleId === 'string' && card.ruleId.startsWith('CR-'), 'ruleId must start with CR-');
      assert.ok(typeof card.priority === 'number', 'priority must be a number');
      assert.ok(typeof card.title === 'string' && card.title.length > 0, 'title must be a non-empty string');
      assert.ok(typeof card.call === 'string' && card.call.length > 0, 'call must be a non-empty string');
      assert.ok(typeof card.numberLine === 'string' && card.numberLine.length > 0, 'numberLine must be a non-empty string');
      assert.ok(typeof card.confidence === 'string' && card.confidence.length > 0, 'confidence must be a non-empty string');
      assert.ok(!card.call.includes('!'), `card ${card.ruleId}: call must not include exclamation marks`);
      assert.ok(card.title.length <= 40, `card ${card.ruleId}: title must be ≤ 40 chars, got ${card.title.length}`);
      assert.ok(card.call.length <= 80, `card ${card.ruleId}: call must be ≤ 80 chars, got ${card.call.length}`);
      assert.ok(card.numberLine.length <= 100, `card ${card.ruleId}: numberLine must be ≤ 100 chars`);
      assert.ok(card.confidence.length <= 100, `card ${card.ruleId}: confidence must be ≤ 100 chars`);
    }
  });

  test('cropCards returns an array', () => {
    const forecast = makeForecast();
    const result = cropCards(forecast);
    assert.ok(Array.isArray(result), 'cropCards must return an array');
  });

  test('ET₀ threshold comparison stays in inches — 0.31in is > 0.3in threshold', () => {
    // This verifies the key contract: ET₀ is in inches, not mm.
    // If the code accidentally converts 0.31in * 25.4 = 7.874mm, then compares to 0.3 (threshold in inches),
    // it would incorrectly fire because 7.874 > 0.3. But the real comparison should be 0.31 vs 0.3.
    // We check BOTH that 0.31in fires AND that the threshold logic makes sense numerically.
    const forecast031 = makeForecast({
      hourly_precip: Array(168).fill(0),
      daily_et0: Array(7).fill(0.31), // 0.31in — just above 0.3in threshold
    });
    const cards031 = cropCards(forecast031);
    const irrigate031 = cards031.find(c => c.ruleId === 'CR-02');
    assert.ok(irrigate031, '0.31in ET₀ (just above 0.3in threshold) should fire CR-02');

    // Verify 0.29in does NOT fire
    const forecast029 = makeForecast({
      hourly_precip: Array(168).fill(0),
      daily_et0: Array(7).fill(0.29), // 0.29in — below threshold
    });
    const cards029 = cropCards(forecast029);
    const irrigate029 = cards029.find(c => c.ruleId === 'CR-02');
    assert.equal(irrigate029, undefined, '0.29in ET₀ (below 0.3in threshold) should NOT fire CR-02');
  });
});

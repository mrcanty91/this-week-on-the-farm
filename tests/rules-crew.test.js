/**
 * tests/rules-crew.test.js — TDD tests for CW-01..03 (T5, Wave 1).
 *
 * Covers:
 *   CW-01 Workable Days — always fires; counts correctly with rain/heat disqualifiers
 *   CW-02 Start Times  — always fires; benign copy vs early-start escalation
 *   CW-03 Heat Risk    — fires at ≥103°F apparent; Heat Danger at ≥125°F; supersedes CW-02 benign
 *
 * All fixtures use NormalizedForecast shape from src/forecast.js (168-hr hourly,
 * 7-day daily). Time strings are arbitrary ISO-local; rules only care about values.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { crewCards } from '../src/rules-crew.js';
import {
  CARD_PRIORITY,
  CARD_TITLE_MAX_CHARS,
  CARD_CALL_MAX_CHARS,
  CARD_NUMBER_LINE_MAX_CHARS,
  CARD_CONFIDENCE_MAX_CHARS,
  CARD_GROUPS,
} from '../src/config.js';

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a 7-day × 24-hr NormalizedForecast with flat values, then overlay with patch.
 *
 * @param {{
 *   hourly?: Partial<import('../src/forecast.js').HourlyForecast>,
 *   daily?:  Partial<import('../src/forecast.js').DailyForecast>,
 * }} [patch]
 */
function makeForecast(patch = {}) {
  const DAYS = 7;
  const HOURS = DAYS * 24; // 168

  // Daily arrays
  const daily = {
    time: Array.from({ length: DAYS }, (_, i) => `2026-07-0${i + 1}`),
    et0: Array(DAYS).fill(0.2),
    precipitation_sum: Array(DAYS).fill(0),
    temperature_2m_max: Array(DAYS).fill(82),
    temperature_2m_min: Array(DAYS).fill(60),
    weather_code: Array(DAYS).fill(0),
    ...(patch.daily ?? {}),
  };

  // Hourly arrays — benign defaults: temp=75°F, apparent=75°F, no rain
  const hourly = {
    time: Array.from({ length: HOURS }, (_, i) => `2026-07-01T${String(i % 24).padStart(2, '0')}:00`),
    temperature_2m: Array(HOURS).fill(75),
    apparent_temperature: Array(HOURS).fill(75),
    precipitation: Array(HOURS).fill(0),
    precipitation_probability: Array(HOURS).fill(0),
    wind_speed_10m: Array(HOURS).fill(5),
    weather_code: Array(HOURS).fill(0),
    ...(patch.hourly ?? {}),
  };

  return {
    latitude: 36.7,
    longitude: -119.8,
    timezone: 'America/Los_Angeles',
    utc_offset_seconds: -25200,
    hourly,
    daily,
  };
}

/** Return the card with the matching ruleId, or throw if missing. */
function getCard(cards, ruleId) {
  const card = cards.find(c => c.ruleId === ruleId);
  assert.ok(card, `Expected card with ruleId="${ruleId}" but it was missing. Got: ${cards.map(c => c.ruleId).join(', ')}`);
  return card;
}

// ── CW-01 Workable Days ───────────────────────────────────────────────────────

describe('CW-01 Workable Days', () => {
  test('always fires even in a fully benign week', () => {
    const forecast = makeForecast();
    const cards = crewCards(forecast);
    const cw01 = getCard(cards, 'CW-01');
    assert.equal(cw01.group, 'CREW');
    assert.equal(cw01.priority, CARD_PRIORITY.WORKABLE_DAYS);
  });

  test('counts all 7 days workable in a benign week', () => {
    const forecast = makeForecast();
    const cards = crewCards(forecast);
    const cw01 = getCard(cards, 'CW-01');
    // numberLine must contain "7" somewhere (7 workable days)
    assert.match(cw01.numberLine, /7/, 'Expected 7 workable days in benign week');
  });

  test('excludes a day that has >1h of sustained rain', () => {
    // Set 2 hours of rain (0.1in each) in hours 0..1 = day 0
    const precipitation = Array(168).fill(0);
    precipitation[0] = 0.1;
    precipitation[1] = 0.1; // 2 consecutive rainy hours → >1h sustained rain → day 0 disqualified
    const forecast = makeForecast({ hourly: { precipitation } });
    const cards = crewCards(forecast);
    const cw01 = getCard(cards, 'CW-01');
    // Should show 6, not 7
    assert.match(cw01.numberLine, /6/, 'Expected 6 workable days after rain disqualifier');
  });

  test('excludes a day whose max temp reaches 100°F or above', () => {
    // temperature_2m_max for day 0 = 100°F (≥100 disqualifies)
    const temperature_2m_max = [100, 82, 82, 82, 82, 82, 82];
    const forecast = makeForecast({ daily: { temperature_2m_max } });
    const cards = crewCards(forecast);
    const cw01 = getCard(cards, 'CW-01');
    assert.match(cw01.numberLine, /6/, 'Expected 6 workable days after max-temp disqualifier');
  });

  test('counts 0 workable days when all days are too hot', () => {
    const temperature_2m_max = [100, 101, 102, 103, 100, 100, 100];
    const forecast = makeForecast({ daily: { temperature_2m_max } });
    const cards = crewCards(forecast);
    const cw01 = getCard(cards, 'CW-01');
    assert.match(cw01.numberLine, /0/, 'Expected 0 workable days when all days ≥100°F');
  });
});

// ── CW-02 Start Times ─────────────────────────────────────────────────────────

describe('CW-02 Start Times', () => {
  test('always fires in a benign week', () => {
    const forecast = makeForecast();
    const cards = crewCards(forecast);
    getCard(cards, 'CW-02'); // throws if missing
  });

  test('benign copy: references normal hours and no heat risk (highs below 90°F)', () => {
    const forecast = makeForecast(); // max daily temp = 82°F, all hourly temps = 75°F
    const cards = crewCards(forecast);
    const cw02 = getCard(cards, 'CW-02');
    assert.match(
      cw02.call,
      /normal hours/i,
      'Benign CW-02 call should reference "normal hours"',
    );
    assert.match(
      cw02.call,
      /90/,
      'Benign CW-02 call should reference 90°F threshold',
    );
    assert.equal(cw02.priority, CARD_PRIORITY.WORKABLE_DAYS);
  });

  test('escalates to early-start when any hour on a workable day reaches 95°F', () => {
    // Hour 10 on day 0 = 95°F; day 0 is otherwise workable (max temp < 100°F)
    const temperature_2m = Array(168).fill(75);
    temperature_2m[10] = 95; // day 0, hour 10 → triggers early start
    const daily = {
      temperature_2m_max: [97, 82, 82, 82, 82, 82, 82], // day 0 max < 100 so day is workable
    };
    const forecast = makeForecast({ hourly: { temperature_2m }, daily });
    const cards = crewCards(forecast);
    const cw02 = getCard(cards, 'CW-02');
    assert.match(
      cw02.call,
      /start/i,
      'Escalated CW-02 call should begin with "Start"',
    );
    assert.equal(
      cw02.priority,
      CARD_PRIORITY.EARLY_START,
      'Escalated CW-02 should use EARLY_START priority',
    );
  });

  test('does NOT escalate to early-start when 95°F only occurs on non-workable day', () => {
    // Day 0 has max temp 100°F (not workable), and the 95°F hour is on day 0
    const temperature_2m = Array(168).fill(75);
    temperature_2m[10] = 95; // hour 10 = day 0
    const daily = {
      temperature_2m_max: [100, 82, 82, 82, 82, 82, 82], // day 0 ≥100 → not workable
    };
    const forecast = makeForecast({ hourly: { temperature_2m }, daily });
    const cards = crewCards(forecast);
    const cw02 = getCard(cards, 'CW-02');
    // Should stay benign: no early-start because the hot day isn't workable
    assert.match(cw02.call, /normal hours/i, 'Should remain benign when heat is only on non-workable day');
  });
});

// ── CW-03 Heat Risk ───────────────────────────────────────────────────────────

describe('CW-03 Heat Risk', () => {
  test('does NOT fire in a benign week', () => {
    const forecast = makeForecast(); // apparent_temp = 75°F
    const cards = crewCards(forecast);
    const cw03 = cards.find(c => c.ruleId === 'CW-03');
    assert.equal(cw03, undefined, 'CW-03 should not fire when apparent_temperature < 103°F');
  });

  test('fires when any hourly apparent_temperature reaches 103°F', () => {
    const apparent_temperature = Array(168).fill(75);
    apparent_temperature[24] = 103; // day 1, hour 0
    const forecast = makeForecast({ hourly: { apparent_temperature } });
    const cards = crewCards(forecast);
    const cw03 = getCard(cards, 'CW-03');
    assert.equal(cw03.group, 'CREW');
    assert.equal(cw03.priority, CARD_PRIORITY.HEAT);
  });

  test('CW-03 at 103°F is a Heat Risk variant (not Heat Danger)', () => {
    const apparent_temperature = Array(168).fill(75);
    apparent_temperature[24] = 103;
    const forecast = makeForecast({ hourly: { apparent_temperature } });
    const cards = crewCards(forecast);
    const cw03 = getCard(cards, 'CW-03');
    // Title or call should reference "heat" but NOT "danger" (that's the 125°F variant)
    const titleAndCall = (cw03.title + ' ' + cw03.call).toLowerCase();
    assert.match(titleAndCall, /heat/, 'CW-03 at 103°F should reference heat');
    assert.ok(!titleAndCall.includes('danger'), 'CW-03 at 103°F should NOT say "danger"');
  });

  test('CW-03 at 125°F escalates to Heat Danger variant', () => {
    const apparent_temperature = Array(168).fill(75);
    apparent_temperature[48] = 125; // day 2
    const forecast = makeForecast({ hourly: { apparent_temperature } });
    const cards = crewCards(forecast);
    const cw03 = getCard(cards, 'CW-03');
    const titleAndCall = (cw03.title + ' ' + cw03.call).toLowerCase();
    assert.match(titleAndCall, /danger/, 'CW-03 at 125°F should say "danger"');
  });

  test('Heat Danger variant call starts with Suspend', () => {
    const apparent_temperature = Array(168).fill(75);
    apparent_temperature[48] = 125;
    const forecast = makeForecast({ hourly: { apparent_temperature } });
    const cards = crewCards(forecast);
    const cw03 = getCard(cards, 'CW-03');
    assert.match(cw03.call, /^Suspend/i, 'Heat Danger call must start with Suspend');
  });

  test('when CW-03 fires, CW-02 is NOT in benign state (superseded)', () => {
    // Heat risk (103°F apparent) should supersede benign CW-02
    const apparent_temperature = Array(168).fill(75);
    apparent_temperature[24] = 103;
    const forecast = makeForecast({ hourly: { apparent_temperature } });
    const cards = crewCards(forecast);
    const cw02 = getCard(cards, 'CW-02');
    // CW-02 should NOT have benign/normal-hours copy when CW-03 fires
    assert.ok(
      !cw02.call.toLowerCase().includes('normal hours'),
      'CW-02 should not say "normal hours" when CW-03 fires',
    );
  });

  test('numberLine includes the actual apparent temperature reading', () => {
    const apparent_temperature = Array(168).fill(75);
    apparent_temperature[24] = 107;
    const forecast = makeForecast({ hourly: { apparent_temperature } });
    const cards = crewCards(forecast);
    const cw03 = getCard(cards, 'CW-03');
    assert.match(cw03.numberLine, /107/, 'numberLine must reference the actual apparent temp');
  });
});

// ── §9 field-conformance checks ───────────────────────────────────────────────

describe('§9 card field conformance (all scenarios)', () => {
  const scenarios = [
    {
      name: 'benign week',
      forecast: makeForecast(),
    },
    {
      name: 'early-start week (95°F hour on workable day)',
      forecast: (() => {
        const temperature_2m = Array(168).fill(75);
        temperature_2m[10] = 95;
        return makeForecast({ hourly: { temperature_2m }, daily: { temperature_2m_max: [97, 82, 82, 82, 82, 82, 82] } });
      })(),
    },
    {
      name: 'heat-risk week (103°F apparent)',
      forecast: (() => {
        const apparent_temperature = Array(168).fill(75);
        apparent_temperature[24] = 103;
        return makeForecast({ hourly: { apparent_temperature } });
      })(),
    },
    {
      name: 'heat-danger week (125°F apparent)',
      forecast: (() => {
        const apparent_temperature = Array(168).fill(75);
        apparent_temperature[48] = 125;
        return makeForecast({ hourly: { apparent_temperature } });
      })(),
    },
  ];

  for (const { name, forecast } of scenarios) {
    test(`[${name}] all cards have required fields`, () => {
      const cards = crewCards(forecast);
      assert.ok(cards.length >= 2, `Expected ≥2 crew cards; got ${cards.length}`);
      for (const card of cards) {
        assert.equal(card.group, CARD_GROUPS.CREW, `group must be 'CREW' (got: ${card.group})`);
        assert.ok(typeof card.title === 'string' && card.title.length > 0, 'title must be a non-empty string');
        assert.ok(typeof card.call === 'string' && card.call.length > 0, 'call must be a non-empty string');
        assert.ok(typeof card.numberLine === 'string' && card.numberLine.length > 0, 'numberLine must be non-empty');
        assert.ok(typeof card.confidence === 'string' && card.confidence.length > 0, 'confidence must be non-empty');
        assert.ok(['CW-01', 'CW-02', 'CW-03'].includes(card.ruleId), `ruleId must be CW-01/02/03 (got: ${card.ruleId})`);
        assert.ok(typeof card.priority === 'number', `priority must be a number (got: ${typeof card.priority})`);

        // §9 char caps
        assert.ok(
          card.title.length <= CARD_TITLE_MAX_CHARS,
          `title too long (${card.title.length} > ${CARD_TITLE_MAX_CHARS}): "${card.title}"`,
        );
        assert.ok(
          card.call.length <= CARD_CALL_MAX_CHARS,
          `call too long (${card.call.length} > ${CARD_CALL_MAX_CHARS}): "${card.call}"`,
        );
        assert.ok(
          card.numberLine.length <= CARD_NUMBER_LINE_MAX_CHARS,
          `numberLine too long (${card.numberLine.length}): "${card.numberLine}"`,
        );
        assert.ok(
          card.confidence.length <= CARD_CONFIDENCE_MAX_CHARS,
          `confidence too long (${card.confidence.length}): "${card.confidence}"`,
        );

        // No exclamation marks (§9 tone)
        assert.ok(!card.call.includes('!'), `call must not contain exclamation mark: "${card.call}"`);
        assert.ok(!card.title.includes('!'), `title must not contain exclamation mark: "${card.title}"`);
      }
    });
  }

  test('CW-01 priority is WORKABLE_DAYS', () => {
    const cards = crewCards(makeForecast());
    const cw01 = getCard(cards, 'CW-01');
    assert.equal(cw01.priority, CARD_PRIORITY.WORKABLE_DAYS);
  });

  test('CW-02 benign priority is WORKABLE_DAYS', () => {
    const cards = crewCards(makeForecast());
    const cw02 = getCard(cards, 'CW-02');
    assert.equal(cw02.priority, CARD_PRIORITY.WORKABLE_DAYS);
  });

  test('CW-02 escalated priority is EARLY_START', () => {
    const temperature_2m = Array(168).fill(75);
    temperature_2m[10] = 95;
    const forecast = makeForecast({ hourly: { temperature_2m }, daily: { temperature_2m_max: [97, 82, 82, 82, 82, 82, 82] } });
    const cards = crewCards(forecast);
    const cw02 = getCard(cards, 'CW-02');
    assert.equal(cw02.priority, CARD_PRIORITY.EARLY_START);
  });

  test('CW-03 priority is HEAT', () => {
    const apparent_temperature = Array(168).fill(75);
    apparent_temperature[24] = 103;
    const forecast = makeForecast({ hourly: { apparent_temperature } });
    const cards = crewCards(forecast);
    const cw03 = getCard(cards, 'CW-03');
    assert.equal(cw03.priority, CARD_PRIORITY.HEAT);
  });
});

/**
 * prioritize.test.js — TDD for T6 prioritize() (Wave 1).
 *
 * Tests the priority ladder (§8), display order (§9), Workable Days guarantee,
 * neutral Crops card, and the 4–6 card cap.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { prioritize } from '../src/prioritize.js';
import { cropCards } from '../src/rules-crops.js';
import { crewCards } from '../src/rules-crew.js';
import { CARD_PRIORITY, CARD_GROUPS, CARD_TARGET_MAX, CARD_TARGET_MIN, CARD_FLOOR } from '../src/config.js';

/* ------------------------------------------------------------------ */
/* Fixture helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Build a minimal Card object — only the fields prioritize() cares about.
 * @param {'CROPS'|'CREW'} group
 * @param {string} ruleId
 * @param {number} priority
 * @returns {import('../src/card.js').Card}
 */
function makeCard(group, ruleId, priority) {
  return {
    group,
    ruleId,
    priority,
    title: `${ruleId} title`,
    call: `${ruleId} call`,
    numberLine: '0in',
    confidence: 'test fixture',
  };
}

// Named fixtures for the six distinct priority levels
const FROST_CARD     = makeCard(CARD_GROUPS.CROPS, 'CR-04', CARD_PRIORITY.FROST);
const HEAT_CARD      = makeCard(CARD_GROUPS.CREW,  'CW-03', CARD_PRIORITY.HEAT);
const EARLY_START_CARD = makeCard(CARD_GROUPS.CREW, 'CW-02', CARD_PRIORITY.EARLY_START);
const WORKABLE_CARD  = makeCard(CARD_GROUPS.CREW,  'CW-01', CARD_PRIORITY.WORKABLE_DAYS);
const SKIP_CARD      = makeCard(CARD_GROUPS.CROPS, 'CR-01', CARD_PRIORITY.SPRAY_OR_SKIP);
const SPRAY_CARD     = makeCard(CARD_GROUPS.CROPS, 'CR-03', CARD_PRIORITY.SPRAY_OR_SKIP);
const IRRIGATE_CARD  = makeCard(CARD_GROUPS.CROPS, 'CR-02', CARD_PRIORITY.IRRIGATE);

/* ------------------------------------------------------------------ */
/* 1. Returns a non-empty array                                          */
/* ------------------------------------------------------------------ */

test('prioritize returns an array', () => {
  const result = prioritize([WORKABLE_CARD]);
  assert.ok(Array.isArray(result), 'should return an array');
});

/* ------------------------------------------------------------------ */
/* 2. Priority capping — >6 cards → cap to 6, lowest priority dropped  */
/* ------------------------------------------------------------------ */

test('given more than 6 cards returns exactly CARD_TARGET_MAX (6)', () => {
  // 7 cards: one of every type plus a second Frost
  const secondFrost = makeCard(CARD_GROUPS.CROPS, 'CR-04b', CARD_PRIORITY.FROST);
  const input = [
    FROST_CARD, secondFrost,
    HEAT_CARD, EARLY_START_CARD, WORKABLE_CARD,
    SKIP_CARD, IRRIGATE_CARD,
  ];
  const result = prioritize(input);
  assert.equal(result.length, CARD_TARGET_MAX, `expected ${CARD_TARGET_MAX} cards, got ${result.length}`);
});

test('when capping to 6, lowest-priority card (IRRIGATE) is dropped first', () => {
  // Provide 7 cards: all 6 types + an extra Spray. Irrigate (priority=6) should be dropped.
  const extraSpray = makeCard(CARD_GROUPS.CROPS, 'CR-03b', CARD_PRIORITY.SPRAY_OR_SKIP);
  const input = [
    FROST_CARD, HEAT_CARD, EARLY_START_CARD, WORKABLE_CARD,
    SKIP_CARD, SPRAY_CARD, IRRIGATE_CARD, extraSpray,
  ];
  const result = prioritize(input);
  const ruleIds = result.map(c => c.ruleId);
  assert.ok(!ruleIds.includes('CR-02'), 'IRRIGATE (lowest priority) should be dropped when capping');
  assert.equal(result.length, CARD_TARGET_MAX);
});

/* ------------------------------------------------------------------ */
/* 3. Workable Days always present                                       */
/* ------------------------------------------------------------------ */

test('Workable Days card is always present even when many cards compete', () => {
  // 7 cards where WORKABLE_DAYS has priority=4 (middling) — still must survive
  const secondFrost = makeCard(CARD_GROUPS.CROPS, 'CR-04b', CARD_PRIORITY.FROST);
  const secondHeat  = makeCard(CARD_GROUPS.CREW,  'CW-03b', CARD_PRIORITY.HEAT);
  const secondSpray = makeCard(CARD_GROUPS.CROPS, 'CR-03b', CARD_PRIORITY.SPRAY_OR_SKIP);
  const input = [
    FROST_CARD, secondFrost,
    HEAT_CARD, secondHeat,
    EARLY_START_CARD,
    WORKABLE_CARD,
    secondSpray,
  ];
  const result = prioritize(input);
  const hasWorkable = result.some(c => c.priority === CARD_PRIORITY.WORKABLE_DAYS);
  assert.ok(hasWorkable, 'Workable Days must always be present in output');
});

/* ------------------------------------------------------------------ */
/* 4. Display order — Crops before Crew (§9)                            */
/* ------------------------------------------------------------------ */

test('Crops group cards appear before Crew group cards in output', () => {
  const input = [FROST_CARD, HEAT_CARD, EARLY_START_CARD, WORKABLE_CARD, SKIP_CARD];
  const result = prioritize(input);

  let lastCropsIdx = -1;
  let firstCrewIdx = Infinity;

  result.forEach((card, idx) => {
    if (card.group === CARD_GROUPS.CROPS) lastCropsIdx = idx;
    if (card.group === CARD_GROUPS.CREW && firstCrewIdx === Infinity) firstCrewIdx = idx;
  });

  if (lastCropsIdx !== -1 && firstCrewIdx !== Infinity) {
    assert.ok(
      lastCropsIdx < firstCrewIdx,
      `All CROPS cards (last at idx ${lastCropsIdx}) must appear before any CREW card (first at idx ${firstCrewIdx})`,
    );
  }
});

/* ------------------------------------------------------------------ */
/* 5. Crops sub-order: Frost → Skip/Irrigate → Spray (§9)              */
/* ------------------------------------------------------------------ */

test('within Crops section display order is Frost then Skip/Irrigate then Spray', () => {
  const input = [SPRAY_CARD, FROST_CARD, IRRIGATE_CARD, WORKABLE_CARD];
  const result = prioritize(input);

  const cropCards = result.filter(c => c.group === CARD_GROUPS.CROPS);
  const ruleIds = cropCards.map(c => c.ruleId);

  // Frost must come before Skip/Irrigate, Skip/Irrigate before Spray
  const frostIdx   = ruleIds.indexOf('CR-04');
  const irrigateIdx = ruleIds.indexOf('CR-02');
  const sprayIdx   = ruleIds.indexOf('CR-03');

  if (frostIdx !== -1 && irrigateIdx !== -1) {
    assert.ok(frostIdx < irrigateIdx, 'Frost must appear before Irrigate in Crops section');
  }
  if (irrigateIdx !== -1 && sprayIdx !== -1) {
    assert.ok(irrigateIdx < sprayIdx, 'Irrigate must appear before Spray in Crops section');
  }
  if (frostIdx !== -1 && sprayIdx !== -1) {
    assert.ok(frostIdx < sprayIdx, 'Frost must appear before Spray in Crops section');
  }
});

/* ------------------------------------------------------------------ */
/* 6. Crew sub-order: Heat → Early Start → Workable Days (§9)          */
/* ------------------------------------------------------------------ */

test('within Crew section display order is Heat then Early Start then Workable Days', () => {
  const input = [WORKABLE_CARD, EARLY_START_CARD, HEAT_CARD, FROST_CARD];
  const result = prioritize(input);

  const crewCards = result.filter(c => c.group === CARD_GROUPS.CREW);
  const priorities = crewCards.map(c => c.priority);

  // The sequence of priorities within Crew must be non-decreasing per §9 display order:
  // Heat(2) → Early Start(3) → Workable Days(4)
  for (let i = 1; i < priorities.length; i++) {
    assert.ok(
      priorities[i] >= priorities[i - 1],
      `Crew display order violated at index ${i}: priority ${priorities[i]} < ${priorities[i - 1]}`,
    );
  }
});

/* ------------------------------------------------------------------ */
/* 7. Empty Crops → neutral card                                        */
/* ------------------------------------------------------------------ */

test('when no CROPS cards are present a neutral card is included', () => {
  // Only Crew cards
  const input = [HEAT_CARD, EARLY_START_CARD, WORKABLE_CARD];
  const result = prioritize(input);

  const neutralCard = result.find(c =>
    c.group === CARD_GROUPS.CROPS &&
    /No critical crop actions this week/i.test(
      c.title + ' ' + c.call + ' ' + (c.confidence ?? ''),
    ),
  );
  assert.ok(neutralCard, 'Neutral Crops card must be present when no Crops cards are provided');
});

test('neutral Crops card carries a real forecast number when a forecast is supplied (T14 review §11/S1-2)', () => {
  // §11: 100% of cards contain a real forecast number. The neutral floor card
  // must surface a benign real number (e.g. week high / precip total) sourced
  // from the forecast it does have, rather than the "—" placeholder.
  const forecast = benignForecast();
  const input = [WORKABLE_CARD, HEAT_CARD]; // no Crops → neutral injected
  const result = prioritize(input, forecast);
  const neutral = result.find(c => /No critical crop actions this week/i.test(c.title));
  assert.ok(neutral, 'neutral Crops card present');
  assert.match(
    neutral.numberLine,
    /\d+(\.\d+)?\s*(in|°F)/,
    `neutral card must carry a real number, got: "${neutral.numberLine}"`,
  );
});

test('neutral Crops card appears in Crops position (before Crew cards)', () => {
  const input = [HEAT_CARD, WORKABLE_CARD];
  const result = prioritize(input);

  const neutralIdx = result.findIndex(c => c.group === CARD_GROUPS.CROPS);
  const firstCrewIdx = result.findIndex(c => c.group === CARD_GROUPS.CREW);

  assert.ok(neutralIdx !== -1, 'neutral card should be present');
  assert.ok(
    neutralIdx < firstCrewIdx,
    'neutral Crops card must appear before Crew cards',
  );
});

/* ------------------------------------------------------------------ */
/* 8. Full scenario: >6 cards → correct 6 in §8 priority + §9 order    */
/* ------------------------------------------------------------------ */

test('given all 7 card types returns 6 correct cards in §9 display order', () => {
  // All possible types — 7 total, must cap to 6 dropping IRRIGATE (lowest priority)
  const input = [
    IRRIGATE_CARD, // priority 6 — should be dropped
    SPRAY_CARD,    // priority 5
    SKIP_CARD,     // priority 5
    WORKABLE_CARD, // priority 4 — always kept
    EARLY_START_CARD, // priority 3
    HEAT_CARD,        // priority 2
    FROST_CARD,       // priority 1
  ];
  const result = prioritize(input);

  assert.equal(result.length, CARD_TARGET_MAX, 'should be exactly 6 cards');

  // IRRIGATE dropped
  assert.ok(!result.some(c => c.ruleId === 'CR-02'), 'IRRIGATE should be dropped (lowest priority)');

  // WORKABLE_DAYS present
  assert.ok(result.some(c => c.priority === CARD_PRIORITY.WORKABLE_DAYS), 'Workable Days must be kept');

  // Crops section before Crew section
  const lastCropsIdx = result.map(c => c.group).lastIndexOf(CARD_GROUPS.CROPS);
  const firstCrewIdx = result.findIndex(c => c.group === CARD_GROUPS.CREW);
  if (lastCropsIdx !== -1 && firstCrewIdx !== -1) {
    assert.ok(lastCropsIdx < firstCrewIdx, 'Crops section must precede Crew section');
  }

  // Within Crops: Frost first
  const crops = result.filter(c => c.group === CARD_GROUPS.CROPS);
  assert.equal(crops[0].ruleId, 'CR-04', 'Frost must be first in Crops section');

  // Within Crew: Heat first
  const crew = result.filter(c => c.group === CARD_GROUPS.CREW);
  assert.equal(crew[0].priority, CARD_PRIORITY.HEAT, 'Heat must be first in Crew section');
});

/* ------------------------------------------------------------------ */
/* 9. Floor — never returns fewer than available cards (up to minimum)  */
/* ------------------------------------------------------------------ */

test('with exactly 4 cards returns all 4 (floor holds)', () => {
  const input = [FROST_CARD, WORKABLE_CARD, SKIP_CARD, HEAT_CARD];
  const result = prioritize(input);
  assert.equal(result.length, 4, 'should return all 4 when exactly 4 are provided');
});

test('tops up the Crops section to 2 (neutral card) when crops are sparse', () => {
  // One Crops (FROST) + one Crew (WORKABLE). Crops has < 2, so the neutral Crops
  // card is injected to support the §8 floor; real crew cards aren't manufactured.
  const input = [WORKABLE_CARD, FROST_CARD];
  const result = prioritize(input);
  const cropsCards = result.filter(c => c.group === CARD_GROUPS.CROPS);
  assert.equal(cropsCards.length, 2, 'Crops topped up to 2 (FROST + neutral)');
  assert.ok(
    cropsCards.some(c => /No critical crop actions this week/i.test(c.title)),
    'a neutral Crops card fills the second Crops slot',
  );
  // No real Crew card is invented — still exactly the one provided.
  assert.equal(result.filter(c => c.group === CARD_GROUPS.CREW).length, 1);
});

/* ------------------------------------------------------------------ */
/* Benign CW-02 (priority = WORKABLE_DAYS) survives capping            */
/* Guards the cross-task contract documented at the pin step: rules-   */
/* crew emits benign Start Times at WORKABLE_DAYS priority so the       */
/* always-on card-floor holds even when many crops compete for slots.  */
/* ------------------------------------------------------------------ */

test('benign CW-02 (priority WORKABLE_DAYS) is pinned and survives the 6-card cap', () => {
  // rules-crew benign state: CW-02 carries WORKABLE_DAYS priority, same as CW-01.
  const BENIGN_START = makeCard(CARD_GROUPS.CREW, 'CW-02', CARD_PRIORITY.WORKABLE_DAYS);
  // 8 cards total: 2 always-on Crew + 6 Crops of varying priority → must cap to 6.
  const secondFrost = makeCard(CARD_GROUPS.CROPS, 'CR-04b', CARD_PRIORITY.FROST);
  const input = [
    WORKABLE_CARD, BENIGN_START,
    FROST_CARD, secondFrost, SKIP_CARD, SPRAY_CARD, IRRIGATE_CARD,
    makeCard(CARD_GROUPS.CROPS, 'CR-01b', CARD_PRIORITY.SPRAY_OR_SKIP),
  ];
  const result = prioritize(input);

  assert.equal(result.length, CARD_TARGET_MAX, 'caps to CARD_TARGET_MAX');
  assert.ok(result.length >= CARD_TARGET_MIN, 'never below the 4-card floor');
  // BOTH always-on Crew cards survive capping despite 6 crops competing.
  assert.ok(result.some(c => c.ruleId === 'CW-01'), 'CW-01 Workable Days survives');
  assert.ok(result.some(c => c.ruleId === 'CW-02'), 'benign CW-02 Start Times survives');
});

/* ------------------------------------------------------------------ */
/* END-TO-END: the §8 "4 guaranteed" floor through the REAL pipeline   */
/* (cropCards + crewCards → prioritize). Regression guard for the      */
/* mild-week case where only spray + the two crew cards fire (=3).     */
/* ------------------------------------------------------------------ */

/** A fully benign 7-day NormalizedForecast: no frost, no heat, no rain, low water demand. */
function benignForecast() {
  const HOURS = 168, DAYS = 7;
  const hourly = {
    time: Array.from({ length: HOURS }, (_, i) => {
      const d = new Date(2026, 5, 29 + Math.floor(i / 24), i % 24, 0, 0);
      const Y = d.getFullYear(), M = String(d.getMonth() + 1).padStart(2, '0'), D = String(d.getDate()).padStart(2, '0');
      return `${Y}-${M}-${D}T${String(i % 24).padStart(2, '0')}:00`;
    }),
    temperature_2m: Array(HOURS).fill(72),      // mild — no frost, in spray range
    apparent_temperature: Array(HOURS).fill(72), // no heat risk
    precipitation: Array(HOURS).fill(0),         // no rain
    precipitation_probability: Array(HOURS).fill(10),
    wind_speed_10m: Array(HOURS).fill(5),        // calm — spray window open
    weather_code: Array(HOURS).fill(0),
  };
  const daily = {
    time: Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(2026, 5, 29 + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }),
    et0: Array(DAYS).fill(0.1),                  // low water demand — CR-02 won't fire
    precipitation_sum: Array(DAYS).fill(0),
    temperature_2m_max: Array(DAYS).fill(80),    // < 100 → workable; < 90 → benign hours
    temperature_2m_min: Array(DAYS).fill(60),
    weather_code: Array(DAYS).fill(0),
  };
  return { latitude: 36.7, longitude: -119.8, timezone: 'America/Los_Angeles', utc_offset_seconds: -25200, hourly, daily };
}

test('end-to-end: a mild week still yields the guaranteed 4-card floor', () => {
  const forecast = benignForecast();
  const combined = [...cropCards(forecast), ...crewCards(forecast)];
  // Sanity: the real rules produce only 3 cards in a benign week (spray + CW-01 + CW-02).
  assert.equal(combined.length, 3, 'mild week: rules emit spray + 2 crew cards');

  const result = prioritize(combined);
  assert.ok(result.length >= CARD_FLOOR, `floor must hold: expected ≥${CARD_FLOOR}, got ${result.length}`);
  assert.ok(result.filter(c => c.group === CARD_GROUPS.CROPS).length >= 2, 'Crops section has ≥2 cards');
  assert.ok(result.filter(c => c.group === CARD_GROUPS.CREW).length >= 2, 'Crew section has ≥2 cards');
});

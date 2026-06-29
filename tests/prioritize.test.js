/**
 * prioritize.test.js — TDD for T6 prioritize() (Wave 1).
 *
 * Tests the priority ladder (§8), display order (§9), Workable Days guarantee,
 * neutral Crops card, and the 4–6 card cap.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { prioritize } from '../src/prioritize.js';
import { CARD_PRIORITY, CARD_GROUPS, CARD_TARGET_MAX, CARD_TARGET_MIN } from '../src/config.js';

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

test('with fewer than 4 cards returns all available cards without padding', () => {
  const input = [WORKABLE_CARD, FROST_CARD];
  const result = prioritize(input);
  // Can't manufacture phantom cards — just don't drop any
  assert.equal(result.length, 2, 'should not drop cards when below minimum');
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

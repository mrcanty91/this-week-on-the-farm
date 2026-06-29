/**
 * prioritize.js — Order + cap cards (T6, Wave 1).
 *
 * Combined cards[] → ordered + capped to 4–6 per the §8 priority ladder
 * (config.CARD_PRIORITY). Workable Days always present; handles the empty-Crops
 * neutral card. Spec: PRD §8 (card count & priority), §9 (display order).
 *
 * @typedef {import('./card.js').Card} Card
 */

import {
  CARD_PRIORITY,
  CARD_TARGET_MAX,
  CARD_GROUPS,
} from './config.js';

/**
 * §9 display order within each group section.
 *
 * Crops section (top): Frost → Skip/Irrigate → Spray
 * Crew section (bottom): Heat → Early Start → Workable Days
 *
 * Keys are the canonical ruleId prefixes produced by the rules engine.
 * The PRD §9 specifies these display positions by rule, not by §8 priority rank
 * (e.g. Spray/CR-03 appears last in Crops even though it shares priority-5 with
 * Skip/CR-01, and after Irrigate/CR-02 which is priority-6).
 *
 * @type {Record<string, number>}
 */
const DISPLAY_POSITION_BY_RULE = Object.freeze({
  // CROPS section — §9: Frost → Skip/Irrigate → Spray
  'CR-04': 1, // Frost Risk
  'CR-01': 2, // Skip Irrigation  (Skip/Irrigate slot)
  'CR-02': 2, // Irrigate         (Skip/Irrigate slot)
  'CR-03': 3, // Spray Window
  // CREW section — §9: Heat → Early Start → Workable Days
  'CW-03': 1, // Heat Risk / Heat Danger
  'CW-02': 2, // Start Times / Early Start
  'CW-01': 3, // Workable Days
  // Neutral card — first in Crops section
  'NEUTRAL': 1,
});

/**
 * Return the §9 display position for a card.
 * Falls back to using §8 priority as the display position for unknown ruleIds.
 * @param {Card} card
 * @returns {number}
 */
function displayPosition(card) {
  // Match on the ruleId prefix (e.g. "CR-04b" → "CR-04")
  for (const prefix of Object.keys(DISPLAY_POSITION_BY_RULE)) {
    if (card.ruleId === prefix || card.ruleId.startsWith(prefix)) {
      return DISPLAY_POSITION_BY_RULE[prefix];
    }
  }
  return card.priority;
}

/**
 * Neutral card injected into the Crops slot when no crop rules fired.
 * @type {Card}
 */
const NEUTRAL_CROPS_CARD = Object.freeze({
  group: CARD_GROUPS.CROPS,
  ruleId: 'NEUTRAL',
  priority: CARD_PRIORITY.SPRAY_OR_SKIP, // mid-priority; survives capping in normal scenarios
  title: 'No critical crop actions this week.',
  call: 'No critical crop actions this week.',
  numberLine: '—',
  confidence: 'No crop alerts fired for the forecast window.',
});

/**
 * Order and cap the combined card list for display.
 *
 * Algorithm:
 *  1. If no CROPS cards present, inject the neutral Crops card.
 *  2. Pin the Workable Days card(s) — must survive any capping.
 *  3. Sort remaining (unpinned) cards by §8 priority ascending.
 *  4. Cap total to CARD_TARGET_MAX (6): keep top-priority unpinned cards
 *     in the remaining slots, then reunite with pinned.
 *  5. Sort survivors into §9 display order:
 *     CROPS section first (Frost → Skip/Irrigate → Spray),
 *     CREW section second (Heat → Early Start → Workable Days).
 *
 * @param {Card[]} cards   crop + crew cards
 * @returns {Card[]}       ordered and capped to at most CARD_TARGET_MAX cards.
 *                         The 4-card floor is guaranteed UPSTREAM by the
 *                         always-on rules (CW-01 Workable Days + CW-02 Start
 *                         Times in Crew, irrigation + spray in Crops), not
 *                         enforced here.
 */
export function prioritize(cards) {
  // Step 1: inject neutral card if no CROPS group cards are present
  const hasCrops = cards.some(c => c.group === CARD_GROUPS.CROPS);
  const working = hasCrops ? [...cards] : [...cards, { ...NEUTRAL_CROPS_CARD }];

  // Step 2: pin the always-on Crew cards — kept regardless of cap.
  // This pins BOTH CW-01 Workable Days AND the benign-state CW-02 Start Times:
  // rules-crew.js intentionally emits benign CW-02 with priority=WORKABLE_DAYS so
  // the card-floor guarantee (always-on Start Times) survives capping here. If
  // T5 ever gives benign CW-02 a distinct priority, update this pin accordingly.
  const pinned   = working.filter(c => c.priority === CARD_PRIORITY.WORKABLE_DAYS);
  const unpinned = working.filter(c => c.priority !== CARD_PRIORITY.WORKABLE_DAYS);

  // Step 3: sort unpinned by §8 priority (ascending = highest priority first)
  unpinned.sort((a, b) => a.priority - b.priority);

  // Step 4: cap — slots available for unpinned cards after reserving pinned slots
  const slotsForUnpinned = Math.max(0, CARD_TARGET_MAX - pinned.length);
  const kept = unpinned.slice(0, slotsForUnpinned);

  // Combine pinned and kept
  const selected = [...kept, ...pinned];

  // Step 5: sort into §9 display order
  // Group order: CROPS first (0), CREW second (1)
  const groupOrder = (card) => card.group === CARD_GROUPS.CROPS ? 0 : 1;

  selected.sort((a, b) => {
    const groupDiff = groupOrder(a) - groupOrder(b);
    if (groupDiff !== 0) return groupDiff;
    // Within same group: apply §9 sub-order
    return displayPosition(a) - displayPosition(b);
  });

  return selected;
}

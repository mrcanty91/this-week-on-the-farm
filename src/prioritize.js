/**
 * prioritize.js — Order + cap cards (T6, Wave 1). WAVE 0: STUB.
 *
 * Combined cards[] → ordered + capped to 4–6 per the §8 priority ladder
 * (config.CARD_PRIORITY). Workable Days always present; handles the empty-Crops
 * neutral card. Spec: PRD §8 (card count & priority), §9 (display order).
 *
 * @typedef {import('./card.js').Card} Card
 */

/**
 * Order and cap the combined card list for display.
 * @param {Card[]} cards   crop + crew cards
 * @returns {Card[]}       ordered, capped to CARD_TARGET_MIN..MAX
 */
export function prioritize(cards) {
  void cards;
  throw new Error('not implemented: prioritize (Wave 1 / T6)');
}

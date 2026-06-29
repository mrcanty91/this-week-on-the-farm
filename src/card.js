/**
 * card.js — Card data → DOM node (T7, Wave 1). WAVE 0: STUB.
 *
 * Defines the Card data shape (the rules-engine output contract) and renders it
 * as the Seso DS Card organism. Built from DS atoms/molecules + tokens — no
 * hardcoded color/spacing/type; numbers use IBM Plex Mono. Spec: PRD §9.
 *
 * Load the `seso-design` skill before implementing in Wave 1.
 */

/**
 * A recommendation card — the four §9 content fields under a group label.
 * Produced by rules-crops.js / rules-crew.js, ordered by prioritize.js,
 * rendered here.
 *
 * @typedef {Object} Card
 * @property {'CROPS'|'CREW'} group   group label (config.CARD_GROUPS)
 * @property {string} title           short noun phrase (≤40 chars)
 * @property {string} call            action-verb-first sentence (≤80 chars)
 * @property {string} numberLine      ≥1 real forecast number (≤100 chars)
 * @property {string} confidence      what's driving the call + how sure (≤100 chars)
 * @property {string} ruleId          source rule, e.g. "CR-01" / "CW-03"
 * @property {number} priority        §8 ladder rank (config.CARD_PRIORITY); lower = higher
 */

/**
 * Render a card to a DOM node.
 * @param {Card} card
 * @returns {HTMLElement}
 */
export function renderCard(card) {
  void card;
  throw new Error('not implemented: renderCard (Wave 1 / T7)');
}

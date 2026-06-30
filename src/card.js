/**
 * card.js — Card data → DOM node (T7, Wave 1).
 *
 * Defines the Card data shape (the rules-engine output contract) and renders it
 * as the Seso DS Card organism. Built from DS atoms/molecules + tokens — no
 * hardcoded color/spacing/type; numbers use IBM Plex Mono. Spec: PRD §9.
 *
 * Visual spec (seso-design-system/project/readme.md §3 "What cards look like"):
 *   White surface · 1px #E2E6E9 border · 12px radius · --shadow-xs
 *   All values are referenced via CSS custom properties from tokens/, never
 *   hardcoded inline — the tokens cascade from seso-design-system/project/styles.css
 *   which the shell links in index.html.
 *
 * DS classes used (defined in seso-design-system/project/tokens/base.css):
 *   .seso-card     — card organism surface (white, border, radius, shadow)
 *   .seso-eyebrow  — group label overline (CROPS / CREW) via --brand token
 *   .seso-mono     — number-line data font (IBM Plex Mono) via --font-mono token
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
 *
 * Uses the global `document` (works unchanged in the browser; tests install a
 * minimal fake DOM on globalThis.document before calling this function).
 *
 * §9 render order: group label → title → call → numberLine → confidence.
 * All styling is via DS token classes — no inline hardcoded hex / font / spacing.
 *
 * @param {Card} card
 * @returns {HTMLElement}
 */
export function renderCard(card) {
  // Guard: requires a DOM environment (browser or test-injected globalThis.document).
  // In a bare Node environment `document` is undefined — fail with a clear,
  // actionable message rather than an opaque ReferenceError. (renderCard is fully
  // implemented; it just needs a DOM.)
  // eslint-disable-next-line no-undef
  if (typeof document === 'undefined') {
    throw new Error('renderCard requires a DOM environment — run in a browser or inject globalThis.document (see tests/card.test.js)');
  }

  // --- card root: DS Card organism surface ---
  // .seso-card is not defined in base.css but is our app-level class that
  // references the DS shape/color tokens for the card surface. The style rules
  // live in the app's styles.css (sibling to index.html) which adds:
  //   .seso-card { background: var(--surface); border: var(--border-width) solid var(--border);
  //                border-radius: var(--radius-lg); box-shadow: var(--shadow-xs);
  //                padding: var(--space-5); }
  // Applying the class here is what matters; the browser resolves the tokens.
  const root = document.createElement('article');
  root.classList.add('seso-card');

  // --- §9 field 1: Group label (CROPS / CREW) ---
  // .seso-eyebrow: defined in tokens/base.css — text-xs, weight-bold,
  // tracking-caps, text-transform:uppercase, color: var(--brand) [green #006E33].
  // No hardcoded color here; the token class carries it.
  const groupEl = document.createElement('span');
  groupEl.classList.add('seso-eyebrow');
  groupEl.classList.add('seso-card__group');
  groupEl.textContent = card.group;
  root.appendChild(groupEl);

  // --- §9 field 2: Title ---
  // Short noun phrase (≤40 chars). Rendered as a heading using --type-heading
  // token (bold, text-xl, tight leading, var(--text-heading) color).
  const titleEl = document.createElement('h3');
  titleEl.classList.add('seso-card__title');
  titleEl.textContent = card.title;
  root.appendChild(titleEl);

  // --- §9 field 3: Call ---
  // Action-verb-first sentence (≤80 chars). Plain body text.
  const callEl = document.createElement('p');
  callEl.classList.add('seso-card__call');
  callEl.textContent = card.call;
  root.appendChild(callEl);

  // --- §9 field 4: Number line ---
  // ≥1 real forecast number (≤100 chars). Rendered in IBM Plex Mono via
  // .seso-mono (defined in tokens/base.css: font-family: var(--font-mono),
  // font-feature-settings: "tnum"). No hardcoded font family — class only.
  const numberLineEl = document.createElement('p');
  numberLineEl.classList.add('seso-mono');
  numberLineEl.classList.add('seso-card__number-line');
  numberLineEl.textContent = card.numberLine;
  root.appendChild(numberLineEl);

  // --- §9 field 5: Confidence line ---
  // What's driving the call + how sure (≤100 chars). Muted caption text.
  const confidenceEl = document.createElement('p');
  confidenceEl.classList.add('seso-card__confidence');
  confidenceEl.textContent = card.confidence;
  root.appendChild(confidenceEl);

  return root;
}

/**
 * styles.test.js — DS-adherence and selector-coverage checks for styles.css (T11).
 *
 * Runs under `node --test` (node:test, no external dependencies).
 * Reads styles.css as text and asserts:
 *   1. No raw hex color literals (outside comments)
 *   2. No raw px values in declarations (outside comments)
 *   3. No font-family declarations not using var(--font-…) tokens
 *   4. All required selectors are present
 *   5. Token usage is substantial (≥20 var(-- occurrences)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const stylesPath = join(__dirname, '..', 'styles.css');

let raw;
try {
  raw = readFileSync(stylesPath, 'utf8');
} catch (e) {
  throw new Error(`Could not read styles.css at ${stylesPath}: ${e.message}`);
}

/**
 * Strip block comments (/* ... *\/) from CSS text so assertions
 * are not confused by color samples or notes in comments.
 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

const stripped = stripComments(raw);

/**
 * Returns true only when the given selector appears as an actual rule head
 * (selector token immediately followed by optional whitespace then `{` or `,`).
 * This prevents `.seso-card__group {` from satisfying the `.seso-card` assertion,
 * and handles comma-separated selector lists like `.forecast-strip__icon,`.
 */
function definesSelector(css, selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(esc + '\\s*[{,]').test(css);
}

describe('DS adherence — no hardcoded values', () => {
  test('no raw hex color literals (#rrggbb / #rgb / #rrggbbaa) in declarations', () => {
    const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;
    const matches = stripped.match(hexPattern) || [];
    assert.strictEqual(
      matches.length,
      0,
      `Found ${matches.length} raw hex color(s) in styles.css (outside comments): ${matches.slice(0, 5).join(', ')} — use var(--…) tokens instead`
    );
  });

  test('no raw px values in declarations', () => {
    // Match digit(s) followed immediately by "px" — catches 1px, 12px, 100px etc.
    // Exception: we allow 0px only if someone wrote "0px" (though 0 is preferred).
    // The real constraint: spacing/radius/shadow must come from tokens, not hardcoded px.
    const pxPattern = /\d+px/g;
    const matches = stripped.match(pxPattern) || [];
    assert.strictEqual(
      matches.length,
      0,
      `Found ${matches.length} raw px value(s) in styles.css (outside comments): ${matches.slice(0, 5).join(', ')} — use DS token var(--space-*, --radius-*, etc.) or rem/%/fr for layout dims`
    );
  });

  test('no font-family declarations outside DS token var(--font-…)', () => {
    // Find all font-family: ... lines and ensure they all reference var(--font-
    const fontFamilyPattern = /font-family\s*:[^;]+;/g;
    const allFontFamily = stripped.match(fontFamilyPattern) || [];
    const violations = allFontFamily.filter(decl => !decl.includes('var(--font'));
    assert.strictEqual(
      violations.length,
      0,
      `Found ${violations.length} font-family declaration(s) not using var(--font-…) token: ${violations.join(', ')}`
    );
  });
});

describe('Required selectors are defined', () => {
  // Card organism selectors (emitted by src/card.js)
  test('.seso-card is defined', () => {
    assert.ok(definesSelector(stripped, '.seso-card'), 'styles.css must define .seso-card as a rule head');
  });

  test('.seso-card__group is defined', () => {
    assert.ok(definesSelector(stripped, '.seso-card__group'), 'styles.css must define .seso-card__group as a rule head');
  });

  test('.seso-card__title is defined', () => {
    assert.ok(definesSelector(stripped, '.seso-card__title'), 'styles.css must define .seso-card__title as a rule head');
  });

  test('.seso-card__call is defined', () => {
    assert.ok(definesSelector(stripped, '.seso-card__call'), 'styles.css must define .seso-card__call as a rule head');
  });

  test('.seso-card__number-line is defined', () => {
    assert.ok(definesSelector(stripped, '.seso-card__number-line'), 'styles.css must define .seso-card__number-line as a rule head');
  });

  test('.seso-card__confidence is defined', () => {
    assert.ok(definesSelector(stripped, '.seso-card__confidence'), 'styles.css must define .seso-card__confidence as a rule head');
  });

  // Forecast strip selectors (emitted by src/strip.js)
  test('.forecast-strip is defined', () => {
    assert.ok(definesSelector(stripped, '.forecast-strip'), 'styles.css must define .forecast-strip as a rule head');
  });

  test('.forecast-strip__day is defined', () => {
    assert.ok(definesSelector(stripped, '.forecast-strip__day'), 'styles.css must define .forecast-strip__day as a rule head');
  });

  test('.forecast-strip__label is defined', () => {
    assert.ok(definesSelector(stripped, '.forecast-strip__label'), 'styles.css must define .forecast-strip__label as a rule head');
  });

  test('.forecast-strip__icon is defined', () => {
    assert.ok(definesSelector(stripped, '.forecast-strip__icon'), 'styles.css must define .forecast-strip__icon as a rule head (also .weather-icon)');
  });

  test('.forecast-strip__temps is defined', () => {
    assert.ok(definesSelector(stripped, '.forecast-strip__temps'), 'styles.css must define .forecast-strip__temps as a rule head');
  });

  test('.forecast-strip__high is defined', () => {
    assert.ok(definesSelector(stripped, '.forecast-strip__high'), 'styles.css must define .forecast-strip__high as a rule head');
  });

  test('.forecast-strip__low is defined', () => {
    assert.ok(definesSelector(stripped, '.forecast-strip__low'), 'styles.css must define .forecast-strip__low as a rule head');
  });

  // Message state selectors (toggled by src/main.js on #message)
  test('.app__message--error is defined', () => {
    assert.ok(definesSelector(stripped, '.app__message--error'), 'styles.css must define .app__message--error as a rule head');
  });

  test('.app__message--notice is defined', () => {
    assert.ok(definesSelector(stripped, '.app__message--notice'), 'styles.css must define .app__message--notice as a rule head');
  });

  test('.app__message--info is defined', () => {
    assert.ok(definesSelector(stripped, '.app__message--info'), 'styles.css must define .app__message--info as a rule head');
  });

  // Layout container
  test('#card-stack is defined', () => {
    assert.ok(definesSelector(stripped, '#card-stack'), 'styles.css must define #card-stack as a rule head');
  });
});

describe('Token-driven styling', () => {
  test('styles.css uses var(-- token references ≥20 times (token-driven, not hardcoded)', () => {
    const tokenMatches = (raw.match(/var\(--/g) || []).length;
    assert.ok(
      tokenMatches >= 20,
      `styles.css only has ${tokenMatches} var(-- usages — must be ≥20 to prove token-driven styling`
    );
  });
});

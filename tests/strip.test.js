/**
 * strip.test.js — TDD tests for src/strip.js (T8, Wave 1).
 *
 * No DOM in node --test. We install a minimal fake DOM on globalThis.document
 * before each test and restore (delete) it after.
 *
 * Assertions:
 *   1. A 7-day fixture renders exactly 7 day columns.
 *   2. Each column contains the correct day-of-week label derived from daily.time[i].
 *   3. Each column contains an icon node keyed to weather_code[i].
 *   4. Each column shows the correct high °F from temperature_2m_max[i].
 *   5. Each column shows the correct low °F from temperature_2m_min[i].
 *   6. Number nodes carry the DS mono class/token (not hardcoded font).
 *   7. The strip container uses DS token classes (not hardcoded color/hex).
 */

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { renderStrip } from '../src/strip.js';

// ---------------------------------------------------------------------------
// Minimal fake-DOM factory
// ---------------------------------------------------------------------------

function makeEl(tag) {
  const el = {
    tagName: tag.toUpperCase(),
    className: '',
    classList: (() => {
      const _s = new Set();
      return {
        _s,
        add(...cs) { cs.forEach(c => _s.add(c)); },
        contains(c) { return _s.has(c); },
        remove(c) { _s.delete(c); },
      };
    })(),
    style: {
      _props: {},
      setProperty(k, v) { this._props[k] = v; },
      getPropertyValue(k) { return this._props[k] ?? ''; },
    },
    dataset: {},
    textContent: '',
    children: [],
    _attrs: {},
    appendChild(child) { this.children.push(child); return child; },
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return this._attrs[k] ?? null; },
  };
  return el;
}

function installFakeDOM() {
  globalThis.document = {
    createElement(tag) { return makeEl(tag); },
  };
}

function removeFakeDOM() {
  delete globalThis.document;
}

// ---------------------------------------------------------------------------
// Fixture: 7-day DailyForecast with varied weather codes and temps
// ---------------------------------------------------------------------------

// Start from 2026-07-06 (Monday) so day names are predictable
const FIXTURE = {
  time: [
    '2026-07-06', // Mon
    '2026-07-07', // Tue
    '2026-07-08', // Wed
    '2026-07-09', // Thu
    '2026-07-10', // Fri
    '2026-07-11', // Sat
    '2026-07-12', // Sun
  ],
  temperature_2m_max: [90, 85, 78, 72, 68, 95, 100],
  temperature_2m_min: [60, 55, 52, 48, 45, 70, 75],
  weather_code: [0, 1, 2, 3, 61, 80, 95],
  // et0 and precipitation_sum are present but strip doesn't use them
  et0: [0.3, 0.2, 0.15, 0.1, 0.2, 0.4, 0.5],
  precipitation_sum: [0, 0, 0, 0, 0.5, 1.0, 0.1],
};

const EXPECTED_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---------------------------------------------------------------------------
// Helper: recursively collect all text from a node tree
// ---------------------------------------------------------------------------
function allText(node) {
  if (!node || typeof node !== 'object') return '';
  const own = node.textContent || '';
  const childText = (node.children || []).map(allText).join(' ');
  return [own, childText].filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Helper: recursively find nodes matching a predicate
// ---------------------------------------------------------------------------
function findAll(node, pred) {
  const results = [];
  function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (pred(n)) results.push(n);
    (n.children || []).forEach(walk);
  }
  walk(node);
  return results;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(installFakeDOM);
afterEach(removeFakeDOM);

test('renderStrip returns an HTMLElement (object with children)', () => {
  const el = renderStrip(FIXTURE);
  assert.ok(el && typeof el === 'object', 'should return an object');
  assert.ok(Array.isArray(el.children), 'should have children array');
});

test('renderStrip produces exactly 7 day columns', () => {
  const strip = renderStrip(FIXTURE);
  // Day columns are immediate children of the strip (or its inner wrapper).
  // We look for nodes whose classList contains 'strip__day' or similar.
  const dayCols = findAll(strip, n =>
    n.classList && (n.classList.contains('strip__day') || n.classList.contains('forecast-strip__day'))
  );
  assert.equal(dayCols.length, 7, `expected 7 day columns, got ${dayCols.length}`);
});

test('each day column contains the correct day-of-week abbreviation', () => {
  const strip = renderStrip(FIXTURE);
  const dayCols = findAll(strip, n =>
    n.classList && (n.classList.contains('strip__day') || n.classList.contains('forecast-strip__day'))
  );
  for (let i = 0; i < 7; i++) {
    const text = allText(dayCols[i]);
    assert.ok(
      text.includes(EXPECTED_DAYS[i]),
      `day column ${i} text "${text}" should include "${EXPECTED_DAYS[i]}"`
    );
  }
});

test('each day column contains an icon node for its weather_code', () => {
  const strip = renderStrip(FIXTURE);
  const dayCols = findAll(strip, n =>
    n.classList && (n.classList.contains('strip__day') || n.classList.contains('forecast-strip__day'))
  );
  for (let i = 0; i < 7; i++) {
    // Icon node: has data-weather-code or classList contains strip__icon / icon
    const iconNodes = findAll(dayCols[i], n =>
      (n.dataset && n.dataset.weatherCode !== undefined) ||
      (n.classList && (
        n.classList.contains('strip__icon') ||
        n.classList.contains('forecast-strip__icon') ||
        n.classList.contains('weather-icon')
      )) ||
      n.tagName === 'SVG'
    );
    assert.ok(
      iconNodes.length > 0,
      `day column ${i} (code ${FIXTURE.weather_code[i]}) should have an icon node`
    );
  }
});

test('each day column shows the correct high °F', () => {
  const strip = renderStrip(FIXTURE);
  const dayCols = findAll(strip, n =>
    n.classList && (n.classList.contains('strip__day') || n.classList.contains('forecast-strip__day'))
  );
  for (let i = 0; i < 7; i++) {
    const highNodes = findAll(dayCols[i], n =>
      n.classList && (
        n.classList.contains('strip__high') ||
        n.classList.contains('forecast-strip__high') ||
        n.classList.contains('temp--high')
      )
    );
    assert.ok(highNodes.length > 0, `day ${i} should have a high-temp node`);
    const text = allText(highNodes[0]);
    assert.ok(
      text.includes(String(FIXTURE.temperature_2m_max[i])),
      `day ${i} high should contain ${FIXTURE.temperature_2m_max[i]}, got "${text}"`
    );
  }
});

test('each day column shows the correct low °F', () => {
  const strip = renderStrip(FIXTURE);
  const dayCols = findAll(strip, n =>
    n.classList && (n.classList.contains('strip__day') || n.classList.contains('forecast-strip__day'))
  );
  for (let i = 0; i < 7; i++) {
    const lowNodes = findAll(dayCols[i], n =>
      n.classList && (
        n.classList.contains('strip__low') ||
        n.classList.contains('forecast-strip__low') ||
        n.classList.contains('temp--low')
      )
    );
    assert.ok(lowNodes.length > 0, `day ${i} should have a low-temp node`);
    const text = allText(lowNodes[0]);
    assert.ok(
      text.includes(String(FIXTURE.temperature_2m_min[i])),
      `day ${i} low should contain ${FIXTURE.temperature_2m_min[i]}, got "${text}"`
    );
  }
});

test('temperature number nodes carry the DS mono class (not hardcoded font)', () => {
  const strip = renderStrip(FIXTURE);
  // All nodes with 'seso-mono' class or data-numeric attribute (DS convention from base.css).
  const monoNodes = findAll(strip, n =>
    (n.classList && n.classList.contains('seso-mono')) ||
    (n.dataset && n.dataset.numeric !== undefined)
  );
  assert.ok(
    monoNodes.length >= 14,  // at least 2 (high + low) × 7 days
    `expected ≥14 mono nodes for 7 highs + 7 lows, got ${monoNodes.length}`
  );
});

test('strip container uses DS token classes, no hardcoded color in style', () => {
  const strip = renderStrip(FIXTURE);
  // The container must not have any style properties with literal hex values.
  // Any colors must come from CSS custom properties (i.e., var(--...)).
  function hasHardcodedColor(node) {
    const props = node.style && node.style._props ? node.style._props : {};
    for (const val of Object.values(props)) {
      // Hex colors or rgb() literals are hardcoded; var(--...) is OK
      if (/^#[0-9a-fA-F]{3,8}$/.test(val) || /^rgb\(/.test(val)) return true;
    }
    return false;
  }
  const offenders = findAll(strip, hasHardcodedColor);
  assert.equal(
    offenders.length,
    0,
    `found nodes with hardcoded color values: ${offenders.map(n => n.tagName).join(', ')}`
  );
});

test('strip container carries a DS token class (not raw inline styles for layout)', () => {
  const strip = renderStrip(FIXTURE);
  // Strip root should carry a BEM class so CSS tokens drive layout.
  const rootHasClass =
    strip.classList.contains('forecast-strip') ||
    strip.classList.contains('strip') ||
    strip.className.includes('strip');
  assert.ok(rootHasClass, `strip root className "${strip.className}" should include a strip class`);
});

test('weather_code 0 (clear sky) and 95 (thunderstorm) produce different icon content', () => {
  // Two fixtures with just 1 day each to isolate icon mapping
  const clearFixture = {
    time: ['2026-07-06'],
    temperature_2m_max: [90],
    temperature_2m_min: [60],
    weather_code: [0],
    et0: [0.3],
    precipitation_sum: [0],
  };
  const stormFixture = {
    time: ['2026-07-06'],
    temperature_2m_max: [75],
    temperature_2m_min: [60],
    weather_code: [95],
    et0: [0.1],
    precipitation_sum: [1.5],
  };
  const clearStrip = renderStrip(clearFixture);
  const stormStrip = renderStrip(stormFixture);

  // Find icon nodes in each
  const clearIcon = findAll(clearStrip, n =>
    (n.dataset && n.dataset.weatherCode !== undefined) ||
    (n.classList && (n.classList.contains('strip__icon') || n.classList.contains('forecast-strip__icon') || n.classList.contains('weather-icon'))) ||
    n.tagName === 'SVG'
  )[0];
  const stormIcon = findAll(stormStrip, n =>
    (n.dataset && n.dataset.weatherCode !== undefined) ||
    (n.classList && (n.classList.contains('strip__icon') || n.classList.contains('forecast-strip__icon') || n.classList.contains('weather-icon'))) ||
    n.tagName === 'SVG'
  )[0];

  assert.ok(clearIcon, 'clear-sky icon node should exist');
  assert.ok(stormIcon, 'thunderstorm icon node should exist');

  // Icons should differ — either different dataset.weatherCode or different textContent/innerHTML
  const clearStr = JSON.stringify(clearIcon);
  const stormStr = JSON.stringify(stormIcon);
  assert.notEqual(clearStr, stormStr, 'WMO code 0 and 95 should produce different icon content');
});

/**
 * main.test.js — TDD tests for T10 (Wave 2): src/main.js full app wiring.
 *
 * Runs under `node --test` (no external deps). Installs a minimal fake DOM on
 * globalThis.document so handleResolvedLocation can query mount points and render
 * into them. All dependencies (isInConus, getForecast, cropCards, crewCards,
 * prioritize, renderCard, renderStrip) are injected as fakes via ctx.
 */

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleResolvedLocation } from '../src/main.js';

// ─── Minimal fake DOM ─────────────────────────────────────────────────────────

/**
 * Build a fake DOM node. Supports the subset of the DOM API that main.js uses:
 * textContent, classList, appendChild, innerHTML (via textContent fallback), children.
 * @param {string} tag
 * @param {string} [id]
 */
function makeFakeNode(tag, id) {
  const classes = new Set();
  const node = {
    tagName: tag.toUpperCase(),
    id: id ?? '',
    textContent: '',
    innerHTML: '',
    children: [],
    _classList: classes,
    classList: {
      add: (...names) => names.forEach(n => classes.add(n)),
      remove: (...names) => names.forEach(n => classes.delete(n)),
      contains: (n) => classes.has(n),
    },
    appendChild(child) { this.children.push(child); return child; },
    setAttribute(name, val) { this[name] = val; },
  };
  return node;
}

let _savedDocument;
let _mountPoints;

function installFakeDocument() {
  _savedDocument = globalThis.document;

  // Named mount-point fakes accessible via querySelector('#id')
  const message = makeFakeNode('p', 'message');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');

  const forecastStrip = makeFakeNode('section', 'forecast-strip');
  const cardStack = makeFakeNode('section', 'card-stack');
  const locationForm = makeFakeNode('div', 'location-form');

  _mountPoints = { message, forecastStrip, cardStack, locationForm };

  const byId = {
    '#message': message,
    '#forecast-strip': forecastStrip,
    '#card-stack': cardStack,
    '#location-form': locationForm,
  };

  globalThis.document = {
    createElement(tag) { return makeFakeNode(tag); },
    querySelector(sel) { return byId[sel] ?? null; },
  };
}

function restoreDocument() {
  if (_savedDocument === undefined) {
    delete globalThis.document;
  } else {
    globalThis.document = _savedDocument;
  }
}

// ─── Fake NormalizedForecast fixture ─────────────────────────────────────────

function makeFakeForecast() {
  const DAYS = 7;
  const dailyTimes = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(Date.UTC(2026, 5, 29 + i));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  });
  return {
    latitude: 36.7,
    longitude: -119.8,
    timezone: 'America/Los_Angeles',
    utc_offset_seconds: -25200,
    hourly: {
      time: [],
      temperature_2m: [],
      apparent_temperature: [],
      precipitation: [],
      precipitation_probability: [],
      wind_speed_10m: [],
      weather_code: [],
    },
    daily: {
      time: dailyTimes,
      et0: Array(DAYS).fill(0.2),
      precipitation_sum: Array(DAYS).fill(0),
      temperature_2m_max: Array(DAYS).fill(80),
      temperature_2m_min: Array(DAYS).fill(60),
      weather_code: Array(DAYS).fill(0),
    },
  };
}

// ─── Fake node for rendered elements ─────────────────────────────────────────

let _fakeNodeCounter = 0;
function makeFakeRenderedNode(label) {
  return makeFakeNode('div', `fake-${label}-${++_fakeNodeCounter}`);
}

// ─── Helper: build ctx with injectable deps ───────────────────────────────────

/**
 * Build a ctx object for handleResolvedLocation. All deps default to harmless
 * no-ops; override only what the test needs.
 */
function makeCtx(overrides = {}) {
  return {
    // DOM mount points
    messageEl: _mountPoints.message,
    forecastStripEl: _mountPoints.forecastStrip,
    cardStackEl: _mountPoints.cardStack,

    // Dependencies — defaults: CONUS passes, forecast succeeds with one crop card
    isInConus: () => true,
    getForecast: async () => makeFakeForecast(),
    cropCards: () => [{ group: 'CROPS', title: 'Test crop', call: 'Do thing', numberLine: '80°F', confidence: 'High', ruleId: 'CR-01', priority: 1 }],
    crewCards: () => [],
    prioritize: (cards) => cards,
    renderCard: (_card) => makeFakeRenderedNode('card'),
    renderStrip: (_daily) => makeFakeRenderedNode('strip'),

    ...overrides,
  };
}

// ─── Test setup / teardown ───────────────────────────────────────────────────

beforeEach(() => {
  _fakeNodeCounter = 0;
  installFakeDocument();
});

afterEach(() => {
  restoreDocument();
});

// ─── Test 1 — CONUS guard blocks forecast ─────────────────────────────────────

test('CONUS guard: getForecast never called and #message shows coverage string when isInConus returns false', async () => {
  let forecastCalled = false;

  const ctx = makeCtx({
    isInConus: () => false,
    getForecast: async () => {
      forecastCalled = true;
      return makeFakeForecast();
    },
  });

  const loc = { lat: 21.3, lon: -157.8 }; // Hawaii, outside CONUS
  await handleResolvedLocation(loc, ctx);

  assert.equal(forecastCalled, false, 'getForecast must NOT be called when isInConus returns false');
  assert.equal(
    ctx.messageEl.textContent,
    'Farm Weather Advisor currently covers the continental US — try a location in the lower 48',
    '#message must show exact CONUS coverage string',
  );
  assert.equal(ctx.forecastStripEl.children.length, 0, '#forecast-strip must stay empty');
  assert.equal(ctx.cardStackEl.children.length, 0, '#card-stack must stay empty');
});

// ─── Test 2 — Happy path ──────────────────────────────────────────────────────

test('happy path: strip appended to #forecast-strip, cards appended to #card-stack, #message cleared', async () => {
  const callOrder = [];
  const forecast = makeFakeForecast();

  const ctx = makeCtx({
    isInConus: (loc) => {
      callOrder.push({ fn: 'isInConus', loc });
      return true;
    },
    getForecast: async (coords) => {
      callOrder.push({ fn: 'getForecast', coords });
      return forecast;
    },
    cropCards: () => [
      { group: 'CROPS', title: 'Irrigate', call: 'Start irrigation', numberLine: 'ET₀ 0.4 in/day', confidence: 'Dry week', ruleId: 'CR-02', priority: 1 },
    ],
    crewCards: () => [],
    prioritize: (cards) => cards,
    renderCard: (_card) => makeFakeRenderedNode('card'),
    renderStrip: (_daily) => makeFakeRenderedNode('strip'),
  });

  const loc = { lat: 36.7, lon: -119.7, name: 'Fresno', country_code: 'US', admin1: 'California' };
  await handleResolvedLocation(loc, ctx);

  // Strip rendered
  assert.equal(ctx.forecastStripEl.children.length, 1, '#forecast-strip must have one child (the strip)');

  // At least one card rendered
  assert.ok(ctx.cardStackEl.children.length >= 1, '#card-stack must have at least one card');

  // #message cleared on success
  assert.equal(ctx.messageEl.textContent, '', '#message must be cleared on success');

  // getForecast called with correct coords
  const forecastCall = callOrder.find(c => c.fn === 'getForecast');
  assert.ok(forecastCall, 'getForecast must be called');
  assert.equal(forecastCall.coords.lat, 36.7, 'getForecast called with correct lat');
  assert.equal(forecastCall.coords.lon, -119.7, 'getForecast called with correct lon');

  // Ordering: isInConus BEFORE getForecast
  const conusIdx = callOrder.findIndex(c => c.fn === 'isInConus');
  const forecastIdx = callOrder.findIndex(c => c.fn === 'getForecast');
  assert.ok(conusIdx !== -1, 'isInConus must be called');
  assert.ok(conusIdx < forecastIdx, 'isInConus must be called BEFORE getForecast');
});

// ─── Test 3 — Forecast failure ────────────────────────────────────────────────

test('forecast failure: #message shows error string, no cards/strip rendered, no unhandled rejection', async () => {
  const onUnhandled = (err) => { throw err; };
  process.on('unhandledRejection', onUnhandled);

  const ctx = makeCtx({
    isInConus: () => true,
    getForecast: async () => { throw new Error('Network error: 503 Service Unavailable'); },
  });

  try {
    const loc = { lat: 36.7, lon: -119.7 };
    await handleResolvedLocation(loc, ctx);

    assert.equal(
      ctx.messageEl.textContent,
      "Couldn't load the forecast — check your connection and try again.",
      '#message must show exact forecast error string',
    );
    assert.equal(ctx.forecastStripEl.children.length, 0, '#forecast-strip must stay empty on error');
    assert.equal(ctx.cardStackEl.children.length, 0, '#card-stack must stay empty on error');
  } finally {
    process.removeListener('unhandledRejection', onUnhandled);
  }
});

// ─── Test 4 — Re-search resets previous render ────────────────────────────────

test('re-search resets: second call clears first render before producing new results', async () => {
  let callCount = 0;
  const ctx = makeCtx({
    isInConus: () => true,
    getForecast: async () => {
      callCount++;
      return makeFakeForecast();
    },
    cropCards: () => [
      { group: 'CROPS', title: 'Card', call: 'Action', numberLine: '80°F', confidence: 'Ok', ruleId: 'CR-01', priority: 1 },
    ],
    crewCards: () => [],
    prioritize: (cards) => cards,
    renderCard: (_card) => makeFakeRenderedNode('card'),
    renderStrip: (_daily) => makeFakeRenderedNode('strip'),
  });

  // First search
  const loc1 = { lat: 36.7, lon: -119.7, country_code: 'US' };
  await handleResolvedLocation(loc1, ctx);

  assert.equal(ctx.forecastStripEl.children.length, 1, 'after first search: strip present');
  assert.equal(ctx.cardStackEl.children.length, 1, 'after first search: one card present');

  // Second search — result should replace, not stack
  const loc2 = { lat: 37.3, lon: -120.0, country_code: 'US' };
  await handleResolvedLocation(loc2, ctx);

  assert.equal(callCount, 2, 'getForecast called twice');
  assert.equal(ctx.forecastStripEl.children.length, 1, '#forecast-strip must have exactly one strip after re-search, not two');
  assert.equal(ctx.cardStackEl.children.length, 1, '#card-stack must have exactly one set of cards after re-search, not stacked');
  assert.equal(ctx.messageEl.textContent, '', '#message cleared after second successful search');
});

// ─── Test 5 — Ordering invariant ──────────────────────────────────────────────

test('ordering invariant: isInConus=false proves getForecast never runs; positive order recorded in happy path', async () => {
  // Part A: isInConus=false → getForecast definitely never called
  let forecastCalled = false;
  const ctxA = makeCtx({
    isInConus: () => false,
    getForecast: async () => { forecastCalled = true; return makeFakeForecast(); },
  });
  await handleResolvedLocation({ lat: 21.3, lon: -157.8 }, ctxA);
  assert.equal(forecastCalled, false, 'Part A: getForecast must not be called when CONUS check fails');

  // Part B: happy path records isInConus before getForecast via call log
  const callLog = [];
  const ctxB = makeCtx({
    isInConus: (loc) => { callLog.push('isInConus'); return true; },
    getForecast: async () => { callLog.push('getForecast'); return makeFakeForecast(); },
  });
  await handleResolvedLocation({ lat: 36.7, lon: -119.7, country_code: 'US' }, ctxB);

  const conusPos = callLog.indexOf('isInConus');
  const forecastPos = callLog.indexOf('getForecast');
  assert.ok(conusPos !== -1, 'Part B: isInConus must be called in happy path');
  assert.ok(forecastPos !== -1, 'Part B: getForecast must be called in happy path');
  assert.ok(conusPos < forecastPos, `Part B: isInConus (pos ${conusPos}) must precede getForecast (pos ${forecastPos})`);
});

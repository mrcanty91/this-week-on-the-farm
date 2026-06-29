/**
 * locationInput.test.js — TDD tests for T9 (Wave 1).
 *
 * Runs under `node --test` (no external deps). Installs a minimal fake DOM on
 * globalThis.document so mountLocationInput can call document.createElement,
 * then injects deps.geocode and deps.geolocation fakes to exercise all four
 * behaviour branches without network or browser APIs.
 */

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mountLocationInput } from '../src/locationInput.js';

// ─── Minimal fake DOM ────────────────────────────────────────────────────────

/**
 * Build a fake DOM node. Supports the subset of the DOM API that
 * mountLocationInput actually uses.
 * @param {string} tag
 */
function makeFakeNode(tag) {
  const node = {
    tagName: tag.toUpperCase(),
    className: '',
    classList: (() => {
      const set = new Set();
      return {
        add: (...names) => names.forEach(n => set.add(n)),
        contains: (n) => set.has(n),
        remove: (...names) => names.forEach(n => set.delete(n)),
      };
    })(),
    style: {
      setProperty() {},
      // Support direct property assignment too (style.color = ...)
    },
    dataset: {},
    value: '',
    textContent: '',
    type: '',
    placeholder: '',
    children: [],
    _listeners: {},
    appendChild(child) { this.children.push(child); return child; },
    addEventListener(type, fn) { this._listeners[type] = fn; },
    setAttribute(name, val) { this[name] = val; },
  };
  return node;
}

let _savedDocument;

function installFakeDocument() {
  _savedDocument = globalThis.document;
  globalThis.document = {
    createElement(tag) { return makeFakeNode(tag); },
  };
}

function restoreDocument() {
  if (_savedDocument === undefined) {
    delete globalThis.document;
  } else {
    globalThis.document = _savedDocument;
  }
}

// ─── Helper: build a host element ───────────────────────────────────────────

function makeHost() {
  return makeFakeNode('div');
}

// ─── Helper: find nodes by a predicate (recursive) ──────────────────────────

function findAll(node, predicate) {
  const results = [];
  function walk(n) {
    if (predicate(n)) results.push(n);
    for (const child of (n.children || [])) walk(child);
  }
  walk(node);
  return results;
}

function findByTag(node, tag) {
  return findAll(node, n => n.tagName === tag.toUpperCase());
}

/**
 * Click the first button whose textContent includes `text`.
 */
function clickButton(host, text) {
  const buttons = findByTag(host, 'button');
  const btn = buttons.find(b => b.textContent.includes(text));
  assert.ok(btn, `button with text "${text}" not found`);
  btn._listeners['click']?.();
}

/**
 * Set the input value and simulate submit.
 */
function submitInput(host, value) {
  const inputs = findByTag(host, 'input');
  assert.ok(inputs.length > 0, 'no <input> found in host');
  inputs[0].value = value;
  // Find and click the submit button (first button that is NOT "Use my location")
  const buttons = findByTag(host, 'button');
  const submitBtn = buttons.find(b => !b.textContent.includes('location'));
  assert.ok(submitBtn, 'submit button not found');
  submitBtn._listeners['click']?.();
}

/**
 * Find message/status element (by looking for any element with textContent set).
 * Returns the message text or '' if none.
 */
function getMessageText(host) {
  // We look for nodes that have been given textContent (i.e. message nodes).
  // Skip buttons and inputs — look for div/span/p with textContent.
  const candidates = findAll(
    host,
    n => n.textContent && n.tagName !== 'BUTTON' && n.tagName !== 'INPUT',
  );
  return candidates.map(n => n.textContent).join(' ').trim();
}

// ─── Test setup / teardown ───────────────────────────────────────────────────

beforeEach(() => { installFakeDocument(); });
afterEach(() => { restoreDocument(); });

// ─── Test 1 — geolocation success → onResolve called with coords ─────────────

test('geolocation success calls onResolve with the coords', () => {
  const host = makeHost();
  const calls = [];

  const fakeGeo = {
    getCurrentPosition(success, _error) {
      success({ coords: { latitude: 36.7, longitude: -119.7 } });
    },
  };

  mountLocationInput(host, (loc) => calls.push(loc), { geolocation: fakeGeo });

  clickButton(host, 'location');

  assert.equal(calls.length, 1, 'onResolve should be called exactly once');
  assert.equal(calls[0].lat, 36.7);
  assert.equal(calls[0].lon, -119.7);
});

// ─── Test 2 — geolocation denial → inline message + typed path still works ──

test('geolocation denial shows inline error and typed path still works', async () => {
  const host = makeHost();
  const calls = [];

  const fakeGeo = {
    getCurrentPosition(_success, error) {
      error({ code: 1, message: 'User denied Geolocation' });
    },
  };

  const fakeGeocode = async () => ({ lat: 36.7, lon: -119.7, name: 'Fresno' });

  mountLocationInput(host, (loc) => calls.push(loc), {
    geolocation: fakeGeo,
    geocode: fakeGeocode,
  });

  // Click "Use my location" — should fail silently + show message
  clickButton(host, 'location');

  const msg = getMessageText(host);
  assert.ok(msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('type'), `expected denial message, got: "${msg}"`);
  assert.equal(calls.length, 0, 'onResolve should NOT be called after denial');

  // Now type-and-submit should still work
  await submitInput(host, 'Fresno CA');
  // Give promises a tick to resolve
  await new Promise(r => setTimeout(r, 0));

  assert.equal(calls.length, 1, 'typed path should still call onResolve after geo denial');
  assert.equal(calls[0].lat, 36.7);
});

// ─── Test 3 — typed + submit with geocode hit → onResolve called ────────────

test('typed submit with geocode hit calls onResolve with lat/lon/name', async () => {
  const host = makeHost();
  const calls = [];

  const fakeGeocode = async (place) => {
    assert.equal(place, 'Salinas CA');
    return { lat: 36.677, lon: -121.655, name: 'Salinas', country_code: 'US', admin1: 'California' };
  };

  mountLocationInput(host, (loc) => calls.push(loc), { geocode: fakeGeocode });

  await submitInput(host, 'Salinas CA');
  await new Promise(r => setTimeout(r, 0));

  assert.equal(calls.length, 1);
  assert.equal(calls[0].lat, 36.677);
  assert.equal(calls[0].lon, -121.655);
  assert.equal(calls[0].name, 'Salinas');
});

// ─── Test 4 — geocode returns null → not-found message, onResolve NOT called ─

test('typed submit with geocode null shows not-found message and does not call onResolve', async () => {
  const host = makeHost();
  const calls = [];

  const fakeGeocode = async () => null;

  mountLocationInput(host, (loc) => calls.push(loc), { geocode: fakeGeocode });

  await submitInput(host, 'Nonexistent Place XYZ');
  await new Promise(r => setTimeout(r, 0));

  assert.equal(calls.length, 0, 'onResolve must NOT be called when geocode returns null');

  const msg = getMessageText(host);
  assert.ok(
    msg.toLowerCase().includes("couldn't find") || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('try'),
    `expected not-found message, got: "${msg}"`,
  );
});

// ─── Test 5 — geocode REJECTS → inline error, onResolve NOT called, no leak ──

test('typed submit where geocode rejects shows inline error and does not call onResolve', async () => {
  const host = makeHost();
  const calls = [];

  // Surface any unhandled rejection as a test failure.
  const onUnhandled = (err) => { throw err; };
  process.on('unhandledRejection', onUnhandled);

  const fakeGeocode = async () => { throw new Error('Geocoding API error: 503 Service Unavailable'); };

  mountLocationInput(host, (loc) => calls.push(loc), { geocode: fakeGeocode });

  try {
    await submitInput(host, 'Fresno CA');
    await new Promise(r => setTimeout(r, 0));

    assert.equal(calls.length, 0, 'onResolve must NOT be called when geocode rejects');
    const msg = getMessageText(host);
    assert.ok(
      msg.toLowerCase().includes('could not reach') || msg.toLowerCase().includes('connection'),
      `expected a service-error message, got: "${msg}"`,
    );
  } finally {
    process.removeListener('unhandledRejection', onUnhandled);
  }
});

/**
 * card.test.js — TDD tests for renderCard (T7, Wave 1).
 *
 * Installs a minimal fake DOM on globalThis.document before each test.
 * The fake is sufficient for renderCard to build a real node tree and
 * for us to assert structure, classes, and text content — without any
 * browser runtime or third-party DOM library.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { renderCard } from '../src/card.js';

// ---------------------------------------------------------------------------
// Minimal fake-DOM factory — restores/replaces per test via beforeEach
// ---------------------------------------------------------------------------

function makeNode(tag) {
  return {
    tagName: tag.toUpperCase(),
    className: '',
    classList: (() => {
      const _s = new Set();
      return {
        _s,
        add(c) { _s.add(c); },
        contains(c) { return _s.has(c); },
        remove(c) { _s.delete(c); },
      };
    })(),
    style: {
      _props: {},
      setProperty(k, v) { this._props[k] = v; },
      getPropertyValue(k) { return this._props[k]; },
    },
    dataset: {},
    textContent: '',
    children: [],
    appendChild(child) { this.children.push(child); return child; },
    setAttribute(k, v) { this[k] = v; },
  };
}

function installFakeDocument() {
  globalThis.document = {
    createElement(tag) { return makeNode(tag); },
  };
}

beforeEach(() => {
  installFakeDocument();
});

// ---------------------------------------------------------------------------
// Representative sample Card (§9 fields, all four content fields + group)
// ---------------------------------------------------------------------------

const SAMPLE_CARD = {
  group: 'CROPS',
  title: 'Skip Irrigation Through Thursday',
  call: 'Skip irrigation — 0.8in of rain forecast by Thursday.',
  numberLine: '0.8in rain by Thursday · ET₀ 0.3in/day',
  confidence: 'High confidence — strong 72h model agreement, no model spread.',
  ruleId: 'CR-01',
  priority: 5,
};

const CREW_CARD = {
  group: 'CREW',
  title: 'Start Crew Early: Thursday',
  call: 'Put crew in the field by 6am Thursday.',
  numberLine: 'High 97°F — OSHA heat advisory threshold hit after 10am.',
  confidence: 'Thursday last good work window before heat sets in.',
  ruleId: 'CW-02',
  priority: 3,
};

// ---------------------------------------------------------------------------
// Test 1 — renderCard returns an HTMLElement (not null / not throws)
// ---------------------------------------------------------------------------

test('renderCard returns a DOM node without throwing', () => {
  const node = renderCard(SAMPLE_CARD);
  assert.ok(node, 'renderCard should return a node');
  assert.equal(typeof node, 'object', 'should be an object (DOM node)');
  assert.ok(node.children, 'node should have children array');
});

// ---------------------------------------------------------------------------
// Test 2 — card root carries a DS card class (not hardcoded hex)
// ---------------------------------------------------------------------------

test('card root carries the DS "seso-card" class token', () => {
  const node = renderCard(SAMPLE_CARD);
  assert.ok(
    node.classList.contains('seso-card'),
    'card root must have class "seso-card" (DS token class — no inline hardcoded color)'
  );
});

// ---------------------------------------------------------------------------
// Test 3 — group label (CROPS/CREW) is rendered (§9 field 1)
// ---------------------------------------------------------------------------

test('group label is rendered with value "CROPS"', () => {
  const node = renderCard(SAMPLE_CARD);
  const found = findByText(node, 'CROPS');
  assert.ok(found, 'group label "CROPS" must appear in the rendered card');
});

test('group label is rendered with value "CREW"', () => {
  const node = renderCard(CREW_CARD);
  const found = findByText(node, 'CREW');
  assert.ok(found, 'group label "CREW" must appear in the rendered card');
});

// ---------------------------------------------------------------------------
// Test 4 — title is rendered (§9 field 2)
// ---------------------------------------------------------------------------

test('title is rendered in the card', () => {
  const node = renderCard(SAMPLE_CARD);
  const found = findByText(node, SAMPLE_CARD.title);
  assert.ok(found, `title "${SAMPLE_CARD.title}" must appear in the rendered card`);
});

// ---------------------------------------------------------------------------
// Test 5 — call is rendered (§9 field 3)
// ---------------------------------------------------------------------------

test('call is rendered in the card', () => {
  const node = renderCard(SAMPLE_CARD);
  const found = findByText(node, SAMPLE_CARD.call);
  assert.ok(found, `call "${SAMPLE_CARD.call}" must appear in the rendered card`);
});

// ---------------------------------------------------------------------------
// Test 6 — numberLine is rendered (§9 field 4) and uses DS mono class
// ---------------------------------------------------------------------------

test('numberLine is rendered in the card', () => {
  const node = renderCard(SAMPLE_CARD);
  const found = findByText(node, SAMPLE_CARD.numberLine);
  assert.ok(found, `numberLine "${SAMPLE_CARD.numberLine}" must appear in the rendered card`);
});

test('numberLine node carries the DS mono class "seso-mono" (IBM Plex Mono — no hardcoded font)', () => {
  const node = renderCard(SAMPLE_CARD);
  // Find the node whose textContent matches the numberLine
  const monoNode = findNodeByText(node, SAMPLE_CARD.numberLine);
  assert.ok(monoNode, 'numberLine node must exist');
  assert.ok(
    monoNode.classList.contains('seso-mono'),
    'numberLine node must carry class "seso-mono" (DS token class for IBM Plex Mono)'
  );
});

// ---------------------------------------------------------------------------
// Test 7 — confidence is rendered (§9 field 5)
// ---------------------------------------------------------------------------

test('confidence line is rendered in the card', () => {
  const node = renderCard(SAMPLE_CARD);
  const found = findByText(node, SAMPLE_CARD.confidence);
  assert.ok(found, `confidence "${SAMPLE_CARD.confidence}" must appear in the rendered card`);
});

// ---------------------------------------------------------------------------
// Test 8 — §9 ORDER: group → title → call → numberLine → confidence
// ---------------------------------------------------------------------------

test('fields appear in §9 order: group label → title → call → numberLine → confidence', () => {
  const node = renderCard(SAMPLE_CARD);

  // Collect all text leaves in document-order (DFS)
  const texts = collectTexts(node);

  const iGroup  = texts.findIndex(t => t.includes('CROPS'));
  const iTitle  = texts.findIndex(t => t.includes(SAMPLE_CARD.title));
  const iCall   = texts.findIndex(t => t.includes(SAMPLE_CARD.call));
  const iNumber = texts.findIndex(t => t.includes(SAMPLE_CARD.numberLine));
  const iConf   = texts.findIndex(t => t.includes(SAMPLE_CARD.confidence));

  assert.ok(iGroup  >= 0, 'group label must be present');
  assert.ok(iTitle  >= 0, 'title must be present');
  assert.ok(iCall   >= 0, 'call must be present');
  assert.ok(iNumber >= 0, 'numberLine must be present');
  assert.ok(iConf   >= 0, 'confidence must be present');

  assert.ok(iGroup  < iTitle,  'group label must appear before title');
  assert.ok(iTitle  < iCall,   'title must appear before call');
  assert.ok(iCall   < iNumber, 'call must appear before numberLine');
  assert.ok(iNumber < iConf,   'numberLine must appear before confidence');
});

// ---------------------------------------------------------------------------
// Test 9 — group label carries the DS eyebrow/brand accent class
// ---------------------------------------------------------------------------

test('group label node carries the DS eyebrow class "seso-eyebrow"', () => {
  const node = renderCard(SAMPLE_CARD);
  const groupNode = findNodeByText(node, 'CROPS');
  assert.ok(groupNode, 'group label node must exist');
  assert.ok(
    groupNode.classList.contains('seso-eyebrow'),
    'group label must carry class "seso-eyebrow" (DS eyebrow token — brand green via token, not hardcoded)'
  );
});

// ---------------------------------------------------------------------------
// Test 10 — CREW card renders with its own group label
// ---------------------------------------------------------------------------

test('CREW card renders group label "CREW" with seso-eyebrow class', () => {
  const node = renderCard(CREW_CARD);
  const groupNode = findNodeByText(node, 'CREW');
  assert.ok(groupNode, 'CREW group label node must exist');
  assert.ok(
    groupNode.classList.contains('seso-eyebrow'),
    'CREW group label must carry "seso-eyebrow" class'
  );
});

// ---------------------------------------------------------------------------
// Helpers — DFS tree traversal on the fake-DOM node structure
// ---------------------------------------------------------------------------

/**
 * Returns true if `text` appears as the textContent of any node in the tree.
 * @param {object} node
 * @param {string} text
 */
function findByText(node, text) {
  if (node.textContent === text) return true;
  for (const child of (node.children || [])) {
    if (findByText(child, text)) return true;
  }
  return false;
}

/**
 * Returns the first node whose textContent exactly matches `text`.
 * @param {object} node
 * @param {string} text
 * @returns {object|null}
 */
function findNodeByText(node, text) {
  if (node.textContent === text) return node;
  for (const child of (node.children || [])) {
    const found = findNodeByText(child, text);
    if (found) return found;
  }
  return null;
}

/**
 * DFS collect of all non-empty textContent values, in tree order.
 * @param {object} node
 * @returns {string[]}
 */
function collectTexts(node) {
  const results = [];
  if (node.textContent && node.textContent.trim()) {
    results.push(node.textContent);
  }
  for (const child of (node.children || [])) {
    results.push(...collectTexts(child));
  }
  return results;
}

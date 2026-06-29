/**
 * vercel.test.js — T12 static deploy config guard.
 *
 * Asserts that vercel.json is valid JSON and contains no build step, so the
 * static-deploy guarantee holds (no framework build, repo root = web root,
 * index.html served at /, /src/*.js served as ES modules).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('vercel.json exists and is valid JSON', () => {
  const content = readFileSync('./vercel.json', 'utf-8');
  const config = JSON.parse(content);
  assert.ok(config, 'vercel.json must contain a valid JSON object');
});

test('vercel.json has no build step (buildCommand is null)', () => {
  const content = readFileSync('./vercel.json', 'utf-8');
  const config = JSON.parse(content);
  assert.strictEqual(config.buildCommand, null, 'buildCommand must be null (no build step)');
});

test('vercel.json has no framework build (no buildCommand, no framework)', () => {
  const content = readFileSync('./vercel.json', 'utf-8');
  const config = JSON.parse(content);
  assert.strictEqual(config.buildCommand, null, 'buildCommand must be null');
  assert.strictEqual(config.framework, undefined, 'framework field should not set a build framework');
});

test('vercel.json marks the repo as public source', () => {
  const content = readFileSync('./vercel.json', 'utf-8');
  const config = JSON.parse(content);
  assert.strictEqual(config.publicSource, true, 'publicSource must be true (public URL)');
});

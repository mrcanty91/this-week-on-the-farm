#!/usr/bin/env node
/**
 * validate-vercel-config.cjs — lint vercel.json against Vercel's published
 * config schema, so an invalid/unknown key fails in CI instead of at deploy.
 *
 * This exists because an invalid `vercel.json` key (`publicSource`) passed unit
 * review but was only rejected by Vercel's deploy-time schema validator
 * ("should NOT have additional property publicSource"). This script runs that
 * same `additionalProperties:false` check (plus value typing) before deploy.
 *
 * Usage:  node scripts/validate-vercel-config.cjs <schema.json> <vercel.json>
 * Requires ajv@6 (installed ephemerally in CI — the repo stays dependency-free).
 *
 * Note: Vercel's schema is a non-strict draft-04 (it mixes draft-06 numeric
 * `exclusiveMinimum`), so AJV's schema meta-validation is disabled — we validate
 * OUR config against the schema, we don't re-certify the schema itself.
 */
'use strict';

const fs = require('node:fs');

const [schemaPath, dataPath] = process.argv.slice(2);
if (!schemaPath || !dataPath) {
  console.error('usage: node scripts/validate-vercel-config.cjs <schema.json> <vercel.json>');
  process.exit(2);
}

let Ajv;
try {
  Ajv = require('ajv');
} catch {
  console.error("ajv not found — install it first (CI: `npm i --no-save ajv@6`).");
  process.exit(2);
}

let schema, data;
try {
  schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
} catch (err) {
  console.error(`could not read/parse schema ${schemaPath}: ${err.message}`);
  process.exit(2);
}
try {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (err) {
  console.error(`could not read/parse ${dataPath}: ${err.message}`);
  process.exit(2);
}

const ajv = new Ajv({ schemaId: 'auto', allErrors: true, validateSchema: false, logger: false });
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

const validate = ajv.compile(schema);
if (validate(data)) {
  console.log(`${dataPath}: valid against the Vercel config schema`);
  process.exit(0);
}

console.error(`${dataPath}: INVALID — does not match the Vercel config schema:`);
for (const e of validate.errors) {
  const where = e.dataPath || '(root)';
  const extra = e.params && e.params.additionalProperty ? `: '${e.params.additionalProperty}'` : '';
  console.error(`  ${where} ${e.message}${extra}`);
}
process.exit(1);

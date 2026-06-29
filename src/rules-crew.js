/**
 * rules-crew.js — Crew rules CW-01..03 (T5, Wave 1). WAVE 0: STUB.
 *
 * forecast → crew cards. CW-01 Workable Days always fires; CW-02 Start Times is
 * always-on (benign "normal hours" copy, escalates to early-start at ≥95°F on a
 * workable day); CW-03 Heat Risk at ≥103°F apparent, Heat Danger at ≥125°F.
 * Spec: PRD §8 (Crew), §9.
 *
 * @typedef {import('./card.js').Card} Card
 * @typedef {import('./forecast.js').NormalizedForecast} NormalizedForecast
 */

/**
 * Produce the crew cards for a forecast.
 * @param {NormalizedForecast} forecast
 * @returns {Card[]}
 */
export function crewCards(forecast) {
  void forecast;
  throw new Error('not implemented: crewCards (Wave 1 / T5)');
}

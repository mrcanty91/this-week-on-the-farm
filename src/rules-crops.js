/**
 * rules-crops.js — Crop rules CR-01..04 (T4, Wave 1). WAVE 0: STUB.
 *
 * forecast → crop cards. ET₀ is ALREADY IN INCHES on the forecast object
 * (forecast.js header) — compare directly to the §8 inch thresholds; never
 * re-convert. CR-04 frost is always high confidence. Spec: PRD §8 (Crops), §9.
 *
 * @typedef {import('./card.js').Card} Card
 * @typedef {import('./forecast.js').NormalizedForecast} NormalizedForecast
 */

/**
 * Produce the crop cards for a forecast.
 * @param {NormalizedForecast} forecast
 * @returns {Card[]}
 */
export function cropCards(forecast) {
  void forecast;
  throw new Error('not implemented: cropCards (Wave 1 / T4)');
}

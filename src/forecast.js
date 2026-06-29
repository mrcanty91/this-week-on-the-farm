/**
 * forecast.js — Forecast client (T2, Wave 1). WAVE 0: DOCUMENTED STUB.
 *
 * This file defines THE CENTRAL CONTRACT of the app: the normalized forecast
 * object. T3–T6 (conus, rules-crops, rules-crew, prioritize) all consume the
 * shape documented here, so it is locked in WAVE 0 before any parallel
 * rule-writing begins. The implementation (single Open-Meteo call, parsing,
 * normalization) is built in Wave 1; only the signature + schema live here now.
 *
 * Spec refs: PRD §7 (data contract), PLAN "forecast object is the central
 * contract", Tool-Validation-Memo gotcha #1 (ET₀ units).
 *
 * ────────────────────────────────────────────────────────────────────────
 * ET₀ IS EXPRESSED IN INCHES IN THIS OBJECT.
 * ────────────────────────────────────────────────────────────────────────
 * Every consumer compares `daily[].et0` directly against the §8 INCH
 * thresholds (IRRIGATE_ET0_IN_PER_DAY = 0.3, ET0_DEFICIT_HIGH_IN_PER_DAY = 0.5).
 * Rule code must NEVER see millimeters and must NEVER re-apply ET0_MM_TO_IN.
 *
 * Source of the inch value (WAVE-0 smoke-test finding, 2026-06-29): because the
 * forecast request passes `precipitation_unit=inch` (config.UNITS, required by
 * §7), the live Open-Meteo API already returns et0_fao_evapotranspiration in
 * inches. T2 therefore passes that value through unchanged — it does NOT
 * multiply by ET0_MM_TO_IN, which would double-convert and silently break
 * irrigation. See the ET0_MM_TO_IN note in config.js (escalated to PM).
 */

import { buildForecastParams } from './config.js';

/**
 * One hour of the normalized hourly series. All arrays in `hourly` are parallel
 * and index-aligned to `hourly.time` (local time per timezone=auto).
 *
 * @typedef {Object} HourlyForecast
 * @property {string[]} time                    ISO local timestamps (timezone=auto), length N
 * @property {number[]} temperature_2m          °F, length N
 * @property {number[]} apparent_temperature    °F ("feels like"), length N
 * @property {number[]} precipitation           inch (per hour), length N
 * @property {number[]} precipitation_probability  % (0–100), length N
 * @property {number[]} wind_speed_10m          mph, length N
 * @property {number[]} weather_code            WMO code, length N
 */

/**
 * One day of the normalized daily series. Index-aligned to `daily.time`.
 * NOTE: `et0` is in INCHES (see file header).
 *
 * @typedef {Object} DailyForecast
 * @property {string[]} time                ISO local dates (YYYY-MM-DD), length 7
 * @property {number[]} et0                 ET₀ in INCHES/day (converted contract), length 7
 * @property {number[]} precipitation_sum   inch (daily total), length 7
 * @property {number[]} temperature_2m_max  °F (daily high), length 7
 * @property {number[]} temperature_2m_min  °F (daily low), length 7
 * @property {number[]} weather_code        WMO code (daily), length 7
 */

/**
 * The normalized forecast object — the single contract all rules consume.
 *
 * @typedef {Object} NormalizedForecast
 * @property {number} latitude              resolved latitude (°N)
 * @property {number} longitude             resolved longitude (°W, negative)
 * @property {string} timezone              IANA tz resolved by timezone=auto
 * @property {number} utc_offset_seconds    offset for the resolved timezone
 * @property {HourlyForecast} hourly        index-aligned hourly series (~168 hrs)
 * @property {DailyForecast} daily          index-aligned 7-day series
 */

/**
 * Fetch and normalize a 7-day Open-Meteo forecast for a coordinate.
 *
 * Wave-1 contract (NOT implemented in WAVE 0):
 *  - single client-side call to FORECAST_ENDPOINT using buildForecastParams()
 *    (underscore param names, imperial units, timezone=auto, forecast_days=7);
 *  - returns a {@link NormalizedForecast} with ET₀ in INCHES (pass-through, see
 *    header) and all hourly/daily arrays index-aligned to their `time` arrays;
 *  - on network/HTTP failure THROWS a catchable Error — never returns a partial
 *    object (PRD §10: "failure shows an error state, not partial cards").
 *
 * @param {{lat: number, lon: number}} coords
 * @returns {Promise<NormalizedForecast>}
 */
export async function getForecast(coords) {
  // WAVE 0 stub — implemented in Wave 1 (T2). Reference the param builder so the
  // shared contract is exercised and the import resolves.
  void buildForecastParams;
  void coords;
  throw new Error('not implemented: getForecast (Wave 1 / T2)');
}

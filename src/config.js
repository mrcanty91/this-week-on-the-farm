/**
 * config.js — Shared constants for Farm Weather Advisor (WAVE 0 contract).
 *
 * Single source of truth for: CONUS bounds, every §8 product threshold,
 * the Open-Meteo endpoints + request parameters (modern UNDERSCORE names),
 * imperial units, and the §7 hourly/daily field lists.
 *
 * Downstream modules (geocode, forecast, conus, rules-*, prioritize, UI)
 * import from here — they MUST NOT hardcode thresholds or units.
 *
 * Spec refs: PRD-Farm-Weather-Advisor.md §6 (CONUS), §7 (data contract),
 * §8 (rules), §9 (card spec). Thresholds are PM-owned and "not negotiable
 * without a PM decision logged in §12."
 */

/* ============================================================
   CONUS bounding box (PRD §6 — "~24–50°N, −125 to −66°W")
   Applied to RESOLVED coordinates before any forecast call/render.
   ============================================================ */
export const CONUS_BBOX = Object.freeze({
  LAT_MIN: 24, // °N — southern tip of the lower-48
  LAT_MAX: 50, // °N — northern border
  LON_MIN: -125, // °W — Pacific coast
  LON_MAX: -66, // °W — Atlantic coast
});

/* ============================================================
   §8 THRESHOLDS — Crops (CR-01..04)
   ============================================================ */

// CR-01 Skip Irrigation: fires when precipitation ≥ 0.3in forecast in next 48h.
export const SKIP_IRRIGATION_PRECIP_IN = 0.3; // inches, ≥
export const IRRIGATION_LOOKAHEAD_HOURS = 48; // "next 48h" window

// CR-01 counter-rule: if ET₀ deficit is high (>0.5in/day) AND precip probability
// <40%, prefer Irrigate instead of Skip.
export const ET0_DEFICIT_HIGH_IN_PER_DAY = 0.5; // inches/day, >
export const PRECIP_PROBABILITY_LOW_PCT = 40; // %, < (counter-rule)

// CR-02 Irrigate: fires when ET₀ > 0.3in/day AND no rain in 48h AND no skip rule fired.
export const IRRIGATE_ET0_IN_PER_DAY = 0.3; // inches/day, >

// CR-03 Spray Window: wind <10mph AND no precip ±4h AND temp 50–90°F.
export const SPRAY_WIND_MAX_MPH = 10; // mph, <
export const SPRAY_PRECIP_WINDOW_HOURS = 4; // ±hours: no precip within this band
export const SPRAY_TEMP_MIN_F = 50; // °F, inclusive lower bound
export const SPRAY_TEMP_MAX_F = 90; // °F, inclusive upper bound

// CR-04 Frost Risk: any hourly temp ≤34°F (frost) or ≤28°F (hard frost).
// Always HIGH confidence — never hedge a frost warning.
export const FROST_TEMP_F = 34; // °F, ≤ (frost)
export const HARD_FROST_TEMP_F = 28; // °F, ≤ (hard frost)

/* ============================================================
   §8 THRESHOLDS — Crew (CW-01..03)
   ============================================================ */

// CW-01 Workable Days: counts days with no >1h sustained rain AND max temp <100°F.
export const WORKABLE_SUSTAINED_RAIN_HOURS = 1; // hours, > disqualifies the day
export const WORKABLE_MAX_TEMP_F = 100; // °F, < (day counts as workable)

// CW-02 Start Times (always-on card). Benign copy references highs below 90°F;
// escalates to early-start when any hour ≥95°F on a workable day.
export const EARLY_START_TEMP_F = 95; // °F, ≥ (any hour, workable day) → early start
export const NORMAL_HOURS_HIGH_BELOW_F = 90; // °F — benign-state copy reference

// CW-03 Heat Risk: apparent temperature ≥103°F at any hour; ≥125°F escalates to
// "Heat Danger — suspend crew work."
export const HEAT_RISK_APPARENT_F = 103; // °F apparent, ≥
export const HEAT_DANGER_APPARENT_F = 125; // °F apparent, ≥

/* ============================================================
   §8 Card count & priority ladder
   ============================================================ */
export const CARD_TARGET_MIN = 4; // show 4–6 cards
export const CARD_TARGET_MAX = 6;
export const CARD_FLOOR = 4; // guaranteed via card-floor rules

// Priority order when more than 6 fire (highest first). Lower number = higher priority.
// (1) Frost, (2) Heat Danger/Risk, (3) Early Start, (4) Workable Days (always),
// (5) Spray or Skip Irrigation (more actionable wins), (6) Irrigate.
export const CARD_PRIORITY = Object.freeze({
  FROST: 1,
  HEAT: 2,
  EARLY_START: 3,
  WORKABLE_DAYS: 4,
  SPRAY_OR_SKIP: 5,
  IRRIGATE: 6,
});

/* ============================================================
   §9 Card field character caps
   ============================================================ */
export const CARD_TITLE_MAX_CHARS = 40;
export const CARD_CALL_MAX_CHARS = 80;
export const CARD_NUMBER_LINE_MAX_CHARS = 100;
export const CARD_CONFIDENCE_MAX_CHARS = 100;

// Card group labels (§9.1).
export const CARD_GROUPS = Object.freeze({ CROPS: 'CROPS', CREW: 'CREW' });

/* ============================================================
   Open-Meteo endpoints (PRD §7 / Memo §1–2) — free, NO API KEY.
   ============================================================ */
export const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
export const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

/* ============================================================
   Imperial units (PRD §7 — all confirmed supported).
   ============================================================ */
export const UNITS = Object.freeze({
  temperature_unit: 'fahrenheit',
  wind_speed_unit: 'mph',
  precipitation_unit: 'inch',
});

/* ============================================================
   §7 field lists — MODERN UNDERSCORE parameter names only.
   Legacy spellings (windspeed_10m, weathercode) are aliases — DO NOT use.
   ============================================================ */

// Hourly variables the rules engine consumes.
export const HOURLY_FIELDS = Object.freeze([
  'temperature_2m', // spray/frost/workable/start (°F)
  'apparent_temperature', // heat risk (°F)
  'precipitation', // spray/workable (inch)
  'precipitation_probability', // CR-01 counter-rule (%)
  'wind_speed_10m', // spray window (mph)
  'weather_code', // condition (WMO code)
]);

// Daily variables: irrigation inputs + forecast strip.
export const DAILY_FIELDS = Object.freeze([
  'et0_fao_evapotranspiration', // irrigation deficit — see ET₀ note below
  'precipitation_sum', // irrigation (inch)
  'temperature_2m_max', // strip high (°F)
  'temperature_2m_min', // strip low (°F)
  'weather_code', // strip icon (WMO code)
]);

// Forecast horizon + timezone (PRD §7 ENG DIRECTIVE — timezone=auto is day-one,
// correctness-critical: every time-of-day rule depends on the location's LOCAL time).
export const FORECAST_DAYS = 7;
export const TIMEZONE = 'auto';

/* ============================================================
   ET₀ unit conversion — PRD §7/§8, and the WAVE-0 SMOKE-TEST FINDING.
   ============================================================ */

/**
 * mm → inch factor. Mandated as a named constant by the PRD/PLAN.
 *
 * ⚠️ SMOKE-TEST FINDING (live Open-Meteo, 2026-06-29, Fresno CA) — ESCALATED:
 * The PRD §7 directive assumes `precipitation_unit=inch` does NOT convert ET₀
 * and tells engineering to apply ÷25.4 manually. The LIVE API contradicts this:
 *   - default (no precipitation_unit): et0 = [7.71, 8.40, 7.50] mm  (units: "mm")
 *   - precipitation_unit=inch:          et0 = [0.303, 0.331, 0.295] inch (units: "inch")
 *   - 7.71 mm ÷ 25.4 = 0.3035 in ✓ — the API converts ET₀ for us.
 *
 * Because our single forecast call MUST pass precipitation_unit=inch (§7) for
 * precipitation/precipitation_sum, ET₀ arrives ALREADY in inches. Applying this
 * factor on top would DOUBLE-CONVERT (0.303 ÷ 25.4 ≈ 0.012 in) and silently
 * suppress every irrigation call — the exact failure the Memo warned about,
 * in the opposite direction.
 *
 * SAFE WAVE-0 CONTRACT (pending PM confirmation, see §12 decision log):
 *   T2 (forecast.js) treats the API's et0_fao_evapotranspiration as INCHES and
 *   passes it through WITHOUT multiplying by this factor. Keep this constant for
 *   the alternative path only — i.e. IF ET₀ is ever fetched in mm (a separate
 *   no-unit call). Never apply both precipitation_unit=inch AND this factor.
 */
export const ET0_MM_TO_IN = 1 / 25.4;

/**
 * Build the Open-Meteo forecast request query parameters for a coordinate.
 * Centralized so T2 and the WAVE-0 CORS smoke test use identical params.
 * @param {number} lat
 * @param {number} lon
 * @returns {URLSearchParams}
 */
export function buildForecastParams(lat, lon) {
  return new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: HOURLY_FIELDS.join(','),
    daily: DAILY_FIELDS.join(','),
    temperature_unit: UNITS.temperature_unit,
    wind_speed_unit: UNITS.wind_speed_unit,
    precipitation_unit: UNITS.precipitation_unit,
    timezone: TIMEZONE,
    forecast_days: String(FORECAST_DAYS),
  });
}

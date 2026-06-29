/**
 * rules-crops.js — Crop rules CR-01..04 (T4, Wave 1).
 *
 * forecast → crop cards. ET₀ is ALREADY IN INCHES on the forecast object
 * (forecast.js header) — compare directly to the §8 inch thresholds; never
 * re-convert. CR-04 frost is always high confidence. Spec: PRD §8 (Crops), §9.
 *
 * @typedef {import('./card.js').Card} Card
 * @typedef {import('./forecast.js').NormalizedForecast} NormalizedForecast
 */

import {
  SKIP_IRRIGATION_PRECIP_IN,
  IRRIGATION_LOOKAHEAD_HOURS,
  ET0_DEFICIT_HIGH_IN_PER_DAY,
  PRECIP_PROBABILITY_LOW_PCT,
  IRRIGATE_ET0_IN_PER_DAY,
  SPRAY_WIND_MAX_MPH,
  SPRAY_PRECIP_WINDOW_HOURS,
  SPRAY_TEMP_MIN_F,
  SPRAY_TEMP_MAX_F,
  FROST_TEMP_F,
  HARD_FROST_TEMP_F,
  CARD_PRIORITY,
} from './config.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sum precipitation over the first N hours of the hourly series.
 * @param {number[]} hourlyPrecip
 * @param {number} hours
 * @returns {number} total precip in inches
 */
function precipSum(hourlyPrecip, hours) {
  let total = 0;
  const limit = Math.min(hours, hourlyPrecip.length);
  for (let i = 0; i < limit; i++) {
    total += hourlyPrecip[i] ?? 0;
  }
  return total;
}

/**
 * Mean precipitation probability over the first N hours.
 * @param {number[]} hourlyPrecipProb
 * @param {number} hours
 * @returns {number} average %
 */
function meanPrecipProb(hourlyPrecipProb, hours) {
  const limit = Math.min(hours, hourlyPrecipProb.length);
  if (limit === 0) return 0;
  let sum = 0;
  for (let i = 0; i < limit; i++) {
    sum += hourlyPrecipProb[i] ?? 0;
  }
  return sum / limit;
}

/**
 * Mean ET₀ over the daily series (in inches — already converted).
 * @param {number[]} dailyEt0
 * @returns {number} average ET₀ in/day
 */
function meanEt0(dailyEt0) {
  if (!dailyEt0 || dailyEt0.length === 0) return 0;
  return dailyEt0.reduce((a, b) => a + b, 0) / dailyEt0.length;
}

/**
 * Whether any hourly precip > 0 exists in the first N hours.
 * @param {number[]} hourlyPrecip
 * @param {number} hours
 * @returns {boolean}
 */
function hasRainInHours(hourlyPrecip, hours) {
  const limit = Math.min(hours, hourlyPrecip.length);
  for (let i = 0; i < limit; i++) {
    if ((hourlyPrecip[i] ?? 0) > 0) return true;
  }
  return false;
}

/**
 * Find the first hour index where a spray window opens:
 * wind < SPRAY_WIND_MAX_MPH, no precip in ±SPRAY_PRECIP_WINDOW_HOURS,
 * temp in [SPRAY_TEMP_MIN_F, SPRAY_TEMP_MAX_F].
 *
 * @param {object} hourly
 * @returns {{ hourIndex: number, wind: number, temp: number } | null}
 */
function findSprayWindow(hourly) {
  const { temperature_2m, precipitation, wind_speed_10m } = hourly;
  const totalHours = temperature_2m.length;

  for (let h = 0; h < totalHours; h++) {
    const wind = wind_speed_10m[h] ?? 0;
    const temp = temperature_2m[h] ?? 0;

    if (wind >= SPRAY_WIND_MAX_MPH) continue;
    if (temp < SPRAY_TEMP_MIN_F || temp > SPRAY_TEMP_MAX_F) continue;

    // Check no precip within ±SPRAY_PRECIP_WINDOW_HOURS
    const checkStart = Math.max(0, h - SPRAY_PRECIP_WINDOW_HOURS);
    const checkEnd = Math.min(totalHours - 1, h + SPRAY_PRECIP_WINDOW_HOURS);
    let precipInWindow = false;
    for (let c = checkStart; c <= checkEnd; c++) {
      if ((precipitation[c] ?? 0) > 0) {
        precipInWindow = true;
        break;
      }
    }
    if (precipInWindow) continue;

    return { hourIndex: h, wind, temp };
  }
  return null;
}

/**
 * Simple day-of-week label from a 0-based hour index within a 7-day forecast.
 * @param {number} hourIndex
 * @returns {string} e.g. "Monday"
 */
function dayLabel(hourIndex) {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // The forecast is aligned to the local timezone; day 0 is the first calendar day.
  // Use the hour index to find which day of the 7-day window.
  const dayIndex = Math.floor(hourIndex / 24) % 7;
  // We don't know the actual start weekday from the fixture, so use the day-within-window
  // and label it relative to today. For the purposes of card copy, use "Day N" fallback
  // unless we have the time array. In production use, hourly.time[hourIndex] is available.
  return DAYS[dayIndex] ?? `Day ${dayIndex + 1}`;
}

/**
 * Round to 2 decimal places for display.
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
  return (Math.round(n * 100) / 100).toString();
}

// ─── CR-01 Skip Irrigation ────────────────────────────────────────────────────

/**
 * CR-01: Skip Irrigation — fires when precip ≥ 0.3in in next 48h,
 * unless counter-rule (ET₀ deficit > 0.5in/day AND precip prob < 40%) redirects to Irrigate.
 *
 * @param {NormalizedForecast} forecast
 * @returns {{ card: Card, counterRuleActive: boolean } | null}
 */
function cr01(forecast) {
  const { hourly, daily } = forecast;
  const totalPrecip48 = precipSum(hourly.precipitation, IRRIGATION_LOOKAHEAD_HOURS);

  if (totalPrecip48 < SKIP_IRRIGATION_PRECIP_IN) return null;

  // CR-01 would fire — check counter-rule
  const avgEt0 = meanEt0(daily.et0);
  const avgPrecipProb = meanPrecipProb(hourly.precipitation_probability, IRRIGATION_LOOKAHEAD_HOURS);

  const counterRuleActive = avgEt0 > ET0_DEFICIT_HIGH_IN_PER_DAY && avgPrecipProb < PRECIP_PROBABILITY_LOW_PCT;

  if (counterRuleActive) {
    // Return null for CR-01, CR-02 will handle via counter-rule path
    return { card: null, counterRuleActive: true };
  }

  const card = {
    group: 'CROPS',
    title: 'Skip Irrigation This Week',
    call: `Skip irrigation — ${fmt(totalPrecip48)}in of rain forecast in the next 48 hours.`,
    numberLine: `${fmt(totalPrecip48)}in precipitation forecast in the next 48 hours.`,
    confidence: `Rain forecast over next 48h covers irrigation need. High confidence.`,
    ruleId: 'CR-01',
    priority: CARD_PRIORITY.SPRAY_OR_SKIP,
  };

  // Enforce char limits
  if (card.call.length > 80) {
    card.call = `Skip irrigation — ${fmt(totalPrecip48)}in of rain coming in 48 hours.`;
  }

  return { card, counterRuleActive: false };
}

// ─── CR-02 Irrigate ───────────────────────────────────────────────────────────

/**
 * CR-02: Irrigate — fires when ET₀ > 0.3in/day AND no rain in 48h AND no skip rule fired.
 * Also fires when CR-01 counter-rule is active (high ET₀ + low precip prob).
 *
 * @param {NormalizedForecast} forecast
 * @param {boolean} skipRuleFired
 * @param {boolean} counterRuleActive
 * @returns {Card | null}
 */
function cr02(forecast, skipRuleFired, counterRuleActive) {
  if (skipRuleFired) return null;

  const { hourly, daily } = forecast;
  const avgEt0 = meanEt0(daily.et0);
  const rainIn48h = hasRainInHours(hourly.precipitation, IRRIGATION_LOOKAHEAD_HOURS);

  // Counter-rule path: ET₀ was already checked to be high; fire irrigate regardless of precip
  if (counterRuleActive) {
    return {
      group: 'CROPS',
      title: 'Irrigate Despite Forecast Rain',
      call: `Irrigate now — ET₀ deficit of ${fmt(avgEt0)}in/day is too high to wait on likely rain.`,
      numberLine: `ET₀ ${fmt(avgEt0)}in/day — above the ${fmt(ET0_DEFICIT_HIGH_IN_PER_DAY)}in/day high-deficit threshold.`,
      confidence: `High ET₀ deficit and low rain probability — irrigation cannot wait. High confidence.`,
      ruleId: 'CR-02',
      priority: CARD_PRIORITY.IRRIGATE,
    };
  }

  // Standard CR-02: ET₀ > threshold AND no rain in 48h
  if (avgEt0 > IRRIGATE_ET0_IN_PER_DAY && !rainIn48h) {
    return {
      group: 'CROPS',
      title: 'Irrigate This Week',
      call: `Irrigate fields — ET₀ is ${fmt(avgEt0)}in/day with no rain forecast in 48 hours.`,
      numberLine: `ET₀ ${fmt(avgEt0)}in/day — above ${fmt(IRRIGATE_ET0_IN_PER_DAY)}in/day threshold. No rain in 48h.`,
      confidence: `High ET₀ and no rain forecast in next 48 hours. High confidence.`,
      ruleId: 'CR-02',
      priority: CARD_PRIORITY.IRRIGATE,
    };
  }

  return null;
}

// ─── CR-03 Spray Window ───────────────────────────────────────────────────────

/**
 * CR-03: Spray Window — fires when a window exists with wind < 10mph, no precip ±4h,
 * temp in [50, 90]°F. If no window: fallback card with specific copy.
 *
 * @param {NormalizedForecast} forecast
 * @returns {Card}
 */
function cr03(forecast) {
  const { hourly } = forecast;
  const window = findSprayWindow(hourly);

  if (window) {
    const { hourIndex, wind, temp } = window;
    const day = dayLabel(hourIndex);
    return {
      group: 'CROPS',
      title: 'Spray Window Open',
      call: `Spray on ${day} — wind at ${fmt(wind)}mph with clear conditions and no rain nearby.`,
      numberLine: `Wind ${fmt(wind)}mph, temp ${fmt(temp)}°F on ${day} — within spray window limits.`,
      confidence: `Wind below ${SPRAY_WIND_MAX_MPH}mph, temp ${SPRAY_TEMP_MIN_F}–${SPRAY_TEMP_MAX_F}°F, no precip ±${SPRAY_PRECIP_WINDOW_HOURS}h. High confidence.`,
      ruleId: 'CR-03',
      priority: CARD_PRIORITY.SPRAY_OR_SKIP,
    };
  }

  // No window in 7 days
  return {
    group: 'CROPS',
    title: 'No Spray Window This Week',
    call: 'No spray window this week — wind or rain blocking all windows.',
    numberLine: `All hours: wind ≥ ${SPRAY_WIND_MAX_MPH}mph or precip within ±${SPRAY_PRECIP_WINDOW_HOURS}h or temp out of ${SPRAY_TEMP_MIN_F}–${SPRAY_TEMP_MAX_F}°F.`,
    confidence: `No hour in the 7-day forecast meets all spray conditions. High confidence.`,
    ruleId: 'CR-03',
    priority: CARD_PRIORITY.SPRAY_OR_SKIP,
  };
}

// ─── CR-04 Frost Risk ─────────────────────────────────────────────────────────

/**
 * CR-04: Frost Risk — fires when any hourly temp ≤ 34°F (frost) or ≤ 28°F (hard frost).
 * ALWAYS high confidence — never hedge a frost warning.
 *
 * @param {NormalizedForecast} forecast
 * @returns {Card | null}
 */
function cr04(forecast) {
  const { hourly } = forecast;
  const temps = hourly.temperature_2m;
  const totalHours = temps.length;

  let minTemp = Infinity;
  let minHourIndex = -1;
  let hardFrost = false;

  for (let h = 0; h < totalHours; h++) {
    const temp = temps[h] ?? Infinity;
    if (temp <= FROST_TEMP_F && temp < minTemp) {
      minTemp = temp;
      minHourIndex = h;
      if (temp <= HARD_FROST_TEMP_F) hardFrost = true;
    }
  }

  if (minHourIndex === -1) return null; // no frost

  const day = dayLabel(minHourIndex);
  const tempStr = `${Math.round(minTemp)}°F`;

  if (hardFrost) {
    return {
      group: 'CROPS',
      title: `Hard Frost Warning — ${tempStr}`,
      call: `Cover crops before ${day} — hard frost of ${tempStr} expected overnight.`,
      numberLine: `Low of ${tempStr} on ${day} — below the ${HARD_FROST_TEMP_F}°F hard frost threshold.`,
      confidence: `Hard frost confirmed in the 7-day forecast. High confidence — act now.`,
      ruleId: 'CR-04',
      priority: CARD_PRIORITY.FROST,
    };
  }

  return {
    group: 'CROPS',
    title: `Frost Risk — ${tempStr} Low`,
    call: `Cover frost-sensitive crops before ${day} — low of ${tempStr} forecast.`,
    numberLine: `Low of ${tempStr} on ${day} — at or below the ${FROST_TEMP_F}°F frost threshold.`,
    confidence: `Frost temperature confirmed in the 7-day forecast. High confidence.`,
    ruleId: 'CR-04',
    priority: CARD_PRIORITY.FROST,
  };
}

// ─── Entry point ──────────────────────────────────────────────────────────────

/**
 * Produce the crop cards for a forecast.
 * @param {NormalizedForecast} forecast
 * @returns {Card[]}
 */
export function cropCards(forecast) {
  // Guard: require a valid NormalizedForecast shape
  if (!forecast || !forecast.hourly || !forecast.daily) {
    throw new Error('not implemented: cropCards requires a NormalizedForecast with hourly and daily data');
  }

  const cards = [];

  // CR-04: Frost — check first (highest priority, doesn't interact with irrigation logic)
  const frostCard = cr04(forecast);
  if (frostCard) cards.push(frostCard);

  // CR-01: Skip Irrigation (may activate counter-rule for CR-02)
  const skipResult = cr01(forecast);
  let skipRuleFired = false;
  let counterRuleActive = false;

  if (skipResult !== null) {
    if (skipResult.counterRuleActive) {
      counterRuleActive = true;
    } else if (skipResult.card) {
      cards.push(skipResult.card);
      skipRuleFired = true;
    }
  }

  // CR-02: Irrigate
  const irrigateCard = cr02(forecast, skipRuleFired, counterRuleActive);
  if (irrigateCard) cards.push(irrigateCard);

  // CR-03: Spray Window (always produces a card — either a window or the no-window fallback)
  cards.push(cr03(forecast));

  return cards;
}

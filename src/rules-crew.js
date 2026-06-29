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

import {
  WORKABLE_SUSTAINED_RAIN_HOURS,
  WORKABLE_MAX_TEMP_F,
  EARLY_START_TEMP_F,
  NORMAL_HOURS_HIGH_BELOW_F,
  HEAT_RISK_APPARENT_F,
  HEAT_DANGER_APPARENT_F,
  CARD_PRIORITY,
  CARD_GROUPS,
} from './config.js';

/**
 * Count how many consecutive hours have non-zero precipitation starting at index i.
 * Returns the count of the run (may be 0).
 * @param {number[]} precipitation
 * @param {number} startIdx
 * @returns {number}
 */
function rainRunLength(precipitation, startIdx) {
  let run = 0;
  for (let i = startIdx; i < precipitation.length; i++) {
    if (precipitation[i] > 0) run++;
    else break;
  }
  return run;
}

/**
 * Return indices (0..6) of workable days.
 * A day is workable when:
 *   - No hour in that day has a sustained rain run > WORKABLE_SUSTAINED_RAIN_HOURS (1h), AND
 *   - daily max temp < WORKABLE_MAX_TEMP_F (100°F).
 *
 * "Sustained rain" means consecutive rainy hours > 1 (i.e. a run of ≥2).
 *
 * @param {NormalizedForecast} forecast
 * @returns {number[]} workable day indices (0-based)
 */
function workableDayIndices(forecast) {
  const { daily, hourly } = forecast;
  const workable = [];

  for (let d = 0; d < daily.time.length; d++) {
    // Check max temp
    if (daily.temperature_2m_max[d] >= WORKABLE_MAX_TEMP_F) continue;

    // Check sustained rain: scan the 24 hours belonging to this day
    const startH = d * 24;
    const endH = startH + 24;
    let hasSustainedRain = false;

    for (let h = startH; h < endH; h++) {
      if (hourly.precipitation[h] > 0) {
        const run = rainRunLength(hourly.precipitation, h);
        if (run > WORKABLE_SUSTAINED_RAIN_HOURS) {
          hasSustainedRain = true;
          break;
        }
        // Skip ahead past this run to avoid re-counting
        h += run - 1;
      }
    }

    if (!hasSustainedRain) workable.push(d);
  }

  return workable;
}

/**
 * Produce the crew cards for a forecast.
 * @param {NormalizedForecast} forecast
 * @returns {Card[]}
 */
export function crewCards(forecast) {
  const { hourly, daily } = forecast;
  const cards = [];

  // ── Shared analysis ──────────────────────────────────────────────────────

  const workableDays = workableDayIndices(forecast);
  const workableCount = workableDays.length;
  const workableSet = new Set(workableDays);

  // Peak apparent temperature across all hours
  const peakApparent = Math.max(...hourly.apparent_temperature);

  // Find day index with peak apparent temp
  const peakApparentHourIdx = hourly.apparent_temperature.indexOf(peakApparent);
  const peakApparentDay = Math.floor(peakApparentHourIdx / 24);

  // Check for early-start condition: any hour ≥ EARLY_START_TEMP_F on a workable day
  let earlyStartTriggerTemp = null;
  let earlyStartDayIdx = null;
  for (let h = 0; h < hourly.temperature_2m.length; h++) {
    const t = hourly.temperature_2m[h];
    if (t >= EARLY_START_TEMP_F) {
      const dayIdx = Math.floor(h / 24);
      if (workableSet.has(dayIdx)) {
        if (earlyStartTriggerTemp === null || t > earlyStartTriggerTemp) {
          earlyStartTriggerTemp = t;
          earlyStartDayIdx = dayIdx;
        }
      }
    }
  }

  const heatDanger = peakApparent >= HEAT_DANGER_APPARENT_F;
  const heatRisk = peakApparent >= HEAT_RISK_APPARENT_F;

  // ── CW-01 Workable Days (always fires) ───────────────────────────────────

  const cw01 = {
    group: CARD_GROUPS.CREW,
    ruleId: 'CW-01',
    priority: CARD_PRIORITY.WORKABLE_DAYS,
    title: `Workable Days This Week`,
    call: workableCount === 7
      ? `Start work on all 7 days — no weather blockers this week.`
      : workableCount === 0
        ? `Watch for work stoppages — no workable days this week.`
        : `Start field work on ${workableCount} of 7 days this week.`,
    numberLine: `${workableCount} of 7 days workable — max temp below ${WORKABLE_MAX_TEMP_F}°F, no sustained rain`,
    confidence: `Based on hourly rain runs and daily max temp for all 7 days.`,
  };
  cards.push(cw01);

  // ── CW-03 Heat Risk (fires when apparent_temperature ≥ HEAT_RISK_APPARENT_F) ──

  if (heatRisk) {
    const dayLabel = `Day ${peakApparentDay + 1}`;

    if (heatDanger) {
      cards.push({
        group: CARD_GROUPS.CREW,
        ruleId: 'CW-03',
        priority: CARD_PRIORITY.HEAT,
        title: `Heat Danger — Suspend Crew Work`,
        call: `Suspend crew work — heat danger conditions forecast this week.`,
        numberLine: `Feels like ${peakApparent}°F on ${dayLabel} — above heat danger threshold`,
        confidence: `Apparent temperature hits ${peakApparent}°F, well above the ${HEAT_DANGER_APPARENT_F}°F danger level.`,
      });
    } else {
      cards.push({
        group: CARD_GROUPS.CREW,
        ruleId: 'CW-03',
        priority: CARD_PRIORITY.HEAT,
        title: `Heat Risk This Week`,
        call: `Watch crew closely — heat risk conditions on ${dayLabel}.`,
        numberLine: `Feels like ${peakApparent}°F on ${dayLabel} — above heat risk threshold`,
        confidence: `Apparent temperature hits ${peakApparent}°F, at or above the ${HEAT_RISK_APPARENT_F}°F heat risk level.`,
      });
    }
  }

  // ── CW-02 Start Times (always fires; CW-03 supersedes benign state) ──────

  const heatFired = heatRisk; // CW-03 presence

  if (heatFired) {
    // Supersede benign copy: CW-02 should reflect the heat escalation
    const dayLabel = `Day ${(earlyStartDayIdx !== null ? earlyStartDayIdx : peakApparentDay) + 1}`;
    const triggerTemp = earlyStartTriggerTemp ?? Math.round(peakApparent);
    cards.push({
      group: CARD_GROUPS.CREW,
      ruleId: 'CW-02',
      priority: CARD_PRIORITY.EARLY_START,
      title: `Start Crew Early This Week`,
      call: `Start crew by 6am — heat-safety risk after 10am on ${dayLabel}.`,
      numberLine: `${triggerTemp}°F forecast — OSHA heat advisory threshold exceeded`,
      confidence: `High temps forecast; earlier start protects crew from heat exposure.`,
    });
  } else if (earlyStartTriggerTemp !== null) {
    // Early-start escalation without CW-03
    const dayLabel = `Day ${earlyStartDayIdx + 1}`;
    cards.push({
      group: CARD_GROUPS.CREW,
      ruleId: 'CW-02',
      priority: CARD_PRIORITY.EARLY_START,
      title: `Start Crew Early This Week`,
      call: `Start crew by 6am — heat-safety risk after 10am on ${dayLabel}.`,
      numberLine: `${earlyStartTriggerTemp}°F forecast — OSHA heat advisory threshold exceeded`,
      confidence: `High temps forecast; earlier start protects crew from heat exposure.`,
    });
  } else {
    // Benign state
    cards.push({
      group: CARD_GROUPS.CREW,
      ruleId: 'CW-02',
      priority: CARD_PRIORITY.WORKABLE_DAYS,
      title: `Normal Hours OK This Week`,
      call: `Normal hours OK — no heat risk this week. Highs stay below ${NORMAL_HOURS_HIGH_BELOW_F}°F.`,
      numberLine: `Max temp ${Math.max(...daily.temperature_2m_max)}°F this week — below ${NORMAL_HOURS_HIGH_BELOW_F}°F threshold`,
      confidence: `No hours reach ${EARLY_START_TEMP_F}°F on any workable day.`,
    });
  }

  return cards;
}

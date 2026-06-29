/*
 * This Week on the Farm — rules engine
 * Pure function: Open-Meteo forecast in -> recommendation cards out.
 * Deliberately simple computes (v1). Runs in the browser and in Node (for tests).
 *
 * Thresholds are sourced in PRD-this-week-on-the-farm.md.
 */
(function (root) {
  "use strict";

  // ---- thresholds (imperial; tweak here) ----
  var T = {
    RAIN_SKIP_IRRIGATION_48H: 0.3, // in
    RAIN_DRY_48H: 0.1, // in
    ET0_3DAY_HIGH: 0.75, // in over 3 days
    SPRAY_WIND_MIN: 3, // mph
    SPRAY_WIND_MAX: 10, // mph
    SPRAY_TEMP_MIN: 50, // F
    SPRAY_TEMP_MAX: 85, // F
    FROST_ADVISORY: 36, // F (daily low at/below)
    FROST_FREEZE: 32, // F
    HEAT_ELEVATED: 90, // F feels-like
    HEAT_HIGH: 95, // F feels-like
    WORK_RAIN_STOP: 0.25, // in/day -> not workable
    WORK_RAIN_MARGINAL: 0.1, // in/day -> marginal
    DAY_START_HOUR: 7,
    DAY_END_HOUR: 19
  };

  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function dayLabel(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return DAYS[d.getDay()];
  }

  // confidence purely from lead time (simple v1)
  function conf(dayIndex) {
    if (dayIndex <= 1) return "High";
    if (dayIndex <= 4) return "Medium";
    return "Low";
  }

  function round(n, p) {
    var f = Math.pow(10, p || 1);
    return Math.round(n * f) / f;
  }

  // group hourly indices by day (uses local "auto" timezone strings YYYY-MM-DDTHH:00)
  function hourlyByDay(hourly, days) {
    var map = {};
    (hourly.time || []).forEach(function (t, i) {
      var dayStr = t.slice(0, 10);
      (map[dayStr] = map[dayStr] || []).push(i);
    });
    return map;
  }

  function evaluate(fc) {
    var hourly = fc.hourly || {};
    var daily = fc.daily || {};
    var cards = [];

    var dailyDates = daily.time || [];
    var hMap = hourlyByDay(hourly, dailyDates);

    // ---------- next-48h hourly rain + ET0 sums ----------
    var rain48 = 0;
    for (var i = 0; i < 48 && i < (hourly.precipitation || []).length; i++) {
      rain48 += hourly.precipitation[i] || 0;
    }
    var et03 = 0;
    for (var d = 0; d < 3 && d < (daily.et0_fao_evapotranspiration || []).length; d++) {
      et03 += daily.et0_fao_evapotranspiration[d] || 0;
    }

    // ---------- R1/R2 Irrigation ----------
    if (rain48 >= T.RAIN_SKIP_IRRIGATION_48H) {
      cards.push({
        group: "Crops", key: "irrigation", severity: "ok",
        call: "Skip irrigation — rain is coming",
        number: round(rain48, 2) + " in expected in next 48h",
        why: "Over " + T.RAIN_SKIP_IRRIGATION_48H + " in of rain in 48h recharges the root zone — irrigating now wastes water.",
        confidence: conf(0)
      });
    } else if (et03 >= T.ET0_3DAY_HIGH && rain48 < T.RAIN_DRY_48H) {
      cards.push({
        group: "Crops", key: "irrigation", severity: "warn",
        call: "Plan to irrigate this week",
        number: round(et03, 2) + " in crop water use (ET₀) over 3 days, " + round(rain48, 2) + " in rain",
        why: "Crop water use is outpacing rainfall, drawing soil moisture down toward the irrigation trigger.",
        confidence: conf(1)
      });
    } else {
      cards.push({
        group: "Crops", key: "irrigation", severity: "ok",
        call: "No irrigation needed yet",
        number: round(rain48, 2) + " in rain / " + round(et03, 2) + " in ET₀ (3-day)",
        why: "Rainfall and crop water use are roughly in balance this window.",
        confidence: conf(1)
      });
    }

    // ---------- R3 Spray window ----------
    var spray = null;
    var times = hourly.time || [];
    for (var h = 0; h < times.length && h < 24 * 7; h++) {
      var hr = parseInt(times[h].slice(11, 13), 10);
      if (hr < T.DAY_START_HOUR || hr > T.DAY_END_HOUR) continue;
      var wind = (hourly.wind_speed_10m || [])[h];
      var temp = (hourly.temperature_2m || [])[h];
      var p0 = (hourly.precipitation || [])[h] || 0;
      var p1 = (hourly.precipitation || [])[h + 1] || 0;
      var p2 = (hourly.precipitation || [])[h + 2] || 0;
      if (wind == null || temp == null) continue;
      if (
        wind >= T.SPRAY_WIND_MIN && wind <= T.SPRAY_WIND_MAX &&
        temp >= T.SPRAY_TEMP_MIN && temp <= T.SPRAY_TEMP_MAX &&
        p0 === 0 && p1 === 0 && p2 === 0
      ) {
        var dayIdx = dailyDates.indexOf(times[h].slice(0, 10));
        spray = {
          group: "Crops", key: "spray", severity: "ok",
          call: "Best spray window: " + dayLabel(times[h]) + " " + (hr < 12 ? hr + "am" : (hr === 12 ? "12pm" : (hr - 12) + "pm")),
          number: Math.round(wind) + " mph wind, " + Math.round(temp) + "°F",
          why: "Wind 3–10 mph and mild temps keep drift and evaporation low.",
          confidence: conf(dayIdx < 0 ? 1 : dayIdx)
        };
        break;
      }
    }
    if (!spray) {
      spray = {
        group: "Crops", key: "spray", severity: "warn",
        call: "No good spray window this week",
        number: "winds/temps out of the 3–10 mph, 50–85°F range",
        why: "No dry hour met safe spray conditions — hold off to avoid drift.",
        confidence: "Medium"
      };
    }
    cards.push(spray);

    // ---------- R4 Frost / freeze ----------
    var frostDay = -1, frostLow = null;
    (daily.temperature_2m_min || []).forEach(function (lo, idx) {
      if (lo != null && lo <= T.FROST_ADVISORY && (frostLow == null || lo < frostLow)) {
        frostLow = lo; frostDay = idx;
      }
    });
    if (frostDay >= 0) {
      var freeze = frostLow <= T.FROST_FREEZE;
      cards.push({
        group: "Crops", key: "frost", severity: "alert",
        call: (freeze ? "Hard freeze " : "Frost risk ") + dayLabel(dailyDates[frostDay]) +
          (freeze ? " — protect or harvest now" : " — protect sensitive crops"),
        number: "Low of " + Math.round(frostLow) + "°F",
        why: "Radiational cooling can run several degrees below forecast; " +
          (freeze ? "a freeze damages most tender crops." : "36°F is a conservative frost line."),
        confidence: conf(frostDay)
      });
    } else {
      cards.push({
        group: "Crops", key: "frost", severity: "ok",
        call: "No frost risk this week",
        number: "Lowest forecast: " + Math.round(Math.min.apply(null, (daily.temperature_2m_min || [40]))) + "°F",
        why: "All forecast lows stay above the 36°F advisory line.",
        confidence: "Medium"
      });
    }

    // ---------- R5/R7 Heat + start time (Crew) ----------
    var heatDay = -1, heatPeak = null;
    (daily.apparent_temperature_max || []).forEach(function (mx, idx) {
      if (mx != null && mx >= T.HEAT_ELEVATED && (heatPeak == null || mx > heatPeak)) {
        heatPeak = mx; heatDay = idx;
      }
    });
    if (heatDay >= 0) {
      var high = heatPeak >= T.HEAT_HIGH;
      cards.push({
        group: "Crew", key: "heat", severity: "alert",
        call: (high ? "High heat " : "Heat risk ") + dayLabel(dailyDates[heatDay]) +
          (high ? " — start crew by 6am, break every 2h" : " — water + rest breaks"),
        number: "Feels like " + Math.round(heatPeak) + "°F",
        why: "At ~90°F+ feels-like, heat illness risk climbs; " +
          (high ? "shift work to the cool morning and out of the afternoon peak." : "schedule water and rest."),
        confidence: conf(heatDay)
      });
    } else {
      cards.push({
        group: "Crew", key: "heat", severity: "ok",
        call: "No heat-stress days this week",
        number: "Peak feels-like: " + Math.round(Math.max.apply(null, (daily.apparent_temperature_max || [70]))) + "°F",
        why: "Feels-like stays below the 90°F action level all week.",
        confidence: "Medium"
      });
    }

    // ---------- R6 Workable days (Crew) ----------
    var workable = [], rainy = [];
    (daily.precipitation_sum || []).forEach(function (p, idx) {
      var lbl = dayLabel(dailyDates[idx]);
      if (p != null && p >= T.WORK_RAIN_STOP) rainy.push(lbl);
      else workable.push(lbl);
    });
    cards.push({
      group: "Crew", key: "workdays", severity: rainy.length >= 3 ? "warn" : "ok",
      call: "Workable days: " + (workable.length ? workable.join(", ") : "none"),
      number: rainy.length ? "Rain likely: " + rainy.join(", ") : "no rain-outs forecast",
      why: "Days with 0.25 in+ of rain stop most field work and make ground unsafe.",
      confidence: "Medium"
    });

    return cards;
  }

  var api = { evaluate: evaluate, thresholds: T };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FarmRules = api;
})(typeof window !== "undefined" ? window : this);

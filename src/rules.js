// rules.js — turns raw forecast variables into farm decisions.
//
// Each rule reads a slice of the Open-Meteo forecast and returns a recommendation
// card { group, level, title, detail, why } or null if it doesn't fire.
// Thresholds are generalized agronomic defaults (CONUS, imperial units) — see PRD.
//
// TODO (build phase): implement irrigation, spray-window, harvest/frost (Crops)
// and workable-days, start/stop, heat-risk (Crew) rules against the forecast shape.

export const GROUPS = { CROPS: "Crops", CREW: "Crew" };

export function evaluate(/* forecast */) {
  // Placeholder: real rules engine lands in the build phase.
  return [];
}

# This Week on the Farm 🌦️🚜

A weather-to-decision web app for farm operators and crew leads. Type a location, get a short
stack of plain-English calls — each backed by a real weather number and a one-line "why" — in
about ten seconds.

Raw weather apps show precipitation, wind, and temperature but stop at the data. This app
collapses the forecast-to-decision gap and tells you what to *do*: irrigate or wait, spray or
hold, harvest before the frost, send the crew at 6am or noon.

## What it does

Recommendations split into two groups from a single 7-day forecast:

- **Crops** — irrigation timing, spray windows (dry + low wind), harvest/frost warnings.
- **Crew** — workable field days, recommended start/stop times on hot days, heat-risk flags.

## How it works

- **Data:** [Open-Meteo](https://open-meteo.com/) forecast API — free, no API key, hourly +
  7-day, including precipitation, wind, temperature, ET₀ (evapotranspiration), and frost.
- **Logic:** a small client-side rules engine turns raw forecast variables into decisions using
  generalized agronomic thresholds.
- **Stack:** static front end (no build step, no backend) — trivially runnable and deployable.

## Proposed stack

- **Data:** [Open-Meteo](https://open-meteo.com/) forecast API — free, no API key, hourly +
  7-day, including precipitation, wind, temperature, ET₀ (evapotranspiration), and frost.
- **Front end:** static single-page app, client-side API calls, no build step, no backend.
- **Map:** Leaflet + OpenStreetMap tiles for the location dashboard.
- **Deploy:** Vercel static, public URL.

## Scope (v1)

Continental US only. No accounts, no saved farms, no crop-specific calibration. Recommendations
are agronomic guidance, not a substitute for the pesticide label or local regulations. See
[`PRD-this-week-on-the-farm.md`](./PRD-this-week-on-the-farm.md) for full requirements.

## Project status

📋 Spec stage — requirements are defined and ready for development handoff. See
[`PRD-this-week-on-the-farm.md`](./PRD-this-week-on-the-farm.md) for the full PRD,
rules table, acceptance criteria, and milestones.

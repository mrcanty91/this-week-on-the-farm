# PRD — "This Week on the Farm"

**A weather-to-decision web app for farm operators and crew leads**

| | |
|---|---|
| **Status** | Approved for development — handoff-ready |
| **Version** | v2 (development handoff) |
| **Author** | Michael |
| **Last updated** | June 29, 2026 |
| **Scope** | Continental United States (CONUS) only |
| **Target** | Single shippable web app, live public URL on Vercel |

---

## Decision log (locked for v1)

These decisions are settled and constrain the build. They resolve the open questions from the
prior draft — engineering should treat them as fixed unless a change is agreed with the author.

1. **Primary view is a location map dashboard.** The chosen location renders on an interactive map as the centerpiece; recommendations sit alongside it. This is a dashboard, not a bare card list.
2. **Alerts are a first-class concept.** High-severity calls (frost/freeze, high heat) are surfaced as flagged alert banners above the recommendations, not buried in the stack.
3. **Keep all computes simple.** No Delta-T calculation, no rolling soil-water "checkbook." Spray uses wind + temperature + a dry window only. Irrigation uses a simple next-48h rain check and a simple 3-day ET₀-vs-rain comparison. Confidence is derived from forecast lead time only.
4. **One generalized threshold set, CONUS imperial units.** No per-crop calibration in v1; a single generalized frost line (36°F advisory / 32°F freeze) and generalized heat/spray/irrigation thresholds apply everywhere.
5. **Both personas share one view.** Crops and Crew calls render together, clearly grouped.
6. **Stateless, no key, static deploy.** No accounts, no backend, no stored secrets; all API calls are client-side to Open-Meteo; deploys to a public Vercel URL.

## Problem statement

Farm operators and crew leads make daily, money-on-the-line calls — irrigate or not, spray or wait, send the crew at 6am or noon, harvest before a frost — and today they make them by reading raw forecasts and translating numbers into action in their heads. Raw weather apps show precipitation, wind, and temperature but stop short of the decision; the operator does the agronomy. That translation is error-prone, time-consuming, and inconsistent across a crew. The cost of getting it wrong is wasted water and labor, drift violations, heat-related incidents, or frost-damaged crops.

This app collapses the forecast-to-decision gap: pick a location on a map, get a short set of plain-English calls, each backed by a real weather number and a one-line "why," in about ten seconds — with the urgent ones flagged as alerts.

## Goals

1. **Decision, not data.** Turn a 7-day forecast into 4–6 concrete recommendations a non-meteorologist can act on without further interpretation.
2. **A location dashboard at a glance.** The operator's chosen location anchors the view on a map, with this week's calls beside it and the urgent ones flagged.
3. **Earn trust through transparency.** Every recommendation shows the weather number that triggered it and a one-line rationale, so the operator can sanity-check the call against their own judgment.
4. **Be trivially shippable.** Live public URL, no login, no API key, no backend to operate — the primary success bar is that anyone can open the link and use it immediately.
5. **Speed.** From "use my location" / typed location to a rendered dashboard in roughly 10 seconds on a normal connection.
6. **Serve both audiences in one view.** Crops calls (irrigation, spray, harvest/frost) and Crew calls (workable days, start/stop times, heat risk) share one dashboard.

## Non-goals

1. **No accounts, saved farms, or history.** v1 is stateless — a location in, a dashboard out. Persistence is a separate initiative; it adds auth, storage, and a backend that work against the "trivially shippable" goal.
2. **No crop- or field-specific calibration.** v1 uses generalized agronomic thresholds, not per-crop critical temperatures or per-field soil/Kc data (P2).
3. **No global coverage.** CONUS only. Geocoding, units (imperial), and threshold defaults are tuned for the continental US.
4. **No advanced agronomy computes.** No Delta-T, no soil-water-balance accumulation, no inversion modeling in v1 — explicitly deferred to keep the build simple (P1+).
5. **No spray-legality or compliance guarantees.** Recommendations are agronomic guidance, not a substitute for the pesticide label, applicator license rules, or local regulations. The app advises; the operator remains responsible.
6. **No push / scheduled notifications.** "Alerts" in v1 means in-app flagged banners on the dashboard, not push or email. Scheduled digests are a fast-follow (P2).

## Personas & user stories

The app serves two operators equally, sharing one dashboard.

**Farm operator / produce or row-crop manager** — owns the Crops calls.

- As an operator, I want to see whether to irrigate this week so that I don't waste water (or money) running lines into a rain event.
- As an operator, I want to know the best dry, low-wind window to spray so that I stay on-label and avoid drift.
- As an operator, I want a flagged alert when a frost or freeze is coming so that I can harvest or protect crops before damage.

**Crew supervisor / labor lead** — owns the Crew calls.

- As a crew lead, I want to know which days this week are workable so that I can plan the schedule.
- As a crew lead, I want recommended start/stop times on hot days so that I keep the crew safe and productive.
- As a crew lead, I want a clear, flagged heat-risk alert so that I can trigger water/rest protocols before anyone gets hurt.

**Shared / cross-cutting**

- As either user, I want to see my location on a map so that I'm confident the forecast is for the right place.
- As either user, I want every call to show the number behind it so that I can trust or override it.
- As either user, I want to hit "use my location" or type a town so that I get to the answer in seconds.
- As either user, I want a graceful message when location or weather lookup fails so that I'm never staring at a blank screen.

## Functional requirements

### Must-have (P0)

**P0-1 — Location entry.** The app accepts a typed location (town, "city, state", or ZIP) and a "use my location" button (browser geolocation).

- *Acceptance:* Given a user types "Fresno, CA" and submits, when geocoding resolves, then the app fetches the forecast for those coordinates and renders the dashboard.
- *Acceptance:* Given a user clicks "use my location" and grants permission, when coordinates return, then the app proceeds without a typed entry.
- *Acceptance:* Given geolocation is denied or unavailable, when the user has not typed a location, then the app shows a clear prompt to type one (no dead end).
- *Acceptance:* Given a typed location resolves to coordinates outside CONUS, then the app shows a "this app currently covers the continental US only" message rather than rendering misleading calls.

**P0-2 — Forecast fetch (Open-Meteo, client-side, no key).** On a resolved location, the app calls the Open-Meteo Forecast API directly from the browser for a 7-day hourly + daily forecast with the variables in the Data Spec below.

- *Acceptance:* Given valid coordinates, when the fetch succeeds, then hourly and daily arrays for all required variables are available to the rules engine.
- *Acceptance:* Given the Open-Meteo request fails or times out, then the app shows a retryable error state, not a blank or broken dashboard.

**P0-3 — Location map dashboard (primary view).** The resolved location renders on an interactive map (marker centered on the coordinates), with the resolved place name and forecast date range shown. The map is the visual anchor of the results view.

- *Acceptance:* Given a resolved location, when the dashboard renders, then a map is centered on the coordinates with a marker at the location.
- *Acceptance:* The map and the recommendations are visible together (side-by-side on wide screens, stacked on mobile with the map on top).
- *Acceptance:* On an invalid/failed location, the map does not render a misleading marker.

**P0-4 — Rules engine produces 4–6 recommendations.** A client-side rules engine evaluates the forecast against the thresholds in the Rules Spec and emits 4–6 cards, each assigned to Crops or Crew. v1 emits exactly one card per rule family (irrigation, spray, frost, heat, workable days) — five cards — guaranteeing the 4–6 range and at least one card per group every time.

- *Acceptance:* Given any successful forecast, when the engine runs, then it returns 4–6 cards with at least one Crops and one Crew card.
- *Acceptance:* Given a quiet forecast where no rule fires urgently, then each family still emits its baseline "all-clear" card (e.g. "No frost risk this week") so the dashboard is never near-empty.
- *Acceptance:* Each card carries a plain-English call, the triggering weather number with units, a confidence level, and a one-line "why."

**P0-5 — Alerts (flagged).** Cards at the highest severity level (frost/freeze, high heat) are surfaced as flagged alert banners above the grouped recommendations.

- *Acceptance:* Given a forecast that triggers a frost/freeze or high-heat rule, when the dashboard renders, then that call appears as a visually distinct alert banner at the top of the results, in addition to its place in the grouped stack.
- *Acceptance:* Given no high-severity rule fires, then no alert banner renders (the dashboard shows only grouped cards).

**P0-6 — Grouped recommendation stack.** Below the alerts, cards render grouped under **Crops** and **Crew** headers.

- *Acceptance:* Given the engine output, when rendered, then each card shows call, number, confidence, and why; cards are grouped under Crops and Crew headers.
- *Acceptance:* The view is mobile-first and legible outdoors (high contrast, large type).

**P0-7 — Deploy to public Vercel URL.** Static front end + client-side API calls, deployed to a public Vercel URL with no server-side secrets.

- *Acceptance:* Anyone with the URL can use the app with no login and no configuration.

### Nice-to-have (P1)

- **P1-1 — Per-card detail / expand.** Tapping a card reveals the supporting hourly/daily numbers (e.g. the exact hours over 95°F) behind the call.
- **P1-2 — Delta-T spray refinement.** Add a Delta-T computation (from temp + humidity/dew point) to the spray rule for a more precise window.
- **P1-3 — Adjustable thresholds.** A simple settings panel lets the operator nudge key thresholds (e.g. heat start-time trigger) to match their operation.
- **P1-4 — Unit toggle.** Allow °C / km/h / mm for users who prefer metric, while defaulting to imperial.
- **P1-5 — Shareable link.** Encode the location in the URL so a resolved dashboard can be shared or bookmarked.
- **P1-6 — Loading skeleton.** Show a skeleton dashboard during fetch to reinforce the ~10s speed goal.

### Future considerations (P2)

- **P2-1 — Crop/field profiles.** Let the operator pick a crop (or set a custom critical temperature and Kc) so frost and irrigation calls are crop-specific rather than generalized.
- **P2-2 — Saved locations / multi-field.** Persist multiple fields per operator (requires auth + storage + backend).
- **P2-3 — Push alerts & digests.** Push or email a morning digest, or notify when a frost/heat threshold is newly crossed.
- **P2-4 — Self-improvement / hardening pass (PINNED).** Run an agent self-critique of the rules and UX and stress-test against edge-case locations (frost-prone, 100°F+, rainy week), then fix what breaks. See "Pinned follow-up."

## Data spec — Open-Meteo

**Why Open-Meteo:** free, no API key, no signup for non-commercial use (~10,000 requests/day), and it exposes the exact variables needed including FAO reference evapotranspiration (ET₀) for irrigation. No-key is the unlock for a fast, backend-free live deploy.

**Geocoding** — `https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&country=US`
Resolve the typed location to latitude/longitude; restrict/prefer US results. For "use my location," skip geocoding and use the browser coordinates directly.

**Forecast** — `https://api.open-meteo.com/v1/forecast`

Request parameters:

- `latitude`, `longitude`
- `temperature_unit=fahrenheit`, `wind_speed_unit=mph`, `precipitation_unit=inch`
- `timezone=auto` (so "today/tomorrow" and start-times are local to the farm)
- `forecast_days=7`

**Variables required for v1** (these and only these are needed for the simple rules):

| Need | Open-Meteo hourly variable | Open-Meteo daily variable |
|---|---|---|
| Temperature | `temperature_2m` | `temperature_2m_min`, `temperature_2m_max` |
| Feels-like (heat) | `apparent_temperature` | `apparent_temperature_max` |
| Precipitation | `precipitation` | `precipitation_sum` |
| Wind | `wind_speed_10m` | — |
| Irrigation demand | `et0_fao_evapotranspiration` | `et0_fao_evapotranspiration` (daily sum) |

All variable names above are valid Open-Meteo Forecast API fields, confirmed against the live endpoint. The engine reads hourly arrays for windowed rules (e.g. the spray-window scan) and daily arrays for day-level rules (frost minimums, heat peaks, workable days, daily ET₀-vs-rain).

> Deferred (not requested in v1): `precipitation_probability`, `wind_gusts_10m`, `relative_humidity_2m`, `dew_point_2m`. These are needed only for P1 refinements (Delta-T, probability-weighted workable days) and should not be added to the v1 request.

## Rules spec — the engine

A small, pure, client-side function: forecast in → array of recommendation objects out. Each rule defines a trigger (variable + threshold + time window), an output call, and a confidence + why. Thresholds are drawn from extension and regulatory sources (see Sources), not hand-waved. Per the decision log, computes are intentionally simple.

Each recommendation object:

```
{
  group: "Crops" | "Crew",
  level: "alert" | "warn" | "ok",          // alert = surfaced as a flagged banner
  title: "Skip irrigation — rain is coming",   // plain-English call
  detail: "0.6 in of rain expected in next 48h", // the real number + units
  confidence: "High" | "Medium" | "Low",
  why: "Over 0.3 in of rain in 48h recharges the root zone — irrigating now wastes water."
}
```

The engine evaluates five rule families and always emits exactly one card from each (the triggered call, or that family's baseline "all-clear" card) — five cards total, within the 4–6 range, with both groups guaranteed.

### Crops

**R1 — Irrigation (rain skip vs. ET demand).** *Simple compute.*
- If next-48h `precipitation` sum ≥ **0.3 in** → "Skip irrigation — rain is coming" (`level: ok`). Why: rain over ~0.3 in in 48h recharges the root zone.
- Else if next-3-day daily `et0_fao_evapotranspiration` sum ≥ **0.75 in** AND next-48h rain < **0.1 in** → "Plan to irrigate this week" (`level: warn`). Why: crop water use is outpacing rainfall.
- Else → baseline "No irrigation needed yet" (`level: ok`). Why: rain and crop water use are roughly balanced.
- *(Mutually exclusive — rain check is evaluated first.)*

**R2 — Spray window.** *Simple compute — no Delta-T in v1.*
Scan daytime hours (07:00–19:00 local) over the 7 days for the first hour where ALL hold: `precipitation` = 0 for that hour and the next two hours, `wind_speed_10m` between **3 and 10 mph**, and `temperature_2m` between **50 and 85°F**.
- Match → "Best spray window: [day] [hour]" (`level: ok`), detail = wind mph + temp. Why: wind 3–10 mph and mild temps keep drift and evaporation low.
- No match in 7 days → "No good spray window this week" (`level: warn`). Why: no dry hour met safe spray conditions.

**R3 — Frost / freeze.**
Take the minimum across daily `temperature_2m_min`.
- ≤ **32°F** → "Hard freeze [day] — protect or harvest now" (`level: alert`).
- ≤ **36°F** (but > 32°F) → "Frost risk [day] — protect sensitive crops" (`level: alert`).
- Otherwise → baseline "No frost risk this week" (`level: ok`).
Detail = the forecast low. Why: radiational cooling can run several degrees below forecast; 36°F is a conservative advisory line, 32°F a freeze. (Crop-specific critical temperatures vary — generalized line in v1; see non-goals.)

### Crew

**R4 — Heat risk + start time.** *Combines heat flag and start/stop guidance.*
Take the maximum across daily `apparent_temperature_max`.
- ≥ **95°F** → "High heat [day] — start crew by 6am, break every 2h" (`level: alert`).
- ≥ **90°F** (but < 95°F) → "Heat risk [day] — water + rest breaks" (`level: alert`).
- Otherwise → baseline "No heat-stress days this week" (`level: ok`).
Detail = peak feels-like temp. Why: at ~90°F+ feels-like, heat-illness risk climbs; ~95°F triggers mandatory rest protocols (OSHA proposed standard; Cal/OSHA high-heat at 95°F in agriculture), and an early start shifts work out of the afternoon peak.

**R5 — Workable days.** *Simple compute — rain sum only.*
Classify each day by daily `precipitation_sum`: **not workable** if ≥ **0.25 in**; otherwise **workable**.
Call: "Workable days: [list]" (`level: warn` if ≥3 rain-outs, else `ok`), detail = "Rain likely: [list]" or "no rain-outs forecast." Why: days with 0.25 in+ of rain stop most field work and make ground unsafe.

### Confidence model (simple — lead time only)

v1 derives confidence purely from how soon the triggering condition occurs:

- **High:** trigger in the next ~48h (day index 0–1).
- **Medium:** trigger 3–5 days out (day index 2–4).
- **Low:** trigger 5–7 days out (day index 5–6).

Baseline "all-clear" cards default to Medium. (Margin-based confidence — how far a value clears its threshold — is a P1 refinement, not in v1.)

### Stack assembly

1. Evaluate all five rule families; each returns exactly one card (triggered or baseline). 2. Collect the `alert`-level cards for the alert banner region. 3. Render alerts on top, then the five cards grouped under Crops (R1–R3) and Crew (R4–R5). Result is always five cards, 4–6 range satisfied, both groups present.

## UX spec

- **Entry:** a single location input + "use my location" button + a one-line value prop. Submitting either path triggers the flow.
- **Loading:** skeleton dashboard (P1) with a "reading the forecast…" line; target perceived time ~10s.
- **Results — the dashboard:** a header with the resolved place name + 7-day date range, then a two-region layout:
  - **Map (primary):** interactive map centered on the location with a marker — side-by-side with results on wide screens, on top when stacked on mobile.
  - **Recommendations:** flagged **alerts** first (if any), then cards grouped under **Crops** and **Crew**. Each card: bold call, the weather number as a secondary line, a confidence chip (High/Medium/Low), and the muted "why."
- **States that must be designed:** denied/blocked geolocation; location not found; location outside CONUS; Open-Meteo fetch error (retry); quiet-week (baseline cards, no alerts). No state should render a blank screen.
- **Design constraints:** mobile-first, high contrast for outdoor/sunlight readability, large tap targets, no login wall.

## Architecture & deploy

- **Front end:** static single-page app (framework-agnostic — plain JS or a light framework is fine). No server-rendered secrets.
- **Map:** a lightweight map library with open tiles (e.g. Leaflet + OpenStreetMap) loaded client-side. No map API key required.
- **Data:** all API calls client-side directly to Open-Meteo (geocoding + forecast). No backend, no database, no key storage.
- **Rules engine:** a pure, side-effect-free module (forecast in → cards out) so it can be unit-tested in isolation against fixture forecasts.
- **Hosting:** Vercel, public URL, static deploy. Trivial rollback and preview deploys.

## Development handoff

**Stack — confirmed.** Static SPA, vanilla JS acceptable; Leaflet + OpenStreetMap for the map; Open-Meteo for geocoding + forecast (no keys); Vercel static hosting. No build step required.

**Suggested build sequence.**

1. Static shell + location entry form and "use my location."
2. Geocoding + forecast fetch with the v1 variable set; loading and error states.
3. Map dashboard rendering the resolved location (P0-3).
4. Rules engine module (R1–R5) as a pure function with the object shape above.
5. Alerts banner (P0-5) + grouped Crops/Crew stack (P0-6).
6. Edge-case states (outside CONUS, not found, blocked geolocation, fetch error, quiet week).
7. Vercel deploy.

**Definition of done (v1).**

- All P0 acceptance criteria pass.
- The rules engine has unit tests covering the three edge cases (frost-prone, 100°F+, rainy week) plus a normal week, all green.
- The five required Open-Meteo variables are requested and parsed correctly; no deferred variables are pulled.
- Every results state from the UX spec is handled (no blank screens).
- Deployed to a public Vercel URL that loads and returns a valid dashboard for any CONUS location.
- Spray and heat cards carry the guidance disclaimer (see Open questions → legal).

## Success metrics

Because v1 is stateless and unauthenticated, instrument lightweight, privacy-safe analytics (e.g. page + event counts) — no PII.

**Leading indicators (days–weeks)**

- **Shippability (primary):** a live public URL that loads and returns a valid dashboard for any CONUS location — binary success bar for this build.
- **Time-to-dashboard:** median location-submit → rendered dashboard **≤ 10s**; target 90th percentile ≤ 15s.
- **Completion rate:** ≥ **80%** of sessions that enter/allow a location reach a rendered dashboard (low error/dead-end rate).
- **Engine validity:** 100% of successful forecasts yield 4–6 cards with at least one Crops and one Crew card (verified by tests + edge-case stress runs).

**Lagging indicators (weeks–months)**

- **Return usage:** share of users who open the app on multiple distinct days (proxy for "this is part of my routine").
- **Trust / usefulness:** qualitative — operators report the calls match their own judgment and the "why" lines are clear (lightweight feedback or interviews).

## Open questions

Most prior open questions are now resolved in the Decision log. These remain genuinely open for engineering/legal:

- **(Engineering)** Geocoding edge cases — ambiguous town names and ZIP handling: auto-pick the top US match (simplest, current assumption) vs. show a disambiguation picker on multiple matches? Default for v1: auto-pick top result; confirm acceptable.
- **(Legal)** Disclaimer wording for spray (R2) and heat (R4) so the app reads as guidance, not compliance advice. A one-line review is needed before launch; placeholder disclaimer in the footer is in scope for v1.
- **(Data/ops)** Open-Meteo rate limits / outages — acceptable for a public demo, but do we want a graceful "service busy" state and/or client-side caching of the last successful fetch (P1)?

## Timeline considerations & phasing

No hard external deadline; the constraint is "trivially shippable, fast." Suggested phasing:

- **Phase 1 — v1 (P0):** location entry, Open-Meteo fetch, map dashboard, rules engine (R1–R5), alerts + grouped stack, Vercel deploy. This is the shippable core.
- **Phase 2 — polish (P1):** card detail/expand, Delta-T spray refinement, loading skeleton, shareable links, threshold/unit toggles, caching.
- **Phase 3 — hardening (PINNED, see below).**
- **Phase 4 — depth (P2):** crop/field profiles, saved locations, push alerts/digests.

## Pinned follow-up — self-improvement & edge-case hardening

*(Pinned per request; to be addressed after the core build.)* Once v1 is live, run an agent-driven self-critique of the rules engine and UX, then stress-test against edge-case CONUS locations — a frost-prone northern/high-elevation spot, a 100°F+ desert location, and a sustained rainy week — and fix whatever breaks (rules that mis-fire, empty or contradictory stacks, confidence mislabeling, broken states). Treat the three edge-case locations as a standing regression suite for the rules engine.

---

## Sources

Spray wind speed and temperature thresholds: [SDSU Extension — How to Stop Drift](https://extension.sdstate.edu/how-stop-drift), [UMN Extension — Avoiding herbicide drift](https://extension.umn.edu/herbicides/too-windy-to-spray), [Kestrel Instruments — Preventing Spray Drift](https://kestrelinstruments.com/blog/preventing-spray-drift), [Iowa State — Wind Speed and Herbicide Application](https://crops.extension.iastate.edu/cropnews/2017/01/wind-speed-and-herbicide-application).

Heat thresholds (80°F / 90°F / 95°F action levels): [OSHA — Heat Injury and Illness Prevention Rulemaking](https://www.osha.gov/heat-exposure/rulemaking), [Federal Register — Heat Injury and Illness Prevention NPRM](https://www.federalregister.gov/documents/2024/08/30/2024-14824/heat-injury-and-illness-prevention-in-outdoor-and-indoor-work-settings), [AlertMedia — OSHA Heat Regulations 2026](https://www.alertmedia.com/blog/osha-heat-regulations/).

Irrigation / ET₀ checkbook method and ~50% depletion trigger: [UC IPM — Irrigation Scheduling Using Evapotranspiration](https://ipm.ucanr.edu/PMG/GARDEN/ENVIRON/evap.html), [Cropaia — Irrigation scheduling using evapotranspiration data](https://cropaia.com/blog/irrigation-scheduling/).

Frost critical-temperature concept: [FAO — Frost Damage: Physiology and Critical Temperatures](https://www.fao.org/4/y7223e/y7223e0a.htm).

Open-Meteo API (free, no key, variables incl. ET₀, geocoding): [Open-Meteo Docs](https://open-meteo.com/en/docs), [Open-Meteo home](https://open-meteo.com/).

# PRD — "This Week on the Farm"

**A weather-to-decision web app for farm operators and crew leads**

| | |
|---|---|
| **Status** | Draft v1 — build-ready |
| **Author** | Michael |
| **Last updated** | June 29, 2026 |
| **Scope** | Continental United States (CONUS) only |
| **Target** | Single shippable web app, live public URL on Vercel |

---

## Problem statement

Farm operators and crew leads make daily, money-on-the-line calls — irrigate or not, spray or wait, send the crew at 6am or noon, harvest before a frost — and today they make them by reading raw forecasts and translating numbers into action in their heads. Raw weather apps show precipitation, wind, and temperature but stop short of the decision; the operator does the agronomy. That translation is error-prone, time-consuming, and inconsistent across a crew. The cost of getting it wrong is wasted water and labor, drift violations, heat-related incidents, or frost-damaged crops.

This app collapses the forecast-to-decision gap: type a location, get a short stack of plain-English calls, each backed by a real weather number and a one-line "why," in about ten seconds.

## Goals

1. **Decision, not data.** Turn a 7-day forecast into 4–6 concrete recommendations a non-meteorologist can act on without further interpretation.
2. **Earn trust through transparency.** Every recommendation shows the weather number that triggered it and a one-line rationale, so the operator can sanity-check the call against their own judgment.
3. **Be trivially shippable.** Live public URL, no login, no API key, no backend to operate — the success bar for this build is that anyone can open the link and use it immediately.
4. **Speed.** From "use my location" / typed location to a rendered card stack in roughly 10 seconds on a normal connection.
5. **Serve both audiences in one view.** A single card stack splits cleanly into Crops calls (irrigation, spray, harvest/frost) and Crew calls (workable days, start/stop times, heat risk).

## Non-goals

1. **No accounts, saved farms, or history.** v1 is stateless — a location in, a card stack out. Persistence is a separate initiative; it adds auth, storage, and a backend that work against the "trivially shippable" goal.
2. **No crop- or field-specific calibration.** v1 uses generalized agronomic thresholds, not per-crop critical temperatures or per-field soil/Kc data. Crop-specific tuning is high-value but requires data the app doesn't collect yet (P2).
3. **No global coverage.** CONUS only. Geocoding, units (imperial), and threshold defaults are tuned for the continental US; international support is out of scope for v1.
4. **No spray-legality or compliance guarantees.** Recommendations are agronomic guidance, not a substitute for the pesticide label, applicator license rules, or local regulations. The app advises; the operator remains responsible.
5. **No alerting / push / scheduling.** v1 is pull-only (open the page, see this week). Notifications and scheduled digests are a fast-follow (P1/P2), not v1.

## Personas & user stories

The app serves two operators equally, sharing one card stack.

**Farm operator / produce or row-crop manager** — owns the Crops calls.

- As an operator, I want to see whether to irrigate this week so that I don't waste water (or money) running lines into a rain event.
- As an operator, I want to know the best dry, low-wind window to spray so that I stay on-label and avoid drift.
- As an operator, I want a heads-up when a frost or freeze is coming so that I can harvest or protect crops before damage.

**Crew supervisor / labor lead** — owns the Crew calls.

- As a crew lead, I want to know which days this week are workable so that I can plan the schedule.
- As a crew lead, I want recommended start/stop times on hot days so that I keep the crew safe and productive.
- As a crew lead, I want a clear heat-risk flag so that I can trigger water/rest protocols before anyone gets hurt.

**Shared / cross-cutting**

- As either user, I want every call to show the number behind it so that I can trust or override it.
- As either user, I want to hit "use my location" or type a town so that I get to the answer in seconds.
- As either user, I want a graceful message when location or weather lookup fails so that I'm never staring at a blank screen.

## Functional requirements

### Must-have (P0)

**P0-1 — Location entry.** The app accepts a typed location (town, "city, state", or ZIP) and a "use my location" button (browser geolocation).

- *Acceptance:* Given a user types "Fresno, CA" and submits, when geocoding resolves, then the app fetches the forecast for those coordinates and renders the card stack.
- *Acceptance:* Given a user clicks "use my location" and grants permission, when coordinates return, then the app proceeds without a typed entry.
- *Acceptance:* Given geolocation is denied or unavailable, when the user has not typed a location, then the app shows a clear prompt to type one (no dead end).
- *Acceptance:* Given a typed location resolves to coordinates outside CONUS, then the app shows a "this app currently covers the continental US only" message rather than rendering misleading calls.

**P0-2 — Forecast fetch (Open-Meteo, client-side, no key).** On a resolved location, the app calls the Open-Meteo Forecast API directly from the browser for a 7-day hourly + daily forecast with the variables in the Data Spec below.

- *Acceptance:* Given valid coordinates, when the fetch succeeds, then hourly and daily arrays for all required variables are available to the rules engine.
- *Acceptance:* Given the Open-Meteo request fails or times out, then the app shows a retryable error state, not a blank or broken stack.

**P0-3 — Rules engine produces 4–6 recommendations.** A client-side rules engine evaluates the forecast against the thresholds in the Rules Spec and emits between 4 and 6 cards, each assigned to Crops or Crew.

- *Acceptance:* Given a normal forecast, when the engine runs, then it returns 4–6 cards split across the two groups.
- *Acceptance:* Given a quiet forecast where few rules fire, then the engine still fills the stack with the highest-value "all-clear"/baseline cards (e.g. "No frost risk this week," "Good spray window Thursday") so the stack is never near-empty.
- *Acceptance:* Each card carries: a plain-English call, the triggering weather number with units, a confidence level, and a one-line "why."

**P0-4 — "This Week on the Farm" card stack UI.** Cards render in a scannable stack, visually grouped into Crops and Crew, with the resolved location and forecast date range shown.

- *Acceptance:* Given the engine output, when rendered, then each card shows call, number, confidence, and why; cards are grouped under Crops and Crew headers.
- *Acceptance:* The view is mobile-first and legible outdoors (high contrast, large type).

**P0-5 — Deploy to public Vercel URL.** Static front end + client-side API calls, deployed to a public Vercel URL with no server-side secrets.

- *Acceptance:* Anyone with the URL can use the app with no login and no configuration.

### Nice-to-have (P1)

- **P1-1 — Per-card detail / expand.** Tapping a card reveals the supporting hourly/daily numbers (e.g. the exact hours over 95°F) behind the call.
- **P1-2 — Adjustable thresholds.** A simple settings panel lets the operator nudge key thresholds (e.g. heat start-time trigger) to match their operation.
- **P1-3 — Unit toggle.** Allow °C / km/h / mm for users who prefer metric, while defaulting to imperial.
- **P1-4 — Shareable link.** Encode the location in the URL so a resolved card stack can be shared or bookmarked.
- **P1-5 — Loading skeleton.** Show a skeleton card stack during fetch to reinforce the ~10s speed goal.

### Future considerations (P2)

- **P2-1 — Crop/field profiles.** Let the operator pick a crop (or set a custom critical temperature and Kc) so frost and irrigation calls are crop-specific rather than generalized.
- **P2-2 — Saved locations / multi-field.** Persist multiple fields per operator (requires auth + storage + backend).
- **P2-3 — Alerts & digests.** Push or email a morning digest, or alert when a frost/heat threshold is newly crossed.
- **P2-4 — Self-improvement / hardening pass (PINNED).** Once built, run an agent self-critique of the rules and UX and stress-test against edge-case locations (frost-prone, 100°F+, rainy week), then fix what breaks. Tracked separately — see "Pinned follow-up."

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

| Need | Open-Meteo hourly variable | Open-Meteo daily variable |
|---|---|---|
| Temperature | `temperature_2m` | `temperature_2m_max`, `temperature_2m_min` |
| Feels-like (heat) | `apparent_temperature` | `apparent_temperature_max` |
| Precipitation | `precipitation` | `precipitation_sum` |
| Rain probability | `precipitation_probability` | `precipitation_probability_max` |
| Wind | `wind_speed_10m` | `wind_speed_10m_max` |
| Wind gusts | `wind_gusts_10m` | `wind_gusts_10m_max` |
| Humidity (for Delta-T) | `relative_humidity_2m`, `dew_point_2m` | — |
| Irrigation demand | `et0_fao_evapotranspiration` | `et0_fao_evapotranspiration` (daily sum) |

All variable names above are valid Open-Meteo Forecast API fields. The engine reads hourly arrays for windowed rules (e.g. "any hour > 95°F tomorrow") and daily arrays for day-level rules (workable days, frost minimums, daily ET₀ vs. rain balance).

## Rules spec — the engine

A small, pure, client-side function: forecast in → array of recommendation objects out. Each rule defines a trigger (variable + threshold + time window), an output call, and a confidence/why. Thresholds below are drawn from extension and regulatory sources (see Sources), not hand-waved.

Each recommendation object:

```
{
  group: "Crops" | "Crew",
  call: "Skip irrigation this week",        // plain-English
  number: "0.6 in rain expected Tue–Wed",   // the real number + units
  confidence: "High" | "Medium" | "Low",
  why: "Rain over 0.3 in in 48h recharges the root zone — irrigating would waste water"
}
```

### Crops

**R1 — Irrigation: skip on incoming rain.**
Trigger: `precipitation_sum` over the next 48h ≥ **0.3 in** (and `precipitation_probability_max` ≥ ~60%).
Call: "Skip irrigation — rain is coming." Number: total inches + days. Why: rain over ~0.3 in in 48h meaningfully recharges the root zone (checkbook/water-budget method).

**R2 — Irrigation: irrigate on high demand + dry.**
Trigger: next-3-day `et0_fao_evapotranspiration` sum is high (sustained ≥ **~0.25 in/day**, i.e. ≥ ~0.75 in over 3 days) AND next-48h `precipitation_sum` < **0.1 in**.
Call: "Plan to irrigate by [day]." Number: ET₀ demand vs. rain. Why: crop water use (ET) is outpacing rainfall, drawing down soil moisture toward the ~50%-depletion irrigation trigger.

> Engine note: R1 and R2 are mutually exclusive — evaluate rain first; only one irrigation card emits.

**R3 — Spray window.**
Trigger: find an hour (daytime, ~7am–7pm) where ALL hold: `precipitation` = 0 (and none for the following few hours), `wind_speed_10m` between **3 and 10 mph**, `temperature_2m` between **50 and 85°F**, and estimated Delta-T in the **3.6–14.4°F (2–8°C)** ideal band (approx. from temp/RH/dew point; or proxy `relative_humidity_2m` ≥ ~50%).
Call: "Best spray window: [day] [morning/window]." Number: wind mph + temp at that window. Why: wind 3–10 mph and Delta-T 2–8°C minimize drift and evaporation; under 3 mph risks inversion, over 10 mph risks drift.
If no qualifying window in 7 days: "No good spray window this week — winds/heat out of range."

**R4 — Frost / freeze.**
Trigger: any day's `temperature_2m_min` ≤ **36°F**.
Call: ≤ 36°F → "Frost risk [day] — protect or harvest sensitive crops"; ≤ **32°F** → escalate to "Hard freeze [day]." Number: the forecast low. Why: radiational cooling can run several degrees below the forecast low; 36°F is a conservative advisory line, 32°F is a freeze. (Crop-specific critical temperatures vary — see non-goals; v1 uses a generalized line.)
If no day ≤ 36°F: emit baseline "No frost risk this week."

### Crew

**R5 — Heat risk + start time.**
Trigger: any daytime hour with `apparent_temperature` ≥ **90°F** (elevated) or ≥ **95°F** (high).
Call: ≥ 90°F → "Heat risk [day] — water + rest breaks"; ≥ 95°F → "High heat [day] — start crew by 6am, break every 2h." Number: peak feels-like temp + the hours it exceeds threshold. Why: at ~80°F+ heat index water/rest is advised; ~90–95°F triggers mandatory rest protocols (OSHA proposed standard; Cal/OSHA high-heat at 95°F in agriculture). Starting early shifts work out of the dangerous afternoon window.
If no day ≥ 90°F feels-like: baseline "No heat-stress days this week."

**R6 — Workable days.**
Trigger: classify each day — a day is **not workable** if `precipitation_sum` ≥ **0.25 in** or `precipitation_probability_max` ≥ ~70%; **marginal** if 0.1–0.25 in; otherwise **workable**.
Call: "Workable days: [list]. Rain likely: [list]." Number: per-day rain. Why: significant rain stops most field work and makes ground conditions unsafe/unworkable.

**R7 — Start/stop times (hot days).**
Trigger: on any day with afternoon `apparent_temperature` ≥ **90°F**, recommend start **6:00am**, hard break/stop through the peak (roughly noon–4pm).
Call: "[Day]: start 6am, off the field by early afternoon." Number: forecast afternoon feels-like peak. Why: keeps the crew working in the cooler morning and out of the day's heat peak.

### Confidence model (applies to every card)

Confidence is a function of (a) **lead time** — events in the next 24–48h are more certain than days 5–7 — and (b) **margin** — how far the value clears the threshold.

- **High:** trigger occurs in next ~48h, or value clears the threshold by a wide margin (e.g. low of 28°F vs. a 36°F frost line; feels-like 102°F vs. 95°F).
- **Medium:** trigger 3–5 days out, or value is moderately past threshold.
- **Low:** trigger 5–7 days out, or value sits within ~10% of the threshold (a close call the operator should watch).

### Stack assembly

1. Run all rules. 2. Each firing rule (plus baseline all-clear cards) produces a candidate. 3. Sort by group, then by severity/confidence. 4. Emit 4–6 cards, guaranteeing at least one Crops and one Crew card. 5. If more than 6 fire, keep the highest-severity/confidence; if fewer than 4, fill with baseline cards.

## UX spec

- **Entry screen:** single location input + "use my location" button + a one-line value prop. Submitting either path triggers the flow.
- **Loading:** skeleton card stack (P1) with a "reading the forecast for [place]…" line; target perceived time ~10s.
- **Results — "This Week on the Farm":** header shows resolved place name + the 7-day date range. Two labeled sections, **Crops** and **Crew**, each a vertical stack of cards. Each card: bold call, the weather number as a secondary line, a confidence chip (High/Medium/Low), and the italic-or-muted "why."
- **States that must be designed:** denied/blocked geolocation; location not found; location outside CONUS; Open-Meteo fetch error (retry); quiet-week (baseline cards). No state should render a blank screen.
- **Design constraints:** mobile-first, high contrast for outdoor/sunlight readability, large tap targets, no login wall.

## Architecture & deploy

- **Front end:** static single-page app (framework-agnostic — plain JS or a light framework is fine). No server-rendered secrets.
- **Data:** all API calls client-side directly to Open-Meteo (geocoding + forecast). No backend, no database, no key storage.
- **Rules engine:** a pure client-side module (testable in isolation with fixture forecasts).
- **Hosting:** Vercel, public URL, static deploy. Trivial rollback and preview deploys.

## Success metrics

Because v1 is stateless and unauthenticated, instrument lightweight, privacy-safe analytics (e.g. page + event counts) — no PII.

**Leading indicators (days–weeks)**

- **Shippability (primary):** a live public URL that loads and returns a valid card stack for any CONUS location — binary success bar for this build.
- **Time-to-stack:** median location-submit → rendered cards **≤ 10s**; target 90th percentile ≤ 15s.
- **Completion rate:** ≥ **80%** of sessions that enter/allow a location reach a rendered card stack (i.e. low error/dead-end rate).
- **Engine validity:** 100% of successful forecasts yield 4–6 cards with at least one Crops and one Crew card (verified by tests + edge-case stress runs).

**Lagging indicators (weeks–months)**

- **Return usage:** share of users who open the app on multiple distinct days (proxy for "this is part of my routine").
- **Trust / usefulness:** qualitative — operators report the calls match their own judgment and the "why" lines are clear (lightweight feedback or interviews).

## Open questions

- **(Agronomy/data)** R2 irrigation: is a simple 3-day ET₀-vs-rain balance sufficient for v1, or do we need a rolling soil-water-balance ("checkbook") accumulation across the full 7 days? Generalized default proposed; confirm.
- **(Agronomy)** Delta-T for R3: compute from temp + RH/dew point client-side, or simplify v1 to wind + temp + dry-window only and add Delta-T in P1? Need a decision on approximation accuracy.
- **(Product)** Frost line R4: is a single generalized 36°F advisory / 32°F freeze acceptable for v1, or is the generalization misleading enough that we should fast-track crop profiles (P2-1)?
- **(Engineering)** Geocoding edge cases — ambiguous town names and ZIP handling: how aggressively do we disambiguate (show a picker on multiple matches vs. auto-pick top US result)?
- **(Legal)** Disclaimer wording for spray (R3) and heat (R5) so the app reads as guidance, not compliance advice. Needs a one-line review.
- **(Data)** Open-Meteo rate limits / outages — acceptable for a public demo, but do we need a graceful "service busy" state and/or client-side caching of the last successful fetch?

## Timeline considerations & phasing

No hard external deadline; the constraint is "trivially shippable, fast." Suggested phasing:

- **Phase 1 — v1 (P0):** location entry, Open-Meteo fetch, rules engine (R1–R7), card stack UI, Vercel deploy. This is the shippable core.
- **Phase 2 — polish (P1):** card detail/expand, loading skeleton, shareable links, threshold/unit toggles.
- **Phase 3 — hardening (PINNED, see below).**
- **Phase 4 — depth (P2):** crop/field profiles, saved locations, alerts/digests.

## Pinned follow-up — self-improvement & edge-case hardening

*(Pinned per request; to be addressed after the core build.)* Once v1 is live, run an agent-driven self-critique of the rules engine and UX, then stress-test against edge-case CONUS locations — a frost-prone northern/high-elevation spot, a 100°F+ desert location, and a sustained rainy week — and fix whatever breaks (rules that mis-fire, empty or contradictory stacks, confidence mislabeling, broken states). Treat the three edge-case locations as a standing regression suite for the rules engine.

---

## Sources

Spray wind speed, temperature, and Delta-T thresholds: [SDSU Extension — How to Stop Drift](https://extension.sdstate.edu/how-stop-drift), [UMN Extension — Avoiding herbicide drift](https://extension.umn.edu/herbicides/too-windy-to-spray), [Kestrel Instruments — Preventing Spray Drift](https://kestrelinstruments.com/blog/preventing-spray-drift), [Iowa State — Wind Speed and Herbicide Application](https://crops.extension.iastate.edu/cropnews/2017/01/wind-speed-and-herbicide-application).

Heat thresholds (80°F / 90°F / 95°F action levels): [OSHA — Heat Injury and Illness Prevention Rulemaking](https://www.osha.gov/heat-exposure/rulemaking), [Federal Register — Heat Injury and Illness Prevention NPRM](https://www.federalregister.gov/documents/2024/08/30/2024-14824/heat-injury-and-illness-prevention-in-outdoor-and-indoor-work-settings), [AlertMedia — OSHA Heat Regulations 2026](https://www.alertmedia.com/blog/osha-heat-regulations/).

Irrigation / ET₀ checkbook method and ~50% depletion trigger: [UC IPM — Irrigation Scheduling Using Evapotranspiration](https://ipm.ucanr.edu/PMG/GARDEN/ENVIRON/evap.html), [Cropaia — Irrigation scheduling using evapotranspiration data](https://cropaia.com/blog/irrigation-scheduling/).

Frost critical-temperature concept: [FAO — Frost Damage: Physiology and Critical Temperatures](https://www.fao.org/4/y7223e/y7223e0a.htm).

Open-Meteo API (free, no key, variables incl. ET₀, geocoding): [Open-Meteo Docs](https://open-meteo.com/en/docs), [Open-Meteo home](https://open-meteo.com/).

# PRD — Farm Weather Advisor

**Owner:** PM (Michael) · **Status:** Approved — cleared for execution (zero blocking items) · **Date:** June 29, 2026
**Phase:** 0 (Align & Spec) → handoff to Phase 1 (Core Build)
**Type:** Rapid demo prototype — single web app, public deploy

> Engineering note: This document defines *behavior and outcomes*, not implementation. All technical and
> architectural decisions are marked `[ENG FLAG]` and are owned by engineering. Nothing here is code or
> pseudocode — treat thresholds as product rules to implement, not as a spec of how to implement them.
>
> **Workflow note — design happens *during* dev, not before.** For speed we're deliberately breaking the
> traditional design-then-build sequence. The **Seso Design System is provided in this folder**
> (`seso-design-system/`) to build against; visual design is applied as the app is built rather than handed off
> as finished mockups first. This PRD therefore specifies layout *intent and content* (what's on screen, in what
> order, why) and leaves visual styling — type, color, spacing, components — to that system. Visual styling
> decisions are not blockers for starting Phase 1.
>
> **Design-system adherence (required).** Build the UI from the Seso Design System and follow its **atomic
> structure and conventions**: compose screens from **atoms → molecules → organisms** (e.g., `Button`, `Input`,
> `Badge`, `StatusIndicator` → `FormField`, `Tabs`, `StatField` → `Card`, `TopBar`), reuse its existing
> primitives rather than inventing new ones, and inherit all design tokens (color, type, spacing, shape) from
> the system's `tokens/` + `styles.css` instead of hardcoding values. Brand split per the system: green
> (`#006E33`) for brand/status, blue (`#1D68BB`) for interaction; type is Plus Jakarta Sans for UI, IBM Plex
> Mono for numeric/data. Read `seso-design-system/README.md` and `seso-design-system/project/SKILL.md` first.
> Our recommendation cards should be realized as the system's **Card organism**, and the weather-number/“feels
> like” values are good candidates for the Plex Mono data treatment.

---

## 1. Problem Statement

Farm operators make time-sensitive crop and crew decisions — spray windows, irrigation, frost protection,
heat-risk scheduling — often in 30-minute windows, using consumer weather apps never built for agriculture.
They read raw forecasts and apply rules of thumb from memory, which is slow, error-prone, and easy to get
wrong (irrigating a field that rains the next day; sending crew into an OSHA heat-risk afternoon). The cost of
not solving it is wasted water and labor, missed spray windows, frost-damaged crops, and crew-safety exposure.

This product closes that gap by turning a raw forecast into a pre-interpreted, confident recommendation with
the weather number behind it — so an operator gets a decision, not a data dump.

## 2. North Star

**An operator enters a location and takes at least one farm action based on the app's recommendation in the
same session.** For this demo, the proxy is: *operator reads the card stack and says "that's useful"* —
measured qualitatively during the Phase 2 stress test.

## 3. Goals

1. **Time to value under 60 seconds, zero detours.** The landing screen itself holds the value: one input, then
   the card stack. No menus, no multi-step setup, no click path to the first "aha." First cards visible within
   ~10 seconds of submitting a location.
2. **Decisions, not data.** Every location returns 4–6 plain-English recommendations (4 guaranteed via the
   card-floor rules in §8), each starting with an action verb and each backed by at least one real weather number.
3. **Trust through grounding.** Every card carries a confidence/why line so the operator understands what's
   driving the call and how certain it is.
4. **Coverage across decision types.** Cards span both Crops (irrigation, spray, harvest/frost) and Crew
   (workable days, start/stop times, heat risk) so the app is useful to a real operator, not a one-trick demo.
5. **Trivially shippable.** Live at a public URL that anyone can open and use with no login.

## 4. Non-Goals (Out of Scope for the Demo)

- **No accounts, auth, saved locations, or history.** This is a single-session demo; persistence adds build
  cost with no demo value.
- **No backend or database.** Keeps the deploy trivial. Static front end + client-side forecast calls only.
- **No improving weather accuracy.** We use the forecast as-is; the product value is interpretation, not
  meteorology.
- **No farm-management-software integrations, notifications, or alerts.** Out of scope; v2 territory.
- **No premium tiers / paywall.** Nothing to monetize in a demo.
- **No multi-location comparison or unit toggles in v1.** Deferred (see P2) to protect the 60-second path.
- **No coverage outside the continental US (CONUS).** The demo is scoped to the lower-48; Alaska, Hawaii,
  territories, and international locations are out of scope. Out-of-bounds locations get a clear message, not a
  broken or misleading card stack (see §6, §10).

## 5. Target User & User Stories

**Primary user:** A farm operator or crew lead in the field on a phone, deciding what to do this week.

1. As an operator, I want to see useful recommendations the moment the page resolves my location, so I get value
   without learning an interface.
2. As an operator, I want to type a town/region *or* tap "Use my location," so I can start the way that's
   fastest for me right now.
3. As an operator, I want each recommendation written as a plain-English call ("Skip irrigation through
   Thursday"), so I can act without interpreting weather data.
4. As an operator, I want a real number on every card ("0.8in of rain by Thursday"), so I trust the call.
5. As an operator, I want a one-line "why + how sure," so I know when to act with confidence vs. double-check.
6. As an operator, I want crop calls and crew calls visually separated, so I can scan to the decision I'm making.
7. As an operator on a phone in bright sun, I want a legible single-column layout, so I can read it in the field.
8. **(Edge)** As an operator who denies location permission or mistypes a town, I want a clear next step, so a
   failure doesn't dead-end me.

## 6. UX Flow (Landing Screen Holds the Value)

One screen. On load, the operator sees a single prominent location input with a "Use my location" button beside
it, a one-line value statement ("This week on your farm — weather-backed calls in seconds"), and nothing else
competing for attention. The operator either taps "Use my location" (browser prompts for permission) or types a
place and submits. Within ~10 seconds the same screen fills in below the input with two things, in order: a
**day-to-day forecast strip** and then the **"This Week on the Farm"** card stack (4–6 cards in two labeled
groups, **Crops** then **Crew**, each card showing title → call → number line → confidence line). No navigation,
no second page, no modal between input and result. Re-entering a new location refreshes both in place.

**Forecast strip (the day-to-day view).** A horizontal 7-day row giving the operator the raw forecast they're
used to scanning, so the recommendations sit on top of context they trust. Each day shows: day-of-week, a
condition icon, and high/low temperature — modeled on the attached weather-widget reference (the bottom daily
row). This anchors the cards; an operator should be able to glance at the strip and see why a card fired. Keep
it to the daily summary for v1 — the hourly temperature/precip/wind tabbed curves in the reference are P1, not a
demo blocker.

The first aha moment is the forecast strip plus card stack appearing on the same screen the operator landed on —
that is the entire point of the design. Any feature that inserts a click, a step, or a page between location and
this result is a regression against Goal 1 and must be challenged.

**Continental US only.** If the operator's typed place or detected location resolves outside the lower-48, the
screen shows a clear message ("Farm Weather Advisor currently covers the continental US — try a location in the
lower 48") instead of a card stack. No partial or misleading output.

`[ENG FLAG]`: Decide the fastest acceptable first-paint pattern that still respects browser permission rules —
e.g. whether to show an example/last-typed location, a skeleton card state, or a prompt while the forecast
loads. Must not require an extra click to reach real cards.
`[ENG FLAG]`: Geolocation permission *denial* handling — fall back gracefully to the type-a-location path with a
clear inline message; never blank-screen or crash.
`[ENG FLAG] — VALIDATED:` Geocoding solved by Open-Meteo's free, no-key Geocoding API
(`geocoding-api.open-meteo.com/v1/search`): name/postal-code → lat/lon, and it returns `country_code` plus
`admin1` (US state), which supports the CONUS guard directly. Open decision: handling ambiguous town names
(rank by `population`, or show a disambiguation choice). For "use my location," browser geolocation returns
lat/lon directly — no geocoding step needed.
`[ENG FLAG]`: CONUS enforcement point — apply the lower-48 check (country_code US, excluding AK/HI, or a
lat/lon bounding box ~24–50°N, −125 to −66°W) on the resolved coordinates *before* any forecast call or card
render.

## 7. Data Contract (Open-Meteo)

Source: Open-Meteo forecast API — free, **no API key** (the unlock for fast live deploy), returns hourly + 7-day
daily forecast. **All fields below were validated against the live API/docs on 2026-06-29 — every variable the
rules need exists, with no-key access, imperial units, and a 7-day window (see Tool Validation Memo).** Cards
map to these fields (current Open-Meteo parameter names):

| Decision | Open-Meteo field(s) |
|---|---|
| Irrigation (skip / irrigate) | `et0_fao_evapotranspiration` (daily), `precipitation_sum` (daily), `precipitation_probability` (hourly) |
| Spray window | `wind_speed_10m` (hourly), `precipitation` (hourly), `temperature_2m` (hourly) |
| Frost / harvest | `temperature_2m` (hourly) |
| Workable days | `precipitation` (hourly), `temperature_2m` (hourly) |
| Early start / heat | `temperature_2m` (hourly), `apparent_temperature` (hourly) |
| Condition icons | `weather_code` |
| Day-to-day forecast strip | `temperature_2m_max` / `temperature_2m_min` (daily), `weather_code` (daily) |

Request units: `temperature_unit=fahrenheit`, `wind_speed_unit=mph`, `precipitation_unit=inch` — all confirmed
supported. Use current underscore parameter names (`wind_speed_10m`, `weather_code`); the legacy spellings
(`windspeed_10m`, `weathercode`) still work as aliases but should not be relied on.

`[ENG DIRECTIVE — CONFIRMED day-one scope 2026-06-29]` Pass `timezone=auto` on every forecast call, keyed to the
user's resolved location. Every time-of-day rule ("any hour ≥95°F," "start crew by 6am") and every day reference
in card copy ("Thursday," "tonight") depends on the *location's local time*. Without `timezone=auto` the API
returns UTC-aligned hours and the rules silently group the wrong hours into the wrong days — wrong "6am," wrong
daily highs. This is correctness, not a preference, and is in scope from day one.

`[ENG DIRECTIVE — DECIDED 2026-06-29]` **ET₀ unit conversion.** ET₀ is returned in millimeters by default; all
§8 irrigation thresholds are in inches. **Engineering converts mm→inch (÷25.4) before applying the CR-01/CR-02
rules** — a simple bounded calculation, do not rely on `precipitation_unit` to convert ET₀. Apply the converted
value consistently anywhere ET₀ feeds a rule or card.
`[ENG FLAG]`: Confirm a single client-side call returns all hourly+daily variables and that the geocode +
forecast round-trip stays under ~10s on a standard mobile connection (latency, not capability — capability is
validated).
`[ENG FLAG]`: CORS for browser calls — Open-Meteo is designed for client-side use and serves permissive CORS
headers; run a 5-minute smoke test from the deployed origin as Phase 1 step zero to confirm before building on it.

## 8. Rules (Product Logic — Engineering Implements)

Thresholds are research-backed product rules. Engineering owns how they're computed; the numbers below are not
negotiable without a PM decision logged in §12.

**Crops**

- **CR-01 Skip Irrigation** — fires when precipitation ≥ 0.3in forecast in next 48h. *Counter-rule:* if ET₀
  deficit is high (>0.5in/day) AND precip probability <40%, prefer Irrigate instead.
- **CR-02 Irrigate** — fires when ET₀ > 0.3in/day AND no rain in 48h AND no skip rule fired.
- **CR-03 Spray Window** — fires when a window exists with wind <10mph AND no precip ±4h AND temp 50–90°F. If no
  window exists in 7 days: "No spray window this week — wind or rain blocking all windows."
- **CR-04 Frost Risk** — fires when any hourly temp ≤34°F (frost) or ≤28°F (hard frost). Always high confidence;
  never hedge a frost warning.

**Crew**

- **CW-01 Workable Days** — always fires (summary card). Counts days with no >1h sustained rain AND max temp
  <100°F.
- **CW-02 Start Times** — **always fires** (always-on card, per the card-floor decision). Default/benign state
  reads as normal hours ("Normal hours OK — no heat risk this week. Highs stay below 90°F."). Escalates to the
  early-start call when any hour ≥95°F on a workable day → "Start crew by 6am… heat-safety risk after 10am."
- **CW-03 Heat Risk** — fires when apparent temperature ≥103°F at any hour; ≥125°F escalates to a "Heat Danger —
  suspend crew work" variant. When CW-03 fires it supersedes the benign CW-02 state.

**Card count & priority.** Show 4–6 cards. If more than 6 fire, prioritize: (1) Frost, (2) Heat Danger/Risk,
(3) Early Start, (4) Workable Days (always include), (5) Spray or Skip Irrigation (more actionable wins),
(6) Irrigate.

`[PM DECISION — RESOLVED 2026-06-29] minimum-card floor:` The 4–6 target was not guaranteed by the conditional
rules (a mild week could yield only 3: Workable Days + one irrigation card + Spray). **Resolved with options
(a)+(b):** (1) at least one card per group **always** renders, and (2) Crew always contributes a second,
always-on **start-times card** — in benign weather it reads as normal hours (e.g., "Normal hours OK — no heat
risk this week. Highs stay below 90°F."), and escalates to the Early-Start/Heat copy when CW-02/CW-03 fire. This
guarantees a 4-card floor (≥2 Crops slots via irrigation + spray, ≥2 Crew slots via workable-days + start-times)
without new data. Headline metric reworded to **"4–6 cards, with 4 guaranteed."**
`[ENG FLAG]`: Confirm tiebreaker logic when multiple crop rules qualify for the same slot.
`[ENG FLAG]`: Rules-engine implementation pattern (how rules are structured/evaluated) — engineering's call.

## 9. Card Spec

Every card has exactly four content fields under a group label, in this order:

1. **Group label** — CROPS or CREW.
2. **Title** — short noun phrase (≤40 chars), e.g. "Skip Irrigation Through Thursday."
3. **Call** — one sentence, action verb first (Skip / Irrigate / Spray / Cover / Start / Suspend / Watch),
   includes a day reference, no jargon (≤80 chars).
4. **Number line** — at least one real forecast number (`Xin` / `X°F` / `Xmph` / `N hours`); one or two numbers
   max (≤100 chars).
5. **Confidence line** — what's driving the call + how sure, in plain words (≤100 chars).

Tone: direct, for someone in muddy boots checking a phone. No hedging inside the call (hedges live only in the
confidence line). No exclamation marks. No technical variable names anywhere user-facing.

`[PM DECISION — DECIDED 2026-06-29] OSHA copy.` **Keep the OSHA framing as-is for the POC.** The exact
regulatory wording isn't precise, but this is a demoable proof-of-concept and the framing communicates urgency
well; we'll tighten the regulatory language as we go. Noted as known POC debt, not a blocker. *(Revisit during
Phase 2 copy review.)*

**Display order** — Crops section on top (Frost → Skip/Irrigate → Spray), Crew below (Heat → Early Start →
Workable Days). If no crop rules fire, Crops shows a neutral card: "No critical crop actions this week."

`[ENG FLAG]`: Confirm whether "No critical crop actions" renders as a card or a section label.
`[ENG FLAG]`: Confirm whether the CW-01 card still renders at 0 workable days, and its copy.

**Reference example (copy model, not a literal string):**

```
CREW
Start Crew Early: Thursday
Put crew in the field by 6am Thursday.
High of 97°F — OSHA heat advisory threshold hit after 10am.
Thursday is your last good work window before the heat sets in.
```

## 10. Requirements & Acceptance Criteria

### Must-Have (P0 — demo blocker)

- **Location entry** — text input + "Use my location" on the landing screen.
  - *Done when:* operator can start a forecast via either path from the first screen with no prior navigation.
- **Forecast retrieval** — client-side Open-Meteo call returning 7-day hourly + daily data.
  - *Done when:* a valid location returns the full field set in §7; failure shows an error state, not partial cards.
- **Rules engine** — produces 4–6 recommendations from real forecast data per §8, with 4 guaranteed via the
  card-floor rules (always-on Workable Days + Start Times in Crew; irrigation + spray in Crops).
  - *Done when:* "Fresno, CA" returns ≥4 cards, each grounded in a live number, none hard-coded — and a
    deliberately mild location still returns 4 (floor holds).
- **Day-to-day forecast strip** — 7-day row with day-of-week, condition icon, and high/low per day (§6).
  - *Done when:* a valid CONUS location renders 7 days of high/low + icon above the card stack, on the same screen.
- **Card stack UI** — title, call, number line, confidence line, grouped under Crops and Crew (§9).
  - *Done when:* all four fields render per card and grouping is visible.
- **Continental US guard** — out-of-bounds locations get a clear message, not cards.
  - *Done when:* a non-CONUS location (e.g., Honolulu, HI or Toronto, ON) shows the coverage message and no card
    stack; a CONUS location proceeds normally.
- **On-screen result, no detour** — cards appear on the landing screen after submit.
  - *Done when:* zero navigation/modal/second-page steps exist between location submit and visible cards.
- **Speed** — first cards within ~10 seconds on a standard connection.
- **Public deploy** — live, shareable Vercel URL, no login.
  - *Done when:* an anonymous visitor reaches working cards from the URL alone.

### Should-Have (P1 — high value, fast-follow)

- Confidence language calibrated to probability ("likely" vs. "if forecast holds").
- One icon/visual indicator per card group (uses `weather_code`).
- Graceful error states for location-not-found, geolocation-denied, and out-of-CONUS.
- Mobile-readable single-column layout, legible in the field.
- **Hourly forecast detail** — the Temperature / Precipitation / Wind tabbed hourly curves from the reference
  widget. Adds depth for operators who want to drill in, but the daily strip is the demo blocker, not this.

### Could-Have (P2 — deferred, flag before adding)

- Unit toggle (°F/°C, in/mm).
- Multi-location comparison.
- "Explain this" expandable card detail.
- Share/export the card stack.

> Anything in P2 that would insert a step before the first card stays out of v1 regardless of effort — it
> conflicts with Goal 1.

**Acceptance example (Heat Risk card):**
Given a location forecasting ≥1 hour at or above 95°F on a workable day, when the operator submits that
location, then a Crew card appears reading approximately *"Start crew by 6am Thursday. High of 97°F — OSHA heat
advisory after 10am."* — *Not done if* the card shows for a location whose max temp is <90°F, or the threshold
is hard-coded rather than read from the forecast.

## 11. Success Metrics

**Leading (demo-time, qualitative + observable):**
- Time to first card < 10s for any tested location.
- ≥4 cards generated for every tested location (rules coverage).
- 100% of cards contain a real forecast number.
- "That's useful" reaction during stress-test review (North Star proxy).

**Lagging (not tracked for this demo, listed to set expectations):** retention, revenue, NPS — explicitly out
of scope; this is a single-session prototype.

## 12. Decision Log

| Date | Decision | Rationale | By |
|---|---|---|---|
| 2026-06-29 | Open-Meteo as data source | Free, no API key, includes ET₀ | PM |
| 2026-06-29 | Vercel static deploy, client-side calls only | Trivially shippable, no backend for demo | PM |
| 2026-06-29 | Landing screen holds the value (no click path to first card) | 60-seconds-to-value is the core bet | PM |
| 2026-06-29 | Add day-to-day 7-day forecast strip (daily only for v1) | Operators trust cards more when sitting on familiar forecast context | PM |
| 2026-06-29 | Scope to continental US (lower-48) only | Keeps demo bounded; out-of-CONUS gets a clear message | PM |
| 2026-06-29 | Design during dev; design system provided to eng | Speed — skip design-before-build; apply provided system as we go | PM |
| 2026-06-29 | Tool stack validated pre-handoff (Open-Meteo forecast + geocoding, Vercel) | Confirmed all required fields/capabilities exist; see Tool-Validation-Memo.md | PM |
| 2026-06-29 | Card-floor resolved: always-on Workable Days + Start Times (Crew) | Guarantees the 4-card floor without new data; metric now "4–6, 4 guaranteed" | PM |
| 2026-06-29 | Build UI on Seso Design System; follow atomic structure/conventions | System provided in folder (`seso-design-system/`); reuse atoms→molecules→organisms + tokens | PM |
| 2026-06-29 | `timezone=auto` from user location confirmed as day-one scope | Correct hourly/day logic and time-of-day copy | PM |
| 2026-06-29 | Engineering converts ET₀ mm→inch (÷25.4) | Simple bounded calc; don't rely on `precipitation_unit` for ET₀ | PM |
| 2026-06-29 | **ET₀ correction (supersedes row above):** live-API smoke test shows `precipitation_unit=inch` DOES convert ET₀ to inches. forecast.js passes ET₀ through in inches with **NO** manual ÷25.4 (a second conversion would double-convert and silently suppress irrigation). | WAVE 0 smoke test; prevents silent wrong-irrigation calls | PM/ENG |
| 2026-06-29 | Keep OSHA copy as-is for POC | Demoable now; tighten regulatory wording in Phase 2 | PM |
| 2026-06-29 | Neutral "No critical crop actions" floor card carries a real benign number (week high + precip total) | Keeps §11 "100% of cards contain a real forecast number" literally true in mild weeks; resolves a T14 review finding | PM |
| 2026-06-29 | Crew day references use weekday names ("Thursday"), matching §9/crop cards — not "Day N" | §9 day-reference compliance; T14 review finding | PM/ENG |
| TBD | Rules-engine implementation pattern | Flagged for engineering | ENG |
| TBD | Geocoding + geolocation handling | Flagged for engineering | ENG |

## 13. Open Questions

- ~~**(ENG, blocking)** Exact Open-Meteo parameters + imperial unit options confirmed?~~ **RESOLVED** — all
  variables, no-key access, and °F/mph/inch units validated against the live API on 2026-06-29. (§7)
- ~~**(ENG, blocking)** Geocoding approach for typed locations under no-key/client-side constraint?~~ **RESOLVED**
  — Open-Meteo Geocoding API (no key) covers it. (§6)
- ~~**(PM, blocking)** Minimum-card floor — rules can yield only 3 cards in a mild week.~~ **RESOLVED** —
  always-on Workable Days + Start Times in Crew plus irrigation + spray in Crops guarantee a 4-card floor; metric
  reworded to "4–6, with 4 guaranteed." (§8)
- ~~**(ENG, blocking)** ET₀ unit conversion?~~ **DECIDED** — engineering converts mm→inch (÷25.4) before the
  rules; do not rely on `precipitation_unit`. (§7/§8)
- ~~**(ENG, directive)** Pass `timezone=auto` on every forecast call.~~ **CONFIRMED, day-one scope** — auto
  timezone from the user's resolved location. (§7)
- ~~**(PM/Content)** Soften OSHA regulatory claims?~~ **DECIDED** — keep as-is for the POC; tighten later
  (known debt, revisit in Phase 2 copy review). (§9)
- ~~**(PM/ENG)** How to test seasonal edge cases against a live forecast?~~ **DEFERRED to Phase 2** by decision;
  not a Phase 1 concern. (§14)
- **(ENG, blocking)** Geolocation-denied fallback that preserves the no-extra-click path? (§6)
- **(ENG, non-blocking)** CORS smoke test from the deployed origin passes? (expected yes — §7)
- **(ENG, non-blocking)** Ambiguous-town-name handling in geocoding — rank by population or disambiguate? (§6)
- **(ENG, non-blocking)** Card vs. section label for the empty-Crops state? (§9)
- **(ENG, non-blocking)** Does CW-01 render at 0 workable days, and what does it say? (§8/§9)
- **(ENG, non-blocking)** Tiebreaker when multiple crop rules compete for one of the 6 slots? (§8)
- **(ENG, blocking)** CONUS bounds check on resolved coordinates — method and where it's enforced before any
  forecast/render? (§6/§7)
- **(Design, non-blocking — resolve in-build)** Forecast strip layout: card placement relative to the strip and
  horizontal scroll behavior on mobile, applied via the provided design system as the app is built. (§6)
- **(PM/Design, blocking for styling — not for build start)** When does the design system land, and in what form
  (tokens, components)? Phase 1 logic/layout can proceed before it; final styling depends on it. (§14)

## 14. Timeline & Phasing

- **Phase 0 — Align & Spec (this doc):** complete on handoff.
- **Phase 1 — Core Build:** location in → cards out, live on Vercel. Done when "Fresno, CA" returns ≥4 grounded
  cards within 10s at a public URL with Crops/Crew grouping. Design is applied *during* this phase against the
  provided design system (see workflow note up top) — build does not wait on finished mockups, and final visual
  styling depends on the design system landing.
- **Phase 2 — Self-Improvement *(PINNED — do not start until Phase 1 is deployed)*:** agent critiques its own
  rules/UX and stress-tests edge cases, then fixes what breaks. PM defines scenarios and logs a defect brief
  before fixes:

  | Scenario | Example location | Expected behavior |
  |---|---|---|
  | Frost-prone | Salinas, CA (Jan) | Frost card fires; irrigation defers |
  | Extreme heat | Phoenix, AZ (Aug) | Heat-risk card fires; early-start flagged |
  | Wet week | Seattle, WA (Nov) | Spray-hold + irrigation-skip both fire; crew days reduced |

  `[PM/ENG FLAG] — Phase 2 testability:` The app reads a **live 7-day forecast**, so the seasonal scenarios above
  can't be conjured on demand — in late June there's no frost in Salinas to test against. Two options when Phase
  2 begins: (a) pick locations *currently* experiencing each edge condition (whatever is hot/frosty/rainy that
  week), or (b) allow a temporary forecast-injection/mock mode for deterministic edge-case testing. Decide at
  Phase 2 kickoff; not a Phase 1 concern.

## 15. Engineering Readiness — Final Sign-off

Status after final stress-test review and PM sign-off: **cleared to begin execution — zero blocking items
remain.** Scope is tight, the tool stack is validated (Open-Meteo forecast + geocoding, browser geolocation,
Vercel — see Tool-Validation-Memo.md), the design system is in the folder, and every question raised in review
has been decided. No unknown requires a different tool or a backend.

**Day-one directives (decided — build to these from the first commit):**

1. **`timezone=auto`** on every forecast call, keyed to the user's location (§7) — correctness, confirmed scope.
2. **ET₀ mm→inch conversion** (÷25.4) in engineering before irrigation rules apply (§7/§8).
3. **CONUS guard before any forecast/render** (§6) — plus the CORS smoke test as Phase 1 step zero (§7).
4. **Build on the Seso Design System** (`seso-design-system/`) following its atomic structure and tokens — see
   the design-system adherence note at the top.
5. **Card-floor rules** (always-on Workable Days + Start Times in Crew) so 4 cards are guaranteed (§8).

**Non-blocking, resolve in-build:** geolocation-denied fallback, ambiguous-town handling, empty-Crops card vs.
label, CW-01 at zero workable days, crop-rule tiebreaker, forecast-strip mobile layout.

**Accepted POC debt:** OSHA copy kept as-is for the demo; tighten in Phase 2 copy review (§9).

**Pinned for Phase 2:** self-improvement stress test, including how to exercise seasonal edge cases against a
live forecast (§14).

**Artifacts in this folder for handoff:** `PRD-Farm-Weather-Advisor.md` (this doc), `Tool-Validation-Memo.md`,
and `seso-design-system/` (the design system to build against).

Everything in this list is tracked in §13 (Open Questions) and §12 (Decision Log). **Recommendation: hand off
and start building.**

---

*Out of scope, confirmed won't-do this cycle: accounts/auth, backend/DB, saved history, notifications,
farm-software integrations, paywall, unit toggle, multi-location compare, coverage outside the continental US.*

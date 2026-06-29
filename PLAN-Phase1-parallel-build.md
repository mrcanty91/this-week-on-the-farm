# Plan — Phase 1 Core Build (parallel, Superpowers-style)

**Source spec:** `PRD-Farm-Weather-Advisor.md` (rev. for dev handoff) · **Owner:** Michael · **Date:** 2026-06-29
**Also read before building:** `Tool-Validation-Memo.md` (tool capability + config gotchas) and
`seso-design-system/` (`README.md` + `project/SKILL.md` — the UI is built against this).
**Goal of this plan:** decompose the Phase 1 build into bite-sized, independently verifiable tasks
that map cleanly onto Superpowers' `subagent-driven-development` + `dispatching-parallel-agents`
flow — so each task can be handed to its own implementer subagent without file collisions.

> How to read this: tasks are grouped into **waves**. Everything inside a wave is independent and
> fans out to parallel subagents. Waves are sequential — a wave starts only when the prior wave's
> contract is merged. Each task is sized for ~one focused subagent session and carries its own
> acceptance criteria. Each implementer runs `test-driven-development` inside its task.

---

## Decisions already locked (from PRD rev + Tool-Validation-Memo) — agents must honor

- **No API key.** Open-Meteo forecast + geocoding are free/no-key; Vercel gives HTTPS. (Memo §1–4.)
- **Modern parameter names.** Use underscores: `wind_speed_10m`, `weather_code`,
  `wind_speed_unit=mph`. Legacy spellings are aliases — do not use them. (PRD §7 / Memo §1.)
- **ET₀ unit conversion — DECIDED.** `et0_fao_evapotranspiration` returns **millimeters**; all §8
  irrigation thresholds are in **inches**. Convert mm→inch (÷25.4) in the forecast-normalization
  step (T2) so every downstream rule consumes inches. Do **not** rely on `precipitation_unit` to
  convert ET₀. This is the one mismatch that silently produces wrong irrigation calls. (PRD §7 / Memo gotcha 1.)
- **CORS smoke test = step zero.** Open-Meteo is built for browser use, but a 5-minute fetch test
  from the deploy origin runs **before** Wave 1 fans out. (PRD §7 / Memo gotcha 2.)
- **Town disambiguation.** Geocoding can return multiple matches; rank by `population` (or surface a
  choice). (Memo gotcha 3 / PRD §6.)
- **CONUS guard on coordinates.** Enforce lower-48 before any forecast call/render. Use a coordinate
  bbox (covers both typed + "use my location" paths); `country_code`=US excluding AK/HI via `admin1`
  may augment the typed path. (PRD §6/§7.)
- **Build on the Seso Design System.** Link the system's `styles.css` + tokens; follow atomic
  structure (atoms → molecules → organisms); no hardcoded colors/spacing/type. Brand split: green
  `#006E33` = brand/status, blue `#1D68BB` = interaction. Type: Plus Jakarta Sans (UI), IBM Plex Mono
  (numbers/data). (PRD top note §0 / `seso-design-system/project/SKILL.md`.)

---

## Skill invocation order (the spine)

```
superpowers:using-superpowers          # auto-fires; gate before any action
superpowers:brainstorming              # already done → produced the PRD
superpowers:writing-plans              # produces THIS document
superpowers:using-git-worktrees        # one worktree per parallel task (isolation)
superpowers:subagent-driven-development # orchestrates the waves below
  └ superpowers:dispatching-parallel-agents   # fan-out primitive inside each wave
  └ superpowers:test-driven-development        # each implementer, RED→GREEN→REFACTOR
seso-design                            # user-invocable DS skill — load for any UI task (T7,T8,T9,T11)
superpowers:requesting-code-review     # after each task
superpowers:receiving-code-review      # apply review feedback
superpowers:verification-before-completion  # final gate (acceptance run)
superpowers:finishing-a-development-branch  # merge + wrap
```

---

## Architecture decisions (the contract that makes parallelism safe)

A static SPA is one HTML file by default — which serializes everything. To parallelize, split into
**pure ES modules** behind fixed interfaces. Agents touch only their own file. The shell (`index.html`)
and the glue (`main.js`) are the *only* shared files, and they're owned by single sequential tasks.

```
/index.html              ← shell + mount points; links DS styles.css (Wave 0, owns DOM ids)
/src/config.js           ← shared constants: §8 thresholds, CONUS bbox, Open-Meteo underscore params,
                            imperial units, ET0_MM_TO_IN = 1/25.4 (Wave 0)
/src/geocode.js          ← T1: place string → {lat, lon, name, country_code, admin1} | null (rank by population)
/src/forecast.js         ← T2: {lat,lon} → normalized forecast object (imperial; ET₀ converted to inches)
/src/conus.js            ← T3: {lat,lon}(+optional country_code/admin1) → bool inside lower-48
/src/rules-crops.js      ← T4: forecast → crop cards[]  (CR-01..04; ET₀ already in inches)
/src/rules-crew.js       ← T5: forecast → crew cards[]  (CW-01..03)
/src/prioritize.js       ← T6: cards[] → ordered, capped 4–6 (§8 priority)
/src/card.js             ← T7: card data → DOM node (§9 four fields) — Seso DS atoms/molecules + tokens
/src/strip.js            ← T8: daily forecast → 7-day strip DOM (§6) — DS tokens, weather_code icons
/src/locationInput.js    ← T9: input + geolocation + error states — DS Input/Button atoms
/src/main.js             ← T10: wire it all together (Wave 2, integration)
/styles.css              ← T11: app styles layered on DS tokens/styles.css (Wave 2)
vercel.json              ← T12: static deploy config (Wave 0, trivial)
/tests/*.test.js         ← each task ships its own tests alongside
```

**The forecast object is the central contract.** T2 defines it (and is where ET₀ becomes inches);
T3–T6 consume it. Lock its shape in Wave 0 (`config.js` + a written type comment) so parallel
rule-writers code against a stable schema.

---

## WAVE 0 — Foundation, contracts & smoke tests (SEQUENTIAL, 1 agent, do not parallelize)

Everything downstream depends on these interfaces. One agent, one commit, then fan out.

**T0.0 — Step-zero smoke checks (do FIRST, per Memo)**
- CORS fetch test: a single client-side Open-Meteo call from a deployed/preview origin succeeds.
- ET₀ unit confirmation: verify `et0_fao_evapotranspiration` returns mm and that the ÷25.4 conversion
  lands in the expected inch range for a known location.
- *Done when:* both confirmed and noted; if CORS fails, STOP and escalate before any further build.

**T0.1 — Repo scaffold + interface contracts**
- Create `index.html` shell with mount points: `#location-form`, `#forecast-strip`, `#card-stack`,
  `#message`. **Link the Seso DS `styles.css`** (and `_ds_bundle.js` if using DS components) so every
  module inherits tokens/fonts. Add `<script type="module" src="/src/main.js">`. No logic.
- Create `src/config.js` exporting: CONUS bbox, all §8 thresholds (named constants), Open-Meteo
  endpoint + **underscore** params (`wind_speed_10m`, `weather_code`, …), imperial units
  (`temperature_unit=fahrenheit`, `wind_speed_unit=mph`, `precipitation_unit=inch`), the §7 hourly +
  daily field list, and `ET0_MM_TO_IN = 1/25.4`.
- Write the **forecast object schema** as a documented stub (`src/forecast.js` signature + JSDoc),
  explicitly stating ET₀ is expressed in **inches** in the normalized object.
- Empty stub exports for every module so imports resolve.
- *Done when:* `index.html` loads with no console errors, DS styles.css is linked and fonts load, all
  imports resolve, `config.js` thresholds match §8 and params use underscore names, ET₀-as-inches
  documented in the schema.

---

## WAVE 1 — Pure modules (PARALLEL, ~10 agents, one worktree each)

All independent. Each is a pure function or self-contained UI module with its own tests. Fan out via
`dispatching-parallel-agents`. None of these touch `index.html` or `main.js`. UI tasks load the
`seso-design` skill and build from DS tokens/atoms — never hardcoded values.

**T1 — Geocoding (`src/geocode.js`)**
- Place string → `{lat, lon, name, country_code, admin1}` or `null` via Open-Meteo geocoding (no key).
- **Disambiguate** multiple matches by `population` (pick highest, or expose the ranked list).
- *Done when:* "Fresno, CA" resolves; "Springfield" picks the highest-population match deterministically;
  gibberish returns `null`; unit tests cover all three.

**T2 — Forecast client (`src/forecast.js`)**
- `{lat,lon}` → normalized forecast object per the Wave-0 schema. Single Open-Meteo call, **underscore
  params**, imperial units, hourly + 7-day daily, all §7 fields.
- **Convert ET₀ mm→inch (× `ET0_MM_TO_IN`) inside this step** so the object exposes ET₀ in inches.
- *Done when:* a live call returns the full field set; ET₀ is in inches in the object; round-trip < 10s;
  network failure throws a catchable error (no partial object). Tests mock the response incl. ET₀ conversion.

**T3 — CONUS guard (`src/conus.js`)**
- `{lat,lon}` (+ optional `country_code`/`admin1`) → boolean inside lower-48. Primary check is the
  coordinate bbox (works for both typed and geolocation paths); use `country_code`=US excluding
  AK/HI when those fields are present.
- *Done when:* Fresno=true, Honolulu=false, Toronto=false; pure fn; unit tested for both entry paths.

**T4 — Crop rules (`src/rules-crops.js`)**
- forecast object → crop cards implementing CR-01..04 exactly (incl. CR-01 counter-rule, CR-03
  no-window fallback, CR-04 always-high-confidence). **ET₀ is already in inches** — compare directly to
  §8 inch thresholds. Each card = the four §9 fields.
- *Done when:* fixture forecasts trigger each rule correctly; ET₀ thresholds compared in inches; frost
  never hedges; tests per rule.

**T5 — Crew rules (`src/rules-crew.js`)**
- forecast object → crew cards implementing CW-01..03 (CW-01 always fires; CW-03 ≥103°F + ≥125°F
  Heat Danger variant). Four §9 fields each.
- *Done when:* fixtures trigger each rule; 95°F→Early Start; 103°F→Heat Risk; 125°F→Heat Danger; tested.

**T6 — Prioritization (`src/prioritize.js`)**
- Combined cards[] → ordered + capped to 4–6 per §8 priority ladder; handles empty-Crops neutral card.
- *Done when:* given >6 cards, returns the correct 6 in §8 order; Workable Days always present; tested.

**T7 — Card component (`src/card.js`)** *(load `seso-design` skill)*
- card data → DOM node rendering the four §9 fields + group label, built from Seso DS atoms/molecules
  and **tokens** (no hardcoded color/spacing/type). Numbers use IBM Plex Mono per DS. Tone/length rules
  enforced (no jargon, no exclamation, char caps).
- *Done when:* sample card renders all four fields in order using DS tokens; snapshot/DOM test passes.

**T8 — Forecast strip (`src/strip.js`)** *(load `seso-design` skill)*
- daily forecast → horizontal 7-day row: day-of-week, `weather_code` icon, high/low °F (§6), styled
  from DS tokens.
- *Done when:* 7 days render with icon + high/low from fixture data using DS tokens; tested.

**T9 — Location input + geolocation (`src/locationInput.js`)** *(load `seso-design` skill)*
- DS Input + Button atoms: text input + "Use my location"; emits a resolved-location event; handles
  geolocation-denied and not-found with inline messages (no blank screen).
- *Done when:* both entry paths emit coords; denial falls back to typed path with a message; tested.

**T12 — Deploy config (`vercel.json`)** *(tiny; can ride along in Wave 1)*
- Static config for Vercel, no build step, public, HTTPS.
- *Done when:* `vercel deploy` serves `index.html` at a public URL.

---

## WAVE 2 — Integration & styling (SEQUENTIAL after Wave 1 merges)

These touch shared files / depend on everything above, so they do **not** parallelize cleanly.

**T10 — Glue (`src/main.js`)**
- Wire: locationInput → geocode → **conus guard** → forecast (ET₀ already inches) → (crops+crew →
  prioritize) → render strip + card stack into the mount points. CONUS-fail and error paths render
  `#message`, not cards. Enforce the CONUS guard **before** the forecast call.
- *Done when:* in a browser, "Fresno, CA" → strip + ≥4 grounded cards on one screen, no nav/modal;
  "Honolulu, HI" → coverage message, no cards.

**T11 — App styling (`styles.css`)** *(load `seso-design` skill)*
- Layer app-specific styles on the DS `styles.css`/tokens: single-column mobile-legible layout,
  Crops/Crew grouping visible, field-readable contrast. Use brand split (green `#006E33` brand/status,
  blue `#1D68BB` interaction) via tokens; Plus Jakarta Sans UI / IBM Plex Mono numbers. No hardcoded values.
- *Done when:* layout matches DS tokens, atomic structure honored, legible on a phone viewport.

---

## WAVE 3 — Verification & close (SEQUENTIAL)

**T13 — Acceptance run (`verification-before-completion`)**
- Run the §10 acceptance criteria + §14 Phase 2 scenario locations against the deployed URL:
  Fresno CA (≥4 cards), Honolulu HI (coverage msg), Phoenix AZ Aug (heat + early-start), Salinas CA
  (frost), Seattle WA (spray-hold + irrigation-skip). Confirm time-to-first-card <10s.
- **Also verify:** ET₀-driven irrigation calls use inches (spot-check a value), and DS adherence (no
  hardcoded colors/type; tokens used).
- *Done when:* every P0 "Done when" in §10 passes; no hard-coded numbers; all cards carry a real number.

**T14 — Review & finish (`requesting-code-review` → `finishing-a-development-branch`)**
- Two-stage review (spec compliance + DS adherence, then quality) across the branch, apply feedback, merge.

---

## Fan-out summary (what each agent gets)

| Wave | Tasks | Parallel? | Agents | Skill driving it |
|---|---|---|---|---|
| 0 | T0.0, T0.1 | No | 1 | subagent-driven-development (setup + smoke tests) |
| 1 | T1–T9, T12 | **Yes** | up to 10 | dispatching-parallel-agents + TDD (+ seso-design for T7–T9), each in its own worktree |
| 2 | T10, T11 | No | 1–2 | subagent-driven-development (+ seso-design for T11) |
| 3 | T13, T14 | No | 1 | verification-before-completion, code-review, finishing-branch |

**Demo narration:** Wave 0 = "here's the approved plan, the contract, and green smoke tests." Wave 1 =
open Agent View (Ctrl+T) and show ~10 implementers building modules simultaneously in isolated
worktrees. Wave 2/3 = integration, the live Fresno demo, and replaying a subagent transcript.

**Risks / gotchas captured for the agents**
- The forecast object schema (Wave 0) is the single point of coupling — lock it before fan-out, and it
  expresses ET₀ in **inches**.
- ET₀ mm→inch (÷25.4) happens once in T2; never compare raw mm to inch thresholds (Memo gotcha 1).
- Run the CORS smoke test (T0.0) before fanning out (Memo gotcha 2).
- Disambiguate towns by population (T1, Memo gotcha 3).
- `index.html` and `main.js` are shared; never let a Wave-1 agent edit them.
- All UI work builds on the Seso Design System tokens/atoms — no hardcoded styling; load the
  `seso-design` skill for T7, T8, T9, T11.
- Don't parallelize T10 — integration needs whole-picture reasoning.

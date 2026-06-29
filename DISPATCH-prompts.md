# Dispatch prompts — copy/paste per wave

Paste each block into Claude Code (with the Superpowers plugin installed) in order. Wait for a wave
to merge before starting the next. Blocks reference `PLAN-Phase1-parallel-build.md`,
`PRD-Farm-Weather-Advisor.md`, `Tool-Validation-Memo.md`, and the `seso-design-system/` bundle.

> **Everything every agent must honor (from the PRD rev + Tool-Validation-Memo):**
> - No API key (Open-Meteo forecast + geocoding; Vercel gives HTTPS).
> - Use **underscore** param names: `wind_speed_10m`, `weather_code`, `wind_speed_unit=mph` — not legacy spellings.
> - **ET₀ returns millimeters; convert ÷25.4 to inches in the forecast step (T2)** so rules compare in inches. Do not rely on `precipitation_unit` for ET₀.
> - Run the **CORS smoke test as step zero**, before Wave 1 fans out.
> - **Disambiguate town names by `population`.**
> - **CONUS guard on coordinates before any forecast/render.**
> - **Build all UI on the Seso Design System** (`seso-design-system/`): link its `styles.css`/tokens, follow atomic structure, no hardcoded color/type/spacing. Green `#006E33` = brand/status, blue `#1D68BB` = interaction; Plus Jakarta Sans (UI), IBM Plex Mono (numbers).

---

## WAVE 0 — Foundation, contracts & smoke tests (run first, single agent)

```
Use the writing-plans and subagent-driven-development skills. Read PRD-Farm-Weather-Advisor.md,
PLAN-Phase1-parallel-build.md, Tool-Validation-Memo.md, and seso-design-system/README.md +
seso-design-system/project/SKILL.md.

Execute WAVE 0 yourself in the main working tree — do NOT dispatch subagents, this defines the
shared contract everything else depends on.

T0.0 (do FIRST, per the memo):
- CORS smoke test: confirm a single client-side Open-Meteo fetch succeeds from a deployed/preview origin.
- ET₀ unit check: confirm et0_fao_evapotranspiration returns millimeters and that ÷25.4 lands in the
  expected inch range for a known location.
- If CORS fails, STOP and escalate before building anything else.

T0.1:
- index.html shell with mount points #location-form, #forecast-strip, #card-stack, #message. LINK the
  Seso Design System styles.css (and _ds_bundle.js if you'll use DS components) so all modules inherit
  tokens + fonts. Add <script type="module" src="/src/main.js">. No logic.
- src/config.js exporting: CONUS bounding box; every §8 threshold as a named constant; the Open-Meteo
  endpoint with UNDERSCORE param names (wind_speed_10m, weather_code, …); imperial units
  (temperature_unit=fahrenheit, wind_speed_unit=mph, precipitation_unit=inch); the §7 hourly + daily
  field lists; and ET0_MM_TO_IN = 1/25.4.
- src/forecast.js as a documented stub: function signature + JSDoc of the normalized forecast object,
  stating explicitly that ET₀ is expressed in INCHES in that object.
- Empty stub exports for every module in the PLAN architecture so imports resolve.

Done when: index.html loads with zero console errors, the DS styles.css is linked and fonts load,
every import resolves, config.js thresholds match §8 and use underscore param names, and the forecast
schema documents ET₀-as-inches. Commit on a feature branch, then STOP and report the forecast schema
and smoke-test results back to me before Wave 1.
```

---

## WAVE 1 — Pure modules (parallel fan-out, ~10 agents)

```
Use the subagent-driven-development and dispatching-parallel-agents skills, using-git-worktrees for
isolation, and the seso-design skill for any UI task (T7, T8, T9). Read PLAN-Phase1-parallel-build.md,
PRD-Farm-Weather-Advisor.md, Tool-Validation-Memo.md, and the seso-design-system bundle.

Wave 0 is merged, smoke tests passed, and the forecast object schema (ET₀ in inches) is locked. Now
dispatch WAVE 1 as PARALLEL implementer subagents — one per task, each in its own git worktree, each
running test-driven-development (RED→GREEN→REFACTOR). Each agent edits ONLY its own file(s) plus its
tests. No agent may touch index.html or src/main.js. UI agents build from Seso DS tokens/atoms — never
hardcoded values.

Dispatch these in parallel:
- T1  src/geocode.js      — place string → {lat,lon,name,country_code,admin1}|null (no key);
                            DISAMBIGUATE multiple matches by population.
- T2  src/forecast.js     — {lat,lon} → normalized forecast object per the locked schema; UNDERSCORE
                            params; imperial; single call; CONVERT ET₀ mm→inch (× ET0_MM_TO_IN) here so
                            the object exposes ET₀ in inches.
- T3  src/conus.js        — {lat,lon}(+optional country_code/admin1) → bool inside lower-48; primary
                            check is the coordinate bbox (covers typed + geolocation paths).
- T4  src/rules-crops.js  — forecast → crop cards CR-01..04 exactly (incl. counter-rules); ET₀ is
                            already in inches — compare directly to §8 inch thresholds.
- T5  src/rules-crew.js   — forecast → crew cards CW-01..03 (incl. 125°F Heat Danger variant).
- T6  src/prioritize.js   — cards[] → ordered + capped 4–6 per §8 priority ladder; empty-Crops neutral card.
- T7  src/card.js         — card data → DOM node, four §9 fields, built from Seso DS atoms/molecules +
                            tokens; numbers in IBM Plex Mono; tone/length rules enforced. [seso-design]
- T8  src/strip.js        — daily forecast → 7-day strip (day, weather_code icon, high/low °F), DS tokens. [seso-design]
- T9  src/locationInput.js — DS Input + Button atoms: text input + "Use my location" + geolocation-denied/
                            not-found inline fallbacks. [seso-design]
- T12 vercel.json         — static deploy config, no build step, public, HTTPS.

Each subagent must satisfy its task's "Done when" criteria in PLAN §WAVE 1 and ship passing unit tests
against fixtures (T2's tests must cover the ET₀ conversion). After each task, run requesting-code-review
(spec compliance + DS adherence, then quality) before merging that task's worktree. Report which tasks
passed and surface any schema or unit mismatches.
```

---

## WAVE 2 — Integration & styling (sequential, after Wave 1 merges)

```
Use subagent-driven-development, and the seso-design skill for T11. All Wave 1 modules are merged. Read
PLAN-Phase1-parallel-build.md and the seso-design-system bundle.

Do NOT parallelize this wave — integration needs whole-picture reasoning.

T10 — src/main.js: wire the full path: locationInput → geocode → CONUS guard → forecast (ET₀ already in
inches) → (rules-crops + rules-crew → prioritize) → render strip + card stack into the mount points.
Enforce the CONUS guard BEFORE the forecast call. CONUS failures and errors render into #message, never
as cards.
Done when: in a real browser, "Fresno, CA" shows the 7-day strip + ≥4 grounded cards on ONE screen with
no navigation or modal, and "Honolulu, HI" shows the coverage message with no card stack.

T11 — styles.css: layer app styles on the Seso DS styles.css/tokens. Single-column, mobile-legible,
Crops/Crew grouping visually clear, field-readable contrast. Use the brand split via tokens (green
#006E33 brand/status, blue #1D68BB interaction); Plus Jakarta Sans UI / IBM Plex Mono numbers. No
hardcoded color/spacing/type values.
Done when: layout matches DS tokens, atomic structure honored, legible on a phone viewport.

Run requesting-code-review (incl. DS adherence) after each task.
```

---

## WAVE 3 — Verification & close (sequential)

```
Use verification-before-completion, then requesting-code-review and finishing-a-development-branch.
Read PRD-Farm-Weather-Advisor.md §10 and §14, and Tool-Validation-Memo.md.

T13 — Acceptance run against the deployed Vercel URL. Verify every P0 "Done when" in §10 plus these
scenarios:
- Fresno, CA      → ≥4 cards, each backed by a real live number, none hard-coded
- Honolulu, HI    → coverage message, no card stack
- Phoenix, AZ     → heat-risk card fires, early-start flagged
- Salinas, CA     → frost card fires, irrigation defers
- Seattle, WA     → spray-hold + irrigation-skip both fire, crew days reduced
Also verify: ET₀-driven irrigation calls are computed in INCHES (spot-check a value), and Seso Design
System adherence (no hardcoded colors/type; tokens used). Confirm time-to-first-card < 10s. Fail the
wave if any card shows a hard-coded number, ET₀ is compared in mm, or a P0 criterion misses.

T14 — Two-stage code review across the whole branch (spec compliance + DS adherence, then quality).
Apply feedback, then finish and merge the development branch. Report the final public URL.
```

---

### Notes
- These assume Superpowers is installed (`/plugin install superpowers@superpowers-marketplace`) so the
  named skills auto-load via the Skill tool. `seso-design` is the user-invocable skill shipped in
  `seso-design-system/project/SKILL.md`.
- Skill names reflect the current `main` of obra/superpowers — confirm against your installed
  `~/.claude/plugins/.../superpowers/skills/` if a release has renamed any.
- Between waves, eyeball Agent View (Ctrl+T) — Wave 1 is the one worth showing live.

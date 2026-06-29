# Tool Validation Memo — Farm Weather Advisor

**Date:** June 29, 2026 · **Owner:** PM (Michael) · **Purpose:** Confirm, before engineering handoff, that
every external tool the PRD relies on can actually deliver the required functionality — so the build doesn't
stall on missing capability.

**Method:** Checked each dependency against Open-Meteo's live API and current documentation (not from memory).
Confirmed every required forecast variable exists in the forecast endpoint's parameter list, confirmed the
geocoding endpoint's fields and no-key access, and confirmed imperial unit support. Bottom line: **the tool
stack covers the requirements. Two unit/config gotchas to nail down in the first hour of Phase 1, neither a
blocker to start.**

---

## Verdict by tool

### 1. Open-Meteo Forecast API — ✅ Confirmed
Free, **no API key** (key is commercial-only), returns hourly + daily out to 7 days (16 available). Every
variable the rules engine needs is present in the forecast endpoint:

| PRD need | Open-Meteo variable | Status |
|---|---|---|
| Air temp (hourly) | `temperature_2m` | ✅ |
| "Feels like" / heat index | `apparent_temperature` | ✅ |
| Precip (hourly) + daily total | `precipitation`, `precipitation_sum` | ✅ |
| Rain likelihood (confidence language) | `precipitation_probability` | ✅ |
| Wind (spray window) | `wind_speed_10m` | ✅ |
| Irrigation deficit signal | `et0_fao_evapotranspiration` | ✅ |
| Daily high/low (forecast strip) | `temperature_2m_max`, `temperature_2m_min` | ✅ |
| Condition icons | `weather_code` | ✅ |
| Imperial units | `temperature_unit=fahrenheit`, `wind_speed_unit=mph`, `precipitation_unit=inch` | ✅ |

> **Naming note:** Open-Meteo modernized parameter names to underscores (`wind_speed_10m`, `weather_code`). The
> old spellings (`windspeed_10m`, `weathercode`) still work as aliases, but the PRD data contract now uses the
> current names. Engineering should follow suit.

### 2. Open-Meteo Geocoding API — ✅ Confirmed
Separate free, no-key endpoint (`geocoding-api.open-meteo.com/v1/search`). Takes a place name or postal code,
returns `latitude`/`longitude` plus `country_code` and `admin1` (US state). That's everything needed to (a) turn
the operator's typed location into coordinates and (b) enforce the continental-US guard.

### 3. Browser Geolocation ("Use my location") — ✅ Confirmed
Native `navigator.geolocation` returns coordinates directly — no geocoding round-trip for this path. Requires
HTTPS, which Vercel provides by default. The only product decision here is the permission-denied fallback
(already flagged in the PRD).

### 4. Vercel static deploy — ✅ Confirmed
Static front end + client-side API calls needs no backend, no server runtime, and gets HTTPS + a public URL out
of the box. Nothing in the architecture requires a server. Free tier is ample for a demo.

---

## Gotchas to resolve in the first hour of Phase 1 (not blockers to start)

1. **ET₀ comes back in millimeters.** `et0_fao_evapotranspiration` defaults to mm, while every irrigation
   threshold in the rules (§8: ">0.3in/day", ">0.5in/day") is in inches. Engineering must confirm whether
   `precipitation_unit=inch` also converts ET₀; if not, convert mm→inch (÷25.4) before the rule fires. **This is
   the one mismatch that could silently produce wrong irrigation calls** — verify it explicitly. *(Blocking for
   correct irrigation logic; trivial to fix once confirmed.)*

2. **CORS for client-side calls.** Open-Meteo is built for browser use and serves permissive CORS headers, so
   this is expected to pass — but since the whole app depends on it, run a 5-minute fetch test from the deployed
   origin as Phase 1 step zero rather than discovering it late.

3. **Ambiguous town names.** Geocoding can return multiple matches for common names (e.g., "Springfield"). Pick
   the best result by `population` or offer a quick disambiguation — minor, but decide it so the demo doesn't
   silently forecast the wrong Springfield.

---

## What this de-risks

No required capability is missing from the chosen tools. The risks that remain are configuration details (units,
CORS, disambiguation), all cheap to settle, none requiring a different tool or a backend. **Recommendation:
proceed to handoff.** Engineering's first task in Phase 1 should be the ET₀-unit check and the CORS smoke test —
both are listed as blocking open questions in the PRD.

*Validation performed against the Open-Meteo Forecast API and Geocoding API documentation, June 29, 2026.*

/**
 * strip.js — 7-day forecast strip (T8, Wave 1).
 *
 * daily forecast → horizontal 7-day row: day-of-week, weather_code icon,
 * high/low °F. Styled from DS tokens. Spec: PRD §6 (forecast strip).
 *
 * DS constraints:
 *  - No hardcoded hex/rgb in inline styles — all colors via CSS custom properties.
 *  - Numbers (high/low °F) use `seso-mono` class → `font-family: var(--font-mono)`.
 *  - Layout classes are BEM on `.forecast-strip` / `.forecast-strip__*`.
 *  - No React, no bundler — plain DOM elements.
 *
 * @typedef {import('./forecast.js').DailyForecast} DailyForecast
 */

// ---------------------------------------------------------------------------
// WMO weather code → icon SVG mapping (clean line-icon style, ~Lucide).
// Reference: https://open-meteo.com/en/docs (WMO code table)
//
// Groups:
//   0        — Clear sky           → ☀ sun icon
//   1, 2, 3  — Partly / overcast   → ⛅ sun-cloud / cloud
//   45, 48   — Fog                 → 🌫 fog lines
//   51–55    — Drizzle             → 🌦 light rain
//   61–65    — Rain                → 🌧 rain drops
//   71–75    — Snow                → 🌨 snowflake
//   80–82    — Showers             → 🌦 shower
//   85, 86   — Snow showers        → 🌨 snow shower
//   95       — Thunderstorm        → ⛈  lightning
//   96, 99   — Thunderstorm+hail   → ⛈  heavy lightning
// ---------------------------------------------------------------------------

/** @param {string} title Accessible title for the SVG */
function svgClear(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-label="${title}" role="img"><title>${title}</title><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
}

function svgPartlyCloudy(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-label="${title}" role="img"><title>${title}</title><path d="M12 2v2M4.22 4.22l1.42 1.42M2 12h2M19.78 4.22l-1.42 1.42M20 12h2"/><circle cx="10" cy="10" r="3"/><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><path d="M20 17.58A5 5 0 0 1 18 8"/><rect x="2" y="14" width="14" height="7" rx="2.5"/></svg>`;
}

function svgCloudy(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-label="${title}" role="img"><title>${title}</title><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>`;
}

function svgFog(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-label="${title}" role="img"><title>${title}</title><path d="M5 5h3m4 0h9M3 10h11m4 0h1M5 15h5m4 0h7M3 20h3m4 0h11"/></svg>`;
}

function svgDrizzle(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-label="${title}" role="img"><title>${title}</title><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1m0-6v1m8 4v1m0-6v1m-4 4v1m0-6v1"/></svg>`;
}

function svgRain(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-label="${title}" role="img"><title>${title}</title><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6m-8-6v6m4-4v6"/></svg>`;
}

function svgSnow(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-label="${title}" role="img"><title>${title}</title><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01M8 19h.01M12 17h.01M12 21h.01M16 15h.01M16 19h.01"/></svg>`;
}

function svgShower(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-label="${title}" role="img"><title>${title}</title><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19l-1 2m10-2l-1 2M12 19v4"/></svg>`;
}

function svgThunderstorm(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-label="${title}" role="img"><title>${title}</title><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>`;
}

/**
 * Map a WMO weather_code to an inline SVG string + accessible label.
 * Returns { svg: string, label: string }.
 *
 * Full mapping documented here:
 *
 *  Code  | Condition           | Icon fn
 *  ------+---------------------+---------------
 *   0    | Clear sky           | svgClear
 *   1    | Mainly clear        | svgPartlyCloudy
 *   2    | Partly cloudy       | svgPartlyCloudy
 *   3    | Overcast            | svgCloudy
 *  45,48 | Fog                 | svgFog
 *  51–55 | Drizzle             | svgDrizzle
 *  56,57 | Freezing drizzle    | svgDrizzle
 *  61–65 | Rain                | svgRain
 *  66,67 | Freezing rain       | svgRain
 *  71–75 | Snowfall            | svgSnow
 *  77    | Snow grains         | svgSnow
 *  80–82 | Rain showers        | svgShower
 *  85,86 | Snow showers        | svgSnow
 *  95    | Thunderstorm        | svgThunderstorm
 *  96,99 | Thunderstorm+hail   | svgThunderstorm
 *
 * @param {number} code
 * @returns {{ svg: string, label: string }}
 */
export function weatherIcon(code) {
  if (code === 0) return { svg: svgClear('Clear sky'), label: 'Clear sky' };
  if (code === 1) return { svg: svgPartlyCloudy('Mainly clear'), label: 'Mainly clear' };
  if (code === 2) return { svg: svgPartlyCloudy('Partly cloudy'), label: 'Partly cloudy' };
  if (code === 3) return { svg: svgCloudy('Overcast'), label: 'Overcast' };
  if (code === 45 || code === 48) return { svg: svgFog('Fog'), label: 'Fog' };
  if (code >= 51 && code <= 55) return { svg: svgDrizzle('Drizzle'), label: 'Drizzle' };
  if (code === 56 || code === 57) return { svg: svgDrizzle('Freezing drizzle'), label: 'Freezing drizzle' };
  if (code >= 61 && code <= 65) return { svg: svgRain('Rain'), label: 'Rain' };
  if (code === 66 || code === 67) return { svg: svgRain('Freezing rain'), label: 'Freezing rain' };
  if (code >= 71 && code <= 75) return { svg: svgSnow('Snow'), label: 'Snow' };
  if (code === 77) return { svg: svgSnow('Snow grains'), label: 'Snow grains' };
  if (code >= 80 && code <= 82) return { svg: svgShower('Rain showers'), label: 'Rain showers' };
  if (code === 85 || code === 86) return { svg: svgSnow('Snow showers'), label: 'Snow showers' };
  if (code === 95) return { svg: svgThunderstorm('Thunderstorm'), label: 'Thunderstorm' };
  if (code === 96 || code === 99) return { svg: svgThunderstorm('Thunderstorm with hail'), label: 'Thunderstorm with hail' };
  // Fallback — unknown code
  return { svg: svgCloudy('Unknown conditions'), label: 'Unknown conditions' };
}

/** @param {string} isoDate e.g. "2026-07-06" */
function dayAbbrev(isoDate) {
  // Parse as UTC midnight so time zone shifts don't change the date.
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getUTCDay()];
}

/**
 * Render the 7-day forecast strip.
 *
 * Returns a <div class="forecast-strip"> containing 7 <div class="forecast-strip__day">
 * children, one per forecast day. Each day column contains:
 *   - .forecast-strip__label  — day-of-week abbreviation (e.g. "Mon")
 *   - .forecast-strip__icon   — inline SVG icon mapped from weather_code
 *   - .forecast-strip__temps  — high and low °F in IBM Plex Mono (.seso-mono)
 *
 * All colors, spacing, radii, and font families come from DS CSS custom properties
 * (--surface, --border, --text-body, --font-mono, --space-*, --radius-md, etc.).
 * No hex/rgb is written inline.
 *
 * @param {DailyForecast} daily
 * @param {Document} [doc] — injectable document for testing; defaults to globalThis.document
 * @returns {HTMLElement}
 */
export function renderStrip(daily, doc = globalThis.document) {
  if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {
    throw new Error('renderStrip: not implemented for empty or invalid DailyForecast');
  }
  const len = daily.time.length;

  // Root container
  const strip = doc.createElement('div');
  strip.classList.add('forecast-strip');
  strip.setAttribute('role', 'list');
  strip.setAttribute('aria-label', '7-day forecast');

  for (let i = 0; i < len; i++) {
    const col = doc.createElement('div');
    col.classList.add('forecast-strip__day');
    col.setAttribute('role', 'listitem');

    // ── Day label ────────────────────────────────────────────────────────────
    const label = doc.createElement('span');
    label.classList.add('forecast-strip__label');
    label.textContent = dayAbbrev(daily.time[i]);
    col.appendChild(label);

    // ── Weather icon ─────────────────────────────────────────────────────────
    const { svg, label: iconLabel } = weatherIcon(daily.weather_code[i]);
    const iconWrap = doc.createElement('span');
    iconWrap.classList.add('forecast-strip__icon', 'weather-icon');
    iconWrap.dataset.weatherCode = String(daily.weather_code[i]);
    iconWrap.setAttribute('aria-label', iconLabel);
    // innerHTML parses the inline SVG markup into real DOM nodes. textContent
    // would render the markup as literal text in a browser (visible "<svg…>").
    iconWrap.innerHTML = svg;
    col.appendChild(iconWrap);

    // ── Temps wrapper ─────────────────────────────────────────────────────────
    const temps = doc.createElement('div');
    temps.classList.add('forecast-strip__temps');

    // High
    const high = doc.createElement('span');
    high.classList.add('forecast-strip__high', 'seso-mono');
    high.dataset.numeric = '';
    high.setAttribute('aria-label', `High ${daily.temperature_2m_max[i]}°F`);
    high.textContent = `${daily.temperature_2m_max[i]}°`;
    temps.appendChild(high);

    // Low
    const low = doc.createElement('span');
    low.classList.add('forecast-strip__low', 'seso-mono');
    low.dataset.numeric = '';
    low.setAttribute('aria-label', `Low ${daily.temperature_2m_min[i]}°F`);
    low.textContent = `${daily.temperature_2m_min[i]}°`;
    temps.appendChild(low);

    col.appendChild(temps);
    strip.appendChild(col);
  }

  return strip;
}

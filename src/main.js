/**
 * main.js — App entry point / glue (T10, Wave 2).
 *
 * Wires the full end-to-end flow:
 *   locationInput (geocode inside) → CONUS guard → forecast →
 *   (crops + crew → prioritize) → render strip + card stack
 *
 * Designed for unit-testability: `handleResolvedLocation` accepts a `ctx`
 * object carrying DOM mount points + injected module functions so tests can
 * supply fakes without any network or real browser. `initApp` is the browser
 * entry and auto-runs only when a real DOM with the expected mount points is
 * present (guards prevent crashes under node --test).
 */

import { mountLocationInput } from './locationInput.js';
import { isInConus as _isInConus } from './conus.js';
import { getForecast as _getForecast } from './forecast.js';
import { cropCards as _cropCards } from './rules-crops.js';
import { crewCards as _crewCards } from './rules-crew.js';
import { prioritize as _prioritize } from './prioritize.js';
import { renderCard as _renderCard } from './card.js';
import { renderStrip as _renderStrip } from './strip.js';

// ─── Mount-point selectors ────────────────────────────────────────────────────

export const MOUNT_POINTS = Object.freeze({
  locationForm: '#location-form',
  forecastStrip: '#forecast-strip',
  cardStack: '#card-stack',
  message: '#message',
});

// ─── Message-state helper ─────────────────────────────────────────────────────

const MSG_CLASSES = ['app__message--error', 'app__message--notice', 'app__message--info'];

/**
 * Set the #message element to display `text` with the given state class.
 * Removes any previously applied state classes first so only one is active.
 * @param {HTMLElement} el      the #message element
 * @param {string}      text    message text to display
 * @param {'error'|'notice'|'info'} state  styling hook for T11
 */
function setMessage(el, text, state) {
  MSG_CLASSES.forEach(c => el.classList.remove(c));
  el.classList.add(`app__message--${state}`);
  el.textContent = text;
}

/**
 * Clear the #message element: remove all state classes and blank the text.
 * @param {HTMLElement} el  the #message element
 */
function clearMessage(el) {
  MSG_CLASSES.forEach(c => el.classList.remove(c));
  el.textContent = '';
}

// ─── Core handler (pure-ish, testable via injected ctx) ───────────────────────

/**
 * Handle a resolved location from locationInput.
 *
 * @param {{ lat: number, lon: number, name?: string, country_code?: string, admin1?: string }} loc
 * @param {{
 *   messageEl:      HTMLElement,
 *   forecastStripEl: HTMLElement,
 *   cardStackEl:    HTMLElement,
 *   isInConus:      (loc: object) => boolean,
 *   getForecast:    (coords: {lat: number, lon: number}) => Promise<object>,
 *   cropCards:      (forecast: object) => object[],
 *   crewCards:      (forecast: object) => object[],
 *   prioritize:     (cards: object[]) => object[],
 *   renderCard:     (card: object) => HTMLElement,
 *   renderStrip:    (daily: object) => HTMLElement,
 * }} ctx
 */
export async function handleResolvedLocation(loc, ctx) {
  const {
    messageEl,
    forecastStripEl,
    cardStackEl,
    isInConus,
    getForecast,
    cropCards,
    crewCards,
    prioritize,
    renderCard,
    renderStrip,
  } = ctx;

  // Step 1: Reset UI for new search (PRD §6)
  clearMessage(messageEl);
  forecastStripEl.children.length = 0; // clear via property for fake DOM compat
  forecastStripEl.innerHTML = '';
  cardStackEl.children.length = 0;
  cardStackEl.innerHTML = '';

  // Step 2: CONUS guard — MUST run before any forecast call
  if (!isInConus(loc)) {
    setMessage(
      messageEl,
      'Farm Weather Advisor currently covers the continental US — try a location in the lower 48',
      'notice',
    );
    return;
  }

  // Step 3: Show loading hint while forecast is in flight
  setMessage(messageEl, 'Loading this week’s forecast…', 'info');

  // Step 4: Fetch forecast — throw on failure
  let forecast;
  try {
    forecast = await getForecast({ lat: loc.lat, lon: loc.lon });
  } catch (_err) {
    setMessage(
      messageEl,
      "Couldn't load the forecast — check your connection and try again.",
      'error',
    );
    return;
  }

  // Step 5: Build prioritized card list
  const combined = [...cropCards(forecast), ...crewCards(forecast)];
  const ordered = prioritize(combined);

  // Step 6: Render strip and cards
  const stripEl = renderStrip(forecast.daily);
  forecastStripEl.appendChild(stripEl);

  for (const card of ordered) {
    cardStackEl.appendChild(renderCard(card));
  }

  // Step 7: Clear message on success (no leftover error/loading text)
  clearMessage(messageEl);
}

// ─── Browser entry ────────────────────────────────────────────────────────────

/**
 * Initialise the app in a real browser environment. Queries all mount points,
 * mounts locationInput, and wires handleResolvedLocation. Safe to import in
 * tests — the auto-run guard prevents execution under node --test.
 *
 * @param {{ isInConus?, getForecast?, cropCards?, crewCards?, prioritize?, renderCard?, renderStrip?, mountLocationInput? }} [deps]
 *        Optional dependency overrides; production code omits this.
 */
export function initApp(deps = {}) {
  if (typeof document === 'undefined') return;

  const messageEl      = document.querySelector(MOUNT_POINTS.message);
  const forecastStripEl = document.querySelector(MOUNT_POINTS.forecastStrip);
  const cardStackEl    = document.querySelector(MOUNT_POINTS.cardStack);
  const locationFormEl = document.querySelector(MOUNT_POINTS.locationForm);

  // All four mount points must exist — if any is missing the shell is wrong;
  // bail out rather than crash with a confusing TypeError.
  if (!messageEl || !forecastStripEl || !cardStackEl || !locationFormEl) return;

  const ctx = {
    messageEl,
    forecastStripEl,
    cardStackEl,
    isInConus:   deps.isInConus   ?? _isInConus,
    getForecast: deps.getForecast ?? _getForecast,
    cropCards:   deps.cropCards   ?? _cropCards,
    crewCards:   deps.crewCards   ?? _crewCards,
    prioritize:  deps.prioritize  ?? _prioritize,
    renderCard:  deps.renderCard  ?? _renderCard,
    renderStrip: deps.renderStrip ?? _renderStrip,
  };

  const mountFn = deps.mountLocationInput ?? mountLocationInput;
  mountFn(locationFormEl, (loc) => { void handleResolvedLocation(loc, ctx); });
}

// ─── Auto-run guard ───────────────────────────────────────────────────────────
// Only invoke initApp when a real browser DOM is present with all mount points.
// Importing this module under `node --test` must never crash.

if (
  typeof document !== 'undefined' &&
  document.querySelector(MOUNT_POINTS.message) !== null
) {
  initApp();
}

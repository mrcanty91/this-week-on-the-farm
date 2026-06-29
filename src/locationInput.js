/**
 * locationInput.js — Location entry + geolocation (T9, Wave 1). WAVE 0: STUB.
 *
 * DS Input + Button atoms: text input + "Use my location". Emits a resolved
 * location; handles geolocation-denied and not-found with inline messages (no
 * blank screen). Spec: PRD §5, §6 ([ENG FLAG] geolocation fallback).
 *
 * Load the `seso-design` skill before implementing in Wave 1.
 *
 * @typedef {import('./geocode.js').GeocodeResult} GeocodeResult
 */

/**
 * Mount the location input into a host element.
 * @param {HTMLElement} hostEl                       mount point (#location-form)
 * @param {(loc: {lat: number, lon: number, name?: string}) => void} onResolve
 *        called with resolved coordinates from either entry path
 * @returns {void}
 */
export function mountLocationInput(hostEl, onResolve) {
  void hostEl;
  void onResolve;
  throw new Error('not implemented: mountLocationInput (Wave 1 / T9)');
}

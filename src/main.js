/**
 * main.js — App entry point / glue (T10, Wave 2). WAVE 0: STUB.
 *
 * The shell (index.html) loads this as a module. In Wave 2 this wires:
 *   locationInput → geocode → CONUS guard → forecast → (crops+crew → prioritize)
 *   → render strip + card stack into the mount points; CONUS-fail/error paths
 *   render #message, not cards.
 *
 * WAVE 0: import every module so the contract resolves end-to-end and the shell
 * loads with zero console errors. No logic is invoked yet.
 */

import './config.js';
import { getForecast } from './forecast.js';
import { geocode } from './geocode.js';
import { isInConus } from './conus.js';
import { cropCards } from './rules-crops.js';
import { crewCards } from './rules-crew.js';
import { prioritize } from './prioritize.js';
import { renderCard } from './card.js';
import { renderStrip } from './strip.js';
import { mountLocationInput } from './locationInput.js';

// Mount points owned by the shell (index.html). Referenced here so the contract
// between shell and glue is explicit; wiring lands in Wave 2 (T10).
export const MOUNT_POINTS = Object.freeze({
  locationForm: '#location-form',
  forecastStrip: '#forecast-strip',
  cardStack: '#card-stack',
  message: '#message',
});

// Keep Wave-1 entry points referenced so imports resolve and tree-shakers/linters
// see them as used. Invoked for real in Wave 2.
export const MODULES = Object.freeze({
  getForecast,
  geocode,
  isInConus,
  cropCards,
  crewCards,
  prioritize,
  renderCard,
  renderStrip,
  mountLocationInput,
});

console.info('[Farm Weather Advisor] WAVE 0 shell loaded — module contract resolved.');

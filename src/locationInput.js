/**
 * locationInput.js — Location entry + geolocation (T9, Wave 1).
 *
 * Renders into a host element:
 *   - DS-styled text Input + submit Button
 *   - "Use my location" secondary Button
 *   - Inline message area (errors, not-found, prompts)
 *
 * Both paths call onResolve({lat, lon, name?}) with resolved coordinates.
 * Never blanks the screen on error — shows inline messages and keeps the
 * typed path live.
 *
 * Spec: PRD §5 (user stories 2, 8) and §6 ([ENG FLAG] geolocation denial
 * fallback + ambiguous/not-found handling).
 *
 * DS tokens used (vanilla DOM, NOT React):
 *   --action / --action-text / --action-hover  (buttons)
 *   --border / --border-strong                 (input border)
 *   --radius-md                                (inputs, primary button — 8px)
 *   --radius-sm                                (secondary button)
 *   --field-height / --control-height          (sizing)
 *   --surface / --surface-sunken               (backgrounds)
 *   --text-body / --text-muted / --text-placeholder (text)
 *   --danger / --danger-bg                     (error messages)
 *   --focus-ring / --ring                      (focus)
 *   --space-2 / --space-3 / --space-4          (spacing)
 *   --duration-fast / --ease-standard          (transitions)
 *   --shadow-xs                                (input lift)
 *   --font-sans                                (typography)
 *   --text-base / --text-sm                    (font sizes)
 *   --weight-semibold                          (button weight)
 *
 * @typedef {import('./geocode.js').GeocodeResult} GeocodeResult
 */

import { geocode as _geocode } from './geocode.js';

// ─── DS token helpers (applied via element.style.setProperty or inline) ──────

/**
 * Apply an object of CSS custom-property pairs (token references) to a node.
 * This keeps the visual layer entirely in token-land — no raw colour literals.
 * @param {HTMLElement} el
 * @param {Record<string, string>} props
 */
function applyTokenStyle(el, props) {
  for (const [key, val] of Object.entries(props)) {
    if (key.startsWith('--')) {
      el.style.setProperty(key, val);
    } else {
      el.style[key] = val;
    }
  }
}

/**
 * Create and style a native <input> element to visually match the DS Input atom:
 * 40px, hairline border (--border-strong), blue focus ring (--ring), 8px radius
 * (--radius-md), Plus Jakarta Sans via --font-sans.
 */
function createDsInput(placeholder) {
  const wrapper = document.createElement('div');
  wrapper.className = 'seso-input';
  applyTokenStyle(wrapper, {
    display: 'flex',
    alignItems: 'center',
    height: 'var(--field-height)',
    padding: '0 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    boxSizing: 'border-box',
    transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
    flex: '1',
  });

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  applyTokenStyle(input, {
    flex: '1',
    minWidth: '0',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-base)',
    color: 'var(--text-body)',
  });
  input.setAttribute('aria-label', placeholder);

  wrapper.appendChild(input);
  return { wrapper, input };
}

/**
 * Create a DS Button atom (native <button>). Variant controls visual style.
 *   primary   — action blue fill (--action / --action-text)
 *   secondary — white fill with hairline border
 * @param {string} label
 * @param {'primary'|'secondary'} variant
 */
function createDsButton(label, variant = 'primary') {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.className = `seso-btn seso-btn--${variant}`;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: variant === 'primary' ? 'var(--field-height)' : 'var(--control-height)',
    padding: '0 var(--space-4)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-base)',
    fontWeight: 'var(--weight-semibold)',
    lineHeight: '1',
    whiteSpace: 'nowrap',
    borderRadius: variant === 'primary' ? 'var(--radius-md)' : 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'background var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast)',
  };

  const variantStyle =
    variant === 'primary'
      ? {
          background: 'var(--action)',
          color: 'var(--action-text)',
          border: '1px solid var(--action)',
        }
      : {
          background: 'var(--surface)',
          color: 'var(--text-body)',
          border: '1px solid var(--border-strong)',
        };

  applyTokenStyle(btn, { ...baseStyle, ...variantStyle });
  return btn;
}

/**
 * Create the inline message area. Initially hidden (empty textContent).
 * Caller sets .textContent and toggles the DS error / info class.
 */
function createMessageEl() {
  const el = document.createElement('div');
  el.className = 'seso-location-msg';
  applyTokenStyle(el, {
    fontSize: 'var(--text-sm)',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-sm)',
    marginTop: 'var(--space-2)',
    display: 'none',
  });
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'polite');
  return el;
}

/**
 * Show a message in the message area with DS error or info styling.
 * @param {HTMLElement} msgEl
 * @param {string} text
 * @param {'error'|'info'} kind
 */
function showMessage(msgEl, text, kind = 'error') {
  msgEl.textContent = text;
  if (kind === 'error') {
    applyTokenStyle(msgEl, {
      color: 'var(--danger)',
      background: 'var(--danger-bg)',
      border: '1px solid var(--danger)',
      display: 'block',
    });
  } else {
    applyTokenStyle(msgEl, {
      color: 'var(--text-muted)',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border)',
      display: 'block',
    });
  }
}

/** Clear the message area (hide it). */
function clearMessage(msgEl) {
  msgEl.textContent = '';
  applyTokenStyle(msgEl, { display: 'none' });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Mount the location input into a host element.
 *
 * @param {HTMLElement} hostEl                       mount point (#location-form)
 * @param {(loc: {lat: number, lon: number, name?: string}) => void} onResolve
 *        called with resolved coordinates from either entry path
 * @param {{ geocode?: Function, geolocation?: object }} [deps]
 *        dependency-injection shim; defaults to real browser/module values.
 *        deps.geocode    — (place: string) => Promise<GeocodeResult|null>
 *        deps.geolocation — object with getCurrentPosition(success, error)
 * @returns {void}
 */
export function mountLocationInput(hostEl, onResolve, deps = {}) {
  // Guard: requires a DOM (browser or test fake). Keeps contract.test.js Wave-0
  // line intact — it calls without a fake document, so the guard fires there.
  if (typeof document === 'undefined') {
    throw new Error('not implemented: mountLocationInput requires a DOM environment');
  }

  const geocodeFn = deps.geocode ?? _geocode;
  const geolocation = deps.geolocation ?? globalThis.navigator?.geolocation;

  // ── Root container ──────────────────────────────────────────────────────
  const root = document.createElement('div');
  root.className = 'seso-location-input';
  applyTokenStyle(root, {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  });

  // ── Row 1: text input + submit button ───────────────────────────────────
  const row = document.createElement('div');
  row.className = 'seso-location-row';
  applyTokenStyle(row, {
    display: 'flex',
    gap: 'var(--space-3)',
    alignItems: 'stretch',
  });

  const { wrapper: inputWrapper, input } = createDsInput('Town, region or zip code');
  const submitBtn = createDsButton('Search', 'primary');

  row.appendChild(inputWrapper);
  row.appendChild(submitBtn);

  // ── Row 2: geolocation button ────────────────────────────────────────────
  const geoBtn = createDsButton('Use my location', 'secondary');

  // ── Message area ─────────────────────────────────────────────────────────
  const msgEl = createMessageEl();

  // ── Append all to root ──────────────────────────────────────────────────
  root.appendChild(row);
  root.appendChild(geoBtn);
  root.appendChild(msgEl);
  hostEl.appendChild(root);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /** Handle the "Use my location" geolocation path. */
  function handleGeoClick() {
    if (!geolocation) {
      showMessage(msgEl, 'Geolocation is not supported — type a place instead.', 'error');
      return;
    }

    geolocation.getCurrentPosition(
      (pos) => {
        clearMessage(msgEl);
        onResolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (_err) => {
        showMessage(
          msgEl,
          'Location access denied — type a place instead.',
          'error',
        );
      },
    );
  }

  /** Handle the typed-input + submit path. */
  async function handleSubmit() {
    const place = input.value.trim();
    if (!place) {
      showMessage(msgEl, 'Enter a place name to search.', 'info');
      return;
    }
    clearMessage(msgEl);
    const result = await geocodeFn(place);
    if (!result) {
      showMessage(msgEl, "Couldn't find that place — try another.", 'error');
      return;
    }
    onResolve({ lat: result.lat, lon: result.lon, name: result.name });
  }

  geoBtn.addEventListener('click', handleGeoClick);
  submitBtn.addEventListener('click', handleSubmit);
}

# Seso Design System

A design system extracted from **Seso** (sesolabor.com) — the all-in-one
employee-management platform for U.S. agriculture. Built to let design agents
produce on-brand interfaces, screens, and assets for the Seso product and a
"tool we're planning to build" on top of it, organized in an **Atomic Design**
structure (Atoms → Molecules → Organisms → UI kits).

---

## 1 · Company & product context

**Seso, Inc.** — *"Run your season with Seso."* The all-in-one system for
farmers to hire, manage, and retain a reliable agricultural workforce. Seso
serves customers in 50 states, including 35 of the top 100 ag employers, and is
the USDA's Technical Assistance provider for the Farm Labor Stabilization &
Protection Pilot Program.

**Products / solution areas (the "Solutions" menu):**
- **Digital Onboarding** — compliant onboarding for H-2A & domestic workers (I-9, W-4, custom packets, E-Verify integration).
- **HR for Agriculture** — modern HR platform; employee data & operations in one place.
- **H-2A Filing & Compliance** — software + legal resources for the H-2A visa process.
- **Payroll for Ag** — self-serve & managed payroll built for agriculture.
- **Paycards** — banking/remittance for the workforce (no paper checks).
- **H-2A Worker Services** — Monterrey, MX team handling consulate scheduling, recruiting, logistics.

**Two audiences / two surfaces:** the **employer product** (`app.sesolabor.com`
— the dark-sidebar SaaS this kit recreates) and the **worker app** (mobile,
bilingual EN/ES). Domain language is ag-labor & immigration compliance:
*contracts, crews, H-2A, I-94, USCIS petition, consulate, audit file, pay period.*

### Sources used
- **Marketing site:** https://www.sesolabor.com/ (built on Framer). Hero, solution sections, product screenshots, and footer copy were read here.
- **Product screenshots** (from the marketing site, saved to `assets/`): onboarding table, worker profile (HR), contract detail (H-2A), payroll draft. These are the source of truth for the app UI recreation.
- **App (not directly accessible):** https://app.sesolabor.com
- No Figma file or codebase was provided. Colors, type, and chrome were sampled
  directly from the saved screenshots and the brand logo. **If a Figma/codebase
  exists, share it** — it would sharpen type, icon, and spacing fidelity.

---

## 2 · Content fundamentals (voice & tone)

Seso's copy is **plain-spoken, confident, and outcome-first** — written for busy
ag operators, not technologists.

- **Person:** addresses the customer as **"you / your"** ("Run *your* season",
  "manage *your* employee data"). Refers to itself as "Seso" or "we".
- **Casing:** **sentence case** for headings and buttons ("Talk to our team",
  "Generate audit file"). Solution labels use Title Case ("Digital Onboarding").
  Tiny eyebrow labels above sections are UPPERCASE ("SOFTWARE", "SOFTWARE & SERVICE").
- **Tone:** practical, reassuring, anti-bureaucratic. Names the pain
  ("Say goodbye to spreadsheets and filing cabinets") then the outcome.
- **Quantified proof:** leans on hard numbers — *"Reduce time to onboard by 86%",
  "automate over 70% of admin tasks", "eliminate time spent on payroll by 60%."*
- **Verbs:** action-led — *hire, manage, retain, onboard, file, automate,
  streamline, simplify.*
- **No emoji.** No exclamatory hype. No jargon beyond the necessary compliance
  vocabulary (H-2A, I-9, E-Verify), which is used precisely.
- **Bilingual:** English / Español toggle; worker-facing surfaces are bilingual.
- **Example microcopy:** "Talk to an expert", "Send link", "Open packet",
  "Preview payroll", "Generate audit file", "On Contract".

---

## 3 · Visual foundations

**Overall vibe:** clean, trustworthy, modern enterprise SaaS with an
agricultural warmth. Lots of white space, hairline structure, restrained color.
The product reads **flat and orderly** — it leans on borders and tints far more
than shadow.

### Color
- **Brand green `#006E33`** — the identity color (logo, H-2A badges, success
  checks, marketing CTAs). Deep, forest/agricultural green (sampled exactly).
- **Action blue `#1D68BB`** — the *product's* primary action + link color
  (Save, Preview payroll, "Generate audit file", row links, tab underline).
  A deliberate split: **green = brand/identity & status, blue = interaction.**
- **Navy `#071F2F`** — the app sidebar / dark chrome; near-black with a teal
  cast. Active nav rows lighten to `#142A3A`.
- **Cool slate neutrals** — text `#181C20`→`#79828B`, borders `#E2E6E9`/`#ECEEF0`,
  surfaces white on a faint `#F9FAFA` page.
- **Semantic status:** success green, amber warning (gold `#EAB308` glyph),
  red danger, blue info, gray "pending/delivered".
- See `tokens/colors.css`. Base ramps + semantic aliases (`--brand`, `--action`,
  `--text-body`, `--surface`, `--border`, …).

### Type
- **Plus Jakarta Sans** (brand + UI) — friendly geometric grotesque echoing the
  rounded logo wordmark; weights 400–800. Headlines are heavy (700–800) and
  slightly tight (`-0.01/-0.02em`).
- **IBM Plex Mono** (data) — IDs, case numbers, currency, hours, with tabular
  numerals. The product is data-dense, so a mono/tabular face matters.
- ⚠️ **Font substitution:** these are Google-Fonts approximations of Seso's
  licensed brand typeface, which couldn't be extracted from the Framer site.
  Swap real files into `assets/fonts/` + `tokens/fonts.css` when available.
- Scale tuned for a dense UI: body 14px default, table cells 13px, page titles
  28–36px, marketing display 48–60px. See `tokens/typography.css`.

### Spacing & layout
- **4px base grid**; most rhythm is 8–24px. Fixed chrome: sidebar **264px**,
  top bar **64px**, form fields **40px**. Content centers in a ~1100px column.
  See `tokens/spacing.css`.

### Shape, borders & elevation
- **Soft radii** echoing the rounded logo pill: inputs/buttons **8px**, panels
  **12px**, status pills/capsule **999px**, avatars rounded-square or circle.
- **Hairline borders** (`#E2E6E9` / `#ECEEF0`) do most of the structural work.
- **Shadows are subtle and cool-tinted** (`rgba(7,31,47,…)`), used sparingly —
  cards sit on `--shadow-xs`; only overflow menus/modals go heavier. See `tokens/shape.css`.

### Backgrounds & imagery
- App backgrounds are **solid white / faint gray** — no gradients, no patterns,
  no texture in the product. Marketing uses **solid brand-green fills** and
  **warm, real photography** of farms, fields, and workers (natural daylight,
  earthy greens/ambers — not cool or B&W). No stock-art illustration system.
- The one "illustration" is the logomark itself (sprout/sun over field furrows).

### Motion, hover & press
- **Quick, no bounce.** Transitions ~120–180ms, ease-out on enter
  (`--ease-standard`, `--ease-out`). Fades and small color shifts — not large
  movement, no decorative looping animation.
- **Hover:** buttons darken one step (blue `#1D68BB`→`#14538F`); secondary
  buttons get a faint gray fill; nav rows lighten; links underline.
- **Press:** darken further; no scale/shrink.
- **Focus:** 3px soft blue ring (`--ring`).
- **Transparency/blur:** minimal — reserved for overflow menus & modal scrims.

### What cards look like
White surface, **1px `#E2E6E9` border, 12px radius, `--shadow-xs`**. Optional
header (title + subtitle + right-aligned action cluster) divided by a hairline.
Edge-to-edge tables drop body padding (`padded={false}`).

---

## 4 · Iconography

- **System:** clean **line icons, ~1.9px stroke, round caps/joins, 24×24** —
  matching the product's light, friendly UI. Status uses **filled** glyphs
  (green check circle, amber alert) inside otherwise-line contexts.
- **No emoji. No icon font.** Unicode chevrons (`›`) are used as breadcrumb
  separators (matching the app).
- ⚠️ **Substitution:** the kit ships a small inline SVG icon set
  (`ui_kits/seso-app/icons.jsx`, `window.SesoIcons`) that **approximates
  [Lucide](https://lucide.dev)** — the closest open match to Seso's stroke/style.
  Seso's real icon set wasn't extractable from the public site. For new work,
  Lucide via CDN is a safe stand-in until the real set is provided.
- `StatusIndicator` (atom) ships built-in success/warning/pending/info/danger
  glyphs that match the onboarding table exactly.

---

## 5 · Index / manifest

**Foundations**
- `styles.css` — global entry (consumers link this). `@import`s only.
- `tokens/fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `shape.css` · `base.css`
- `guidelines/*.card.html` — foundation specimen cards (Colors, Type, Spacing, Brand).

**Assets** (`assets/`)
- `logo-lockup.png` (mark + wordmark on green), `logomark-white.png`, `logomark-green.png`, `og-brand-green.png`
- `screen-*.png` — real product screenshots used as recreation references
- `worker-face.png` — cropped worker avatar
- `fonts/` — Plus Jakarta Sans (variable) + IBM Plex Mono woff2

**Components** (`components/`, Atomic Design)
- **atoms/** — Button, Badge, StatusIndicator, Avatar, Tag, Input, Select, Checkbox
- **molecules/** — Tabs, StatField, FormField, Breadcrumb, SidebarItem
- **organisms/** — Sidebar, TopBar, Card, DataTable
- Each has `<Name>.jsx` + `<Name>.d.ts` + `<Name>.prompt.md`; one `@dsCard` per directory.

**UI kits** (`ui_kits/`)
- **seso-app/** — interactive recreation of the employer platform (login, workers/onboarding, worker profile, contract, payroll). See its `README.md`.

**`SKILL.md`** — Agent-Skill front-matter for use in Claude Code.

---

## 6 · Caveats & open questions
1. **Fonts are approximations** (Plus Jakarta Sans / IBM Plex Mono). Need the real licensed brand font.
2. **Icons approximate Lucide.** Need Seso's real icon set.
3. **No Figma/codebase** was available — values were sampled from screenshots + the logo. A source file would improve fidelity.
4. **Worker mobile app** is not yet covered — only the employer web product.

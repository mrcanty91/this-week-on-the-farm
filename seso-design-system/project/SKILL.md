---
name: seso-design
description: Use this skill to generate well-branded interfaces and assets for Seso (sesolabor.com — the all-in-one labor-management platform for agriculture: HR, digital onboarding, payroll, paycards, H-2A filing & compliance), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy
assets out and create static HTML files for the user to view. If working on
production code, you can copy assets and read the rules here to become an expert
in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they
want to build or design, ask some questions, and act as an expert designer who
outputs HTML artifacts _or_ production code, depending on the need.

## Quick facts
- **Brand green** `#006E33` (identity, status, marketing CTAs) · **Action blue**
  `#1D68BB` (product buttons, links, focus) · **Sidebar navy** `#071F2F`.
  Split rule: green = brand & status, blue = interaction.
- **Type:** Plus Jakarta Sans (brand + UI), IBM Plex Mono (IDs/currency/data).
  ⚠️ Both are Google-Fonts approximations of the real licensed font.
- **Voice:** plain-spoken, outcome-first, "you/your", sentence case, quantified
  proof, no emoji, bilingual EN/ES.
- **Icons:** clean line set ≈ Lucide (1.9px stroke). ⚠️ approximation.

## Where things are
- `styles.css` — link this one file to inherit all tokens + fonts.
- `tokens/` — color / type / spacing / shape / base CSS custom properties.
- `components/{atoms,molecules,organisms}/` — React primitives (`window.SesoDesignSystem_<hash>`).
- `ui_kits/seso-app/` — interactive recreation of the employer product.
- `guidelines/` — foundation specimen cards.
- `assets/` — logos, fonts, product reference screenshots.

To use a component in plain HTML, link `styles.css` + `_ds_bundle.js`, then
`const { Button } = window.SesoDesignSystem_<hash>` (run the design-system
checker to get the exact namespace).

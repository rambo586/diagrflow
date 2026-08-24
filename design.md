# Design — Diagrflow

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
editorial (methods-journal workbench)

## Macrostructure family
- Marketing pages: Workbench — the live PRISMA figure is the product, not a mock.
- App pages: Workbench — counts worksheet + figure plate.
- Content pages: Long Document (pricing / notes).

## Theme
Paper-white stock, ink primary, warm vermillion only on selection. Display and
body are Geist (variable). Counts use Geist Mono.

Tokens live in `tokens.css`.

## Typography
- Display: Geist, weight 600, style normal
- Body: Geist, weight 400
- Mono (outlier): Geist Mono, weight 400 — `n =` values and balance rows only
- Display tracking: -0.03em
- Type scale anchor: `--text-display` = clamp(2.25rem, 3.6vw + 1rem, 3.35rem)

## Spacing
4-point named scale in `tokens.css`. Pages must use named tokens.

## Motion
- Easings: `--ease-out` cubic-bezier(0.16, 1, 0.3, 1)
- Reveal: none on load; hover is 160ms opacity/transform only
- Reduced-motion: opacity-only, ≤ 150 ms

## Microinteractions stance
- silent success
- hover delay 0 ms on buttons (they are the task)
- no celebratory toasts
- PNG export may show an error string in the figure toolbar

## CTA voice
- Primary: filled `--color-ink`, 3px radius, not a pill
- Secondary: hairline `--color-rule` outline on paper

## Per-page allowances
- Marketing pages MAY show a live `PrismaDiagram` (the actual export).
- App pages MUST NOT use decorative enrichment.
- No invented testimonials, journal names, or usage metrics.

## What pages MUST share
- Wordmark Diagrflow in Newsreader.
- Accent at ≤ 5% of the viewport (primary actions and figure selection only).
- Hairline rules instead of cards-as-architecture.
- Honest “illustrative counts” labelling on every case.

## What pages MAY differ on
- Home is a case catalogue around one live figure.
- Editor is a two-pane worksheet.
- Pricing is a short document, not a tier grid.

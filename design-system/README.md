# Ankle Program — Design System

Ankle Program is a structured ankle-rehabilitation program: a dark-canvas mobile app that
schedules a member's sessions (warm-up, exercises with a prescribed dose, phase tests) and a
light marketing surface that explains the four phases and takes people into the program.

## What this system was built from

Two files were supplied. There was no codebase, Figma file, deck, or logo.

| Source | Kept at | What it settled |
| --- | --- | --- |
| Brand palette sheet (`uploads/fe51893fd9f487a048a5c911b2c60154.jpg`) | `assets/reference/palette-sheet.jpg` | The four exact brand colours: `#171717`, `#F25623`, `#4D4D4D`, `#DEDEDE` |
| Dark booking-app reference (`uploads/c9c05a76243b4d20b16956d9b1e3c9b5.jpg`) | `assets/reference/app-reference.jpg` | The structural vocabulary: near-black canvas, 18px cards, pill time ranges, hatched blocked slots, zero-padded counts, bottom tab bar, one accent-filled tile per screen |

Two decisions worth knowing about, both flagged to the user:

1. **The reference screenshot's accent is yellow; this system uses `#F25623`.** The palette
   sheet is the brand, so the accent role was moved to orange wholesale. Nothing else about
   the reference's layout language was changed.
2. **No fonts and no icon set were supplied.** Archivo / Figtree / JetBrains Mono and Lucide
   are the substitutions. See *Substitutions* below.

## Index

| Path | What's there |
| --- | --- |
| `styles.css` | The single entry point consumers link. `@import` lines only. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `shape.css`, `elevation.css`, `motion.css`, `base.css` |
| `components/core/` | `Button`, `IconButton`, `Badge`, `Chip`, `Card`, `Fab`, `Icon` |
| `components/forms/` | `SearchField`, `TextField`, `Switch`, `SegmentedControl` |
| `components/navigation/` | `TopBar`, `TabBar`, `DateStrip`, `SectionHeader` |
| `components/data/` | `StatCard`, `TimeRangePill`, `SessionCard`, `TimelineSlot`, `ProgressBar`, `Avatar` |
| `ui_kits/app/` | Program app — Today, Program day, Session player, Progress, Coach (`index.html` is click-through) |
| `ui_kits/site/` | Marketing site — Home, Program, Join (`index.html` is click-through) |
| `guidelines/` | 20 specimen cards: colours, type, spacing, elevation, states, motion, scrim, iconography, source material |
| `assets/reference/` | The two supplied source images |
| `SKILL.md` | Agent-skill entry point |

Every component directory holds `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, plus one
`@dsCard` HTML per directory.

**Intentional additions** (not defined by the source, added because the system can't work
without them): `Icon` — a Lucide wrapper, so no one hand-draws glyphs; `SegmentedControl`,
`TextField`, `Switch`, `ProgressBar` — the app reference shows no forms or progress at all,
but neither app nor site can be assembled without them. Everything else maps one-to-one onto
something visible in the reference.

## Content fundamentals

The voice is a clinician's, not a coach's. Plain, second person, load-bearing verbs, no
hype and no motivational filler. It states the rule, then the reason.

- **Person.** "You" for the member, "we" only for the program's decisions. Never "I".
  → *"You move on when the test says so."* / *"Three answers set your starting phase."*
- **Casing.** Sentence case everywhere — headings, buttons, labels, nav. The only uppercase
  is the eyebrow/overline style (`.ap-eyebrow`, 13px, 0.085em) and the wordmark.
- **Length.** Headlines under nine words. Body sentences under twenty. One idea per card.
- **Numbers are specific and always in the copy, never implied.** `3 x 12 · 3s down`,
  `45min · x04 exercises`, `within 10% of the other side`, `Weeks 3–7`. Doses use `x` for
  sets (`3 x 12`) and `x04` for counts, copying the reference's `x02 Services` form.
- **Counts are zero-padded and monospaced:** `06`, `08`, `02`. This is a house tic worth
  keeping — it appears on section headers, badges and notification bubbles.
- **Buttons are verbs with an object.** "Start week 1", "Mark set complete", "Create my plan",
  "Send an update". Never "Submit", "Learn more", "Get started now".
- **Gates, not encouragement.** Progress language is conditional and testable —
  *"Full training, two weeks symptom-free"* — rather than *"Great job, keep going!"*
- **Medical honesty.** Any screen that implies clinical decisions carries a plain line:
  *"Not medical advice. If you cannot weight-bear, see a clinician before starting."*
- **No emoji.** Not in product UI, not in marketing, not in notifications. Status is carried
  by the semantic colours and Lucide glyphs.
- **Punctuation.** Middle dot `·` separates peer facts (`45min · x04 exercises`,
  `Phase 2 · Loading`); arrow `→` joins a time range; en dash for spans (`Weeks 3–7`).
  Avoid em dashes in UI strings.

## Visual foundations

**Palette and mood.** Two scopes off one palette. The default is dark: `#0B0B0B` canvas,
`#1C1C1C` cards, `#DEDEDE` body text. Marketing flips to `.ap-light` — `#F4F4F4` canvas,
white cards, `#171717` text — while heroes and footers stay black. Orange `#F25623` is the
only chromatic colour in the system and it is rationed: one accent-filled card per screen,
the active tab, the selected day, the primary button, the FAB. Green/amber/red exist only
for status (adherence, pain flags, missed sessions) and are derived, not from the sheet.
There are never more than two background colours in one view.

**Type.** Archivo for anything structural — display, headings, big metrics, avatar
initials — set tight (−0.02 to −0.03em) and heavy (700/800). Figtree for UI and body at
15/23 default, 17/26 for reading. JetBrains Mono, tabular, for times, doses, references and
counts: `9:30 am → 10:30 am`, `REF 6790766C`. Three type families, no exceptions; body
measure caps at 66ch.

**Backgrounds.** Flat colour. No gradients as decoration, no patterns, no illustration
style — the only gradients in the system are functional: the bottom protection scrim over
media (`--scrim-bottom`) and the 115° diagonal hatch that marks a blocked timeline slot
(warm-up, prep). No supplied photography, so imagery sits in labelled placeholder blocks;
when real photography arrives it should be warm-neutral and low-contrast so the orange
stays the loudest thing on screen.

**Shape.** 18px is the card radius; 14px for fields; 6–10px for small chrome. Anything
time-like, tappable or countable is a full pill (`999px`) — buttons, chips, time ranges,
badges, day cells, avatars, FAB. Nothing in the system has square corners.

**Cards.** Surface `#1C1C1C`, 1px hairline border at 8% white, `inset 0 1px 0 rgba(255,255,255,.06)`
for the top highlight, and no drop shadow. Depth comes from surface lightness
(`canvas → card → raised`), not shadow. Real shadows are reserved for things that float:
FAB (`--shadow-accent`, an orange-tinted 22px), sheets, menus. In light scope, cards take a
1px `#E2E2E2` border plus the soft two-layer `--shadow-card-light`.

**Borders.** One weight, 1px. Hairline (8% white) inside dark cards, `--ink-700` for
raised chrome, orange for focus and selection. Never a coloured left-border accent stripe.

**Transparency and blur.** Two places only: bars that sit over scrolling content
(`--glass-fill` + `18px` blur) and status tints at 8/16/32% alpha. Body text is never
translucent — use `--text-muted` instead of lowering opacity.

**States.** Hover lightens (`500 → 400`, `card → raised`, ghost to 6% white) and lifts
interactive cards 1px. Press shrinks to `0.97` in 80ms; it never changes colour. Focus is a
2px `--orange-400` ring at 2px offset. Disabled is `opacity: .38` with no colour change.
Selection inverts to white-on-ink for chips, but fills orange for days and tabs.

**Motion.** 140ms for colour and small state, 200ms for toggles and expansion, 320ms for
progress fills, 420ms for sheets, all on `cubic-bezier(.2,.8,.2,1)`. One spring
(`.34,1.42,.64,1`) and it is only for the switch knob. Fades are paired with a small
translate, never used alone; nothing bounces, nothing scales on entry. Everything collapses
to 0ms under `prefers-reduced-motion`.

**Layout.** 16px screen gutter on phone, 32px on web with a 1160px container. 10px between
stacked cards, 16px between sections, 4px base scale. Fixed elements: the 52px top bar
(transparent, no rule), the 64px bottom tab bar on `--surface-sunken`, and the FAB 20px
from the bottom-right — which means scroll containers end with 96px of bottom padding.
Timelines put a 46px mono time gutter down the left edge and align every row to it.

## Iconography

- **Set:** [Lucide](https://lucide.dev) `lucide-static@0.436.0`, stroke weight 2, no fills.
  **This is a substitution** — the supplied material contained no icons.
- **Delivery:** 41 glyphs are inlined in `components/core/Icon.jsx` (`ICON_NAMES` lists them)
  and mirrored as individual files in `assets/icons/lucide/` for non-React consumers. `Icon`
  renders a real `<svg>` with `stroke="currentColor"`, so glyphs inherit their parent's colour,
  need no network, and survive rasterisation. Aliases exist for `more-vertical`, `home`,
  `calendar`, `check-circle`, `alert-triangle`. Need one that isn't bundled? Copy it from
  Lucide into the `GLYPHS` map — never draw one.
- **Sizes:** 16 inline with text, 20 in bars and buttons (default), 22 in the tab bar,
  24 in the FAB. Never scale a glyph to a size that isn't on that list.
- **Vocabulary in use:** `house`, `calendar-days`, `trending-up`, `users`, `bell`, `search`,
  `plus`, `check`, `play`, `arrow-up`/`arrow-down`, `arrow-left`/`arrow-right`,
  `chevron-right`/`chevron-up`/`chevron-down`, `more-vertical`, `menu`, `share`, `timer`,
  `activity`, `footprints`, `lock`, `rotate-ccw`.
- **No emoji, no unicode symbols as icons** — with two deliberate exceptions used as
  typography, not iconography: `→` inside a time-range pill and `·` as a fact separator.
- **No logo was supplied**, so no mark exists in `assets/`. Where a logo would go, set the
  wordmark in Archivo 800 at −0.02em: `ANKLE·PROGRAM`, with the interpunct in
  `--brand-orange`. Do not draw a mark; ask the user for one.

## Substitutions to replace

| Slot | Placeholder in use | Needed |
| --- | --- | --- |
| Display / heading font | Archivo (Google Fonts) | Real brand font files |
| UI / body font | Figtree (Google Fonts) | Real brand font files |
| Mono | JetBrains Mono (Google Fonts) | Confirmation or replacement |
| Icons | Lucide, stroke 2 | The brand's own set, if one exists |
| Logo | Type-set wordmark | SVG logo |
| Photography | Labelled grey placeholder blocks | Real exercise/session imagery |
| Status colours | Derived green/amber/red | Confirmation |

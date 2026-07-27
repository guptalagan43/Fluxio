# design.md
## AI Token Tracker — Design System

> Single source of truth for all visual decisions across the extension popup and website.
> Companion docs: `prd.md` · `architecture.md` · `rules.md` · `phases.md`

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Shape Language](#5-shape-language)
6. [Component Tokens](#6-component-tokens)
7. [Extension Popup Design](#7-extension-popup-design)
8. [Website Design](#8-website-design)
9. [States & Feedback](#9-states--feedback)
10. [Motion](#10-motion)
11. [Icons](#11-icons)
12. [Tailwind Config](#12-tailwind-config)
13. [CSS Custom Properties](#13-css-custom-properties)
14. [Do / Don't](#14-do--dont)

---

## 1. Design Philosophy

**Minimal. Boxy. Warm.**

This is a utility product — not a flashy app. Every design decision serves function. Nothing exists for decoration.

Three principles govern every UI decision:

**Warm neutrals over cool whites.** The palette is earthy and paper-like. Users interact with this extension all day alongside chaotic, high-contrast AI interfaces. The tracker should feel calm and settled by comparison.

**Sharp edges only.** Zero border-radius on containers, cards, panels, and inputs. This is a deliberate choice — it reads as precise and data-forward, like a ledger or a terminal. The only exception is the progress bar fill (pill shape), which exists purely as a usability convention.

**Vertical rhythm and whitespace over decoration.** The website is scroll-based, full-width sections, generous padding. No sticky headers with complex nav. No parallax. No animations that aren't earned. The popup is a compact stack — no tabs, no carousels.

---

## 2. Color Palette

### Primary Palette

All colors are from the specified warm neutral ramp. No other background colors exist in the system.

```
--color-stone-100: #edede9   ← Lightest. Primary background (website body, popup bg)
--color-stone-200: #d6ccc2   ← Borders, dividers, inactive states
--color-stone-300: #f5ebe0   ← Warm white. Section alternates, card surfaces
--color-stone-400: #e3d5ca   ← Mid-tone. Hover states, secondary surfaces
--color-stone-500: #d5bdaf   ← Deepest warm neutral. Active states, strong borders
```

### Text Colors

Text does not use the palette colors as-is. Text uses near-black and mids derived from the palette's brown undertone.

```
--color-text-primary:   #1a1714   ← Near-black with warm tint. Body text, headings
--color-text-secondary: #5a524a   ← Mid-brown. Supporting labels, metadata
--color-text-muted:     #8c8078   ← Light brown. Placeholders, disabled, hints
--color-text-inverse:   #f5ebe0   ← For text on dark/filled backgrounds
```

### Semantic Colors

Semantic colors (success, warning, error) are deliberately muted — they fit within the warm palette rather than clashing with it.

```
--color-success:     #4a7c59   ← Muted olive-green
--color-success-bg:  #eaf0e9   ← Very light green tint

--color-warning:     #8a6a2a   ← Warm amber-brown
--color-warning-bg:  #f5edda   ← Very light amber tint (close to stone-300)

--color-error:       #8a3a3a   ← Muted brick-red
--color-error-bg:    #f0e8e8   ← Very light red tint

--color-budget-ok:   #4a7c59   ← Same as success (< 60% used)
--color-budget-warn: #8a6a2a   ← Same as warning (60–80% used)
--color-budget-over: #8a3a3a   ← Same as error (≥ 80% used)
```

### Accent (single)

There is exactly one accent color used for interactive links, active states, and the primary CTA on the website. It is a deep warm brown — derived from the darkest end of the palette's hue.

```
--color-accent:       #5c4a3a   ← Deep warm brown. Links, focus rings, primary CTA
--color-accent-hover: #3d3028   ← Darker for hover
```

### Full Color Token Reference

| Token | Hex | Used for |
|---|---|---|
| `--color-stone-100` | `#edede9` | Website body bg, popup bg |
| `--color-stone-200` | `#d6ccc2` | Borders, dividers, table lines |
| `--color-stone-300` | `#f5ebe0` | Card surfaces, alternating sections |
| `--color-stone-400` | `#e3d5ca` | Hover states, secondary surfaces |
| `--color-stone-500` | `#d5bdaf` | Active states, strong borders, filled elements |
| `--color-text-primary` | `#1a1714` | All headings and body text |
| `--color-text-secondary` | `#5a524a` | Labels, metadata, sublabels |
| `--color-text-muted` | `#8c8078` | Placeholders, hints, disabled |
| `--color-text-inverse` | `#f5ebe0` | Text on dark/filled backgrounds |
| `--color-accent` | `#5c4a3a` | Links, focus rings, primary CTA bg |
| `--color-accent-hover` | `#3d3028` | CTA hover, link hover |
| `--color-success` | `#4a7c59` | Success text, budget OK |
| `--color-success-bg` | `#eaf0e9` | Success background tint |
| `--color-warning` | `#8a6a2a` | Warning text, budget 60–80% |
| `--color-warning-bg` | `#f5edda` | Warning background tint |
| `--color-error` | `#8a3a3a` | Error text, budget ≥ 80% |
| `--color-error-bg` | `#f0e8e8` | Error background tint |

---

## 3. Typography

### Font Stack

**Primary (UI + Body):** `'IBM Plex Sans', system-ui, -apple-system, sans-serif`

IBM Plex Sans is chosen because:
- Geometric-humanist hybrid — clean enough for data, warm enough for the palette
- Excellent at small sizes (critical for the extension popup)
- Tabular figures available — essential for token/cost counters
- Free on Google Fonts: `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap`

**Mono (numbers, code, token counts):** `'IBM Plex Mono', 'Courier New', monospace`

All token counts, cost figures, and statistical numbers use the mono font. This creates instant visual rhythm in the popup's data-heavy panels and the dashboard tables. Also free on Google Fonts.

```
https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap
```

### Type Scale

A minimal scale — five sizes only. Nothing between them.

| Name | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 48px | 600 | 1.1 | Website hero headline only |
| `heading-1` | 32px | 600 | 1.2 | Website section headings (H2) |
| `heading-2` | 20px | 600 | 1.3 | Card headings, popup section labels |
| `body` | 15px | 400 | 1.6 | All body text, website paragraphs |
| `label` | 13px | 500 | 1.4 | UI labels, badge text, metadata |
| `caption` | 11px | 400 | 1.4 | Popup hints, footer text, timestamps |

### Number Typography

All numeric data (token counts, costs, percentages, dates) uses IBM Plex Mono with tabular figures. This ensures columns align and numbers don't jump width as they update live.

```css
.data-number {
  font-family: 'IBM Plex Mono', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
```

### Type Rules

- **Sentence case always.** No Title Case in UI. No ALL CAPS for labels.
- **No text decoration on hover** for navigation — use color change to `--color-accent` only.
- **Tracking:** Default (`letter-spacing: 0`) for all body text. `-0.01em` for numbers only (tightens mono slightly). No positive tracking (wide-spaced text reads as template-y).
- **Approximate prefix:** All estimated values are prefixed with `~` in the same weight as the number. Never wrap the tilde in a separate span — it is part of the number string.
- **Currency format:** `$0.0042` — always 4 decimal places for cost figures under $0.01, 2 decimal places above. Use `Intl.NumberFormat` to format.

---

## 4. Spacing & Layout

### Spacing Scale

All spacing uses an 8px base grid. The full scale in use:

```
4px   — xs   Tight internal gaps (icon-to-label, badge padding)
8px   — sm   Component internal padding (pill, chip)
12px  — md   Between related elements (label + value pairs)
16px  — lg   Between components in a list (popup row spacing)
24px  — xl   Between sections inside a card or panel
32px  — 2xl  Between cards or major groupings
48px  — 3xl  Section padding (website sections, horizontal padding)
64px  — 4xl  Section vertical padding (website sections top/bottom)
96px  — 5xl  Hero and large section vertical padding
```

### Popup Layout

The extension popup is exactly **320px wide**. Height is flexible — content dictates it, never scroll. All panels stack vertically. No horizontal splits.

```
Popup total width:     320px
Horizontal padding:    16px each side
Content width:         288px
Row height (standard): 40px
Compact row height:    32px
```

### Website Layout

The website uses a full-bleed section-based layout. Sections span 100vw. Content inside sections is constrained to a max-width centered container.

```
Max content width:     1100px
Section h-padding:     48px (desktop), 24px (mobile ≤ 768px)
Section v-padding:     96px (desktop), 64px (mobile)
Narrow column:         640px (used for text-heavy sections: privacy, FAQ body)
```

### Grid

The website uses a 12-column grid for dashboard and feature sections. The extension uses no grid — it is a single-column stack.

```css
/* Website content container */
.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 48px;
}

/* Feature card grid — 3 columns on desktop, 1 on mobile */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px; /* 1px gap creates a border-like grid line effect */
  background-color: var(--color-stone-200); /* the gap color = border color */
}
.feature-grid > * {
  background-color: var(--color-stone-100);
}
```

The `1px gap + background on parent` technique is used throughout for grid layouts. It produces a clean bordered-grid effect without any border CSS on individual cells.

---

## 5. Shape Language

### Zero Radius Rule

**All containers, cards, inputs, buttons, panels, modals, dropdowns, and tooltips have `border-radius: 0`.**

No exceptions except:
1. Progress bar fill — `border-radius: 0` on the track, `border-radius: 0` on the fill too (flat-ended progress bar)
2. Avatar/initials circle — `border-radius: 50%` (functional, not decorative)
3. Focus ring — uses `outline-offset: 2px; outline: 2px solid var(--color-accent)` (native outline, no radius)

This is enforced via a global CSS reset:

```css
*, *::before, *::after {
  border-radius: 0 !important; /* Global zero-radius override */
}

/* Exceptions — applied after the override */
.avatar { border-radius: 50% !important; }
```

### Borders

Borders are always `1px solid` — never 2px except the focus ring outline. They use the stone palette.

```
Default border:   1px solid var(--color-stone-200)   ← Dividers, card outlines
Strong border:    1px solid var(--color-stone-500)   ← Active inputs, selected states
Accent border:    1px solid var(--color-accent)      ← Focus, highlighted row
```

### Dividers

Horizontal dividers between sections inside panels use `border-top: 1px solid var(--color-stone-200)`. No gap or margin above the divider line — it sits flush, then the content below has its own top padding.

---

## 6. Component Tokens

### Button

```
Background (primary):       var(--color-accent)            ← #5c4a3a
Background (primary hover): var(--color-accent-hover)      ← #3d3028
Text (primary):             var(--color-text-inverse)      ← #f5ebe0
Border (primary):           none

Background (secondary):     transparent
Text (secondary):           var(--color-text-primary)
Border (secondary):         1px solid var(--color-stone-500)
Hover (secondary):          background → var(--color-stone-400)

Background (ghost):         transparent
Text (ghost):               var(--color-text-secondary)
Border (ghost):             none
Hover (ghost):              background → var(--color-stone-200)

Background (danger):        transparent
Text (danger):              var(--color-error)
Border (danger):            1px solid var(--color-error)
Hover (danger):             background → var(--color-error-bg)

Height (all buttons):       36px
Padding:                    0 16px
Font:                       IBM Plex Sans, 13px, weight 500
Border-radius:              0 (global rule)
```

### Input

```
Background:         var(--color-stone-300)          ← #f5ebe0
Border:             1px solid var(--color-stone-200)
Border (focus):     1px solid var(--color-accent)   ← replaces default on focus
Text:               var(--color-text-primary)
Placeholder:        var(--color-text-muted)
Height:             36px
Padding:            0 12px
Font:               IBM Plex Sans, 14px, weight 400
Outline on focus:   2px solid var(--color-accent); outline-offset: 0
```

### Card

```
Background:   var(--color-stone-300)          ← Slightly warmer than the page bg
Border:       1px solid var(--color-stone-200)
Padding:      24px
```

On hover (clickable cards only):
```
Background:   var(--color-stone-400)
Border:       1px solid var(--color-stone-500)
```

### Badge / Chip

```
Background:   var(--color-stone-400)
Text:         var(--color-text-secondary)
Padding:      4px 8px
Font:         IBM Plex Sans, 11px, weight 500
Border:       none
Letter-case:  lowercase (intentional — "code", "quick q&a", not "CODE")
```

Status variants:
```
Success chip: bg var(--color-success-bg) · text var(--color-success)
Warning chip: bg var(--color-warning-bg) · text var(--color-warning)
Error chip:   bg var(--color-error-bg)   · text var(--color-error)
```

### Tooltip

```
Background:   var(--color-text-primary)   ← Near-black
Text:         var(--color-text-inverse)   ← Warm white
Padding:      6px 10px
Font:         12px, weight 400
Max-width:    240px
```

### Table (Dashboard)

```
Header row bg:    var(--color-stone-400)
Header text:      var(--color-text-secondary), 12px, weight 500, uppercase: none
Body row bg:      var(--color-stone-300)
Body alt-row bg:  var(--color-stone-100)    ← Subtle stripe
Border between:   1px solid var(--color-stone-200)
Cell padding:     10px 16px
Body text:        var(--color-text-primary), 14px, weight 400
Number cells:     IBM Plex Mono, 13px, tabular-nums, right-aligned
```

### Progress Bar (Budget)

```
Track:          1px solid var(--color-stone-500); background: var(--color-stone-200)
Track height:   8px
Fill (ok):      background: var(--color-success)
Fill (warn):    background: var(--color-warning)
Fill (over):    background: var(--color-error)
Threshold:      ok = < 60%, warn = 60–80%, over = ≥ 80%
Border-radius:  0 (flat ends — consistent with zero-radius rule)
```

### Toggle (Sync, Notifications)

```
Track off:   background: var(--color-stone-400); border: 1px solid var(--color-stone-500)
Track on:    background: var(--color-accent)
Thumb:       background: var(--color-stone-100)
Size:        32px × 18px track; 12px × 12px thumb
```

---

## 7. Extension Popup Design

### Popup Dimensions

```
Width:          320px (fixed)
Min-height:     none (content-driven)
Max-height:     600px (beyond this, content scrolls within the popup)
```

### Popup Background

```
Background:   var(--color-stone-100)   ← #edede9
```

### Popup Structure (top to bottom)

```
┌──────────────────────────────────────┐  ← border-bottom: 1px stone-200
│  HEADER                         16px │
│  [PlatformIcon]  Platform · Model    │
│  [live dot] Active                   │
├──────────────────────────────────────┤  ← border-bottom: 1px stone-200
│  SESSION PANEL                  24px │
│  ~{N} tokens                         │  ← IBM Plex Mono, 24px, text-primary
│  ~${cost}              {duration}    │  ← Mono, 13px, text-secondary
├──────────────────────────────────────┤  ← border-bottom: 1px stone-200
│  SUGGESTION CHIP (conditional)  16px │
│  [code] → Claude Sonnet    [×]       │
│  (expanded hint text below chip)     │
├──────────────────────────────────────┤  ← only if warned
│  CONTEXT WARNING (conditional)  12px │
│  ⚠ This chat is getting long.        │
│  [How to summarize] [Dismiss]        │
├──────────────────────────────────────┤  ← border-bottom: 1px stone-200
│  BUDGET BAR                     16px │
│  ████████░░░░░░  64%                 │
│  $3.20 / $5.00 this week            │
├──────────────────────────────────────┤  ← border-bottom: 1px stone-200
│  TODAY SUMMARY                  16px │
│  Today: ~14,200 tokens · ~$0.24      │
│  [icon] [icon] [icon]                │  ← platform icons used today
├──────────────────────────────────────┤
│  FOOTER                         12px │
│  [View dashboard ↗]         [⚙]      │
│  (or [Sign in] if no JWT)            │
└──────────────────────────────────────┘
```

### Popup Header

```css
.popup-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-stone-200);
  background: var(--color-stone-300);  /* slightly warmer than popup bg */
}

.platform-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.model-name {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 1px;
}
```

### Popup Session Panel

The token counter is the largest text element in the popup. It must be immediately readable.

```css
.session-panel {
  padding: 16px;
  border-bottom: 1px solid var(--color-stone-200);
}

.token-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.session-meta {
  display: flex;
  justify-content: space-between;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: var(--color-text-secondary);
}
```

### Popup Suggestion Chip

```css
.suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: var(--color-stone-400);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* The arrow separator between category and model */
.suggestion-chip .arrow {
  color: var(--color-text-muted);
}

/* Expanded hint — shown below chip on click */
.suggestion-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 8px 0 0 0;
  line-height: 1.5;
  border-top: 1px solid var(--color-stone-200);
  margin-top: 8px;
}
```

### Popup Context Warning

```css
.context-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 16px;
  background: var(--color-warning-bg);
  border-bottom: 1px solid var(--color-stone-200);
  border-left: 3px solid var(--color-warning);  /* accent stripe only */
}

.context-warning p {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 0 6px 0;
}

.context-warning .actions {
  display: flex;
  gap: 8px;
}
```

### Popup Settings Panel

Settings open inline below the footer — no modal, no overlay.

```css
.settings-panel {
  border-top: 1px solid var(--color-stone-200);
  background: var(--color-stone-300);
  padding: 16px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-stone-200);
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-label {
  font-size: 13px;
  color: var(--color-text-primary);
}
```

---

## 8. Website Design

### Website Background

```
Page background: var(--color-stone-100)   ← #edede9
```

All sections sit on this background unless they are an alternating section, which uses `var(--color-stone-300)` (#f5ebe0).

### Navigation

The navigation bar is fixed-position, full-width, minimal.

```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  background: var(--color-stone-100);
  border-bottom: 1px solid var(--color-stone-200);
  display: flex;
  align-items: center;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 48px;
}

.nav-logo {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  list-style: none;
}

.nav-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
}
.nav-link:hover { color: var(--color-text-primary); }

.nav-cta {
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  background: var(--color-accent);
  color: var(--color-text-inverse);
  text-decoration: none;
}
.nav-cta:hover { background: var(--color-accent-hover); }
```

### Website Sections

The website is a single scroll — no internal routes on the landing page except anchor links. Sections alternate between `stone-100` and `stone-300` backgrounds.

**Section structure:**

```css
.section {
  width: 100%;
  padding: 96px 0;
}

.section--alt {
  background: var(--color-stone-300);   /* #f5ebe0 */
}

.section-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 48px;
}

.section-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.section-heading {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
  margin-bottom: 16px;
}

.section-body {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 640px;
}
```

### Hero Section

The hero is full-width. Text is left-aligned. No centered hero — centered text reads as generic.

```
Section bg:           var(--color-stone-100)
Top padding:          160px (accounts for fixed nav + breathing room)
Bottom padding:       96px

Headline:             IBM Plex Sans, 48px, weight 600, line-height 1.1
                      color: var(--color-text-primary)
                      max-width: 720px

Sub-headline:         IBM Plex Sans, 18px, weight 400, line-height 1.5
                      color: var(--color-text-secondary)
                      max-width: 540px
                      margin-top: 20px

CTA buttons:          display: flex; gap: 12px; margin-top: 40px
Primary CTA:          bg var(--color-accent); text var(--color-text-inverse)
                      padding: 12px 24px; font-size: 14px; font-weight 500
Secondary CTA:        bg transparent; border: 1px solid var(--color-stone-500)
                      text var(--color-text-primary)
                      padding: 12px 24px; font-size: 14px; font-weight 500

Hero visual:          Static image of extension popup screenshot
                      Position: right side of a 2-column layout
                      border: 1px solid var(--color-stone-200)
                      (no drop shadow — stays consistent with flat design)
```

### Feature Cards Section

Features are displayed in a bordered grid — 3 columns. The grid technique uses a 1px gap on a stone-200 background to create the grid lines without any individual borders.

```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background-color: var(--color-stone-200); /* this is the "border" */
  border: 1px solid var(--color-stone-200);
  margin-top: 64px;
}

.feature-card {
  background: var(--color-stone-100);
  padding: 32px;
}

.feature-icon {
  width: 32px;
  height: 32px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.feature-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
```

Mobile: grid collapses to 1 column below 768px, 2 columns at 768–1024px.

### Platform Support Section

The 20 supported platforms are displayed as a flat list of name badges. No icons — text only. The section is visually dense and data-forward.

```css
.platforms-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 40px;
}

.platform-badge {
  padding: 6px 12px;
  background: var(--color-stone-300);
  border: 1px solid var(--color-stone-200);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* Tier indicators */
.platform-badge[data-tier="1"] { border-color: var(--color-stone-500); color: var(--color-text-primary); }
.platform-badge[data-tier="2"] { border-color: var(--color-stone-200); }
.platform-badge[data-tier="3"] { color: var(--color-text-muted); }
```

### "How It Works" Section

Three steps. No cards — just a numbered vertical flow or a 3-column horizontal layout.

```css
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  margin-top: 64px;
}

.step-number {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.step-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.step-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
```

### FAQ Section

Accordion. Each item is a bordered row. No chevron-in-a-circle — just a plain `+` / `−` that transitions to a minus on open.

```css
.faq-item {
  border-bottom: 1px solid var(--color-stone-200);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
}

.faq-answer {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  padding-bottom: 20px;
  max-width: 640px;
}

.faq-toggle {
  font-size: 20px;
  font-weight: 300;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
```

### Auth Pages (Login / Signup / Verify OTP)

Auth pages use a centered single column. Background is `stone-100`. The form is the only content — no card wrapper around it.

```
Max form width:   400px
Centered:         margin: 0 auto; padding-top: 120px (clears fixed nav)

Form heading:     32px, weight 600, text-primary
Sub-text:         14px, text-secondary, margin-bottom 32px

Input rows:       gap 16px between inputs
OTP inputs:       6 individual 48px × 56px boxes
                  border: 1px solid stone-200 (default)
                  border: 1px solid accent (active/focus)
                  font: IBM Plex Mono, 24px, weight 500, centered

Submit button:    width: 100%; height: 40px; bg accent; text inverse

Error message:    font-size 13px; color var(--color-error); margin-top 8px
                  no error box/card — just text below the input
```

### Dashboard Page

The dashboard is a full-width protected page with a sidebar on desktop.

**Sidebar:**
```
Width:          220px (fixed)
Background:     var(--color-stone-300)
Border-right:   1px solid var(--color-stone-200)
Padding:        24px 16px

Nav items:      14px, weight 500, text-secondary
Active item:    color text-primary; border-left: 3px solid accent; padding-left: 13px
Hover item:     background var(--color-stone-400); padding: 8px 12px
```

**Main content area:**
```
Padding:        32px 40px
Background:     var(--color-stone-100)
```

**Summary cards:**

Four stat cards in a row. No box shadows — bordered flat cards.

```css
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--color-stone-200);
  border: 1px solid var(--color-stone-200);
  margin-bottom: 32px;
}

.stat-card {
  background: var(--color-stone-300);
  padding: 20px 24px;
}

.stat-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.stat-value {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text-primary);
  tabular-nums: true;
}
```

**Chart area:**

```
Chart container border:   1px solid var(--color-stone-200)
Chart bg:                 var(--color-stone-300)
Chart padding:            24px
Chart heading:            15px, weight 600, text-primary, margin-bottom 20px

Recharts colors (in order of use):
  Line/bar 1:   var(--color-accent)         ← #5c4a3a
  Line/bar 2:   var(--color-stone-500)      ← #d5bdaf
  Grid lines:   var(--color-stone-200)
  Axis text:    var(--color-text-muted), IBM Plex Mono, 11px
  Tooltip bg:   var(--color-text-primary)
  Tooltip text: var(--color-text-inverse)
```

### Settings Page

Settings page uses the same sidebar as the dashboard. Main content is a single column of labeled setting groups separated by horizontal rules.

```css
.settings-group {
  padding-bottom: 40px;
  margin-bottom: 40px;
  border-bottom: 1px solid var(--color-stone-200);
}

.settings-group:last-child {
  border-bottom: none;
}

.settings-group-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 24px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-stone-200);
}
```

### Legal Pages (Privacy / Terms / Cookies)

Long-form text. Narrow column. No cards. Just clean prose.

```
Content max-width:  640px
Padding-top:        80px (below nav)

h1:   24px, weight 600, margin-bottom 8px
h2:   18px, weight 600, margin-top 40px, margin-bottom 12px
p:    15px, weight 400, line-height 1.7, color text-secondary, margin-bottom 16px
ul:   same as p, padding-left 20px, marker color text-muted
table: full-width, 1px solid stone-200 borders, 10px 16px cell padding
```

---

## 9. States & Feedback

### Focus

All interactive elements use a 2px solid accent outline. No browser default outlines.

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Hover

Hover states change background color only — never border color alone (hard to see) and never just text color alone (too subtle for a utility app).

```
Card hover:         background stone-300 → stone-400
Button hover:       per button type (see Section 6)
Nav link hover:     text-secondary → text-primary
Table row hover:    background → stone-400
```

### Active / Pressed

```
Button active:      opacity: 0.85; transform: translateY(1px)
```

### Disabled

```
Opacity:            0.45
Cursor:             not-allowed
Pointer-events:     none
```

### Loading / Skeleton

Skeleton elements use a pulsing animation on a stone-200 background.

```css
.skeleton {
  background: var(--color-stone-200);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
```

No shimmer (the moving gradient effect). Just a flat opacity pulse — consistent with the flat design philosophy.

### Error State (inputs)

```css
.input--error {
  border-color: var(--color-error);
}

.input-error-text {
  font-size: 12px;
  color: var(--color-error);
  margin-top: 4px;
}
```

No error icon in the input itself — the text is sufficient.

### Live Counter Update (Popup)

When the token counter updates (new message received), it flashes briefly. Not an animation — a color flash.

```css
@keyframes count-update {
  0%   { color: var(--color-text-primary); }
  30%  { color: var(--color-accent); }
  100% { color: var(--color-text-primary); }
}

.token-count--updated {
  animation: count-update 400ms ease-out;
}
```

---

## 10. Motion

Motion is minimal and functional only. Three rules:

1. **No entrance animations.** Content does not fly in, fade in, or slide in on page load. It is simply there.
2. **Transitions are fast.** 150ms for state changes. 250ms for layout changes. Never above 300ms.
3. **Easing is `ease-out` always.** Deceleration feels natural. Acceleration feels abrupt.

```css
/* Global transition reset */
* {
  transition: none;
}

/* Opt-in transitions for specific properties */
button, a, input, .toggle-track {
  transition: background-color 150ms ease-out,
              border-color 150ms ease-out,
              color 150ms ease-out;
}

/* FAQ accordion */
.faq-answer {
  transition: max-height 250ms ease-out,
              opacity 200ms ease-out;
}

/* Settings panel (popup) */
.settings-panel {
  transition: max-height 200ms ease-out;
}
```

No `transform`, no `scale`, no `translate` on hover (except the 1px translateY on button active). No scroll-triggered animations. No intersection observer reveal effects.

---

## 11. Icons

**Library:** Lucide Icons (React package `lucide-react`) for the website and popup React components.

Lucide is chosen because:
- Thin, consistent 1.5px stroke weight — matches the minimal aesthetic
- Large icon set (1000+)
- Tree-shakeable React components
- Matches IBM Plex Sans in geometry (both are precise and geometric)

```tsx
import { BarChart2, Bell, Shield, Zap, Settings, ChevronRight } from 'lucide-react';

// Always use size 16 in popup, 20 in website nav/UI, 24 in feature cards
<BarChart2 size={20} strokeWidth={1.5} color="currentColor" />
```

### Icon Sizes

```
Popup inline icons:    16px, strokeWidth: 1.5
Website UI icons:      20px, strokeWidth: 1.5
Feature card icons:    24px, strokeWidth: 1.5
```

### Platform Icons

Platform icons (ChatGPT, Claude, Gemini, etc.) are 16×16px SVG favicons fetched from `https://www.google.com/s2/favicons?domain={platform_domain}&sz=32` and displayed at 16px. If the favicon fetch fails, fall back to the first letter of the platform name in a 16px square with `bg stone-400, text text-secondary`.

---

## 12. Tailwind Config

The design system is implemented in Tailwind via a custom config. All custom values are mapped to CSS variables defined in Section 13.

```js
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: {
          100: '#edede9',
          200: '#d6ccc2',
          300: '#f5ebe0',
          400: '#e3d5ca',
          500: '#d5bdaf',
        },
        text: {
          primary:   '#1a1714',
          secondary: '#5a524a',
          muted:     '#8c8078',
          inverse:   '#f5ebe0',
        },
        accent: {
          DEFAULT: '#5c4a3a',
          hover:   '#3d3028',
        },
        success: {
          DEFAULT: '#4a7c59',
          bg:      '#eaf0e9',
        },
        warning: {
          DEFAULT: '#8a6a2a',
          bg:      '#f5edda',
        },
        error: {
          DEFAULT: '#8a3a3a',
          bg:      '#f0e8e8',
        },
      },

      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
      },

      fontSize: {
        'display':  ['48px', { lineHeight: '1.1', fontWeight: '600' }],
        'h1':       ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2':       ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body':     ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'label':    ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'caption':  ['11px', { lineHeight: '1.4', fontWeight: '400' }],
      },

      borderRadius: {
        none:    '0',
        DEFAULT: '0',   /* Override Tailwind default — everything is sharp */
        full:    '9999px',  /* Only for avatar circles via rounded-full */
      },

      spacing: {
        /* Tailwind default scale covers 1–96 in 4px steps.
           Named semantic aliases for the most common values: */
        'xs':  '4px',
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
        '5xl': '96px',
      },

      maxWidth: {
        content: '1100px',
        narrow:  '640px',
        popup:   '320px',
      },

      transitionDuration: {
        fast:   '150ms',
        normal: '250ms',
      },

      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Key Tailwind Class Conventions

```
Background:
  bg-stone-100      → page background
  bg-stone-300      → card / alternate section
  bg-stone-400      → hover state
  bg-accent         → primary CTA, active accent

Border:
  border border-stone-200    → default border
  border border-stone-500    → strong border / active input

Text:
  text-text-primary      → headings, body
  text-text-secondary    → labels, metadata
  text-text-muted        → hints, placeholders, captions
  font-mono              → all numbers, costs, token counts

Radius (never use rounded-sm, rounded-md, rounded-lg):
  (no class)             → default is 0 — no class needed
  rounded-full           → avatar circle only

Spacing:
  p-lg                   → standard padding
  gap-lg                 → standard gap
  px-3xl py-5xl          → section padding
```

---

## 13. CSS Custom Properties

Full declaration block for `website/src/index.css` and `extension/src/popup/popup.css`:

```css
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

:root {
  /* ── Palette ─────────────────────────────── */
  --color-stone-100: #edede9;
  --color-stone-200: #d6ccc2;
  --color-stone-300: #f5ebe0;
  --color-stone-400: #e3d5ca;
  --color-stone-500: #d5bdaf;

  /* ── Text ────────────────────────────────── */
  --color-text-primary:   #1a1714;
  --color-text-secondary: #5a524a;
  --color-text-muted:     #8c8078;
  --color-text-inverse:   #f5ebe0;

  /* ── Accent ──────────────────────────────── */
  --color-accent:       #5c4a3a;
  --color-accent-hover: #3d3028;

  /* ── Semantic ────────────────────────────── */
  --color-success:    #4a7c59;
  --color-success-bg: #eaf0e9;
  --color-warning:    #8a6a2a;
  --color-warning-bg: #f5edda;
  --color-error:      #8a3a3a;
  --color-error-bg:   #f0e8e8;

  /* ── Typography ──────────────────────────── */
  --font-sans: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Courier New', monospace;

  /* ── Spacing ─────────────────────────────── */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  12px;
  --space-lg:  16px;
  --space-xl:  24px;
  --space-2xl: 32px;
  --space-3xl: 48px;
  --space-4xl: 64px;
  --space-5xl: 96px;

  /* ── Border ──────────────────────────────── */
  --border-default: 1px solid var(--color-stone-200);
  --border-strong:  1px solid var(--color-stone-500);
  --border-accent:  1px solid var(--color-accent);

  /* ── Motion ──────────────────────────────── */
  --dur-fast:   150ms;
  --dur-normal: 250ms;
  --ease:       ease-out;
}

/* ── Global Reset ─────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: 0 !important; /* Zero-radius enforcement */
}

/* ── Exceptions to zero-radius ────────────── */
.avatar,
.avatar-circle {
  border-radius: 50% !important;
}

body {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--color-text-primary);
  background-color: var(--color-stone-100);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Data number class ────────────────────── */
.data-number {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
```

---

## 14. Do / Don't

### Color

| Do | Don't |
|---|---|
| Use the five stone palette colors for all backgrounds | Introduce new background colors (white, gray, black) |
| Use semantic colors (`--color-success`, etc.) for status only | Use green/red for decorative purposes |
| Use `--color-accent` for exactly one primary CTA per view | Use accent on multiple buttons on the same screen |
| Use text colors from the four text tokens | Use stone palette colors as text colors |

### Shape

| Do | Don't |
|---|---|
| `border-radius: 0` everywhere | Add `rounded-sm`, `rounded-md`, or any Tailwind radius class |
| Use `border-left` accent stripes for warning/info callouts (border-radius: 0) | Use rounded pills or badges with full border-radius |
| Avatar circles only with `border-radius: 50%` | Use rounded corners on cards, modals, or inputs |

### Typography

| Do | Don't |
|---|---|
| Use IBM Plex Mono for all numbers and data | Display data values in the sans-serif font |
| Sentence case everywhere | Use Title Case for headings or button labels |
| Prefix all estimated values with `~` | Display estimated values without the prefix |
| Format costs to 4 decimal places below $0.01 | Show costs as `$0.00` — it looks like it's free |

### Layout

| Do | Don't |
|---|---|
| Use the 1px-gap-on-parent grid technique for bordered grids | Add individual borders to every grid cell |
| Keep section backgrounds alternating stone-100 / stone-300 | Use colored section backgrounds |
| Let content dictate popup height | Cap popup height unnecessarily or add internal scroll |

### Motion

| Do | Don't |
|---|---|
| Transition only background-color, border-color, color | Animate opacity, transform, or height on hover |
| Keep all transitions at 150ms | Use transitions above 250ms |
| Use ease-out for all transitions | Use ease-in or linear |
| Show content immediately on page load | Fade/slide in content on scroll |

### Data Display

| Do | Don't |
|---|---|
| Show loading skeletons (pulsing stone-200 blocks) | Show blank screens while data loads |
| Show empty states with a clear call to action | Show blank tables or empty chart areas |
| Use `Intl.NumberFormat` for all displayed numbers | Display raw JavaScript floats |

---

*End of Document — AI Token Tracker design.md*
*Companion docs: prd.md v1.1 · architecture.md v1.0 · rules.md · phases.md*
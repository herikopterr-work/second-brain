---
name: Executive Sanctuary
colors:
  surface: '#f6fbf1'
  surface-dim: '#d6dcd2'
  surface-bright: '#f6fbf1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5eb'
  surface-container: '#eaf0e6'
  surface-container-high: '#e4eae0'
  surface-container-highest: '#dfe4da'
  on-surface: '#171d17'
  on-surface-variant: '#424843'
  inverse-surface: '#2c322b'
  inverse-on-surface: '#edf2e8'
  outline: '#727973'
  outline-variant: '#c2c8c1'
  surface-tint: '#F6F8F5'
  primary: '#072517'
  on-primary: '#ffffff'
  primary-container: '#1e3b2b'
  on-primary-container: '#85a590'
  inverse-primary: '#adceb8'
  secondary: '#4a6549'
  on-secondary: '#ffffff'
  secondary-container: '#ccebc7'
  on-secondary-container: '#506b4f'
  tertiary: '#351800'
  on-tertiary: '#ffffff'
  tertiary-container: '#542a00'
  on-tertiary-container: '#ea841a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9ebd3'
  primary-fixed-dim: '#adceb8'
  on-primary-fixed: '#032112'
  on-primary-fixed-variant: '#304d3c'
  secondary-fixed: '#ccebc7'
  secondary-fixed-dim: '#b0cfad'
  on-secondary-fixed: '#07200b'
  on-secondary-fixed-variant: '#334d33'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f6fbf1'
  on-background: '#171d17'
  surface-variant: '#dfe4da'
  canvas-base: '#EFF3ED'
  surface-card: '#FFFFFF'
  surface-elevated: '#FFFFFF'
  forest-dark: '#162B20'
  sage-deep: '#2E4F3E'
  sage-medium: '#5B7A66'
  sage-soft: '#8BA888'
  sage-muted: '#C2D4C1'
  sage-light: '#E2EBE0'
  border-subtle: '#DFE6DC'
  border-strong: '#CBD5C8'
  text-primary: '#19241C'
  text-secondary: '#58655B'
  text-muted: '#8A978E'
  type-action: '#2A5C43'
  type-action-bg: '#EBF4EE'
  type-waiting: '#B45309'
  type-waiting-bg: '#FEF3C7'
  type-resource: '#2E5C6E'
  type-resource-bg: '#E0F2FE'
  status-critical: '#DC2626'
  status-critical-bg: '#FEE2E2'
  capture-banner: '#FDF6EA'
  capture-accent: '#C27803'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13.5px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 10.5px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  number-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit-2xs: 0.125rem
  unit-xs: 0.25rem
  unit-sm: 0.5rem
  unit-md: 0.75rem
  unit-lg: 1rem
  unit-xl: 1.25rem
  unit-2xl: 1.5rem
  unit-3xl: 2rem
  layout-gutter: 1rem
  sidebar-width: 16rem
  content-max-w: 96rem
---

## Brand & Style

This design system is tailored for a single-operator executive productivity dashboard rooted in David Allen's GTD (Getting Things Done) and Tiago Forte's PARA methodology. The personality is quiet, authoritative, reassuring, and distraction-free. Rather than feeling like a chaotic issue tracker, it evokes the mental serenity of an executive study: warm sage foliage, muted cream surfaces, warm linen textures, and grounded forest tones.

### Design Movement
The visual language merges **Warm Executive Minimalism** with **Tactile Modernism**. Surfaces feature generous outer radii (`rounded-2xl` through `rounded-3xl`), micro-inset hairpins, and warm off-white canvas layers rather than cold digital whites. Elevated cards sit cleanly over tinted base layers without aggressive shadows, relying on tonal contrast and precision outlines.

### Emotional Target
- **Clarity & Equilibrium**: Eliminates executive cognitive overload. When reviewing tasks or inbox items, the visual container induces calm focus.
- **Definitive Velocity**: Crisp visual badges immediately distinguish whose court the ball is in (`ACTION`, `WAITING`, or `RESOURCE`).
- **Tactile Satisfaction**: Check actions, daily snapshot locks, and capture transitions feel physically grounded and earned.

## Colors

The palette is anchored by deep botanical greens, soft sage tints, and warm stone neutrals. It eschews stark synthetic slate or monochrome grays in favor of olive- and pine-undertoned neutrals.

### Surface Architecture
- **Canvas Base (`#EFF3ED`)**: The soothing, slightly warm sage-cream background unifying the entire application shell and desktop gutter.
- **Card Surface (`#FFFFFF`)**: High-legibility crisp white for foreground content containers, metric modules, and list views.
- **Card Tint (`#F6F8F5`)**: Alternating row fills, sidebar backgrounds, sub-panels, and secondary groupings.

### GTD & PARA Semantic Signals
- **`ACTION` (My Court)**: Deep pine green (`#2A5C43`) on mist green base (`#EBF4EE`). Indicates agency, forward progress, and prompt execution.
- **`WAITING` (Other's Court)**: Warm amber-cognac (`#B45309`) on light almond (`#FEF3C7`). Signals external dependency, SLA tracking, and follow-up urgency.
- **`RESOURCE` (Reference/Decision)**: Cool fjord slate (`#2E5C6E`) on clean ice blue (`#E0F2FE`). Communicates static knowledge and long-term storage without an active ball in play.
- **`SODOKAN / OVERDUE` (Critical Thresholds)**: Muted crimson (`#DC2626`) on soft rose (`#FEE2E2`). Reserved strictly for `waiting > 3d`, `questions > 7d`, or excessive carryover days.

## Typography

The typography system uses **Plus Jakarta Sans** uniformly across display, body, and label roles. Its geometric modernism combined with open apertures and sculpted terminal curves yields an uncluttered, high-density editorial balance.

### Typographic Hierarchy
- **Stat Values & Counters**: Set in bold tabular weights (`number-stat`) with tight letter spacing for fast scanning of inbox counts, carryover days, and velocity charts.
- **Section Headers & Metric Eyebrows**: Rendered in `label-caps` with uppercase styling and expanded tracking (`letterSpacing: 0.08em`) in muted forest-gray (`text-secondary`), providing structural orientation without visual noise.
- **Task & Project Titles**: Use `title-sm` with tight vertical metrics, ensuring high density on desktop dashboards and rapid readability on mobile capture views.
- **Numeric Badges**: Integrated tabular figures guarantee that Sodokan gauge values, carryover flags (`Hari ke-3`), and time blocks align cleanly.

## Layout & Spacing

The layout is built on a responsive 12-column fluid grid system framed within an executive desktop workspace that collapses gracefully down to a single-column mobile PWA format.

### Spatial Rhythm
- **Global Structure**: Desktop environments utilize a fixed sidebar (width: `16rem`) paired with a dynamic 3-column dashboard workplane.
  - Left column: Macro Velocity, Metric summaries, and Sodokan Gauge.
  - Center column: Top 3 / Top 5 "Today's Winning" execution stack.
  - Right column: Daily Schedule calendar, meeting outputs, and agenda items.
- **Component Padding**: Standard card internal padding is `1.25rem` (`unit-xl`) on desktop, scaling to `1rem` on mobile.
- **Compact List Rows**: Dense 44px to 52px target heights for task items, maximizing vertical screen efficiency without cramping interactive checkboxes or tags.

## Elevation & Depth

This system avoids aggressive, dark drop shadows. Instead, it relies on soft ambient green-tinted occlusion and micro-borders to produce tactile stratification.

### Surface Tiers
- **Base Ground (Level 0)**: Tone `#EFF3ED`. The foundational viewport wash.
- **Card Ground (Level 1)**: Tone `#FFFFFF` with outline `1px solid #DFE6DC`. Ambient shadow: `0 1px 3px rgba(22, 43, 32, 0.04), 0 6px 16px rgba(22, 43, 32, 0.02)`.
- **Active Card & Popovers (Level 2)**: Tone `#FFFFFF` with outline `1px solid #CBD5C8`. Ambient shadow: `0 4px 12px rgba(22, 43, 32, 0.07), 0 12px 28px rgba(22, 43, 32, 0.04)`.
- **Top Quick Capture Field**: Subtly recessed with warm cream tint `#FDF6EA` and a fine amber-sand ring (`#E8DCC6`), setting it apart from standard status blocks.

## Shapes

The design incorporates a soft, welcoming geometry with deep rounded corners that temper dense business data:

- **Dashboard Cards**: `1.25rem` (`rounded-2xl`) on standard panels and calendar sections.
- **Omni Quick-Capture Bar**: `0.875rem` (`rounded-xl`) for focused horizontal entry.
- **Buttons & Search Inputs**: Fully rounded pill shapes (`9999px`) for search fields, CTA badges, and top-level action buttons.
- **Pills & Status Tags**: `0.375rem` to `0.5rem` (`rounded-md` / `rounded-lg`) for concise status tags and attendee chips.
- **Progress Gauge**: Semi-circular arch meters with soft rounded end-caps.

## Components

### 1. Omni Quick-Capture Bar
- **Anatomy**: Left lightning icon badge in warm sand, full-width placeholder text ("Ketik apa saja yang terlintas di kepala lalu tekan Enter untuk simpan ke Inbox..."), and right Enter-key prompt with a dark forest-tinted submit button.
- **Visuals**: Background `#FDF6EA`, border `1px solid #EADBCE`, text color `#6C593C`.
- **Interaction**: Pressing `Enter` instantly commits the item to IndexedDB/Inbox with a micro-pulse confirmation badge and clear field reset.

### 2. GTD State Overview Tiles
- **Structure**: 4-card horizontal stat array highlighting:
  - *Open Actions*: Neutral slate-green pill with counter and count indicator.
  - *Waiting Others*: Amber sand pill with hourglass icon and item count.
  - *Questions > 7D*: Critical soft red badge displaying items exceeding SLA.
  - *Top 3/5 Streak*: Sage green pill showcasing consecutive daily wins with flame indicator.
- **Specs**: Background `#FFFFFF`, border `1px solid #DFE6DC`, height 76px.

### 3. "Today's Winning" (Daily Snapshot Stack)
- **Item Treatment**: White card row nested inside the snapshot container.
- **Check State**: Custom circular checkbox (`20px`) with `2px` sage border. On completion, transitions to solid `#1E3B2B` with a white checkmark, accompanied by strikethrough and 50% opacity on label text.
- **Carryover Flag**: Prominent badge for items carried over (`▲ 3 hari terbawa` in `#DC2626` text / `#FEE2E2` fill) to maintain continuous executive awareness.
- **Inline Metadata**: Estimated minutes badge (`45m`) and due date pill (`Aug 04`).

### 4. Status Badges & Pills
- **ACTION**: Background `#EBF4EE`, Text `#2A5C43`, Icon: check-circle-outline.
- **WAITING**: Background `#FEF3C7`, Text `#B45309`, Icon: hourglass-outline.
- **RESOURCE**: Background `#E0F2FE`, Text `#2E5C6E`, Icon: book-bookmark.
- **CRITICAL / OVERDUE**: Background `#FEE2E2`, Text `#DC2626`, Icon: alert-triangle.

### 5. Sodokan Gauge Module
- **Structure**: Semi-circular gauge chart tracking waiting load percentage (`72% Waiting Load`).
- **Urgent List**: Sub-rows beneath the gauge pinpointing specific counterparties (`Budi Santoso - 4d Wait`, `Hendra P. - 9d Kritis`) with avatar monogram tokens.

### 6. Schedule & Meeting Agenda Cards
- **Calendar Strip**: Horizontal weekly selector with highlighted active date badge (`Mon 04` in solid forest green `#1E3B2B`).
- **Meeting Accordion**: Clean card detailing meeting timing (`10:00 - 10:45 WIB`), meeting title, type pill (`WAITING`), attendee avatar pills, and inline question/action items ready for one-click resolution.
- **Inline Meeting Action Bar**: Quick button "+ Tandai Selesai / Terjawab" rendering in full-width neutral pill style.
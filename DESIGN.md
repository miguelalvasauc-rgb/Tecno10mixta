---
name: Academic Log System
description: Class portal for Educación Tecnológica 3°C/3°E — light "Bitácora" and dark "Sala de Mando" personas over one institutional navy/turquoise identity.
colors:
  navy: "#1B3A6B"
  navy-suave-oscuro: "#24467F"
  navy-suave-claro: "#163058"
  turquesa: "#14B8A6"
  texto-sobre-navy: "#E8EEF4"
  texto-sobre-navy-suave: "#C7D4E4"
  fondo-oscuro: "#0D1B2A"
  fondo-claro: "#F5F7FA"
  superficie-oscuro: "#14243B"
  superficie-claro: "#FFFFFF"
  superficie-alterna-oscuro: "#101E31"
  superficie-alterna-claro: "#ECF1F6"
  borde-oscuro: "#223753"
  borde-claro: "#D6DEE8"
  texto-oscuro: "#E8EEF4"
  texto-claro: "#1B2A3A"
  texto-suave-oscuro: "#A9BBD1"
  texto-suave-claro: "#4A5A6C"
  texto-sobre-acento-oscuro: "#04211D"
  texto-sobre-acento-claro: "#FFFFFF"
  estado-completado: "#54F8D7"
  estado-progreso: "#E98000"
  estado-pendiente: "#FFB77D"
  estado-vencido: "#BA1A1A"
  foco-alto-contraste: "#FF8C00"
  urgencia: "#D64545"
  exito: "#3FA34D"
  advertencia: "#E0A526"
  neutro-general: "#5C6F84"
  neutro-general-texto: "#F2F5F8"
typography:
  headline:
    fontFamily: "Quicksand, Trebuchet MS, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(24px, 3vw, 32px)"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Quicksand, Trebuchet MS, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.43
rounded:
  sm: "4px"
  default: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  base: "8px"
  gutter: "24px"
  margen-mobile: "16px"
  margen-desktop: "40px"
  ancho-max: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.turquesa}"
    textColor: "{colors.texto-sobre-acento-oscuro}"
    rounded: "{rounded.full}"
    padding: "0.65rem 1.4rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.texto-oscuro}"
    rounded: "{rounded.md}"
    padding: "0.55rem 1.1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.turquesa}"
    rounded: "{rounded.full}"
    padding: "0.3rem 0.75rem"
  card:
    backgroundColor: "{colors.superficie-oscuro}"
    textColor: "{colors.texto-oscuro}"
    rounded: "{rounded.lg}"
    padding: "1.1rem 1.2rem"
  badge-status-completado:
    backgroundColor: "{colors.estado-completado}"
    textColor: "#04211D"
    rounded: "{rounded.full}"
    padding: "0.15rem 0.55rem"
  badge-status-pendiente:
    backgroundColor: "{colors.estado-pendiente}"
    textColor: "#2A1D02"
    rounded: "{rounded.full}"
    padding: "0.15rem 0.55rem"
  badge-status-atrasada:
    backgroundColor: "{colors.estado-vencido}"
    textColor: "{colors.texto-sobre-navy}"
    rounded: "{rounded.full}"
    padding: "0.15rem 0.55rem"
  input:
    backgroundColor: "{colors.fondo-oscuro}"
    textColor: "{colors.texto-oscuro}"
    rounded: "6px"
    padding: "0.6rem 0.75rem"
---

# Design System: Academic Log System

## Overview

**Creative North Star: "The Academic Log System"**

The site already names its own two moods in code comments, and DESIGN.md keeps that framing rather than inventing a new one: **Bitácora** (logbook) for light mode, **Sala de Mando** (command room) for dark mode. Both are the same institutional identity — navy (#1B3A6B) and turquoise (#14B8A6), Quicksand headlines over Inter body text, everything rounded and pill-shaped — just lit differently. Bitácora reads as a paper logbook open on a desk: warm off-white surfaces, ink-dark text. Sala de Mando reads as the same logbook under a console lamp at night: deep navy surfaces, glowing turquoise accents.

The mood is warm and encouraging, not corporate-institutional: this is a 3°C/3°E classroom portal for teenagers, so the navy/turquoise institutional palette is softened by fully-rounded corners, pill buttons and badges everywhere, and a status-color vocabulary (mint/orange/red) that makes progress feel like a game log rather than a spreadsheet. Components are tactile — generous padding, soft single-tier shadows, a consistent hover lift — built for comfortable tapping on a phone in a school hallway as much as a desktop at home.

**Key Characteristics:**
- Two-persona theming (Bitácora/light, Sala de Mando/dark) over one fixed institutional palette — hue never changes between themes, only which surface/text roles are dark vs. light.
- Flat-by-default surfaces with exactly one soft ambient shadow tier, no elevation ramp.
- Pill shape (full radius) as the default form for anything actionable: buttons, tabs, badges.
- A dedicated 4-color status vocabulary (completado/progreso/pendiente/vencido) reserved strictly for progress and rubric state, never decoration.
- Left-border accent stripes (4px) used repeatedly as a lightweight categorization device instead of full-color card fills.

## Colors

Two brand hues — navy and turquoise — carry the institutional identity; everything else is a semantic status color with one narrowly-scoped job.

### Primary
- **Institutional Navy** (`#1B3A6B`): the one color that never changes between themes. Header, hero, footer, sidebar active-nav accents, and every light-mode fallback for turquoise (see the Light-Mode Turquoise Rule below).
- **Navy Soft — Sala de Mando** (`#24467F`, dark mode only): hero gradient's second stop in dark mode.
- **Navy Soft — Bitácora** (`#163058`, light mode only): hero gradient's second stop in light mode.

### Secondary
- **Vivid Turquoise** (`#14B8A6`): the single accent hue, used everywhere for interactive emphasis — active tabs, focus rings, checklist checkmarks, hover states, badges, the floating back-to-top button. Always paired with dark text (`#04211D`) in dark mode; in light mode it steps aside for navy wherever it would sit as a solid fill behind text (see Named Rule below).

### Neutral
- **Bitácora Paper** (`#F5F7FA` background / `#FFFFFF` surface, light mode): warm-neutral page background and card surfaces.
- **Sala de Mando Ink** (`#0D1B2A` background / `#14243B` surface, dark mode): deep navy-black page background and card surfaces.
- **Body text**: `#1B2A3A` (light) / `#E8EEF4` (dark); soft/secondary text: `#4A5A6C` (light) / `#A9BBD1` (dark).
- **Borders/dividers**: `#D6DEE8` (light) / `#223753` (dark).

### Named Rules
**The Light-Mode Turquoise Rule.** Turquoise as a solid fill behind white/light text fails WCAG AA in light mode (~2.5:1 measured, repeatedly, across the codebase). Wherever a component would use turquoise as a solid background with light text — buttons, active tabs, filled badges, focus rings, the checklist checkbox, the back-to-top button — light mode swaps to navy fill + light text instead (`~9.6:1`+). Turquoise itself is never removed from light mode; it stays as text color, border, and accent-on-dark-surface, since those pairings already pass.

**The Status-Color Exclusivity Rule.** The four status colors (`estado-completado` mint, `estado-progreso` orange, `estado-pendiente` light orange, `estado-vencido` red) exist for exactly one job: progress bars, completion badges, rubric-level indicators, and calendar day-types that reuse those same semantics. Never repurpose one as a decorative accent — a new mint highlight on an unrelated card would silently read as "completed" to a returning student.

## Typography

**Headline Font:** Quicksand (self-hosted woff2, weights 400–700), with Trebuchet MS → Segoe UI → system sans as offline fallback.
**Body Font:** Inter (self-hosted woff2, weights 400–700), with Segoe UI → system sans as offline fallback.

**Character:** Quicksand's rounded geometric letterforms give headings a friendly, slightly playful voice that still reads as legible and structured; Inter carries the actual class content (rubrics, task descriptions, dates) in a plain, highly-legible body face. Both fonts are self-hosted specifically so the site keeps working with no network connection — an offline-first commitment worth preserving in any new work.

### Hierarchy
- **Headline** (700, 24px→32px at ≥1024px, line-height 30px→40px): section titles (`<h2>`), page-level headings.
- **Title** (600, 20px, line-height 28px): card and sub-section titles (`<h3>` in cards, FAQ questions).
- **Body** (400, 16px, line-height 24px): default running text, rubric descriptions, task copy.
- **Label** (600, 14px, line-height 20px): sidebar nav links, form labels, small UI text; a smaller 12px/500-weight label variant exists for badges and micro-copy.

Headings use sentence case, never Title Case or full uppercase — the conversational-academic tone is preserved by how copy is written, not forced with `text-transform`. Small labels (eyebrow text, priority badges) are the deliberate exception: uppercase with slight letter-spacing (`0.05–0.08em`) to read as tags rather than prose.

## Layout

Mobile-first, built around an 8px spacing rhythm (`--espacio-base: 8px`, gutter `24px`, mobile margin `16px`, desktop margin `40px`), with a `1200px` max content width for standard sections.

Navigation is fully swapped by breakpoint rather than just resized: below `1024px`, a fixed bottom bar (Inicio/Grupo/Progreso/Perfil) owns navigation and the page reserves `64px` of bottom padding for it; at `≥1024px`, a fixed `256px` left sidebar takes over and the page gains `256px` of left padding instead. There is no intermediate hybrid state — it's one or the other.

Content grids lean on `auto-fill`/`auto-fit` with a `minmax()` floor (`220–280px` depending on card type) rather than fixed column counts, so trimester cards, task cards, and video cards reflow naturally from one column on phones to a multi-column grid on desktop without explicit breakpoint-by-breakpoint column rules. The one deliberate exception is the "importante" announcement card, which spans 2 grid columns on desktop and collapses to 1 on narrow screens (`≤640px`) — a bento-style emphasis device for urgent avisos.

## Elevation & Depth

Flat-by-default: a single soft ambient shadow token (`--sombra`) is reused everywhere a surface needs to lift off the page — cards, the sticky header, modals, the calendar panel — rather than a multi-tier elevation ramp. Depth communicates "this is a distinct surface," not "this is more important than that."

### Shadow Vocabulary
- **Ambient (`--sombra`)** — dark: `0 8px 24px rgba(0, 0, 0, 0.35)`; light: `0 8px 20px rgba(27, 58, 107, 0.12)` (tinted navy instead of pure black, since a pure-black shadow reads as muddy against Bitácora's warm paper background). Used uniformly on every card, header, and modal.
- **Completion glow** (dark mode only, `0 0 10px var(--color-estado-completado)`): the one deviation from flat-by-default, applied only to the "project completed" badge. It's celebratory, not structural — a glow instead of a shadow, marking an achievement rather than lifting a surface.

### Named Rules
**The One-Shadow Rule.** Every resting surface uses the same ambient shadow token. Don't invent a second elevation tier for a "more important" card — reach for color, border, or the confirmed hover lift (`translateY(-4px)` + border→turquoise) instead.

## Shapes

Rounded and pill-heavy throughout: a six-step radius scale (`4px / 8px / 12px / 16px / 24px / full`) covers everything from small badges to the sidebar, with `full` (`9999px`) as the default for anything clickable — buttons, tabs, badges, the custom checkbox's rounded corners.

Left-border accent stripes (`4px solid`) are a recurring lightweight categorization device — announcement priority, temario/rúbricas group headers, rubric level items, calendar event cards — used instead of tinting the whole card, so the accent reads as a tag rather than repainting the surface.

## Components

Buttons, cards, and badges share one tactile, rounded language: soft shadows, pill or generously-rounded corners, and a consistent lift-on-hover.

### Buttons
- **Shape:** pill (`border-radius: 9999px`) for primary/ghost actions; `12px` radius for the bordered secondary button.
- **Primary** (`.boton-enviar`, `.enlace-instrucciones`): solid turquoise fill + dark text in dark mode, `padding: 0.65rem 1.4rem` (or `0.45rem 0.9rem` for the smaller `.enlace-instrucciones`); swaps to navy fill + light text in light mode per the Light-Mode Turquoise Rule.
- **Ghost/Outline** (`.enlace-descarga`, `.boton-ver-detalle`): transparent fill, `1px` turquoise border and text at rest, fills solid turquoise (or navy in light mode) on hover/focus.
- **Secondary** (`.boton-secundario`): transparent fill, `2px` neutral border, no fill change on hover — just a border-color shift to the soft-text color. Reserved for lower-emphasis actions like "cambiar de alumno."
- **Hover / Focus:** primary/ghost buttons use `filter: brightness(1.1)`; all interactive elements share a `3px` focus-visible outline in turquoise (or navy in light mode, orange `--color-focus-outline` for newer sidebar/modal components), offset `2px`.

### Cards / Containers
- **Corner Style:** `16px` (`--radio-lg`) for feature cards (aviso, trimestre, generic `.tarjeta`); `10px` for content cards (temario, video, rubric group items use a nested `8px`).
- **Background:** surface color per theme (`#14243B` dark / `#FFFFFF` light).
- **Shadow Strategy:** the single ambient shadow token (see Elevation & Depth); no card ever stacks a second shadow.
- **Border:** `1px solid` border color, with a `4px` left accent stripe on category cards (avisos, calendar events).
- **Hover:** `translateY(-4px)` lift + border-color shifts to turquoise — the one shared hover signature across trimester cards, temario cards, and generic tarjetas.
- **Internal Padding:** `1.1rem–2rem` depending on card density; feature cards (trimester) get the most breathing room.

### Badges
- **Style:** small pills (`border-radius: 9999px`), `0.15–0.25rem` vertical / `0.55–0.7rem` horizontal padding, `700` weight, `11–13px` size.
- **Roles:** priority (`importante` red / `recordatorio` turquoise-or-navy / `general` slate), status (`entregada`/`finalizado` mint, `pendiente` light-orange, `atrasada` red — see Status-Color Exclusivity Rule), plus plain group/unit tags in navy fill.

### Inputs / Fields
- **Style:** `1px` border, `6px` radius, background matches the page background (not the card surface) so fields read as "cut into" the form.
- **Focus:** shared focus-visible ring (turquoise dark mode / navy light mode), `3px` outline, `2px` offset.
- **Custom checkbox** (checklist): `20×20px`, `5px` radius, `2px` border; unchecked is outline-only, checked fills solid (turquoise/mint dark mode, navy light mode) with a hand-drawn checkmark built from two rotated border segments rather than an icon font or SVG.

### Navigation
- **Desktop (`≥1024px`):** fixed `256px` left sidebar, logo desaturated to grayscale as an institutional "seal," nav links `14px`/600-weight with a `3px` left border that lights up (turquoise/secondary color) on the active route.
- **Mobile (`<1024px`):** fixed bottom bar, 4 icon+label items (`11px` label), active/hover state changes icon+text color only — no border indicator, since there's no room for one at that scale.

### Modals
Native `<dialog>` throughout (detail modal, group-switch modal, profile modal) — `12–16px` radius, ambient shadow, `55%`-black backdrop. Deliberately never overrides `position`, since the browser's own `dialog:modal` centering (`fixed` + `inset:0` + `margin:auto`) already does the job; overriding it breaks the focus-on-open scroll behavior.

### Accordion (rúbricas / FAQ)
`<details>/<summary>` native disclosure, no JS state management needed. A turquoise chevron rotates `180deg` on open; rubric levels inside get their own left-border color per level (excelente/bueno/regular/deficiente), reusing the same status-color logic as everywhere else in the system.

## Do's and Don'ts

### Do:
- **Do** keep navy (`#1B3A6B`) and turquoise (`#14B8A6`) as the only two brand hues — every other color in the system is a semantic status color with one specific job, not general decoration.
- **Do** apply **the Light-Mode Turquoise Rule**: anywhere turquoise would sit as a solid fill behind white/light text, swap to navy fill + light text in light mode.
- **Do** reserve the four status colors (`estado-completado`/`progreso`/`pendiente`/`vencido`) exclusively for progress, completion badges, and rubric-level indicators — see **the Status-Color Exclusivity Rule**.
- **Do** default to the pill shape (`border-radius: 9999px`) for buttons, tabs, and badges; reach for `8–16px` radii only for larger containers (cards, modals).
- **Do** give every hover-capable card the same signature: `translateY(-4px)` + border-color → turquoise, `0.2s ease` transition.
- **Do** reference the existing CSS custom properties (`var(--color-*)`, `var(--radio-*)`, `var(--espacio-*)`) instead of hardcoding a new hex or px value the token system already covers.

### Don't:
- **Don't** introduce a second accent hue. Turquoise is the only accent; a new "brand color" would break the two-hue identity this whole system is built on.
- **Don't** add a new elevation tier. This system is flat-by-default with one ambient shadow (**the One-Shadow Rule**); the only sanctioned exception is the dark-mode completion glow, and it's celebratory, not structural.
- **Don't** override `position` on native `<dialog>` modals — the browser's built-in centering already works, and overriding it breaks the focus-on-open scroll behavior.
- **Don't** force headings into Title Case or uppercase with `text-transform`. Sentence case is the house style; uppercase is reserved for small tag-like labels (eyebrows, priority badges).

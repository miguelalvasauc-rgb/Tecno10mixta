# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students only, in groups 3°C and 3°E of Educación Tecnológica at Escuela Secundaria No. 10 Mixta "Fernando Hernández Alcalá". They visit to check avisos, the calendar, and their trimester's rúbricas, tareas, actividades, proyectos, and videos, and to track their own completion progress. The teacher (site owner) updates content directly in the code — there is no admin UI.

## Product Purpose

A single organized source of truth for the class, replacing the scattered mix of Google Classroom, WhatsApp, and shared Drive folders. Every trimester's rubrics, deadlines, and deliverables live in one place, always visible, with a lightweight per-student progress view so students can see what they've completed without asking the teacher.

## Positioning

Not a general LMS and not trying to be one — it exists because Classroom/WhatsApp/Drive get buried and disorganized. Its edge is being the one clear, always-current place for this specific class's content, plus self-serve progress tracking via the lightweight (non-secure) student profile.

## Operating Context

- Static site, no backend, no build step, no frameworks (vanilla HTML5/CSS3/JS — no React, no Tailwind, unless explicitly requested for a specific task).
- Hosted on Netlify (Personal plan, 1,000 credits/month), auto-deploy from GitHub pushes.
- Contact form uses Netlify Forms (`data-netlify="true"`, matching `name`/hidden `form-name`), requires the HTML to ship unbuilt.
- Content update workflow: changes are prepared as prompts for Claude Code in the terminal, the diff is reviewed, then pushed manually to GitHub for Netlify auto-deploy.
- Skill installs go in their own commits, separate from other changes.
- Student "profile" (grupo + nombre + 4-digit PIN) is stored via localStorage and only separates progress between classmates who might share a device/team — explicitly not real authentication or security.
- Group selector (3°C / 3°E) persists via localStorage across pages.
- Trimester pages (trimestre-1/2/3.html) each hold that period's temario, rúbricas, tareas, actividades, proyectos, videos, and entrega de trabajos.

## Capabilities and Constraints

- Fixed stack: HTML5 + CSS3 + vanilla JS. No frameworks/build tooling unless the user explicitly asks for one on a given task.
- Fixed institutional palette (school branding) — do not propose alternate palettes:
  - Navy `#1B3A6B`, Turquesa `#14B8A6`
  - Dark mode: background `#0D1B2A`, text `#E8EEF4`
  - Light mode: background `#F5F7FA`, text `#1B2A3A`
- WCAG AA accessibility is mandatory in both light and dark modes, and is already implemented (skip nav, focus-visible states, breadcrumbs, verified contrast). Extend it; do not rework from scratch.
- Mobile-first layout, with the persistent group selector working across breakpoints (sidebar on desktop ≥1024px, bottom nav on mobile).

## Brand Commitments

- School name and identity: Escuela Secundaria No. 10 Mixta "Fernando Hernández Alcalá".
- Subject/course branding: Educación Tecnológica, groups 3°C y 3°E.
- Institutional palette above is binding brand identity, not a stylistic default.

## Evidence on Hand

- Existing implementation: `index.html`, `faq.html`, `trimestre-1.html`, `trimestre-2.html`, `trimestre-3.html`, `css/style.css`, `js/main.js`, `assets/` (logo, fonts).
- No testimonials, benchmarks, pricing, or third-party proof content exists or applies — this is a free class resource, not a marketed product.

## Product Principles

1. One current source of truth beats scattering info across Classroom/WhatsApp/Drive — every content decision should reduce fragmentation, not add another channel.
2. Students self-serve their own status (progress, deadlines, rubrics) without needing to ask the teacher.
3. Keep the non-secure profile system honest: never let its UI imply real authentication or data protection it doesn't provide.
4. Accessibility and mobile-first are baseline requirements, not enhancements — every new surface ships meeting WCAG AA in both themes.
5. Respect the fixed stack and workflow: vanilla HTML/CSS/JS, no build step, changes reviewed as diffs before manual push to GitHub/Netlify.

## Accessibility & Inclusion

WCAG AA required in both light and dark modes for all pages and components. Already implemented: skip-to-content link, focus-visible states, verified color contrast, breadcrumb navigation.

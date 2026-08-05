# Tecno10mixta — Contexto para Claude Code

## Stack (NO sugerir alternativas)
- HTML5 + CSS3 + JS vanilla — SIN frameworks, SIN Tailwind, SIN TypeScript
- Hosting: Netlify (auto-deploy en push a `main`)
- Backend: Supabase (PostgreSQL + RLS + GRANT explícito — son capas separadas)
- Repo: miguelalvasauc-rgb/Tecno10mixta

## Archivos clave (evita leerlos completos si no es necesario)
- `js/main.js` (~517 KB, un solo archivo) — usa `grep -n "nombreFuncion"` para
  ubicar antes de leer, o pide rangos de líneas específicos. NUNCA lo leas
  completo salvo que se te pida explícitamente.
- `css/style.css` — tokens de diseño y temas claro/oscuro
- `index.html`, `cuenta.html`, `progreso.html`, `faq.html`, `padres.html`,
  `trimestre-1/2/3.html`, `admin.html` (panel docente, sin enlace público)
  — todos en la raíz del repo
- Estructura de carpetas: `js/`, `css/`, `assets/` son carpetas propias
  separadas (así ha sido desde el inicio del proyecto, no es un cambio
  reciente)

## Paleta institucional (fija, no proponer otra)
Navy #1B3A6B · Turquesa #14B8A6 · Modo oscuro fondo #0D1B2A / texto #E8EEF4 ·
Modo claro fondo #F5F7FA / texto #1B2A3A

## Reglas de exploración (ahorro de tokens)
1. Para capa JS: siempre empezar con `codegraph explore "..."` — indexa
   SOLO `.js`/`.yaml`. NO cubre `.html`/`.css`.
2. Para capa HTML/CSS: usar `grep -n` o `Read` con rango de líneas,
   NUNCA `codegraph` (no las indexa, es tiempo perdido).
3. Antes de tocar `js/main.js`, localizar la función exacta con grep y
   pedir solo ese bloque de líneas.

## Convenciones del proyecto
- Commits en español, un cambio lógico por commit.
- Verificación visual en Chrome (claro/oscuro, desktop/mobile) ANTES de
  cada commit.
- `TRIMESTRE_DESBLOQUEADO` en Supabase (`config_sitio`) — es un gate
  funcional real, nunca subir arriba de 1 sin confirmar con Hiram.
- Diseño y contenido se cierran en conversación (Claude.ai) ANTES de picar
  código en Claude Code. No implementar a medio diseñar.
- innerHTML solo permitido en contenido estático autor-controlado
  (ej. `detalleCompleto`/`detalleTemario` en main.js).

## Contenido curricular ya migrado
Toda la información de las 9 secuencias (Bloques 1, 2 y 3) ya está volcada
en el sitio (`trimestre-1/2/3.html` + `js/main.js`). Los documentos fuente
originales (.docx, .md) ya NO se consultan ni se modifican — solo se
usarán para contenido curricular NUEVO que se agregue a futuro.

## Sesión / higiene de contexto
- Tareas largas: `/compact` a la mitad, `/clear` al cambiar de tema.
- Cada ~10 cambios: revisar `/status`.
- Al terminar cambios grandes: pedir resumen breve de "qué cambió esta
  sesión" antes de cerrar, para decidir si hay que re-subir archivos al
  knowledge base de Claude.ai.

## Skills activos
Impeccable (design lint, con `design-lint-baseline.mjs` para evitar ruido
de hallazgos repetidos), Emil Kowalski animations, vanilla-web, forms
(accesibilidad), design-taste-frontend, `/commit` (staging selectivo +
mensaje en español + push explícito).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

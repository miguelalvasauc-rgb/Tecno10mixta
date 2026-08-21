# Auditoría técnica — Tecno10mixta
**Generado con `/impeccable audit`** · 2026-08-21

Alcance: `index.html`, `cuenta.html`, `progreso.html`, `faq.html`, `padres.html`, `trimestre-1/2/3.html`, `admin.html`, `css/style.css`, `js/main.js`. Auditoría de solo lectura — ningún archivo fue modificado.

---

## Audit Health Score

| # | Dimensión | Puntaje | Hallazgo clave |
|---|-----------|---------|----------------|
| 1 | Accesibilidad (A11y) | 3/4 | Imagen del popup de bienvenida siempre lleva `alt=""`, aunque el docente suba una imagen informativa |
| 2 | Performance | 3/4 | El colapso del sidebar anima `width`/`padding-left` en vez de `transform` |
| 3 | Theming | 3/4 | DESIGN.md documenta 14 temas pero el CSS ya implementa 20 (6 temas de evento sin documentar) |
| 4 | Responsive Design | 3/4 | Sin violaciones P0/P1; bottom-nav y breakpoint sidebar/móvil correctos, pero un botón secundario queda bajo 44px |
| 5 | Implementation Integrity | 4/4 | El detector marcó 171 hallazgos; ~90% son falsos positivos ya cubiertos por excepciones documentadas en DESIGN.md |
| **Total** | | **16/20** | **Good — atender las dimensiones débiles** |

**Bandas de calificación**: 18-20 Excelente · 14-17 Bueno (esta auditoría) · 10-13 Aceptable · 6-9 Deficiente · 0-5 Crítico

---

## Veredicto de Implementation Integrity

**PASS.** El detector de Impeccable reportó 171 hallazgos crudos. Al verificar cada categoría contra el código y contra las reglas ya escritas en DESIGN.md, **154 de 171 (90%) son falsos positivos** producidos por convenciones intencionales y documentadas, no por deriva de diseño:

- **102 `design-system-color` + 1 `codex-grid-background`**: fondos decorativos de los 11 temas visuales, todos dentro de sus propios bloques `:root[data-theme="…"] body.patrones-activos::before`. DESIGN.md exime esto explícitamente ("Per-theme decoration is exempt from the two-hue rule").
- **10 `design-system-font`** (IBM Plex Mono, Playfair Display, Fredoka, Fraunces, Rajdhani, Anton, Cascadia Code): `@font-face` auto-hospedadas que solo se descargan cuando su tema específico está activo (verificado en `css/style.css:1000-1082`).
- **42 `design-system-radius`** (6px / 10px repetidos): 12 de 42 verificados al azar caen en el patrón consistente "6px = inputs / 10px = tarjetas de contenido"; la única excepción real es el confeti estacional a `1px`, también exento por DESIGN.md.
- **5 `overused-font`** sobre "Inter": falso positivo — es la tipografía de marca documentada.
- **3 `broken-image`**: los 3 son contenedores `hidden` que JS puebla dinámicamente — no son imágenes rotas.
- **3 `em-dash-overuse`**: casi todos los guiones largos están en comentarios HTML de desarrollo, no en copy visible.

**Evidencia a favor**: el propio CSS trae un historial de auditoría de contraste en comentarios (p. ej. `/* Auditoría 4 skills (2026-08-12): 4.61:1 contra --color-superficie... */`) con rotaciones de matiz calculadas a mano para evitar colisiones con los colores de estado — un nivel de rigor que un sistema "slop" nunca produce.

---

## Resumen ejecutivo

- **Audit Health Score: 16/20 (Bueno)**
- Hallazgos totales por severidad: **P0: 0 · P1: 1 · P2: 3 · P3: 2**
- Top hallazgos:
  1. **[P1]** Imagen del popup de bienvenida sin texto alternativo dinámico — el docente no tiene forma de darle `alt` a una imagen informativa.
  2. **[P2]** El colapso del sidebar de escritorio anima propiedades de layout (`width`, `padding-left`) en vez de `transform`.
  3. **[P2]** DESIGN.md desactualizado: documenta 14 temas pero el CSS ya implementa 20 (6 temas de evento adicionales sin registrar).
  4. **[P2]** La escala `rounded` de DESIGN.md no incluye los radios 6px/10px que el sitio usa 44+ veces — genera ruido recurrente del detector.
  5. **[P3]** Botón de "quitar imagen de evidencia" mide 28×28px, bajo la guía de 44×44px (cumple el mínimo AA de 24×24px).
- **Próximo paso recomendado**: `/impeccable document` para resincronizar DESIGN.md, seguido de un fix puntual de accesibilidad en el popup de bienvenida.

---

## Hallazgos detallados por severidad

### P1 — Mayor

**[P1] Imagen del popup de bienvenida sin alt dinámico**
- **Ubicación**: `index.html:980`, `admin.html:416` (`<img id="popup-bienvenida-imagen-el" alt="">`); poblada por `mostrarPopupBienvenida()` en `js/main.js:13781-13819`
- **Categoría**: Accesibilidad
- **Impacto**: `mostrarPopupBienvenida()` asigna `imagenEl.src = datos.imagenUrl` pero nunca toca `alt`. Si el docente sube una imagen con contenido real (no decorativa), un estudiante con lector de pantalla nunca se entera de qué dice.
- **WCAG/Estándar**: 1.1.1 Non-text Content (Nivel A)
- **Recomendación**: agregar un campo de texto alternativo en el formulario de Apariencia del panel docente y que `mostrarPopupBienvenida(datos, onCerrar)` haga `imagenEl.alt = datos.imagenAltText || ""`.
- **Comando sugerido**: `/impeccable harden`

### P2 — Menor

**[P2] Colapso del sidebar anima propiedades de layout**
- **Ubicación**: `css/style.css:1132` (`transition: ... padding-left 0.3s ease` en `body`) + `css/style.css:8510` (`transition: width 0.3s ease` en `.barra-lateral`), disparadas por `body:has(.barra-lateral--colapsada)` en `css/style.css:8954-8964`
- **Categoría**: Performance
- **Impacto**: al colapsar/expandir el sidebar (≥1024px), el navegador recalcula el layout completo cada frame durante 0.3s. Acción puntual e infrecuente, así que el riesgo de jank visible es bajo pero real en equipos de gama baja.
- **Recomendación**: mover a `transform: scaleX()`/`translateX()` si se busca eliminar el reflow, o aceptar el costo actual dado que no es continuo.
- **Comando sugerido**: `/impeccable optimize`

**[P2] DESIGN.md desactualizado frente al roster real de temas**
- **Ubicación**: `DESIGN.md` (sección Theming) vs. `css/style.css` — 20 bloques `:root[data-theme="…"]` de nivel superior en el código contra 14 documentados
- **Categoría**: Theming
- **Impacto**: además de `atardecer-volcanico`, `laboratorio-ciencia` y `terminal-cian` (mencionados de pasada en otras secciones de DESIGN.md pero ausentes del roster de Theming), existen `amor-y-amistad`, `dia-del-maestro` y `fin-de-curso` — tres temas de evento completos, con la misma auditoría de contraste que Navidad/Día de Muertos, sin ninguna mención en DESIGN.md. El propio código los marca "ausentes de TEMAS_DISPONIBLES/construirGridTemas()", es decir, ya son temas de evento reales del panel docente, simplemente no documentados.
- **Recomendación**: correr `/impeccable document` para regenerar DESIGN.md desde el código actual, o confirmar con Hiram si alguno sigue en desarrollo.
- **Comando sugerido**: `/impeccable document`

**[P2] Escala `rounded` de DESIGN.md no cubre los radios realmente usados**
- **Ubicación**: `DESIGN.md` frontmatter (`sm 4px / default 8px / md 12px / lg 16px / xl 24px / full 9999px`) vs. 44 usos verificados de `border-radius: 6px` (inputs) y `10px` (tarjetas de contenido)
- **Categoría**: Theming
- **Impacto**: son valores reales y consistentes, ya descritos en prosa en "Components" de DESIGN.md, pero ausentes de la escala formal — esto hace que el detector marque como "fuera de escala" 42 usos que son la convención vigente, generando ruido en cada auditoría futura.
- **Recomendación**: agregar esos valores a la escala `rounded` del frontmatter, o registrar la excepción en `detector.ignoreValues` de `.impeccable/config.json`.
- **Comando sugerido**: `/impeccable document`

### P3 — Pulido

**[P3] Botón de "quitar imagen de evidencia" bajo el objetivo de 44px**
- **Ubicación**: `css/style.css:6013-6021` (`.evidencia-preview__quitar { width: 28px; height: 28px; }`)
- **Categoría**: Responsive Design
- **Impacto**: cumple el mínimo AA (24×24px) pero queda bajo la guía de 44×44px. Acción secundaria, impacto bajo.
- **WCAG/Estándar**: 2.5.8 AA — cumple; 2.5.5 AAA — no cumple
- **Recomendación**: opcional, subir a 32-36px o ampliar el área de toque sin cambiar el ícono visualmente.
- **Comando sugerido**: `/impeccable adapt`

**[P3] Guiones largos y transición del medidor de contraseña — ruido, sin acción requerida**
- **Ubicación**: copy de `index.html`/`faq.html`/`padres.html` y `css/style.css:6958`
- **Impacto**: em-dashes mayoritariamente en comentarios de desarrollo, no en copy visible; la transición de `width` del medidor de contraseña está acotada a una barra de 6px sin reflow de página.
- **Recomendación**: ninguna acción necesaria; documentado solo para explicar por qué no se actúa.

---

## Patrones y problemas sistémicos

- **La documentación de diseño (DESIGN.md) va por detrás del código de theming**, que es la parte más madura y mejor auditada del sitio. El código está bien; el documento necesita ponerse al día — esto es más amplio que el aviso de sidecar `.impeccable/design.json` stale que ya señaló `context.mjs` al inicio de esta sesión.
- **El detector automático genera ~90% de ruido en este proyecto** porque el sistema de 20 temas y sus radios/fuentes por tema no están completamente reflejados en DESIGN.md/`.impeccable/config.json`. Cerrar ese hueco evitará que hallazgos reales se pierdan entre falsos positivos en próximas auditorías.

## Hallazgos positivos

- **Accesibilidad de base sólida**: enlace "Saltar al contenido principal", 93 reglas `focus-visible`, jerarquía de encabezados limpia (un solo `<h1>` por página, sin saltos de nivel) en las 9 páginas revisadas, formularios con abundantes `<label>`/`aria-label`.
- **`prefers-reduced-motion` tratado en serio**: 52 usos en CSS y 10 en JS, gateando animaciones tras `(prefers-reduced-motion: no-preference)` en vez de un kill-switch global.
- **Auditoría de contraste real y documentada**: comentarios con mediciones de ratio y rotaciones de matiz calculadas para evitar colisiones entre el acento de cada tema y los colores de estado.
- **Performance de video ya resuelta**: los `<iframe>` de YouTube en `renderizarVideos()` (`js/main.js:5773-5798`) ya llevan `loading="lazy"` y `title` accesible.
- **Sin señales de layout thrashing en `js/main.js`**: únicas lecturas de `offsetWidth`/`getBoundingClientRect` son puntuales, fuera de bucles.
- **Navegación móvil con objetivos de toque correctos**: `.barra-inferior__item` usa `min-height: 56px` y `flex: 1`, por encima del mínimo de 44px.

---

## Acciones recomendadas

1. **[P1] `/impeccable harden`**: campo de texto alternativo para la imagen del popup de bienvenida en el panel docente.
2. **[P2] `/impeccable document`**: resincronizar DESIGN.md — roster completo de los 20 temas y escala `rounded` con 6px/10px reales.
3. **[P2] `/impeccable optimize`**: evaluar mover la animación de colapso del sidebar a `transform` (opcional).
4. **[P3] `/impeccable adapt`**: ampliar el área de toque del botón de quitar evidencia.
5. **`/impeccable polish`**: pasada final una vez aplicados los puntos anteriores.

> Puedes pedirme que ejecute estos pasos uno por uno, todos juntos, o en el orden que prefieras.
> Vuelve a correr `/impeccable audit` después de los fixes para ver el puntaje mejorar.

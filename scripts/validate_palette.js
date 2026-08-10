#!/usr/bin/env node
/**
 * Valida contraste WCAG AA de la paleta institucional en los 10 temas
 * de Tecno10mixta. Standalone, sin dependencias — solo Node nativo (fs).
 *
 * Uso: node scripts/validate_palette.js
 * Exit code: 1 si hay al menos un fallo, 0 si todo pasa.
 */

const fs = require("fs");
const path = require("path");

const RUTA_CSS = path.join(__dirname, "..", "css", "style.css");

// ---------------------------------------------------------------------
// Config: pares texto/fondo a validar. Extiende esta lista si aparece
// un nuevo par reutilizado en múltiples selectores de style.css.
// tamano: 'normal' -> umbral 4.5:1 | 'grande' -> umbral 3:1
//   ('grande' = texto >=18px, o >=14px bold, por criterio WCAG 1.4.3)
// ---------------------------------------------------------------------
const PARES_CONTRASTE = [
  {
    fg: "--color-primario-texto",
    bg: "--color-primario",
    tamano: "normal",
    nota: "Texto sobre superficie primaria (botones, header, tarjetas de temario)",
  },
  {
    fg: "--color-primario-texto",
    bg: "--color-primario-suave",
    tamano: "normal",
    nota: "Texto sobre variante suave del primario",
  },
  {
    fg: "--color-primario-texto-suave",
    bg: "--color-primario",
    tamano: "normal",
    nota: "Texto secundario sobre primario (footer: .pie__marca, .pie__enlaces, .pie__inferior)",
  },
  {
    fg: "--color-texto",
    bg: "--color-fondo",
    tamano: "normal",
    nota: "Texto de cuerpo sobre fondo de página (body)",
  },
  {
    fg: "--color-texto",
    bg: "--color-superficie",
    tamano: "normal",
    nota: "Texto de cuerpo sobre tarjetas/superficies",
  },
  {
    fg: "--color-texto-suave",
    bg: "--color-fondo",
    tamano: "normal",
    nota: "Texto secundario sobre fondo de página",
  },
  {
    fg: "--color-texto-suave",
    bg: "--color-superficie",
    tamano: "normal",
    nota: "Texto secundario sobre tarjetas/superficies",
  },
  {
    fg: "--color-acento-texto",
    bg: "--color-turquesa",
    tamano: "normal",
    nota: "Texto sobre badges/botones de acento turquesa (.boton-tema, badges, avatar)",
  },
  {
    fg: "--color-primario-texto",
    bg: "--pie-aviso-fondo",
    tamano: "normal",
    nota: "Link del banner de privacidad sobre el fondo mezclado del footer (.pie__aviso)",
  },
  {
    fg: "--color-primario-texto-suave",
    bg: "--pie-aviso-fondo",
    tamano: "normal",
    nota: "Texto de cuerpo del banner de privacidad sobre el fondo mezclado del footer (.pie__aviso)",
  },
];

// Orden del selector de 10 temas (TEMAS_DISPONIBLES en js/main.js).
// Cualquier otro bloque :root[data-theme="..."] encontrado en el CSS
// (p.ej. temas de evento como navidad/dia-de-muertos) se reporta aparte,
// como bonus, sin bloquear el exit code por sí solo.
const TEMAS_SELECTOR = [
  "claro",
  "oscuro",
  "arcade-neon",
  "gamer-rgb",
  "cyberpunk-gold",
  "galaxia",
  "rosa-pastel",
  "bosque-calido",
  "menta-tecnologico",
  "editorial-sepia",
];

const UMBRAL = { normal: 4.5, grande: 3.0 };

// ---------------------------------------------------------------------
// Extracción de tokens desde style.css
// ---------------------------------------------------------------------

function extraerDeclaraciones(bloque) {
  const props = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(bloque)) !== null) {
    props[m[1]] = m[2].trim();
  }
  return props;
}

function parsearCss(cssTexto) {
  // Quita comentarios primero: los bloques :root pueden traer comentarios
  // largos entre declaraciones y no deben confundir el parseo por llaves.
  const sinComentarios = cssTexto.replace(/\/\*[\s\S]*?\*\//g, "");

  // :root { ... } global (fallback de tokens que no cambian por tema,
  // p.ej. --color-turquesa por defecto para claro/oscuro).
  const globalTokens = {};
  const reGlobal = /:root\s*\{([^{}]*)\}/g;
  let mg;
  while ((mg = reGlobal.exec(sinComentarios)) !== null) {
    Object.assign(globalTokens, extraerDeclaraciones(mg[1]));
  }

  // :root[data-theme="X"] { ... } por tema — puede haber varios bloques
  // para el mismo tema (overrides puntuales más abajo en el archivo);
  // se van fusionando en orden de aparición, igual que la cascada CSS.
  const temaTokens = {};
  const reTema = /:root\[data-theme=["']([\w-]+)["']\]\s*\{([^{}]*)\}/g;
  let mt;
  while ((mt = reTema.exec(sinComentarios)) !== null) {
    const nombre = mt[1];
    const decls = extraerDeclaraciones(mt[2]);
    temaTokens[nombre] = Object.assign(temaTokens[nombre] || {}, decls);
  }

  return { globalTokens, temaTokens };
}

// ---------------------------------------------------------------------
// Resolución de var(--token, fallback) contra el mapa fusionado del tema
// ---------------------------------------------------------------------

// Soporta la única forma de color-mix() que el CSS del proyecto genera:
// dos var() con UN porcentaje explícito en el primer color (el resto va
// al segundo, igual que la spec). No es un motor de CSS genérico — si
// aparece otra forma (colores literales, dos porcentajes, "in oklch",
// etc.) se deja pasar sin resolver a propósito en vez de adivinar.
const RE_COLOR_MIX = /^color-mix\(\s*in\s+srgb\s*,\s*var\((--[\w-]+)\)\s+(\d+(?:\.\d+)?)%\s*,\s*var\((--[\w-]+)\)\s*\)$/;

function resolverValor(valor, mapa, profundidad = 0) {
  if (profundidad > 10) return null; // corta ciclos/cadenas rotas
  const v = valor.trim();

  const mMix = RE_COLOR_MIX.exec(v);
  if (mMix) {
    const [, refA, pctStr, refB] = mMix;
    const colorA = resolverValor(`var(${refA})`, mapa, profundidad + 1);
    const colorB = resolverValor(`var(${refB})`, mapa, profundidad + 1);
    const rgbA = hexARgb(colorA || "");
    const rgbB = hexARgb(colorB || "");
    if (!rgbA || !rgbB) return null;
    const p = parseFloat(pctStr) / 100;
    const mezclar = (a, b) => Math.round(a * p + b * (1 - p));
    const r = mezclar(rgbA.r, rgbB.r);
    const g = mezclar(rgbA.g, rgbB.g);
    const b = mezclar(rgbA.b, rgbB.b);
    return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
  }

  const m = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/.exec(v);
  if (!m) return v;
  const [, ref, fallback] = m;
  if (Object.prototype.hasOwnProperty.call(mapa, ref)) {
    return resolverValor(mapa[ref], mapa, profundidad + 1);
  }
  if (fallback !== undefined) {
    return resolverValor(fallback, mapa, profundidad + 1);
  }
  return null;
}

function resolverToken(nombreToken, mapa) {
  if (!Object.prototype.hasOwnProperty.call(mapa, nombreToken)) return null;
  return resolverValor(mapa[nombreToken], mapa);
}

// ---------------------------------------------------------------------
// Contraste WCAG (luminancia relativa real, no aproximación)
// ---------------------------------------------------------------------

function hexARgb(hex) {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function luminanciaRelativa({ r, g, b }) {
  const canal = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = canal(r);
  const G = canal(g);
  const B = canal(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function ratioContraste(hex1, hex2) {
  const c1 = hexARgb(hex1);
  const c2 = hexARgb(hex2);
  if (!c1 || !c2) return null;
  const l1 = luminanciaRelativa(c1);
  const l2 = luminanciaRelativa(c2);
  const claro = Math.max(l1, l2);
  const oscuro = Math.min(l1, l2);
  return (claro + 0.05) / (oscuro + 0.05);
}

// ---------------------------------------------------------------------
// Reporte
// ---------------------------------------------------------------------

function evaluarTema(nombreTema, mapaFusionado) {
  const filas = [];
  for (const par of PARES_CONTRASTE) {
    const fgValor = resolverToken(par.fg, mapaFusionado);
    const bgValor = resolverToken(par.bg, mapaFusionado);

    if (!fgValor || !bgValor) {
      filas.push({
        ...par,
        estado: "sin-datos",
        detalle: `token no encontrado: ${!fgValor ? par.fg : par.bg}`,
      });
      continue;
    }

    const ratio = ratioContraste(fgValor, bgValor);
    if (ratio === null) {
      filas.push({
        ...par,
        estado: "sin-datos",
        detalle: `valor no es color hex resoluble (${par.fg}=${fgValor}, ${par.bg}=${bgValor})`,
      });
      continue;
    }

    const umbral = UMBRAL[par.tamano];
    filas.push({
      ...par,
      estado: ratio >= umbral ? "pasa" : "falla",
      ratio,
      umbral,
      fgValor,
      bgValor,
    });
  }
  return filas;
}

function imprimirTema(nombreTema, filas, esBonus) {
  const etiqueta = esBonus ? `${nombreTema} (evento, fuera del selector de 10)` : nombreTema;
  console.log(`\n=== Tema: ${etiqueta} ===`);
  for (const fila of filas) {
    const parTxt = `${fila.fg} sobre ${fila.bg} [${fila.tamano}]`;
    if (fila.estado === "sin-datos") {
      console.log(`  ⚠️  ${parTxt} — ${fila.detalle}`);
    } else if (fila.estado === "pasa") {
      console.log(
        `  ✅ ${parTxt} — ${fila.ratio.toFixed(2)}:1 (mínimo ${fila.umbral}:1) — ${fila.nota}`
      );
    } else {
      console.log(
        `  ❌ ${parTxt} — ${fila.ratio.toFixed(2)}:1 (mínimo ${fila.umbral}:1, faltan ${(fila.umbral - fila.ratio).toFixed(2)}) — ${fila.fgValor} sobre ${fila.bgValor} — ${fila.nota}`
      );
    }
  }
}

function main() {
  let cssTexto;
  try {
    cssTexto = fs.readFileSync(RUTA_CSS, "utf8");
  } catch (err) {
    console.error(`No se pudo leer ${RUTA_CSS}: ${err.message}`);
    process.exit(1);
  }

  const { globalTokens, temaTokens } = parsearCss(cssTexto);

  const nombresDisponibles = Object.keys(temaTokens);
  const temasSelector = TEMAS_SELECTOR.filter((t) => nombresDisponibles.includes(t));
  const temasFaltantes = TEMAS_SELECTOR.filter((t) => !nombresDisponibles.includes(t));
  const temasBonus = nombresDisponibles.filter((t) => !TEMAS_SELECTOR.includes(t));

  if (temasFaltantes.length) {
    console.log(
      `⚠️  No se encontraron bloques :root[data-theme="..."] para: ${temasFaltantes.join(", ")}`
    );
  }

  let huboFallo = false;
  let totalPares = 0;
  let totalFallos = 0;
  let totalSinDatos = 0;

  console.log("Validación de contraste WCAG AA — paleta institucional Tecno10mixta");
  console.log(`Umbrales: texto normal >= 4.5:1 · texto grande/bold >= 3:1`);

  for (const nombreTema of temasSelector) {
    const mapaFusionado = { ...globalTokens, ...temaTokens[nombreTema] };
    const filas = evaluarTema(nombreTema, mapaFusionado);
    imprimirTema(nombreTema, filas, false);
    for (const f of filas) {
      totalPares++;
      if (f.estado === "falla") {
        huboFallo = true;
        totalFallos++;
      } else if (f.estado === "sin-datos") {
        totalSinDatos++;
      }
    }
  }

  if (temasBonus.length) {
    console.log(`\n--- Temas de evento adicionales encontrados (no bloquean el resultado) ---`);
    for (const nombreTema of temasBonus) {
      const mapaFusionado = { ...globalTokens, ...temaTokens[nombreTema] };
      const filas = evaluarTema(nombreTema, mapaFusionado);
      // Solo se listan si tienen los tokens base de un tema completo
      // (evita ruido de bloques parciales tipo overrides puntuales).
      if (!mapaFusionado["--color-fondo"]) continue;
      imprimirTema(nombreTema, filas, true);
      // No suman a huboFallo/exit code: no son parte del selector de 10
      // temas, son overrides temporales de config_sitio.tema_evento_activo.
    }
  }

  console.log(
    `\nResumen: ${totalPares} pares evaluados en ${temasSelector.length} temas · ${totalFallos} fallo(s) · ${totalSinDatos} sin datos`
  );

  process.exit(huboFallo ? 1 : 0);
}

main();

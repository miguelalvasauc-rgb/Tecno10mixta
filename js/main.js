/* =========================================================
   Educación Tecnológica 3°C / 3°E — Esc. Sec. No. 10 Mixta
   Lógica de: tema claro/oscuro, filtro por grupo, y
   renderizado de rúbricas, tareas, actividades, proyectos,
   videos y calendario a partir de datos de ejemplo.

   Los datos de ejemplo están listos para sustituirse por
   llamadas a la API de Google Sheets: cada función
   "obtener..." es la única pieza que habría que cambiar.
   ========================================================= */

/* =========================================================
   1. DATOS DE EJEMPLO (placeholder de Google Sheets)
   ========================================================= */

// Cada registro incluye "grupo": 'todos' | '3C' | '3E'
const DATOS_AVISOS = [
  {
    id: "av1",
    grupo: "todos",
    fecha: "2026-07-02",
    titulo: "Cambio de horario del taller",
    descripcion: "La sesión del viernes se recorre una hora por evento escolar.",
    prioridad: "importante",
  },
  {
    id: "av2",
    grupo: "3E",
    fecha: "2026-06-30",
    titulo: "Traer material para impresión 3D",
    descripcion: "Recuerda traer tu USB con el diseño terminado la próxima clase.",
    prioridad: "recordatorio",
  },
  {
    id: "av3",
    grupo: "3C",
    fecha: "2026-06-28",
    titulo: "Grupos de trabajo confirmados",
    descripcion: "Ya están publicados los equipos para el proyecto de robótica.",
    prioridad: "general",
  },
  {
    id: "av4",
    grupo: "todos",
    fecha: "2026-06-25",
    titulo: "Bienvenida al bimestre",
    descripcion: "Consulta la sección de Rúbricas para conocer los criterios de evaluación.",
  },
];

const DATOS_RUBRICAS = [
  {
    id: "r1",
    grupo: "todos",
    titulo: "Rúbrica de proyecto tecnológico",
    descripcion: "Criterios de diseño, funcionalidad, trabajo en equipo y presentación final.",
    ponderacion: "40%",
  },
  {
    id: "r2",
    grupo: "todos",
    titulo: "Rúbrica de bitácora de taller",
    descripcion: "Evalúa el registro diario de actividades, orden y limpieza en el taller.",
    ponderacion: "15%",
  },
  {
    id: "r3",
    grupo: "3C",
    titulo: "Rúbrica de exposición: Robótica básica",
    descripcion: "Claridad, dominio del tema y uso de apoyos visuales en la exposición.",
    ponderacion: "20%",
  },
  {
    id: "r4",
    grupo: "3E",
    titulo: "Rúbrica de exposición: Impresión 3D",
    descripcion: "Claridad, dominio del tema y uso de apoyos visuales en la exposición.",
    ponderacion: "20%",
  },
];

const DATOS_TAREAS = [
  {
    id: "t1",
    grupo: "3C",
    titulo: "Investigación: historia de la robótica",
    descripcion: "Resumen de una cuartilla con al menos tres fuentes confiables.",
    fechaEntrega: "2026-07-10",
    estado: "pendiente",
  },
  {
    id: "t2",
    grupo: "3E",
    titulo: "Diseño de pieza en software CAD",
    descripcion: "Modelar una pieza sencilla para su posterior impresión 3D.",
    fechaEntrega: "2026-07-08",
    estado: "pendiente",
  },
  {
    id: "t3",
    grupo: "todos",
    titulo: "Reglamento del taller firmado",
    descripcion: "Entregar el reglamento de seguridad e higiene firmado por el tutor.",
    fechaEntrega: "2026-07-04",
    estado: "atrasada",
  },
  {
    id: "t4",
    grupo: "3C",
    titulo: "Reporte de práctica: circuito serie-paralelo",
    descripcion: "Reporte con diagrama, mediciones y conclusiones.",
    fechaEntrega: "2026-06-29",
    estado: "entregada",
  },
];

const DATOS_ACTIVIDADES = [
  {
    id: "a1",
    grupo: "todos",
    titulo: "Dinámica de introducción al taller",
    descripcion: "Recorrido por el taller e identificación de herramientas y zonas de seguridad.",
    fecha: "2026-07-03",
  },
  {
    id: "a2",
    grupo: "3C",
    titulo: "Práctica guiada: sensores y actuadores",
    descripcion: "Armado de circuito básico con sensor de luz y LED.",
    fecha: "2026-07-06",
  },
  {
    id: "a3",
    grupo: "3E",
    titulo: "Práctica guiada: primeros pasos en diseño 3D",
    descripcion: "Exploración de herramientas básicas del software de modelado.",
    fecha: "2026-07-06",
  },
];

const DATOS_PROYECTOS = [
  {
    id: "p1",
    grupo: "3C",
    titulo: "Brazo robótico simple",
    descripcion: "Prototipo funcional de brazo robótico controlado con servomotores.",
    avance: 45,
    fechaEntrega: "2026-08-14",
  },
  {
    id: "p2",
    grupo: "3E",
    titulo: "Maqueta impresa en 3D",
    descripcion: "Diseño y fabricación de una maqueta funcional para la feria escolar.",
    avance: 30,
    fechaEntrega: "2026-08-14",
  },
];

const DATOS_VIDEOS = [
  {
    id: "v1",
    grupo: "todos",
    titulo: "Seguridad e higiene en el taller",
    descripcion: "Normas básicas antes de manipular herramientas y equipo.",
    // TODO: reemplazar por el ID real del video de YouTube.
    idYoutube: "REEMPLAZAR_ID_VIDEO_1",
  },
  {
    id: "v2",
    grupo: "3C",
    titulo: "Introducción a la robótica educativa",
    descripcion: "Conceptos básicos de sensores, actuadores y controladores.",
    idYoutube: "REEMPLAZAR_ID_VIDEO_2",
  },
  {
    id: "v3",
    grupo: "3E",
    titulo: "Fundamentos de impresión 3D",
    descripcion: "Cómo funciona una impresora 3D y tipos de filamento.",
    idYoutube: "REEMPLAZAR_ID_VIDEO_3",
  },
];

const DATOS_EVENTOS = [
  { id: "e1", grupo: "todos", titulo: "Entrega reglamento de taller", fecha: "2026-07-04" },
  { id: "e2", grupo: "3E", titulo: "Entrega diseño CAD", fecha: "2026-07-08" },
  { id: "e3", grupo: "3C", titulo: "Entrega investigación de robótica", fecha: "2026-07-10" },
  { id: "e4", grupo: "todos", titulo: "Revisión de avance de proyectos", fecha: "2026-07-24" },
  { id: "e5", grupo: "todos", titulo: "Entrega final de proyectos", fecha: "2026-08-14" },
];

/* =========================================================
   2. "CONECTORES" DE DATOS (aquí se integrará Google Sheets)
   ========================================================= */

// Cada función es async para que, cuando exista la integración,
// baste con sustituir el cuerpo por un fetch a la API de Google
// Sheets, por ejemplo:
//   const resp = await fetch(URL_API_SHEETS + "Rubricas");
//   return await resp.json();
async function obtenerAvisos() {
  return DATOS_AVISOS;
}

async function obtenerRubricas() {
  return DATOS_RUBRICAS;
}

async function obtenerTareas() {
  return DATOS_TAREAS;
}

async function obtenerActividades() {
  return DATOS_ACTIVIDADES;
}

async function obtenerProyectos() {
  return DATOS_PROYECTOS;
}

async function obtenerVideos() {
  return DATOS_VIDEOS;
}

async function obtenerEventos() {
  return DATOS_EVENTOS;
}

/* =========================================================
   3. ESTADO DE LA APLICACIÓN
   ========================================================= */

// Grupo seleccionado actualmente ('todos', '3C' o '3E').
let grupoActual = "todos";

// Tema visual actual. Se guarda solo en esta variable de JS
// (dura mientras exista la pestaña abierta); no se usa localStorage
// a propósito, tal como lo pide el diseño.
let temaActual = "oscuro";

/* =========================================================
   4. UTILIDADES
   ========================================================= */

function elementoCoincideConGrupo(item) {
  return grupoActual === "todos" || item.grupo === "todos" || item.grupo === grupoActual;
}

function textoGrupo(grupo) {
  if (grupo === "todos") return "Todos";
  return grupo === "3C" ? "3°C" : "3°E";
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO + "T00:00:00");
  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function crearBadgeGrupo(grupo) {
  const span = document.createElement("span");
  span.className = "badge-grupo";
  span.textContent = textoGrupo(grupo);
  return span;
}

function textoPrioridad(prioridad) {
  if (prioridad === "importante") return "Importante";
  if (prioridad === "recordatorio") return "Recordatorio";
  return "General";
}

function mostrarSinResultados(contenedor, mensaje) {
  contenedor.innerHTML = "";
  const parrafo = document.createElement("p");
  parrafo.className = "sin-resultados";
  parrafo.textContent = mensaje;
  contenedor.appendChild(parrafo);
}

/* =========================================================
   5. RENDERIZADO DE SECCIONES
   ========================================================= */

async function renderizarAvisos() {
  const contenedor = document.getElementById("contenedor-avisos");
  const datos = (await obtenerAvisos())
    .filter(elementoCoincideConGrupo)
    .sort((a, b) => b.fecha.localeCompare(a.fecha)); // más reciente primero

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay avisos por el momento.");
    return;
  }

  contenedor.innerHTML = "";
  datos.forEach((item) => {
    const fecha = new Date(item.fecha + "T00:00:00");
    const li = document.createElement("li");
    li.className = "aviso-tarjeta";

    const fechaBox = document.createElement("div");
    fechaBox.className = "aviso-tarjeta__fecha";
    const diaSpan = document.createElement("div");
    diaSpan.textContent = String(fecha.getDate());
    const mesSpan = document.createElement("span");
    mesSpan.textContent = fecha.toLocaleDateString("es-MX", { month: "short" });
    fechaBox.append(diaSpan, mesSpan);

    const cuerpo = document.createElement("div");
    cuerpo.className = "aviso-tarjeta__cuerpo";

    const cabecera = document.createElement("div");
    cabecera.className = "aviso-tarjeta__cabecera";
    const titulo = document.createElement("h3");
    titulo.textContent = item.titulo;

    const etiquetas = document.createElement("div");
    etiquetas.className = "aviso-tarjeta__etiquetas";
    etiquetas.appendChild(crearBadgeGrupo(item.grupo));
    if (item.prioridad) {
      const badgePrioridad = document.createElement("span");
      badgePrioridad.className = "badge-prioridad";
      badgePrioridad.dataset.prioridad = item.prioridad;
      badgePrioridad.textContent = textoPrioridad(item.prioridad);
      etiquetas.appendChild(badgePrioridad);
    }

    cabecera.append(titulo, etiquetas);

    const descripcion = document.createElement("p");
    descripcion.textContent = item.descripcion;

    cuerpo.append(cabecera, descripcion);
    li.append(fechaBox, cuerpo);
    contenedor.appendChild(li);
  });
}

async function renderizarRubricas() {
  const contenedor = document.getElementById("contenedor-rubricas");
  const datos = (await obtenerRubricas()).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay rúbricas registradas para este grupo.");
    return;
  }

  contenedor.innerHTML = "";
  datos.forEach((item) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    const cabecera = document.createElement("div");
    cabecera.className = "tarjeta__cabecera";
    const titulo = document.createElement("h3");
    titulo.textContent = item.titulo;
    cabecera.appendChild(titulo);
    cabecera.appendChild(crearBadgeGrupo(item.grupo));

    const descripcion = document.createElement("p");
    descripcion.textContent = item.descripcion;

    const meta = document.createElement("div");
    meta.className = "tarjeta__meta";
    const ponderacion = document.createElement("span");
    ponderacion.className = "badge-estado";
    ponderacion.textContent = "Vale " + item.ponderacion;
    meta.appendChild(ponderacion);

    tarjeta.append(cabecera, descripcion, meta);
    contenedor.appendChild(tarjeta);
  });
}

async function renderizarTareas() {
  const contenedor = document.getElementById("contenedor-tareas");
  const datos = (await obtenerTareas()).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay tareas registradas para este grupo.");
    return;
  }

  contenedor.innerHTML = "";
  datos.forEach((item) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    const cabecera = document.createElement("div");
    cabecera.className = "tarjeta__cabecera";
    const titulo = document.createElement("h3");
    titulo.textContent = item.titulo;
    cabecera.appendChild(titulo);
    cabecera.appendChild(crearBadgeGrupo(item.grupo));

    const descripcion = document.createElement("p");
    descripcion.textContent = item.descripcion;

    const fecha = document.createElement("p");
    fecha.className = "tarjeta__fecha";
    fecha.textContent = "Entrega: " + formatearFecha(item.fechaEntrega);

    const meta = document.createElement("div");
    meta.className = "tarjeta__meta";
    const estado = document.createElement("span");
    estado.className = "badge-estado";
    estado.dataset.estado = item.estado;
    estado.textContent = item.estado.charAt(0).toUpperCase() + item.estado.slice(1);
    meta.appendChild(estado);

    tarjeta.append(cabecera, descripcion, fecha, meta);
    contenedor.appendChild(tarjeta);
  });
}

async function renderizarActividades() {
  const contenedor = document.getElementById("contenedor-actividades");
  const datos = (await obtenerActividades()).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay actividades registradas para este grupo.");
    return;
  }

  contenedor.innerHTML = "";
  datos.forEach((item) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    const cabecera = document.createElement("div");
    cabecera.className = "tarjeta__cabecera";
    const titulo = document.createElement("h3");
    titulo.textContent = item.titulo;
    cabecera.appendChild(titulo);
    cabecera.appendChild(crearBadgeGrupo(item.grupo));

    const descripcion = document.createElement("p");
    descripcion.textContent = item.descripcion;

    const fecha = document.createElement("p");
    fecha.className = "tarjeta__fecha";
    fecha.textContent = "Fecha: " + formatearFecha(item.fecha);

    tarjeta.append(cabecera, descripcion, fecha);
    contenedor.appendChild(tarjeta);
  });
}

async function renderizarProyectos() {
  const contenedor = document.getElementById("contenedor-proyectos");
  const datos = (await obtenerProyectos()).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay proyectos registrados para este grupo.");
    return;
  }

  contenedor.innerHTML = "";
  datos.forEach((item) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    const cabecera = document.createElement("div");
    cabecera.className = "tarjeta__cabecera";
    const titulo = document.createElement("h3");
    titulo.textContent = item.titulo;
    cabecera.appendChild(titulo);
    cabecera.appendChild(crearBadgeGrupo(item.grupo));

    const descripcion = document.createElement("p");
    descripcion.textContent = item.descripcion;

    const fecha = document.createElement("p");
    fecha.className = "tarjeta__fecha";
    fecha.textContent = "Entrega final: " + formatearFecha(item.fechaEntrega);

    const barra = document.createElement("div");
    barra.className = "barra-progreso";
    barra.setAttribute("role", "progressbar");
    barra.setAttribute("aria-valuenow", String(item.avance));
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", "100");
    barra.setAttribute("aria-label", "Avance del proyecto: " + item.avance + "%");
    const relleno = document.createElement("div");
    relleno.className = "barra-progreso__relleno";
    relleno.style.width = item.avance + "%";
    barra.appendChild(relleno);

    const textoAvance = document.createElement("p");
    textoAvance.className = "tarjeta__fecha";
    textoAvance.textContent = "Avance: " + item.avance + "%";

    tarjeta.append(cabecera, descripcion, fecha, barra, textoAvance);
    contenedor.appendChild(tarjeta);
  });
}

async function renderizarVideos() {
  const contenedor = document.getElementById("contenedor-videos");
  const datos = (await obtenerVideos()).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay videos registrados para este grupo.");
    return;
  }

  contenedor.innerHTML = "";
  datos.forEach((item) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-video";

    const marco = document.createElement("div");
    marco.className = "tarjeta-video__marco";
    const iframe = document.createElement("iframe");
    // NOTA: "idYoutube" es un placeholder. Sustituir por el ID real
    // del video (la parte final de la URL youtube.com/watch?v=ID).
    iframe.src = "https://www.youtube.com/embed/" + item.idYoutube;
    iframe.title = item.titulo;
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    marco.appendChild(iframe);

    const info = document.createElement("div");
    info.className = "tarjeta-video__info";
    const titulo = document.createElement("h3");
    titulo.textContent = item.titulo;
    const descripcion = document.createElement("p");
    descripcion.textContent = item.descripcion;
    info.append(titulo, descripcion);

    tarjeta.append(marco, info);
    contenedor.appendChild(tarjeta);
  });
}

/* =========================================================
   6. CALENDARIO
   ========================================================= */

const NOMBRES_DIA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatearClaveFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

async function renderizarCalendario() {
  const eventos = (await obtenerEventos()).filter(elementoCoincideConGrupo);
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();

  // --- Cabecera con mes y año ---
  const cabecera = document.getElementById("calendario-cabecera");
  const nombreMes = hoy.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  cabecera.textContent = nombreMes;

  // --- Cuadrícula del mes actual ---
  const grid = document.getElementById("calendario-grid");
  grid.innerHTML = "";

  NOMBRES_DIA.forEach((nombre) => {
    const celda = document.createElement("div");
    celda.className = "calendario__dia-nombre";
    celda.textContent = nombre;
    grid.appendChild(celda);
  });

  const primerDiaSemana = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const clavesConEvento = new Set(eventos.map((evento) => evento.fecha));
  const claveHoy = formatearClaveFecha(hoy);

  for (let i = 0; i < primerDiaSemana; i++) {
    const vacio = document.createElement("div");
    vacio.className = "calendario__dia calendario__dia--vacio";
    grid.appendChild(vacio);
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const claveDia = formatearClaveFecha(new Date(anio, mes, dia));
    const celda = document.createElement("div");
    celda.className = "calendario__dia";
    celda.setAttribute("role", "gridcell");
    celda.textContent = String(dia);

    if (claveDia === claveHoy) {
      celda.classList.add("calendario__dia--hoy");
    }
    if (clavesConEvento.has(claveDia)) {
      celda.classList.add("calendario__dia--evento");
    }
    grid.appendChild(celda);
  }

  // --- Lista de próximas fechas (incluye meses futuros) ---
  const lista = document.getElementById("lista-eventos");
  lista.innerHTML = "";

  const proximos = eventos
    .filter((evento) => new Date(evento.fecha + "T00:00:00") >= new Date(claveHoy + "T00:00:00"))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  if (proximos.length === 0) {
    mostrarSinResultados(lista, "No hay próximas fechas para este grupo.");
    return;
  }

  proximos.forEach((evento) => {
    const fecha = new Date(evento.fecha + "T00:00:00");
    const item = document.createElement("li");
    item.className = "evento-item";

    const fechaBox = document.createElement("div");
    fechaBox.className = "evento-item__fecha";
    const diaSpan = document.createElement("div");
    diaSpan.textContent = String(fecha.getDate());
    const mesSpan = document.createElement("span");
    mesSpan.textContent = fecha.toLocaleDateString("es-MX", { month: "short" });
    fechaBox.append(diaSpan, mesSpan);

    const info = document.createElement("div");
    info.className = "evento-item__info";
    const titulo = document.createElement("h4");
    titulo.textContent = evento.titulo;
    const grupoTexto = document.createElement("p");
    grupoTexto.textContent = "Grupo: " + textoGrupo(evento.grupo);
    info.append(titulo, grupoTexto);

    item.append(fechaBox, info);
    lista.appendChild(item);
  });
}

/* =========================================================
   7. TEMA CLARO / OSCURO
   ========================================================= */

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);

  const boton = document.getElementById("boton-tema");
  const esOscuro = tema === "oscuro";

  boton.setAttribute("aria-pressed", String(esOscuro));
  boton.setAttribute("aria-label", esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  boton.querySelector(".boton-tema__icono").textContent = esOscuro ? "☀️" : "🌙";
  boton.querySelector(".boton-tema__texto").textContent = esOscuro ? "Modo claro" : "Modo oscuro";
}

function alternarTema() {
  // Solo se actualiza la variable en memoria: al recargar la página
  // el sitio vuelve al tema por defecto (no se usa localStorage).
  temaActual = temaActual === "oscuro" ? "claro" : "oscuro";
  aplicarTema(temaActual);
}

/* =========================================================
   8. MENÚ MÓVIL Y FILTRO DE GRUPO
   ========================================================= */

function alternarMenuMovil() {
  const nav = document.getElementById("nav-principal");
  const boton = document.getElementById("boton-menu");
  const abierto = nav.classList.toggle("abierto");
  boton.setAttribute("aria-expanded", String(abierto));
}

async function renderizarTodo() {
  await Promise.all([
    renderizarAvisos(),
    renderizarRubricas(),
    renderizarTareas(),
    renderizarActividades(),
    renderizarProyectos(),
    renderizarVideos(),
    renderizarCalendario(),
  ]);
}

async function alCambiarGrupo(evento) {
  grupoActual = evento.target.value;
  await renderizarTodo();
}

/* =========================================================
   9. INICIALIZACIÓN
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  aplicarTema(temaActual);
  renderizarTodo();

  document.getElementById("boton-tema").addEventListener("click", alternarTema);
  document.getElementById("selector-grupo").addEventListener("change", alCambiarGrupo);
  document.getElementById("boton-menu").addEventListener("click", alternarMenuMovil);
});

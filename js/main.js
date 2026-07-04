/* =========================================================
   Educación Tecnológica 3°C / 3°E — Esc. Sec. No. 10 Mixta
   Lógica compartida por las 4 páginas del sitio (portada y
   trimestre-1/2/3): tema claro/oscuro, filtro por grupo, y
   renderizado de avisos, calendario, rúbricas, tareas,
   actividades, proyectos y videos a partir de datos de ejemplo.

   Cada página solo tiene en el DOM los contenedores que le
   corresponden (la portada no tiene #contenedor-rubricas, los
   trimestres no tienen #contenedor-avisos, etc.), así que cada
   función de renderizado se sale sin hacer nada si no encuentra
   su contenedor. Esto permite usar un único main.js para todo
   el sitio.

   Los datos de ejemplo están listos para sustituirse por
   llamadas a la API de Google Sheets: cada función
   "obtener..." es la única pieza que habría que cambiar
   (idealmente una pestaña de Sheets por trimestre).
   ========================================================= */

/* =========================================================
   1. DATOS DE EJEMPLO (placeholder de Google Sheets)
   ========================================================= */

// Avisos y calendario son generales: no cambian por trimestre.
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
    descripcion: "Elige tu trimestre para consultar rúbricas y tareas vigentes.",
  },
];

const DATOS_EVENTOS = [
  { id: "e1", grupo: "todos", titulo: "Entrega reglamento de taller", fecha: "2026-07-04" },
  { id: "e2", grupo: "3E", titulo: "Entrega diseño CAD", fecha: "2026-07-08" },
  { id: "e3", grupo: "3C", titulo: "Entrega investigación de robótica", fecha: "2026-07-10" },
  { id: "e4", grupo: "todos", titulo: "Revisión de avance de proyectos", fecha: "2026-07-24" },
  { id: "e5", grupo: "todos", titulo: "Entrega final de proyectos", fecha: "2026-08-14" },
];

// El resto del contenido SÍ depende del trimestre. Cada constante es un
// objeto { 1: [...], 2: [...], 3: [...] } para que, más adelante, cada
// clave se pueda mapear a su propia pestaña de Google Sheets.
const DATOS_RUBRICAS = {
  1: [
    {
      id: "r1",
      grupo: "todos",
      titulo: "Rúbrica de bitácora de taller",
      descripcion: "Evalúa el registro diario de actividades, orden y limpieza en el taller.",
      ponderacion: "15%",
    },
    {
      id: "r2",
      grupo: "todos",
      titulo: "Rúbrica de exposición: introducción a la tecnología",
      descripcion: "Claridad, dominio del tema y uso de apoyos visuales en la exposición.",
      ponderacion: "20%",
    },
    {
      id: "r3",
      grupo: "3C",
      titulo: "Rúbrica de práctica: herramientas de mano",
      descripcion: "Uso correcto y seguro de herramientas básicas del taller.",
      ponderacion: "15%",
    },
    {
      id: "r4",
      grupo: "3E",
      titulo: "Rúbrica de práctica: uso del multímetro",
      descripcion: "Mediciones correctas de voltaje, corriente y resistencia.",
      ponderacion: "15%",
    },
  ],
  2: [
    {
      id: "r1",
      grupo: "todos",
      titulo: "Rúbrica de programación básica (Arduino)",
      descripcion: "Lógica del programa, comentarios y funcionamiento del circuito.",
      ponderacion: "25%",
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
      titulo: "Rúbrica de exposición: sensores y actuadores",
      descripcion: "Claridad, dominio del tema y uso de apoyos visuales en la exposición.",
      ponderacion: "20%",
    },
    {
      id: "r4",
      grupo: "3E",
      titulo: "Rúbrica de exposición: diseño asistido por computadora",
      descripcion: "Claridad, dominio del tema y uso de apoyos visuales en la exposición.",
      ponderacion: "20%",
    },
  ],
  3: [
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
      titulo: "Rúbrica de exposición: robótica básica",
      descripcion: "Claridad, dominio del tema y uso de apoyos visuales en la exposición.",
      ponderacion: "20%",
    },
    {
      id: "r4",
      grupo: "3E",
      titulo: "Rúbrica de exposición: impresión 3D",
      descripcion: "Claridad, dominio del tema y uso de apoyos visuales en la exposición.",
      ponderacion: "20%",
    },
  ],
};

const DATOS_TAREAS = {
  1: [
    {
      id: "t1",
      grupo: "todos",
      titulo: "Investigación: evolución de la tecnología",
      descripcion: "Línea del tiempo con al menos tres fuentes confiables.",
      fechaEntrega: "2025-09-12",
      estado: "entregada",
    },
    {
      id: "t2",
      grupo: "todos",
      titulo: "Reglamento del taller firmado",
      descripcion: "Entregar el reglamento de seguridad e higiene firmado por el tutor.",
      fechaEntrega: "2025-08-29",
      estado: "entregada",
    },
    {
      id: "t3",
      grupo: "3C",
      titulo: "Reporte de práctica: uso seguro de herramientas",
      descripcion: "Reporte con fotografías y conclusiones de la práctica.",
      fechaEntrega: "2025-10-03",
      estado: "entregada",
    },
    {
      id: "t4",
      grupo: "3E",
      titulo: "Reporte de práctica: uso del multímetro",
      descripcion: "Reporte con mediciones y conclusiones de la práctica.",
      fechaEntrega: "2025-10-03",
      estado: "entregada",
    },
  ],
  2: [
    {
      id: "t1",
      grupo: "3C",
      titulo: "Programa básico en Arduino: parpadeo de LED",
      descripcion: "Código comentado y evidencia en video del circuito funcionando.",
      fechaEntrega: "2026-01-16",
      estado: "entregada",
    },
    {
      id: "t2",
      grupo: "3E",
      titulo: "Diseño de pieza en CAD paramétrico",
      descripcion: "Modelar una pieza con al menos dos medidas ajustables.",
      fechaEntrega: "2026-01-16",
      estado: "entregada",
    },
    {
      id: "t3",
      grupo: "todos",
      titulo: "Bitácora de avance de sensores",
      descripcion: "Registro semanal de pruebas con sensores en clase.",
      fechaEntrega: "2026-02-06",
      estado: "entregada",
    },
    {
      id: "t4",
      grupo: "3C",
      titulo: "Reporte de práctica: sensores de temperatura",
      descripcion: "Reporte con diagrama, mediciones y conclusiones.",
      fechaEntrega: "2025-12-12",
      estado: "atrasada",
    },
  ],
  3: [
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
  ],
};

const DATOS_ACTIVIDADES = {
  1: [
    {
      id: "a1",
      grupo: "todos",
      titulo: "Recorrido e identificación de herramientas",
      descripcion: "Recorrido por el taller e identificación de herramientas y zonas de seguridad.",
      fecha: "2025-08-25",
    },
    {
      id: "a2",
      grupo: "3C",
      titulo: "Práctica: uso de calibrador y flexómetro",
      descripcion: "Mediciones básicas sobre distintos materiales.",
      fecha: "2025-09-05",
    },
    {
      id: "a3",
      grupo: "3E",
      titulo: "Práctica: introducción a software CAD",
      descripcion: "Exploración de la interfaz y herramientas básicas de dibujo.",
      fecha: "2025-09-05",
    },
  ],
  2: [
    {
      id: "a1",
      grupo: "3C",
      titulo: "Práctica guiada: circuitos con Arduino",
      descripcion: "Armado de circuito con botón y salida digital.",
      fecha: "2025-11-21",
    },
    {
      id: "a2",
      grupo: "3E",
      titulo: "Práctica guiada: modelado intermedio en CAD",
      descripcion: "Modelado de piezas con ensamble simple.",
      fecha: "2025-11-21",
    },
    {
      id: "a3",
      grupo: "todos",
      titulo: "Dinámica: lluvia de ideas del proyecto integrador",
      descripcion: "Formación de equipos y propuesta inicial de proyecto.",
      fecha: "2026-02-13",
    },
  ],
  3: [
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
  ],
};

const DATOS_PROYECTOS = {
  1: [
    {
      id: "p1",
      grupo: "3C",
      titulo: "Linterna con circuito serie-paralelo",
      descripcion: "Prototipo funcional armado con material reciclado.",
      avance: 100,
      fechaEntrega: "2025-11-07",
    },
    {
      id: "p2",
      grupo: "3E",
      titulo: "Llavero impreso en 3D",
      descripcion: "Diseño y fabricación de un llavero personalizado.",
      avance: 100,
      fechaEntrega: "2025-11-07",
    },
  ],
  2: [
    {
      id: "p1",
      grupo: "3C",
      titulo: "Semáforo automatizado con Arduino",
      descripcion: "Control de tiempos con LEDs y programación por software.",
      avance: 100,
      fechaEntrega: "2026-03-06",
    },
    {
      id: "p2",
      grupo: "3E",
      titulo: "Pieza mecánica ensamblable",
      descripcion: "Diseño e impresión de dos piezas que ensamblan entre sí.",
      avance: 100,
      fechaEntrega: "2026-03-06",
    },
  ],
  3: [
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
  ],
};

const DATOS_VIDEOS = {
  1: [
    {
      id: "v1",
      grupo: "todos",
      titulo: "Historia y evolución de la tecnología",
      descripcion: "Panorama general de los avances tecnológicos más relevantes.",
      // TODO: reemplazar por el ID real del video de YouTube.
      idYoutube: "REEMPLAZAR_ID_VIDEO_T1_1",
    },
    {
      id: "v2",
      grupo: "3C",
      titulo: "Uso seguro de herramientas de mano",
      descripcion: "Recomendaciones antes de manipular herramientas del taller.",
      idYoutube: "REEMPLAZAR_ID_VIDEO_T1_2",
    },
    {
      id: "v3",
      grupo: "3E",
      titulo: "Introducción al diseño asistido por computadora",
      descripcion: "Primeros pasos para modelar en un software CAD.",
      idYoutube: "REEMPLAZAR_ID_VIDEO_T1_3",
    },
  ],
  2: [
    {
      id: "v1",
      grupo: "3C",
      titulo: "Introducción a Arduino",
      descripcion: "Qué es un microcontrolador y para qué se usa.",
      idYoutube: "REEMPLAZAR_ID_VIDEO_T2_1",
    },
    {
      id: "v2",
      grupo: "todos",
      titulo: "Sensores y actuadores comunes",
      descripcion: "Ejemplos de sensores y actuadores usados en proyectos escolares.",
      idYoutube: "REEMPLAZAR_ID_VIDEO_T2_2",
    },
    {
      id: "v3",
      grupo: "3E",
      titulo: "Modelado 3D intermedio",
      descripcion: "Ensambles simples y preparación de piezas para imprimir.",
      idYoutube: "REEMPLAZAR_ID_VIDEO_T2_3",
    },
  ],
  3: [
    {
      id: "v1",
      grupo: "todos",
      titulo: "Seguridad e higiene en el taller",
      descripcion: "Normas básicas antes de manipular herramientas y equipo.",
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
  ],
};

/* =========================================================
   2. "CONECTORES" DE DATOS (aquí se integrará Google Sheets)
   ========================================================= */

// Cada función es async para que, cuando exista la integración,
// baste con sustituir el cuerpo por un fetch a la API de Google
// Sheets, por ejemplo:
//   const resp = await fetch(URL_API_SHEETS + "Avisos");
//   return await resp.json();
async function obtenerAvisos() {
  return DATOS_AVISOS;
}

async function obtenerEventos() {
  return DATOS_EVENTOS;
}

// Estas funciones sí reciben el trimestre (1, 2 o 3). Cuando se conecte
// Google Sheets, lo natural es que cada trimestre lea de su propia hoja,
// por ejemplo:
//   const resp = await fetch(URL_API_SHEETS + "Rubricas_T" + trimestre);
//   return await resp.json();
async function obtenerRubricas(trimestre) {
  return DATOS_RUBRICAS[trimestre] || [];
}

async function obtenerTareas(trimestre) {
  return DATOS_TAREAS[trimestre] || [];
}

async function obtenerActividades(trimestre) {
  return DATOS_ACTIVIDADES[trimestre] || [];
}

async function obtenerProyectos(trimestre) {
  return DATOS_PROYECTOS[trimestre] || [];
}

async function obtenerVideos(trimestre) {
  return DATOS_VIDEOS[trimestre] || [];
}

/* =========================================================
   3. ESTADO DE LA APLICACIÓN
   ========================================================= */

// Claves usadas en localStorage para que el grupo y el tema se
// mantengan al navegar entre la portada y las páginas de trimestre.
const CLAVE_GRUPO = "grupoSeleccionado";
const CLAVE_TEMA = "temaSeleccionado";

// Grupo seleccionado actualmente ('todos', '3C' o '3E'). Se recupera
// de localStorage para que la elección sobreviva a la navegación
// entre páginas; si no hay nada guardado, se usa "todos".
let grupoActual = localStorage.getItem(CLAVE_GRUPO) || "todos";

// Tema visual actual ('oscuro' o 'claro'). También se recupera de
// localStorage por la misma razón que el grupo.
let temaActual = localStorage.getItem(CLAVE_TEMA) || "oscuro";

// Trimestre de la página actual ('1', '2' o '3'), tomado de
// <body data-trimestre="…">. En la portada (index.html) no existe
// ese atributo, por lo que queda en null.
const TRIMESTRE_ACTUAL = document.body.dataset.trimestre || null;

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

// NOTA: cada función revisa si su contenedor existe en la página
// actual antes de hacer nada. Así, un mismo main.js sirve tanto
// para la portada (avisos y calendario) como para las páginas de
// trimestre (rúbricas, tareas, actividades, proyectos y videos)
// sin necesidad de duplicar el script.

async function renderizarAvisos() {
  const contenedor = document.getElementById("contenedor-avisos");
  if (!contenedor) return;

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
  if (!contenedor) return;

  const datos = (await obtenerRubricas(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

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
  if (!contenedor) return;

  const datos = (await obtenerTareas(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

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
  if (!contenedor) return;

  const datos = (await obtenerActividades(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

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
  if (!contenedor) return;

  const datos = (await obtenerProyectos(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

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
  if (!contenedor) return;

  const datos = (await obtenerVideos(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

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
  const cabecera = document.getElementById("calendario-cabecera");
  if (!cabecera) return;

  const eventos = (await obtenerEventos()).filter(elementoCoincideConGrupo);
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();

  // --- Cabecera con mes y año ---
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
  // Se guarda en localStorage para que el tema no se reinicie al
  // navegar entre la portada y las páginas de trimestre.
  temaActual = temaActual === "oscuro" ? "claro" : "oscuro";
  localStorage.setItem(CLAVE_TEMA, temaActual);
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
    renderizarCalendario(),
    renderizarRubricas(),
    renderizarTareas(),
    renderizarActividades(),
    renderizarProyectos(),
    renderizarVideos(),
  ]);
}

async function alCambiarGrupo(evento) {
  // Se guarda en localStorage para que el grupo elegido no se pierda
  // al navegar entre la portada y las páginas de trimestre.
  grupoActual = evento.target.value;
  localStorage.setItem(CLAVE_GRUPO, grupoActual);
  await renderizarTodo();
}

/* =========================================================
   9. INICIALIZACIÓN
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  aplicarTema(temaActual);

  // Sincroniza el <select> con el grupo recuperado de localStorage
  // (por defecto el HTML trae seleccionado "todos").
  document.getElementById("selector-grupo").value = grupoActual;

  renderizarTodo();

  document.getElementById("boton-tema").addEventListener("click", alternarTema);
  document.getElementById("selector-grupo").addEventListener("change", alCambiarGrupo);
  document.getElementById("boton-menu").addEventListener("click", alternarMenuMovil);
});

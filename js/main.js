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
    fecha: "2026-08-31",
    titulo: "Bienvenida al ciclo escolar 2026-2027",
    descripcion: "Hoy inician clases. Consulta el trimestre vigente para ver temario, rúbricas y tareas.",
    prioridad: "importante",
  },
  {
    id: "av2",
    grupo: "todos",
    fecha: "2026-09-16",
    titulo: "Suspensión de labores: Independencia de México",
    descripcion: "No hay clases este día. Se reanudan actividades con normalidad al siguiente día hábil.",
    prioridad: "recordatorio",
  },
  {
    id: "av3",
    grupo: "todos",
    fecha: "2026-12-21",
    titulo: "Inicia el receso invernal",
    descripcion: "Sin clases del 21 de diciembre de 2026 al 6 de enero de 2027. El regreso a clases es el 7 de enero.",
    prioridad: "importante",
  },
  {
    id: "av4",
    grupo: "todos",
    fecha: "2027-03-22",
    titulo: "Inicia el receso de Semana Santa",
    descripcion: "Sin clases del 22 de marzo al 2 de abril de 2027. El regreso a clases es el 5 de abril.",
    prioridad: "importante",
  },
];

// Horario de clases de Educación Tecnológica por grupo.
const DATOS_HORARIO = [
  { id: "h1", grupo: "3C", dia: "Lunes", horaInicio: "11:40", horaFin: "1:20 pm" },
  { id: "h2", grupo: "3C", dia: "Martes", horaInicio: "12:30", horaFin: "1:20 pm" },
  { id: "h3", grupo: "3E", dia: "Martes", horaInicio: "7:00", horaFin: "7:50 am" },
  { id: "h4", grupo: "3E", dia: "Martes", horaInicio: "10:50", horaFin: "11:40 am" },
  { id: "h5", grupo: "3E", dia: "Miércoles", horaInicio: "7:00", horaFin: "7:50 am" },
];

// Calendario oficial del ciclo escolar SEP 2026-2027 (agosto 2026 a julio
// 2027): "tipo de día" del ciclo (vacaciones, CTE, suspensión, etc.), un
// concepto DISTINTO de eventos_calendario/TAREAS/ACTIVIDADES/PROYECTOS (eso es
// "hay algo entregable ese día"; esto es "qué tipo de día es"). No se
// filtra por grupo: aplica igual a 3°C y 3°E.
//
// Fuente: calendario oficial SEP 2026-2027, confirmado. Todos los
// registros están verificado:true. Los periodos de varios días
// (vacaciones, CTE Fase Intensiva) se expanden a un registro por cada
// fecha del rango porque TIPOS_DIA_POR_FECHA busca por día exacto.
//
// Nota sobre el 4 y 5 de enero de 2027: son talleres docentes, pero para
// los alumnos son continuación del receso de invierno (sin clases), así
// que se marcan como "vacaciones". El 6 de enero (Día de Reyes) también
// se marca como "vacaciones" (continuación del receso para alumnos) en
// vez de "suspension" aparte. El regreso real a clases es el 7 de enero.
//
// Tipos válidos: "inicio", "fin", "vacaciones", "cte-intensiva",
// "cte-ordinaria", "suspension", "evaluacion"
const CALENDARIO_ESCOLAR_2026_2027 = [
  // --- CTE Fase Intensiva (regreso de docentes) ---
  { fecha: "2026-08-24", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva (sin clases)", verificado: true },
  { fecha: "2026-08-25", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva (sin clases)", verificado: true },
  { fecha: "2026-08-26", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva (sin clases)", verificado: true },
  { fecha: "2026-08-27", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva (sin clases)", verificado: true },
  { fecha: "2026-08-28", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva (sin clases)", verificado: true },

  // --- Inicio / fin de clases ---
  { fecha: "2026-08-31", tipo: "inicio", etiqueta: "Inicio de clases", verificado: true },
  { fecha: "2027-07-09", tipo: "fin", etiqueta: "Fin de clases", verificado: true },

  // --- Suspensión de labores (asuetos oficiales, día único) ---
  { fecha: "2026-09-16", tipo: "suspension", etiqueta: "Independencia de México", verificado: true },
  { fecha: "2026-11-02", tipo: "suspension", etiqueta: "Día de Muertos", verificado: true },
  { fecha: "2026-11-16", tipo: "suspension", etiqueta: "Revolución Mexicana", verificado: true },
  { fecha: "2027-02-01", tipo: "suspension", etiqueta: "Día de la Constitución", verificado: true },
  { fecha: "2027-03-15", tipo: "suspension", etiqueta: "Natalicio de Benito Juárez", verificado: true },
  { fecha: "2027-05-05", tipo: "suspension", etiqueta: "Batalla de Puebla", verificado: true },

  // --- CTE Sesión Ordinaria (un viernes al mes, sin clases para alumnos) ---
  { fecha: "2026-09-25", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria (sin clases)", verificado: true },
  { fecha: "2026-10-30", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria (sin clases)", verificado: true },
  { fecha: "2026-11-27", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria (sin clases)", verificado: true },
  { fecha: "2027-01-29", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria (sin clases)", verificado: true },
  { fecha: "2027-02-26", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria (sin clases)", verificado: true },
  { fecha: "2027-04-30", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria (sin clases)", verificado: true },
  { fecha: "2027-05-28", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria (sin clases)", verificado: true },
  { fecha: "2027-06-25", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria (sin clases)", verificado: true },

  // --- Vacaciones de Invierno (21 dic 2026 al 6 ene 2027, + 4-5 ene
  // como continuación de receso para alumnos; el regreso a clases es el
  // 7 de enero) ---
  { fecha: "2026-12-21", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-22", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-23", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-24", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-25", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-26", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-27", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-28", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-29", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-30", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2026-12-31", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2027-01-01", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno (incluye Año Nuevo)", verificado: true },
  { fecha: "2027-01-02", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2027-01-03", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno", verificado: true },
  { fecha: "2027-01-04", tipo: "vacaciones", etiqueta: "Continuación de receso (talleres docentes, sin clases)", verificado: true },
  { fecha: "2027-01-05", tipo: "vacaciones", etiqueta: "Continuación de receso (talleres docentes, sin clases)", verificado: true },
  { fecha: "2027-01-06", tipo: "vacaciones", etiqueta: "Vacaciones de Invierno (incluye Día de Reyes)", verificado: true },

  // --- Vacaciones de Semana Santa (22 mar al 2 abr 2027) ---
  { fecha: "2027-03-22", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-03-23", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-03-24", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-03-25", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-03-26", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-03-27", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-03-28", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-03-29", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-03-30", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-03-31", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-04-01", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },
  { fecha: "2027-04-02", tipo: "vacaciones", etiqueta: "Vacaciones de Semana Santa", verificado: true },

  // --- Evaluación trimestral ---
  { fecha: "2026-11-13", tipo: "evaluacion", etiqueta: "Evaluación Trimestre 1", verificado: true },
  { fecha: "2027-03-05", tipo: "evaluacion", etiqueta: "Evaluación Trimestre 2", verificado: true },
  { fecha: "2027-07-02", tipo: "evaluacion", etiqueta: "Evaluación Trimestre 3", verificado: true },
];

// El resto del contenido SÍ depende del trimestre. Cada constante es un
// objeto { 1: [...], 2: [...], 3: [...] } para que, más adelante, cada
// clave se pueda mapear a su propia pestaña de Google Sheets.
// "niveles" describe los 4 niveles de desempeño de cada rúbrica
// (Excelente, Bueno, Regular, Deficiente) sobre una escala de 0 a 20
// puntos. La tarjeta de rúbrica los muestra al expandirse.
const DATOS_RUBRICAS = {
  1: [
    // ===== PROYECTO: MI CHATBOT EN PAPEL (Secuencia 1 - IA) =====
    {
      id: "s1c1",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "🧠 Conceptualización de IA",
      descripcion: "Evalúa qué tan bien el alumno define y ejemplifica los conceptos de IA, Machine Learning y Procesamiento de Lenguaje Natural (NLP).",
      ponderacion: "4 de 24 pts — Proyecto: Mi Chatbot en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Define IA, ML y NLP con ejemplos propios y claros." },
        { nivel: "Bueno", puntos: "3", descripcion: "Define IA y ML con ejemplos del libro o básicos." },
        { nivel: "Regular", puntos: "2", descripcion: "Define IA de forma vaga, confunde términos." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No logra definir IA, copia definiciones sin entender." },
      ],
    },
    {
      id: "s1c2",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "🤖 Uso de Asistentes Virtuales",
      descripcion: "Evalúa la identificación de funciones de asistentes virtuales (Siri, Alexa, Google Assistant) y propuestas de mejora.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Chatbot en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Identifica 5+ funciones de asistentes y propone mejoras." },
        { nivel: "Bueno", puntos: "3", descripcion: "Identifica 3-4 funciones de asistentes virtuales." },
        { nivel: "Regular", puntos: "2", descripcion: "Identifica 1-2 funciones básicas de asistentes." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No identifica funciones de asistentes virtuales." },
      ],
    },
    {
      id: "s1c3",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "💬 Diseño de Chatbot",
      descripcion: "Evalúa la lógica y creatividad del árbol de decisión del chatbot elaborado en papel.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Chatbot en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diseña chatbot con 8+ interacciones lógicas y creativas." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diseña chatbot con 5-7 interacciones coherentes." },
        { nivel: "Regular", puntos: "2", descripcion: "Diseña chatbot con 3-4 interacciones simples." },
        { nivel: "Deficiente", puntos: "1", descripcion: "Chatbot incompleto o sin lógica de diálogo." },
      ],
    },
    {
      id: "s1c4",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "🎨 IA en Creatividad",
      descripcion: "Evalúa las propuestas creativas del alumno sobre cómo la IA puede apoyar procesos artísticos.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Chatbot en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Genera 3+ propuestas creativas usando IA (dibujo/texto)." },
        { nivel: "Bueno", puntos: "3", descripcion: "Genera 2 propuestas creativas con ayuda de IA." },
        { nivel: "Regular", puntos: "2", descripcion: "Genera 1 propuesta creativa con mucha ayuda." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No genera propuestas creativas." },
      ],
    },
    {
      id: "s1c5",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "🤝 Trabajo Colaborativo",
      descripcion: "Evalúa la participación, liderazgo y aporte del alumno durante el desarrollo del proyecto.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Chatbot en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Lidera equipo, distribuye tareas y motiva a todos." },
        { nivel: "Bueno", puntos: "3", descripcion: "Participa activamente, respeta turnos y aporta ideas." },
        { nivel: "Regular", puntos: "2", descripcion: "Participa poco, necesita recordatorios del docente." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No participa o dificulta el trabajo del equipo." },
      ],
    },
    {
      id: "s1c6",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "📝 Presentación y Ortografía",
      descripcion: "Evalúa la calidad, ortografía y estructura del documento final entregado.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Chatbot en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Documento impecable, sin errores, estructura profesional." },
        { nivel: "Bueno", puntos: "3", descripcion: "Mínimos errores, estructura clara y legible." },
        { nivel: "Regular", puntos: "2", descripcion: "Errores frecuentes, estructura desorganizada." },
        { nivel: "Deficiente", puntos: "1", descripcion: "Documento ilegible, plagio evidente o no entrega." },
      ],
    },

    // ===== PROYECTO: MI METAVERSO EDUCATIVO (Secuencia 2 - RV) =====
    {
      id: "s2c1",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "🥽 Diferenciación AR/VR/MR",
      descripcion: "Evalúa la capacidad de distinguir Realidad Aumentada, Virtual y Mixta con ejemplos propios.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Metaverso Educativo",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diferencia AR/VR/MR con 5+ ejemplos propios de cada uno." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diferencia AR/VR con 3-4 ejemplos de cada uno." },
        { nivel: "Regular", puntos: "2", descripcion: "Diferencia AR/VR de forma confusa o con pocos ejemplos." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No diferencia AR/VR, confunde conceptos." },
      ],
    },
    {
      id: "s2c2",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "🏗️ Diseño de Mundo Virtual",
      descripcion: "Evalúa el detalle y coherencia del mundo virtual diseñado en papel/cartulina.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Metaverso Educativo",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diseña mundo virtual detallado (mapa, personajes, historia) en papel/cartulina." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diseña mundo virtual básico (mapa + 2 elementos) en papel/cartulina." },
        { nivel: "Regular", puntos: "2", descripcion: "Diseño de mundo virtual incompleto o poco detallado." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No realiza diseño de mundo virtual." },
      ],
    },
    {
      id: "s2c3",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "🎮 Aplicaciones Prácticas",
      descripcion: "Evalúa las propuestas de aplicaciones reales de AR/VR en educación, salud o industria.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Metaverso Educativo",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Propone 4+ aplicaciones reales de AR/VR en educación, salud o industria." },
        { nivel: "Bueno", puntos: "3", descripcion: "Propone 2-3 aplicaciones reales de AR/VR." },
        { nivel: "Regular", puntos: "2", descripcion: "Propone 1 aplicación de AR/VR de forma vaga." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No propone aplicaciones reales." },
      ],
    },
    {
      id: "s2c4",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "🌐 Comprensión del Metaverso",
      descripcion: "Evalúa la comprensión crítica del metaverso, sus ventajas y riesgos.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Metaverso Educativo",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Explica metaverso con ventajas, riesgos y propuesta ética." },
        { nivel: "Bueno", puntos: "3", descripcion: "Explica metaverso con ventajas y riesgos básicos." },
        { nivel: "Regular", puntos: "2", descripcion: "Define metaverso de forma superficial." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No logra definir metaverso." },
      ],
    },
    {
      id: "s2c5",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "🎨 Creatividad Visual",
      descripcion: "Evalúa el uso creativo de colores, texturas y espacio en el material entregado.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Metaverso Educativo",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diseño visual excepcional, uso creativo de colores, texturas y espacio." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diseño visual agradable, buen uso de colores y espacio." },
        { nivel: "Regular", puntos: "2", descripcion: "Diseño visual básico, poco cuidado en presentación." },
        { nivel: "Deficiente", puntos: "1", descripcion: "Diseño visual descuidado o ausente." },
      ],
    },
    {
      id: "s2c6",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "📋 Documentación y Presentación",
      descripcion: "Evalúa la estructura y completitud del documento entregado.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Metaverso Educativo",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Documento completo, con portada, índice, conclusiones y bibliografía." },
        { nivel: "Bueno", puntos: "3", descripcion: "Documento completo, estructura clara, mínimos errores." },
        { nivel: "Regular", puntos: "2", descripcion: "Documento incompleto, errores frecuentes." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No entrega documento o plagio evidente." },
      ],
    },

    // ===== PROYECTO: DISEÑA TU ROBOT IDEAL (Secuencia 3 - Robótica) =====
    {
      id: "s3c1",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "🔧 Evaluación de Sistemas Tecnológicos",
      descripcion: "Evalúa el análisis crítico de sistemas robóticos con criterios técnicos.",
      ponderacion: "4 de 24 pts — Proyecto: Diseña tu Robot Ideal",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Evalúa 3+ sistemas robóticos con criterios técnicos (función, eficiencia, impacto)." },
        { nivel: "Bueno", puntos: "3", descripcion: "Evalúa 2 sistemas robóticos con criterios básicos." },
        { nivel: "Regular", puntos: "2", descripcion: "Evalúa 1 sistema robótico de forma superficial." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No evalúa sistemas robóticos." },
      ],
    },
    {
      id: "s3c2",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "⚙️ Relación Robótica-IA-Automatización",
      descripcion: "Evalúa la comprensión de la relación entre robótica, IA y automatización.",
      ponderacion: "4 de 24 pts — Proyecto: Diseña tu Robot Ideal",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Explica relación con 4+ ejemplos concretos y diagrama de flujo." },
        { nivel: "Bueno", puntos: "3", descripcion: "Explica relación con 2-3 ejemplos y diagrama simple." },
        { nivel: "Regular", puntos: "2", descripcion: "Menciona relación pero sin ejemplos claros." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No establece relación entre robótica, IA y automatización." },
      ],
    },
    {
      id: "s3c3",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "💻 Programación de Robot (Papel)",
      descripcion: "Evalúa el diseño del algoritmo del robot con condicionales y bucles en papel/cartulina.",
      ponderacion: "4 de 24 pts — Proyecto: Diseña tu Robot Ideal",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diseña algoritmo con 10+ pasos, condicionales y bucles en papel/cartulina." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diseña algoritmo con 6-9 pasos y algunas condicionales en papel/cartulina." },
        { nivel: "Regular", puntos: "2", descripcion: "Diseña algoritmo con 3-5 pasos, secuencial básico." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No diseña algoritmo o es incompleto." },
      ],
    },
    {
      id: "s3c4",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "🤖 Lógica de Decisiones y Sensores",
      descripcion: "Evalúa la identificación de sensores/actuadores y los escenarios de decisión propuestos.",
      ponderacion: "4 de 24 pts — Proyecto: Diseña tu Robot Ideal",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Identifica 5+ sensores/actuadores y propone 3+ escenarios de decisión." },
        { nivel: "Bueno", puntos: "3", descripcion: "Identifica 3-4 sensores/actuadores y propone 2 escenarios." },
        { nivel: "Regular", puntos: "2", descripcion: "Identifica 1-2 sensores/actuadores, 1 escenario simple." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No identifica sensores/actuadores." },
      ],
    },
    {
      id: "s3c5",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "🎨 Diseño de Robot Ideal",
      descripcion: "Evalúa la innovación, funcionalidad y presentación técnica del diseño del robot.",
      ponderacion: "4 de 24 pts — Proyecto: Diseña tu Robot Ideal",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diseño robot innovador, con función social, dibujo técnico y lista de materiales." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diseño robot funcional, dibujo claro y lista de materiales básica." },
        { nivel: "Regular", puntos: "2", descripcion: "Diseño robot básico, poco detallado." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No presenta diseño de robot." },
      ],
    },
    {
      id: "s3c6",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "📊 Presentación del Proyecto",
      descripcion: "Evalúa el dominio del tema y la claridad de la presentación oral final.",
      ponderacion: "4 de 24 pts — Proyecto: Diseña tu Robot Ideal",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Presentación oral clara, dominio del tema, responde preguntas con seguridad." },
        { nivel: "Bueno", puntos: "3", descripcion: "Presentación oral clara, con algunas dudas al responder." },
        { nivel: "Regular", puntos: "2", descripcion: "Presentación oral con dificultades, lectura excesiva." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No presenta o no domina el tema." },
      ],
    },
  ],
  2: [
    // ===== PROYECTO: MI ANÁLISIS DE DATOS ESCOLAR (Secuencia 4 - Ciencia de Datos) =====
    {
      id: "s4c1",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "📊 Definición de Ciencia de Datos",
      descripcion: "Evalúa la comprensión de ciencia de datos, algoritmos y Big Data con ejemplos propios.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Análisis de Datos Escolar",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Define ciencia de datos, algoritmos y Big Data con ejemplos propios y claros." },
        { nivel: "Bueno", puntos: "3", descripcion: "Define ciencia de datos y algoritmos con ejemplos del libro o básicos." },
        { nivel: "Regular", puntos: "2", descripcion: "Define ciencia de datos de forma vaga, confunde términos." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No logra definir ciencia de datos, copia definiciones." },
      ],
    },
    {
      id: "s4c2",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "🔗 Relación Datos-Algoritmos-Decisiones",
      descripcion: "Evalúa la comprensión de cómo los datos y algoritmos influyen en decisiones cotidianas.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Análisis de Datos Escolar",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Explica la relación con 4+ ejemplos concretos de su vida cotidiana." },
        { nivel: "Bueno", puntos: "3", descripcion: "Explica la relación con 2-3 ejemplos básicos." },
        { nivel: "Regular", puntos: "2", descripcion: "Menciona la relación pero sin ejemplos claros." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No establece relación entre datos, algoritmos y decisiones." },
      ],
    },
    {
      id: "s4c3",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "🕵️‍♂️ Identificación de Sesgos Algorítmicos",
      descripcion: "Evalúa la capacidad de identificar sesgos en recomendaciones algorítmicas y proponer soluciones.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Análisis de Datos Escolar",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Identifica 3+ sesgos en recomendaciones y propone soluciones." },
        { nivel: "Bueno", puntos: "3", descripcion: "Identifica 2 sesgos algorítmicos básicos." },
        { nivel: "Regular", puntos: "2", descripcion: "Identifica 1 sesgo de forma vaga." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No identifica sesgos algorítmicos." },
      ],
    },
    {
      id: "s4c4",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "📈 Visualización de Datos",
      descripcion: "Evalúa la creación de gráficas claras y bien etiquetadas a partir de datos propios.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Análisis de Datos Escolar",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Crea 2+ gráficas claras, con título, ejes etiquetados y conclusiones." },
        { nivel: "Bueno", puntos: "3", descripcion: "Crea 1-2 gráficas básicas con título." },
        { nivel: "Regular", puntos: "2", descripcion: "Crea 1 gráfica incompleta o sin etiquetas." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No crea gráficas o son ilegibles." },
      ],
    },
    {
      id: "s4c5",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "🧠 Pensamiento Crítico sobre Datos",
      descripcion: "Evalúa la capacidad de cuestionar los datos y reconocer sus limitaciones.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Análisis de Datos Escolar",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Plantea 3+ preguntas que los datos NO responden y propone cómo obtenerlas." },
        { nivel: "Bueno", puntos: "3", descripcion: "Plantea 1-2 preguntas sobre limitaciones de los datos." },
        { nivel: "Regular", puntos: "2", descripcion: "Menciona 1 limitación sin profundizar." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No cuestiona los datos ni sus limitaciones." },
      ],
    },
    {
      id: "s4c6",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "📝 Presentación y Ortografía",
      descripcion: "Evalúa la limpieza, ortografía y estructura profesional del informe entregado.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Análisis de Datos Escolar",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Documento impecable, sin errores, estructura profesional." },
        { nivel: "Bueno", puntos: "3", descripcion: "Mínimos errores, estructura clara y legible." },
        { nivel: "Regular", puntos: "2", descripcion: "Errores frecuentes, estructura desorganizada." },
        { nivel: "Deficiente", puntos: "1", descripcion: "Documento ilegible, plagio evidente o no entrega." },
      ],
    },

    // ===== PROYECTO: MI HOJA DE CÁLCULO PARA DECIDIR (Secuencia 5 - Hojas de Cálculo) =====
    {
      id: "s5c1",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      titulo: "🖥️ Manejo de la Interfaz",
      descripcion: "Evalúa la fluidez al navegar la hoja de cálculo, crear hojas y aplicar formato.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Hoja de Cálculo para Decidir",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Navega con fluidez, usa atajos, crea múltiples hojas y formato avanzado." },
        { nivel: "Bueno", puntos: "3", descripcion: "Navega correctamente, crea hojas y aplica formato básico." },
        { nivel: "Regular", puntos: "2", descripcion: "Navega con dificultad, necesita ayuda frecuente." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No logra navegar la interfaz." },
      ],
    },
    {
      id: "s5c2",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      titulo: "🔢 Uso de Fórmulas",
      descripcion: "Evalúa el uso correcto de fórmulas básicas (SUMA, PROMEDIO, CONTAR, SI).",
      ponderacion: "4 de 24 pts — Proyecto: Mi Hoja de Cálculo para Decidir",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Usa 4+ fórmulas (SUMA, PROMEDIO, CONTAR, SI) correctamente y las explica." },
        { nivel: "Bueno", puntos: "3", descripcion: "Usa 2-3 fórmulas correctamente." },
        { nivel: "Regular", puntos: "2", descripcion: "Usa 1 fórmula con errores o no las entiende." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No usa fórmulas o todas son incorrectas." },
      ],
    },
    {
      id: "s5c3",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      titulo: "📊 Creación de Gráficas",
      descripcion: "Evalúa la creación de gráficas con título, leyenda, ejes y colores apropiados.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Hoja de Cálculo para Decidir",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Crea 2+ gráficas con título, leyenda, ejes y colores apropiados." },
        { nivel: "Bueno", puntos: "3", descripcion: "Crea 1-2 gráficas básicas con título." },
        { nivel: "Regular", puntos: "2", descripcion: "Crea 1 gráfica incompleta o sin formato." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No crea gráficas." },
      ],
    },
    {
      id: "s5c4",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      titulo: "🎨 Diseño Visual y Infografía",
      descripcion: "Evalúa la combinación creativa de datos y elementos visuales en la infografía.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Hoja de Cálculo para Decidir",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diseño excepcional, combinación creativa de datos y elementos visuales." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diseño agradable, buena combinación de datos y visuales." },
        { nivel: "Regular", puntos: "2", descripcion: "Diseño básico, poco cuidado en presentación." },
        { nivel: "Deficiente", puntos: "1", descripcion: "Diseño descuidado o ausente." },
      ],
    },
    {
      id: "s5c5",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      titulo: "🧠 Aplicación a Casos Reales",
      descripcion: "Evalúa la resolución de un problema real con datos propios y conclusiones sustentadas.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Hoja de Cálculo para Decidir",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Resuelve problema real con datos propios y conclusiones basadas en evidencia." },
        { nivel: "Bueno", puntos: "3", descripcion: "Resuelve problema básico con datos dados y conclusiones simples." },
        { nivel: "Regular", puntos: "2", descripcion: "Resuelve problema con dificultades, conclusiones sin sustento." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No aplica hojas de cálculo a un caso real." },
      ],
    },
    {
      id: "s5c6",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      titulo: "📝 Presentación y Documentación",
      descripcion: "Evalúa la organización, nombre y documentación del archivo entregado.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Hoja de Cálculo para Decidir",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Archivo bien organizado, nombrado correctamente, con documentación clara." },
        { nivel: "Bueno", puntos: "3", descripcion: "Archivo organizado, mínimos errores de nombre o estructura." },
        { nivel: "Regular", puntos: "2", descripcion: "Archivo desorganizado, errores frecuentes." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No entrega archivo o está corrupto." },
      ],
    },

    // ===== PROYECTO: MI MANUAL DE SUPERVIVENCIA DIGITAL (Secuencia 6 - Seguridad Digital) =====
    {
      id: "s6c1",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "🛡️ Evaluación de Sistemas Tecnológicos",
      descripcion: "Evalúa el análisis crítico de sistemas con criterios técnicos de seguridad.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Manual de Supervivencia Digital",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Evalúa 3+ sistemas con criterios técnicos de seguridad (vulnerabilidades, prevención, impacto)." },
        { nivel: "Bueno", puntos: "3", descripcion: "Evalúa 2 sistemas con criterios básicos de seguridad." },
        { nivel: "Regular", puntos: "2", descripcion: "Evalúa 1 sistema de forma superficial." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No evalúa sistemas tecnológicos." },
      ],
    },
    {
      id: "s6c2",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "🔐 Gestión de Contraseñas y Cifrado",
      descripcion: "Evalúa la creación de contraseñas seguras y la comprensión del cifrado básico.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Manual de Supervivencia Digital",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Crea 3+ contraseñas seguras, explica cifrado y propone sistema de gestión." },
        { nivel: "Bueno", puntos: "3", descripcion: "Crea 2 contraseñas seguras y explica cifrado básico." },
        { nivel: "Regular", puntos: "2", descripcion: "Crea 1 contraseña segura, explicación vaga." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No crea contraseñas seguras ni explica cifrado." },
      ],
    },
    {
      id: "s6c3",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "🕵️‍♂️ Identificación de Amenazas",
      descripcion: "Evalúa la identificación de amenazas digitales con ejemplos reales.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Manual de Supervivencia Digital",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Identifica 5+ amenazas (phishing, virus, robo de identidad, etc.) con ejemplos reales." },
        { nivel: "Bueno", puntos: "3", descripcion: "Identifica 3-4 amenazas con ejemplos básicos." },
        { nivel: "Regular", puntos: "2", descripcion: "Identifica 1-2 amenazas de forma vaga." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No identifica amenazas digitales." },
      ],
    },
    {
      id: "s6c4",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "📰 Análisis de Casos Históricos",
      descripcion: "Evalúa el análisis de casos históricos de ataques cibernéticos.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Manual de Supervivencia Digital",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Analiza 2+ casos (WannaCry, etc.) con causas, consecuencias y lecciones aprendidas." },
        { nivel: "Bueno", puntos: "3", descripcion: "Analiza 1-2 casos con causas y consecuencias básicas." },
        { nivel: "Regular", puntos: "2", descripcion: "Menciona 1 caso sin análisis profundo." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No analiza casos históricos." },
      ],
    },
    {
      id: "s6c5",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "⚖️ Ética Digital y Ciudadanía",
      descripcion: "Evalúa la propuesta de reglas de ciudadanía digital con argumentos sólidos.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Manual de Supervivencia Digital",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Propone 4+ reglas de ciudadanía digital con argumentos sólidos." },
        { nivel: "Bueno", puntos: "3", descripcion: "Propone 2-3 reglas con argumentos básicos." },
        { nivel: "Regular", puntos: "2", descripcion: "Propone 1 regla sin argumentar." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No propone reglas de ciudadanía digital." },
      ],
    },
    {
      id: "s6c6",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "📝 Presentación del Manual",
      descripcion: "Evalúa la estructura, claridad e ilustraciones del manual entregado.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Manual de Supervivencia Digital",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Manual excepcional, impecable, estructura profesional, ilustraciones claras." },
        { nivel: "Bueno", puntos: "3", descripcion: "Manual completo, estructura clara, mínimos errores." },
        { nivel: "Regular", puntos: "2", descripcion: "Manual incompleto, errores frecuentes, poco cuidado." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No entrega manual o plagio evidente." },
      ],
    },
  ],
  3: [
    // ===== PROYECTO: MI SOLUCIÓN DIGITAL SOCIAL (Secuencia 7 - Soluciones Digitales) =====
    {
      id: "s7c1",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "🧠 Pensamiento Computacional",
      descripcion: "Evalúa la aplicación de los 4 pilares del pensamiento computacional con ejemplos propios.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Solución Digital Social",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Aplica los 4 pilares (descomposición, abstracción, patrones, algoritmos) con 4+ ejemplos propios." },
        { nivel: "Bueno", puntos: "3", descripcion: "Aplica 3 pilares con 2-3 ejemplos." },
        { nivel: "Regular", puntos: "2", descripcion: "Aplica 1-2 pilares con ejemplos básicos." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No aplica los pilares del pensamiento computacional." },
      ],
    },
    {
      id: "s7c2",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "💡 Concepto de Solución Digital",
      descripcion: "Evalúa la claridad al definir la solución digital y su nivel de innovación.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Solución Digital Social",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Define solución digital con 4+ ejemplos concretos y propone innovación original." },
        { nivel: "Bueno", puntos: "3", descripcion: "Define con 2-3 ejemplos y propuesta básica." },
        { nivel: "Regular", puntos: "2", descripcion: "Define de forma vaga, ejemplos genéricos." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No define solución digital." },
      ],
    },
    {
      id: "s7c3",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "🔢 Diseño de Algoritmos",
      descripcion: "Evalúa el diseño del algoritmo con condicionales y bucles en el diagrama de flujo.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Solución Digital Social",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diseña algoritmo con 10+ pasos, condicionales y bucles en diagrama de flujo claro." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diseña algoritmo con 6-9 pasos y algunas condicionales." },
        { nivel: "Regular", puntos: "2", descripcion: "Diseña algoritmo con 3-5 pasos, secuencial básico." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No diseña algoritmo o es incompleto." },
      ],
    },
    {
      id: "s7c4",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "🎯 Propósito Social",
      descripcion: "Evalúa la claridad del impacto social, los usuarios definidos y la justificación de la solución.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Solución Digital Social",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Propone solución con impacto social claro, usuarios definidos y justificación sólida." },
        { nivel: "Bueno", puntos: "3", descripcion: "Propone solución con propósito social básico y usuarios definidos." },
        { nivel: "Regular", puntos: "2", descripcion: "Propone solución sin propósito social claro." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No propone solución con propósito social." },
      ],
    },
    {
      id: "s7c5",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "🤝 Colaboración en Hackatón",
      descripcion: "Evalúa la participación, liderazgo y aporte de ideas durante la dinámica de hackatón.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Solución Digital Social",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Lidera equipo, distribuye tareas, integra ideas de todos y motiva." },
        { nivel: "Bueno", puntos: "3", descripcion: "Participa activamente, respeta turnos y aporta ideas." },
        { nivel: "Regular", puntos: "2", descripcion: "Participa poco, necesita recordatorios del docente." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No participa o dificulta el trabajo del equipo." },
      ],
    },
    {
      id: "s7c6",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "📝 Presentación y Documentación",
      descripcion: "Evalúa la claridad del pitch y la estructura profesional del documento entregado.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Solución Digital Social",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Documento impecable, pitch claro, estructura profesional." },
        { nivel: "Bueno", puntos: "3", descripcion: "Mínimos errores, pitch claro, estructura ordenada." },
        { nivel: "Regular", puntos: "2", descripcion: "Errores frecuentes, pitch con dificultades." },
        { nivel: "Deficiente", puntos: "1", descripcion: "Documento ilegible, no presenta o plagio evidente." },
      ],
    },

    // ===== PROYECTO: MI PORTAFOLIO WEB EN PAPEL (Secuencia 8 - Diseño Web) =====
    {
      id: "s8c1",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "🧭 UX/UI y Arquitectura de Información",
      descripcion: "Evalúa el diseño de la navegación y la jerarquía visual del sitio.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Portafolio Web en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diseña navegación intuitiva, jerarquía visual clara y mapa de sitio profesional." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diseña navegación funcional y jerarquía básica." },
        { nivel: "Regular", puntos: "2", descripcion: "Navegación confusa, jerarquía poco clara." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No diseña navegación ni arquitectura de información." },
      ],
    },
    {
      id: "s8c2",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "📝 HTML Estructurado",
      descripcion: "Evalúa el uso correcto y semántico de etiquetas HTML en el portafolio.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Portafolio Web en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Estructura HTML completa con 6+ etiquetas correctas y semánticas." },
        { nivel: "Bueno", puntos: "3", descripcion: "Estructura HTML con 4-5 etiquetas básicas correctas." },
        { nivel: "Regular", puntos: "2", descripcion: "Estructura HTML con 1-3 etiquetas, errores frecuentes." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No estructura HTML o es ilegible." },
      ],
    },
    {
      id: "s8c3",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "🎨 CSS y Diseño Visual",
      descripcion: "Evalúa la aplicación de reglas de estilo, paleta de colores y coherencia visual.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Portafolio Web en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Aplica 8+ reglas CSS con paleta coherente, tipografías y diseño profesional." },
        { nivel: "Bueno", puntos: "3", descripcion: "Aplica 4-7 reglas CSS con paleta básica y diseño agradable." },
        { nivel: "Regular", puntos: "2", descripcion: "Aplica 1-3 reglas CSS, diseño descuidado." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No aplica CSS o diseño ausente." },
      ],
    },
    {
      id: "s8c4",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "📱 Responsive Design en Papel",
      descripcion: "Evalúa el diseño de las versiones móvil, tablet y escritorio del portafolio.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Portafolio Web en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Diseña 3 versiones (móvil, tablet, desktop) con adaptaciones claras." },
        { nivel: "Bueno", puntos: "3", descripcion: "Diseña 2 versiones con adaptaciones básicas." },
        { nivel: "Regular", puntos: "2", descripcion: "Diseña 1 versión sin adaptaciones." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No considera diferentes dispositivos." },
      ],
    },
    {
      id: "s8c5",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "🎓 Portafolio Personal",
      descripcion: "Evalúa que el contenido del portafolio sea original y refleje la identidad del alumno.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Portafolio Web en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Portafolio completo, contenido original, refleja identidad del alumno." },
        { nivel: "Bueno", puntos: "3", descripcion: "Portafolio completo con contenido básico y personal." },
        { nivel: "Regular", puntos: "2", descripcion: "Portafolio incompleto o con contenido genérico." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No presenta portafolio o plagio evidente." },
      ],
    },
    {
      id: "s8c6",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "📝 Presentación y Documentación",
      descripcion: "Evalúa la limpieza del documento y la explicación de las decisiones de diseño.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Portafolio Web en Papel",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Documento impecable, explica decisiones de diseño, estructura profesional." },
        { nivel: "Bueno", puntos: "3", descripcion: "Mínimos errores, explica decisiones básicas." },
        { nivel: "Regular", puntos: "2", descripcion: "Errores frecuentes, sin explicación de decisiones." },
        { nivel: "Deficiente", puntos: "1", descripcion: "Documento ilegible o no entrega." },
      ],
    },

    // ===== PROYECTO: MI PROTOTIPO TECNOLÓGICO INTEGRADOR (Secuencia 9 - Prototipos IoT) =====
    {
      id: "s9c1",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🧠 Design Thinking",
      descripcion: "Evalúa la profundidad al aplicar las 5 fases de design thinking.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Prototipo Tecnológico Integrador",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Aplica las 5 fases con profundidad, empatía real y definición clara del problema." },
        { nivel: "Bueno", puntos: "3", descripcion: "Aplica 3-4 fases con empatía y definición básica." },
        { nivel: "Regular", puntos: "2", descripcion: "Aplica 1-2 fases de forma superficial." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No aplica design thinking." },
      ],
    },
    {
      id: "s9c2",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🔧 Sensores y Actuadores",
      descripcion: "Evalúa la identificación y justificación técnica de sensores y actuadores del prototipo.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Prototipo Tecnológico Integrador",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Identifica 4+ sensores/actuadores con funciones claras y justificación técnica." },
        { nivel: "Bueno", puntos: "3", descripcion: "Identifica 2-3 sensores/actuadores con funciones básicas." },
        { nivel: "Regular", puntos: "2", descripcion: "Identifica 1 sensor/actuador, justificación vaga." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No identifica sensores ni actuadores." },
      ],
    },
    {
      id: "s9c3",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🌐 Internet de las Cosas",
      descripcion: "Evalúa la comprensión de la conectividad y las aplicaciones reales de IoT.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Prototipo Tecnológico Integrador",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Explica conectividad, protocolos y aplicación real con 3+ ejemplos." },
        { nivel: "Bueno", puntos: "3", descripcion: "Explica conectividad básica y 1-2 ejemplos." },
        { nivel: "Regular", puntos: "2", descripcion: "Menciona IoT sin explicar conectividad." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No comprende el concepto de IoT." },
      ],
    },
    {
      id: "s9c4",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "📊 Integración de Datos",
      descripcion: "Evalúa el análisis de datos, la gráfica y la conclusión basada en evidencia.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Prototipo Tecnológico Integrador",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Integra análisis de datos con 10+ registros, gráfica y conclusión basada en evidencia." },
        { nivel: "Bueno", puntos: "3", descripcion: "Integra datos básicos con gráfica y conclusión simple." },
        { nivel: "Regular", puntos: "2", descripcion: "Integra datos de forma incompleta o sin gráfica." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No integra análisis de datos." },
      ],
    },
    {
      id: "s9c5",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🚀 Pitch y Presentación",
      descripcion: "Evalúa la claridad del pitch y el dominio del tema al responder preguntas.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Prototipo Tecnológico Integrador",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Pitch de 3 min claro, convincente, domina el tema, responde preguntas con seguridad." },
        { nivel: "Bueno", puntos: "3", descripcion: "Pitch claro, algunas dudas al responder, dominio básico." },
        { nivel: "Regular", puntos: "2", descripcion: "Pitch con dificultades, lectura excesiva, dudas frecuentes." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No presenta o no domina el tema." },
      ],
    },
    {
      id: "s9c6",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🔄 Iteración y Mejora Continua",
      descripcion: "Evalúa la documentación del feedback recibido y las mejoras propuestas.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Prototipo Tecnológico Integrador",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Documenta feedback recibido, propone 3+ mejoras concretas y justifica." },
        { nivel: "Bueno", puntos: "3", descripcion: "Documenta feedback y propone 1-2 mejoras básicas." },
        { nivel: "Regular", puntos: "2", descripcion: "Menciona feedback sin propuestas de mejora." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No documenta iteración ni mejora." },
      ],
    },
  ],
};

// Cada tarea puede incluir dos campos de archivo OPCIONALES, con roles
// distintos:
// - "instruccionesUrl": el PDF (u otro documento) con las instrucciones
//   formales y completas de la tarea (qué se pide, cómo se evalúa,
//   formato de entrega, etc.). Es la acción principal de la tarjeta:
//   se muestra como el botón más visible, "📄 Ver instrucciones completas".
// - "materialApoyoUrl": opcional, para plantillas, ejemplos u otros
//   recursos adicionales. Se muestra como un botón secundario y más
//   discreto, "📎 Material de apoyo", y puede omitirse si no aplica.
// Para agregar cualquiera de los dos a una tarea nueva, basta con
// añadir la propiedad correspondiente (con el link real de Google
// Drive u otro servicio) al objeto de esa tarea.

// "detalleCompleto": OPCIONAL, HTML de confianza (<p>, <ul>/<li>) que
// se muestra en un modal emergente al pulsar "📖 Ver detalles" (ver
// abrirModalDetalle() más abajo, que lo inserta con innerHTML). Pensado
// para instrucciones extensas que no caben cómodas en la descripción
// corta de la tarjeta. Si el campo no existe, el botón no se muestra.
const DATOS_TAREAS = {
  // Fechas reales, verificadas contra CALENDARIO_ESCOLAR_2026_2027
  // (126/126 coinciden con días lectivos).
  1: [
    {
      id: "t5",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "Detective de IA en mi casa",
      descripcion: "Identifica 5 ejemplos de Inteligencia Artificial presentes en la vida diaria.",
      fechaEntrega: { "3C": "2026-08-31", "3E": "2026-09-01" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 minutos | 👥 Modalidad: Individual (en casa)</p>
        <ul>
          <li>Cuaderno de la materia o una hoja blanca</li>
          <li>Lápiz o pluma</li>
          <li>(Opcional) Ayuda de un familiar para identificar aparatos/servicios</li>
        </ul>
        <ul>
          <li>En casa, observa con atención los aparatos y servicios que usas todos los días (celular, tele, refrigerador, apps).</li>
          <li>Dibuja en tu cuaderno una tabla con 4 columnas: Objeto/Servicio, ¿Qué hace la IA?, ¿Lo sabías? (Sí/No).</li>
          <li>Encuentra 5 ejemplos de objetos o servicios que usan Inteligencia Artificial sin que normalmente te des cuenta.</li>
          <li>Para cada uno, escribe brevemente qué hace la IA en ese objeto (ejemplo: "Netflix me recomienda series según lo que ya vi").</li>
          <li>Marca si ya sabías que ese objeto usaba IA o si fue una sorpresa para ti.</li>
        </ul>
        <p>💬 Tip: no se necesita internet. Puedes preguntar a tus papás, hermanos o vecinos qué aparatos usan y anotar sus respuestas en tu libreta.</p>
      `,
    },
    {
      id: "t6",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "Mi diálogo con un asistente virtual",
      descripcion: "Escribe un diálogo de al menos 8 líneas con un asistente virtual y reflexiona sobre su \"inteligencia\".",
      fechaEntrega: { "3C": "2026-09-07", "3E": "2026-09-08" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 15 minutos | 👥 Modalidad: Individual</p>
        <ul>
          <li>Hoja blanca o cuaderno</li>
          <li>Lápiz o pluma</li>
          <li>(Opcional) Un celular con asistente de voz para probar una conversación real</li>
        </ul>
        <ul>
          <li>Si tienes acceso a un asistente de voz (Siri, Alexa, Google Assistant), platica con él/ella y observa cómo responde. Si no tienes acceso, puedes imaginar la conversación.</li>
          <li>Escribe un diálogo de mínimo 8 líneas (8 intercambios entre tú y el asistente), usando el formato "Tú: ..." / "Asistente: ...".</li>
          <li>Incluye al menos un momento donde el asistente no entienda bien lo que le pediste, o responda algo diferente a lo esperado.</li>
          <li>Al final, responde por escrito: ¿Crees que el asistente es "inteligente" o solo sigue reglas programadas? Explica tu respuesta en 2-3 líneas.</li>
        </ul>
        <p>💬 Tip: si no tienes ningún asistente de voz disponible, puedes inventar el diálogo pensando en cómo actúan en comerciales, películas o lo que hayas visto usar a otras personas.</p>
      `,
    },
    {
      id: "t7",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "La IA y mi creatividad",
      descripcion: "Representa con un dibujo o collage cómo la IA podría apoyar a un artista sin reemplazarlo.",
      fechaEntrega: { "3C": "2026-09-14", "3E": "2026-09-15" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 minutos | 👥 Modalidad: Individual</p>
        <ul>
          <li>Media cartulina o una hoja tamaño A3 (o carta doble)</li>
          <li>Lápices de colores, crayones o marcadores</li>
          <li>Revistas viejas, periódicos o folletos (opcional, para recortar y hacer collage)</li>
          <li>Tijeras y pegamento (si se hace en formato collage)</li>
        </ul>
        <ul>
          <li>Piensa en un tipo de artista: pintor, músico, escritor, diseñador, fotógrafo, etc.</li>
          <li>Reflexiona: ¿cómo podría la Inteligencia Artificial ayudar a ese artista a crear mejor o más rápido, sin reemplazarlo?</li>
          <li>Representa esa idea con un dibujo hecho a mano, o con un collage usando recortes de revista.</li>
          <li>Debajo de tu dibujo, escribe una frase explicativa de máximo 2 renglones que describa la idea que representaste.</li>
        </ul>
        <p>💬 Importante: el mensaje central de esta tarea es que la IA es una herramienta de apoyo, no un reemplazo del talento humano.</p>
      `,
    },
    {
      id: "t8",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "Cazador de AR/VR",
      descripcion: "Clasifica 4 ejemplos cotidianos como Realidad Aumentada, Virtual o Mixta.",
      fechaEntrega: { "3C": "2026-09-22", "3E": "2026-09-29" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 minutos | 👥 Modalidad: Individual</p>
        <ul>
          <li>Hoja blanca o cuaderno</li>
          <li>Lápiz o pluma</li>
        </ul>
        <ul>
          <li>Piensa en tu vida diaria, en noticias o comentarios que hayas escuchado sobre tecnología.</li>
          <li>Dibuja una tabla con 3 columnas: Ejemplo, ¿Es AR, VR o MR?, ¿Dónde lo viste?</li>
          <li>Encuentra 4 ejemplos de Realidad Aumentada (AR), Realidad Virtual (VR) o Realidad Mixta (MR) y clasifícalos correctamente.</li>
          <li>Llena la tabla completa con la información de cada ejemplo.</li>
        </ul>
        <p>💬 Ejemplos que puedes usar de guía: filtros de Snapchat o Instagram (AR), juegos de PlayStation VR (VR), Google Maps con navegación en vivo (AR), simuladores de vuelo (VR).</p>
      `,
    },
    {
      id: "t9",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "Mi casa en Realidad Aumentada",
      descripcion: "Dibuja una habitación de tu casa con anotaciones tipo Realidad Aumentada.",
      fechaEntrega: { "3C": "2026-09-29", "3E": "2026-10-06" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 minutos | 👥 Modalidad: Individual</p>
        <ul>
          <li>Hoja tamaño carta</li>
          <li>Lápices de colores o marcadores</li>
        </ul>
        <ul>
          <li>Elige una habitación de tu casa (sala, cocina o recámara) y dibújala en una hoja completa.</li>
          <li>Imagina que estás usando lentes o una app de Realidad Aumentada.</li>
          <li>Sobre cada objeto de tu dibujo, agrega "burbujas" de información como si fueran hologramas flotando (ejemplo: sobre el refrigerador, una burbuja que diga "quedan 2 días de leche").</li>
          <li>Al final, escribe una conclusión completando la frase: "La AR me ayudaría a...".</li>
        </ul>
      `,
    },
    {
      id: "t10",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "Noticia del futuro",
      descripcion: "Redacta una noticia de periódico ambientada en 2035 sobre el metaverso educativo.",
      fechaEntrega: { "3C": "2026-10-13", "3E": "2026-10-20" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 minutos | 👥 Modalidad: Individual</p>
        <ul>
          <li>Hoja blanca o cuaderno</li>
          <li>Lápiz o pluma</li>
        </ul>
        <ul>
          <li>Imagina que eres periodista en el año 2035.</li>
          <li>Escribe una noticia de periódico (formato con encabezado y cuerpo) titulada algo como "Metaverso educativo: ¿beneficio o riesgo?".</li>
          <li>Redacta entre 8 y 10 líneas describiendo cómo el metaverso cambió la escuela secundaria, usando datos inventados pero realistas.</li>
          <li>Al final, responde: ¿Te gustaría estudiar así? Sí / No — explica tu respuesta.</li>
        </ul>
      `,
    },
    {
      id: "t11",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "Detective de Robots",
      descripcion: "Investiga 4 robots reales o ficticios y clasifica si usan IA.",
      fechaEntrega: { "3C": "2026-10-19", "3E": "2026-10-21" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 minutos | 👥 Modalidad: Individual</p>
        <ul>
          <li>Cuaderno o hoja blanca</li>
          <li>Lápiz o pluma</li>
          <li>(Opcional) Revistas o apoyo de familiares para investigar</li>
        </ul>
        <ul>
          <li>Investiga (preguntando en casa, buscando en revistas o recordando películas) 4 robots diferentes.</li>
          <li>Dibuja una tabla con las columnas: Nombre del robot, ¿Qué hace?, ¿Tiene IA? (Sí/No), ¿Es real o ficticio?</li>
          <li>Llena la tabla con la información de los 4 robots que elegiste.</li>
        </ul>
        <p>💬 Ejemplos que puedes usar de guía: Roomba (aspiradora), robots de fábrica (industria automotriz), Wall-E (película), robots quirúrgicos (Da Vinci), drones.</p>
      `,
    },
    {
      id: "t12",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "Mi rutina como algoritmo",
      descripcion: "Describe tu rutina matutina como un algoritmo con condicionales SI/ENTONCES/SINO.",
      fechaEntrega: { "3C": "2026-10-26", "3E": "2026-10-28" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 minutos | 👥 Modalidad: Individual</p>
        <ul>
          <li>Hoja blanca o cuaderno</li>
          <li>Lápiz o pluma</li>
        </ul>
        <ul>
          <li>Piensa en tu rutina de la mañana antes de ir a la escuela.</li>
          <li>Escribe esa rutina como si fuera un programa de robot, en una lista numerada, usando la estructura SI...ENTONCES...SINO... para representar decisiones.</li>
          <li>Tu lista debe tener mínimo 10 pasos y mínimo 3 condicionales (SI/ENTONCES/SINO).</li>
        </ul>
        <p>💬 Ejemplo de formato: "1. Despertar. 2. SI la alarma sonó ENTONCES levantarse, SINO dormir 5 min más y volver al paso 1."</p>
      `,
    },
    {
      id: "t13",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "Mi robot ideal — Boceto inicial",
      descripcion: "Diseña el boceto de un robot que resuelva un problema de tu familia o comunidad.",
      fechaEntrega: { "3C": "2026-11-03", "3E": "2026-11-04" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 minutos | 👥 Modalidad: Individual</p>
        <ul>
          <li>Hoja tamaño carta</li>
          <li>Lápices de colores o marcadores</li>
        </ul>
        <ul>
          <li>Piensa en un problema de tu familia o comunidad que un robot podría ayudar a resolver.</li>
          <li>Dibuja el robot en tu hoja y etiqueta cada parte: sensor (¿qué detecta?), actuador (¿qué hace o mueve?), cerebro/procesador (¿qué decide?).</li>
          <li>Debajo del dibujo, escribe: nombre del robot, el problema que resuelve, y si necesita Inteligencia Artificial o solo reglas fijas para funcionar (explica por qué).</li>
        </ul>
      `,
    },
  ],
  // Fechas reales, verificadas contra CALENDARIO_ESCOLAR_2026_2027
  // (126/126 coinciden con días lectivos).
  2: [
    // ===== SECUENCIA 4: CIENCIA DE DATOS =====
    {
      id: "t-s4-1",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "🔍 Detective de Datos en mi Vida",
      descripcion: "Busca 5 situaciones de tu día donde alguien (o algo) use datos para tomar decisiones sobre ti.",
      fechaEntrega: { "3C": "2026-11-17", "3E": "2026-11-17" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Tabla en cuaderno</p>
        <ul>
          <li>Tabla: Situación | ¿Qué datos usan? | ¿Quién decide? | ¿Lo sabías?</li>
          <li>Ejemplos guía: YouTube recomienda videos, mamá revisa tus calificaciones, el camión de la escuela tiene ruta fija, el refrigerador avisa que falta leche, el banco te envía promociones.</li>
        </ul>
        <p>💡 Tip: Puedes preguntar en casa. No necesitas internet.</p>
      `,
    },
    {
      id: "t-s4-2",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "📊 Mi Semana en Números",
      descripcion: "Registra durante 5 días cuántas horas dedicas a: escuela, redes sociales, deportes, familia y sueño.",
      fechaEntrega: { "3C": "2026-11-23", "3E": "2026-11-18" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Tabla + gráfica de barras en cuaderno</p>
        <ul>
          <li>Crea una tabla en tu cuaderno con los 5 días y las 5 categorías.</li>
          <li>Al final, dibuja una gráfica de barras a mano mostrando el total de horas por categoría.</li>
          <li>Escribe 3 líneas: "La categoría donde más invierto tiempo es… Esto me sorprende porque… Podría mejorar si…".</li>
        </ul>
      `,
    },
    {
      id: "t-s4-3",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "🕵️‍♂️ El Algoritmo me Vigila",
      descripcion: "Imagina que un algoritmo decide TODO por ti durante un día: qué comer, qué vestir, qué ver, con quién hablar.",
      fechaEntrega: { "3C": "2026-11-24", "3E": "2026-11-24" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Texto de 10 líneas + dibujo</p>
        <ul>
          <li>Escribe una historia de 10 líneas narrando un día completo controlado por un algoritmo.</li>
          <li>Dibuja tu "asistente algorítmico" como si fuera un personaje.</li>
          <li>Responde: "¿Te gustaría que un algoritmo decidiera por ti? ¿Por qué sí o por qué no?"</li>
        </ul>
      `,
    },

    // ===== SECUENCIA 5: HOJAS DE CÁLCULO =====
    {
      id: "t-s5-1",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      titulo: "🏠 Mi Presupuesto Mensual en Papel",
      descripcion: "Crea un 'presupuesto' de tu mes: ingresos (dinero de papás, trabajo, regalos) y gastos (transporte, comida, pasatiempos).",
      fechaEntrega: { "3C": "2026-12-15", "3E": "2026-12-16" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Tabla en cuaderno</p>
        <ul>
          <li>Tabla: Concepto | Tipo (Ingreso/Gasto) | Cantidad ($)</li>
          <li>Calcula a mano: total de ingresos, total de gastos, saldo final.</li>
          <li>Responde: "¿Te alcanza? ¿Qué gasto podrías reducir?"</li>
        </ul>
      `,
    },
    {
      id: "t-s5-2",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      titulo: "📐 Mi Horario Escolar como Hoja de Cálculo",
      descripcion: "Dibuja tu horario escolar como si fuera una hoja de cálculo de Excel.",
      fechaEntrega: { "3C": "2027-01-12", "3E": "2027-01-13" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Dibujo de tabla en cuaderno</p>
        <ul>
          <li>Dibuja la cuadrícula: columnas = días (Lunes a Viernes), filas = horas (7:00 a 14:00).</li>
          <li>En cada celda, escribe la materia que tienes.</li>
          <li>Colorea las celdas: verde = materias favoritas, rojo = materias difíciles, amarillo = recreos.</li>
          <li>Cuenta cuántas horas a la semana tienes de cada materia y escribe cuál tiene más y cuál menos.</li>
        </ul>
      `,
    },
    {
      id: "t-s5-3",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      titulo: "📊 Mi Tienda Imaginaria",
      descripcion: "Imagina que tienes una tienda de dulces. Registra las ventas de una semana.",
      fechaEntrega: { "3C": "2027-01-25", "3E": "2027-01-26" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Tabla + cálculos en cuaderno</p>
        <ul>
          <li>Tabla: Día | Producto | Cantidad vendida | Precio unitario | Total del día</li>
          <li>Calcula a mano: total de la semana (SUMA), producto más vendido, promedio de ventas diarias (PROMEDIO).</li>
          <li>Si vendiste más de $500, escribe "¡Buena semana!" (lógica SI…ENTONCES).</li>
        </ul>
      `,
    },

    // ===== SECUENCIA 6: SEGURIDAD DIGITAL AVANZADA =====
    {
      id: "t-s6-1",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "🔍 Mi Huella Digital",
      descripcion: "Haz una lista de TODAS las cuentas, apps, juegos y redes sociales donde tienes perfil.",
      fechaEntrega: { "3C": "2027-02-09", "3E": "2027-02-10" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Lista + dibujo en cuaderno</p>
        <ul>
          <li>Tabla: Plataforma | ¿Qué datos di? (nombre, foto, teléfono, escuela, dirección) | ¿Es privado o público?</li>
          <li>Responde: "Si un desconocido viera toda esta información, ¿qué podría saber de ti? ¿Te preocupa?"</li>
          <li>Dibuja tu "huella digital" como una huella de pie donde cada línea es una plataforma.</li>
        </ul>
      `,
    },
    {
      id: "t-s6-2",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "🔐 La Contraseña Invencible",
      descripcion: "Crea 3 contraseñas seguras para 3 situaciones diferentes y explica por qué son fuertes.",
      fechaEntrega: { "3C": "2027-02-16", "3E": "2027-02-17" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: 3 contraseñas + explicación</p>
        <ul>
          <li>Reglas: mínimo 12 caracteres, mayúsculas, minúsculas, números y símbolos. NO usar datos personales.</li>
          <li>Crea una contraseña para: el banco, redes sociales y la escuela, explicando por qué cada una es fuerte.</li>
          <li>Responde: "¿Usas la misma contraseña en varios lugares? ¿Por qué eso es peligroso?"</li>
        </ul>
      `,
    },
    {
      id: "t-s6-3",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "📰 Reportero de Ciberseguridad",
      descripcion: "Investiga un caso de robo de datos o estafa por internet y cuéntalo como noticia.",
      fechaEntrega: { "3C": "2027-03-01", "3E": "2027-03-02" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Noticia de 10 líneas + cartel de prevención</p>
        <ul>
          <li>Formato: titular, fecha, redacción de 8-10 líneas, ¿qué información se robó?, ¿cómo se pudo evitar?</li>
          <li>Dibuja un cartel de prevención con 3 consejos visuales (candado, ojo tachado, escudo).</li>
        </ul>
      `,
    },
  ],
  // Fechas reales, verificadas contra CALENDARIO_ESCOLAR_2026_2027
  // (126/126 coinciden con días lectivos).
  3: [
    // ===== SECUENCIA 7: SOLUCIONES DIGITALES =====
    {
      id: "t-s7-1",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "🔍 Detective de Soluciones Digitales",
      descripcion: "Busca en tu comunidad o familia 5 problemas que podrían resolverse con una app o sistema digital.",
      fechaEntrega: { "3C": "2027-03-09", "3E": "2027-03-10" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Cuadro en cuaderno</p>
        <ul>
          <li>Tabla: # | Problema | ¿Quién lo tiene? | ¿Qué solución digital propones?</li>
          <li>Ejemplos guía: "Mi abuela no recuerda tomar sus medicinas" → app de recordatorios; "no hay transporte seguro por la noche" → app de rastreo de rutas; "la escuela no avisa cuando hay reunión" → sistema de mensajes masivos.</li>
        </ul>
        <p>💡 Tip: Puedes preguntar en casa. No necesitas internet.</p>
      `,
    },
    {
      id: "t-s7-2",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "📝 Mi Rutina como Algoritmo Mejorado",
      descripcion: "Toma tu rutina de la mañana y mejórala usando los 4 pilares del pensamiento computacional.",
      fechaEntrega: { "3C": "2027-04-06", "3E": "2027-04-06" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Diagrama de flujo en papel</p>
        <ul>
          <li>Descomposición: divide tu rutina en 4 partes (higiene, desayuno, transporte, preparación).</li>
          <li>Abstracción: identifica qué pasos son necesarios y cuáles se pueden eliminar o combinar.</li>
          <li>Patrones: ¿hay algo que repites todos los días y se puede automatizar?</li>
          <li>Algoritmo: escribe la rutina optimizada con mínimo 10 pasos y 3 condicionales, y dibuja el diagrama de flujo.</li>
        </ul>
      `,
    },
    {
      id: "t-s7-3",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "🎨 Mi App Ideal — Boceto en Papel",
      descripcion: "Diseña en papel las 3 pantallas principales de una app que resuelva un problema de tu escuela.",
      fechaEntrega: { "3C": "2027-04-19", "3E": "2027-04-14" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: 3 pantallas dibujadas en hoja carta</p>
        <ul>
          <li>Elige un problema de tu escuela (filas en la cafetería, falta de información de eventos, etc.).</li>
          <li>Dibuja pantalla de inicio, pantalla de función principal y pantalla de resultado, etiquetando cada botón.</li>
          <li>Escribe: "Mi app se llama ___ y resuelve ___ porque ___."</li>
        </ul>
      `,
    },

    // ===== SECUENCIA 8: DISEÑO WEB =====
    {
      id: "t-s8-1",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "🔍 Crítico de Sitios Web",
      descripcion: "Analiza 3 sitios web que uses frecuentemente y evalúa su usabilidad.",
      fechaEntrega: { "3C": "2027-05-03", "3E": "2027-04-28" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Cuadro + dibujo en cuaderno</p>
        <ul>
          <li>Tabla: Sitio | ¿Qué hace? | ¿Es fácil encontrar lo que buscas? (Sí/No) | ¿Qué cambiarías?</li>
          <li>Dibuja la pantalla principal de uno de los sitios marcando con flechas qué te confunde y qué te gusta.</li>
        </ul>
        <p>💡 Tip: Si no tienes internet, describe de memoria YouTube, Facebook, la página de la escuela o cualquier app que uses.</p>
      `,
    },
    {
      id: "t-s8-2",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "📝 Mi Sitio Web en Papel — Wireframe",
      descripcion: "Diseña en papel 3 versiones de tu portafolio digital: móvil, tablet y computadora.",
      fechaEntrega: { "3C": "2027-05-11", "3E": "2027-05-12" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: 3 wireframes en hoja carta</p>
        <ul>
          <li>Dibuja 3 rectángulos con proporciones de móvil (alto y angosto), tablet (cuadrado) y computadora (ancho y bajo).</li>
          <li>En cada uno: barra de navegación, sección principal (foto, nombre, descripción) y pie de página con redes sociales.</li>
          <li>Escribe qué es lo más importante en móvil y cómo aprovechas el espacio en computadora.</li>
        </ul>
      `,
    },
    {
      id: "t-s8-3",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "🎨 Mi Marca Personal",
      descripcion: "Crea la identidad visual de tu portafolio digital: colores, logo y tipografía.",
      fechaEntrega: { "3C": "2027-05-24", "3E": "2027-05-25" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Paleta de colores + logo + tipografía en cartulina</p>
        <ul>
          <li>Elige 3 colores principales (fondo, texto, acentos) y dibuja tu logo (iniciales, animal o símbolo).</li>
          <li>Elige 2 tipografías (una para títulos, una para texto) y escribe una frase que te represente (máximo 10 palabras).</li>
        </ul>
      `,
    },

    // ===== SECUENCIA 9: PROTOTIPOS IOT =====
    {
      id: "t-s9-1",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🔍 Detective de IoT",
      descripcion: "Busca en tu casa o comunidad 5 objetos que sean 'inteligentes' o 'conectados'.",
      fechaEntrega: { "3C": "2027-06-07", "3E": "2027-06-08" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Cuadro en cuaderno</p>
        <ul>
          <li>Tabla: Objeto | ¿Qué sensor tiene? | ¿Qué actuador tiene? | ¿Qué problema resuelve?</li>
          <li>Ejemplos guía: termostato, foco inteligente, lavadora automática, reloj inteligente, timbre con cámara.</li>
        </ul>
        <p>💡 Tip: Si no tienes objetos "inteligentes", imagina cómo sería tu casa si TODO estuviera conectado.</p>
      `,
    },
    {
      id: "t-s9-2",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "📝 Mi Primer MVP en Papel",
      descripcion: "Diseña el Producto Mínimo Viable (MVP) de un dispositivo IoT que resuelva un problema de tu escuela.",
      fechaEntrega: { "3C": "2027-06-14", "3E": "2027-06-15" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 25 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: 1 cartulina con prototipo mínimo</p>
        <ul>
          <li>Elige un problema de la escuela y dibuja tu dispositivo: forma, ubicación, sensor, actuador y tipo de conexión.</li>
          <li>Escribe: "Mi MVP se llama ___. Resuelve ___ usando un sensor de ___ y un actuador de ___. Cuesta aproximadamente $___ pesos."</li>
          <li>Responde: "¿Qué es lo PRIMERO que necesitaría para probar si funciona?"</li>
        </ul>
      `,
    },
    {
      id: "t-s9-3",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🎤 Mi Pitch de 3 Minutos — Escrito",
      descripcion: "Escribe el guion de un pitch para vender tu MVP a un director de escuela.",
      fechaEntrega: { "3C": "2027-06-22", "3E": "2027-06-23" },
      estado: "pendiente",
      detalleCompleto: `
        <p>⏱️ Tiempo: 20 min | 👥 Modalidad: Individual (en casa) | 📦 Entregable: Texto de 1 página + tarjetas de "feedback"</p>
        <ul>
          <li>Estructura: gancho (30 seg), problema (30 seg), solución (1 min), demo (30 seg) y cierre (30 seg).</li>
          <li>En la parte de atrás, dibuja 3 caras (😊 😐 😠) y escribe cómo responderías a cada reacción.</li>
        </ul>
      `,
    },
  ],
};

// "archivoUrl" sigue siendo el campo OPCIONAL para Actividades: muestra
// un único botón "📎 Descargar material" (mismo estilo secundario que
// "materialApoyoUrl" en Tareas). Las actividades no distinguen entre
// instrucciones formales y material de apoyo; para esa distinción ver
// "instruccionesUrl"/"materialApoyoUrl" en DATOS_TAREAS.

// "detalleCompleto": mismo campo OPCIONAL que en DATOS_TAREAS (ver
// comentario ahí); abre el modal "📖 Ver detalles" con HTML de confianza.
const DATOS_ACTIVIDADES = {
  // Fechas reales, verificadas contra CALENDARIO_ESCOLAR_2026_2027
  // (126/126 coinciden con días lectivos).
  1: [
    {
      id: "a4",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "Rompecabezas de Conceptos",
      descripcion: "Dinámica grupal de emparejar términos de IA con sus definiciones.",
      fecha: { "3C": "2026-09-01", "3E": "2026-09-02" },
      detalleCompleto: `
        <p>👥 Modalidad: Grupal (todo el salón), en parejas | ⏱️ Duración: 20 min</p>
        <ul>
          <li>20 fichas de papel o cartulina cortada (tamaño tarjeta), preparadas previamente por el docente</li>
          <li>10 fichas con términos: IA, Machine Learning, NLP, Chatbot, Algoritmo, Asistente Virtual, Red Neuronal, Dato, Predicción, Automatización</li>
          <li>10 fichas con las definiciones correspondientes a cada término</li>
          <li>Espacio abierto en el salón para que los alumnos puedan caminar</li>
        </ul>
        <ul>
          <li>Antes de la clase, el docente imprime, recorta y prepara las 20 fichas (10 términos + 10 definiciones).</li>
          <li>Si el grupo tiene 40 alumnos, se hacen 2 rondas o se reparten fichas en parejas para que todos participen.</li>
          <li>El docente reparte una ficha (término o definición) a cada alumno o pareja, sin decir cuál corresponde a cuál.</li>
          <li>Los alumnos caminan por el salón buscando a la persona que tenga la ficha que combina con la suya.</li>
          <li>Cuando una pareja se encuentra, se sientan juntos.</li>
          <li>Al finalizar, cada pareja lee en voz alta su término y definición frente al grupo; el docente confirma o corrige.</li>
        </ul>
      `,
    },
    {
      id: "a5",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "Teatro de Chatbots",
      descripcion: "En equipos, diseñan el árbol de decisión de un chatbot y lo representan en una obra corta.",
      fecha: { "3C": "2026-09-08", "3E": "2026-09-09" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 personas | ⏱️ Duración: 30 min</p>
        <ul>
          <li>Hojas de papel blanco o cartulina (una por equipo)</li>
          <li>Lápices y marcadores de colores</li>
          <li>Espacio para que 2 alumnos por equipo puedan "actuar" frente al resto</li>
        </ul>
        <ul>
          <li>Organiza al grupo en equipos de 4 personas.</li>
          <li>Cada equipo elige un propósito para su chatbot: pizzería, biblioteca, tareas de matemáticas o emergencias médicas.</li>
          <li>En una cartulina, el equipo dibuja el árbol de decisión del chatbot con las posibles rutas de conversación.</li>
          <li>Dos integrantes representan la conversación como una obra de teatro corta: uno de "usuario" y otro de "chatbot".</li>
          <li>Los otros dos integrantes observan y anotan si funcionó bien la conversación y en qué momento el chatbot se "trabó".</li>
          <li>(Opcional) Cada equipo presenta su teatro brevemente al resto del salón.</li>
        </ul>
      `,
    },
    {
      id: "a6",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "Círculo de Debate: ¿La IA nos quitará el trabajo?",
      descripcion: "Debate grupal sobre si la IA reemplazará los trabajos humanos.",
      fecha: { "3C": "2026-09-15", "3E": "2026-09-22" },
      detalleCompleto: `
        <p>👥 Modalidad: Grupal, dividido en 3 equipos | ⏱️ Duración: 25 min</p>
        <ul>
          <li>Sillas acomodadas en círculo (si el espacio lo permite)</li>
          <li>Papelógrafo, pizarrón o cartulina para anotar argumentos</li>
          <li>Marcadores o plumones</li>
          <li>Hojas para que cada equipo prepare sus argumentos</li>
        </ul>
        <ul>
          <li>El docente plantea la pregunta central: "¿La Inteligencia Artificial reemplazará a los humanos en los trabajos?".</li>
          <li>Se divide al grupo en 3 equipos: a favor (la IA reemplazará muchos trabajos), en contra (la IA creará nuevos trabajos) y observadores (anotan argumentos y preparan preguntas).</li>
          <li>Cada equipo tiene 5 minutos para preparar por escrito 3 argumentos que apoyen su postura.</li>
          <li>Se realiza el debate: cada equipo tiene 2 minutos para exponer sus argumentos (aprox. 10 minutos en total).</li>
          <li>Al final, los observadores votan qué equipo convenció más y explican por qué.</li>
        </ul>
      `,
    },
    {
      id: "a7",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "Juego de Cartas AR/VR/MR",
      descripcion: "Juego de cartas para clasificar escenarios de AR, VR y MR en equipo.",
      fecha: { "3C": "2026-09-28", "3E": "2026-09-30" },
      detalleCompleto: `
        <p>👥 Modalidad: Grupal (todo el salón) | ⏱️ Duración: 20 min</p>
        <ul>
          <li>40 tarjetas impresas por el docente con escenarios (15 de AR, 15 de VR, 10 de MR)</li>
          <li>Etiquetas o letreros para marcar 3 rincones del salón: "AR", "VR", "MR"</li>
          <li>Espacio abierto para que los alumnos se muevan</li>
        </ul>
        <ul>
          <li>Antes de la clase, el docente prepara 40 tarjetas con escenarios distintos de tecnología.</li>
          <li>Reparte una tarjeta a cada alumno.</li>
          <li>El docente dice "¡Levántense los que tienen AR!" y los alumnos con tarjetas de AR se ponen de pie.</li>
          <li>Se elige a 2-3 alumnos para que expliquen por qué su escenario es AR, generando un breve debate si hay dudas.</li>
          <li>Se repite el mismo proceso con VR y con MR.</li>
          <li>Ronda final: el docente menciona escenarios nuevos en voz alta y los alumnos corren al rincón correspondiente (AR, VR o MR).</li>
        </ul>
      `,
    },
    {
      id: "a8",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "Construcción de Mundos Virtuales",
      descripcion: "Equipos diseñan un mundo virtual educativo sobre un tema escolar.",
      fecha: { "3C": "2026-10-05", "3E": "2026-10-07" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 5 personas | ⏱️ Duración: 40 min</p>
        <ul>
          <li>Cartulinas de colores (una por equipo)</li>
          <li>Lápices de colores, marcadores</li>
          <li>Tijeras, pegamento</li>
          <li>Revistas viejas para recortar (opcional)</li>
        </ul>
        <ul>
          <li>Se forman equipos de 5 personas.</li>
          <li>El docente asigna un tema por equipo (ejemplo: Imperio Azteca, Sistema Solar, Célula humana, Matemáticas divertidas).</li>
          <li>Cada equipo diseña, en una cartulina, un mundo virtual educativo sobre su tema, con: un mapa (vista aérea), 2 personajes con nombre y función, 3 actividades que un usuario podría hacer, y una paleta de colores justificada.</li>
          <li>Cada equipo expone su mundo virtual al resto del salón en máximo 2 minutos.</li>
        </ul>
      `,
    },
    {
      id: "a9",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "Tribunal del Metaverso",
      descripcion: "Juicio simulado sobre dilemas éticos del metaverso.",
      fecha: { "3C": "2026-10-06", "3E": "2026-10-13" },
      detalleCompleto: `
        <p>👥 Modalidad: Grupal, con roles asignados | ⏱️ Duración: 30 min</p>
        <ul>
          <li>Papelógrafo o pizarrón</li>
          <li>Marcadores</li>
          <li>Tarjetas de rol: "Juez", "Defensor", "Acusador", "Jurado"</li>
        </ul>
        <ul>
          <li>El docente presenta 3 casos relacionados con el metaverso (gasto excesivo en ropa virtual, un avatar usado para burlarse de un compañero, una empresa que cobra por entrar a una escuela virtual).</li>
          <li>Para cada caso se eligen los roles: 1 Juez, 2 Defensores (a favor del metaverso), 2 Acusadores (en contra) y 3 Jurado (votan al final).</li>
          <li>Cada parte tiene 2 minutos para presentar sus argumentos.</li>
          <li>El juez, con apoyo del jurado, dicta un "veredicto" y explica el porqué de su decisión.</li>
          <li>Se repite el proceso con los otros 2 casos, cambiando los roles entre distintos alumnos.</li>
        </ul>
      `,
    },
    {
      id: "a10",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "Simulación de Fábrica Robotizada",
      descripcion: "Simulación de una línea de producción, comparando trabajo manual vs. instrucciones tipo robot.",
      fecha: { "3C": "2026-10-20", "3E": "2026-10-27" },
      detalleCompleto: `
        <p>👥 Modalidad: Grupal, en 4 estaciones rotativas | ⏱️ Duración: 30 min</p>
        <ul>
          <li>Hojas de papel de colores</li>
          <li>Tijeras</li>
          <li>Cajas de cartón (si hay disponibles)</li>
          <li>Cinta masking tape</li>
        </ul>
        <ul>
          <li>El docente divide el salón en 4 "estaciones de fábrica": clasificación, ensamblaje, empaque y control de calidad.</li>
          <li>Primera ronda (3 min): los alumnos realizan las tareas de forma manual y libre, usando su criterio. El docente cuenta productos completados y errores.</li>
          <li>Segunda ronda: los alumnos se convierten en "robots" que solo ejecutan instrucciones exactas dadas por un compañero "programador" (ejemplo: "Levantar papel rojo. Mover a caja A. Soltar."). No pueden decidir nada por sí mismos.</li>
          <li>Al finalizar, se comparan resultados: ¿fue más rápido el robot o el humano? ¿cuántos errores hubo? ¿qué tipo de trabajo es mejor para cada uno?</li>
        </ul>
      `,
    },
    {
      id: "a11",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "Programación en Papel: El Laberinto",
      descripcion: "En parejas, un alumno programa con instrucciones exactas para resolver un laberinto.",
      fecha: { "3C": "2026-10-27", "3E": "2026-11-03" },
      detalleCompleto: `
        <p>👥 Modalidad: Parejas | ⏱️ Duración: 35 min</p>
        <ul>
          <li>Hojas con laberintos impresos (preparadas previamente por el docente)</li>
          <li>Lápices de colores</li>
        </ul>
        <ul>
          <li>Antes de la clase, el docente prepara e imprime laberintos sencillos, uno por alumno.</li>
          <li>Cada alumno recibe un laberinto y debe escribir un algoritmo (lista de instrucciones) para que un "robot" (su compañero) logre resolverlo, ejemplo: AVANZAR 2, GIRAR DERECHA, AVANZAR 1.</li>
          <li>El alumno entrega su algoritmo escrito a un compañero sin dejarlo ver el laberinto.</li>
          <li>El compañero debe seguir las instrucciones exactamente como están escritas, marcando la ruta sobre el laberinto.</li>
          <li>Si el "robot" se choca contra una pared o se sale del camino, el "programador" debe corregir su algoritmo.</li>
          <li>Ronda 2: el algoritmo debe incluir condicionales, por ejemplo: "SI hay pared ENTONCES girar, SINO avanzar".</li>
        </ul>
      `,
    },
    {
      id: "a12",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "Estación de Sensores",
      descripcion: "Equipos identifican qué sensores necesitaría un robot para interactuar con objetos cotidianos.",
      fecha: { "3C": "2026-11-09", "3E": "2026-11-10" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 personas | ⏱️ Duración: 25 min</p>
        <ul>
          <li>6 objetos cotidianos colocados sobre una mesa (libro, pelota, vaso, etc.)</li>
          <li>Hojas de papel</li>
          <li>Marcadores</li>
        </ul>
        <ul>
          <li>El docente coloca 6 objetos distintos sobre una mesa al frente del salón.</li>
          <li>En equipos de 4, los alumnos imaginan qué sensor necesitaría un robot para interactuar correctamente con cada objeto, y llenan una tabla con: Objeto, Sensor necesario, ¿Qué detecta?</li>
          <li>Cada equipo presenta su tabla ante el grupo y explica por qué eligió esos sensores.</li>
          <li>El docente cierra preguntando: "¿Qué pasa si el sensor falla? ¿Qué debería hacer el robot en ese caso?", introduciendo la toma de decisiones y seguridad en robótica.</li>
        </ul>
      `,
    },
  ],
  2: [
    // ===== SECUENCIA 4: CIENCIA DE DATOS =====
    {
      id: "a-s4-1",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "🧩 Rompecabezas del Pipeline de Datos",
      descripcion: "Dinámica grupal donde los alumnos forman la cadena completa del pipeline de datos con fichas.",
      fecha: { "3C": "2026-11-30", "3E": "2026-12-01" },
      detalleCompleto: `
        <p>👥 Modalidad: Grupal, en parejas o individual | ⏱️ Duración: 25 min</p>
        <ul>
          <li>20 fichas impresas por el docente (5 etapas × 4 descripciones cada una).</li>
          <li>Etapas: Recolección → Limpieza → Análisis → Visualización → Decisión.</li>
        </ul>
        <ul>
          <li>Cada ficha tiene una etapa o una descripción de lo que pasa en esa etapa.</li>
          <li>Se reparte una ficha a cada alumno (con 40 alumnos, se hacen 2 rondas o parejas).</li>
          <li>Los alumnos deben encontrar a sus 4 compañeros de "pipeline" formando la cadena completa.</li>
          <li>Una vez formados, leen en voz alta y el docente corrige.</li>
        </ul>
      `,
    },
    {
      id: "a-s4-2",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "🎭 Juego de Roles: El Algoritmo en Acción",
      descripcion: "Los alumnos representan usuarios de redes sociales y descubren cómo actúa un algoritmo de recomendación.",
      fecha: { "3C": "2026-12-07", "3E": "2026-12-02" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 | ⏱️ Duración: 35 min</p>
        <ul>
          <li>Hojas con perfiles de usuario impresas, papelógrafo, marcadores.</li>
          <li>4 perfiles de "usuarios de red social" con edad, gustos y ubicación distintos.</li>
        </ul>
        <ul>
          <li>En equipos de 4, cada alumno recibe un perfil.</li>
          <li>El docente ("el algoritmo") muestra 10 "posts"; los alumnos levantan la mano si creen que se lo mostraría a SU usuario.</li>
          <li>Después de cada post, el equipo discute por qué sí o por qué no.</li>
          <li>Al final, cada equipo dibuja en papelógrafo qué posts NO vio su usuario y si eso es bueno o malo.</li>
          <li>Se introduce el concepto de filtro burbuja y sesgo algorítmico.</li>
        </ul>
      `,
    },
    {
      id: "a-s4-3",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "📊 Taller de Infografías de Papel",
      descripcion: "En equipos, los alumnos analizan un dataset impreso y crean una infografía en cartulina.",
      fecha: { "3C": "2026-12-08", "3E": "2026-12-08" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 | ⏱️ Duración: 40 min</p>
        <ul>
          <li>Hojas carta, lápices de colores, reglas, revistas viejas, pegamento.</li>
          <li>Dataset impreso: "Calificaciones de 20 alumnos en 5 materias".</li>
        </ul>
        <ul>
          <li>Calcular el promedio grupal por materia (a mano, sin calculadora).</li>
          <li>Identificar qué materia tiene mejor y peor promedio.</li>
          <li>Crear una infografía en cartulina con título, 3 gráficas de barras, 1 conclusión y 1 pregunta que los datos NO responden.</li>
          <li>Exposición de 2 minutos por equipo.</li>
        </ul>
      `,
    },

    // ===== SECUENCIA 5: HOJAS DE CÁLCULO =====
    {
      id: "a-s5-1",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      formatoEntrega: "digital",
      titulo: "🖥️ Explorando la Interfaz",
      descripcion: "Primer acercamiento guiado a Excel/LibreOffice: celdas, filas, columnas y formato básico.",
      fecha: { "3C": "2027-01-11", "3E": "2027-01-12" },
      detalleCompleto: `
        <p>👥 Modalidad: Individual, en taller de cómputo | ⏱️ Duración: 30 min</p>
        <ul>
          <li>Computadoras con Excel o LibreOffice, guía impresa de atajos.</li>
        </ul>
        <ul>
          <li>El docente proyecta la pantalla y explica celdas, filas, columnas, hojas y barra de fórmulas.</li>
          <li>Los alumnos completan un "mapa de calor" guiado: escriben nombre, edad y materia favorita en celdas, cambian color de fondo, tamaño de letra y bordes.</li>
          <li>Guardan el archivo como "MiPrimeraHoja.xlsx".</li>
          <li>Reto final: crear una segunda hoja con los nombres de 5 compañeros.</li>
        </ul>
      `,
    },
    {
      id: "a-s5-2",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      formatoEntrega: "digital",
      titulo: "🔢 Fórmulas en Acción: El Supermercado Escolar",
      descripcion: "Los alumnos aplican fórmulas de Excel a un inventario ficticio de un supermercado escolar.",
      fecha: { "3C": "2027-01-18", "3E": "2027-01-19" },
      archivoUrl: "https://docs.google.com/spreadsheets/d/1EqV4snRy_KgfvE6qguVY7W-VDL3eZ53v5XC-e7r5ZfY/edit?usp=sharing",
      detalleCompleto: `
        <p>👥 Modalidad: Individual, en taller de cómputo | ⏱️ Duración: 40 min</p>
        <ul>
          <li>Computadoras con Excel, lista de 15 productos impresa (nombre, precio unitario, cantidad en stock).</li>
        </ul>
        <ul>
          <li>Crean columnas de nombre, precio, cantidad y total en inventario (fórmula =B2*C2).</li>
          <li>Calculan SUMA de totales y PROMEDIO de precios unitarios.</li>
          <li>Aplican fórmula SI para marcar "¿Reponer?" según el stock, con formato condicional en rojo/verde.</li>
          <li>Crean una gráfica de barras con los 5 productos más caros.</li>
        </ul>
      `,
    },
    {
      id: "a-s5-3",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      formatoEntrega: "digital",
      titulo: "🎨 Diseñando mi Primera Infografía en Excel",
      descripcion: "En equipos, los alumnos crean gráficas a partir de una encuesta y las maquetan como infografía en Excel.",
      fecha: { "3C": "2027-01-26", "3E": "2027-01-27" },
      archivoUrl: "https://docs.google.com/spreadsheets/d/1rr9-Lvssi0IuZ-G67hxGlrL9hDOKNK7G506cRFE0JB0/edit?usp=sharing",
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 3, en taller de cómputo | ⏱️ Duración: 45 min</p>
        <ul>
          <li>Computadoras con Excel, dataset impreso: "Encuesta de 30 alumnos sobre uso de redes sociales".</li>
        </ul>
        <ul>
          <li>Ingresan los datos en Excel y crean 2 gráficas (pastel de redes favoritas, barras de horas por edad).</li>
          <li>Maquetan una infografía: título, gráficas con bordes y colores, 3 datos destacados y 1 conclusión.</li>
          <li>Guardan o imprimen como PDF y exponen 2 minutos por equipo.</li>
        </ul>
      `,
    },

    // ===== SECUENCIA 6: SEGURIDAD DIGITAL AVANZADA =====
    {
      id: "a-s6-1",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "🎭 Teatro de Phishing",
      descripcion: "En equipos, los alumnos clasifican correos reales y de phishing e identifican señales de alarma.",
      fecha: { "3C": "2027-02-08", "3E": "2027-02-03" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 | ⏱️ Duración: 30 min</p>
        <ul>
          <li>Tarjetas impresas con 8 correos (4 reales, 4 de phishing), marcadores, papelógrafo.</li>
        </ul>
        <ul>
          <li>Clasifican cada correo como phishing o real y subrayan las señales de alarma (faltas de ortografía, URLs raras, urgencia extrema, premios inesperados).</li>
          <li>Escriben en papelógrafo las "5 señales de phishing" consensuadas y las presentan.</li>
          <li>El docente comenta el caso real de WannaCry (2017) como ejemplo histórico.</li>
        </ul>
      `,
    },
    {
      id: "a-s6-2",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "🏰 Construyendo Murallas Digitales",
      descripcion: "En equipos, los alumnos diseñan un 'castillo digital' con 3 niveles de defensa contra amenazas.",
      fecha: { "3C": "2027-02-15", "3E": "2027-02-16" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 3 | ⏱️ Duración: 35 min</p>
        <ul>
          <li>Hojas de papel, lápices de colores, cartulinas.</li>
        </ul>
        <ul>
          <li>Diseñan un castillo con muralla exterior (contraseñas, 2FA), media (privacidad en redes) e interior (cifrado, respaldos).</li>
          <li>Dibujan el castillo en cartulina con 3 murallas etiquetadas, 2 "soldados" por muralla y 1 "dragón" (amenaza) que cada muralla detiene.</li>
          <li>Exponen qué harían si un "dragón" (hacker) intentara entrar a su castillo.</li>
        </ul>
      `,
    },
    {
      id: "a-s6-3",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "⚖️ Tribunal del Ciberespacio",
      descripcion: "Los alumnos debaten 3 dilemas digitales en formato de juicio (juez, defensores, acusadores, jurado).",
      fecha: { "3C": "2027-02-23", "3E": "2027-02-23" },
      detalleCompleto: `
        <p>👥 Modalidad: Grupal | ⏱️ Duración: 30 min</p>
        <ul>
          <li>Tarjetas de "juez", "acusado", "defensor", papelógrafo.</li>
          <li>3 casos de dilemas digitales: publicar fotos sin permiso, venta de datos de menores, hacker "bueno" que reporta una falla.</li>
        </ul>
        <ul>
          <li>Por caso: 1 juez, 2 defensores, 2 acusadores y 3 de jurado.</li>
          <li>Cada parte argumenta 2 minutos; el juez dicta veredicto y explica.</li>
          <li>Al final, el grupo escribe 3 "reglas de oro" para ser un ciudadano digital responsable.</li>
        </ul>
      `,
    },
  ],
  3: [
    // ===== SECUENCIA 7: SOLUCIONES DIGITALES =====
    {
      id: "a-s7-1",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "🧩 Rompecabezas de Pensamiento Computacional",
      descripcion: "Dinámica grupal donde los alumnos forman grupos aplicando los 4 pilares a problemas cotidianos.",
      fecha: { "3C": "2027-03-08", "3E": "2027-03-09" },
      detalleCompleto: `
        <p>👥 Modalidad: Grupal o en parejas | ⏱️ Duración: 25 min</p>
        <ul>
          <li>24 fichas impresas (6 problemas × 4 etapas: descomposición, abstracción, patrones, algoritmo).</li>
        </ul>
        <ul>
          <li>Se reparte una ficha a cada alumno; deben encontrar a sus 3 compañeros de "problema" formando el grupo de 4 pilares.</li>
          <li>Una vez formados, explican cómo aplicaron cada pilar a su problema.</li>
          <li>El docente corrige y premia al grupo con la explicación más clara.</li>
        </ul>
      `,
    },
    {
      id: "a-s7-2",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "🏭 La Fábrica de Algoritmos",
      descripcion: "En equipos, los alumnos aplican los 4 pilares para resolver un problema real de la escuela.",
      fecha: { "3C": "2027-04-05", "3E": "2027-03-17" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 | ⏱️ Duración: 35 min</p>
        <ul>
          <li>Hojas de papel, lápices de colores, cartulinas.</li>
          <li>4 problemas de la escuela: fila de la cafetería, préstamo de útiles, limpieza del patio, alumnos que llegan tarde.</li>
        </ul>
        <ul>
          <li>Descomponen el problema en 3 partes, abstraen lo esencial, buscan patrones similares y escriben el algoritmo paso a paso (mínimo 8 pasos).</li>
          <li>Dibujan su algoritmo en cartulina como diagrama de flujo y presentan 2 min; los demás equipos votan si funcionaría en la escuela real.</li>
        </ul>
      `,
    },
    {
      id: "a-s7-3",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "🚀 Simulacro de Hackatón",
      descripcion: "Los equipos viven las 4 fases de un hackatón (empatía, ideación, prototipado, pitch) sobre un desafío social.",
      fecha: { "3C": "2027-04-13", "3E": "2027-04-13" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 | ⏱️ Duración: 40 min</p>
        <ul>
          <li>Papelógrafo, marcadores, cronómetro, tarjetas de "desafío" (ej. soledad de adultos mayores, desperdicio de agua, mascotas perdidas).</li>
        </ul>
        <ul>
          <li>Fase 1 — Empatía (5 min): ¿quién tiene el problema? Fase 2 — Ideación (10 min): 3 soluciones posibles.</li>
          <li>Fase 3 — Prototipado (15 min): dibujan 3 pantallas de su solución en cartulina. Fase 4 — Pitch (5 min): "venden" su idea a la clase.</li>
          <li>Los demás alumnos votan con fichas de colores (🟢🟡🔴); el equipo con más 🟢 gana el "Premio al Mejor Prototipo".</li>
        </ul>
      `,
    },

    // ===== SECUENCIA 8: DISEÑO WEB =====
    {
      id: "a-s8-1",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "🏗️ Arquitectos de la Información",
      descripcion: "En equipos, los alumnos rediseñan el mapa de navegación de sitios web mal organizados.",
      fecha: { "3C": "2027-04-27", "3E": "2027-04-27" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 3 | ⏱️ Duración: 25 min</p>
        <ul>
          <li>Hojas de papel, lápices de colores, cartulinas.</li>
          <li>3 sitios web descritos verbalmente con mala organización (tienda sin categorías, biblioteca por color de portada, receta con pasos absurdos).</li>
        </ul>
        <ul>
          <li>Dibujan en cartulina el mapa de navegación de cómo DEBERÍA ser cada sitio: página de inicio, categorías y acción principal en máximo 3 clics.</li>
          <li>El docente introduce la "regla de los 3 clics".</li>
        </ul>
      `,
    },
    {
      id: "a-s8-2",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "💻 Mi Primera Página en Bloc de Notas",
      descripcion: "Los alumnos escriben su primera página HTML en el bloc de notas y la abren en el navegador.",
      fecha: { "3C": "2027-05-04", "3E": "2027-05-04" },
      archivoUrl: "https://drive.google.com/file/d/1jRlIHCxdPugtJcY5-Lz18X09zuORlemE/view?usp=sharing",
      detalleCompleto: `
        <p>👥 Modalidad: Individual, en taller de cómputo | ⏱️ Duración: 40 min</p>
        <ul>
          <li>Computadoras con bloc de notas o editor de texto básico, guía impresa de etiquetas HTML.</li>
        </ul>
        <ul>
          <li>El docente explica &lt;html&gt;, &lt;head&gt;, &lt;body&gt;, &lt;h1&gt;, &lt;p&gt;, &lt;img&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;li&gt;.</li>
          <li>Los alumnos escriben su primera página (título, encabezado, párrafo de presentación, lista de proyectos favoritos y contacto), la guardan como index.html y la abren en el navegador.</li>
          <li>Reto: agregar un comentario de imagen y un enlace a un sitio que les guste.</li>
        </ul>
      `,
    },
    {
      id: "a-s8-3",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "🎨 CSS en Papel: Dando Estilo a mi Web",
      descripcion: "Los alumnos 'colorean' su página HTML como si aplicaran reglas de CSS.",
      fecha: { "3C": "2027-05-17", "3E": "2027-05-18" },
      detalleCompleto: `
        <p>👥 Modalidad: Individual | ⏱️ Duración: 35 min</p>
        <ul>
          <li>Hojas de papel, lápices de colores, las páginas HTML de la actividad anterior impresas.</li>
        </ul>
        <ul>
          <li>Subrayan y anotan al margen cómo se vería su página con reglas de color, tamaño de fuente y fondo aplicadas.</li>
          <li>El docente introduce el concepto de clases e IDs con un ejemplo simple.</li>
          <li>Reto: diseñar en papel cómo se vería el portafolio con CSS aplicado, usando mínimo 5 reglas de estilo.</li>
        </ul>
      `,
    },

    // ===== SECUENCIA 9: PROTOTIPOS IOT =====
    {
      id: "a-s9-1",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🧠 Design Thinking Express",
      descripcion: "Los alumnos aplican las 5 fases de design thinking a un usuario ficticio en tiempo cronometrado.",
      fecha: { "3C": "2027-05-31", "3E": "2027-06-01" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 | ⏱️ Duración: 30 min</p>
        <ul>
          <li>Papelógrafo, marcadores, post-its, cronómetro.</li>
          <li>4 perfiles de "usuario" con necesidades distintas (adulto mayor, alumno rural, escuela con gasto de luz, mamá trabajadora).</li>
        </ul>
        <ul>
          <li>Fases cronometradas: empatizar (3 min), definir (3 min), idear (5 min), prototipar (10 min), probar (5 min) con feedback de otro equipo.</li>
          <li>Cada equipo ajusta su prototipo y presenta en 2 min.</li>
        </ul>
      `,
    },
    {
      id: "a-s9-2",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🔌 Estación de Sensores y Actuadores",
      descripcion: "En equipos, los alumnos identifican qué sensor y actuador necesitaría un dispositivo IoT para interactuar con objetos cotidianos.",
      fecha: { "3C": "2027-06-08", "3E": "2027-06-09" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 | ⏱️ Duración: 35 min</p>
        <ul>
          <li>Hojas de papel, marcadores, objetos del salón (libro, pelota, vaso, luz, ventilador, puerta).</li>
        </ul>
        <ul>
          <li>Completan una tabla: Objeto | Sensor necesario | ¿Qué detecta? | Actuador necesario | ¿Qué hace?</li>
          <li>Reto: "Si el sensor de temperatura del ventilador falla, ¿qué pasa?" — se introduce el concepto de redundancia y seguridad en IoT.</li>
          <li>Cada equipo presenta 1 objeto con su sistema sensor-actuador completo.</li>
        </ul>
      `,
    },
    {
      id: "a-s9-3",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "🚀 Hackatón Final: Prototipo IoT",
      descripcion: "Los equipos diseñan un dispositivo IoT completo para un desafío comunitario, con pitch final.",
      fecha: { "3C": "2027-06-21", "3E": "2027-06-22" },
      detalleCompleto: `
        <p>👥 Modalidad: Equipos de 4 | ⏱️ Duración: 45 min</p>
        <ul>
          <li>Cartulinas, tijeras, pegamento, marcadores, papelógrafo, cronómetro.</li>
          <li>Desafíos comunitarios: alertas climáticas rurales, ahorro de agua escolar, seguridad para adultos mayores, riego inteligente, conteo de alumnos por salón, detección de mareas altas.</li>
        </ul>
        <ul>
          <li>Fases: empatía (5 min), definición (5 min), ideación (10 min), prototipado (15 min: vista frontal/lateral, sensores, actuadores, conexión, precio) y pitch (5 min + preguntas).</li>
          <li>Los demás alumnos votan (🟢🟡🔴); el equipo con más 🟢 gana el "Premio al Prototipo Más Innovador".</li>
        </ul>
      `,
    },
  ],
};

// "detalleCompleto": mismo campo OPCIONAL que en DATOS_TAREAS (ver
// comentario ahí); abre el modal "📖 Ver detalles" con HTML de confianza.
const DATOS_PROYECTOS = {
  // Fechas reales, verificadas contra CALENDARIO_ESCOLAR_2026_2027
  // (126/126 coinciden con días lectivos).
  1: [
    {
      id: "p3",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial · Proyecto: Mi Chatbot en Papel",
      grupo: "todos",
      titulo: "Mi Chatbot en Papel",
      descripcion: "Diseño individual de un chatbot en papel que resuelve un problema real de la escuela.",
      avance: 0,
      fechaEntrega: { "3C": "2026-09-21", "3E": "2026-09-23" },
      detalleCompleto: `
        <p>⏱️ Tiempo: 3 sesiones de clase (50 min c/u) | 👥 Modalidad: Individual</p>
        <p>Cada alumno diseñará un chatbot completo en formato físico (papel/cartulina) que resuelva un problema real de su comunidad escolar. El alumno elige uno de estos propósitos: chatbot de la cafetería escolar, de la biblioteca, de orientación médica básica o de orientación escolar.</p>
        <ul>
          <li>2-3 cartulinas de colores por alumno</li>
          <li>Lápices de colores, marcadores gruesos (negro, rojo, azul, verde)</li>
          <li>Regla, tijeras, pegamento en barra</li>
          <li>Hojas blancas tamaño carta para borradores</li>
        </ul>
        <ul>
          <li>Sesión 1 — Planeación y portada: el alumno elige el propósito de su chatbot y le pone un nombre; diseña en cartulina la portada con nombre, logo dibujado a mano y una breve descripción del propósito.</li>
          <li>Sesión 2 — Árbol de decisión: en otra cartulina, dibuja el árbol de decisión completo, con mínimo 8 interacciones (preguntas y respuestas posibles).</li>
          <li>Sesión 3 — Simulación y reflexión (entrega): en hojas blancas escribe la simulación de 3 conversaciones distintas entre un "usuario" y su chatbot, y una reflexión de 5 renglones sobre qué tan inteligente es su chatbot (¿IA real o solo reglas fijas?).</li>
          <li>Entrega final: portada + árbol de decisión + hojas de conversaciones simuladas y reflexión, juntos.</li>
        </ul>
      `,
    },
    {
      id: "p4",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual · Proyecto: Mi Metaverso Educativo",
      grupo: "todos",
      titulo: "Mi Metaverso Educativo",
      descripcion: "Equipos diseñan un prototipo de espacio educativo en el metaverso.",
      avance: 0,
      fechaEntrega: { "3C": "2026-10-12", "3E": "2026-10-14" },
      detalleCompleto: `
        <p>⏱️ Tiempo: 4 sesiones de clase (50 min c/u) | 👥 Modalidad: Equipos de 5 personas</p>
        <p>En equipos, diseñarán un prototipo en papel de un espacio en el metaverso para resolver un problema real de la escuela: falta de laboratorios de ciencias, dificultad para entender historia, falta de conciencia ecológica, poco espacio para arte, o falta de actividad física.</p>
        <ul>
          <li>Cartulina tamaño A3 (para el mapa)</li>
          <li>Hojas blancas (para la guía del usuario, tipo folleto de 4 páginas)</li>
          <li>Lápices de colores, marcadores</li>
          <li>Tijeras, pegamento, regla</li>
        </ul>
        <ul>
          <li>Sesión 1 — Elección del problema y mapa: el equipo elige el problema y define el concepto general de su mundo virtual; dibujan el mapa en cartulina A3, a color, con una leyenda que explique los elementos.</li>
          <li>Sesión 2 — Guía del usuario y avatares: elaboran una guía del usuario en formato folleto de 4 páginas, y diseñan 2 avatares con dibujo, nombre, características y habilidades.</li>
          <li>Sesión 3 — Storyboard: crean un storyboard de 6 viñetas mostrando paso a paso una "visita" al mundo virtual.</li>
          <li>Sesión 4 — Advertencias éticas y entrega: elaboran un cartel con 3 advertencias éticas sobre riesgos del metaverso (adicción, gasto excesivo, acoso virtual) y cómo evitarlos.</li>
          <li>Entrega final: mapa + guía del usuario + avatares + storyboard + cartel de advertencias, juntos.</li>
        </ul>
      `,
    },
    {
      id: "p5",
      secuencia: "🤖 Secuencia 3 — Robótica · Proyecto: Diseña tu Robot Ideal",
      grupo: "todos",
      titulo: "Diseña tu Robot Ideal",
      descripcion: "Diseño individual de un robot que resuelve un problema social de la comunidad.",
      avance: 0,
      fechaEntrega: { "3C": "2026-11-10", "3E": "2026-11-11" },
      materialApoyoUrl: "https://drive.google.com/file/d/19fNmLqA3piGtxKcgPKGt3E0AVkhWyGwW/view?usp=sharing",
      detalleCompleto: `
        <p>⏱️ Tiempo: 5 sesiones de clase (50 min c/u) | 👥 Modalidad: Individual (con asesoría entre compañeros)</p>
        <p>Cada alumno diseñará un robot completo en papel/cartulina que resuelva un problema social real de su comunidad: asistente para personas con discapacidad visual, recolector de basura en ríos y playas, enfermero para comunidades rurales, agrícola para pequeños campesinos, de limpieza para la escuela, o de búsqueda y rescate en desastres naturales.</p>
        <ul>
          <li>1-2 cartulinas tamaño A3 por alumno</li>
          <li>Lápices de colores, marcadores</li>
          <li>Regla, tijeras, pegamento</li>
          <li>Hojas blancas para la ficha técnica y el presupuesto</li>
        </ul>
        <ul>
          <li>Sesión 1 — Elección del problema y boceto técnico: elige el problema social; dibuja en cartulina A3 el diseño técnico del robot con 3 vistas (frontal, lateral, superior), etiquetando cada parte.</li>
          <li>Sesión 2 — Ficha técnica: nombre del robot, problema que resuelve, lista realista de materiales, mínimo 3 sensores con su función, mínimo 2 actuadores con su función, y si usa IA o solo reglas fijas (justificando).</li>
          <li>Sesión 3 — Algoritmo de funcionamiento: diagrama de flujo con mínimo 10 pasos y al menos 3 condicionales (SI/ENTONCES).</li>
          <li>Sesión 4 — Storyboard y presupuesto: storyboard de 4 viñetas "Un día con mi robot", y tabla de presupuesto estimado de materiales.</li>
          <li>Sesión 5 — Presentación oral (entrega): exposición oral de 3 minutos explicando el problema, cómo funciona el robot, y respondiendo preguntas del grupo.</li>
        </ul>
      `,
    },
  ],
  2: [
    {
      id: "p-s4",
      secuencia: "📘 Secuencia 4 — Ciencia de Datos · Proyecto: Mi Análisis de Datos Escolar",
      grupo: "todos",
      titulo: "Mi Análisis de Datos Escolar",
      descripcion: "Cada alumno analiza datos reales de su propio rendimiento, tiempo o hábitos y crea un informe visual en papel.",
      avance: 0,
      fechaEntrega: { "3C": "2026-12-14", "3E": "2026-12-09" },
      detalleCompleto: `
        <p>⏱️ Tiempo: 3 sesiones de clase (50 min c/u) | 👥 Modalidad: Individual</p>
        <p>El alumno elige uno de estos enfoques: análisis de sus calificaciones, análisis de su tiempo fuera de clase, o análisis de sus hábitos (sueño, alimentación, ejercicio).</p>
        <ul>
          <li>Hojas blancas y cartulina para portada, tabla, gráficas y conclusiones</li>
          <li>Lápices de colores, regla</li>
        </ul>
        <ul>
          <li>Sesión 1 — Recolección y limpieza: el alumno junta sus datos (calificaciones, horarios, hábitos) y los organiza en una tabla de mínimo 10 registros.</li>
          <li>Sesión 2 — Análisis y visualización: calcula promedios, identifica patrones y dibuja 2 gráficas de barras o pastel a mano.</li>
          <li>Sesión 3 — Conclusiones y presentación (entrega): escribe 3 hallazgos, una propuesta de mejora con 2 acciones concretas, y presenta a un compañero.</li>
          <li>Entrega final: portada + tabla de datos + gráficas + conclusiones + propuesta de mejora, juntos.</li>
        </ul>
      `,
    },
    {
      id: "p-s5",
      secuencia: "📗 Secuencia 5 — Hojas de Cálculo · Proyecto: Mi Hoja de Cálculo para Decidir",
      grupo: "todos",
      formatoEntrega: "digital",
      titulo: "Mi Hoja de Cálculo para Decidir",
      descripcion: "Cada alumno crea una hoja de cálculo en Excel que resuelve un problema real de toma de decisiones en su vida escolar o familiar.",
      avance: 0,
      fechaEntrega: { "3C": "2027-02-02", "3E": "2027-02-02" },
      materialApoyoUrl: "https://docs.google.com/spreadsheets/d/1WJdm70e8AbrAjy1WPuxqrkPREjTP0zB5hD9ZqYHPkj4/edit?usp=sharing",
      detalleCompleto: `
        <p>⏱️ Tiempo: 4 sesiones de clase (50 min c/u) | 👥 Modalidad: Individual (con asesoría entre pares)</p>
        <p>El alumno elige uno de estos enfoques: planificador de estudio, control de gastos familiares, o comparador de calificaciones.</p>
        <ul>
          <li>Computadora con Excel o LibreOffice</li>
          <li>Impresora para el entregable final</li>
        </ul>
        <ul>
          <li>Sesión 1 — Planificación: elige el problema y diseña la estructura de la hoja en papel primero.</li>
          <li>Sesión 2 — Ingreso de datos y fórmulas: crea la hoja en Excel con mínimo 15 registros y aplica fórmulas básicas (SUMA, PROMEDIO, SI).</li>
          <li>Sesión 3 — Gráficas y formato: crea 2 gráficas (barras y pastel) con títulos y aplica formato profesional.</li>
          <li>Sesión 4 — Conclusión y presentación (entrega): escribe una conclusión de 3 líneas, guarda e imprime, presenta a 2 compañeros.</li>
        </ul>
      `,
    },
    {
      id: "p-s6",
      secuencia: "📙 Secuencia 6 — Seguridad Digital Avanzada · Proyecto: Mi Manual de Supervivencia Digital",
      grupo: "todos",
      titulo: "Mi Manual de Supervivencia Digital",
      descripcion: "Cada alumno crea un manual físico (librito o tríptico) de ciberseguridad personal dirigido a estudiantes de secundaria.",
      avance: 0,
      fechaEntrega: { "3C": "2027-03-02", "3E": "2027-03-03" },
      detalleCompleto: `
        <p>⏱️ Tiempo: 4 sesiones de clase (50 min c/u) | 👥 Modalidad: Individual (con asesoría entre pares)</p>
        <p>El alumno elige el enfoque: manual del novato, manual del experto, o manual familiar (para papás y hermanos pequeños).</p>
        <ul>
          <li>Hojas y cartulina para el librito/tríptico</li>
          <li>Lápices de colores, marcadores, tijeras, pegamento</li>
        </ul>
        <ul>
          <li>Sesión 1 — Investigación y estructura: elige el enfoque, investiga amenazas y diseña la estructura del manual en borrador.</li>
          <li>Sesión 2 — Redacción e ilustración: escribe el capítulo "Conoce al enemigo" (3 amenazas) y "Tus armas" (5 consejos prácticos), con dibujos e iconos.</li>
          <li>Sesión 3 — Casos y conclusiones: escribe el resumen de 2 casos históricos y el "juramento digital" con 5 reglas y su firma.</li>
          <li>Sesión 4 — Ensamblado y presentación (entrega): arma el librito/tríptico con portada y contraportada, presenta a 2 compañeros y recibe retroalimentación.</li>
        </ul>
      `,
    },
  ],
  3: [
    {
      id: "p-s7",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales · Proyecto: Mi Solución Digital Social",
      grupo: "todos",
      titulo: "Mi Solución Digital Social",
      descripcion: "Cada alumno diseña en papel una solución digital completa que resuelve un problema social real de su comunidad.",
      avance: 0,
      fechaEntrega: { "3C": "2027-04-20", "3E": "2027-04-20" },
      detalleCompleto: `
        <p>⏱️ Tiempo: 4 sesiones de clase (50 min c/u) | 👥 Modalidad: Individual (con asesoría entre pares)</p>
        <p>El alumno elige un propósito: app de accesibilidad, app ecológica, app educativa, app de salud, app de transporte, o app de emergencias.</p>
        <ul>
          <li>Cartulinas y hojas para portada, análisis, pantallas y storyboard</li>
          <li>Lápices de colores, marcadores, regla</li>
        </ul>
        <ul>
          <li>Sesión 1 — Investigación y análisis: elige el problema y aplica los 4 pilares del pensamiento computacional (descomposición, abstracción, patrones, algoritmo de 8 pasos).</li>
          <li>Sesión 2 — Diseño de pantallas: dibuja 5 pantallas principales con botones y funciones etiquetadas.</li>
          <li>Sesión 3 — Mapa de usuario y pitch: crea un storyboard de 4 viñetas y escribe el pitch de venta (10 líneas).</li>
          <li>Sesión 4 — Ensamblado y presentación (entrega): arma la carpeta del proyecto, presenta a 2 compañeros y recibe retroalimentación.</li>
        </ul>
      `,
    },
    {
      id: "p-s8",
      secuencia: "🌐 Secuencia 8 — Diseño Web · Proyecto: Mi Portafolio Web en Papel",
      grupo: "todos",
      titulo: "Mi Portafolio Web en Papel",
      descripcion: "Cada alumno diseña un portafolio digital completo en papel, simulando la estructura de un sitio web real con HTML, CSS y navegación.",
      avance: 0,
      fechaEntrega: { "3C": "2027-05-25", "3E": "2027-05-26" },
      detalleCompleto: `
        <p>⏱️ Tiempo: 5 sesiones de clase (50 min c/u) | 👥 Modalidad: Individual (con asesoría entre pares)</p>
        <p>El alumno elige el enfoque: portafolio académico, creativo, de logros, o profesional futuro.</p>
        <ul>
          <li>Cartulinas y hojas para las 4 páginas simuladas (inicio, sobre mí, proyectos, contacto)</li>
          <li>Lápices de colores, marcadores, tijeras, pegamento</li>
        </ul>
        <ul>
          <li>Sesión 1 — Planificación y estructura: elige el enfoque, diseña el mapa de navegación y el wireframe de las 4 páginas.</li>
          <li>Sesión 2 — Contenido HTML: escribe el contenido de las 4 páginas (texto, listas, imágenes descritas).</li>
          <li>Sesión 3 — Diseño CSS: define colores, tipografías, tamaños y bordes, y los aplica a cada página en borrador.</li>
          <li>Sesión 4 — Ensamblado visual: pasa todo a limpio en cartulinas, recorta y pega elementos para crear el "sitio web físico".</li>
          <li>Sesión 5 — Presentación y retroalimentación (entrega): explica su portafolio a 2 compañeros, recibe sugerencias y ajusta detalles.</li>
        </ul>
      `,
    },
    {
      id: "p-s9",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT · Proyecto: Mi Prototipo Tecnológico Integrador",
      grupo: "todos",
      titulo: "Mi Prototipo Tecnológico Integrador",
      descripcion: "Cada alumno diseña un prototipo tecnológico completo en papel que integra pensamiento computacional, análisis de datos y tecnologías emergentes (IA, VR o robótica).",
      avance: 0,
      fechaEntrega: { "3C": "2027-06-29", "3E": "2027-06-30" },
      materialApoyoUrl: "https://drive.google.com/file/d/1CBvwXJX9mIoYs0HPDhEsnxPySFdcppBX/view?usp=sharing",
      detalleCompleto: `
        <p>⏱️ Tiempo: 5 sesiones de clase (50 min c/u) | 👥 Modalidad: Individual (con asesoría entre pares)</p>
        <p>El alumno elige un propósito: dispositivo de salud conectado, sistema ecológico inteligente, asistente educativo virtual, hogar conectado accesible, agricultura inteligente, o sistema de emergencias comunitarias.</p>
        <ul>
          <li>Cartulina A3 para el cartel principal, hojas para ficha técnica y análisis de datos</li>
          <li>Lápices de colores, marcadores</li>
        </ul>
        <ul>
          <li>Sesión 1 — Investigación y conceptualización: elige el propósito, investiga sensores/actuadores existentes y dibuja el concepto inicial.</li>
          <li>Sesión 2 — Diseño técnico: crea el dibujo técnico del dispositivo, la ficha técnica y el diagrama de flujo (mínimo 10 pasos, 2 condicionales).</li>
          <li>Sesión 3 — Análisis de datos: inventa datos realistas (10 registros), dibuja una gráfica y escribe una conclusión.</li>
          <li>Sesión 4 — Pitch y ensamblado: escribe el pitch, arma el cartel principal y practica la presentación.</li>
          <li>Sesión 5 — Presentación y feria (entrega): expone ante la clase (3 min), recibe feedback y completa la hoja de iteración.</li>
        </ul>
      `,
    },
  ],
};

const DATOS_PRESENTACIONES = {
  1: [
    {
      id: "pres1",
      titulo: "Secuencia 1: Inteligencia Artificial",
      descripcion: "Qué es la IA, machine learning, chatbots e IA generativa.",
      gammaEmbedUrl: "https://gamma.app/embed/33q42qigfwmkkwv",
    },
    {
      id: "pres2",
      titulo: "Secuencia 2: Realidad Virtual y Aumentada",
      descripcion: "Diferencias entre VR y AR, cómo se construyen mundos virtuales y el metaverso.",
      gammaEmbedUrl: "https://gamma.app/embed/bx0n1hhn28461h1",
    },
    {
      id: "pres3",
      titulo: "Secuencia 3: Robótica",
      descripcion: "Anatomía de un robot, automatización, IA aplicada y ejemplos reales.",
      gammaEmbedUrl: "https://gamma.app/embed/27kwbd015hyqt1x",
    },
  ],
  2: [
    {
      id: "pres1",
      titulo: "Secuencia 4: Introducción a la Ciencia de Datos",
      descripcion: "Qué son los datos, algoritmos, Big Data y datos abiertos.",
      gammaEmbedUrl: "https://gamma.app/embed/45iqniawlb21puz",
    },
    {
      id: "pres2",
      titulo: "Secuencia 5: Hojas de Cálculo para la Toma de Decisiones",
      descripcion: "Fórmulas, gráficas y formato condicional para organizar información.",
      gammaEmbedUrl: "https://gamma.app/embed/4ung0vsjiii6f7o",
    },
    {
      id: "pres3",
      titulo: "Secuencia 6: Seguridad Digital Avanzada",
      descripcion: "Phishing, contraseñas seguras, cifrado y huella digital.",
      gammaEmbedUrl: "https://gamma.app/embed/mz4hi5zpg9xgca9",
    },
  ],
  3: [
    {
      id: "pres1",
      titulo: "Secuencia 7: Soluciones Digitales",
      descripcion: "Pensamiento computacional y cómo pasar de un problema real a una solución.",
      gammaEmbedUrl: "https://gamma.app/embed/7e61jrne6ywhc6a",
    },
    {
      id: "pres2",
      titulo: "Secuencia 8: Diseño Web",
      descripcion: "HTML, CSS, UX/UI y cómo crear tu propio portafolio en línea.",
      gammaEmbedUrl: "https://gamma.app/embed/c68typ6805bk1up",
    },
    {
      id: "pres3",
      titulo: "Secuencia 9: Prototipos Tecnológicos e IoT",
      descripcion: "Prototipado rápido, Design Thinking e Internet de las Cosas.",
      gammaEmbedUrl: "https://gamma.app/embed/9w2hfmrj28sh3nr",
    },
  ],
};

// Fase 15: los retos de "🏆 Aplica tus conocimientos" (trimestre-N-
// practica.html), contenido verbatim de retos_temas_recompensa.md — un
// reto por trimestre con 3 partes (una por secuencia), distinto para 3C
// y 3E a propósito (para que no se compartan respuestas entre grupos).
// Cada parte declara su "tipo" y el renderizado (crearParteReto, más
// abajo) se adapta: caso_decision/clasificacion/secuencia_orden/
// cifrado_cesar/calculo_aplicado/detectar_error. La resolución se hace
// en persona con el docente — estos datos NUNCA incluyen la respuesta
// (ni el texto descifrado del César, ni el orden correcto de
// secuencia_orden, ni el diagnóstico de detectar_error): solo el
// planteamiento que el sitio puede mostrar sin arruinar el reto.
//
// pasos_desordenados de cada secuencia_orden: orden FIJO barajado a
// propósito al escribir estos datos (no aleatorio en cada carga, para
// que un grupo discutiendo el reto en clase vea siempre el mismo
// orden) — el orden correcto real está documentado en
// retos_temas_recompensa.md, nunca aquí. crearParteReto() los pinta tal
// cual vienen, sin ordenarlos: ese es el trabajo del reto, no del sitio.
const DATOS_RETOS = {
  1: {
    "3C": {
      partes: [
        {
          tipo: "caso_decision",
          secuencia: "Secuencia 1 — Inteligencia Artificial",
          texto:
            'Un sistema de IA en la escuela recomienda automáticamente qué alumnos deben pasar a un grupo de "apoyo extra" basándose solo en calificaciones anteriores. Un compañero dice que esto es justo porque "la IA no tiene prejuicios como las personas". ¿Están de acuerdo? Expliquen usando el concepto de sesgo algorítmico.',
        },
        {
          tipo: "clasificacion",
          secuencia: "Secuencia 2 — Realidad Virtual",
          instruccion: "Clasificar como Realidad Aumentada / Realidad Virtual / Metaverso:",
          items: [
            "Filtro de Instagram con orejas de animal",
            "Visor que te transporta a una isla",
            "Espacio donde amigos construyen una casa juntos con avatares",
            "App que muestra un mueble en tu sala antes de comprarlo",
            "Videojuego 100% inmersivo con visor",
            "Plataforma de ropa virtual y socialización",
          ],
        },
        {
          tipo: "secuencia_orden",
          secuencia: "Secuencia 3 — Robótica",
          instruccion: "Ordenar el ciclo básico de un robot:",
          pasos_desordenados: [
            "Controlador procesa y decide",
            "Actuador ejecuta la acción",
            "Sensor detecta información",
          ],
        },
      ],
    },
    "3E": {
      partes: [
        {
          tipo: "caso_decision",
          secuencia: "Secuencia 1 — Inteligencia Artificial",
          texto:
            'Un chatbot de atención a clientes empieza a responder groserías después de que varios usuarios "le enseñaron" malas palabras jugando con él. ¿Es culpa del chatbot? Expliquen usando el concepto de Machine Learning.',
        },
        {
          tipo: "clasificacion",
          secuencia: "Secuencia 2 — Realidad Virtual",
          instruccion: "Clasificar como Realidad Aumentada / Realidad Virtual / Metaverso:",
          items: [
            "Lentes que replican una pirámide egipcia",
            "Medidor de dimensiones sobre cámara real (mide un mueble en tu cuarto)",
            "Concierto virtual masivo con avatares",
            "Filtro de sombrero animado en video",
            "Simulador de manejo inmersivo con visor",
            "Mundo donde compras y decoras terrenos virtuales",
          ],
        },
        {
          tipo: "secuencia_orden",
          secuencia: "Secuencia 3 — Robótica",
          instruccion: "Ordenar el proceso de crear un robot:",
          pasos_desordenados: [
            "Programar el comportamiento",
            "Definir el problema",
            "Probar y ajustar",
            "Diseñar el robot",
          ],
        },
      ],
    },
  },
  2: {
    "3C": {
      partes: [
        {
          tipo: "calculo_aplicado",
          secuencia: "Secuencia 4 — Ciencia de Datos",
          instruccion: "Calcula el promedio y decide qué tipo de gráfica usar para comparar a las personas, y explica por qué.",
          tabla: {
            encabezados: ["Alumno", "Calificación"],
            filas: [
              ["Ana", "8"],
              ["Luis", "7"],
              ["Marco", "9"],
              ["Sofía", "6"],
              ["Iker", "10"],
            ],
          },
        },
        {
          tipo: "detectar_error",
          secuencia: "Secuencia 5 — Hojas de Cálculo",
          contexto: "Fórmula copiada de una hoja en inglés que no funciona en Excel en español.",
          fragmento: "=SUM(A1:A5)",
        },
        {
          tipo: "cifrado_cesar",
          secuencia: "Secuencia 6 — Seguridad Digital",
          desplazamiento: "+3",
          mensaje_cifrado: "QR FRPSDUWDV WX FODYH",
        },
      ],
    },
    "3E": {
      partes: [
        {
          tipo: "calculo_aplicado",
          secuencia: "Secuencia 4 — Ciencia de Datos",
          instruccion: "Calcula el promedio y decide qué tipo de gráfica usar para mostrar el cambio en el tiempo, y explica por qué.",
          tabla: {
            encabezados: ["Día", "Temperatura (°C)"],
            filas: [
              ["Lunes", "22"],
              ["Martes", "25"],
              ["Miércoles", "19"],
              ["Jueves", "28"],
              ["Viernes", "24"],
            ],
          },
        },
        {
          tipo: "detectar_error",
          secuencia: "Secuencia 5 — Hojas de Cálculo",
          contexto: "Esta fórmula da como resultado el error #DIV/0!",
          fragmento: "=PROMEDIO(A1:A5)",
        },
        {
          tipo: "cifrado_cesar",
          secuencia: "Secuencia 6 — Seguridad Digital",
          desplazamiento: "+2",
          mensaje_cifrado: "TCPUQOYCTG SWG UGEWGUVTC VWU CTEJKXQU",
        },
      ],
    },
  },
  3: {
    "3C": {
      partes: [
        {
          tipo: "secuencia_orden",
          secuencia: "Secuencia 7 — Soluciones Digitales",
          instruccion: "Ordenar los 4 pilares del pensamiento computacional:",
          pasos_desordenados: [
            "Abstracción",
            "Descomposición",
            "Diseño de algoritmos",
            "Reconocimiento de patrones",
          ],
        },
        {
          tipo: "detectar_error",
          secuencia: "Secuencia 8 — Diseño Web",
          contexto: "Encuentra el error en este fragmento de HTML.",
          fragmento: "<p>Bienvenido a mi sitio web",
        },
        {
          tipo: "caso_decision",
          secuencia: "Secuencia 9 — Prototipos Tecnológicos e IoT",
          texto:
            "Un sensor de temperatura en un invernadero detecta 38°C. El sistema debe regar automáticamente, pero también hay una alerta de que el tanque de agua está casi vacío. ¿Qué debería hacer el sistema y por qué?",
        },
      ],
    },
    "3E": {
      partes: [
        {
          tipo: "secuencia_orden",
          secuencia: "Secuencia 7 — Soluciones Digitales",
          instruccion: "Ordenar el ciclo de diseño de una solución:",
          pasos_desordenados: [
            "Probarla",
            "Entender el problema",
            "Mejorarla",
            "Proponer una solución",
          ],
        },
        {
          tipo: "detectar_error",
          secuencia: "Secuencia 8 — Diseño Web",
          contexto: "Encuentra el error en este fragmento de CSS.",
          fragmento: "color: blue\nfont-size: 16px;",
        },
        {
          tipo: "caso_decision",
          secuencia: "Secuencia 9 — Prototipos Tecnológicos e IoT",
          texto:
            "Un sensor de movimiento en la entrada solo debe encender las luces cuando detecta a alguien Y ya está oscureciendo. Si solo hay movimiento pero es de día, no debe encender. ¿Por qué es importante combinar los dos sensores en vez de usar solo uno?",
        },
      ],
    },
  },
};

// "secuencia" usa el mismo texto que "unidad" en DATOS_TEMARIO, para que
// renderizarInfografias() agrupe visualmente con el mismo rótulo que ya
// ve el alumno en Temario. Imágenes reales aún no existen (ver
// renderizarInfografias: fallback "🎨 Infografía en preparación" mientras
// no se suban a assets/infografias/).
const DATOS_INFOGRAFIAS = {
  1: [
    {
      id: "info-t1-1",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial",
      titulo: "IA, Machine Learning y Asistentes Virtuales",
      imagen: "assets/infografias/t1-seq1-info1.webp",
      alt: "Infografía: IA, Machine Learning y Asistentes Virtuales",
    },
    {
      id: "info-t1-2",
      secuencia: "🧠 Secuencia 1 — Inteligencia Artificial",
      titulo: "Chatbots y creatividad con IA",
      imagen: "assets/infografias/t1-seq1-info2.webp",
      alt: "Infografía: Chatbots y creatividad con IA",
    },
    {
      id: "info-t1-3",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual",
      titulo: "Cómo se crean los mundos virtuales",
      imagen: "assets/infografias/t1-seq2-info1.webp",
      alt: "Infografía: Cómo se crean los mundos virtuales",
    },
    {
      id: "info-t1-4",
      secuencia: "🥽 Secuencia 2 — Realidad Virtual",
      titulo: "AR vs VR y el Metaverso",
      imagen: "assets/infografias/t1-seq2-info2.webp",
      alt: "Infografía: AR vs VR y el Metaverso",
    },
    {
      id: "info-t1-5",
      secuencia: "🤖 Secuencia 3 — Robótica",
      titulo: "Robótica, IA y Automatización",
      imagen: "assets/infografias/t1-seq3-info1.webp",
      alt: "Infografía: Robótica, IA y Automatización",
    },
    {
      id: "info-t1-6",
      secuencia: "🤖 Secuencia 3 — Robótica",
      titulo: "Cómo funciona un robot: sensores, programación y diseño",
      imagen: "assets/infografias/t1-seq3-info2.webp",
      alt: "Infografía: Cómo funciona un robot: sensores, programación y diseño",
    },
  ],
  2: [
    {
      id: "info-t2-1",
      secuencia: "📊 Secuencia 4 — Ciencia de Datos",
      titulo: "¿Qué son los datos?",
      imagen: "assets/infografias/t2-seq4-info1.webp",
      alt: "Infografía: ¿Qué son los datos?",
    },
    {
      id: "info-t2-2",
      secuencia: "📊 Secuencia 4 — Ciencia de Datos",
      titulo: "Algoritmos que deciden por ti",
      imagen: "assets/infografias/t2-seq4-info2.webp",
      alt: "Infografía: Algoritmos que deciden por ti",
    },
    {
      id: "info-t2-3",
      secuencia: "📊 Secuencia 4 — Ciencia de Datos",
      titulo: "De datos a historias visuales",
      imagen: "assets/infografias/t2-seq4-info3.webp",
      alt: "Infografía: De datos a historias visuales",
    },
    {
      id: "info-t2-4",
      secuencia: "🧮 Secuencia 5 — Hojas de Cálculo",
      titulo: "Primeros pasos en Excel",
      imagen: "assets/infografias/t2-seq5-info1.webp",
      alt: "Infografía: Primeros pasos en Excel",
    },
    {
      id: "info-t2-5",
      secuencia: "🧮 Secuencia 5 — Hojas de Cálculo",
      titulo: "Fórmulas y funciones",
      imagen: "assets/infografias/t2-seq5-info2.webp",
      alt: "Infografía: Fórmulas y funciones",
    },
    {
      id: "info-t2-6",
      secuencia: "🧮 Secuencia 5 — Hojas de Cálculo",
      titulo: "Gráficos e infografías con datos",
      imagen: "assets/infografias/t2-seq5-info3.webp",
      alt: "Infografía: Gráficos e infografías con datos",
    },
    {
      id: "info-t2-7",
      secuencia: "🔒 Secuencia 6 — Seguridad Digital",
      titulo: "Tu huella digital y ciberataques",
      imagen: "assets/infografias/t2-seq6-info1.webp",
      alt: "Infografía: Tu huella digital y ciberataques",
    },
    {
      id: "info-t2-8",
      secuencia: "🔒 Secuencia 6 — Seguridad Digital",
      titulo: "Contraseñas y cifrado",
      imagen: "assets/infografias/t2-seq6-info2.webp",
      alt: "Infografía: Contraseñas y cifrado",
    },
    {
      id: "info-t2-9",
      secuencia: "🔒 Secuencia 6 — Seguridad Digital",
      titulo: "Ataques cibernéticos famosos",
      imagen: "assets/infografias/t2-seq6-info3.webp",
      alt: "Infografía: Ataques cibernéticos famosos",
    },
  ],
  3: [
    {
      id: "info-t3-1",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales",
      titulo: "Pensamiento computacional: de la idea a la solución",
      imagen: "assets/infografias/t3-seq7-info1.webp",
      alt: "Infografía: Pensamiento computacional: de la idea a la solución",
    },
    {
      id: "info-t3-2",
      secuencia: "🧠 Secuencia 7 — Soluciones Digitales",
      titulo: "Programando con propósito y hackatón",
      imagen: "assets/infografias/t3-seq7-info2.webp",
      alt: "Infografía: Programando con propósito y hackatón",
    },
    {
      id: "info-t3-3",
      secuencia: "🌐 Secuencia 8 — Diseño Web",
      titulo: "Arquitectura de la información y UX",
      imagen: "assets/infografias/t3-seq8-info1.webp",
      alt: "Infografía: Arquitectura de la información y UX",
    },
    {
      id: "info-t3-4",
      secuencia: "🌐 Secuencia 8 — Diseño Web",
      titulo: "HTML y CSS: la estructura de una web",
      imagen: "assets/infografias/t3-seq8-info2.webp",
      alt: "Infografía: HTML y CSS: la estructura de una web",
    },
    {
      id: "info-t3-5",
      secuencia: "🌐 Secuencia 8 — Diseño Web",
      titulo: "Sitios estáticos vs dinámicos",
      imagen: "assets/infografias/t3-seq8-info3.webp",
      alt: "Infografía: Sitios estáticos vs dinámicos",
    },
    {
      id: "info-t3-6",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT",
      titulo: "Design Thinking, MVP e IoT",
      imagen: "assets/infografias/t3-seq9-info1.webp",
      alt: "Infografía: Design Thinking, MVP e IoT",
    },
    {
      id: "info-t3-7",
      secuencia: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT",
      titulo: "Sensores, actuadores y ciclo de iteración",
      imagen: "assets/infografias/t3-seq9-info2.webp",
      alt: "Infografía: Sensores, actuadores y ciclo de iteración",
    },
  ],
};

const DATOS_VIDEOS = {
  1: [
    {
      id: "v1",
      grupo: "todos",
      titulo: "Secuencia 1: Inteligencia Artificial",
      descripcion: "Introducción a los conceptos clave de la Inteligencia Artificial y cómo se aplican en la vida cotidiana.",
      idYoutube: "qoPM-zk-tJI",
    },
    {
      id: "v2",
      grupo: "todos",
      titulo: "Secuencia 2: Realidad Virtual",
      descripcion: "Qué es la Realidad Virtual, cómo funciona y sus aplicaciones en distintas industrias.",
      idYoutube: "RM4ONu3pKrw",
    },
    {
      id: "v3",
      grupo: "todos",
      titulo: "Secuencia 3: Robótica",
      descripcion: "Fundamentos de la robótica: sensores, actuadores y ejemplos de robots en el mundo real.",
      idYoutube: "qOAiGmNCH4U",
    },
  ],
  2: [
    {
      id: "v1",
      grupo: "todos",
      titulo: "Secuencia 4: Introducción a la Ciencia de Datos",
      descripcion: "Qué es la ciencia de datos, cómo los algoritmos usan la información para tomar decisiones y cómo identificar sesgos en las recomendaciones de redes sociales.",
      idYoutube: "Z8_YqldWI-0",
    },
    {
      id: "v2",
      grupo: "todos",
      titulo: "Secuencia 5: Hojas de Cálculo para la Toma de Decisiones",
      descripcion: "Cómo usar fórmulas básicas, gráficos e infografías en una hoja de cálculo para resolver casos de estudio cotidianos.",
      idYoutube: "grbqMohFjg4",
    },
    {
      id: "v3",
      grupo: "todos",
      titulo: "Secuencia 6: Seguridad Digital Avanzada",
      descripcion: "Riesgos de phishing y robo de identidad, huella digital y cómo crear contraseñas seguras.",
      idYoutube: "BHiMuhbrJK0",
    },
  ],
  3: [
    {
      id: "v1",
      grupo: "todos",
      titulo: "Secuencia 7: Soluciones Digitales",
      descripcion: "Pensamiento computacional y diseño de algoritmos para crear soluciones digitales con propósito social.",
      idYoutube: "N79vvnGcMx4",
    },
    {
      id: "v2",
      grupo: "todos",
      titulo: "Secuencia 8: Diseño Web",
      descripcion: "La lógica detrás del diseño de páginas web: estructura HTML, presentación CSS y diferencias entre sitios estáticos y dinámicos.",
      idYoutube: "DeFdhWa6KNU",
    },
    {
      id: "v3",
      grupo: "todos",
      titulo: "Secuencia 9: Prototipos Tecnológicos e IoT",
      descripcion: "Design thinking, MVP e Internet de las Cosas: cómo diseñar y presentar un prototipo tecnológico.",
      idYoutube: "4gOE19RZo-4",
    },
  ],
};

// Temario general de cada trimestre (no depende del grupo). El campo
// "imagen" es la ruta sugerida para cuando existan las fotografías
// reales de cada tema; mientras tanto se muestra un color de la
// paleta institucional a modo de placeholder (ver renderizarTemario).
const DATOS_TEMARIO = {
  1: [
    // ===== SECUENCIA 1 — INTELIGENCIA ARTIFICIAL (p. 14) =====
    {
      id: "tm1-1",
      unidad: "🧠 Secuencia 1 — Inteligencia Artificial",
      titulo: "¿Qué relación existe entre la IA, el Machine Learning y los asistentes virtuales?",
      descripcion: "Relación entre inteligencia artificial, machine learning y asistentes virtuales.",
      imagen: "assets/temario/t1-seq1-tema1.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> La IA es el concepto general; el Machine Learning es cómo la IA "aprende" de datos; los asistentes virtuales son un ejemplo de IA aplicada.</p>
        <p>🔍 <strong>Por qué importa:</strong> Entender esto te ayuda a distinguir cuándo algo "es IA de verdad" y cuándo solo sigue reglas fijas.</p>
        <p>💡 <strong>Dato curioso:</strong> El término "Inteligencia Artificial" se usó por primera vez en 1956, ¡mucho antes de que existieran los celulares!</p>
      `,
    },
    {
      id: "tm1-2",
      unidad: "🧠 Secuencia 1 — Inteligencia Artificial",
      titulo: "¿Qué tan inteligente es tu asistente virtual?",
      descripcion: "Uso cotidiano de asistentes virtuales como Siri, Alexa y Google Assistant.",
      imagen: "assets/temario/t1-seq1-tema2.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo Siri, Alexa o Google Assistant entienden lo que les dices y responden.</p>
        <p>🔍 <strong>Por qué importa:</strong> Los usas todos los días sin darte cuenta de cómo "piensan" (o no piensan) realmente.</p>
        <p>💡 <strong>Dato curioso:</strong> Estos asistentes no "entienden" como humanos: buscan patrones de palabras para adivinar qué quieres.</p>
      `,
    },
    {
      id: "tm1-3",
      unidad: "🧠 Secuencia 1 — Inteligencia Artificial",
      titulo: "Explorando la IA conversacional",
      descripcion: "Chatbots y procesamiento de lenguaje natural (NLP).",
      imagen: "assets/temario/t1-seq1-tema3.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Qué es un chatbot y cómo el Procesamiento de Lenguaje Natural (NLP) le permite entender texto.</p>
        <p>🔍 <strong>Por qué importa:</strong> Los chatbots de atención a clientes, videojuegos o apps educativas funcionan así.</p>
        <p>💡 <strong>Dato curioso:</strong> El primer chatbot de la historia se llamó ELIZA y se creó en 1966; simulaba ser un psicólogo.</p>
      `,
    },
    {
      id: "tm1-4",
      unidad: "🧠 Secuencia 1 — Inteligencia Artificial",
      titulo: "Creando tu propio chatbot",
      descripcion: "Diseño de chatbots simples y el papel de la IA en la creatividad y el diseño.",
      imagen: "assets/temario/t1-seq1-tema4.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo se diseña la lógica de conversación de un chatbot (árbol de decisiones) y el papel de la IA en la creatividad.</p>
        <p>🔍 <strong>Por qué importa:</strong> Vas a construir el tuyo en papel — aquí entiendes la lógica antes de hacerlo.</p>
        <p>💡 <strong>Dato curioso:</strong> Muchos chatbots "simples" en realidad no usan IA: solo siguen un árbol de opciones, como un menú telefónico.</p>
      `,
    },

    // ===== SECUENCIA 2 — REALIDAD VIRTUAL (p. 31) =====
    {
      id: "tm1-5",
      unidad: "🥽 Secuencia 2 — Realidad Virtual",
      titulo: "Del papel a la inmersión: cómo se crean los mundos virtuales",
      descripcion: "Diseño de entornos 3D y motores de renderizado.",
      imagen: "assets/temario/t1-seq2-tema1.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Los pasos para diseñar un entorno 3D, desde la idea hasta que se ve en pantalla.</p>
        <p>🔍 <strong>Por qué importa:</strong> Así se hacen los videojuegos y simuladores que usas o has visto.</p>
        <p>💡 <strong>Dato curioso:</strong> Crear un solo escenario 3D realista puede tomarle a un equipo de diseñadores varias semanas.</p>
      `,
    },
    {
      id: "tm1-6",
      unidad: "🥽 Secuencia 2 — Realidad Virtual",
      titulo: "Realidad aumentada vs. realidad virtual",
      descripcion: "Diferencias entre AR y VR, con aplicaciones educativas y lúdicas.",
      imagen: "assets/temario/t1-seq2-tema2.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> La diferencia entre AR (agrega cosas a tu mundo real) y VR (te mete a un mundo totalmente digital).</p>
        <p>🔍 <strong>Por qué importa:</strong> Filtros de Instagram/Snapchat son AR; unos lentes VR te llevan a otro mundo.</p>
        <p>💡 <strong>Dato curioso:</strong> Pokémon GO fue uno de los primeros juegos de AR en volverse famoso mundialmente, en 2016.</p>
      `,
    },
    {
      id: "tm1-7",
      unidad: "🥽 Secuencia 2 — Realidad Virtual",
      titulo: "Explorando el metaverso",
      descripcion: "Construcción de experiencias interactivas en mundos virtuales colaborativos.",
      imagen: "assets/temario/t1-seq2-tema3.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Qué es el metaverso y cómo varias personas pueden compartir un mundo virtual.</p>
        <p>🔍 <strong>Por qué importa:</strong> Es la base de espacios digitales colaborativos que ya existen (juegos, reuniones virtuales).</p>
        <p>💡 <strong>Dato curioso:</strong> La palabra "metaverso" viene de una novela de ciencia ficción de 1992 llamada Snow Crash.</p>
      `,
    },

    // ===== SECUENCIA 3 — ROBÓTICA (p. 51) =====
    {
      id: "tm1-8",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "Evaluación de sistemas tecnológicos a través de la robótica",
      descripcion: "Análisis crítico de sistemas robóticos.",
      imagen: "assets/temario/t1-seq3-tema1.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo analizar un sistema robótico con criterio técnico (qué hace bien, qué le falta).</p>
        <p>🔍 <strong>Por qué importa:</strong> Te prepara para pensar como ingeniero antes de diseñar tu propio robot.</p>
        <p>💡 <strong>Dato curioso:</strong> La palabra "robot" viene del checo robota, que significa "trabajo forzado" — apareció en una obra de teatro de 1920.</p>
      `,
    },
    {
      id: "tm1-9",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "¿Qué relación existe entre robótica, IA y automatización?",
      descripcion: "Relación entre robótica, inteligencia artificial y automatización.",
      imagen: "assets/temario/t1-seq3-tema2.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo estos tres conceptos se combinan: la robótica es el "cuerpo", la IA la "mente", la automatización el resultado.</p>
        <p>🔍 <strong>Por qué importa:</strong> Fábricas, drones y electrodomésticos inteligentes usan esta combinación.</p>
        <p>💡 <strong>Dato curioso:</strong> No todo robot tiene IA: muchos robots de fábrica solo repiten el mismo movimiento sin "pensar" nada.</p>
      `,
    },
    {
      id: "tm1-10",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "De la idea al movimiento: programando un robot desde cero",
      descripcion: "Programación básica de robots con bloques o código.",
      imagen: "assets/temario/t1-seq3-tema3.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Los pasos básicos para programar el comportamiento de un robot (con bloques o código simple).</p>
        <p>🔍 <strong>Por qué importa:</strong> Es la base de cómo se mueven los robots reales, aunque tú lo hagas en papel.</p>
        <p>💡 <strong>Dato curioso:</strong> Los brazos robóticos que arman coches pueden repetir un movimiento con precisión de fracciones de milímetro.</p>
      `,
    },
    {
      id: "tm1-11",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "Robots en acción: automatización y toma de decisiones",
      descripcion: "Sensores, actuadores y lógica de decisiones.",
      imagen: "assets/temario/t1-seq3-tema4.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo un robot usa sensores para "sentir" su entorno y actuadores para "actuar" según lo que detecta.</p>
        <p>🔍 <strong>Por qué importa:</strong> Así funciona una aspiradora robot, un semáforo inteligente o una alarma.</p>
        <p>💡 <strong>Dato curioso:</strong> Una aspiradora robot puede usar hasta 3 tipos distintos de sensores solo para no caerse de las escaleras.</p>
      `,
    },
    {
      id: "tm1-12",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "Diseña tu robot ideal",
      descripcion: "Desafíos de creatividad y tecnología en el diseño de un robot.",
      imagen: "assets/temario/t1-seq3-tema5.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> A aplicar todo lo anterior para crear tu propio diseño de robot que resuelva un problema real.</p>
        <p>🔍 <strong>Por qué importa:</strong> Es tu proyecto final de la secuencia — aquí conectas todo lo aprendido.</p>
        <p>💡 <strong>Dato curioso:</strong> Muchos inventos robóticos reales (como el Roomba) nacieron de resolver un problema doméstico simple, igual que el tuyo.</p>
      `,
    },
  ],
  2: [
    // ===== SECUENCIA 4 — CIENCIA DE DATOS =====
    {
      id: "tm2-1",
      unidad: "📊 Secuencia 4 — Ciencia de Datos",
      titulo: "¿Qué es la ciencia de datos?",
      descripcion: "Qué son los datos, tipos de datos (numéricos, categóricos, temporales, geoespaciales) y cómo se convierten en información útil.",
      imagen: "assets/temario/t2-seq4-tema1.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Qué son los datos (numéricos, categóricos, temporales, geoespaciales) y cómo se convierten en información útil.</p>
        <p>🔍 <strong>Por qué importa:</strong> Todo lo que haces en tu celular genera datos que alguien más analiza.</p>
        <p>💡 <strong>Dato curioso:</strong> Cada minuto se generan más de 500 horas de video nuevo en YouTube — puros datos por procesar.</p>
      `,
    },
    {
      id: "tm2-2",
      unidad: "📊 Secuencia 4 — Ciencia de Datos",
      titulo: "Algoritmos y decisiones",
      descripcion: "Cómo los algoritmos de recomendación (redes sociales, streaming) influyen en lo que vemos y compramos, y qué son los sesgos algorítmicos.",
      imagen: "assets/temario/t2-seq4-tema2.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo los algoritmos de recomendación deciden qué ves en redes sociales o streaming, y qué son los sesgos algorítmicos.</p>
        <p>🔍 <strong>Por qué importa:</strong> Si no entiendes cómo funcionan, crees que "eliges" libremente lo que en realidad te muestran.</p>
        <p>💡 <strong>Dato curioso:</strong> A esto se le llama "filtro burbuja": entre más le das like a un tema, menos ves de los demás — puedes acabar viendo solo un lado del mundo.</p>
      `,
    },
    {
      id: "tm2-3",
      unidad: "📊 Secuencia 4 — Ciencia de Datos",
      titulo: "Visualizando datos",
      descripcion: "Cómo convertir datos en gráficas e infografías que cuenten una historia clara.",
      imagen: "assets/temario/t2-seq4-tema3.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo convertir números en gráficas e infografías que cuenten una historia clara de un vistazo.</p>
        <p>🔍 <strong>Por qué importa:</strong> Una buena gráfica comunica en segundos lo que una tabla de 50 filas no logra explicar.</p>
        <p>💡 <strong>Dato curioso:</strong> Una tabla con demasiados números "nadie la lee" — pero la misma información en una gráfica de barras se entiende en 3 segundos.</p>
      `,
    },

    // ===== SECUENCIA 5 — HOJAS DE CÁLCULO =====
    {
      id: "tm2-4",
      unidad: "🧮 Secuencia 5 — Hojas de Cálculo",
      titulo: "Primeros pasos en Excel",
      descripcion: "Celdas, filas, columnas, tipos de datos y formato básico.",
      imagen: "assets/temario/t2-seq5-tema1.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Qué son celdas, filas, columnas, tipos de datos y cómo dar formato básico a una hoja.</p>
        <p>🔍 <strong>Por qué importa:</strong> Es la herramienta que más se usa en oficinas, negocios y hasta para llevar las cuentas de la casa.</p>
        <p>💡 <strong>Dato curioso:</strong> Excel existe desde 1985 — ¡tiene más de 40 años y sigue siendo la hoja de cálculo más usada del mundo!</p>
      `,
    },
    {
      id: "tm2-5",
      unidad: "🧮 Secuencia 5 — Hojas de Cálculo",
      titulo: "Fórmulas y funciones",
      descripcion: "SUMA, PROMEDIO, CONTAR y otras funciones para analizar datos.",
      imagen: "assets/temario/t2-seq5-tema2.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> A usar SUMA, PROMEDIO, CONTAR y otras funciones para analizar datos automáticamente.</p>
        <p>🔍 <strong>Por qué importa:</strong> En vez de sumar a mano 100 números, una fórmula lo hace en un segundo y sin errores.</p>
        <p>💡 <strong>Dato curioso:</strong> Excel tiene más de 450 funciones distintas — en la secundaria usarás apenas un puñado de las más útiles.</p>
      `,
    },
    {
      id: "tm2-6",
      unidad: "🧮 Secuencia 5 — Hojas de Cálculo",
      titulo: "Gráficos e infografías",
      descripcion: "Cómo representar datos visualmente para tomar mejores decisiones.",
      imagen: "assets/temario/t2-seq5-tema3.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo representar tus datos visualmente para tomar mejores decisiones.</p>
        <p>🔍 <strong>Por qué importa:</strong> Convertir una tabla aburrida en una gráfica clara ayuda a explicar tus ideas a cualquier persona.</p>
        <p>💡 <strong>Dato curioso:</strong> Combinar datos con buen diseño es exactamente lo que hacen los periódicos y noticieros para explicar estadísticas.</p>
      `,
    },

    // ===== SECUENCIA 6 — SEGURIDAD DIGITAL =====
    {
      id: "tm2-7",
      unidad: "🔒 Secuencia 6 — Seguridad Digital",
      titulo: "Identidad digital y ciberataques",
      descripcion: "Phishing, robo de identidad y huella digital.",
      imagen: "assets/temario/t2-seq6-tema1.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Qué es el phishing, el robo de identidad y tu "huella digital" (todo lo que compartes en línea).</p>
        <p>🔍 <strong>Por qué importa:</strong> Todos dejamos rastro en internet sin darnos cuenta; saber identificarlo te protege.</p>
        <p>💡 <strong>Dato curioso:</strong> El virus "ILOVEYOU" del año 2000 llegaba como un correo de amor y logró infectar 50 millones de computadoras en todo el mundo.</p>
      `,
    },
    {
      id: "tm2-8",
      unidad: "🔒 Secuencia 6 — Seguridad Digital",
      titulo: "Contraseñas y cifrado",
      descripcion: "Cómo crear contraseñas seguras y proteger información personal.",
      imagen: "assets/temario/t2-seq6-tema2.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo crear contraseñas realmente seguras y la idea básica de cómo funciona el cifrado.</p>
        <p>🔍 <strong>Por qué importa:</strong> Una contraseña débil es como dejar la puerta de tu casa sin llave.</p>
        <p>💡 <strong>Dato curioso:</strong> Con cifrado, aunque un hacker robe tu mensaje, solo ve símbolos sin sentido — sin la clave correcta, es inútil para él.</p>
      `,
    },
    {
      id: "tm2-9",
      unidad: "🔒 Secuencia 6 — Seguridad Digital",
      titulo: "Casos históricos de ciberataques",
      descripcion: "Ejemplos reales (como WannaCry) para aprender a prevenir ataques.",
      imagen: "assets/temario/t2-seq6-tema3.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Ejemplos reales (como WannaCry) para entender cómo ocurren los ataques y cómo prevenirlos.</p>
        <p>🔍 <strong>Por qué importa:</strong> Aprender de casos reales te enseña a reconocer señales de peligro antes de que te pase a ti.</p>
        <p>💡 <strong>Dato curioso:</strong> El ataque WannaCry de 2017 "secuestró" archivos de hospitales en 150 países y pedía pago en bitcoins para liberarlos.</p>
      `,
    },
  ],
  3: [
    // ===== SECUENCIA 7 — SOLUCIONES DIGITALES =====
    {
      id: "tm3-1",
      unidad: "🧠 Secuencia 7 — Soluciones Digitales",
      titulo: "Soluciones Digitales",
      descripcion: "Pensamiento computacional y descomposición de problemas cotidianos en algoritmos.",
      imagen: "assets/temario/t3-seq7-tema1.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Qué es una solución digital y cómo el pensamiento computacional descompone un problema cotidiano en pasos ordenados (algoritmo).</p>
        <p>🔍 <strong>Por qué importa:</strong> Toda app o sistema que usas nació de alguien "descomponiendo" un problema real en pasos simples.</p>
        <p>💡 <strong>Dato curioso:</strong> Apps como las de transporte o alertas sísmicas empezaron como un problema cotidiano que alguien decidió resolver paso a paso.</p>
      `,
    },
    {
      id: "tm3-2",
      unidad: "🧠 Secuencia 7 — Soluciones Digitales",
      titulo: "Abstracción y reconocimiento de patrones",
      descripcion: "Cómo simplificar problemas complejos identificando solo lo esencial y detectar patrones para automatizar soluciones, con ejemplos cotidianos como rutas de camiones o el horario de clase.",
      imagen: "assets/temario/t3-seq7-tema2.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo simplificar un problema complejo quedándote solo con lo esencial, y cómo detectar patrones para automatizar soluciones.</p>
        <p>🔍 <strong>Por qué importa:</strong> Reconocer patrones (como rutas de camiones o el horario de clases) es la base para crear sistemas que se anticipen a lo que necesitas.</p>
        <p>💡 <strong>Dato curioso:</strong> Google Maps predice el tráfico analizando patrones de miles de viajes anteriores, no adivinando al azar.</p>
      `,
    },
    {
      id: "tm3-3",
      unidad: "🧠 Secuencia 7 — Soluciones Digitales",
      titulo: "Programación con propósito social",
      descripcion: "La programación como herramienta para resolver problemas reales; el hackatón como metodología de innovación rápida y ejemplos de apps que mejoran la vida cotidiana.",
      imagen: "assets/temario/t3-seq7-tema3.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Que programar no es solo escribir código: es resolver problemas reales, y qué es un hackatón como forma de innovar rápido.</p>
        <p>🔍 <strong>Por qué importa:</strong> Las mejores apps no nacen de la tecnología más avanzada, sino de entender bien un problema humano.</p>
        <p>💡 <strong>Dato curioso:</strong> WhatsApp, Uber y Airbnb comenzaron como prototipos muy simples que resolvían un solo problema puntual.</p>
      `,
    },

    // ===== SECUENCIA 8 — DISEÑO WEB =====
    {
      id: "tm3-4",
      unidad: "🌐 Secuencia 8 — Diseño Web",
      titulo: "Diseño Web",
      descripcion: "Lógica de las páginas web con HTML y CSS básico para un portafolio digital propio.",
      imagen: "assets/temario/t3-seq8-tema1.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> La lógica detrás de una página web con HTML (estructura) y CSS (estilo) básico, para construir tu propio portafolio digital.</p>
        <p>🔍 <strong>Por qué importa:</strong> Con estas dos herramientas puedes crear tu primera página web real, aunque sea sencilla.</p>
        <p>💡 <strong>Dato curioso:</strong> HTML tiene más de 30 años (creado en 1991) y sigue siendo la base de absolutamente todas las páginas web que visitas.</p>
      `,
    },
    {
      id: "tm3-5",
      unidad: "🌐 Secuencia 8 — Diseño Web",
      titulo: "UX/UI y arquitectura de la información",
      descripcion: "Cómo navegan los usuarios un sitio web: jerarquía visual, mapas de navegación y wireframes, con ejemplos de buena y mala usabilidad y el principio de 'usuario primero'.",
      imagen: "assets/temario/t3-seq8-tema2.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo se organiza un sitio para que cualquier persona lo entienda fácil: jerarquía visual, mapas de navegación y wireframes.</p>
        <p>🔍 <strong>Por qué importa:</strong> Un sitio mal organizado hace que la gente se vaya en segundos, sin importar qué tan bonito se vea.</p>
        <p>💡 <strong>Dato curioso:</strong> El principio "usuario primero" significa diseñar pensando en cómo navega la gente, no en lo que al diseñador le gusta ver.</p>
      `,
    },
    {
      id: "tm3-6",
      unidad: "🌐 Secuencia 8 — Diseño Web",
      titulo: "Sitios estáticos vs. dinámicos",
      descripcion: "Diferencia entre sitios que solo muestran información y sitios que responden al usuario, y el papel de JavaScript para dar interactividad a la web.",
      imagen: "assets/temario/t3-seq8-tema3.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> La diferencia entre un sitio que solo muestra información y uno que responde a lo que haces (gracias a JavaScript).</p>
        <p>🔍 <strong>Por qué importa:</strong> Explica por qué unas páginas solo se leen y otras te dejan dar clic, escribir o jugar.</p>
        <p>💡 <strong>Dato curioso:</strong> JavaScript se creó en apenas 10 días en 1995 — hoy es uno de los lenguajes más usados del mundo.</p>
      `,
    },

    // ===== SECUENCIA 9 — PROTOTIPOS IOT =====
    {
      id: "tm3-7",
      unidad: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT",
      titulo: "Prototipos Tecnológicos e IoT",
      descripcion: "Design thinking, MVP e Internet de las Cosas para presentar un prototipo.",
      imagen: "assets/temario/t3-seq9-tema1.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Qué es el design thinking, un MVP (producto mínimo viable) y el Internet de las Cosas (IoT).</p>
        <p>🔍 <strong>Por qué importa:</strong> Así se crean los primeros prototipos de cualquier invento, antes de gastar en la versión final.</p>
        <p>💡 <strong>Dato curioso:</strong> Muchas startups famosas empezaron probando un MVP muy simple antes de convertirse en las apps que conoces hoy.</p>
      `,
    },
    {
      id: "tm3-8",
      unidad: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT",
      titulo: "Sensores, actuadores y dispositivos conectados",
      descripcion: "Cómo los dispositivos IoT 'sienten' el mundo con sensores y 'actúan' sobre él con actuadores, con ejemplos cotidianos como termostatos inteligentes o riego automático.",
      imagen: "assets/temario/t3-seq9-tema2.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Cómo un dispositivo IoT "siente" el mundo con sensores y "actúa" sobre él con actuadores.</p>
        <p>🔍 <strong>Por qué importa:</strong> Así funcionan objetos que ya usas: termostatos inteligentes, riego automático, focos que se prenden solos.</p>
        <p>💡 <strong>Dato curioso:</strong> Una pulsera de actividad física puede tener hasta 5 sensores distintos trabajando al mismo tiempo sin que lo notes.</p>
      `,
    },
    {
      id: "tm3-9",
      unidad: "🔧 Secuencia 9 — Prototipos Tecnológicos e IoT",
      titulo: "Pitch, iteración y mejora continua",
      descripcion: "El ciclo de iteración (probar → recibir feedback → ajustar → volver a probar), cómo practicar un pitch de 3 minutos, y casos de éxito que empezaron como prototipos simples.",
      imagen: "assets/temario/t3-seq9-tema3.png",
      detalleTemario: `
        <p>🎯 <strong>Qué vas a aprender:</strong> Que ningún prototipo queda "terminado" a la primera: se prueba, se recibe feedback, se ajusta y se vuelve a probar. Y cómo dar un pitch de 3 minutos.</p>
        <p>🔍 <strong>Por qué importa:</strong> Esta es la forma real en que se mejoran los productos tecnológicos, incluso después de lanzarse.</p>
        <p>💡 <strong>Dato curioso:</strong> Airbnb e Instagram fueron rediseñados varias veces después de su primera versión, gracias a la iteración constante.</p>
      `,
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
// Modo Demo (Fase 6): pasa por obtenerDatos() en vez de clienteSupabase
// directo, igual que el resto de las lecturas de avisos/alumnos_registro/
// progreso — hasta esta fase quedó fuera del inventario original de
// Fase 2 porque es una función distinta a la que usa el CRUD de avisos
// del panel (esa sí ya pasaba por obtenerDatos(), ver
// renderizarTablaAvisos()). El filtro de expiración se mueve de un
// .or() del lado del servidor a un filtro en JS después de traer los
// datos: obtenerDatos()/obtenerDatosDemo() no soportan condiciones OR
// (su "opciones" cubre exactamente eq/in/noNulo/esNulo/order/limit, ver
// su comentario en sección 2), y agregar esa capacidad solo para este
// caso habría tocado la capa compartida por los otros 8 puntos ya
// verificados — el resultado final es idéntico, solo cambia dónde se
// aplica el filtro.
async function obtenerAvisos() {
  const fechaHoyISO = new Date().toISOString().slice(0, 10);
  const { data, error } = await obtenerDatos("avisos", { order: { columna: "fecha", ascending: true } });

  if (error || !data) return DATOS_AVISOS;

  return data
    .filter((aviso) => !aviso.fecha_expiracion || aviso.fecha_expiracion >= fechaHoyISO)
    .map((aviso) => ({
      id: aviso.id,
      grupo: aviso.grupo,
      fecha: aviso.fecha,
      titulo: aviso.titulo,
      descripcion: aviso.descripcion,
      prioridad: aviso.prioridad,
    }));
}

async function obtenerEventos() {
  const { data, error } = await obtenerDatos("eventos_calendario", { order: { columna: "fecha", ascending: true } });

  if (error || !data) return [];

  return data.map((evento) => ({
    id: evento.id,
    grupo: evento.grupo,
    fecha: evento.fecha,
    titulo: evento.titulo,
    tipo: evento.tipo,
  }));
}

async function obtenerHorario() {
  return DATOS_HORARIO;
}

// Estas funciones sí reciben el trimestre (1, 2 o 3). Cuando se conecte
// Google Sheets, lo natural es que cada trimestre lea de su propia hoja,
// por ejemplo:
//   const resp = await fetch(URL_API_SHEETS + "Rubricas_T" + trimestre);
//   return await resp.json();
async function obtenerTemario(trimestre) {
  return DATOS_TEMARIO[trimestre] || [];
}

async function obtenerRubricas(trimestre) {
  return DATOS_RUBRICAS[trimestre] || [];
}

// Aplica correcciones de fecha (tabla fechas_override de Supabase, para
// cuando una fecha de entrega cambia después de publicada) sobre un array
// de tareas/actividades/proyectos ya obtenido. Devuelve un array e items
// NUEVOS: nunca muta `items` ni sus objetos, así que DATOS_TAREAS/
// DATOS_ACTIVIDADES/DATOS_PROYECTOS se quedan intactos como fuente
// original. resolverFechaItem() y fechaLimiteISO() no cambian: ambas solo
// leen item.fecha/item.fechaEntrega, que aquí ya llega corregido.
async function aplicarOverridesFechas(items, tipo, trimestre) {
  // Modo Demo (Fase 6): pasa por obtenerDatos() en vez de
  // clienteSupabase directo, mismo criterio que el resto de las
  // lecturas — con demoModeActivo()=false arma la misma consulta que
  // ya hacía antes de esta fase, mismo shape {data,error}.
  const { data: overrides, error } = await obtenerDatos("fechas_override", {
    eq: { trimestre, tipo },
  });

  // Sin red o tabla no accesible: se queda con las fechas originales.
  if (error || !overrides || overrides.length === 0) return items;

  // item_id -> filas de override de ese item (puede haber una por grupo:
  // "3C", "3E" y/o "todos").
  const overridesPorItem = new Map();
  overrides.forEach((fila) => {
    if (!overridesPorItem.has(fila.item_id)) overridesPorItem.set(fila.item_id, []);
    overridesPorItem.get(fila.item_id).push(fila);
  });

  // Mismo campo por tipo que ya usan resolverFechaItem() y fechaLimiteISO().
  const campoFecha = tipo === "actividad" ? "fecha" : "fechaEntrega";

  return items.map((item) => {
    const filasOverride = overridesPorItem.get(item.id);
    if (!filasOverride) return item;

    const valorOriginal = item[campoFecha];
    const itemConOverride = { ...item };

    if (typeof valorOriginal === "string") {
      // Grupo específico: la fila de override de ese grupo gana sobre la
      // de "todos" si existen ambas.
      const filaTodos = filasOverride.find((fila) => fila.grupo === "todos");
      const filaGrupo = filasOverride.find((fila) => fila.grupo === item.grupo);
      const filaAplicable = filaGrupo || filaTodos;
      if (filaAplicable) itemConOverride[campoFecha] = filaAplicable.fecha;
    } else if (valorOriginal && typeof valorOriginal === "object") {
      // grupo:"todos" con fecha distinta por grupo ({3C, 3E}): una fila de
      // override "todos" reemplaza ambas claves; una fila de grupo
      // específico reemplaza solo esa clave y gana sobre la de "todos".
      const nuevoValor = { ...valorOriginal };
      const filaTodos = filasOverride.find((fila) => fila.grupo === "todos");
      if (filaTodos) {
        nuevoValor["3C"] = filaTodos.fecha;
        nuevoValor["3E"] = filaTodos.fecha;
      }
      const fila3C = filasOverride.find((fila) => fila.grupo === "3C");
      if (fila3C) nuevoValor["3C"] = fila3C.fecha;
      const fila3E = filasOverride.find((fila) => fila.grupo === "3E");
      if (fila3E) nuevoValor["3E"] = fila3E.fecha;
      itemConOverride[campoFecha] = nuevoValor;
    }

    return itemConOverride;
  });
}

async function obtenerTareas(trimestre) {
  return aplicarOverridesFechas(DATOS_TAREAS[trimestre] || [], "tarea", trimestre);
}

async function obtenerActividades(trimestre) {
  return aplicarOverridesFechas(DATOS_ACTIVIDADES[trimestre] || [], "actividad", trimestre);
}

async function obtenerProyectos(trimestre) {
  return aplicarOverridesFechas(DATOS_PROYECTOS[trimestre] || [], "proyecto", trimestre);
}

async function obtenerVideos(trimestre) {
  return DATOS_VIDEOS[trimestre] || [];
}

async function obtenerPresentaciones(trimestre) {
  return DATOS_PRESENTACIONES[trimestre] || [];
}

async function obtenerInfografias(trimestre) {
  return DATOS_INFOGRAFIAS[trimestre] || [];
}

/* =========================================================
   3. ESTADO DE LA APLICACIÓN
   ========================================================= */

// Claves usadas en localStorage para que el grupo y el tema se
// mantengan al navegar entre la portada y las páginas de trimestre.
const CLAVE_GRUPO = "grupoSeleccionado";
const CLAVE_TEMA = "temaSeleccionado";
// Mismo patrón que CLAVE_TEMA: el <script> del <head> de cada página ya
// la lee y aplica --escala-texto antes de cargar css/style.css (evita
// parpadeo); ver activarControlEscalaTexto() más abajo.
const CLAVE_ESCALA_TEXTO = "escalaTextoSeleccionada";

// Grupo seleccionado actualmente ('todos', '3C' o '3E'). Se recupera
// de localStorage para que la elección sobreviva a la navegación
// entre páginas; si no hay nada guardado, se usa "todos".
let grupoActual = localStorage.getItem(CLAVE_GRUPO) || "todos";

// Tema visual actual (uno de los 10 slugs de TEMAS_DISPONIBLES, sección
// 7). También se recupera de localStorage por la misma razón que el
// grupo; sin nada guardado todavía (primera visita), cae al tema de
// sistema (prefers-color-scheme) en vez de asumir "oscuro" a fuerzas.
let temaActual =
  localStorage.getItem(CLAVE_TEMA) ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro");

// Niveles de tamaño de texto (accesibilidad visual, alumnos con lentes).
// "multiplicador" escala --escala-texto en :root (ver html{font-size} en
// css/style.css) — casi toda la tipografía del sitio está en rem, así
// que escala proporcionalmente sin romper layouts.
const NIVELES_ESCALA_TEXTO = [
  { slug: "normal", nombre: "Normal", multiplicador: 1 },
  { slug: "grande", nombre: "Grande", multiplicador: 1.15 },
  { slug: "muy-grande", nombre: "Muy grande", multiplicador: 1.3 },
];

// Recuperado de localStorage por la misma razón que temaActual/grupoActual.
// El <script> del <head> de cada página ya aplicó --escala-texto antes de
// este punto (evita parpadeo); esto solo sincroniza la variable de JS con
// lo que ya está pintado.
let escalaTextoActual =
  NIVELES_ESCALA_TEXTO.find((nivel) => nivel.slug === localStorage.getItem(CLAVE_ESCALA_TEXTO))
    ?.slug || "normal";

// Preferencia de vista para Tareas/Actividades/Proyectos — piloto SOLO
// en trimestre-1.html (ver TRIMESTRE_ACTUAL más abajo, sección 2): una
// sola clave global, no una por sección, para que las 3 secciones
// siempre coincidan. Se lee una sola vez aquí (no se arranca en
// "acordeon" y se cambia después) para que el primer render ya salga en
// el modo correcto, sin parpadeo.
const CLAVE_VISTA_SECUENCIAS = "vistaSecuenciasTrimestre1";
let vistaSecuenciasActual = localStorage.getItem(CLAVE_VISTA_SECUENCIAS) || "acordeon";

// ---- Barra lateral legada de una sola columna (código muerto: las 10
// páginas del sitio ya usan el riel de 2 columnas — ver activarFlyoutsRiel
// en la sección 8) ----
const CLAVE_SIDEBAR_COLAPSADA = "sidebarColapsada";
const CLAVE_SUBMENU_INICIO = "submenuInicioExpandido";
const CLAVE_SUBMENU_TRIMESTRE = "submenuTrimestreExpandido";

// Preferencia de sidebar colapsada/expandida (desktop ≥1024px). Se lee
// y se aplica aquí mismo, en código de nivel superior que corre antes
// de DOMContentLoaded: el <aside> y el botón ya existen en el DOM en
// este punto porque el <script> va al final del <body>, así que no hay
// que esperar al evento para evitar un "flash" de sidebar expandida
// que luego se colapsa. aplicarEstadoSidebarColapsada está definida más
// abajo (sección 8) pero se puede llamar aquí por hoisting; es un no-op
// seguro en las 10 páginas del sitio — ya ninguna tiene .barra-lateral
// (sitemap.html y admin.html fueron las últimas en migrar al riel).
let sidebarColapsada = localStorage.getItem(CLAVE_SIDEBAR_COLAPSADA) === "true";
aplicarEstadoSidebarColapsada(sidebarColapsada);

// Cliente de Supabase. Se define aquí (antes que nada que lo use) porque
// el guard de trimestre de abajo necesita consultarlo de inmediato, en
// código de nivel superior que corre antes de llegar a la sección 11
// (donde antes vivía esta constante): un `const` más abajo en el mismo
// archivo no es accesible todavía en ese punto (zona muerta temporal),
// aunque la función que lo usa esté definida más arriba, si esa función
// se invoca antes de llegar a su declaración.
const SUPABASE_URL = "https://dugfyqtzcnuwjfvijsqs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_aofoI-IHSwFh4yi5jzLANw_k_2e11dj";
const clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Trimestre desbloqueado de verdad. El sitio no tiene un calendario
// académico real que decida solo cuándo abrir cada trimestre, así que
// esto se sube a mano (a 2 o a 3, en la tabla config_sitio de Supabase,
// fila clave="trimestre_desbloqueado") cuando toca abrirlo.
//
// trimestreDesbloqueado queda null hasta que promesaTrimestreDesbloqueado
// resuelve; calcularEstadoTrimestre() y el guard de abajo son los únicos
// lugares que lo leen, y ambos esperan esa promesa antes de leerlo.
let trimestreDesbloqueado = null;
const CLAVE_CACHE_TRIMESTRE_DESBLOQUEADO = "cache_trimestre_desbloqueado";

async function obtenerTrimestreDesbloqueado() {
  try {
    const { data, error } = await clienteSupabase
      .from("config_sitio")
      .select("valor")
      .eq("clave", "trimestre_desbloqueado")
      .single();

    if (error) throw error;

    const valor = Number(data.valor);
    localStorage.setItem(CLAVE_CACHE_TRIMESTRE_DESBLOQUEADO, String(valor));
    return valor;
  } catch (error) {
    // Sin red o RLS mal configurado: usa el último valor visto en este
    // dispositivo. Sin nada en caché (primera visita sin internet, caso
    // raro), 1 es la opción conservadora: bloquea todo excepto el
    // Trimestre 1, nunca al revés.
    const cache = localStorage.getItem(CLAVE_CACHE_TRIMESTRE_DESBLOQUEADO);
    return cache !== null ? Number(cache) : 1;
  }
}

// Patrones de fondo activos/inactivos (config_sitio, clave
// "patrones_fondo_activos"). Infraestructura para una sesión posterior
// que implementará los patrones visuales; por ahora nada del sitio
// público llama a esta función todavía. A diferencia de
// obtenerTrimestreDesbloqueado (fallback conservador = 1, bloquea), acá
// el fallback mientras carga o si falla la consulta es "false" (sin
// patrón), para no arriesgar un parpadeo de "aparece y desaparece"
// cuando los patrones se activen visualmente.
const CLAVE_CACHE_PATRONES_FONDO_ACTIVOS = "cache_patrones_fondo_activos";

async function obtenerPatronesFondoActivos() {
  try {
    const { data, error } = await clienteSupabase
      .from("config_sitio")
      .select("valor")
      .eq("clave", "patrones_fondo_activos")
      .single();

    if (error) throw error;

    const valor = data.valor === "true";
    localStorage.setItem(CLAVE_CACHE_PATRONES_FONDO_ACTIVOS, String(valor));
    return valor;
  } catch (error) {
    const cache = localStorage.getItem(CLAVE_CACHE_PATRONES_FONDO_ACTIVOS);
    return cache !== null ? cache === "true" : false;
  }
}

// Arranca la consulta de inmediato (no dentro del IIFE de abajo) para que
// el guard y el DOMContentLoaded de la sección 10 compartan la misma
// petición en vez de duplicarla.
const promesaTrimestreDesbloqueado = obtenerTrimestreDesbloqueado();

// Misma razón que promesaTrimestreDesbloqueado arriba: arranca ya, se
// espera dentro de DOMContentLoaded (ver sección 10) para decidir si se
// agrega la clase "patrones-activos" al <body> (ver css/style.css,
// patrones de fondo de los 8 temas nuevos).
const promesaPatronesFondoActivos = obtenerPatronesFondoActivos();

// Tema de evento activo (config_sitio, clave "tema_evento_activo") — ver
// EVENTOS_DISPONIBLES (sección 7). "ninguno" (valor por defecto) y
// cualquier error de lectura se tratan igual que "sin evento": null,
// para que el flujo normal de tema personal siga como siempre. Usa
// leerValorConfigSitio(), definida más abajo (sección de módulos admin)
// pero ya disponible acá — es function declaration, no const, sin TDZ.
//
// El resultado se cachea en localStorage (siempre como "ninguno" o el
// slug real, nunca vacío) para que el script inline de <head> de cada
// página (ver las 11 páginas HTML) pueda aplicar el tema correcto de
// forma síncrona en la SIGUIENTE carga, antes de que Supabase responda
// — evita el flash del tema por defecto. Ese script inline es
// autocontenido y no importa este archivo, así que la clave
// "cache_tema_evento_activo" está literal ahí también: si se cambia
// acá, hay que cambiarla en las 11 páginas.
const CLAVE_CACHE_TEMA_EVENTO_ACTIVO = "cache_tema_evento_activo";

async function obtenerTemaEventoActivo() {
  try {
    const valor = await leerValorConfigSitio("tema_evento_activo");
    const resultado = valor && valor !== "ninguno" ? valor : null;
    localStorage.setItem(CLAVE_CACHE_TEMA_EVENTO_ACTIVO, resultado || "ninguno");
    return resultado;
  } catch {
    return null;
  }
}

// Misma razón que promesaTrimestreDesbloqueado/promesaPatronesFondoActivos
// arriba: arranca ya, se espera dentro de DOMContentLoaded ANTES de
// aplicar el tema personal (sección 10) — un evento forzado gana siempre
// que exista, sin ni siquiera leer localStorage/Supabase del tema
// personal.
const promesaTemaEventoActivo = obtenerTemaEventoActivo();

// "Modo Demo" (panel docente, módulo Apariencia) — a diferencia de los 3
// flags de arriba, esto NUNCA toca Supabase/config_sitio bajo ninguna
// circunstancia: es 100% local al navegador de quien lo activa, nunca
// visible para alumnos reales ni sincronizado entre dispositivos.
// localStorage es síncrono, así que no hace falta un patrón de promesa
// como el resto de esta sección. Fase 1 solo deja la bandera + el
// toggle del panel admin listos — ningún módulo llama a
// demoModeActivo() todavía (eso es Fase 2).
const CLAVE_DEMO_ACTIVO = "tecno10mixta_demo_activo";

function demoModeActivo() {
  return localStorage.getItem(CLAVE_DEMO_ACTIVO) === "true";
}

function activarModoDemo() {
  localStorage.setItem(CLAVE_DEMO_ACTIVO, "true");
  window.location.reload();
}

function desactivarModoDemo() {
  localStorage.setItem(CLAVE_DEMO_ACTIVO, "false");
  window.location.reload();
}

// Capa de mock para "Modo Demo" (Fase 2). Único punto de entrada que las
// funciones de lectura de alumnos_registro/progreso/avisos usan en vez
// de clienteSupabase.from(tabla)... directo. Con demoModeActivo()=false
// arma la MISMA cadena de Supabase que ya existía antes de esta fase
// (mismo resultado, mismo shape {data,error}/{count,error}); con
// demoModeActivo()=true, filtra/ordena las tablas ficticias de
// datos-demo.js con la misma lógica de opciones, sin tocar Supabase.
// Los INSERT/UPDATE/DELETE no pasan por aquí — siguen yendo directo a
// clienteSupabase, sin cambios (Fase 3/4 deciden qué hacer con los
// botones de entrega y la calificación dual en modo demo).
//
// opciones no es un mini-ORM genérico: cubre exactamente los filtros
// que las funciones de lectura ya usaban hoy, ni uno más.
//   select: string ("*" por default)
//   eq: { columna: valor, ... }         -- AND de igualdades
//   in: { columna: [valores], ... }     -- AND de "IN"
//   noNulo: ["columna", ...]            -- AND de "IS NOT NULL"
//   esNulo: { columna: true, ... }      -- AND de "IS NULL"
//   order: { columna, ascending }
//   limit: number
//   count: "exact", head: true          -- devuelve {count,error} en vez de {data,error}
async function obtenerDatos(tabla, opciones = {}) {
  if (demoModeActivo()) return obtenerDatosDemo(tabla, opciones);

  let consulta = clienteSupabase
    .from(tabla)
    .select(opciones.select || "*", opciones.count ? { count: opciones.count, head: !!opciones.head } : undefined);

  if (opciones.eq) for (const [columna, valor] of Object.entries(opciones.eq)) consulta = consulta.eq(columna, valor);
  if (opciones.in) for (const [columna, valores] of Object.entries(opciones.in)) consulta = consulta.in(columna, valores);
  if (opciones.noNulo) for (const columna of opciones.noNulo) consulta = consulta.not(columna, "is", null);
  if (opciones.esNulo) for (const columna of Object.keys(opciones.esNulo)) consulta = consulta.is(columna, null);
  if (opciones.gte) for (const [columna, valor] of Object.entries(opciones.gte)) consulta = consulta.gte(columna, valor);
  if (opciones.lt) for (const [columna, valor] of Object.entries(opciones.lt)) consulta = consulta.lt(columna, valor);
  if (opciones.order) consulta = consulta.order(opciones.order.columna, { ascending: opciones.order.ascending });
  if (typeof opciones.limit === "number") consulta = consulta.limit(opciones.limit);

  return await consulta;
}

// DEMO_ALUMNOS/DEMO_PERFILES/DEMO_PROGRESO/DEMO_AVISOS/
// DEMO_FECHAS_OVERRIDE vienen de datos-demo.js (cargado antes que este
// archivo, ver esa etiqueta <script> — hoy en admin.html, index.html,
// trimestre-1/2/3.html y progreso.html, las páginas que realmente
// llaman a obtenerDatos() con demoModeActivo()) — si ese archivo no
// está cargado (demo desactivado, o una página que nunca necesita
// datos ficticios) estas funciones nunca se llaman, así que no hace
// falta un guard de "variable no definida" aquí.
const DEMO_TABLAS = {
  alumnos_registro: () => DEMO_ALUMNOS,
  perfiles: () => DEMO_PERFILES,
  progreso: () => DEMO_PROGRESO,
  asistencia: () => DEMO_ASISTENCIA,
  avisos: () => DEMO_AVISOS,
  eventos_calendario: () => DEMO_EVENTOS,
  fechas_override: () => DEMO_FECHAS_OVERRIDE,
  // Fase 12: a diferencia de las tablas de arriba, no viene de un DEMO_
  // array en datos-demo.js — la decisión de producto ya tomada es que
  // Modo Demo siempre muestra los 9 temas de recompensa bloqueados, así
  // que el mock es directamente "sin filas" (ver obtenerEstadoDesbloqueoTemas,
  // sección 7).
  temas_desbloqueados_grupo: () => [],
};

function obtenerDatosDemo(tabla, opciones) {
  let filas = (DEMO_TABLAS[tabla]?.() || []).slice();

  // String(...) en vez de === / Set nativo: PostgREST coerciona el tipo
  // del lado del servidor (una columna entera como "trimestre" acepta
  // .eq("trimestre","1") desde un <select>, cuyo .value siempre es
  // string, contra datos-demo.js que guarda trimestre:1 como número) —
  // sin esto, cualquier filtro numérico-contra-string se queda en 0
  // filas de forma silenciosa (bug real encontrado al verificar en
  // navegador: Calificación mostraba 0% de avance para todos).
  if (opciones.eq) {
    for (const [columna, valor] of Object.entries(opciones.eq)) {
      filas = filas.filter((fila) => String(fila[columna]) === String(valor));
    }
  }
  if (opciones.in) {
    for (const [columna, valores] of Object.entries(opciones.in)) {
      const conjunto = new Set(valores.map(String));
      filas = filas.filter((fila) => conjunto.has(String(fila[columna])));
    }
  }
  if (opciones.noNulo) {
    for (const columna of opciones.noNulo) filas = filas.filter((fila) => fila[columna] != null);
  }
  if (opciones.esNulo) {
    for (const columna of Object.keys(opciones.esNulo)) filas = filas.filter((fila) => fila[columna] == null);
  }
  // new Date(...) en vez de comparación de strings: los timestamps reales
  // (columna timestamptz) y los de datos-demo.js no comparten formato
  // exacto de string, solo son fechas válidas equivalentes.
  if (opciones.gte) {
    for (const [columna, valor] of Object.entries(opciones.gte)) {
      filas = filas.filter((fila) => new Date(fila[columna]) >= new Date(valor));
    }
  }
  if (opciones.lt) {
    for (const [columna, valor] of Object.entries(opciones.lt)) {
      filas = filas.filter((fila) => new Date(fila[columna]) < new Date(valor));
    }
  }
  if (opciones.order) {
    const { columna, ascending } = opciones.order;
    filas = filas.slice().sort((a, b) => (a[columna] < b[columna] ? -1 : a[columna] > b[columna] ? 1 : 0) * (ascending ? 1 : -1));
  }
  if (typeof opciones.limit === "number") filas = filas.slice(0, opciones.limit);

  // Proyección de columnas: replica el recorte real de Supabase cuando
  // select pide menos que "*" (ver obtenerTendenciasSemanalesDashboard/
  // obtenerEntregasFeedActividad) — sin esto, código que dependiera
  // de que una columna NO seleccionada venga undefined se comportaría
  // distinto en demo que en real.
  if (opciones.select && opciones.select !== "*") {
    const columnas = opciones.select.split(",").map((c) => c.trim());
    filas = filas.map((fila) => Object.fromEntries(columnas.map((columna) => [columna, fila[columna]])));
  }

  if (opciones.count === "exact" && opciones.head) return { count: filas.length, error: null };
  return { data: filas, error: null };
}

// Trimestre de la página actual ('1', '2' o '3'), tomado de
// <body data-trimestre="…">. En la portada (index.html) no existe
// ese atributo, por lo que queda en null.
const TRIMESTRE_ACTUAL = document.body.dataset.trimestre || null;

// Guarda de acceso real (no solo visual): si se entra por URL directa a
// la página de un trimestre que trimestreDesbloqueado todavía no libera,
// se redirige a la portada de inmediato, antes de renderizar nada de esa
// página. Como ahora la consulta es asíncrona, en páginas de trimestre
// se muestra un overlay de carga si la respuesta tarda más de 150ms (para
// no dejar la página en blanco/a medio renderizar mientras se resuelve).
(async function guardTrimestreDesbloqueado() {
  let overlayCarga = null;
  let temporizadorOverlay = null;

  if (TRIMESTRE_ACTUAL) {
    temporizadorOverlay = setTimeout(() => {
      overlayCarga = mostrarOverlayCargaTrimestre();
    }, 150);
  }

  trimestreDesbloqueado = await promesaTrimestreDesbloqueado;

  if (temporizadorOverlay) clearTimeout(temporizadorOverlay);

  if (TRIMESTRE_ACTUAL && Number(TRIMESTRE_ACTUAL) > trimestreDesbloqueado) {
    window.location.replace("index.html");
    return;
  }

  if (overlayCarga) ocultarOverlayCargaTrimestre(overlayCarga);
})();

// Inserta el overlay de carga a pantalla completa (fondo sólido, no
// semitransparente) y lo hace aparecer con fade-in en el siguiente frame.
// Solo se usa desde el guard de arriba, en páginas de trimestre, cuando
// la consulta a Supabase tarda más de 150ms.
function mostrarOverlayCargaTrimestre() {
  const overlay = document.createElement("div");
  overlay.className = "overlay-carga-trimestre";
  overlay.innerHTML =
    '<div class="overlay-carga-trimestre__anillo" aria-hidden="true"></div>' +
    '<p class="overlay-carga-trimestre__texto">Cargando…</p>';
  document.body.appendChild(overlay);

  // Fuerza reflow: si se agregara la clase "--visible" en el mismo tick
  // que se crea el elemento, el navegador colapsaría ambos cambios de
  // estilo en uno solo y la transición de opacity no se vería.
  overlay.offsetHeight;
  overlay.classList.add("overlay-carga-trimestre--visible");
  return overlay;
}

// Hace fade-out del overlay y lo quita del DOM al terminar la transición.
// Con prefers-reduced-motion activado, .overlay-carga-trimestre pierde su
// "transition" (ver css/style.css) y "transitionend" nunca dispara. Se
// detecta leyendo transition-duration ANTES de quitar la clase --visible
// (esa duración vive en la clase base .overlay-carga-trimestre, no en
// --visible, así que el valor no cambia al quitarla).
//
// El bloqueo de clics YA NO depende de que "transitionend" dispare: quitar
// la clase --visible corta pointer-events de inmediato (ver css/style.css),
// de forma síncrona. Lo que sigue abajo (listener + setTimeout de
// respaldo) es solo limpieza del DOM — sacar el div ya invisible y
// ya no-interactivo — no correctness de que el sitio quede bloqueado.
// El setTimeout cubre el caso general de "un evento que a veces no
// dispara" (el navegador puede colapsar un show+hide muy seguido antes de
// pintar el frame intermedio, sin disparar transición real — el mismo
// timing reproducido para este bug), no solo el caso de reduced-motion ya
// cubierto arriba. 300ms = duración real de la transición (200ms) + margen.
function ocultarOverlayCargaTrimestre(overlay) {
  const sinTransicion = getComputedStyle(overlay).transitionDuration === "0s";
  overlay.classList.remove("overlay-carga-trimestre--visible");
  if (sinTransicion) {
    overlay.remove();
    return;
  }
  overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
  setTimeout(() => overlay.remove(), 300);
}

// Último trimestre que el alumno visitó ('1' por defecto). La barra
// lateral es idéntica en las 5 páginas del sitio, pero los enlaces a
// Temario/Rúbricas/Tareas/Actividades/Proyectos/Videos/Entrega son
// anclas que solo existen dentro de una página de trimestre: en la
// portada y en FAQ, esos enlaces deben apuntar a la página de este
// último trimestre visto (ver actualizarEnlacesTrimestreEnSidebar).
const CLAVE_ULTIMO_TRIMESTRE = "ultimoTrimestreVisto";
let ultimoTrimestreVisto = localStorage.getItem(CLAVE_ULTIMO_TRIMESTRE) || "1";
if (TRIMESTRE_ACTUAL) {
  ultimoTrimestreVisto = TRIMESTRE_ACTUAL;
  localStorage.setItem(CLAVE_ULTIMO_TRIMESTRE, TRIMESTRE_ACTUAL);
}

// Cuenta e identificación de alumno (ver sección 11 para el resto de la
// lógica). perfilActivoCache guarda {grupo, nombre} del alumno con sesión
// iniciada en Supabase; lo puebla sincronizarPerfilActivo() de forma
// async, pero se lee de forma síncrona en el resto del archivo.
let perfilActivoCache = null;

// progresoCache guarda las filas {tipo, item_id, trimestre} de la tabla
// "progreso" de Supabase que pertenecen al alumno con sesión iniciada (el
// origen real ahora es automático, no un checkbox manual). La puebla
// sincronizarPerfilActivo() en el mismo momento que perfilActivoCache (ver
// sección 11) para que ambas cachés estén listas antes del primer render;
// itemEstaCompletado() la lee de forma síncrona igual que obtenerPerfilActivo().
let progresoCache = [];

// Registro por alumno (no una bandera global) de quién ya contestó el
// Examen de Diagnóstico (ver #examen-diagnostico). Es necesario por
// alumno porque el dispositivo se comparte entre compañeros: si fuera un
// solo booleano, que el Alumno A lo descarte ocultaría el banner para el
// Alumno B aunque este no haya contestado nada. La clave de cada alumno
// reutiliza el mismo formato grupo+nombre que usa idAlumnoExamenDiagnostico().
const CLAVE_EXAMEN_DIAGNOSTICO_POR_ALUMNO = "examenDiagnosticoPorAlumno";

// Mismo Google Form que #enlace-examen-diagnostico en el banner de la
// portada (ver index.html); se reutiliza aquí para el enlace de la fila
// de progreso cuando el examen sigue pendiente.
const URL_EXAMEN_DIAGNOSTICO = "https://forms.gle/HhGcroSo3gAFbQBn6";

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

// Extrae el valor CRUDO (string ISO, sin formatear) de un campo de fecha
// para un grupo específico, soportando el formato legado (string, una
// sola fecha para ambos grupos) y el formato por grupo ({ "3C": ...,
// "3E": ... }, para ítems grupo:"todos" con horarios distintos por
// grupo). Único lugar con este soporte de formato — resolverFechaItem()
// (texto ya formateado) y fechaLimiteISO() (fecha límite para decidir
// vencimiento) lo reutilizan en vez de repetir cada una su propia rama
// string-vs-objeto.
function resolverValorFechaPorGrupo(valorFecha, grupo) {
  if (valorFecha == null) return null;
  if (typeof valorFecha === "string") return valorFecha;
  return valorFecha[grupo] || null;
}

// Resuelve el valor de fechaEntrega/fecha de un ítem a texto ya formateado.
// Por defecto resuelve contra grupoActual (el selector de grupo de la
// portada), pero acepta un "grupoParaResolver" explícito para los casos
// donde el grupo relevante es otro (ej. el panel de Progreso, que debe
// usar el grupo del alumno identificado, no el selector de grupo de la
// página — son conceptos independientes). Con "todos" se muestran las
// dos fechas juntas porque no hay una sola fecha "correcta" que mostrar.
function resolverFechaItem(valorFecha, grupoParaResolver) {
  if (typeof valorFecha === "string") return formatearFecha(valorFecha);

  const grupo = grupoParaResolver || grupoActual;

  if (grupo === "3C" || grupo === "3E") return formatearFecha(resolverValorFechaPorGrupo(valorFecha, grupo));

  return (
    "3°C: " + formatearFecha(resolverValorFechaPorGrupo(valorFecha, "3C")) +
    " · 3°E: " + formatearFecha(resolverValorFechaPorGrupo(valorFecha, "3E"))
  );
}

function crearBadgeGrupo(grupo) {
  const span = document.createElement("span");
  span.className = "badge-grupo";
  span.textContent = textoGrupo(grupo);
  return span;
}

// Informativo, no decorativo (aunque no sea interactivo): a diferencia de
// crearBadgeGrupo, aquí el texto visible ("💻 Digital"/"✍️ Físico") no
// alcanza para un lector de pantalla, por eso lleva aria-label explícito
// con la frase completa.
function crearBadgeFormato(formatoEntrega) {
  const esDigital = formatoEntrega === "digital";
  const span = document.createElement("span");
  span.className = "badge-formato";
  span.title = esDigital
    ? "Entrega en archivo digital"
    : "Entrega en físico / a mano en el cuaderno";
  span.setAttribute(
    "aria-label",
    esDigital ? "Formato de entrega: archivo digital" : "Formato de entrega: a mano en el cuaderno"
  );
  span.textContent = esDigital ? "💻 Digital" : "✍️ Físico";
  return span;
}

function textoPrioridad(prioridad) {
  if (prioridad === "urgente") return "Urgente";
  if (prioridad === "importante") return "Importante";
  if (prioridad === "recordatorio") return "Recordatorio";
  return "General";
}

function crearEnlaceDescarga(url, texto) {
  const enlace = document.createElement("a");
  enlace.className = "enlace-descarga";
  enlace.href = url;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  enlace.textContent = texto || "📎 Descargar material";
  return enlace;
}

// Botón principal de una tarea: más prominente que crearEnlaceDescarga,
// para las instrucciones formales (ver "instruccionesUrl" en DATOS_TAREAS).
function crearEnlaceInstrucciones(url) {
  const enlace = document.createElement("a");
  enlace.className = "enlace-instrucciones";
  enlace.href = url;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  enlace.textContent = "📄 Ver instrucciones completas";
  return enlace;
}

// Fuente real del progreso personal de un ítem (tarea, actividad o
// proyecto): filas de la tabla "progreso" de Supabase, cacheadas en
// progresoCache (ver sección 11 y sincronizarPerfilActivo). "trimestre" por
// defecto es el de la página actual; el panel de Progreso de la portada
// (que no tiene TRIMESTRE_ACTUAL) lo pasa explícito para poder leer el
// estado de los 3 trimestres desde ahí. Sin sesión iniciada, progresoCache
// queda vacío y todo se reporta como no completado.
function itemEstaCompletado(tipo, id, trimestre) {
  trimestre = trimestre || TRIMESTRE_ACTUAL;
  return progresoCache.some(
    (fila) =>
      fila.tipo === tipo &&
      String(fila.item_id) === String(id) &&
      String(fila.trimestre) === String(trimestre)
  );
}

// Fecha límite (ISO, sin formatear) de un ítem para decidir si está
// vencido: mismo campo por tipo que usa resolverFechaItem (item.fecha para
// actividades, item.fechaEntrega para tareas/proyectos), resuelto por
// grupo vía resolverValorFechaPorGrupo() (mismo soporte de formato que
// esa función, sin repetirlo aquí).
function fechaLimiteISO(tipo, item, grupo) {
  const valor = tipo === "actividad" ? item.fecha : item.fechaEntrega;
  return resolverValorFechaPorGrupo(valor, grupo);
}

// Vencido = ya pasó el final del día de la fecha límite. Solo tiene
// sentido para ítems no completados (ver crearChecklistProgreso).
function itemEstaVencido(tipo, item, grupo) {
  const iso = fechaLimiteISO(tipo, item, grupo);
  if (!iso) return false;
  return new Date(iso + "T23:59:59") < new Date();
}

// Enlace directo a una tarea/actividad/proyecto específica: viven en la
// página de PRÁCTICA del trimestre (ver división Teoría/Práctica de
// trimestre-N.html / trimestre-N-practica.html, Fase 7) — nunca en
// Teoría, así que nunca es "trimestre-N.html#...". Único punto de
// construcción de este enlace: construirSemaforoPendientes(),
// renderizarProgresoDetallado() y el panel de Progreso de la portada lo
// reutilizan en vez de repetir la concatenación cada uno.
function enlacePendiente(trimestre, tipo, id) {
  return "trimestre-" + trimestre + "-practica.html#" + tipo + "-" + id;
}

// Pendientes con fecha límite resuelta, ordenados ascendente (el más
// próximo primero) — capa de datos pura reutilizada por el semáforo +
// "próxima entrega" de progreso.html (construirSemaforoPendientes) y por
// "Misión de hoy"/"Próximas entregas" del panel de Progreso de la
// portada (construirDashboardPendientes). El llamador ya debe pasar
// solo pendientes sin completar; esta función no filtra completado.
function obtenerPendientesOrdenados(pendientes, grupo) {
  return pendientes
    .map(({ tipo, item }) => ({ tipo, item, iso: fechaLimiteISO(tipo, item, grupo) }))
    .filter(({ iso }) => iso)
    .sort((a, b) => a.iso.localeCompare(b.iso));
}

// Estado del semáforo (verde/amarillo/rojo) a partir de una lista ya
// ordenada por obtenerPendientesOrdenados(). Rojo: al menos un pendiente
// vencido (itemEstaVencido). Amarillo: nada vencido, pero algo vence en
// los próximos 3 días. Verde: ninguno de los dos casos anteriores.
function calcularEstadoSemaforo(conFecha, grupo) {
  const ahora = new Date();
  const finDelDia = (iso) => new Date(iso + "T23:59:59");

  if (conFecha.some(({ tipo, item }) => itemEstaVencido(tipo, item, grupo))) return "rojo";

  const porVencerPronto = conFecha.some(({ iso }) => {
    const diasRestantes = Math.ceil((finDelDia(iso) - ahora) / 86400000);
    return diasRestantes <= 3;
  });
  return porVencerPronto ? "amarillo" : "verde";
}

// Fecha (ISO) por la que ordenar un ítem en "Próximas fechas de este
// trimestre" (ver obtenerProximasFechasTrimestre() abajo). Con
// grupoActual === "3C"/"3E" es simplemente fechaLimiteISO() de ese
// grupo; con "todos" un ítem puede tener 2 fechas distintas (3C/3E), así
// que se ordena por la más próxima de las dos — mismo criterio de "lo
// primero que alguien tiene que entregar" que ya usa resolverFechaItem()
// para decidir qué mostrar cuando no hay un solo grupo seleccionado.
function fechaOrdenTrimestre(tipo, item) {
  if (grupoActual === "3C" || grupoActual === "3E") {
    return fechaLimiteISO(tipo, item, grupoActual);
  }
  const fecha3C = fechaLimiteISO(tipo, item, "3C");
  const fecha3E = fechaLimiteISO(tipo, item, "3E");
  if (fecha3C && fecha3E) return fecha3C < fecha3E ? fecha3C : fecha3E;
  return fecha3C || fecha3E;
}

// Fusiona tareas/actividades/proyectos de un trimestre en un solo
// arreglo ordenado cronológicamente, para "Próximas fechas de este
// trimestre" en trimestre-1/2/3.html. Cero queries nuevas a Supabase:
// obtenerTareas/Actividades/Proyectos() ya resuelven fechas_override vía
// aplicarOverridesFechas() (sección 1) — son las mismas llamadas que ya
// hacen renderizarTareas/Actividades/Proyectos() para sus propias
// secciones. El filtro de grupo reutiliza elementoCoincideConGrupo()
// (mismo criterio sobre grupoActual que usa el resto de la página). Cada
// item se queda con su forma original — crearChecklistProgreso() la
// necesita tal cual para el badge de estado — envuelto en { tipo, item },
// donde "tipo" es "tarea"/"actividad"/"proyecto".
async function obtenerProximasFechasTrimestre(trimestre) {
  const [tareas, actividades, proyectos] = await Promise.all([
    obtenerTareas(trimestre),
    obtenerActividades(trimestre),
    obtenerProyectos(trimestre),
  ]);

  return [
    ...tareas.map((item) => ({ tipo: "tarea", item })),
    ...actividades.map((item) => ({ tipo: "actividad", item })),
    ...proyectos.map((item) => ({ tipo: "proyecto", item })),
  ]
    .filter(({ item }) => elementoCoincideConGrupo(item))
    .sort((a, b) => {
      const fechaA = fechaOrdenTrimestre(a.tipo, a.item) || "";
      const fechaB = fechaOrdenTrimestre(b.tipo, b.item) || "";
      return fechaA.localeCompare(fechaB);
    });
}

// Recalcula "X de Y completadas" y la barra de progreso de una sección
// (tareas o actividades) a partir de su lista actualmente visible (ya
// filtrada por grupo). "tipo" es el mismo usado al construir la clave de
// progreso; "etiqueta" es el sustantivo que se muestra ("tareas",
// "actividades").
function actualizarResumenProgreso(idResumen, datos, tipo, etiqueta) {
  const resumen = document.getElementById(idResumen);
  if (!resumen) return;

  resumen.innerHTML = "";
  if (datos.length === 0) return;

  const total = datos.length;
  const completadas = datos.filter((item) => itemEstaCompletado(tipo, item.id)).length;
  const porcentaje = Math.round((completadas / total) * 100);

  const texto = document.createElement("p");
  texto.className = "resumen-progreso__texto";
  texto.textContent = completadas + " de " + total + " " + etiqueta + " completadas";

  const barra = document.createElement("div");
  barra.className = "barra-progreso";
  barra.setAttribute("role", "progressbar");
  barra.setAttribute("aria-valuenow", String(completadas));
  barra.setAttribute("aria-valuemin", "0");
  barra.setAttribute("aria-valuemax", String(total));
  barra.setAttribute("aria-label", "Progreso de " + etiqueta + " completadas");
  const relleno = document.createElement("div");
  relleno.className = "barra-progreso__relleno";
  relleno.style.width = porcentaje + "%";
  barra.appendChild(relleno);

  resumen.append(texto, barra);
}

// icono es opcional (emoji, ej. "📢") y solo lo pasan los vacíos reales
// de alumno (ver activarles en cada renderizarX() de la sección de
// abajo) — el resto de los 36 usos del sitio (paneles densos de admin,
// "Cargando…", el caso de filtro pendiente en Promedios) no lo pasan y
// siguen viendo exactamente el <p.sin-resultados> de siempre, sin el
// contenedor .sin-resultados-icono nuevo (ver css/style.css).
function mostrarSinResultados(contenedor, mensaje, icono = null) {
  contenedor.innerHTML = "";

  if (!icono) {
    const parrafo = document.createElement("p");
    parrafo.className = "sin-resultados";
    parrafo.textContent = mensaje;
    contenedor.appendChild(parrafo);
    return;
  }

  const envoltura = document.createElement("div");
  envoltura.className = "sin-resultados-icono";

  const iconoEl = document.createElement("span");
  iconoEl.className = "sin-resultados-icono__icono";
  iconoEl.setAttribute("aria-hidden", "true");
  iconoEl.textContent = icono;

  const parrafo = document.createElement("p");
  parrafo.className = "sin-resultados sin-resultados-icono__mensaje";
  parrafo.textContent = mensaje;

  envoltura.append(iconoEl, parrafo);
  contenedor.appendChild(envoltura);
}

// Items (tareas/actividades/proyectos) que tienen "detalleCompleto",
// indexados por id. Se llena durante el renderizado de cada sección y
// permite que el listener delegado de ".boton-ver-detalle" (que solo
// recibe el id vía data-item-id) recupere el objeto completo.
const mapaDetallesPorId = new Map();

function crearBotonVerDetalle(item) {
  mapaDetallesPorId.set(item.id, item);
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton-ver-detalle";
  boton.dataset.itemId = item.id;
  boton.textContent = "📖 Ver detalles";
  return boton;
}

// Anima la salida de cualquier <dialog> del sitio antes de cerrarlo de
// verdad: un <dialog> no anima su propio close() nativo (deja de
// renderizarse de golpe), así que se aplica "dialog--cerrando" —mismo
// estado que ya usa @starting-style para la entrada, ver css/style.css—
// y se espera a que la transición termine antes de llamar a .close().
// Con prefers-reduced-motion activo esa transición no existe (mismo gate
// que el resto del sitio), así que transitionend nunca llegaría a
// disparar: se detecta aquí y se cierra directo, sin esperar. Reutilizada
// por los 15 <dialog> del sitio en vez de repetir el patrón en cada uno.
// Devuelve una promesa por si algún llamador necesita esperar a que el
// dialog termine de cerrarse antes de abrir otro — los 7 sitios que hoy
// abren #modal-demo o #modal-tema justo después de cerrar el suyo
// (modo demo en los formularios del admin, y "Ver tema" del modal de
// celebración) le hacen await; el resto no lo necesita.
function cerrarDialogoAnimado(dialogo) {
  return new Promise((resolve) => {
    if (!dialogo || !dialogo.open) {
      resolve();
      return;
    }

    const prefiereMovimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefiereMovimientoReducido) {
      dialogo.close();
      resolve();
      return;
    }

    let resuelto = false;
    const terminar = () => {
      if (resuelto) return;
      resuelto = true;
      dialogo.removeEventListener("transitionend", alTerminarTransicion);
      dialogo.classList.remove("dialog--cerrando");
      dialogo.close();
      resolve();
    };
    const alTerminarTransicion = (evento) => {
      if (evento.target !== dialogo) return;
      terminar();
    };

    dialogo.addEventListener("transitionend", alTerminarTransicion);
    // Salvavidas: si por lo que sea transitionend no llega (ej. algún
    // navegador que no dispara el evento como se espera), el dialog no
    // debe quedar atorado sin cerrar — 250ms cubre de sobra los 160ms
    // declarados en css/style.css.
    setTimeout(terminar, 250);

    dialogo.classList.add("dialog--cerrando");
  });
}

// Llena el <dialog id="modal-detalle"> de la página actual con el
// título y el texto largo del item, y lo muestra.
// "detalleCompleto" es HTML de confianza (escrito a mano en DATOS_*,
// no entrada de usuarios finales) con <p>/<ul>/<li> para tiempo,
// modalidad, materiales e instrucciones; por eso se inserta con
// innerHTML en vez de textContent.
function abrirModalDetalle(item) {
  const modal = document.getElementById("modal-detalle");
  if (!modal) return;

  // Quita la variante de ancho de abrirModalImagenInfografia() (ver
  // .modal-detalle--visor-imagen en css/style.css) por si el mismo
  // #modal-detalle se usó para una infografía justo antes — el evento
  // "close" del <dialog> es la otra vía documentada para esto, pero no
  // es confiable en todos los navegadores al cerrar por close() nativo,
  // así que se limpia aquí también, en el único punto donde de verdad
  // importa (mostrar texto después de haber mostrado una imagen).
  modal.classList.remove("modal-detalle--visor-imagen");

  const titulo = document.getElementById("modal-detalle-titulo");
  const contenido = document.getElementById("modal-detalle-contenido");
  titulo.textContent = item.titulo;
  contenido.innerHTML = item.detalleCompleto || item.detalleTemario || "";

  modal.showModal();
}

// Delegación de eventos: un único listener por contenedor de sección
// (no uno por tarjeta) que detecta clicks en cualquier
// ".boton-ver-detalle", incluso en tarjetas agregadas después de
// llamar a esta función (el contenedor se vacía y se vuelve a llenar
// en cada renderizado, pero el listener queda en el contenedor mismo).
function activarDelegacionVerDetalle(idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  contenedor.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".boton-ver-detalle");
    if (!boton) return;
    // Defensivo: aunque el botón ya es <button type="button">, esto
    // evita cualquier acción por defecto si en el futuro quedara
    // dentro de un <a> o <form>.
    evento.preventDefault();
    const item = mapaDetallesPorId.get(boton.dataset.itemId);
    if (item) abrirModalDetalle(item);
  });
}

// Cierre del modal: botón "✕" dentro del <dialog> y click en el
// ::backdrop. El <dialog> nativo ya cierra con ESC automáticamente.
// Un click en el ::backdrop llega como click sobre el propio elemento
// <dialog> (no sobre su contenido), por eso se compara evento.target
// contra el modal mismo.
function activarCierreModalDetalle() {
  const modal = document.getElementById("modal-detalle");
  if (!modal) return;

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", () => cerrarDialogoAnimado(modal));
  }

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });

  // Quita la variante de ancho de abrirModalImagenInfografia() (ver
  // .modal-detalle--visor-imagen en css/style.css) sin importar cómo se
  // cerró — botón ✕, clic en ::backdrop de arriba, o Esc (el <dialog>
  // nativo ya dispara "close" en los 3 casos) — para que la próxima vez
  // que abrirModalDetalle() lo use para texto del Temario, vuelva a su
  // ancho normal de 640px.
  modal.addEventListener("close", () => {
    modal.classList.remove("modal-detalle--visor-imagen");
  });
}

// "Modo Demo" (Fase 3, ver demoModeActivo() en sección 2): reemplaza un
// envío real (entrega de trabajos, formulario de contacto) por este
// aviso mientras el modo demo esté activo. Contenido estático — a
// diferencia de #modal-detalle, este <dialog> no se llena dinámicamente,
// ya viene con su texto fijo en el HTML de cada página.
function abrirModalDemo() {
  const modal = document.getElementById("modal-demo");
  if (!modal) return;
  modal.showModal();
}

// Mismo patrón exacto que activarCierreModalDetalle().
function activarCierreModalDemo() {
  const modal = document.getElementById("modal-demo");
  if (!modal) return;

  const botonCerrar = modal.querySelector(".modal-demo__cerrar");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", () => cerrarDialogoAnimado(modal));
  }

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });
}

// Enlace real de "Entrega de trabajos" (#entrega en trimestre-1/2/3.html,
// hacia un Google Form externo — no hay <iframe> que interceptar, es un
// <a target="_blank"> normal). Con demoModeActivo() en false no toca el
// listener en nada: el enlace navega exactamente igual que hoy.
function activarInterceptorEntregaDemo() {
  const enlace = document.querySelector("#entrega .enlace-instrucciones");
  if (!enlace) return; // no es una página de trimestre

  enlace.addEventListener("click", (evento) => {
    if (!demoModeActivo()) return;
    evento.preventDefault();
    abrirModalDemo();
  });
}

/* =========================================================
   5. RENDERIZADO DE SECCIONES
   ========================================================= */

// NOTA: cada función revisa si su contenedor existe en la página
// actual antes de hacer nada. Así, un mismo main.js sirve tanto
// para la portada (avisos y calendario) como para las páginas de
// trimestre (rúbricas, tareas, actividades, proyectos y videos)
// sin necesidad de duplicar el script.

async function renderizarHorario() {
  const contenedor = document.getElementById("contenedor-horario");
  if (!contenedor) return;

  const datos = (await obtenerHorario()).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay horario registrado para este grupo.", "🕐");
    return;
  }

  const grupos = new Map();
  datos.forEach((item) => {
    if (!grupos.has(item.grupo)) grupos.set(item.grupo, []);
    grupos.get(item.grupo).push(item);
  });

  contenedor.innerHTML = "";
  grupos.forEach((itemsDelGrupo, grupo) => {
    const bloque = document.createElement("div");
    bloque.className = "horario-grupo";

    const titulo = document.createElement("h3");
    titulo.className = "horario-grupo__titulo";
    titulo.textContent = textoGrupo(grupo);
    bloque.appendChild(titulo);

    const tabla = document.createElement("table");
    tabla.className = "tabla-horario";
    tabla.innerHTML = "<thead><tr><th>Día</th><th>Horario</th></tr></thead>";

    const tbody = document.createElement("tbody");
    itemsDelGrupo.forEach((item) => {
      const tr = document.createElement("tr");
      const tdDia = document.createElement("td");
      tdDia.textContent = item.dia;
      const tdHora = document.createElement("td");
      tdHora.textContent = item.horaInicio + " – " + item.horaFin;
      tr.append(tdDia, tdHora);
      tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);
    bloque.appendChild(tabla);
    contenedor.appendChild(bloque);
  });
}

async function renderizarAvisos() {
  const contenedor = document.getElementById("contenedor-avisos");
  if (!contenedor) return;

  const datos = (await obtenerAvisos())
    .filter(elementoCoincideConGrupo)
    .sort((a, b) => a.fecha.localeCompare(b.fecha)); // orden cronológico ascendente

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay avisos por el momento.", "📢");
    return;
  }

  contenedor.innerHTML = "";
  datos.forEach((item) => {
    const fecha = new Date(item.fecha + "T00:00:00");
    const li = document.createElement("li");
    li.className = "aviso-tarjeta";
    // El bento grid de .lista-avisos usa este data-attribute (no solo el
    // de la etiqueta interna) para que la tarjeta "importante" ocupe más
    // espacio que una "general" o "recordatorio" (ver style.css).
    li.dataset.prioridad = item.prioridad || "general";
    // Borde animado (.borde-animado-urgente, ver css/style.css) solo en
    // "urgente" — "importante"/"recordatorio"/"general" se quedan con el
    // borde plano de siempre para no diluir la jerarquía de prioridades.
    if (li.dataset.prioridad === "urgente") li.classList.add("borde-animado-urgente");

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

async function renderizarTemario() {
  const contenedor = document.getElementById("contenedor-temario");
  if (!contenedor) return;

  const datos = await obtenerTemario(TRIMESTRE_ACTUAL);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "El temario de este trimestre aún no está disponible.", "📘");
    return;
  }

  const grupos = new Map();
  datos.forEach((item) => {
    const clave = item.unidad || "Temario";
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(item);
  });

  contenedor.innerHTML = "";
  let indiceGlobal = 0;
  let indiceGrupo = 0;

  grupos.forEach((itemsDelGrupo, nombreGrupo) => {
    const bloqueGrupo = document.createElement("details");
    bloqueGrupo.className = "temario-grupo";
    if (indiceGrupo === 0) bloqueGrupo.open = true;
    indiceGrupo++;

    const resumenGrupo = document.createElement("summary");
    resumenGrupo.className = "temario-grupo__resumen";

    const tituloGrupo = document.createElement("h3");
    tituloGrupo.className = "temario-grupo__titulo";
    tituloGrupo.textContent = nombreGrupo;

    const conteoGrupo = document.createElement("p");
    conteoGrupo.className = "temario-grupo__conteo";
    conteoGrupo.textContent =
      itemsDelGrupo.length + " tema" + (itemsDelGrupo.length === 1 ? "" : "s");

    const iconoGrupo = document.createElement("span");
    iconoGrupo.className = "temario-grupo__icono";
    iconoGrupo.setAttribute("aria-hidden", "true");
    iconoGrupo.textContent = "▾";

    resumenGrupo.append(tituloGrupo, conteoGrupo, iconoGrupo);
    bloqueGrupo.appendChild(resumenGrupo);

    const cuadriculaGrupo = document.createElement("div");
    cuadriculaGrupo.className = "cuadricula-temario";

    itemsDelGrupo.forEach((item) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta-temario";

      const imagen = document.createElement("div");
      imagen.className = "tarjeta-temario__imagen tarjeta-temario__imagen--" + ((indiceGlobal % 3) + 1);
      imagen.dataset.rutaImagen = item.imagen;

      const textoImagen = document.createElement("span");
      textoImagen.textContent = "🖼️ Imagen del tema";

      if (item.imagen) {
        const img = document.createElement("img");
        img.src = item.imagen;
        img.alt = item.titulo;
        img.loading = "lazy";
        img.addEventListener("error", () => {
          img.hidden = true;
          imagen.appendChild(textoImagen);
        });
        imagen.appendChild(img);
      } else {
        imagen.appendChild(textoImagen);
      }

      const info = document.createElement("div");
      info.className = "tarjeta-temario__info";
      const titulo = document.createElement("h4");
      titulo.textContent = item.titulo;
      const descripcion = document.createElement("p");
      descripcion.textContent = item.descripcion;
      info.append(titulo, descripcion);

      // Piloto SOLO trimestre-1.html: flip 3D en vez del botón "Ver
      // detalles" + modal compartido (ver crearTarjetaTemarioGirable más
      // abajo). trimestre-2/3.html no tienen TRIMESTRE_ACTUAL === "1" y
      // siguen exactamente con el patrón de antes.
      if (TRIMESTRE_ACTUAL === "1" && item.detalleTemario) {
        tarjeta.classList.add("tarjeta-temario--girable");
        tarjeta.appendChild(crearInteriorTemarioGirable(tarjeta, item, imagen, info));
      } else {
        if (item.detalleTemario) info.appendChild(crearBotonVerDetalle(item));
        tarjeta.append(imagen, info);
      }

      cuadriculaGrupo.appendChild(tarjeta);
      indiceGlobal++;
    });

    bloqueGrupo.appendChild(cuadriculaGrupo);
    contenedor.appendChild(bloqueGrupo);
  });
}

// Interior giratorio (technique grid-stack: frente/reverso comparten la
// misma celda de grid, así el alto de la tarjeta se ajusta solo al
// contenido más largo de las dos caras — ver .tarjeta-temario__cara en
// css/style.css). El reverso pinta item.detalleTemario tal cual (mismo
// HTML de confianza que ya usaba abrirModalDetalle, ver esa función).
function crearInteriorTemarioGirable(tarjeta, item, imagen, info) {
  const interior = document.createElement("div");
  interior.className = "tarjeta-temario__flip-interior";

  const frente = document.createElement("div");
  frente.className = "tarjeta-temario__cara tarjeta-temario__cara--frente";
  frente.append(imagen, info);

  const reverso = document.createElement("div");
  reverso.className = "tarjeta-temario__cara tarjeta-temario__cara--reverso";
  const tituloReverso = document.createElement("h4");
  tituloReverso.textContent = item.titulo;
  const contenidoReverso = document.createElement("div");
  contenidoReverso.className = "tarjeta-temario__reverso-contenido";
  contenidoReverso.innerHTML = item.detalleTemario;
  reverso.append(tituloReverso, contenidoReverso);

  const botonFrente = crearBotonGirarTemario(false);
  const botonReverso = crearBotonGirarTemario(true);
  frente.appendChild(botonFrente);
  reverso.appendChild(botonReverso);

  [botonFrente, botonReverso].forEach((boton) => {
    boton.addEventListener("click", () => {
      const girada = !tarjeta.classList.contains("tarjeta-temario--girada");
      tarjeta.classList.toggle("tarjeta-temario--girada", girada);
      botonFrente.setAttribute("aria-pressed", String(girada));
      botonReverso.setAttribute("aria-pressed", String(girada));
      // Sin esto, al ocultarse vía "visibility" (ver css/style.css) el
      // botón que tenía el foco deja de ser enfocable y el navegador lo
      // manda a <body> — un alumno navegando con teclado perdería su
      // lugar y tendría que volver a tabular desde el inicio del riel
      // para llegar al botón "Volver". El botón de la cara que ahora se
      // ve ya tiene "transition-delay: 0s" en su regla de visibility
      // (ver css/style.css), así que queda enfocable de inmediato — el
      // setTimeout corto solo le da al navegador el tick que necesita
      // para terminar de aplicar ese cambio de estilo antes de .focus().
      setTimeout(() => {
        (girada ? botonReverso : botonFrente).focus();
      }, 50);
    });
  });

  interior.append(frente, reverso);
  return interior;
}

// "esReverso" solo cambia el texto visible: en el frente el texto queda
// visualmente oculto (.sr-only, el ícono 🔄 ya comunica la acción a
// simple vista); en el reverso "Volver" sí se muestra porque ahí ya no
// hay una imagen/ícono grande que lo sugiera por sí solo.
function crearBotonGirarTemario(esReverso) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "tarjeta-temario__boton-girar";
  boton.setAttribute("aria-pressed", "false");

  const icono = document.createElement("span");
  icono.setAttribute("aria-hidden", "true");
  icono.textContent = "🔄";

  const texto = document.createElement("span");
  if (esReverso) {
    texto.textContent = "Volver";
  } else {
    texto.className = "sr-only";
    texto.textContent = "Girar tarjeta para ver detalles";
  }

  boton.append(icono, texto);
  return boton;
}

// item.imagen -> item completo, para que el listener delegado
// (activarDelegacionInfografias) recupere el objeto con solo el
// data-item-id que trae el botón, igual patrón que mapaDetallesPorId.
const mapaInfografiasPorId = new Map();

async function renderizarInfografias() {
  const contenedor = document.getElementById("contenedor-infografias");
  if (!contenedor) return;

  const datos = await obtenerInfografias(TRIMESTRE_ACTUAL);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "Las infografías de este trimestre aún no están disponibles.", "🎨");
    return;
  }

  // Agrupar por secuencia conservando el orden de aparición, igual
  // técnica que renderizarRubricas().
  const grupos = new Map();
  datos.forEach((item) => {
    const clave = item.secuencia || "Infografías";
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(item);
  });

  contenedor.innerHTML = "";
  let indiceGlobal = 0;
  let indiceGrupo = 0;

  grupos.forEach((itemsDelGrupo, nombreGrupo) => {
    const bloqueGrupo = document.createElement("details");
    bloqueGrupo.className = "infografias-grupo";
    if (indiceGrupo === 0) bloqueGrupo.open = true;
    indiceGrupo++;

    const resumenGrupo = document.createElement("summary");
    resumenGrupo.className = "infografias-grupo__resumen";

    const tituloGrupo = document.createElement("h3");
    tituloGrupo.className = "infografias-grupo__titulo";
    tituloGrupo.textContent = nombreGrupo;

    const conteoGrupo = document.createElement("p");
    conteoGrupo.className = "infografias-grupo__conteo";
    conteoGrupo.textContent =
      itemsDelGrupo.length + " infografía" + (itemsDelGrupo.length === 1 ? "" : "s");

    const iconoGrupo = document.createElement("span");
    iconoGrupo.className = "infografias-grupo__icono";
    iconoGrupo.setAttribute("aria-hidden", "true");
    iconoGrupo.textContent = "▾";

    resumenGrupo.append(tituloGrupo, conteoGrupo, iconoGrupo);
    bloqueGrupo.appendChild(resumenGrupo);

    const cuadriculaGrupo = document.createElement("div");
    cuadriculaGrupo.className = "cuadricula-infografias";

    itemsDelGrupo.forEach((item) => {
      mapaInfografiasPorId.set(item.id, item);

      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta-infografia";

      const boton = document.createElement("button");
      boton.type = "button";
      boton.className =
        "tarjeta-infografia__imagen tarjeta-infografia__imagen--" + ((indiceGlobal % 3) + 1);
      boton.dataset.itemId = item.id;
      boton.setAttribute("aria-label", "Ver infografía ampliada: " + item.titulo);

      const textoPlaceholder = document.createElement("span");
      textoPlaceholder.textContent = "🎨 Infografía en preparación";

      const img = document.createElement("img");
      img.src = item.imagen;
      img.alt = item.alt || item.titulo;
      img.loading = "lazy";
      img.addEventListener("error", () => {
        img.hidden = true;
        boton.appendChild(textoPlaceholder);
        // Sin imagen real todavía no hay nada que ampliar: se
        // deshabilita el botón en vez de abrir un lightbox vacío.
        boton.disabled = true;
        boton.setAttribute("aria-disabled", "true");
      });
      boton.appendChild(img);

      const titulo = document.createElement("h4");
      titulo.className = "tarjeta-infografia__titulo";
      titulo.textContent = item.titulo;

      tarjeta.append(boton, titulo);
      cuadriculaGrupo.appendChild(tarjeta);
      indiceGlobal++;
    });

    bloqueGrupo.appendChild(cuadriculaGrupo);
    contenedor.appendChild(bloqueGrupo);
  });
}

// Reutiliza el <dialog id="modal-detalle"> compartido (mismo cierre con
// "✕", clic en ::backdrop y Esc ya wireado por activarCierreModalDetalle)
// en vez de crear un modal nuevo: solo cambia lo que se pinta adentro
// (imagen a tamaño grande + título como caption, sin el HTML largo que
// usa abrirModalDetalle).
function abrirModalImagenInfografia(item) {
  const modal = document.getElementById("modal-detalle");
  if (!modal) return;

  document.getElementById("modal-detalle-titulo").textContent = item.titulo;

  const contenido = document.getElementById("modal-detalle-contenido");
  contenido.innerHTML = "";

  const enlaceDescarga = document.createElement("a");
  enlaceDescarga.className = "enlace-descarga modal-detalle__descarga-imagen";
  enlaceDescarga.href = item.imagen;
  enlaceDescarga.download = "";
  enlaceDescarga.textContent = "⬇ Descargar infografía";
  contenido.appendChild(enlaceDescarga);

  const imgAmpliada = document.createElement("img");
  imgAmpliada.className = "modal-detalle__imagen-ampliada";
  imgAmpliada.src = item.imagen;
  imgAmpliada.alt = item.alt || item.titulo;
  contenido.appendChild(imgAmpliada);

  // Ancho más generoso que el modal de texto (ver .modal-detalle--visor-imagen
  // en css/style.css) — respeta la proporción real de la infografía en vez
  // de estirarla al ancho fijo de 640px. Se quita en el evento "close" de
  // activarCierreModalDetalle(), no aquí.
  modal.classList.add("modal-detalle--visor-imagen");
  modal.showModal();
}

// Delegación de eventos sobre #contenedor-infografias, mismo patrón que
// activarDelegacionVerDetalle (un único listener, sobrevive a que el
// contenedor se vacíe y repinte en cada renderizarInfografias()).
function activarDelegacionInfografias() {
  const contenedor = document.getElementById("contenedor-infografias");
  if (!contenedor) return;

  contenedor.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".tarjeta-infografia__imagen");
    if (!boton || boton.disabled) return;
    const item = mapaInfografiasPorId.get(boton.dataset.itemId);
    if (item) abrirModalImagenInfografia(item);
  });
}

// Spotlight glow al cursor en tarjetas de contenido (Temario, Tareas,
// Actividades, Proyectos, Infografías, Trimestre) — ver .tarjeta::before
// y variantes en css/style.css. Un solo listener delegado en document
// (mismo criterio que activarDelegacionInfografias arriba): sobrevive a
// que renderizarTareas/Actividades/Proyectos/Rubricas reconstruyan el
// DOM en cada refresh, sin tener que reenganchar nada por tarjeta. Solo
// escribe --x/--y; el resto (si el glow se ve o no) lo decide el CSS.
const SELECTOR_TARJETAS_GLOW =
  ".tarjeta, .tarjeta-trimestre, .tarjeta-temario, .tarjeta-infografia";

function activarSpotlightTarjetas() {
  const sinHoverReal = !window.matchMedia("(hover: hover)").matches;
  const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  // Sin mouse real o con reduced-motion, ni siquiera se engancha el
  // listener: la tarjeta se queda solo con el hover base (translateY +
  // borde), el CSS del glow nunca se activa (ver @media en style.css).
  if (sinHoverReal || movimientoReducido) return;

  document.addEventListener("mousemove", (evento) => {
    const tarjeta = evento.target.closest(SELECTOR_TARJETAS_GLOW);
    if (!tarjeta) return;
    const rect = tarjeta.getBoundingClientRect();
    tarjeta.style.setProperty("--x", `${evento.clientX - rect.left}px`);
    tarjeta.style.setProperty("--y", `${evento.clientY - rect.top}px`);
  });
}

async function renderizarRubricas() {
  const contenedor = document.getElementById("contenedor-rubricas");
  if (!contenedor) return;

  const datos = (await obtenerRubricas(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay rúbricas registradas para este grupo.", "📋");
    return;
  }

  // Agrupar conservando el orden de aparición en el array de datos.
  const grupos = new Map();
  datos.forEach((item) => {
    const clave = item.secuencia || "Otras rúbricas";
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(item);
  });

  contenedor.innerHTML = "";

  let indiceGrupo = 0;
  grupos.forEach((itemsDelGrupo, nombreGrupo) => {
    const bloqueGrupo = document.createElement("details");
    bloqueGrupo.className = "rubricas-grupo";
    if (indiceGrupo === 0) bloqueGrupo.open = true;
    indiceGrupo++;

    const resumenGrupo = document.createElement("summary");
    resumenGrupo.className = "rubricas-grupo__resumen";

    const tituloGrupo = document.createElement("h3");
    tituloGrupo.className = "rubricas-grupo__titulo";
    tituloGrupo.textContent = nombreGrupo;

    const conteoGrupo = document.createElement("p");
    conteoGrupo.className = "rubricas-grupo__conteo";
    conteoGrupo.textContent =
      itemsDelGrupo.length + " rúbrica" + (itemsDelGrupo.length === 1 ? "" : "s");

    const iconoGrupo = document.createElement("span");
    iconoGrupo.className = "rubricas-grupo__icono";
    iconoGrupo.setAttribute("aria-hidden", "true");
    iconoGrupo.textContent = "▾";

    resumenGrupo.append(tituloGrupo, conteoGrupo, iconoGrupo);
    bloqueGrupo.appendChild(resumenGrupo);

    // Wrapper dedicado para animar la altura del acordeón (grid-rows en
    // style.css). No es "content-envuelto-en-cuadricula": .cuadricula ya
    // es su propio grid multi-columna, así que necesita este panel aparte
    // para no pisar su grid-template-rows con el de la animación.
    // panel-interior (sin margin/padding/border propios) es el ítem de
    // grid real: .cuadricula trae margin-top propio que, si fuera el
    // ítem directo, no lo deja colapsar a 0 aunque tenga min-height:0
    // (el margin de un ítem de grid siempre cuenta para el tamaño de la
    // pista). Con la interior "limpia" en medio, overflow:hidden sí
    // recorta ese margin completo al cerrar.
    const panelGrupo = document.createElement("div");
    panelGrupo.className = "rubricas-grupo__panel";
    const panelGrupoInterior = document.createElement("div");
    panelGrupoInterior.className = "rubricas-grupo__panel-interior";
    panelGrupo.appendChild(panelGrupoInterior);

    const cuadriculaGrupo = document.createElement("div");
    cuadriculaGrupo.className = "cuadricula";

    itemsDelGrupo.forEach((item) => {
      const tarjeta = document.createElement("details");
      tarjeta.className = "tarjeta tarjeta-rubrica";

      const resumen = document.createElement("summary");
      resumen.className = "tarjeta-rubrica__resumen";

      const cabecera = document.createElement("div");
      cabecera.className = "tarjeta__cabecera";
      const titulo = document.createElement("h4");
      titulo.textContent = item.titulo;
      cabecera.appendChild(titulo);
      cabecera.appendChild(crearBadgeGrupo(item.grupo));

      // Preview del nivel "Excelente" en la parte visible de la tarjeta
      // (antes de expandir): mismo acento verde + insignia 🏅 que ya usa
      // .nivel-item[data-nivel="excelente"] en la lista completa de abajo,
      // para que el preview no contradiga visualmente el detalle expandido.
      // No toca panelNiveles/niveles más abajo, que se queda igual.
      const nivelExcelente = (item.niveles || []).find((n) => n.nivel === "Excelente");
      let previewExcelente = null;
      if (nivelExcelente) {
        previewExcelente = document.createElement("p");
        previewExcelente.className = "tarjeta-rubrica__preview-excelente";
        const iconoPreview = document.createElement("span");
        iconoPreview.className = "tarjeta-rubrica__preview-excelente-icono";
        iconoPreview.setAttribute("aria-hidden", "true");
        iconoPreview.textContent = "🏅";
        const etiquetaPreview = document.createElement("strong");
        etiquetaPreview.textContent = "Excelente: ";
        previewExcelente.append(iconoPreview, etiquetaPreview, nivelExcelente.descripcion);
      }

      const descripcion = document.createElement("p");
      descripcion.textContent = item.descripcion;

      const meta = document.createElement("div");
      meta.className = "tarjeta__meta";
      const ponderacion = document.createElement("span");
      ponderacion.className = "badge-estado";
      ponderacion.textContent = "Vale " + item.ponderacion;
      meta.appendChild(ponderacion);

      const icono = document.createElement("span");
      icono.className = "tarjeta-rubrica__icono";
      icono.setAttribute("aria-hidden", "true");
      icono.textContent = "▾";

      resumen.appendChild(cabecera);
      if (previewExcelente) resumen.appendChild(previewExcelente);
      resumen.append(descripcion, meta, icono);

      const niveles = document.createElement("div");
      niveles.className = "tarjeta-rubrica__niveles";
      (item.niveles || []).forEach((nivelInfo) => {
        // Tercer nivel de acordeón anidado (rubricas-grupo > tarjeta-rubrica
        // > nivel-item), mismo wrapper panel/panel-interior de los otros
        // dos — ver reset de acordeones hijos en el listener "toggle" de
        // tarjeta más abajo.
        const detalleNivel = document.createElement("details");
        detalleNivel.className = "nivel-item";
        detalleNivel.dataset.nivel = nivelInfo.nivel.toLowerCase();

        const cabeceraNivel = document.createElement("summary");
        cabeceraNivel.className = "nivel-item__cabecera";

        const infoNivel = document.createElement("div");
        infoNivel.className = "nivel-item__info";
        const nombreNivel = document.createElement("span");
        nombreNivel.className = "nivel-item__nombre";
        nombreNivel.textContent = nivelInfo.nivel;
        const puntosNivel = document.createElement("span");
        puntosNivel.className = "nivel-item__puntos";
        puntosNivel.textContent = nivelInfo.puntos + " pts";
        infoNivel.append(nombreNivel, puntosNivel);

        const iconoNivel = document.createElement("span");
        iconoNivel.className = "nivel-item__icono";
        iconoNivel.setAttribute("aria-hidden", "true");
        iconoNivel.textContent = "▾";

        cabeceraNivel.append(infoNivel, iconoNivel);

        const descripcionNivel = document.createElement("p");
        descripcionNivel.className = "nivel-item__descripcion";
        descripcionNivel.textContent = nivelInfo.descripcion;

        const panelNivel = document.createElement("div");
        panelNivel.className = "nivel-item__panel";
        const panelNivelInterior = document.createElement("div");
        panelNivelInterior.className = "nivel-item__panel-interior";
        panelNivelInterior.appendChild(descripcionNivel);
        panelNivel.appendChild(panelNivelInterior);

        detalleNivel.append(cabeceraNivel, panelNivel);
        niveles.appendChild(detalleNivel);
      });

      // Los 4 niveles arrancan colapsados cada vez que se abre la
      // tarjeta-rubrica que los contiene — <details> no lo hace solo
      // (su atributo open no se toca al colapsar el padre, que solo lo
      // oculta con CSS), así que se resetean explícitamente al cerrar.
      tarjeta.addEventListener("toggle", () => {
        if (tarjeta.open) return;
        niveles.querySelectorAll(".nivel-item[open]").forEach((detalle) => {
          detalle.open = false;
        });
      });

      // Mismo wrapper de animación (panel + panel-interior "limpia") que
      // panelGrupo arriba, aquí para la lista de niveles de cada rúbrica
      // individual. .tarjeta-rubrica__niveles trae su propio
      // margin/padding/border-top (separador visual) que necesita la
      // interior limpia en medio para poder recortarse a 0 al cerrar.
      const panelNiveles = document.createElement("div");
      panelNiveles.className = "tarjeta-rubrica__panel";
      const panelNivelesInterior = document.createElement("div");
      panelNivelesInterior.className = "tarjeta-rubrica__panel-interior";
      panelNivelesInterior.appendChild(niveles);
      panelNiveles.appendChild(panelNivelesInterior);

      tarjeta.append(resumen, panelNiveles);
      cuadriculaGrupo.appendChild(tarjeta);
    });

    panelGrupoInterior.appendChild(cuadriculaGrupo);
    bloqueGrupo.appendChild(panelGrupo);
    contenedor.appendChild(bloqueGrupo);
  });
}

// Estado de progreso personal (Entregado/Pendiente/Vencido/sin sesión) de
// una tarea, actividad o proyecto — extraído de crearChecklistProgreso()
// para que #proximas-fechas-trimestre pueda pintar su propio badge
// compacto (solo emoji + tooltip) sin duplicar esta lógica. Devuelve null
// cuando no hay sesión activa (mismo caso que el aviso "Inicia sesión..."
// de abajo); si no, { estado, texto } con el mismo texto exacto que ya
// mostraba el badge completo.
function calcularEstadoProgresoItem(tipo, item) {
  const perfil = obtenerPerfilActivo();
  if (!perfil) return null;

  if (itemEstaCompletado(tipo, item.id)) {
    return { estado: "completada", texto: "🟢 Entregado" };
  }
  if (itemEstaVencido(tipo, item, perfil.grupo)) {
    return { estado: "atrasada", texto: "🔒 Vencido sin entregar" };
  }
  return { estado: "pendiente", texto: "🟡 Pendiente" };
}

// Indicador de solo lectura del progreso personal de una tarjeta de tarea,
// actividad o proyecto: el progreso ya no lo marca el alumno con un
// checkbox, se calcula automático a partir de progresoCache (tabla
// "progreso" de Supabase, ver sección 11). Común a renderizarTareas,
// renderizarActividades y renderizarProyectos.
function crearChecklistProgreso(tipo, item, tarjeta) {
  const indicador = document.createElement("div");
  indicador.className = "indicador-progreso";

  const resultado = calcularEstadoProgresoItem(tipo, item);
  if (!resultado) {
    const aviso = document.createElement("span");
    aviso.className = "indicador-progreso__aviso-sesion";
    aviso.textContent = "🔑 Inicia sesión para ver tu progreso";
    indicador.appendChild(aviso);
    return indicador;
  }

  tarjeta.classList.toggle("tarjeta--completada", resultado.estado === "completada");

  const badge = document.createElement("span");
  badge.className = "badge-estado";
  badge.dataset.estado = resultado.estado;
  badge.textContent = resultado.texto;
  indicador.appendChild(badge);

  return indicador;
}

/* ---------------------------------------------------------
   Vista "Acordeón / Pestañas" de Tareas/Actividades/Proyectos — piloto
   SOLO en trimestre-1.html (TRIMESTRE_ACTUAL === "1"), no toca
   Temario/Rúbricas ni trimestre-2/3.html. Nunca recalcula
   completadas/total/porcentaje: solo reordena/oculta el DOM que
   renderizarTareas()/Actividades()/Proyectos() ya construyeron (los
   <details class="X-grupo"> con su .X-grupo__titulo/.X-grupo__conteo/
   .barra-progreso ya calculados) — ver aplicarModoVistaSecuencia(), que
   cada una de esas 3 funciones llama al final de su propio render.
   --------------------------------------------------------- */

// Arma el control segmentado de 2 botones (aria-pressed, no es un
// role="tablist": no controla paneles propios, es una preferencia de
// presentación — distinto del tablist real de TASK 2 que sí cambia qué
// grupo se ve). "idControl" identifica cuál de las 3 instancias es (una
// por sección), pero las 3 reflejan y cambian la MISMA preferencia.
function crearControlVistaSecuencias(idControl) {
  const control = document.createElement("div");
  control.className = "control-vista-secuencias";
  control.id = idControl;

  [
    { vista: "acordeon", texto: "🪗 Acordeón" },
    { vista: "pestanas", texto: "📑 Pestañas" },
  ].forEach(({ vista, texto }) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "control-vista-secuencias__boton";
    boton.dataset.vista = vista;
    boton.textContent = texto;
    boton.addEventListener("click", () => {
      if (vistaSecuenciasActual === vista) return;
      vistaSecuenciasActual = vista;
      localStorage.setItem(CLAVE_VISTA_SECUENCIAS, vista);
      actualizarControlesVistaSecuencias();
      ["contenedor-tareas", "contenedor-actividades", "contenedor-proyectos"].forEach(
        aplicarModoVistaSecuencia
      );
    });
    control.appendChild(boton);
  });

  return control;
}

// Sincroniza aria-pressed/estado visual de LAS 3 instancias del control
// (aunque el alumno no haya scrolleado hasta las otras 2 todavía) con
// vistaSecuenciasActual — se llama al crear cada control y cada vez que
// cambia la preferencia desde cualquiera de los 3.
function actualizarControlesVistaSecuencias() {
  document.querySelectorAll(".control-vista-secuencias__boton").forEach((boton) => {
    const activo = boton.dataset.vista === vistaSecuenciasActual;
    boton.setAttribute("aria-pressed", String(activo));
    boton.classList.toggle("control-vista-secuencias__boton--activo", activo);
  });
}

// Muestra el grupo "indiceSeleccionado" y oculta el resto (clase
// "grupo--oculto-por-tab"); actualiza aria-selected + tabIndex (roving
// tabindex: solo la pestaña activa es alcanzable con Tab, el resto se
// alcanza con flecha izq/der, ver el listener "keydown" más abajo).
function seleccionarGrupoEnModoPestanas(contenedor, tablist, indiceSeleccionado) {
  Array.from(contenedor.children)
    .filter((hijo) => hijo.tagName === "DETAILS")
    .forEach((grupo, indice) => {
      grupo.classList.toggle("grupo--oculto-por-tab", indice !== indiceSeleccionado);
    });

  Array.from(tablist.children).forEach((tab, indice) => {
    const seleccionado = indice === indiceSeleccionado;
    tab.setAttribute("aria-selected", String(seleccionado));
    tab.classList.toggle("tablist-secuencias__tab--activo", seleccionado);
    tab.tabIndex = seleccionado ? 0 : -1;
  });
}

// Aplica vistaSecuenciasActual al contenido YA renderizado de
// "idContenedor" (los <details class="X-grupo"> hijos directos). Se
// llama al final de renderizarTareas()/Actividades()/Proyectos(), cada
// vez que alguna vuelve a renderizar (cambio de grupo, etc.) y cada vez
// que cambia la preferencia — siempre parte de limpiar cualquier
// tablist anterior antes de reconstruir, así que es seguro llamarla
// varias veces seguidas.
function aplicarModoVistaSecuencia(idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  const grupos = Array.from(contenedor.children).filter((hijo) => hijo.tagName === "DETAILS");
  if (grupos.length === 0) return;

  const tablistPrevio = contenedor.querySelector(':scope > [role="tablist"]');
  if (tablistPrevio) tablistPrevio.remove();

  if (vistaSecuenciasActual === "acordeon") {
    grupos.forEach((grupo, indice) => {
      grupo.classList.remove("grupo--oculto-por-tab");
      const resumen = grupo.querySelector(":scope > summary");
      if (resumen) resumen.hidden = false;
      // Mismo comportamiento que ya existe hoy: primer grupo abierto,
      // resto cerrado — no se recuerda cuál estaba abierto antes de
      // pasar a "pestañas".
      grupo.open = indice === 0;
    });
    return;
  }

  // Modo "pestañas": todos los <details> de grupo quedan open=true (su
  // contenido debe existir en el DOM para ser accesible/imprimible),
  // su <summary> propio se oculta (la pestaña reemplaza esa función), y
  // solo el grupo seleccionado queda visible.
  const tablist = document.createElement("div");
  tablist.className = "tablist-secuencias";
  tablist.setAttribute("role", "tablist");

  grupos.forEach((grupo, indice) => {
    grupo.open = true;
    // id estable para aria-controls; los <details class="X-grupo"> no
    // traen id propio de renderizarTareas/Actividades/Proyectos (esa
    // parte no se tocó), así que se asigna aquí si hace falta.
    if (!grupo.id) grupo.id = idContenedor + "-grupo-" + indice;

    const resumen = grupo.querySelector(":scope > summary");
    if (resumen) resumen.hidden = true;

    const titulo = grupo.querySelector('[class$="__titulo"]');
    const conteo = grupo.querySelector('[data-rol="conteo-grupo"]');

    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "tablist-secuencias__tab";
    tab.setAttribute("role", "tab");
    tab.id = idContenedor + "-tab-" + indice;
    tab.setAttribute("aria-controls", grupo.id);
    tab.dataset.indice = String(indice);

    const tituloTab = document.createElement("span");
    tituloTab.className = "tablist-secuencias__tab-titulo";
    tituloTab.textContent = titulo ? titulo.textContent : "";

    const conteoTab = document.createElement("span");
    conteoTab.className = "tablist-secuencias__tab-conteo";
    conteoTab.textContent = conteo ? conteo.textContent : "";

    tab.append(tituloTab, conteoTab);
    tab.addEventListener("click", () => {
      seleccionarGrupoEnModoPestanas(contenedor, tablist, Number(tab.dataset.indice));
    });

    tablist.appendChild(tab);
  });

  // Navegación por flechas izq/der entre pestañas (patrón ARIA APG para
  // role="tablist" — "Tab" simple no bastaría, por el roving tabindex
  // de arriba: solo la pestaña activa es alcanzable con Tab, así que
  // sin flechas el resto sería inalcanzable por teclado).
  tablist.addEventListener("keydown", (evento) => {
    if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
    const tabs = Array.from(tablist.children);
    const indiceActual = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    if (indiceActual === -1) return;
    const delta = evento.key === "ArrowRight" ? 1 : -1;
    const siguiente = (indiceActual + delta + tabs.length) % tabs.length;
    evento.preventDefault();
    seleccionarGrupoEnModoPestanas(contenedor, tablist, siguiente);
    tabs[siguiente].focus();
  });

  contenedor.insertBefore(tablist, grupos[0]);
  seleccionarGrupoEnModoPestanas(contenedor, tablist, 0);
}

// Deep-link desde progreso.html (anclas "#tarea-{id}"/"#actividad-{id}"/
// "#proyecto-{id}", mismos ids que ya usan las tarjetas). En modo
// "pestañas" el navegador solo sabe revelar un <details> CERRADO
// ancestro de la URL; no sabe quitar la clase "grupo--oculto-por-tab"
// (CSS arbitrario, no semántica nativa de <details>), así que sin esto
// el elemento existe pero queda invisible. En modo "acordeón" no hace
// falta nada — ese comportamiento nativo ya funciona solo, no se toca.
function activarPestanaDesdeHash() {
  if (vistaSecuenciasActual !== "pestanas") return;

  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;

  const objetivo = document.getElementById(hash.slice(1));
  if (!objetivo) return;

  const grupo = objetivo.closest(".tareas-grupo, .actividades-grupo, .proyectos-grupo");
  if (!grupo) return;

  const contenedor = grupo.parentElement;
  const tablist = contenedor?.querySelector(':scope > [role="tablist"]');
  if (!tablist) return;

  const grupos = Array.from(contenedor.children).filter((hijo) => hijo.tagName === "DETAILS");
  const indice = grupos.indexOf(grupo);
  if (indice === -1) return;

  seleccionarGrupoEnModoPestanas(contenedor, tablist, indice);

  // El intento nativo del navegador de hacer scroll a este elemento ya
  // pasó (y probablemente falló: el elemento no existía todavía, o
  // existía pero seguía oculto por la clase de arriba); ahora que ya es
  // visible, se repite el scroll a mano.
  objetivo.scrollIntoView({ block: "start" });
}

async function renderizarTareas() {
  const contenedor = document.getElementById("contenedor-tareas");
  if (!contenedor) return;

  // Piloto de vista Acordeón/Pestañas: SOLO trimestre-1.html. El control
  // se inserta una sola vez (persiste entre re-renders, ej. cambio de
  // grupo) porque vive FUERA de "contenedor" — el innerHTML de abajo no
  // lo toca.
  if (TRIMESTRE_ACTUAL === "1" && !document.getElementById("control-vista-tareas")) {
    contenedor.insertAdjacentElement("beforebegin", crearControlVistaSecuencias("control-vista-tareas"));
    actualizarControlesVistaSecuencias();
  }

  const datos = (await obtenerTareas(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay tareas registradas para este grupo.", "📝");
    actualizarResumenProgreso("resumen-progreso-tareas", datos, "tarea", "tareas");
    return;
  }

  // Agrupar conservando el orden de aparición en el array de datos. Los
  // trimestres sin campo "secuencia" (2 y 3, por ahora) caen todos en un
  // único grupo "Otras tareas", igual que hoy se ven en una sola lista.
  const grupos = new Map();
  datos.forEach((item) => {
    const clave = item.secuencia || "Otras tareas";
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(item);
  });

  contenedor.innerHTML = "";
  let indiceGrupo = 0;

  grupos.forEach((itemsDelGrupo, nombreGrupo) => {
    const bloqueGrupo = document.createElement("details");
    bloqueGrupo.className = "tareas-grupo";
    if (indiceGrupo === 0) bloqueGrupo.open = true;
    indiceGrupo++;

    const resumenGrupo = document.createElement("summary");
    resumenGrupo.className = "tareas-grupo__resumen";

    const tituloGrupo = document.createElement("h3");
    tituloGrupo.className = "tareas-grupo__titulo";
    tituloGrupo.textContent = nombreGrupo;

    const totalGrupo = itemsDelGrupo.length;
    const completadasGrupo = itemsDelGrupo.filter((item) =>
      itemEstaCompletado("tarea", item.id)
    ).length;
    const porcentajeGrupo = totalGrupo === 0 ? 0 : Math.round((completadasGrupo / totalGrupo) * 100);

    const conteoGrupo = document.createElement("p");
    conteoGrupo.className = "tareas-grupo__conteo";
    conteoGrupo.dataset.rol = "conteo-grupo";
    conteoGrupo.textContent = completadasGrupo + " de " + totalGrupo + " completadas";

    const barraGrupo = document.createElement("div");
    barraGrupo.className = "barra-progreso";
    barraGrupo.setAttribute("role", "progressbar");
    barraGrupo.setAttribute("aria-valuenow", String(completadasGrupo));
    barraGrupo.setAttribute("aria-valuemin", "0");
    barraGrupo.setAttribute("aria-valuemax", String(totalGrupo));
    barraGrupo.setAttribute("aria-label", "Progreso de tareas de " + nombreGrupo);
    const rellenoGrupo = document.createElement("div");
    rellenoGrupo.className = "barra-progreso__relleno";
    rellenoGrupo.style.width = porcentajeGrupo + "%";
    barraGrupo.appendChild(rellenoGrupo);

    const iconoGrupo = document.createElement("span");
    iconoGrupo.className = "tareas-grupo__icono";
    iconoGrupo.setAttribute("aria-hidden", "true");
    iconoGrupo.textContent = "▾";

    resumenGrupo.append(tituloGrupo, conteoGrupo, barraGrupo, iconoGrupo);
    bloqueGrupo.appendChild(resumenGrupo);

    const cuadriculaGrupo = document.createElement("div");
    cuadriculaGrupo.className = "cuadricula";

    itemsDelGrupo.forEach((item) => {
      const tarjeta = document.createElement("details");
      tarjeta.className = "tarjeta tarjeta-tarea";
      tarjeta.id = "tarea-" + item.id;
      // Pendientes abiertas por defecto (llaman la atención); completadas
      // cerradas, para que no estorben en la vista de lo que falta hacer.
      tarjeta.open = !itemEstaCompletado("tarea", item.id);

      const resumenTarjeta = document.createElement("summary");
      resumenTarjeta.className = "tarjeta-tarea__resumen";

      const cabecera = document.createElement("div");
      cabecera.className = "tarjeta__cabecera";
      const titulo = document.createElement("h3");
      titulo.textContent = item.titulo;
      cabecera.appendChild(titulo);
      cabecera.appendChild(crearBadgeGrupo(item.grupo));
      cabecera.appendChild(crearBadgeFormato(item.formatoEntrega));

      const fecha = document.createElement("p");
      fecha.className = "tarjeta__fecha";
      fecha.textContent = "Entrega: " + resolverFechaItem(item.fechaEntrega);

      const iconoTarjeta = document.createElement("span");
      iconoTarjeta.className = "tarjeta-tarea__icono";
      iconoTarjeta.setAttribute("aria-hidden", "true");
      iconoTarjeta.textContent = "▾";

      resumenTarjeta.append(cabecera, fecha, iconoTarjeta);
      tarjeta.appendChild(resumenTarjeta);

      const descripcion = document.createElement("p");
      descripcion.textContent = item.descripcion;
      tarjeta.appendChild(descripcion);

      // "instruccionesUrl" es la acción principal (botón destacado);
      // "materialApoyoUrl" es opcional y se ve como botón secundario.
      if (item.instruccionesUrl) {
        tarjeta.appendChild(crearEnlaceInstrucciones(item.instruccionesUrl));
      }
      if (item.materialApoyoUrl) {
        tarjeta.appendChild(crearEnlaceDescarga(item.materialApoyoUrl, "📎 Material de apoyo"));
      }
      if (item.detalleCompleto) {
        tarjeta.appendChild(crearBotonVerDetalle(item));
      }

      // Indicador de progreso personal (ver progresoCache): aparte por
      // completo del filtro de grupo.
      tarjeta.appendChild(crearChecklistProgreso("tarea", item, tarjeta));

      cuadriculaGrupo.appendChild(tarjeta);
    });

    bloqueGrupo.appendChild(cuadriculaGrupo);
    contenedor.appendChild(bloqueGrupo);
  });

  actualizarResumenProgreso("resumen-progreso-tareas", datos, "tarea", "tareas");
  if (TRIMESTRE_ACTUAL === "1") aplicarModoVistaSecuencia("contenedor-tareas");
}

async function renderizarActividades() {
  const contenedor = document.getElementById("contenedor-actividades");
  if (!contenedor) return;

  // Piloto de vista Acordeón/Pestañas: SOLO trimestre-1.html (ver la
  // misma nota en renderizarTareas()).
  if (TRIMESTRE_ACTUAL === "1" && !document.getElementById("control-vista-actividades")) {
    contenedor.insertAdjacentElement(
      "beforebegin",
      crearControlVistaSecuencias("control-vista-actividades")
    );
    actualizarControlesVistaSecuencias();
  }

  const datos = (await obtenerActividades(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay actividades registradas para este grupo.", "🎯");
    actualizarResumenProgreso("resumen-progreso-actividades", datos, "actividad", "actividades");
    return;
  }

  // Agrupar conservando el orden de aparición en el array de datos. Los
  // trimestres sin campo "secuencia" (2 y 3, por ahora) caen todos en un
  // único grupo "Otras actividades", igual que hoy se ven en una sola lista.
  const grupos = new Map();
  datos.forEach((item) => {
    const clave = item.secuencia || "Otras actividades";
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(item);
  });

  contenedor.innerHTML = "";
  let indiceGrupo = 0;

  grupos.forEach((itemsDelGrupo, nombreGrupo) => {
    const bloqueGrupo = document.createElement("details");
    bloqueGrupo.className = "actividades-grupo";
    if (indiceGrupo === 0) bloqueGrupo.open = true;
    indiceGrupo++;

    const resumenGrupo = document.createElement("summary");
    resumenGrupo.className = "actividades-grupo__resumen";

    const tituloGrupo = document.createElement("h3");
    tituloGrupo.className = "actividades-grupo__titulo";
    tituloGrupo.textContent = nombreGrupo;

    const totalGrupo = itemsDelGrupo.length;
    const completadasGrupo = itemsDelGrupo.filter((item) =>
      itemEstaCompletado("actividad", item.id)
    ).length;
    const porcentajeGrupo = totalGrupo === 0 ? 0 : Math.round((completadasGrupo / totalGrupo) * 100);

    const conteoGrupo = document.createElement("p");
    conteoGrupo.className = "actividades-grupo__conteo";
    conteoGrupo.dataset.rol = "conteo-grupo";
    conteoGrupo.textContent = completadasGrupo + " de " + totalGrupo + " completadas";

    const barraGrupo = document.createElement("div");
    barraGrupo.className = "barra-progreso";
    barraGrupo.setAttribute("role", "progressbar");
    barraGrupo.setAttribute("aria-valuenow", String(completadasGrupo));
    barraGrupo.setAttribute("aria-valuemin", "0");
    barraGrupo.setAttribute("aria-valuemax", String(totalGrupo));
    barraGrupo.setAttribute("aria-label", "Progreso de actividades de " + nombreGrupo);
    const rellenoGrupo = document.createElement("div");
    rellenoGrupo.className = "barra-progreso__relleno";
    rellenoGrupo.style.width = porcentajeGrupo + "%";
    barraGrupo.appendChild(rellenoGrupo);

    const iconoGrupo = document.createElement("span");
    iconoGrupo.className = "actividades-grupo__icono";
    iconoGrupo.setAttribute("aria-hidden", "true");
    iconoGrupo.textContent = "▾";

    resumenGrupo.append(tituloGrupo, conteoGrupo, barraGrupo, iconoGrupo);
    bloqueGrupo.appendChild(resumenGrupo);

    const cuadriculaGrupo = document.createElement("div");
    cuadriculaGrupo.className = "cuadricula";

    itemsDelGrupo.forEach((item) => {
      const tarjeta = document.createElement("details");
      tarjeta.className = "tarjeta tarjeta-actividad";
      tarjeta.id = "actividad-" + item.id;
      // Pendientes abiertas por defecto; completadas cerradas (mismo
      // criterio que Tareas).
      tarjeta.open = !itemEstaCompletado("actividad", item.id);

      const resumenTarjeta = document.createElement("summary");
      resumenTarjeta.className = "tarjeta-actividad__resumen";

      const cabecera = document.createElement("div");
      cabecera.className = "tarjeta__cabecera";
      const titulo = document.createElement("h3");
      titulo.textContent = item.titulo;
      cabecera.appendChild(titulo);
      cabecera.appendChild(crearBadgeGrupo(item.grupo));
      cabecera.appendChild(crearBadgeFormato(item.formatoEntrega));

      const fecha = document.createElement("p");
      fecha.className = "tarjeta__fecha";
      fecha.textContent = "Fecha: " + resolverFechaItem(item.fecha);

      const iconoTarjeta = document.createElement("span");
      iconoTarjeta.className = "tarjeta-actividad__icono";
      iconoTarjeta.setAttribute("aria-hidden", "true");
      iconoTarjeta.textContent = "▾";

      resumenTarjeta.append(cabecera, fecha, iconoTarjeta);
      tarjeta.appendChild(resumenTarjeta);

      const descripcion = document.createElement("p");
      descripcion.textContent = item.descripcion;
      tarjeta.appendChild(descripcion);

      if (item.archivoUrl) {
        tarjeta.appendChild(crearEnlaceDescarga(item.archivoUrl));
      }
      if (item.detalleCompleto) {
        tarjeta.appendChild(crearBotonVerDetalle(item));
      }

      // Indicador de progreso personal, mismo patrón que en Tareas (ver
      // progresoCache).
      tarjeta.appendChild(crearChecklistProgreso("actividad", item, tarjeta));

      cuadriculaGrupo.appendChild(tarjeta);
    });

    bloqueGrupo.appendChild(cuadriculaGrupo);
    contenedor.appendChild(bloqueGrupo);
  });

  actualizarResumenProgreso("resumen-progreso-actividades", datos, "actividad", "actividades");
  if (TRIMESTRE_ACTUAL === "1") aplicarModoVistaSecuencia("contenedor-actividades");
}

async function renderizarProyectos() {
  const contenedor = document.getElementById("contenedor-proyectos");
  if (!contenedor) return;

  // Piloto de vista Acordeón/Pestañas: SOLO trimestre-1.html (ver la
  // misma nota en renderizarTareas()).
  if (TRIMESTRE_ACTUAL === "1" && !document.getElementById("control-vista-proyectos")) {
    contenedor.insertAdjacentElement(
      "beforebegin",
      crearControlVistaSecuencias("control-vista-proyectos")
    );
    actualizarControlesVistaSecuencias();
  }

  const datos = (await obtenerProyectos(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay proyectos registrados para este grupo.", "🚀");
    actualizarResumenProgreso("resumen-progreso-proyectos", datos, "proyecto", "proyectos");
    return;
  }

  // Agrupar conservando el orden de aparición en el array de datos. Los
  // trimestres sin campo "secuencia" (2 y 3, por ahora) caen todos en un
  // único grupo "Otros proyectos". Un grupo puede tener más de un proyecto
  // (Bloques 2 y 3 podrían agregar varios por secuencia), por eso se agrupa
  // igual que Tareas/Actividades en vez de asumir 1:1.
  const grupos = new Map();
  datos.forEach((item) => {
    const clave = item.secuencia || "Otros proyectos";
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(item);
  });

  contenedor.innerHTML = "";
  let indiceGrupo = 0;

  grupos.forEach((itemsDelGrupo, nombreGrupo) => {
    const bloqueGrupo = document.createElement("details");
    bloqueGrupo.className = "proyectos-grupo";
    if (indiceGrupo === 0) bloqueGrupo.open = true;
    indiceGrupo++;

    const resumenGrupo = document.createElement("summary");
    resumenGrupo.className = "proyectos-grupo__resumen";

    const tituloGrupo = document.createElement("h3");
    tituloGrupo.className = "proyectos-grupo__titulo";
    tituloGrupo.textContent = nombreGrupo;

    // El avance del grupo es el promedio del avance estático de sus
    // proyectos (item.avance), no un conteo de completados: es una medida
    // del proyecto en general, no del progreso personal del alumno.
    const sumaAvance = itemsDelGrupo.reduce((total, item) => total + item.avance, 0);
    const promedioAvance = Math.round(sumaAvance / itemsDelGrupo.length);

    const conteoGrupo = document.createElement("p");
    conteoGrupo.className = "proyectos-grupo__conteo";
    conteoGrupo.dataset.rol = "conteo-grupo";
    conteoGrupo.textContent = "Avance: " + promedioAvance + "%";

    const barraGrupo = document.createElement("div");
    barraGrupo.className = "barra-progreso";
    barraGrupo.setAttribute("role", "progressbar");
    barraGrupo.setAttribute("aria-valuenow", String(promedioAvance));
    barraGrupo.setAttribute("aria-valuemin", "0");
    barraGrupo.setAttribute("aria-valuemax", "100");
    barraGrupo.setAttribute("aria-label", "Avance de proyectos de " + nombreGrupo);
    const rellenoGrupo = document.createElement("div");
    rellenoGrupo.className = "barra-progreso__relleno";
    rellenoGrupo.style.width = promedioAvance + "%";
    barraGrupo.appendChild(rellenoGrupo);

    const iconoGrupo = document.createElement("span");
    iconoGrupo.className = "proyectos-grupo__icono";
    iconoGrupo.setAttribute("aria-hidden", "true");
    iconoGrupo.textContent = "▾";

    resumenGrupo.append(tituloGrupo, conteoGrupo, barraGrupo, iconoGrupo);
    bloqueGrupo.appendChild(resumenGrupo);

    const cuadriculaGrupo = document.createElement("div");
    cuadriculaGrupo.className = "cuadricula";

    itemsDelGrupo.forEach((item) => {
      const tarjeta = document.createElement("details");
      tarjeta.className = "tarjeta tarjeta-proyecto";
      tarjeta.id = "proyecto-" + item.id;
      // En curso (avance < 100) abierta; ya terminado al 100% cerrado. A
      // diferencia de Tareas/Actividades, este estado no depende de un
      // checkbox: se fija una sola vez con el "avance" estático al renderizar.
      tarjeta.open = item.avance < 100;

      const resumenTarjeta = document.createElement("summary");
      resumenTarjeta.className = "tarjeta-proyecto__resumen";

      // "avanceMostrado" refleja el progreso personal del alumno además
      // del avance estático del proyecto: si progresoCache ya tiene una
      // fila para este proyecto, se muestra 100% aunque el dato de
      // DATOS_PROYECTOS diga otra cosa.
      const avanceMostrado = itemEstaCompletado("proyecto", item.id) ? 100 : item.avance;

      const cabecera = document.createElement("div");
      cabecera.className = "tarjeta__cabecera";
      const titulo = document.createElement("h3");
      titulo.textContent = item.titulo;
      cabecera.appendChild(titulo);
      // Insignia de proyecto completado: solo decorativa, no cambia cómo se
      // calcula ni se guarda "avance" (sigue siendo el campo estático de
      // DATOS_PROYECTOS). Se crea siempre y se oculta con "hidden" (en vez
      // de no agregarla al DOM) para poder mostrarla/ocultarla en vivo
      // desde crearChecklistProgreso sin re-renderizar la tarjeta.
      const insignia = document.createElement("span");
      insignia.className = "insignia-proyecto";
      insignia.title = "Proyecto completado";
      insignia.setAttribute("aria-label", "Proyecto completado");
      insignia.textContent = "🏆";
      insignia.hidden = avanceMostrado < 100;
      cabecera.appendChild(insignia);
      cabecera.appendChild(crearBadgeGrupo(item.grupo));
      cabecera.appendChild(crearBadgeFormato(item.formatoEntrega));

      const fecha = document.createElement("p");
      fecha.className = "tarjeta__fecha";
      fecha.textContent = "Entrega final: " + resolverFechaItem(item.fechaEntrega);

      const iconoTarjeta = document.createElement("span");
      iconoTarjeta.className = "tarjeta-proyecto__icono";
      iconoTarjeta.setAttribute("aria-hidden", "true");
      iconoTarjeta.textContent = "▾";

      resumenTarjeta.append(cabecera, fecha, iconoTarjeta);
      tarjeta.appendChild(resumenTarjeta);

      const descripcion = document.createElement("p");
      descripcion.textContent = item.descripcion;

      const barra = document.createElement("div");
      barra.className = "barra-progreso";
      barra.setAttribute("role", "progressbar");
      barra.setAttribute("aria-valuenow", String(avanceMostrado));
      barra.setAttribute("aria-valuemin", "0");
      barra.setAttribute("aria-valuemax", "100");
      barra.setAttribute("aria-label", "Avance del proyecto: " + avanceMostrado + "%");
      const relleno = document.createElement("div");
      relleno.className = "barra-progreso__relleno";
      relleno.style.width = avanceMostrado + "%";
      barra.appendChild(relleno);

      const textoAvance = document.createElement("p");
      textoAvance.className = "tarjeta__fecha";
      textoAvance.dataset.rol = "texto-avance-individual";
      textoAvance.textContent = "Avance: " + avanceMostrado + "%";

      tarjeta.append(descripcion, barra, textoAvance);
      if (item.materialApoyoUrl) {
        tarjeta.appendChild(crearEnlaceDescarga(item.materialApoyoUrl, "📎 Material de apoyo"));
      }
      if (item.detalleCompleto) {
        tarjeta.appendChild(crearBotonVerDetalle(item));
      }

      // Indicador de progreso personal (ver progresoCache): independiente
      // por completo del "avance" estático de arriba, que es del proyecto
      // en general y no del alumno. El border-top de .indicador-progreso ya
      // lo separa visualmente de ese bloque.
      tarjeta.appendChild(crearChecklistProgreso("proyecto", item, tarjeta));

      cuadriculaGrupo.appendChild(tarjeta);
    });

    bloqueGrupo.appendChild(cuadriculaGrupo);
    contenedor.appendChild(bloqueGrupo);
  });

  actualizarResumenProgreso("resumen-progreso-proyectos", datos, "proyecto", "proyectos");
  if (TRIMESTRE_ACTUAL === "1") aplicarModoVistaSecuencia("contenedor-proyectos");
}

// Mismos íconos que ya usa mostrarSinResultados() para las 3 secciones
// (ver sesión de empty states: 📝 tareas, 🎯 actividades, 🚀 proyectos) —
// consistencia intencional, no un set de íconos aparte para esta lista.
const ICONO_PROXIMAS_FECHAS_POR_TIPO = { tarea: "📝", actividad: "🎯", proyecto: "🚀" };

// Badge de estado COMPACTO (solo emoji, ver .badge-estado--compacto ya
// usado en el panel de calificaciones) para una fila de
// #proximas-fechas-trimestre: a diferencia de las tarjetas de Tareas/
// Actividades/Proyectos, aquí no hay espacio para el texto completo del
// badge sin volver la fila demasiado alta con 21+ items reales. Reutiliza
// calcularEstadoProgresoItem() (misma lógica exacta que
// crearChecklistProgreso()) y expone el texto completo vía tooltip +
// aria-describedby, nunca solo visualmente: mismo criterio que ya usan
// los íconos ⓘ de criterio-tarjeta__info (activarTooltipsInfo(), más
// abajo). "sin-cuenta" reutiliza el mismo data-estado/color que ya usa
// tabla-calificacion para alumnos sin cuenta — mismo eje semántico
// (progreso no disponible), no un token nuevo.
function crearBadgeEstadoCompacto(tipo, item, idBase, li) {
  const resultado = calcularEstadoProgresoItem(tipo, item);
  li.classList.toggle("tarjeta--completada", resultado?.estado === "completada");

  const estado = resultado ? resultado.estado : "sin-cuenta";
  const texto = resultado ? resultado.texto.slice(resultado.texto.indexOf(" ") + 1) : "Inicia sesión para ver tu progreso";
  const emoji = resultado ? resultado.texto.slice(0, resultado.texto.indexOf(" ")) : "🔑";
  const idTexto = "proximas-fechas-estado-" + idBase;

  const disparador = document.createElement("span");
  disparador.className = "badge-estado badge-estado--compacto tooltip-disparador";
  disparador.dataset.estado = estado;
  disparador.tabIndex = 0;
  disparador.title = texto;
  disparador.setAttribute("aria-describedby", idTexto);

  const iconoVisible = document.createElement("span");
  iconoVisible.setAttribute("aria-hidden", "true");
  iconoVisible.textContent = emoji;

  const tooltip = document.createElement("span");
  tooltip.className = "tooltip-flotante";
  tooltip.setAttribute("aria-hidden", "true");
  tooltip.textContent = texto;

  disparador.append(iconoVisible, tooltip);

  const textoSR = document.createElement("span");
  textoSR.id = idTexto;
  textoSR.className = "sr-only";
  textoSR.textContent = texto;

  return [disparador, textoSR];
}

// "Próximas fechas" del trimestre (#proximas-fechas-trimestre en
// trimestre-1/2/3.html): lista cronológica con línea de tiempo
// (.linea-tiempo, ver css/style.css — misma clase que ya usa el feed de
// Actividad reciente del Dashboard). El badge de estado es compacto
// (crearBadgeEstadoCompacto arriba) — NO reutiliza crearChecklistProgreso()
// directamente, esa función sigue intacta para Tareas/Actividades/
// Proyectos, que sí tienen espacio para el texto completo.
async function renderizarProximasFechasTrimestre() {
  const contenedor = document.getElementById("contenedor-proximas-fechas-trimestre");
  if (!contenedor) return;

  const datos = await obtenerProximasFechasTrimestre(TRIMESTRE_ACTUAL);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "Aún no hay fechas de entrega registradas para este trimestre.", "📅");
    return;
  }

  contenedor.innerHTML = "";
  const lista = document.createElement("ul");
  lista.className = "linea-tiempo proximas-fechas-trimestre__lista";

  datos.forEach(({ tipo, item }) => {
    const li = document.createElement("li");
    li.className = "linea-tiempo__item proximas-fechas-trimestre__item";

    const icono = document.createElement("span");
    icono.className = "proximas-fechas-trimestre__icono";
    icono.setAttribute("aria-hidden", "true");
    icono.textContent = ICONO_PROXIMAS_FECHAS_POR_TIPO[tipo];

    const info = document.createElement("div");
    info.className = "proximas-fechas-trimestre__info";

    const titulo = document.createElement("p");
    titulo.className = "proximas-fechas-trimestre__titulo";
    titulo.textContent = item.titulo;

    const fecha = document.createElement("p");
    fecha.className = "proximas-fechas-trimestre__fecha";
    fecha.textContent = resolverFechaItem(tipo === "actividad" ? item.fecha : item.fechaEntrega);

    info.append(titulo, fecha);
    li.append(icono, info, ...crearBadgeEstadoCompacto(tipo, item, tipo + "-" + item.id, li));
    lista.appendChild(li);
  });

  contenedor.appendChild(lista);
}

async function renderizarVideos() {
  const contenedor = document.getElementById("contenedor-videos");
  if (!contenedor) return;

  const datos = (await obtenerVideos(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay videos registrados para este grupo.", "🎬");
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

async function renderizarPresentaciones() {
  const contenedor = document.getElementById("contenedor-presentaciones");
  if (!contenedor) return;

  const datos = await obtenerPresentaciones(TRIMESTRE_ACTUAL);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay presentaciones registradas para este bloque.", "📽️");
    return;
  }

  contenedor.innerHTML = "";
  datos.forEach((item) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-presentacion";

    const marco = document.createElement("div");
    marco.className = "tarjeta-presentacion__marco";

    // Placeholder: no se carga el iframe hasta que el alumno hace
    // clic, para no cargar 3 presentaciones de golpe al abrir la
    // página (cada una pesa bastante más que un embed de YouTube).
    const placeholder = document.createElement("div");
    placeholder.className = "tarjeta-presentacion__placeholder";
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "tarjeta-presentacion__boton-ver";
    boton.innerHTML = "▶ Ver presentación";
    boton.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = item.gammaEmbedUrl;
      iframe.title = item.titulo;
      iframe.loading = "lazy";
      iframe.allowFullscreen = true;
      // Permissions Policy real que necesita el botón de pantalla
      // completa DENTRO del reproductor de Gamma (allowFullscreen
      // por sí solo no basta en todos los navegadores).
      iframe.setAttribute("allow", "fullscreen");
      marco.innerHTML = "";
      marco.appendChild(iframe);
    });
    placeholder.appendChild(boton);
    marco.appendChild(placeholder);

    const info = document.createElement("div");
    info.className = "tarjeta-presentacion__info";

    const textos = document.createElement("div");
    const titulo = document.createElement("h3");
    titulo.textContent = item.titulo;
    const descripcion = document.createElement("p");
    descripcion.textContent = item.descripcion;
    textos.append(titulo, descripcion);

    // Respaldo: abre el Gamma directo en pestaña nueva, a tamaño
    // completo de navegador (fuera del iframe pequeño), por si el
    // botón interno de pantalla completa no funciona en algún
    // dispositivo.
    const abrir = document.createElement("a");
    abrir.className = "tarjeta-presentacion__abrir";
    abrir.href = item.gammaEmbedUrl;
    abrir.target = "_blank";
    abrir.rel = "noopener";
    abrir.textContent = "Abrir presentación completa ↗";

    info.append(textos, abrir);
    tarjeta.append(marco, info);
    contenedor.appendChild(tarjeta);
  });
}

// Tarjeta estática del Encuadre Anual en la portada (#encuadre-anual). No
// es una lista dinámica como renderizarPresentaciones(), pero usa la misma
// carga bajo demanda: el iframe de Gamma no se crea hasta el clic.
// dataset.activado evita adjuntar el listener más de una vez: renderizarTodo()
// (que llama a esta función) se dispara varias veces en la carga real
// (DOMContentLoaded + de nuevo al resolver la sesión) — mismo guard que
// activarExpansionReglamento() más abajo, mismo motivo.
function activarBotonEncuadreAnual() {
  const boton = document.getElementById("boton-ver-encuadre-anual");
  if (!boton || boton.dataset.activado) return;
  boton.dataset.activado = "true";
  boton.addEventListener("click", () => {
    const marco = boton.closest(".tarjeta-presentacion__marco");
    const iframe = document.createElement("iframe");
    iframe.src = "https://gamma.app/embed/d2hobcvjqltc3q7";
    iframe.title = "Mundo Digital 3 — Encuadre Anual 2026-2027";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allow", "fullscreen");
    marco.innerHTML = "";
    marco.appendChild(iframe);
  });
}

// Expansión in-place de la celda "Reglamento del salón" en el bento de la
// portada (#reglamento-taller): las primeras 4 reglas están siempre
// visibles, las 5 restantes viven en .reglamento-lista__resto (colapsada
// por CSS, ver css/style.css) hasta el clic — misma celda, sin navegar a
// otra página ni acordeón de toda la fila. Contenido 100% estático (no hay
// nada que renderizar), así que esto solo alterna clase + aria-expanded +
// el texto del botón.
// dataset.activado evita adjuntar el listener más de una vez:
// renderizarTodo() (que llama a esta función) se dispara varias veces en
// la carga real (DOMContentLoaded + de nuevo al resolver la sesión, ver
// los otros llamados a renderizarTodo() en este archivo) — sin este guard,
// cada llamada agrega OTRO listener al mismo botón estático, y varios
// clasList.toggle() disparándose en el mismo clic se cancelan entre sí.
function activarExpansionReglamento() {
  const celda = document.getElementById("reglamento-taller");
  const boton = document.getElementById("boton-expandir-reglamento");
  const texto = document.getElementById("texto-boton-expandir-reglamento");
  if (!celda || !boton || !texto || boton.dataset.activado) return;
  boton.dataset.activado = "true";

  boton.addEventListener("click", () => {
    const expandida = celda.classList.toggle("reglamento--expandida");
    boton.setAttribute("aria-expanded", String(expandida));
    texto.textContent = expandida ? "Ver menos" : "Ver las 9 reglas completas";
  });
}

function obtenerRegistroExamenDiagnostico() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_EXAMEN_DIAGNOSTICO_POR_ALUMNO)) || {};
  } catch (error) {
    return {};
  }
}

function idAlumnoExamenDiagnostico(perfil) {
  return perfil.grupo + "_" + slugAlumno(perfil.nombre);
}

function marcarExamenDiagnosticoCompletado(perfil) {
  const registro = obtenerRegistroExamenDiagnostico();
  registro[idAlumnoExamenDiagnostico(perfil)] = true;
  localStorage.setItem(CLAVE_EXAMEN_DIAGNOSTICO_POR_ALUMNO, JSON.stringify(registro));
}

// Fila "Examen de diagnóstico" para el panel de Progreso: mismo componente
// visual (panel-progreso__item + badge-estado) que las filas de tareas/
// actividades/proyectos del detalle por trimestre, para que el examen se
// lea como una entrada más de progreso en vez de un elemento aparte. El
// enlace al Google Form solo se muestra si el alumno activo todavía no
// está registrado como completado.
function construirFilaExamenDiagnostico(perfil) {
  const registro = obtenerRegistroExamenDiagnostico();
  const completado = Boolean(registro[idAlumnoExamenDiagnostico(perfil)]);

  const fila = document.createElement("li");
  fila.className = "panel-progreso__item";

  const titulo = document.createElement("span");
  titulo.className = "panel-progreso__item-titulo";
  titulo.textContent = "Examen de diagnóstico";
  fila.appendChild(titulo);

  const badge = document.createElement("span");
  badge.className = "badge-estado";
  badge.dataset.estado = completado ? "completada" : "pendiente";
  badge.textContent = completado ? "✅ Completada" : "⏳ Pendiente";
  fila.appendChild(badge);

  if (!completado) {
    const enlace = document.createElement("a");
    enlace.href = URL_EXAMEN_DIAGNOSTICO;
    enlace.target = "_blank";
    enlace.rel = "noopener";
    enlace.className = "panel-progreso__item-enlace";
    enlace.textContent = "Ir al examen →";
    fila.appendChild(enlace);
  }

  return fila;
}

// Envuelve construirFilaExamenDiagnostico() en la misma <ul class=
// "panel-progreso__lista"> que agrupa las filas de tareas/actividades/
// proyectos, para que comparta exactamente el mismo espaciado y grid.
function construirListaExamenDiagnostico(perfil) {
  const lista = document.createElement("ul");
  lista.className = "panel-progreso__lista";
  lista.appendChild(construirFilaExamenDiagnostico(perfil));
  return lista;
}

// Banner estático del Examen de Diagnóstico en la portada
// (#examen-diagnostico). Sin sesión de Supabase, el banner se muestra
// siempre (no hay forma de saber si ya se contestó) y el botón "Ya lo
// contesté" se oculta a favor de un aviso para iniciar sesión: el examen
// no cuenta para calificación, así que no vale la pena forzar un login
// solo para descartar un recordatorio. Con sesión activa, se oculta solo
// si ESE alumno ya está en CLAVE_EXAMEN_DIAGNOSTICO_POR_ALUMNO; se vuelve
// a evaluar cada vez que cambia la sesión (ver onAuthStateChange).
function actualizarVisibilidadBannerExamenDiagnostico() {
  const seccion = document.getElementById("examen-diagnostico");
  if (!seccion) return;

  const boton = document.getElementById("boton-ya-lo-conteste");
  const avisoSesion = document.getElementById("texto-inicia-sesion-examen");
  const perfil = obtenerPerfilActivo();

  if (!perfil) {
    seccion.hidden = false;
    if (boton) boton.hidden = true;
    if (avisoSesion) avisoSesion.hidden = false;
    return;
  }

  if (boton) boton.hidden = false;
  if (avisoSesion) avisoSesion.hidden = true;

  const registro = obtenerRegistroExamenDiagnostico();
  seccion.hidden = Boolean(registro[idAlumnoExamenDiagnostico(perfil)]);
}

function activarBannerExamenDiagnostico() {
  const seccion = document.getElementById("examen-diagnostico");
  if (!seccion) return;

  actualizarVisibilidadBannerExamenDiagnostico();

  const botonDescartar = document.getElementById("boton-ya-lo-conteste");
  if (botonDescartar) {
    botonDescartar.addEventListener("click", () => {
      const perfil = obtenerPerfilActivo();
      if (!perfil) return;
      marcarExamenDiagnosticoCompletado(perfil);
      actualizarVisibilidadBannerExamenDiagnostico();
    });
  }
}

const MENSAJES_MOTIVACIONALES = [
  "Vas muy bien, sigue así.",
  "Un paso a la vez: cada tarea marcada cuenta.",
  "Tu constancia se nota en tu bitácora.",
  "Pequeños avances todos los días suman grandes resultados.",
  "Ánimo, ya llevas buen camino recorrido.",
];

// "Racha de puntualidad": insignia de gamificación automática (no un
// checkbox, no manual) calculada a partir de progresoCache. Cuenta hacia
// atrás desde la entrega más reciente del alumno (todas las entregas,
// cronológicas, sin separar por tipo) cuántas seguidas fueron a tiempo
// (actualizado_en <= las 23:59:59 hora local del día de la fecha límite,
// mismo criterio que itemEstaVencido) y se detiene en la primera tarde o
// al llegar al principio. Sin sesión iniciada, null — igual que el resto
// del panel de Progreso sin alumno identificado.
async function calcularRachaPuntualidad() {
  const perfil = obtenerPerfilActivo();
  if (!perfil) return null;

  const trimestres = ["1", "2", "3"];
  const entregablesPorTrimestre = await Promise.all(
    trimestres.map((trimestre) => obtenerEntregablesPorTipo("todos", trimestre))
  );
  const itemsPorTrimestre = new Map();
  trimestres.forEach((trimestre, indice) => itemsPorTrimestre.set(trimestre, entregablesPorTrimestre[indice]));

  const entregas = [];
  progresoCache.forEach((fila) => {
    if (!fila.actualizado_en) return; // sin fecha real de entrega: no se puede evaluar

    const items = itemsPorTrimestre.get(String(fila.trimestre));
    const item = items?.find(
      (candidato) => candidato.tipoEntregable === fila.tipo && String(candidato.id) === String(fila.item_id)
    );
    if (!item) return; // id desconocido (item borrado/cambiado por el docente): se ignora, no rompe la racha

    const fechaLimite = fechaLimiteISO(fila.tipo, item, perfil.grupo);
    if (!fechaLimite) return; // sin fecha límite resoluble: se ignora igual

    const aTiempo = new Date(fila.actualizado_en) <= new Date(fechaLimite + "T23:59:59");
    entregas.push({ actualizadoEn: fila.actualizado_en, aTiempo });
  });

  entregas.sort((a, b) => new Date(a.actualizadoEn) - new Date(b.actualizadoEn));

  let racha = 0;
  for (let i = entregas.length - 1; i >= 0; i--) {
    if (!entregas[i].aTiempo) break;
    racha++;
  }

  return { racha, desbloqueada: racha >= 3 };
}

// Tarjeta de la insignia dentro de #progreso-resumen-general — SOLO en
// progreso.html: #progreso-detalle-trimestres es el mismo indicador de
// página que ya usa renderizarProgresoDetallado() para saber si el
// detalle itemizado aplica (ese contenedor no existe en la portada).
// null si no corresponde (sin sesión, o fuera de progreso.html): ni
// renderizarProgreso() ni renderizarProgresoDetallado() agregan nada al
// resumen en ese caso.
async function construirTarjetaRachaPuntualidad() {
  if (!document.getElementById("progreso-detalle-trimestres")) return null;

  const resultado = await calcularRachaPuntualidad();
  if (!resultado) return null;

  const tarjeta = document.createElement("div");
  tarjeta.className = "insignia-racha";
  tarjeta.dataset.estado = resultado.desbloqueada ? "ganada" : "bloqueada";
  // Borde animado (.borde-animado-acento, ver css/style.css) solo al
  // ganar la racha — se siente como recompensa, no como algo que ya
  // estaba ahí antes de desbloquearla.
  if (resultado.desbloqueada) {
    tarjeta.classList.add("borde-animado-acento", "borde-animado-acento--compacto");
  }

  const icono = document.createElement("span");
  icono.className = "insignia-racha__icono";
  icono.setAttribute("aria-hidden", "true");
  icono.textContent = resultado.desbloqueada ? "🔥" : "🔒";

  const texto = document.createElement("span");
  texto.className = "insignia-racha__texto";
  texto.textContent = resultado.desbloqueada
    ? "Racha de puntualidad"
    : resultado.racha + " de 3 entregas a tiempo";

  tarjeta.append(icono, texto);
  return tarjeta;
}

// Resumen de asistencia dentro de #progreso-resumen-general: tarjeta de
// conteo (presentes/faltas/retardos/justificadas) + insignia de racha.
// Mismo gate de página que construirTarjetaRachaPuntualidad()/
// construirTarjetaNivel (#progreso-detalle-trimestres: solo progreso.html),
// y UNA sola llamada a calcularResumenAsistencia() para las 2 piezas, para
// no duplicar la consulta a Supabase. perfilActivoCache no trae el id
// (solo nombre/grupo, ver sincronizarPerfilActivo), así que el auth.uid()
// se resuelve aquí con getSession(), mismo patrón ya usado en
// escribirValorConfigSitio()/guardarAsistenciaLote(). { tarjetaConteo:
// null, tarjetaRacha: null } si no aplica (fuera de progreso.html, sin
// sesión) o si el alumno no tiene ningún día de asistencia registrado
// todavía (evita una tarjeta en blanco con puros ceros y una insignia
// "0 de 3" sin sentido).
async function construirResumenAsistenciaProgreso(trimestre) {
  const vacio = { tarjetaConteo: null, tarjetaRacha: null };
  if (!document.getElementById("progreso-detalle-trimestres")) return vacio;

  const {
    data: { session },
  } = await clienteSupabase.auth.getSession();
  if (!session) return vacio;

  const resumen = await calcularResumenAsistencia(session.user.id, trimestre);
  const totalRegistros = resumen
    ? Object.values(resumen.conteoPorEstado).reduce((suma, cantidad) => suma + cantidad, 0)
    : 0;
  if (totalRegistros === 0) return vacio;

  const tarjetaConteo = document.createElement("div");
  tarjetaConteo.className = "resumen-asistencia";

  const titulo = document.createElement("p");
  titulo.className = "resumen-asistencia__titulo";
  titulo.textContent = "📋 Asistencia — Trimestre " + trimestre;
  tarjetaConteo.appendChild(titulo);

  const grid = document.createElement("div");
  grid.className = "resumen-asistencia__grid";
  [
    ["presente", "Presentes"],
    ["falta", "Faltas"],
    ["retardo", "Retardos"],
    ["justificada", "Justificadas"],
  ].forEach(([clave, etiqueta]) => {
    const stat = document.createElement("div");
    stat.className = "resumen-asistencia__stat";

    const valor = document.createElement("span");
    valor.className = "resumen-asistencia__valor";
    valor.textContent = String(resumen.conteoPorEstado[clave] || 0);

    const etiquetaEl = document.createElement("span");
    etiquetaEl.className = "resumen-asistencia__etiqueta";
    etiquetaEl.textContent = etiqueta;

    stat.append(valor, etiquetaEl);
    grid.appendChild(stat);
  });
  tarjetaConteo.appendChild(grid);

  // Mismo umbral (racha >= 3) y mismo estilo visual (.insignia-racha) que
  // construirTarjetaRachaPuntualidad(), pero para asistencia -- iconos
  // distintos (🎯 en vez de 🔥) para que las 2 insignias no se lean como
  // duplicadas al vivir una junto a la otra. racha ya viene calculada por
  // calcularResumenAsistencia() (solo corta con falta/retardo, ver esa
  // función), no hace falta recalcularla aquí.
  const desbloqueada = resumen.racha >= 3;
  const tarjetaRacha = document.createElement("div");
  tarjetaRacha.className = "insignia-racha";
  tarjetaRacha.dataset.estado = desbloqueada ? "ganada" : "bloqueada";
  if (desbloqueada) {
    tarjetaRacha.classList.add("borde-animado-acento", "borde-animado-acento--compacto");
  }

  const icono = document.createElement("span");
  icono.className = "insignia-racha__icono";
  icono.setAttribute("aria-hidden", "true");
  icono.textContent = desbloqueada ? "🎯" : "🔒";

  const texto = document.createElement("span");
  texto.className = "insignia-racha__texto";
  texto.textContent = desbloqueada ? "Racha de asistencia" : resumen.racha + " de 3 asistencias seguidas";

  tarjetaRacha.append(icono, texto);

  return { tarjetaConteo, tarjetaRacha };
}

// "Nivel": gamificación visual sobre el % de avance general del ciclo
// (el MISMO porcentaje que ya calculan renderizarProgreso()/
// renderizarProgresoDetallado() para su barra de progreso — no una
// medida nueva, no afecta calificación real). Bandas fijas, la más alta
// que el porcentaje alcance gana.
const NIVELES_ALUMNO = [
  { nivel: 1, subtitulo: "Explorador Tecnológico", minimo: 0 },
  { nivel: 2, subtitulo: "Analista de Datos", minimo: 50 },
  { nivel: 3, subtitulo: "Creador Digital", minimo: 75 },
];

// Recibe el porcentaje YA calculado por el llamador — no vuelve a sumar
// completadasGeneral/totalGeneral aquí, para no triplicar ese cálculo.
function calcularNivelAlumno(porcentaje) {
  let resultado = NIVELES_ALUMNO[0];
  NIVELES_ALUMNO.forEach((banda) => {
    if (porcentaje >= banda.minimo) resultado = banda;
  });
  return { nivel: resultado.nivel, subtitulo: resultado.subtitulo };
}

// Etiqueta de nivel dentro de #progreso-resumen-general — mismo gate de
// página que construirTarjetaRachaPuntualidad() (#progreso-detalle-
// trimestres: solo existe en progreso.html), junto a esa tarjeta de
// racha. null fuera de progreso.html: ni renderizarProgreso() ni
// renderizarProgresoDetallado() agregan nada en ese caso.
function construirTarjetaNivel(porcentaje) {
  if (!document.getElementById("progreso-detalle-trimestres")) return null;

  const { nivel, subtitulo } = calcularNivelAlumno(porcentaje);
  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta-nivel";
  etiqueta.textContent = "Nivel " + nivel + " · " + subtitulo;
  return etiqueta;
}

// Misma fórmula que ya usan, cada una con su propio bucle,
// renderizarProgreso() y renderizarProgresoDetallado() (total/completadas
// de tareas+actividades+proyectos de los 3 trimestres, filtradas por el
// grupo del alumno) — para actualizarUISesion() (etiqueta de Nivel del
// botón de cuenta) y para el módulo Dashboard del panel docente
// (semáforo/KPI de avance de CUALQUIER alumno, no solo el de la sesión).
// No se tocó el cálculo de esas dos: se factorizó aparte para no
// copiarlo literal una tercera vez.
//
// "estaCompletado" es inyectable (por defecto lee progresoCache vía
// itemEstaCompletado, igual que antes) porque ese caché solo tiene el
// progreso del alumno de la sesión activa: el Dashboard, que evalúa
// alumnos arbitrarios, pasa su propio checker respaldado por un mapa de
// progreso ya consultado para ese alumno en vez de progresoCache.
// Versión detallada de calcularAvanceGeneralAlumno: mismo recorrido de los 3
// trimestres, pero además acumula totales/completadas por tipo de entregable
// (tarea/actividad/proyecto) para el desglose de la card "Avance del ciclo"
// del Dashboard (ver construirTarjetaAvanceCiclo()). calcularAvanceGeneralAlumno
// se deja como envoltura delgada de esta función para no duplicar la lógica
// y no afectar a su otro llamador (nivel del alumno en progreso.html).
async function calcularAvanceGeneralAlumnoDetallado(perfil, estaCompletado = itemEstaCompletado) {
  const coincideConGrupoDelAlumno = (item) => item.grupo === "todos" || item.grupo === perfil.grupo;

  let totalGeneral = 0;
  let completadasGeneral = 0;
  const porTipo = {
    tarea: { total: 0, completadas: 0 },
    actividad: { total: 0, completadas: 0 },
    proyecto: { total: 0, completadas: 0 },
  };

  for (const trimestre of ["1", "2", "3"]) {
    const tareas = (await obtenerTareas(trimestre)).filter(coincideConGrupoDelAlumno);
    const actividades = (await obtenerActividades(trimestre)).filter(coincideConGrupoDelAlumno);
    const proyectos = (await obtenerProyectos(trimestre)).filter(coincideConGrupoDelAlumno);

    const completadasTareas = tareas.filter((item) => estaCompletado("tarea", item.id, trimestre)).length;
    const completadasActividades = actividades.filter((item) =>
      estaCompletado("actividad", item.id, trimestre)
    ).length;
    const completadasProyectos = proyectos.filter((item) =>
      estaCompletado("proyecto", item.id, trimestre)
    ).length;

    totalGeneral += tareas.length + actividades.length + proyectos.length;
    completadasGeneral += completadasTareas + completadasActividades + completadasProyectos;

    porTipo.tarea.total += tareas.length;
    porTipo.tarea.completadas += completadasTareas;
    porTipo.actividad.total += actividades.length;
    porTipo.actividad.completadas += completadasActividades;
    porTipo.proyecto.total += proyectos.length;
    porTipo.proyecto.completadas += completadasProyectos;
  }

  const porcentaje = (bucket) => (bucket.total === 0 ? 0 : Math.round((bucket.completadas / bucket.total) * 100));

  return {
    avance: totalGeneral === 0 ? 0 : Math.round((completadasGeneral / totalGeneral) * 100),
    porTipo: {
      tarea: porcentaje(porTipo.tarea),
      actividad: porcentaje(porTipo.actividad),
      proyecto: porcentaje(porTipo.proyecto),
    },
  };
}

async function calcularAvanceGeneralAlumno(perfil, estaCompletado = itemEstaCompletado) {
  return (await calcularAvanceGeneralAlumnoDetallado(perfil, estaCompletado)).avance;
}

// Panel de "Progreso" de la portada: solo existe en index.html (los
// contenedores se buscan por id y, si no están, la función no hace
// nada), y solo muestra datos si hay un alumno identificado (ver sección
// 11). Suma tareas + actividades + proyectos completados de los 3 trimestres,
// filtradas por el grupo del alumno (no por el selector de grupo del
// sitio, que es independiente y puede estar en "todos" mientras navega).
async function renderizarProgreso() {
  const sinPerfil = document.getElementById("progreso-sin-perfil");
  const conPerfil = document.getElementById("progreso-con-perfil");
  if (!sinPerfil || !conPerfil) return;

  const perfil = obtenerPerfilActivo();
  sinPerfil.hidden = Boolean(perfil);
  conPerfil.hidden = !perfil;
  if (!perfil) return;

  // Misma data (tareas/actividades/proyectos por trimestre, ya filtrados
  // por el grupo del alumno, con sus contadores) que ya arma
  // calcularProgresoDetalladoPorTrimestre() para progreso.html — antes se
  // recalculaba aquí con un bucle propio que descartaba los arreglos de
  // items, así que el semáforo/"Misión de hoy"/"Próximas entregas" de
  // abajo no podían armarse sin recalcular todo de nuevo. Reutilizarla
  // tal cual evita esa duplicación.
  const { porTrimestre, totalGeneral, completadasGeneral } = await calcularProgresoDetalladoPorTrimestre(perfil);

  // Resuelto ANTES de tocar el DOM a propósito: si renderizarTodo() corre
  // dos veces solapado (DOMContentLoaded + onAuthStateChange, ver comentario
  // de sincronizarPerfilActivo), un await situado EN MEDIO del tramo de
  // escritura (innerHTML="" ... appendChild) le da a la otra invocación una
  // ventana para intercalar su propio innerHTML="" y duplicar racha/nivel/
  // semáforo. Con la promesa ya resuelta aquí, todo el tramo de abajo queda
  // como un solo bloque síncrono, sin punto de interleaving posible.
  const tarjetaRacha = await construirTarjetaRachaPuntualidad();
  const { tarjetaConteo: tarjetaConteoAsistencia, tarjetaRacha: tarjetaRachaAsistencia } =
    await construirResumenAsistenciaProgreso(String(trimestreDesbloqueado));

  const porcentaje = totalGeneral === 0 ? 0 : Math.round((completadasGeneral / totalGeneral) * 100);

  const mensaje = document.getElementById("progreso-mensaje");
  if (mensaje) {
    mensaje.textContent = MENSAJES_MOTIVACIONALES[completadasGeneral % MENSAJES_MOTIVACIONALES.length];
  }

  // Semáforo + "Misión de hoy" + "Próximas entregas" + "Accesos rápidos"
  // del trimestre DESBLOQUEADO (no de los 3): mismo criterio que ya usa
  // renderizarProgresoDetallado() para su propio semáforo en
  // progreso.html — trimestreDesbloqueado es el trimestre realmente
  // activo, ultimoTrimestreVisto solo sirve para los enlaces del sidebar.
  const pendientesEl = document.getElementById("progreso-pendientes");
  if (pendientesEl) {
    pendientesEl.innerHTML = "";
    const trimestreActivo = String(trimestreDesbloqueado);
    const entradaActiva = porTrimestre.find((p) => p.trimestre === trimestreActivo);
    const pendientes = entradaActiva
      ? [
          ...entradaActiva.tareas.map((item) => ({ tipo: "tarea", item })),
          ...entradaActiva.actividades.map((item) => ({ tipo: "actividad", item })),
          ...entradaActiva.proyectos.map((item) => ({ tipo: "proyecto", item })),
        ].filter(({ tipo, item }) => !itemEstaCompletado(tipo, item.id, trimestreActivo))
      : [];

    const conFecha = obtenerPendientesOrdenados(pendientes, perfil.grupo);
    pendientesEl.appendChild(construirFilaSemaforo(calcularEstadoSemaforo(conFecha, perfil.grupo)));
    pendientesEl.appendChild(construirDashboardPendientes(conFecha, trimestreActivo, perfil.grupo));
    pendientesEl.appendChild(construirAccesosRapidos(trimestreActivo));
  }

  const resumen = document.getElementById("progreso-resumen-general");
  if (resumen) {
    resumen.innerHTML = "";
    const texto = document.createElement("p");
    texto.className = "resumen-progreso__texto";
    texto.textContent =
      completadasGeneral + " de " + totalGeneral + " tareas, actividades y proyectos completados";

    const barra = document.createElement("div");
    barra.className = "barra-progreso";
    barra.setAttribute("role", "progressbar");
    barra.setAttribute("aria-valuenow", String(completadasGeneral));
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", String(totalGeneral));
    barra.setAttribute("aria-label", "Progreso general del alumno identificado");
    const relleno = document.createElement("div");
    relleno.className = "barra-progreso__relleno";
    relleno.style.width = porcentaje + "%";
    barra.appendChild(relleno);

    resumen.append(texto, barra, construirListaExamenDiagnostico(perfil));

    if (tarjetaRacha) resumen.appendChild(tarjetaRacha);

    const tarjetaNivel = construirTarjetaNivel(porcentaje);
    if (tarjetaNivel) resumen.appendChild(tarjetaNivel);

    if (tarjetaConteoAsistencia) resumen.appendChild(tarjetaConteoAsistencia);
    if (tarjetaRachaAsistencia) resumen.appendChild(tarjetaRachaAsistencia);
  }

  const bloques = document.getElementById("progreso-por-trimestre");
  if (bloques) {
    bloques.innerHTML = "";
    porTrimestre.forEach(({ trimestre: numTrimestre, total, completadas }) => {
      const bloque = document.createElement("div");
      bloque.className = "panel-progreso__bloque";

      const titulo = document.createElement("h3");
      titulo.textContent = "Trimestre " + numTrimestre;

      const texto = document.createElement("p");
      texto.textContent =
        total === 0
          ? "Sin tareas, actividades ni proyectos registrados todavía."
          : completadas + " de " + total + " completadas";

      bloque.append(titulo, texto);
      bloques.appendChild(bloque);
    });
  }
}

// Texto del enlace "Ir a la tarea/actividad/proyecto →" según el tipo de
// ítem (distinto artículo/género gramatical por tipo).
const ETIQUETAS_ENLACE_ITEM = {
  tarea: "Ir a la tarea →",
  actividad: "Ir a la actividad →",
  proyecto: "Ir al proyecto →",
};

// Página independiente (progreso.html): detalle itemizado del progreso
// personal, trimestre por trimestre, con un <details> colapsable por
// trimestre y el desglose de tareas/actividades/proyectos dentro. El
// resumen general (mensaje + "X de Y" + barra) usa los mismos ids que
// renderizarProgreso() en la portada (progreso-mensaje,
// progreso-resumen-general): como esta función corre en TODAS las
// páginas vía renderizarTodo(), renderizarProgreso() ya los llena solo
// con encontrarlos en el DOM; aquí se recalculan con la misma lógica
// porque de todos modos hace falta la misma data (tareas/actividades/
// proyectos por trimestre) para armar el detalle de abajo.
// Misma data que arma renderizarProgresoDetallado() (tareas/actividades/
// proyectos por trimestre, filtrados por el grupo del alumno, con sus
// contadores de completadas) — extraída aquí para que
// generarVistaImpresionProgreso() (vista de impresión) la reutilice sin
// duplicar el bucle.
// Caché en memoria del resultado YA RESUELTO (no una promesa) para el
// perfil activo — renderizarProgreso()/renderizarProgresoDetallado()/
// generarVistaImpresionProgreso() piden el mismo detalle por trimestre en
// la misma sesión; sin esto, progreso.html lo recalculaba 2 veces
// completas (18 consultas). Se invalida en sincronizarPerfilActivo(), el
// único lugar que repuebla perfilActivoCache/progresoCache.
let cacheProgresoDetallado = null;

async function calcularProgresoDetalladoPorTrimestre(perfil) {
  if (cacheProgresoDetallado) return cacheProgresoDetallado;

  const coincideConGrupoDelAlumno = (item) => item.grupo === "todos" || item.grupo === perfil.grupo;

  // Los 3 trimestres, y las 3 consultas (tareas/actividades/proyectos)
  // dentro de cada uno, son independientes entre sí — antes corrían en
  // cascada (9 awaits secuenciales). Promise.all conserva el orden del
  // array de trimestres sin importar en qué orden resuelvan.
  const porTrimestre = await Promise.all(
    ["1", "2", "3"].map(async (trimestre) => {
      const [tareas, actividades, proyectos] = await Promise.all([
        obtenerTareas(trimestre),
        obtenerActividades(trimestre),
        obtenerProyectos(trimestre),
      ]);
      const tareasDelGrupo = tareas.filter(coincideConGrupoDelAlumno);
      const actividadesDelGrupo = actividades.filter(coincideConGrupoDelAlumno);
      const proyectosDelGrupo = proyectos.filter(coincideConGrupoDelAlumno);

      const completadasTareas = tareasDelGrupo.filter((item) =>
        itemEstaCompletado("tarea", item.id, trimestre)
      ).length;
      const completadasActividades = actividadesDelGrupo.filter((item) =>
        itemEstaCompletado("actividad", item.id, trimestre)
      ).length;
      const completadasProyectos = proyectosDelGrupo.filter((item) =>
        itemEstaCompletado("proyecto", item.id, trimestre)
      ).length;

      const total = tareasDelGrupo.length + actividadesDelGrupo.length + proyectosDelGrupo.length;
      const completadas = completadasTareas + completadasActividades + completadasProyectos;

      return {
        trimestre,
        tareas: tareasDelGrupo,
        actividades: actividadesDelGrupo,
        proyectos: proyectosDelGrupo,
        total,
        completadas,
      };
    })
  );

  // Solo cuentan para el total/completadas general los trimestres que el
  // docente ya desbloqueó — porTrimestre sigue trayendo los 3 completos
  // porque el resto de la función (semáforo, detalle itemizado) los
  // necesita todos.
  const desbloqueados = porTrimestre.filter((t) => Number(t.trimestre) <= trimestreDesbloqueado);
  const totalGeneral = desbloqueados.reduce((suma, t) => suma + t.total, 0);
  const completadasGeneral = desbloqueados.reduce((suma, t) => suma + t.completadas, 0);

  cacheProgresoDetallado = { porTrimestre, totalGeneral, completadasGeneral };
  return cacheProgresoDetallado;
}

// Texto del semáforo por estado — ícono+palabra en vez de solo color
// (WCAG 1.4.1). Reutilizado por construirFilaSemaforo(), que a su vez
// usan tanto construirSemaforoPendientes() (progreso.html) como el panel
// de Progreso de la portada (index.html).
const TEXTO_SEMAFORO = {
  verde: "🟢 Al día — sin pendientes vencidos ni por vencer en los próximos 3 días.",
  amarillo: "🟡 Atento — tienes pendientes que vencen en los próximos 3 días.",
  rojo: "🔴 Vencido — tienes pendientes sin entregar cuya fecha ya pasó.",
};

// Solo el punto+texto del semáforo (sin "próxima entrega"): pieza mínima
// reutilizada tal cual por construirSemaforoPendientes() (que le agrega
// el bloque de próxima entrega debajo) y por el panel de Progreso de la
// portada (que en vez de eso agrega ahí mismo "Misión de hoy"/"Próximas
// entregas" como bloques propios — ver construirDashboardPendientes()).
function construirFilaSemaforo(estado) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "semaforo-progreso";
  tarjeta.dataset.estado = estado;

  const fila = document.createElement("div");
  fila.className = "semaforo-progreso__fila";
  const punto = document.createElement("span");
  punto.className = "semaforo-progreso__punto";
  punto.setAttribute("aria-hidden", "true");
  const texto = document.createElement("p");
  texto.className = "semaforo-progreso__texto";
  texto.textContent = TEXTO_SEMAFORO[estado];
  fila.append(punto, texto);
  tarjeta.appendChild(fila);

  return tarjeta;
}

// Semáforo (verde/amarillo/rojo) + "próxima entrega" del trimestre activo,
// sobre una lista ya filtrada de pendientes { tipo, item }. Capa de
// presentación pura: reutiliza obtenerPendientesOrdenados()/
// calcularEstadoSemaforo()/itemEstaVencido() en vez de recalcular
// vencimiento. "Próxima entrega" reutiliza el mismo par
// badge-estado[data-estado] (completada/pendiente/atrasada) que ya usa el
// detalle itemizado de abajo — colores fijos en :root, ya AA en los 10
// temas, sin necesidad de validarlos de nuevo aquí.
function construirSemaforoPendientes(pendientes, trimestre, grupo) {
  const conFecha = obtenerPendientesOrdenados(pendientes, grupo);
  const tarjeta = construirFilaSemaforo(calcularEstadoSemaforo(conFecha, grupo));

  // Próxima entrega: el/los pendiente(s) con la fecha ISO más próxima
  // (todos los que empatan, no solo uno) — conFecha ya viene ordenado
  // ascendente, así que el mínimo es el primero.
  if (conFecha.length > 0) {
    const minIso = conFecha[0].iso;
    const proximos = conFecha.filter(({ iso }) => iso === minIso);

    const bloqueProxima = document.createElement("div");
    bloqueProxima.className = "semaforo-progreso__proxima";

    const tituloProxima = document.createElement("p");
    tituloProxima.className = "semaforo-progreso__proxima-titulo";
    tituloProxima.textContent =
      proximos.length === 1 ? "Próxima entrega" : "Próximas entregas (misma fecha)";
    bloqueProxima.appendChild(tituloProxima);

    const lista = document.createElement("ul");
    lista.className = "panel-progreso__lista";
    proximos.forEach(({ tipo, item, iso }) => {
      const fila = document.createElement("li");
      fila.className = "panel-progreso__item";

      const tituloItem = document.createElement("span");
      tituloItem.className = "panel-progreso__item-titulo";
      tituloItem.textContent = item.titulo;
      fila.appendChild(tituloItem);

      const badge = document.createElement("span");
      badge.className = "badge-estado";
      badge.dataset.estado = itemEstaVencido(tipo, item, grupo) ? "atrasada" : "pendiente";
      badge.textContent = formatearFecha(iso);
      fila.appendChild(badge);

      const enlace = document.createElement("a");
      enlace.href = enlacePendiente(trimestre, tipo, item.id);
      enlace.className = "panel-progreso__item-enlace";
      enlace.textContent = ETIQUETAS_ENLACE_ITEM[tipo];
      fila.appendChild(enlace);

      lista.appendChild(fila);
    });
    bloqueProxima.appendChild(lista);
    tarjeta.appendChild(bloqueProxima);
  }

  return tarjeta;
}

// "Misión de hoy" (el pendiente más urgente, destacado) + "Próximas
// entregas" (hasta 4, la MISMA lista ordenada — el primer elemento es el
// mismo ítem que "Misión de hoy", sin recalcularlo aparte) para el panel
// de Progreso de la portada. conFecha ya viene ordenado ascendente por
// obtenerPendientesOrdenados().
function construirDashboardPendientes(conFecha, trimestre, grupo) {
  const contenedor = document.createDocumentFragment();

  if (conFecha.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "progreso-sin-pendientes";
    vacio.textContent = "🎉 No tienes pendientes en este trimestre. ¡Sigue así!";
    contenedor.appendChild(vacio);
    return contenedor;
  }

  const primero = conFecha[0];

  const mision = document.createElement("div");
  mision.className = "mision-de-hoy";

  const etiqueta = document.createElement("p");
  etiqueta.className = "mision-de-hoy__etiqueta";
  etiqueta.textContent = "🎯 Misión de hoy";

  const tituloMision = document.createElement("p");
  tituloMision.className = "mision-de-hoy__titulo";
  tituloMision.textContent = primero.item.titulo;

  const fechaMision = document.createElement("p");
  fechaMision.className = "mision-de-hoy__fecha";
  fechaMision.textContent = "Vence: " + formatearFecha(primero.iso);

  const boton = document.createElement("a");
  boton.className = "mision-de-hoy__boton";
  boton.href = enlacePendiente(trimestre, primero.tipo, primero.item.id);
  boton.textContent = ETIQUETAS_ENLACE_ITEM[primero.tipo];

  mision.append(etiqueta, tituloMision, fechaMision, boton);
  contenedor.appendChild(mision);

  const proximas = document.createElement("div");
  proximas.className = "proximas-entregas";

  const tituloProximas = document.createElement("p");
  tituloProximas.className = "proximas-entregas__titulo";
  tituloProximas.textContent = "Próximas entregas";
  proximas.appendChild(tituloProximas);

  const lista = document.createElement("ul");
  lista.className = "panel-progreso__lista";
  conFecha.slice(0, 4).forEach(({ tipo, item, iso }) => {
    const fila = document.createElement("li");
    fila.className = "panel-progreso__item";

    const tituloItem = document.createElement("span");
    tituloItem.className = "panel-progreso__item-titulo";
    tituloItem.textContent = item.titulo;
    fila.appendChild(tituloItem);

    const badge = document.createElement("span");
    badge.className = "badge-estado";
    badge.dataset.estado = itemEstaVencido(tipo, item, grupo) ? "atrasada" : "pendiente";
    badge.textContent = formatearFecha(iso);
    fila.appendChild(badge);

    const enlace = document.createElement("a");
    enlace.href = enlacePendiente(trimestre, tipo, item.id);
    enlace.className = "panel-progreso__item-enlace";
    enlace.textContent = ETIQUETAS_ENLACE_ITEM[tipo];
    fila.appendChild(enlace);

    lista.appendChild(fila);
  });
  proximas.appendChild(lista);
  contenedor.appendChild(proximas);

  return contenedor;
}

// Accesos rápidos del panel de Progreso de la portada: Temario vive en
// Teoría (trimestre-N.html), los otros 3 en Práctica
// (trimestre-N-practica.html) — ver división Teoría/Práctica de esas
// páginas (Fase 7). "trimestre" es trimestreDesbloqueado (el trimestre
// realmente activo del alumno), no ultimoTrimestreVisto.
const ACCESOS_RAPIDOS_PROGRESO = [
  { icono: "📘", titulo: "Temario", descripcion: "Repasa los temas de este trimestre.", practica: false, ancla: "temario" },
  { icono: "📝", titulo: "Tareas", descripcion: "Revisa tus pendientes.", practica: true, ancla: "tareas" },
  { icono: "🚀", titulo: "Proyectos", descripcion: "Consulta tus proyectos en curso.", practica: true, ancla: "proyectos" },
  { icono: "📤", titulo: "Entregar", descripcion: "Sube tu siguiente trabajo.", practica: true, ancla: "entrega" },
];

function construirAccesosRapidos(trimestre) {
  const grid = document.createElement("div");
  grid.className = "accesos-rapidos";

  ACCESOS_RAPIDOS_PROGRESO.forEach(({ icono, titulo, descripcion, practica, ancla }) => {
    const tarjeta = document.createElement("a");
    tarjeta.className = "accesos-rapidos__tarjeta";
    tarjeta.href = "trimestre-" + trimestre + (practica ? "-practica" : "") + ".html#" + ancla;

    const iconoEl = document.createElement("span");
    iconoEl.className = "accesos-rapidos__icono";
    iconoEl.setAttribute("aria-hidden", "true");
    iconoEl.textContent = icono;

    const tituloEl = document.createElement("p");
    tituloEl.className = "accesos-rapidos__titulo";
    tituloEl.textContent = titulo;

    const descripcionEl = document.createElement("p");
    descripcionEl.className = "accesos-rapidos__descripcion";
    descripcionEl.textContent = descripcion;

    tarjeta.append(iconoEl, tituloEl, descripcionEl);
    grid.appendChild(tarjeta);
  });

  return grid;
}

async function renderizarProgresoDetallado() {
  const sinPerfil = document.getElementById("progreso-sin-perfil");
  const conPerfil = document.getElementById("progreso-con-perfil");
  if (!sinPerfil || !conPerfil) return;

  const perfil = obtenerPerfilActivo();
  sinPerfil.hidden = Boolean(perfil);
  conPerfil.hidden = !perfil;
  if (!perfil) return;

  // Detalle itemizado por trimestre: SOLO existe en progreso.html. Este
  // guard debe correr ANTES de tocar mensaje/resumen-general, no después:
  // ambos ids también los llena renderizarProgreso() en la portada (que
  // además le agrega el semáforo/"Misión de hoy"/"Próximas entregas"/
  // "Accesos rápidos" propios de índex.html) — si esta función siguiera
  // de largo aquí, su innerHTML = "" de más abajo podría BORRAR ese
  // contenido en la carrera entre los dos renderizarTodo() (Promise.all
  // no garantiza orden de resolución entre ambas funciones).
  const detalle = document.getElementById("progreso-detalle-trimestres");
  if (!detalle) return;

  const nombreEl = document.getElementById("progreso-alumno-nombre");
  const grupoEl = document.getElementById("progreso-alumno-grupo");
  if (nombreEl) nombreEl.textContent = perfil.nombre;
  if (grupoEl) grupoEl.textContent = textoGrupo(perfil.grupo);

  const { porTrimestre, totalGeneral, completadasGeneral } = await calcularProgresoDetalladoPorTrimestre(perfil);

  // Resuelto ANTES de tocar el DOM — mismo motivo que en renderizarProgreso():
  // con la promesa ya resuelta aquí, el tramo de abajo (incluido el semáforo)
  // queda como un solo bloque síncrono, sin hueco donde un renderizarTodo()
  // concurrente pueda intercalar su propio innerHTML="" y duplicar contenido.
  const tarjetaRacha = await construirTarjetaRachaPuntualidad();
  const { tarjetaConteo: tarjetaConteoAsistencia, tarjetaRacha: tarjetaRachaAsistencia } =
    await construirResumenAsistenciaProgreso(String(trimestreDesbloqueado));

  const porcentaje = totalGeneral === 0 ? 0 : Math.round((completadasGeneral / totalGeneral) * 100);

  const mensaje = document.getElementById("progreso-mensaje");
  if (mensaje) {
    mensaje.textContent = MENSAJES_MOTIVACIONALES[completadasGeneral % MENSAJES_MOTIVACIONALES.length];
  }

  const resumen = document.getElementById("progreso-resumen-general");
  if (resumen) {
    resumen.innerHTML = "";
    const texto = document.createElement("p");
    texto.className = "resumen-progreso__texto";
    texto.textContent =
      completadasGeneral + " de " + totalGeneral + " tareas, actividades y proyectos completados";

    const barra = document.createElement("div");
    barra.className = "barra-progreso";
    barra.setAttribute("role", "progressbar");
    barra.setAttribute("aria-valuenow", String(completadasGeneral));
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", String(totalGeneral));
    barra.setAttribute("aria-label", "Progreso general del alumno identificado");
    const relleno = document.createElement("div");
    relleno.className = "barra-progreso__relleno";
    relleno.style.width = porcentaje + "%";
    barra.appendChild(relleno);

    resumen.append(texto, barra, construirListaExamenDiagnostico(perfil));

    if (tarjetaRacha) resumen.appendChild(tarjetaRacha);

    const tarjetaNivel = construirTarjetaNivel(porcentaje);
    if (tarjetaNivel) resumen.appendChild(tarjetaNivel);

    if (tarjetaConteoAsistencia) resumen.appendChild(tarjetaConteoAsistencia);
    if (tarjetaRachaAsistencia) resumen.appendChild(tarjetaRachaAsistencia);
  }

  // Semáforo de pendientes + próxima entrega (guard de "solo progreso.html"
  // ya aplicado arriba, antes de tocar mensaje/resumen-general). Usa
  // trimestreDesbloqueado (el trimestre realmente activo, no
  // ultimoTrimestreVisto) sobre porTrimestre, que ya viene filtrado por
  // el grupo del alumno.
  if (resumen) {
    const trimestreActivo = String(trimestreDesbloqueado);
    const entradaActiva = porTrimestre.find((p) => p.trimestre === trimestreActivo);
    if (entradaActiva) {
      const pendientes = [
        ...entradaActiva.tareas.map((item) => ({ tipo: "tarea", item })),
        ...entradaActiva.actividades.map((item) => ({ tipo: "actividad", item })),
        ...entradaActiva.proyectos.map((item) => ({ tipo: "proyecto", item })),
      ].filter(({ tipo, item }) => !itemEstaCompletado(tipo, item.id, trimestreActivo));

      resumen.appendChild(construirSemaforoPendientes(pendientes, trimestreActivo, perfil.grupo));
    }
  }

  detalle.innerHTML = "";
  // TRIMESTRE_ACTUAL es null aquí (esta página no tiene <body
  // data-trimestre>), así que se abre por defecto el último trimestre
  // visto en vez del "actual" de la página.
  const trimestreParaAbrir = TRIMESTRE_ACTUAL || ultimoTrimestreVisto;

  porTrimestre.forEach(({ trimestre, tareas, actividades, proyectos, total, completadas }) => {
    if (Number(trimestre) > trimestreDesbloqueado) {
      const panelBloqueado = document.createElement("div");
      panelBloqueado.className = "panel-progreso__trimestre panel-progreso__trimestre--bloqueado tarjeta";

      const resumenBloqueado = document.createElement("div");
      resumenBloqueado.className = "panel-progreso__trimestre-resumen";

      const tituloBloqueado = document.createElement("h3");
      tituloBloqueado.textContent = "Trimestre " + trimestre + " ";
      const candadoBloqueado = document.createElement("span");
      candadoBloqueado.className = "panel-progreso__trimestre-candado";
      candadoBloqueado.setAttribute("aria-hidden", "true");
      candadoBloqueado.textContent = "🔒";
      tituloBloqueado.appendChild(candadoBloqueado);

      const mensajeBloqueado = document.createElement("p");
      mensajeBloqueado.textContent = "Se desbloqueará cuando tu profesor lo habilite.";

      resumenBloqueado.append(tituloBloqueado, mensajeBloqueado);
      panelBloqueado.appendChild(resumenBloqueado);
      detalle.appendChild(panelBloqueado);
      return;
    }

    const panel = document.createElement("details");
    panel.className = "panel-progreso__trimestre tarjeta";
    if (trimestre === trimestreParaAbrir) panel.open = true;

    const resumenTab = document.createElement("summary");
    resumenTab.className = "panel-progreso__trimestre-resumen";

    const tituloTab = document.createElement("h3");
    tituloTab.textContent = "Trimestre " + trimestre;

    const conteoTab = document.createElement("p");
    conteoTab.textContent =
      total === 0
        ? "Sin tareas, actividades ni proyectos registrados todavía."
        : completadas + " de " + total + " completadas";

    const barraTab = document.createElement("div");
    barraTab.className = "barra-progreso";
    barraTab.setAttribute("role", "progressbar");
    barraTab.setAttribute("aria-valuenow", String(completadas));
    barraTab.setAttribute("aria-valuemin", "0");
    barraTab.setAttribute("aria-valuemax", String(total));
    barraTab.setAttribute("aria-label", "Progreso del Trimestre " + trimestre);
    const rellenoTab = document.createElement("div");
    rellenoTab.className = "barra-progreso__relleno";
    rellenoTab.style.width = (total === 0 ? 0 : Math.round((completadas / total) * 100)) + "%";
    barraTab.appendChild(rellenoTab);

    const iconoTab = document.createElement("span");
    iconoTab.className = "panel-progreso__trimestre-icono";
    iconoTab.setAttribute("aria-hidden", "true");
    iconoTab.textContent = "▾";

    resumenTab.append(tituloTab, conteoTab, barraTab, iconoTab);
    panel.appendChild(resumenTab);

    [
      { tipo: "tarea", etiqueta: "Tareas", items: tareas },
      { tipo: "actividad", etiqueta: "Actividades", items: actividades },
      { tipo: "proyecto", etiqueta: "Proyectos", items: proyectos },
    ].forEach(({ tipo, etiqueta, items }) => {
      if (items.length === 0) return;

      const subtitulo = document.createElement("h4");
      subtitulo.textContent = etiqueta;
      panel.appendChild(subtitulo);

      const lista = document.createElement("ul");
      lista.className = "panel-progreso__lista";

      items.forEach((item) => {
        const completado = itemEstaCompletado(tipo, item.id, trimestre);
        const fila = document.createElement("li");
        fila.className = "panel-progreso__item";

        const tituloItem = document.createElement("span");
        tituloItem.className = "panel-progreso__item-titulo";
        tituloItem.textContent = item.titulo;
        fila.appendChild(tituloItem);

        const badge = document.createElement("span");
        badge.className = "badge-estado";
        badge.dataset.estado = completado ? "completada" : "pendiente";
        badge.textContent = completado ? "✅ Completada" : "⏳ Pendiente";
        fila.appendChild(badge);

        if (!completado) {
          const enlace = document.createElement("a");
          enlace.href = enlacePendiente(trimestre, tipo, item.id);
          enlace.className = "panel-progreso__item-enlace";
          enlace.textContent = ETIQUETAS_ENLACE_ITEM[tipo];
          fila.appendChild(enlace);
        }

        // Fecha resuelta con el grupo del ALUMNO IDENTIFICADO (perfil.grupo),
        // no grupoActual: son conceptos independientes (ver
        // coincideConGrupoDelAlumno más arriba en esta misma función).
        const valorFecha = tipo === "actividad" ? item.fecha : item.fechaEntrega;
        const fechaItem = document.createElement("span");
        fechaItem.className = "panel-progreso__item-fecha";
        fechaItem.textContent = "Entrega: " + resolverFechaItem(valorFecha, perfil.grupo);
        fila.appendChild(fechaItem);

        lista.appendChild(fila);
      });

      panel.appendChild(lista);
    });

    detalle.appendChild(panel);
  });
}

// Texto de estado para la vista de impresión: mismo criterio de 3 estados
// que crearChecklistProgreso() (🟢 Entregado / 🟡 Pendiente / 🔒 Vencido),
// pero como texto plano sin badge de color — una impresora en blanco y
// negro no distingue el color de fondo del badge.
function textoEstadoImpresion(tipo, item, trimestre, perfil) {
  if (itemEstaCompletado(tipo, item.id, trimestre)) return "🟢 Entregado";
  if (itemEstaVencido(tipo, item, perfil.grupo)) return "🔒 Vencido";
  return "🟡 Pendiente";
}

// Vista de impresión del progreso personal (botón "🖨️ Imprimir mi
// resumen" en progreso.html): reutiliza calcularProgresoDetalladoPor
// Trimestre() (misma data que ya arma renderizarProgresoDetallado()) para
// llenar el contenedor estático #plantilla-impresion-progreso con una
// tabla plana por trimestre — sin barras de progreso animadas ni badges
// de nivel/racha de gamificación, que no aportan nada en papel — y
// dispara window.print(). La plantilla solo se muestra en @media print
// (ver css/style.css); en pantalla normal permanece oculta, igual que
// #calificacion-impresion-por-tipo en el panel docente.
async function generarVistaImpresionProgreso() {
  const perfil = obtenerPerfilActivo();
  if (!perfil) return;

  const contenedor = document.getElementById("plantilla-impresion-progreso");
  if (!contenedor) return;

  const { porTrimestre } = await calcularProgresoDetalladoPorTrimestre(perfil);

  contenedor.innerHTML = "";

  const encabezado = document.createElement("div");
  encabezado.className = "impresion-progreso__encabezado";

  const titulo = document.createElement("h2");
  titulo.textContent = perfil.nombre + " — " + textoGrupo(perfil.grupo);

  const fecha = document.createElement("p");
  fecha.textContent =
    "Generado el " +
    new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

  encabezado.append(titulo, fecha);
  contenedor.appendChild(encabezado);

  const SECCIONES_POR_TIPO = [
    { tipo: "tarea", etiqueta: "Tareas" },
    { tipo: "actividad", etiqueta: "Actividades" },
    { tipo: "proyecto", etiqueta: "Proyectos" },
  ];

  porTrimestre.forEach(({ trimestre, tareas, actividades, proyectos, total, completadas }) => {
    const bloque = document.createElement("section");
    bloque.className = "impresion-progreso__trimestre";

    const tituloTrimestre = document.createElement("h3");
    tituloTrimestre.textContent = "Trimestre " + trimestre;
    bloque.appendChild(tituloTrimestre);

    const itemsPorTipo = { tarea: tareas, actividad: actividades, proyecto: proyectos };

    SECCIONES_POR_TIPO.forEach(({ tipo, etiqueta }) => {
      const items = itemsPorTipo[tipo];
      if (items.length === 0) return;

      const subtitulo = document.createElement("h4");
      subtitulo.textContent = etiqueta;
      bloque.appendChild(subtitulo);

      const tabla = document.createElement("table");
      tabla.className = "impresion-progreso__tabla";

      const encabezadoTabla = document.createElement("thead");
      const filaEncabezado = document.createElement("tr");
      ["Título", "Fecha límite", "Estado"].forEach((texto) => {
        const celda = document.createElement("th");
        celda.textContent = texto;
        filaEncabezado.appendChild(celda);
      });
      encabezadoTabla.appendChild(filaEncabezado);
      tabla.appendChild(encabezadoTabla);

      const cuerpo = document.createElement("tbody");
      items.forEach((item) => {
        const fila = document.createElement("tr");

        const celdaTitulo = document.createElement("td");
        celdaTitulo.textContent = item.titulo;

        const valorFecha = tipo === "actividad" ? item.fecha : item.fechaEntrega;
        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = resolverFechaItem(valorFecha, perfil.grupo);

        const celdaEstado = document.createElement("td");
        celdaEstado.textContent = textoEstadoImpresion(tipo, item, trimestre, perfil);

        fila.append(celdaTitulo, celdaFecha, celdaEstado);
        cuerpo.appendChild(fila);
      });
      tabla.appendChild(cuerpo);
      bloque.appendChild(tabla);
    });

    const resumen = document.createElement("p");
    resumen.className = "impresion-progreso__resumen";
    resumen.textContent = completadas + " de " + total + " completadas";
    bloque.appendChild(resumen);

    contenedor.appendChild(bloque);
  });

  window.print();
}

// Engancha el botón "🖨️ Imprimir mi resumen" de progreso.html — no hace
// nada en el resto de páginas (el botón no existe ahí).
function activarBotonImprimirProgreso() {
  const boton = document.getElementById("boton-imprimir-progreso");
  if (boton) boton.addEventListener("click", generarVistaImpresionProgreso);
}

// Filtro "Todos / Bloque 1/2/3" de la tabla de materiales de manualidades
// (index.html, #lista-materiales). Mismo patrón visual y de comportamiento
// que .calificacion-tabs-tipo en admin.html (ver activarTabsTipoCalificacion(),
// sección 12): tabs con conteo dinámico "(N)" y oculta/muestra <tr> en vez
// de quitarlas del DOM, para no romper accesibilidad. Las filas con más de
// un bloque en su "Uso principal" (ej. Cartulinas de colores: B1+B2+B3)
// llevan varios valores en data-bloque separados por coma y aparecen bajo
// cada uno de esos tabs, no solo el primero.
function activarTabsMateriales() {
  const contenedorTabs = document.getElementById("materiales-tabs-bloque");
  if (!contenedorTabs) return;

  const tabs = Array.from(contenedorTabs.querySelectorAll(".materiales-tabs-bloque__boton"));
  const filas = Array.from(document.querySelectorAll("#tabla-materiales-manualidades tbody tr"));

  function bloquesDeFila(fila) {
    return (fila.dataset.bloque || "").split(",").map((valor) => valor.trim()).filter(Boolean);
  }

  // Se recalcula desde las filas reales (no un número fijo) para que, si
  // el contenido de la tabla cambia más adelante, los conteos sigan
  // correctos sin tener que tocar esta función — mismo criterio que
  // actualizarConteosTabsTipo() en el panel de calificación.
  function actualizarConteos() {
    const conteos = { todos: filas.length };
    filas.forEach((fila) => {
      bloquesDeFila(fila).forEach((bloque) => {
        conteos[bloque] = (conteos[bloque] || 0) + 1;
      });
    });
    tabs.forEach((tab) => {
      const contador = tab.querySelector(".materiales-tabs-bloque__contador");
      if (contador) contador.textContent = "(" + (conteos[tab.dataset.bloque] || 0) + ")";
    });
  }

  function aplicarFiltro(bloque) {
    filas.forEach((fila) => {
      fila.hidden = bloque !== "todos" && !bloquesDeFila(fila).includes(bloque);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((otro) => {
        const activo = otro === tab;
        otro.classList.toggle("materiales-tabs-bloque__boton--activo", activo);
        otro.setAttribute("aria-selected", String(activo));
      });
      aplicarFiltro(tab.dataset.bloque);
    });
  });

  actualizarConteos();
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

// Búsqueda O(1) de "qué tipo de día es" a partir de CALENDARIO_ESCOLAR_2026_2027.
const TIPOS_DIA_POR_FECHA = new Map(
  CALENDARIO_ESCOLAR_2026_2027.map((registro) => [registro.fecha, registro])
);

// Etiqueta genérica de respaldo por si un registro no trae "etiqueta"
// propia (el campo es opcional en el formato de datos).
const ETIQUETAS_TIPO_DIA = {
  inicio: "Inicio de clases",
  fin: "Fin de clases",
  vacaciones: "Vacaciones",
  "cte-intensiva": "CTE Fase Intensiva (sin clases)",
  "cte-ordinaria": "CTE Sesión Ordinaria (sin clases)",
  suspension: "Suspensión de labores",
  evaluacion: "Evaluación",
};

// Ciclo escolar SEP 2026-2027: agosto 2026 a julio 2027. "mes" usa el
// mismo índice 0-11 que Date#getMonth (7 = agosto, 6 = julio).
const CICLO_ESCOLAR = {
  inicio: { anio: 2026, mes: 7 },
  fin: { anio: 2027, mes: 6 },
};

function claveMes(anio, mes) {
  return anio * 12 + mes;
}

function estaDentroDelCicloEscolar(anio, mes) {
  const clave = claveMes(anio, mes);
  return (
    clave >= claveMes(CICLO_ESCOLAR.inicio.anio, CICLO_ESCOLAR.inicio.mes) &&
    clave <= claveMes(CICLO_ESCOLAR.fin.anio, CICLO_ESCOLAR.fin.mes)
  );
}

// Mes/año que el widget de calendario muestra actualmente. Empieza en el
// mes real de hoy si cae dentro del ciclo escolar; si no (por ejemplo,
// viendo el sitio antes de que inicie el ciclo), empieza en agosto 2026.
const hoyParaCalendario = new Date();
let anioVisible = hoyParaCalendario.getFullYear();
let mesVisible = hoyParaCalendario.getMonth();
if (!estaDentroDelCicloEscolar(anioVisible, mesVisible)) {
  anioVisible = CICLO_ESCOLAR.inicio.anio;
  mesVisible = CICLO_ESCOLAR.inicio.mes;
}

// Habilita/deshabilita (de verdad, no solo visualmente) las flechas de
// navegación cuando el mes visible ya está en un extremo del ciclo.
function actualizarBotonesNavegacionCalendario() {
  const anterior = document.getElementById("calendario-mes-anterior");
  const siguiente = document.getElementById("calendario-mes-siguiente");
  if (!anterior || !siguiente) return;

  const mesAnteriorClave = claveMes(anioVisible, mesVisible) - 1;
  const mesSiguienteClave = claveMes(anioVisible, mesVisible) + 1;
  const inicioClave = claveMes(CICLO_ESCOLAR.inicio.anio, CICLO_ESCOLAR.inicio.mes);
  const finClave = claveMes(CICLO_ESCOLAR.fin.anio, CICLO_ESCOLAR.fin.mes);

  anterior.disabled = mesAnteriorClave < inicioClave;
  siguiente.disabled = mesSiguienteClave > finClave;
}

// Mueve el mes visible +1/-1, sin salirse del ciclo escolar, y vuelve a
// pintar la cuadrícula (reutiliza renderizarCalendario tal cual, solo
// que ahora lee anioVisible/mesVisible en vez de la fecha de hoy).
function avanzarMesCalendario(delta) {
  let nuevoMes = mesVisible + delta;
  let nuevoAnio = anioVisible;
  if (nuevoMes < 0) {
    nuevoMes = 11;
    nuevoAnio -= 1;
  } else if (nuevoMes > 11) {
    nuevoMes = 0;
    nuevoAnio += 1;
  }

  if (!estaDentroDelCicloEscolar(nuevoAnio, nuevoMes)) return;

  mesVisible = nuevoMes;
  anioVisible = nuevoAnio;
  renderizarCalendario();
}

async function renderizarCalendario() {
  const cabecera = document.getElementById("calendario-cabecera");
  if (!cabecera) return;

  const eventos = (await obtenerEventos()).filter(elementoCoincideConGrupo);
  const hoy = new Date();

  // --- Cabecera con mes y año visibles (no siempre son los de "hoy") ---
  const primerDiaDelMes = new Date(anioVisible, mesVisible, 1);
  const nombreMes = primerDiaDelMes.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  const nombreMesSolo = primerDiaDelMes.toLocaleDateString("es-MX", { month: "long" });
  cabecera.textContent = nombreMes;

  // --- Cuadrícula del mes visible ---
  const grid = document.getElementById("calendario-grid");
  grid.innerHTML = "";

  NOMBRES_DIA.forEach((nombre) => {
    const celda = document.createElement("div");
    celda.className = "calendario__dia-nombre";
    celda.textContent = nombre;
    grid.appendChild(celda);
  });

  const primerDiaSemana = primerDiaDelMes.getDay();
  const diasEnMes = new Date(anioVisible, mesVisible + 1, 0).getDate();
  const clavesConEvento = new Set(eventos.map((evento) => evento.fecha));
  const claveHoy = formatearClaveFecha(hoy);

  for (let i = 0; i < primerDiaSemana; i++) {
    const vacio = document.createElement("div");
    vacio.className = "calendario__dia calendario__dia--vacio";
    grid.appendChild(vacio);
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const claveDia = formatearClaveFecha(new Date(anioVisible, mesVisible, dia));
    const celda = document.createElement("div");
    celda.className = "calendario__dia";
    celda.setAttribute("role", "gridcell");
    celda.textContent = String(dia);

    // Solo coincide con "hoy" cuando el mes visible es el mes real
    // actual: claveDia se arma con anioVisible/mesVisible, claveHoy con
    // la fecha real, así que esto ya queda resuelto por comparación.
    if (claveDia === claveHoy) {
      celda.classList.add("calendario__dia--hoy");
    }

    const tieneEvento = clavesConEvento.has(claveDia);
    if (tieneEvento) {
      celda.classList.add("calendario__dia--evento");
    }

    // Tipo de día del ciclo escolar (vacaciones, CTE, etc.): coexiste
    // con el punto de evento de arriba, no lo reemplaza.
    const registroTipo = TIPOS_DIA_POR_FECHA.get(claveDia);
    if (registroTipo) {
      celda.classList.add("calendario__dia--" + registroTipo.tipo);
      const etiquetaTipo =
        registroTipo.etiqueta || ETIQUETAS_TIPO_DIA[registroTipo.tipo] || registroTipo.tipo;
      celda.title = etiquetaTipo;
      celda.setAttribute(
        "aria-label",
        dia + " de " + nombreMesSolo + ": " + etiquetaTipo + (tieneEvento ? " (con fecha entregable)" : "")
      );
    }

    grid.appendChild(celda);
  }

  actualizarBotonesNavegacionCalendario();

  // --- Lista de próximas fechas (incluye meses futuros) ---
  const lista = document.getElementById("lista-eventos");
  lista.innerHTML = "";

  const proximos = eventos
    .filter((evento) => new Date(evento.fecha + "T00:00:00") >= new Date(claveHoy + "T00:00:00"))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  if (proximos.length === 0) {
    mostrarSinResultados(lista, "No hay próximas fechas para este grupo.", "📅");
    return;
  }

  proximos.forEach((evento) => {
    const fecha = new Date(evento.fecha + "T00:00:00");
    const item = document.createElement("li");
    item.className = "evento-item";
    // Consumido por aplicarFiltroTipoEventos() (Cambio 3): oculta/muestra
    // este <li> sin volver a pedir los eventos ni reconstruir la lista.
    item.dataset.tipo = evento.tipo;

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
    info.append(titulo, grupoTexto, crearBadgeTipoEvento(evento.tipo));

    item.append(fechaBox, info);
    lista.appendChild(item);
  });

  aplicarFiltroTipoEventos();
}

// Filtro por tipo (Cambio 3): oculta/muestra los <li class="evento-item">
// YA renderizados sin volver a pedir los eventos — mismo criterio que
// aplicarFiltro() de activarTabsMateriales(). Se vuelve a llamar al final
// de cada renderizarCalendario() (cambio de mes/grupo) para que el filtro
// activo sobreviva a la reconstrucción de la lista.
let filtroTipoEventoActivo = "todos";

function aplicarFiltroTipoEventos() {
  const lista = document.getElementById("lista-eventos");
  if (!lista) return;

  const items = Array.from(lista.querySelectorAll(".evento-item"));
  let mensajeVacio = lista.querySelector("[data-filtro-vacio]");

  // Sin items reales que filtrar (grupo sin próximas fechas): ya lo cubre
  // mostrarSinResultados() más arriba, no hay nada que hacer aquí.
  if (items.length === 0) {
    mensajeVacio?.remove();
    return;
  }

  let visibles = 0;
  items.forEach((item) => {
    const visible = filtroTipoEventoActivo === "todos" || item.dataset.tipo === filtroTipoEventoActivo;
    item.hidden = !visible;
    if (visible) visibles++;
  });

  if (visibles === 0) {
    if (!mensajeVacio) {
      mensajeVacio = document.createElement("p");
      mensajeVacio.className = "sin-resultados";
      mensajeVacio.dataset.filtroVacio = "true";
      mensajeVacio.textContent = "No hay próximas fechas de este tipo.";
      lista.appendChild(mensajeVacio);
    }
  } else {
    mensajeVacio?.remove();
  }
}

function activarFiltroTipoEventos() {
  const contenedorTabs = document.getElementById("calendario-tabs-tipo");
  if (!contenedorTabs) return;

  const tabs = Array.from(contenedorTabs.querySelectorAll(".calendario-tabs-tipo__boton"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((otro) => {
        const activo = otro === tab;
        otro.classList.toggle("calendario-tabs-tipo__boton--activo", activo);
        otro.setAttribute("aria-selected", String(activo));
      });
      filtroTipoEventoActivo = tab.dataset.tipo;
      aplicarFiltroTipoEventos();
    });
  });
}

/* ---------------------------------------------------------
   Toast de confirmación visual — genérico y reutilizable: no es un
   modal (no bloquea nada, no roba el foco), solo confirma que una
   acción sin resultado visible en pantalla sí surtió efecto. Pila de
   hasta 3 toasts simultáneos (límite en Commit 2, ver más abajo);
   #contenedor-toast vive en las 9 páginas del sitio, anclado
   arriba-derecha — el toast más nuevo se inserta como primer hijo, así
   que queda visualmente arriba de la pila.
   4 variantes por color (ver --color-toast-* en css/style.css):
   "exito" (mostrarToast, usado en tema/grupo), "carga" (mostrarToastCarga,
   persistente hasta que actualizarToastCarga lo cambie), "error" (solo
   vía actualizarToastCarga, con botón "Reintentar" opcional) y
   "advertencia" (mostrarToastAdvertencia, aún sin conectar a nada).
   Todas comparten crearYMostrarToast()/agendarAutodesaparicion() para no
   repetir la mecánica de pila/entrada/salida.

   ARIA con varios toasts simultáneos: #contenedor-toast (HTML de cada
   página) es aria-live="polite" aria-atomic="false" — "false" porque
   con 3 toasts posibles, "true" reanunciaría el texto completo de LOS
   TRES cada vez que cualquiera cambia (se agrega/actualiza/se quita
   uno), ruidoso y confuso; "false" anuncia solo el nodo que cambió.
   role="alert" NO se pone en el contenedor ni en todos los toasts — se
   agrega SOLO al toast que llega a tipo "error" (ver
   actualizarToastCarga), el único caso que de verdad necesita
   interrumpir. Con 2-3 alert simultáneos, lectores de pantalla comunes
   no garantizan orden de anuncio y pueden cortarse entre sí; reservarlo
   para un caso raro (a lo sumo 1 toast de error suele estar visible a
   la vez) evita ese problema sin perder la interrupción donde importa.
   --------------------------------------------------------- */

// Toasts activos, Map<elementoDOM, registro>. Reemplaza al viejo
// "temporizadorToastActual" único: con varios toasts simultáneos cada
// uno necesita su propio timerId (autodesaparición independiente), y el
// Map permite confirmar en O(1) si una referencia DOM sigue siendo un
// toast vigente — lo usa actualizarToastCarga, que antes comparaba
// contra "el único toast" (contenedor.querySelector(".toast")), algo
// que ya no tiene sentido con varios a la vez.
const pilaToasts = new Map();

// Un solo listener de visibilitychange para TODO el sistema de toasts —
// no uno por toast: un listener puesto en "document" no muere solo
// cuando el toast que lo motivó se destruye (a diferencia de
// mouseenter/mouseleave en el propio elemento, que sí se recolectan con
// él), así que uno por toast se acumularía para siempre en la sesión.
// Guarda + registro único, mismo patrón que
// tooltipsDocumentListenerActivo en activarTooltipsInfo(). Recorre
// pilaToasts completa (no "el toast activo") porque hasta 3 pueden estar
// visibles a la vez (ver límite en crearYMostrarToast), cada uno con su
// propio timer independiente.
let listenerVisibilidadToastsActivo = false;
function activarPausaToastsPorVisibilidad() {
  if (listenerVisibilidadToastsActivo) return;
  listenerVisibilidadToastsActivo = true;
  document.addEventListener("visibilitychange", () => {
    for (const toast of pilaToasts.keys()) {
      const registro = pilaToasts.get(toast);
      registro.pausadoPorPestana = document.hidden;
      if (document.hidden) {
        pausarToastSiActivo(toast);
      } else {
        reanudarToastSiCorresponde(toast);
      }
    }
  });
}

// Pausa el setTimeout de salida de "toast" sin perder el tiempo ya
// transcurrido (resta lo corrido de msRestante) y pausa también la barra
// de progreso CSS (ver .toast--pausado en css/style.css). No-op si el
// toast no tiene timer corriendo: "carga" (persistente, sin
// agendarAutodesaparicion todavía) o uno que "Reintentar" ya canceló del
// todo (ver actualizarToastCarga) — msRestante queda null en esos casos,
// así que reanudarToastSiCorresponde tampoco revive nada por error.
function pausarToastSiActivo(toast) {
  const registro = pilaToasts.get(toast);
  if (!registro || registro.timerId === null) return;

  clearTimeout(registro.timerId);
  registro.timerId = null;
  registro.msRestante -= Date.now() - registro.inicioCuentaRegresiva;
  toast.classList.add("toast--pausado");
}

// Reanuda "toast" SOLO si ninguna de las dos causas de pausa sigue
// activa (ej. el mouse puede seguir encima cuando la pestaña vuelve a
// estar visible: debe seguir pausado hasta que también salga el mouse).
function reanudarToastSiCorresponde(toast) {
  const registro = pilaToasts.get(toast);
  if (!registro) return;
  if (registro.pausadoPorMouse || registro.pausadoPorPestana) return;
  if (registro.timerId !== null) return;
  if (registro.msRestante === null) return;

  toast.classList.remove("toast--pausado");
  iniciarCuentaRegresivaToast(toast, Math.max(registro.msRestante, 0));
}

// Arranca (o reinicia tras una pausa) el setTimeout de salida con "ms"
// restantes, guardando el instante de inicio para que
// pausarToastSiActivo pueda calcular cuánto faltaba si se pausa a medias.
function iniciarCuentaRegresivaToast(toast, ms) {
  const registro = pilaToasts.get(toast);
  if (!registro) return;
  registro.inicioCuentaRegresiva = Date.now();
  registro.timerId = setTimeout(() => ocultarYQuitarToast(toast), ms);
}

// Dispara la animación de salida y quita "toast" del DOM/pila. Único
// lugar con esta mecánica: la usan tanto la autodesaparición normal
// (agendarAutodesaparicion) como el descarte forzado por límite de pila
// (Commit 2) — ambos casos deben salir con la misma animación, nunca un
// remove() de golpe.
function ocultarYQuitarToast(toast) {
  toast.classList.add("toast--oculto");
  let yaQuitado = false;
  const quitarToast = () => {
    if (yaQuitado) return;
    yaQuitado = true;
    toast.remove();
    pilaToasts.delete(toast);
  };
  toast.addEventListener("transitionend", quitarToast, { once: true });
  // Respaldo por si "transitionend" no llega (pestaña en segundo
  // plano) — 250ms, más que los 200ms de la transición de salida.
  setTimeout(quitarToast, 250);
}

// Micro-feedback de que un toast duplicado se refrescó (colapsó) en vez
// de apilarse de nuevo: pulso breve de escala vía @keyframes (ver
// css/style.css, envuelto en @media prefers-reduced-motion:no-preference
// — con reduced-motion no pasa nada aquí, ninguna rama que manejar en
// JS). Quitar y reponer la clase con un reflow forzado en medio (mismo
// truco que "toast--oculto" en crearYMostrarToast) para que un segundo
// duplicado seguido también vuelva a pulsar, en vez de no-op porque la
// clase ya estaba puesta.
function pulsarToast(toast) {
  toast.classList.remove("toast--pulso");
  void toast.offsetWidth;
  toast.classList.add("toast--pulso");
}

// Arma e inserta el <div class="toast"> dentro de #contenedor-toast,
// como primer hijo (el contenedor está anclado arriba-derecha, así que
// el primer hijo es el que queda arriba de la pila — el más nuevo
// siempre entra ahí) y lo registra en pilaToasts. Compartido por todas
// las funciones mostrarToast*/actualizarToastCarga — el único lugar que
// toca el DOM del toast, para no duplicar esa mecánica. "spinner: true"
// pinta el anillo animado de carga en vez de un ícono de texto (ver
// mostrarToastCarga).
function crearYMostrarToast(tipo, mensaje, { icono = "", spinner = false } = {}) {
  const contenedor = document.getElementById("contenedor-toast");
  if (!contenedor) return null;

  activarPausaToastsPorVisibilidad();

  // Colapso de duplicados: mismo texto Y mismo tipo ya visible → no se
  // crea un nodo nuevo, solo un pulso visual. El llamador (mostrarToast/
  // mostrarToastAdvertencia) igual llama agendarAutodesaparicion() con
  // el elemento devuelto, que ya reinicia su timer — no hace falta
  // repetir esa lógica aquí. mostrarToastCarga() no tiene timer que
  // reiniciar, así que para "carga" el pulso es el único efecto, que es
  // exactamente "colapsar en vez de duplicarse".
  for (const [elementoExistente, registro] of pilaToasts) {
    if (registro.tipo === tipo && registro.mensaje === mensaje) {
      pulsarToast(elementoExistente);
      return elementoExistente;
    }
  }

  // Límite de 3 simultáneos: al llegar un 4º, se descarta el más
  // antiguo de la pila (el último hijo — el contenedor crece hacia
  // abajo, el más nuevo entra arriba) con su animación de salida normal
  // (ocultarYQuitarToast), nunca con un remove() de golpe. Sin excepción
  // para "carga": si el más antiguo resulta ser uno persistente, se
  // descarta igual.
  if (pilaToasts.size >= 3 && contenedor.lastElementChild) {
    ocultarYQuitarToast(contenedor.lastElementChild);
  }

  const toast = document.createElement("div");
  toast.className = "toast toast--oculto";
  toast.dataset.tipo = tipo;

  const iconoEl = document.createElement("span");
  iconoEl.setAttribute("aria-hidden", "true");
  if (spinner) {
    iconoEl.className = "toast__icono toast__spinner";
  } else {
    iconoEl.className = "toast__icono";
    iconoEl.textContent = icono;
  }

  const textoEl = document.createElement("span");
  textoEl.className = "toast__texto";
  textoEl.textContent = mensaje;

  toast.append(iconoEl, textoEl);
  contenedor.prepend(toast);
  pilaToasts.set(toast, {
    timerId: null,
    tipo,
    mensaje,
    msRestante: null,
    inicioCuentaRegresiva: null,
    pausadoPorMouse: false,
    pausadoPorPestana: false,
  });

  // Pausa/reanuda al pasar el mouse — directo sobre el elemento, no hace
  // falta limpiarlos explícitamente: cuando ocultarYQuitarToast() borra
  // "toast" de pilaToasts (la única referencia fuerte que quedaba) y lo
  // saca del DOM, nada más lo referencia y se recolecta junto con estos
  // listeners.
  toast.addEventListener("mouseenter", () => {
    const registro = pilaToasts.get(toast);
    if (!registro) return;
    registro.pausadoPorMouse = true;
    pausarToastSiActivo(toast);
  });
  toast.addEventListener("mouseleave", () => {
    const registro = pilaToasts.get(toast);
    if (!registro) return;
    registro.pausadoPorMouse = false;
    reanudarToastSiCorresponde(toast);
  });

  // Fuerza un reflow antes de quitar "toast--oculto": si se agrega y se
  // quita la clase en el mismo tick, el navegador nunca pinta el estado
  // inicial y la transición de entrada no se ve (salta directo al
  // final). Síncrono a propósito (no requestAnimationFrame): en una
  // pestaña en segundo plano el navegador puede suspender rAF
  // indefinidamente, y con eso la clase nunca llegaría a quitarse.
  void toast.offsetWidth;
  toast.classList.remove("toast--oculto");

  return toast;
}

// Programa la salida (fade-out) y el retiro del DOM de "toast" a los
// "ms" indicados — timer independiente por toast (pilaToasts guarda su
// propio timerId; ya no hay un solo temporizador global como antes de
// la pila).
//
// --duracion-toast + .toast--con-progreso: arrancan la barra de
// progreso (::after, css/style.css) con el MISMO "ms" que recibe este
// setTimeout — ambos empiezan en el mismo instante y duran lo mismo,
// así que la barra llega a 0 justo cuando el toast empieza a
// desvanecerse. Sin recalcular ni hardcodear nada: es el mismo "ms" que
// ya trae esta función (2.5s éxito/advertencia, 7s error).
function agendarAutodesaparicion(toast, ms) {
  const registro = pilaToasts.get(toast);
  if (registro?.timerId) clearTimeout(registro.timerId);
  if (!registro) return;

  toast.style.setProperty("--duracion-toast", ms + "ms");
  toast.classList.add("toast--con-progreso");
  registro.msRestante = ms;
  registro.timerId = null;

  // Si el mouse ya estaba encima o la pestaña ya estaba oculta cuando
  // este toast arrancó su cuenta (ej. actualizarToastCarga lo transiciona
  // de "carga" a "éxito" mientras el usuario lo está leyendo), arranca
  // pausado de una vez — reanudarToastSiCorresponde lo retoma solo
  // cuando termine esa pausa.
  if (registro.pausadoPorMouse || registro.pausadoPorPestana) {
    toast.classList.add("toast--pausado");
    return;
  }

  toast.classList.remove("toast--pausado");
  iniciarCuentaRegresivaToast(toast, ms);
}

// mensaje: texto corto de una sola línea. opciones.icono: string, por
// defecto "✅". Misma sensación de animación que los flyouts/sheets
// (opacity + translateY, 0.2s ease, ver css/style.css) — mismo timing
// ya usado en el sitio, no uno nuevo. Se autodesaparece a los 2.5s.
function mostrarToast(mensaje, opciones = {}) {
  const { icono = "✅" } = opciones;
  const toast = crearYMostrarToast("exito", mensaje, { icono });
  if (toast) agendarAutodesaparicion(toast, 2500);
}

// Toast persistente (sin temporizador propio) para operaciones en
// curso: se queda en pantalla hasta que actualizarToastCarga() lo
// cambie a "éxito" o "error". Retorna el elemento del toast — el
// llamador debe guardarlo y pasarlo tal cual a actualizarToastCarga().
function mostrarToastCarga(mensaje) {
  return crearYMostrarToast("carga", mensaje, { spinner: true });
}

// Actualiza un toast de carga ya visible a su resultado final.
// "referencia" es el elemento que devolvió mostrarToastCarga(): si ya
// no está en pilaToasts (se autodesapareció solo, o el límite de 3 lo
// descartó mientras la operación seguía en curso — Commit 2), no hace
// nada — nunca "resucita" un toast que ya salió. opciones: { tipo:
// "exito" | "error", mensaje, onReintentar } — onReintentar solo aplica
// con tipo "error" y es opcional; si se pasa, agrega un botón
// "Reintentar" con su propio pointer-events:auto (el contenedor entero
// tiene pointer-events:none). "éxito" se autodesaparece a los 2.5s,
// igual que mostrarToast(); "error" a los 7s, para dar tiempo a leer y
// decidir si reintentar.
//
// role="alert" SOLO aquí, SOLO para "error": es el único punto del
// módulo donde un toast llega a tipo "error" (crearYMostrarToast nunca
// recibe "error" directo — mostrarToast/mostrarToastCarga/
// mostrarToastAdvertencia no lo usan). Con hasta 3 toasts simultáneos,
// role="alert" en TODOS interrumpiría de forma impredecible (NVDA/
// VoiceOver no garantizan orden con varios alert a la vez, y pueden
// cortarse entre sí a media frase) — reservarlo para el único caso que
// de verdad necesita interrumpir. El resto queda cubierto por
// aria-live="polite" del contenedor (ver #contenedor-toast en el HTML
// de cada página), que ya anuncia en cola sin interrumpir.
function actualizarToastCarga(referencia, opciones) {
  const contenedor = document.getElementById("contenedor-toast");
  if (!contenedor || !referencia || !pilaToasts.has(referencia)) return;

  const { tipo, mensaje, onReintentar } = opciones;

  referencia.dataset.tipo = tipo;
  if (tipo === "error") {
    referencia.setAttribute("role", "alert");
  } else {
    referencia.removeAttribute("role");
  }
  Object.assign(pilaToasts.get(referencia), { tipo, mensaje });

  const iconoEl = referencia.querySelector(".toast__icono");
  if (iconoEl) {
    iconoEl.classList.remove("toast__spinner");
    iconoEl.textContent = tipo === "exito" ? "✅" : "❌";
  }

  const textoEl = referencia.querySelector(".toast__texto");
  if (textoEl) textoEl.textContent = mensaje;

  if (tipo === "error" && onReintentar) {
    const botonReintentar = document.createElement("button");
    botonReintentar.type = "button";
    botonReintentar.className = "toast__reintentar";
    botonReintentar.textContent = "Reintentar";
    botonReintentar.addEventListener("click", () => {
      // Cancela la autodesaparición pendiente: el resultado del
      // reintento (otro mostrarToastCarga/actualizarToastCarga) decide
      // qué pasa después, no este temporizador viejo. msRestante también
      // a null: si el mouse sigue encima y luego sale, no debe reanudar
      // solo una cuenta regresiva que ya se canceló del todo (ver
      // reanudarToastSiCorresponde).
      const registro = pilaToasts.get(referencia);
      if (registro?.timerId) {
        clearTimeout(registro.timerId);
        registro.timerId = null;
      }
      if (registro) registro.msRestante = null;
      referencia.classList.remove("toast--pausado");
      onReintentar();
    });
    referencia.appendChild(botonReintentar);
  }

  agendarAutodesaparicion(referencia, tipo === "error" ? 7000 : 2500);
}

// Simple, mensaje + ícono, mismo autodesaparecer de 2.5s que el éxito.
// Sin conectar a nada todavía.
function mostrarToastAdvertencia(mensaje, opciones = {}) {
  const { icono = "⚠️" } = opciones;
  const toast = crearYMostrarToast("advertencia", mensaje, { icono });
  if (toast) agendarAutodesaparicion(toast, 2500);
}

/* =========================================================
   7. SELECTOR DE TEMA (10 temas)
   ========================================================= */

// Los 10 temas del sitio (2 originales + 8 nuevos, ver css/style.css
// para los valores de cada uno). "nombre" trae el emoji al frente a
// propósito: aplicarTema() lo separa con split(" ") para usarlo como
// ícono del botón .boton-tema, y construirGridTemas() lo usa tal cual
// como etiqueta visible de cada tarjeta — un solo string cubre los dos
// usos sin duplicar el emoji en dos campos distintos.
const TEMAS_DISPONIBLES = [
  { slug: "claro", nombre: "☀️ Claro" },
  { slug: "oscuro", nombre: "🌙 Oscuro" },
  { slug: "arcade-neon", nombre: "🕹️ Arcade Neón" },
  { slug: "gamer-rgb", nombre: "🎮 Gamer RGB" },
  { slug: "cyberpunk-gold", nombre: "⚡ Cyberpunk Gold" },
  { slug: "galaxia", nombre: "🌌 Galaxia" },
  { slug: "rosa-pastel", nombre: "🌸 Rosa Pastel" },
  { slug: "bosque-calido", nombre: "🌿 Bosque Cálido" },
  { slug: "menta-tecnologico", nombre: "🧪 Menta Tecnológico" },
  { slug: "editorial-sepia", nombre: "☕ Editorial Sepia" },
  { slug: "atardecer-volcanico", nombre: "🌋 Atardecer Volcánico" },
  { slug: "laboratorio-ciencia", nombre: "🧬 Laboratorio de Ciencia" },
  { slug: "terminal-cian", nombre: "💻 Terminal Cian" },
];

// Los 4 que construirGridTemas() pinta siempre visibles en "⭐ Destacados";
// el resto de TEMAS_DISPONIBLES (en su mismo orden) cae en "Más temas",
// colapsado por default. Lista aparte a propósito — TEMAS_DISPONIBLES no
// cambia, esto solo decide el agrupamiento visual.
const SLUGS_TEMAS_DESTACADOS = ["claro", "oscuro", "gamer-rgb", "menta-tecnologico"];

// Fase 12: los 9 temas de recompensa (todo TEMAS_DISPONIBLES menos los 4
// Destacados, que nunca llevan candado) y en qué trimestre se desbloquea
// cada uno — 3 grupos de 3, en el mismo orden en que ya están declarados
// arriba. Un slug que NO aparece aquí (los 4 Destacados) nunca entra a la
// lógica de candado de crearTarjetaTema(), sin importar nada más.
const TRIMESTRE_POR_TEMA_RECOMPENSA = {
  "arcade-neon": 1,
  "cyberpunk-gold": 1,
  galaxia: 1,
  "rosa-pastel": 2,
  "bosque-calido": 2,
  "editorial-sepia": 2,
  "atardecer-volcanico": 3,
  "laboratorio-ciencia": 3,
  "terminal-cian": 3,
};

// "Temas de evento" (Navidad, y los que se agreguen después) —
// deliberadamente separados de TEMAS_DISPONIBLES: no son una opción del
// selector de 10 temas, se activan/desactivan solo desde el módulo
// Apariencia del panel docente (ver inicializarSelectorEventoAdmin() más
// abajo) y se fuerzan sobre TODAS las cuentas mientras estén activos.
// "ninguno" es el valor que se guarda en config_sitio para "sin evento"
// (nunca NULL — ver obtenerTemaEventoActivo()), pero no es un tema en sí
// (aplicarTema() nunca lo recibe), así que no necesita bloque CSS propio.
const EVENTOS_DISPONIBLES = [
  { slug: "ninguno", nombre: "Ninguno" },
  { slug: "navidad", nombre: "🎄 Navidad" },
  { slug: "dia-de-muertos", nombre: "💀 Día de Muertos" },
  { slug: "regreso-a-clases", nombre: "🎒 Regreso a Clases" },
  { slug: "independencia", nombre: "🇲🇽 Independencia" },
  { slug: "amor-y-amistad", nombre: "💕 Amor y Amistad" },
  { slug: "dia-del-maestro", nombre: "👩‍🏫 Día del Maestro" },
  { slug: "fin-de-curso", nombre: "☀️ Fin de Curso" },
];

// Evento actualmente forzado (slug de EVENTOS_DISPONIBLES sin contar
// "ninguno"), o null si no hay ninguno — resuelto una vez en
// DOMContentLoaded (sección 10) antes de aplicar cualquier tema, y leído
// después por seleccionarTema()/activarSelectorTema()/cuenta.html para
// saber si el selector de 10 temas debe quedar deshabilitado.
let eventoActivo = null;

// Aplica un tema (slug de TEMAS_DISPONIBLES, o de EVENTOS_DISPONIBLES
// cuando hay un evento forzado) al <html> y sincroniza el ícono/
// aria-label de cada .boton-tema (hay 2 por página: riel flyout desktop
// + sheet de la barra inferior en móvil). Ya no alterna entre 2 — el
// botón ahora abre el selector (ver activarSelectorTema); esta función
// solo refleja cuál es el tema ACTUAL, no calcula "el siguiente".
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);

  const info =
    TEMAS_DISPONIBLES.find((t) => t.slug === tema) ||
    EVENTOS_DISPONIBLES.find((e) => e.slug === tema) ||
    TEMAS_DISPONIBLES[0];
  const [emoji, ...resto] = info.nombre.split(" ");
  const nombreSinEmoji = resto.join(" ");

  document.querySelectorAll(".boton-tema").forEach((boton) => {
    boton.setAttribute("aria-label", "Elegir tema (actual: " + nombreSinEmoji + ")");
    const icono = boton.querySelector(".boton-tema__icono");
    if (icono) icono.textContent = emoji;
  });
}

// Guarda el tema elegido (localStorage siempre; perfiles.tema_preferido
// también si hay sesión de Supabase activa, vía la RPC
// actualizar_tema_preferido(nuevo_tema) — no un upsert directo a la
// tabla) y lo aplica de inmediato — aplica primero, sincroniza con la
// cuenta después, mismo criterio de "no bloquear la UI por la escritura
// remota" que ya usa el resto del sitio (ver p. ej. guardarEntregaManual).
// El toast de confirmación SÍ espera a que la RPC confirme (o a que se
// sepa que no hay sesión) antes de mostrarse — antes se mostraba de
// inmediato sin importar el resultado, lo que ocultó en producción que
// la whitelist de la función se había quedado atrás de TEMAS_DISPONIBLES
// (los 3 temas de la Fase 10 nunca se agregaron ahí: la RPC fallaba
// siempre para esos slugs y el catch vacío se tragaba el error, así que
// el alumno veía "activado" pero el tema nunca se guardaba en la cuenta
// y se revertía en la siguiente página). Si la RPC falla ahora, se ve un
// toast de aviso distinto (no el de éxito) y el error real queda en
// consola — el tema ya aplicado localmente NO se revierte, solo no
// quedó sincronizado con la cuenta.
async function seleccionarTema(tema) {
  // El grid ya queda pointer-events:none mientras hay un evento forzado
  // (ver actualizarUIGridSegunEvento), así que esto no debería disparar
  // por clic real — solo por si acaso (ej. invocación programática).
  if (eventoActivo) return;

  temaActual = tema;
  localStorage.setItem(CLAVE_TEMA, tema);
  aplicarTema(tema);

  const modal = document.getElementById("modal-tema");
  if (modal?.open) cerrarDialogoAnimado(modal);

  // La sección "🎨 Personalización" de cuenta.html (a diferencia del
  // modal, que simplemente se cierra) se queda visible después de
  // elegir: hay que volver a armar su grid para que el indicador "✓" se
  // mueva a la tarjeta recién elegida.
  const gridCuenta = document.getElementById("cuenta-tema-grid");
  if (gridCuenta) {
    await construirGridTemas(gridCuenta, temaActual, seleccionarTema);
    actualizarUIGridSegunEvento(gridCuenta);
  }

  const info = TEMAS_DISPONIBLES.find((t) => t.slug === tema);
  const [emoji, ...resto] = (info?.nombre || tema).split(" ");
  const nombreSinEmoji = resto.join(" ");

  const {
    data: { session },
  } = await clienteSupabase.auth.getSession();
  if (!session) {
    // Sin sesión no hay nada que sincronizar — la elección ya quedó
    // completa en localStorage, así que el toast de éxito se muestra de
    // inmediato, no hay una escritura remota pendiente que esperar.
    mostrarToast("Tema \"" + nombreSinEmoji + "\" activado", { icono: emoji });
    return;
  }

  try {
    const { error } = await clienteSupabase.rpc("actualizar_tema_preferido", { nuevo_tema: tema });
    if (error) throw error;
    mostrarToast("Tema \"" + nombreSinEmoji + "\" activado", { icono: emoji });
  } catch (error) {
    console.error("No se pudo guardar el tema preferido en la cuenta:", error);
    mostrarToastAdvertencia("No se pudo guardar tu preferencia de tema, se reintentará");
  }
}

// Lee los 4 colores reales de un tema (primario/turquesa/superficie/
// texto) alternando data-theme en el <html> y leyendo getComputedStyle
// antes de restaurar el tema que estaba activo — mismo mecanismo que ya
// usaba construirGridTemas() para el swatch de 2 colores, ahora extraído
// para que el preview en vivo del selector (activarPreviewTemaEnVivo) lo
// reutilice sin duplicar la lectura. Nunca hardcodea hex: si mañana se
// ajusta un color de tema en css/style.css, esto lee el valor real.
function leerColoresTema(slug) {
  const temaOriginal = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", slug);
  const estilos = getComputedStyle(document.documentElement);
  const colores = {
    primario: estilos.getPropertyValue("--color-primario").trim(),
    turquesa: estilos.getPropertyValue("--color-turquesa").trim(),
    superficie: estilos.getPropertyValue("--color-superficie").trim(),
    texto: estilos.getPropertyValue("--color-texto").trim(),
  };
  document.documentElement.setAttribute("data-theme", temaOriginal);
  return colores;
}

// Fase 12: estado de desbloqueo de los 9 temas de recompensa para la
// cuenta activa — se recalcula fresco en cada llamada (mismo criterio que
// leerColoresTema: construirGridTemas() ya reconstruye todo desde cero
// cada vez que se abre el modal, así que este estado tampoco necesita
// cachearse aparte).
//
//   - Sin perfil (sin sesión): nada desbloqueado — no hay grupo que
//     consultar, comportamiento seguro por default.
//   - Docente (RPC es_docente(), el mismo chequeo real que ya usa
//     guardPanelDocente/el atajo de cuenta.html — perfilActivoCache no
//     guarda "rol" hoy): los 9 quedan desbloqueados sin tocar
//     temas_desbloqueados_grupo, es una regla de UI.
//   - Alumno con grupo: consulta temas_desbloqueados_grupo filtrando por
//     su grupo, vía obtenerDatos() para heredar el mock de Modo Demo
//     (ver DEMO_TABLAS, sección 2) en vez de llamar a Supabase directo.
async function obtenerEstadoDesbloqueoTemas() {
  const perfil = obtenerPerfilActivo();
  if (!perfil) return { esDocente: false, slugsDesbloqueados: new Set() };

  let esDocente = false;
  try {
    const { data, error } = await clienteSupabase.rpc("es_docente");
    esDocente = !error && !!data;
  } catch {
    esDocente = false;
  }
  if (esDocente) return { esDocente: true, slugsDesbloqueados: new Set() };

  if (!perfil.grupo) return { esDocente: false, slugsDesbloqueados: new Set() };

  const { data, error } = await obtenerDatos("temas_desbloqueados_grupo", {
    select: "tema_slug",
    eq: { grupo: perfil.grupo },
  });
  if (error || !data) return { esDocente: false, slugsDesbloqueados: new Set() };

  return { esDocente: false, slugsDesbloqueados: new Set(data.map((fila) => fila.tema_slug)) };
}

/* ---------------------------------------------------------
   Fase 14: celebración automática al desbloquear un tema de recompensa
   --------------------------------------------------------- */

// Slugs de temas de recompensa que el alumno YA vio celebrar — evita
// repetir la celebración en cada carga de página una vez mostrada.
const CLAVE_TEMAS_CELEBRADOS = "tecno10mixta_temas_celebrados";

// Compara obtenerEstadoDesbloqueoTemas() (Fase 12, mismo dato, sin
// duplicar la consulta) contra CLAVE_TEMAS_CELEBRADOS: cualquier slug
// desbloqueado que todavía no esté ahí entra a UNA sola celebración que
// los menciona a todos (no una por tema) y se agrega a la lista.
//
// estado.esDocente === true ya viene con slugsDesbloqueados vacío (ver
// obtenerEstadoDesbloqueoTemas), así que un docente nunca tendría "temas
// nuevos" que comparar — el "if (estado.esDocente) return" de abajo es
// una segunda capa explícita, no la única defensa. Mismo con Modo Demo:
// DEMO_TABLAS.temas_desbloqueados_grupo (sección 2) siempre devuelve
// [], así que slugsDesbloqueados tampoco puede traer nada "nuevo" ahí.
async function verificarCelebracionTemasDesbloqueados() {
  const estado = await obtenerEstadoDesbloqueoTemas();
  if (estado.esDocente || estado.slugsDesbloqueados.size === 0) return;

  const celebrados = new Set(JSON.parse(localStorage.getItem(CLAVE_TEMAS_CELEBRADOS) || "[]"));

  // Orden de TEMAS_DISPONIBLES (no el de iteración del Set, que depende
  // del orden en que Supabase devolvió las filas) — presentación
  // consistente en la celebración sin importar en qué orden se
  // desbloquearon.
  const nuevos = TEMAS_DISPONIBLES.map((t) => t.slug).filter(
    (slug) => estado.slugsDesbloqueados.has(slug) && !celebrados.has(slug)
  );
  if (nuevos.length === 0) return;

  nuevos.forEach((slug) => celebrados.add(slug));
  localStorage.setItem(CLAVE_TEMAS_CELEBRADOS, JSON.stringify([...celebrados]));

  mostrarCelebracionTemasDesbloqueados(nuevos);
}

// Arma y muestra #modal-celebracion-tema para "slugs" (1 a 3 temas
// recién desbloqueados) — título en singular/plural y los nombres
// unidos en una sola oración ("A, B y C"), mismo criterio de unión que
// ya usa trimestresAfectados() en el módulo Trimestre del admin.
function mostrarCelebracionTemasDesbloqueados(slugs) {
  const modal = document.getElementById("modal-celebracion-tema");
  if (!modal) return;

  const nombres = slugs.map((slug) => TEMAS_DISPONIBLES.find((t) => t.slug === slug)?.nombre || slug);
  const listaTexto =
    nombres.length === 1 ? nombres[0] : nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];

  const titulo = document.getElementById("modal-celebracion-tema-titulo");
  if (titulo) {
    titulo.textContent = slugs.length === 1 ? "🎉 ¡Nuevo tema desbloqueado!" : "🎉 ¡Nuevos temas desbloqueados!";
  }

  const lista = document.getElementById("modal-celebracion-tema-lista");
  if (lista) lista.textContent = listaTexto;

  modal.showModal();
}

// "Ver tema" del modal de celebración: mismo mecanismo de apertura que
// el clic en .boton-tema (ver activarSelectorTema más abajo) — no lo
// modifica, solo llama a las mismas piezas (crearPreviewTemaEnVivo,
// aplicarColoresAPreview, construirGridTemas, actualizarUIGridSegunEvento)
// desde este punto de entrada distinto, para que el alumno pueda elegir
// el tema recién desbloqueado ahí mismo.
async function abrirSelectorTemaDesdeCelebracion() {
  const modal = document.getElementById("modal-tema");
  const grid = document.getElementById("modal-tema-grid");
  if (!modal || !grid) return;

  const preview = crearPreviewTemaEnVivo(modal);
  aplicarColoresAPreview(preview, temaActual);
  await construirGridTemas(grid, temaActual, seleccionarTema);
  actualizarUIGridSegunEvento(grid);
  modal.showModal();
}

// Cierre por el botón ✕, el botón "Cerrar" del pie, clic en el
// ::backdrop y Esc nativo del <dialog> — mismo patrón ya usado por
// activarCierreModalDemo(). "Ver tema" cierra este modal y abre
// #modal-tema de inmediato.
function activarModalCelebracionTema() {
  const modal = document.getElementById("modal-celebracion-tema");
  if (!modal) return;

  const botonCerrar = modal.querySelector(".modal-celebracion-tema__cerrar");
  const botonCerrarSecundario = document.getElementById("modal-celebracion-tema-cerrar-secundario");
  [botonCerrar, botonCerrarSecundario].forEach((boton) => {
    boton?.addEventListener("click", () => cerrarDialogoAnimado(modal));
  });

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });

  const botonVer = document.getElementById("modal-celebracion-tema-ver");
  botonVer?.addEventListener("click", async () => {
    await cerrarDialogoAnimado(modal);
    abrirSelectorTemaDesdeCelebracion();
  });
}

/* ---------------------------------------------------------
   Fase 15: "🏆 Aplica tus conocimientos" (trimestre-N-practica.html)
   --------------------------------------------------------- */

// Vista previa de UN tema del trimestre — misma familia visual que
// crearTarjetaTema() (Fase 7/12: mismo mosaico de 4 cuadros vía
// leerColoresTema, mismo candado 🔒), pero como <div> de solo lectura
// (sin alSeleccionar, sin aria-current): esta tarjeta nunca selecciona
// nada, solo informa el estado. "estadoDesbloqueo" es el MISMO objeto
// que ya devolvió obtenerEstadoDesbloqueoTemas() para el reto de abajo,
// no una consulta aparte.
function crearVistaPreviaTemaTrimestre(slug, nombre, estadoDesbloqueo) {
  const { primario, turquesa, superficie, texto } = leerColoresTema(slug);
  const [emoji, ...resto] = nombre.split(" ");
  const nombreSinEmoji = resto.join(" ");
  const bloqueado = !estadoDesbloqueo.esDocente && !estadoDesbloqueo.slugsDesbloqueados.has(slug);

  const tarjeta = document.createElement("div");
  tarjeta.className = "tema-tarjeta tema-tarjeta--vista-previa";
  if (bloqueado) {
    tarjeta.classList.add("tema-tarjeta--bloqueada");
    tarjeta.title = "Se desbloquea cuando tu grupo completa el reto de este trimestre";
  }

  const swatch = document.createElement("span");
  swatch.className = "tema-tarjeta__swatch";
  swatch.setAttribute("aria-hidden", "true");
  [primario, turquesa, superficie, texto].forEach((color) => {
    const cuadro = document.createElement("span");
    cuadro.className = "tema-tarjeta__swatch-cuadro";
    cuadro.style.backgroundColor = color;
    swatch.appendChild(cuadro);
  });
  const emojiSwatch = document.createElement("span");
  emojiSwatch.className = "tema-tarjeta__swatch-emoji";
  emojiSwatch.textContent = emoji;
  swatch.appendChild(emojiSwatch);
  if (bloqueado) {
    const candado = document.createElement("span");
    candado.className = "tema-tarjeta__candado";
    candado.setAttribute("aria-hidden", "true");
    candado.textContent = "🔒";
    swatch.appendChild(candado);
  }

  const textoNombre = document.createElement("span");
  textoNombre.className = "tema-tarjeta__nombre";
  textoNombre.textContent = nombreSinEmoji;

  tarjeta.append(swatch, textoNombre);
  return tarjeta;
}

// "🔑 Inicia sesión..." — mismo componente visual que
// #progreso-sin-perfil en progreso.html (.panel-progreso__invitacion),
// mismo texto exacto pedido para esta sección.
function crearAvisoSinSesionReto() {
  const aviso = document.createElement("div");
  aviso.className = "panel-progreso__invitacion";

  const texto = document.createElement("p");
  texto.textContent = "🔑 Inicia sesión para ver el reto de tu grupo";

  const enlace = document.createElement("a");
  enlace.href = "cuenta.html";
  enlace.className = "boton-secundario";
  enlace.textContent = "Identificarme";

  aviso.append(texto, enlace);
  return aviso;
}

// Una parte del reto (1 de 3) — "parte.tipo" decide el formato. Nunca
// incluye la respuesta: solo el planteamiento que trae DATOS_RETOS.
function crearParteReto(parte) {
  const bloque = document.createElement("div");
  bloque.className = "reto-parte";

  const titulo = document.createElement("h3");
  titulo.className = "reto-parte__titulo";
  titulo.textContent = parte.secuencia;
  bloque.appendChild(titulo);

  const agregarInstruccion = (texto) => {
    const p = document.createElement("p");
    p.className = "reto-parte__instruccion";
    p.textContent = texto;
    bloque.appendChild(p);
  };

  if (parte.tipo === "caso_decision") {
    const p = document.createElement("p");
    p.className = "reto-parte__texto";
    p.textContent = parte.texto;
    bloque.appendChild(p);
  } else if (parte.tipo === "clasificacion") {
    if (parte.instruccion) agregarInstruccion(parte.instruccion);
    const lista = document.createElement("ol");
    lista.className = "reto-parte__lista";
    parte.items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      lista.appendChild(li);
    });
    bloque.appendChild(lista);
  } else if (parte.tipo === "secuencia_orden") {
    if (parte.instruccion) agregarInstruccion(parte.instruccion);
    // Sin numeración 1/2/3 a propósito (letras A/B/C vía CSS
    // counter(paso, upper-alpha), ver .reto-parte__lista--pasos): una
    // lista numerada 1-2-3 podría leerse como "este ya es el orden
    // correcto", justo lo contrario de "pasos_desordenados".
    const lista = document.createElement("ul");
    lista.className = "reto-parte__lista reto-parte__lista--pasos";
    parte.pasos_desordenados.forEach((paso) => {
      const li = document.createElement("li");
      li.textContent = paso;
      lista.appendChild(li);
    });
    bloque.appendChild(lista);
  } else if (parte.tipo === "cifrado_cesar") {
    agregarInstruccion("Desplazamiento: " + parte.desplazamiento);
    const cifrado = document.createElement("p");
    cifrado.className = "reto-parte__cifrado";
    cifrado.textContent = parte.mensaje_cifrado;
    bloque.appendChild(cifrado);
  } else if (parte.tipo === "calculo_aplicado") {
    if (parte.instruccion) agregarInstruccion(parte.instruccion);
    const tabla = document.createElement("table");
    tabla.className = "reto-parte__tabla";
    const thead = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");
    parte.tabla.encabezados.forEach((encabezado) => {
      const th = document.createElement("th");
      th.textContent = encabezado;
      filaEncabezado.appendChild(th);
    });
    thead.appendChild(filaEncabezado);
    tabla.appendChild(thead);
    const tbody = document.createElement("tbody");
    parte.tabla.filas.forEach((fila) => {
      const tr = document.createElement("tr");
      fila.forEach((celda) => {
        const td = document.createElement("td");
        td.textContent = celda;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);
    bloque.appendChild(tabla);
  } else if (parte.tipo === "detectar_error") {
    if (parte.contexto) agregarInstruccion(parte.contexto);
    const codigo = document.createElement("pre");
    codigo.className = "reto-parte__codigo";
    codigo.textContent = parte.fragmento;
    bloque.appendChild(codigo);
  }

  return bloque;
}

// Repinta "contenedor" con las 3 partes del reto de "grupo" para el
// trimestre dado — separado de renderizarSeccionAplicaConocimientos()
// para que el selector de grupo del docente (ver más abajo) pueda
// llamarlo de nuevo sin reconstruir el resto de la sección.
function renderizarPartesReto(contenedor, trimestre, grupo) {
  contenedor.innerHTML = "";
  const reto = DATOS_RETOS[trimestre]?.[grupo];
  if (!reto) return;
  reto.partes.forEach((parte) => contenedor.appendChild(crearParteReto(parte)));
}

// Selector "Ver reto de: 3°C/3°E" — SOLO para docente (nunca tiene
// grupo propio, pero necesita ver ambos retos para arbitrarlos, ver
// retos_temas_recompensa.md). Mismo componente visual que el filtro de
// grupo de Calificación/Apariencia (.calificacion-filtro, Fase 13).
function crearSelectorGrupoDocenteReto(trimestre, contenedorPartes) {
  const filtro = document.createElement("div");
  filtro.className = "calificacion-filtro";

  const idSelect = "aplica-conocimientos-grupo-docente";
  const label = document.createElement("label");
  label.setAttribute("for", idSelect);
  label.textContent = "Ver reto de";

  const select = document.createElement("select");
  select.id = idSelect;
  ["3C", "3E"].forEach((grupo) => {
    const option = document.createElement("option");
    option.value = grupo;
    option.textContent = textoGrupo(grupo);
    select.appendChild(option);
  });
  select.addEventListener("change", () => {
    renderizarPartesReto(contenedorPartes, trimestre, select.value);
  });

  filtro.append(label, select);
  return filtro;
}

// Punto de entrada de toda la sección — no-op fuera de trimestre-N-
// practica.html (sin #aplica-tus-conocimientos, ver el guard de abajo),
// así que se puede llamar sin condición desde renderizarTodo() como el
// resto de secciones de trimestre. Una sola llamada a
// obtenerEstadoDesbloqueoTemas() (Fase 12) sirve para las 2 partes
// siempre-visibles (preview de temas) Y para decidir si quien mira es
// docente (reutiliza estado.esDocente en vez de otra llamada a
// es_docente()).
async function renderizarSeccionAplicaConocimientos() {
  const seccion = document.getElementById("aplica-tus-conocimientos");
  if (!seccion) return;

  const trimestre = Number(TRIMESTRE_ACTUAL);
  const estado = await obtenerEstadoDesbloqueoTemas();

  const contenedorPreview = document.getElementById("aplica-conocimientos-temas");
  if (contenedorPreview) {
    contenedorPreview.innerHTML = "";
    const slugsDelTrimestre = Object.entries(TRIMESTRE_POR_TEMA_RECOMPENSA)
      .filter(([, trimestreDelTema]) => trimestreDelTema === trimestre)
      .map(([slug]) => slug);
    slugsDelTrimestre.forEach((slug) => {
      const info = TEMAS_DISPONIBLES.find((t) => t.slug === slug);
      if (!info) return;
      contenedorPreview.appendChild(crearVistaPreviaTemaTrimestre(slug, info.nombre, estado));
    });
  }

  const contenedorReto = document.getElementById("aplica-conocimientos-reto");
  if (!contenedorReto) return;
  contenedorReto.innerHTML = "";

  const perfil = obtenerPerfilActivo();
  if (!perfil) {
    contenedorReto.appendChild(crearAvisoSinSesionReto());
    return;
  }

  if (estado.esDocente) {
    const contenedorPartes = document.createElement("div");
    contenedorPartes.className = "reto-partes";
    contenedorReto.append(crearSelectorGrupoDocenteReto(trimestre, contenedorPartes), contenedorPartes);
    renderizarPartesReto(contenedorPartes, trimestre, "3C");
    return;
  }

  if (!perfil.grupo) {
    contenedorReto.appendChild(crearAvisoSinSesionReto());
    return;
  }

  renderizarPartesReto(contenedorReto, trimestre, perfil.grupo);
}

// Una tarjeta de tema individual (swatch + nombre) — extraído de
// construirGridTemas() para poder pintarla en dos subgrids distintos
// (Destacados / Más temas) sin duplicar el HTML. Mismo mosaico de 4
// cuadros (primario/turquesa/superficie/texto, ver leerColoresTema) que
// ya traía antes de la Fase 7.
//
// "estadoDesbloqueo" (ver obtenerEstadoDesbloqueoTemas): solo los 9 slugs
// de TRIMESTRE_POR_TEMA_RECOMPENSA entran a la lógica de candado — los 4
// Destacados ni siquiera están en ese mapa, así que "bloqueado" queda
// false para ellos sin un chequeo aparte.
function crearTarjetaTema(slug, nombre, temaActivo, alSeleccionar, estadoDesbloqueo) {
  const { primario, turquesa, superficie, texto } = leerColoresTema(slug);
  const [emoji, ...resto] = nombre.split(" ");
  const nombreSinEmoji = resto.join(" ");

  const trimestreDesbloqueo = TRIMESTRE_POR_TEMA_RECOMPENSA[slug];
  const bloqueado =
    trimestreDesbloqueo !== undefined &&
    !estadoDesbloqueo.esDocente &&
    !estadoDesbloqueo.slugsDesbloqueados.has(slug);
  const textoBloqueo = bloqueado ? "Se desbloquea en Trimestre " + trimestreDesbloqueo : "";

  const tarjeta = document.createElement("button");
  tarjeta.type = "button";
  tarjeta.className = "tema-tarjeta";
  tarjeta.dataset.temaSlug = slug;
  if (slug === temaActivo) {
    tarjeta.classList.add("tema-tarjeta--activa");
    tarjeta.setAttribute("aria-current", "true");
  }

  // aria-disabled (NO el atributo "disabled" nativo) a propósito: la
  // tarjeta debe seguir en el orden de Tab y ser anunciada por lector de
  // pantalla ("bloqueado, se desbloquea en Trimestre X"), no desaparecer
  // del todo — "disabled" real la sacaría del foco.
  if (bloqueado) {
    tarjeta.classList.add("tema-tarjeta--bloqueada");
    tarjeta.title = textoBloqueo;
    tarjeta.setAttribute("aria-disabled", "true");
    tarjeta.setAttribute("aria-label", nombreSinEmoji + " — bloqueado. " + textoBloqueo);
  }

  const swatch = document.createElement("span");
  swatch.className = "tema-tarjeta__swatch";
  swatch.setAttribute("aria-hidden", "true");
  [primario, turquesa, superficie, texto].forEach((color) => {
    const cuadro = document.createElement("span");
    cuadro.className = "tema-tarjeta__swatch-cuadro";
    cuadro.style.backgroundColor = color;
    swatch.appendChild(cuadro);
  });
  const emojiSwatch = document.createElement("span");
  emojiSwatch.className = "tema-tarjeta__swatch-emoji";
  emojiSwatch.textContent = emoji;
  swatch.appendChild(emojiSwatch);

  // Candado superpuesto ENCIMA del swatch, no en vez de él — el alumno
  // debe poder ver de qué color es el tema aunque esté bloqueado, es
  // parte del incentivo (mismo criterio de "placa de fondo oscuro fijo"
  // que ya usa .tema-tarjeta__swatch-emoji arriba, así que no necesita
  // su propio par de contraste en validate_palette.js).
  if (bloqueado) {
    const candado = document.createElement("span");
    candado.className = "tema-tarjeta__candado";
    candado.setAttribute("aria-hidden", "true");
    candado.textContent = "🔒";
    swatch.appendChild(candado);
  }

  const textoNombre = document.createElement("span");
  textoNombre.className = "tema-tarjeta__nombre";
  textoNombre.textContent = resto.join(" ");

  tarjeta.append(swatch, textoNombre);
  // El preview en vivo (activarPreviewTemaEnVivo) sigue funcionando igual
  // en tarjetas bloqueadas — está delegado sobre el grid entero y no
  // consulta "bloqueado" para nada. Solo el clic de selección final queda
  // cortado acá, con el mismo tooltip como refuerzo (mostrarToastAdvertencia).
  tarjeta.addEventListener("click", () => {
    if (bloqueado) {
      mostrarToastAdvertencia(textoBloqueo, { icono: "🔒" });
      return;
    }
    alSeleccionar(slug);
  });
  return tarjeta;
}

// Arma el grid de temas en 2 grupos (Fase 7) dentro de "contenedor" —
// reutilizada por #modal-tema (selector rápido desde el riel/barra
// inferior) y por la sección "🎨 Personalización" de cuenta.html (Fase 4),
// en vez de duplicar el mismo grid dos veces. "alSeleccionar" recibe el
// slug elegido; cada punto de acceso decide qué hacer (el modal usa
// seleccionarTema directo, cuenta.html podría envolverlo si algún día
// necesita lógica extra).
//
// "⭐ Destacados" (SLUGS_TEMAS_DESTACADOS) queda siempre visible; el resto
// vive en "Más temas", colapsado con el MISMO patrón de expansión in-place
// que #reglamento-taller (ver activarExpansionReglamento): clase
// "reglamento--expandida" + aria-expanded + texto dinámico del botón,
// reusando .reglamento-lista__resto y .reglamento-boton-expandir tal
// cual — solo el selector de la animación/rotación de ícono es nuevo
// (mismo combo ancestro+expandida, scoped a .tema-grupo--mas en vez de
// .bento-celda--reglamento).
//
// Ambos subgrids quedan DENTRO de "contenedor" a propósito: activarPreview
// TemaEnVivo() delega eventos con grid.contains(tarjeta) sobre este mismo
// elemento, y actualizarUIGridSegunEvento() lo deshabilita completo con
// una sola clase (pointer-events/opacity heredan a los descendientes sin
// importar el anidado) — ninguna de las dos necesitó cambios.
//
// "Más temas" arranca expandido si temaActivo cae ahí, para no obligar al
// alumno a buscarlo con un clic extra; como esta función reconstruye todo
// desde cero en cada llamada (incluida cada apertura del modal), ese
// estado se recalcula siempre a partir del tema activo actual — nunca
// "recuerda" si el alumno lo había abierto manualmente antes.
async function construirGridTemas(contenedor, temaActivo, alSeleccionar) {
  contenedor.innerHTML = "";

  // Una sola consulta para las 13 tarjetas (Fase 12) — crearTarjetaTema()
  // decide por slug si le aplica el candado, ver TRIMESTRE_POR_TEMA_RECOMPENSA.
  const estadoDesbloqueo = await obtenerEstadoDesbloqueoTemas();

  const destacados = TEMAS_DISPONIBLES.filter(({ slug }) => SLUGS_TEMAS_DESTACADOS.includes(slug));
  const masTemas = TEMAS_DISPONIBLES.filter(({ slug }) => !SLUGS_TEMAS_DESTACADOS.includes(slug));
  const activoEnMasTemas = masTemas.some(({ slug }) => slug === temaActivo);

  const grupoDestacados = document.createElement("div");
  grupoDestacados.className = "tema-grupo";
  const tituloDestacados = document.createElement("p");
  tituloDestacados.className = "tema-grupo__titulo";
  tituloDestacados.textContent = "⭐ Destacados";
  const gridDestacados = document.createElement("div");
  gridDestacados.className = "tema-grupo__grid";
  destacados.forEach(({ slug, nombre }) => {
    gridDestacados.appendChild(crearTarjetaTema(slug, nombre, temaActivo, alSeleccionar, estadoDesbloqueo));
  });
  grupoDestacados.append(tituloDestacados, gridDestacados);

  const grupoMas = document.createElement("div");
  grupoMas.className = "tema-grupo tema-grupo--mas";
  grupoMas.classList.toggle("reglamento--expandida", activoEnMasTemas);

  const textoVerMas = "Ver los " + masTemas.length + " temas restantes";
  const idRestoMas = contenedor.id + "-mas-resto";

  const botonMas = document.createElement("button");
  botonMas.type = "button";
  botonMas.className = "reglamento-boton-expandir";
  botonMas.setAttribute("aria-expanded", String(activoEnMasTemas));
  botonMas.setAttribute("aria-controls", idRestoMas);
  const textoBotonMas = document.createElement("span");
  textoBotonMas.textContent = activoEnMasTemas ? "Ver menos" : textoVerMas;
  const iconoBotonMas = document.createElement("span");
  iconoBotonMas.className = "reglamento-boton-expandir__icono";
  iconoBotonMas.setAttribute("aria-hidden", "true");
  iconoBotonMas.textContent = "▾";
  botonMas.append(textoBotonMas, iconoBotonMas);
  botonMas.addEventListener("click", () => {
    const expandida = grupoMas.classList.toggle("reglamento--expandida");
    botonMas.setAttribute("aria-expanded", String(expandida));
    textoBotonMas.textContent = expandida ? "Ver menos" : textoVerMas;
  });

  const restoMas = document.createElement("div");
  restoMas.id = idRestoMas;
  restoMas.className = "reglamento-lista__resto";
  const gridMas = document.createElement("div");
  gridMas.className = "tema-grupo__grid";
  masTemas.forEach(({ slug, nombre }) => {
    gridMas.appendChild(crearTarjetaTema(slug, nombre, temaActivo, alSeleccionar, estadoDesbloqueo));
  });
  restoMas.appendChild(gridMas);

  grupoMas.append(botonMas, restoMas);

  contenedor.append(grupoDestacados, grupoMas);
}

// Texto del aviso que reemplaza la posibilidad de elegir tema mientras
// hay un evento forzado — mismo texto en #modal-tema y en la sección
// "Personalización" de cuenta.html (ver actualizarUIGridSegunEvento).
function textoAvisoEventoActivo(slug) {
  const info = EVENTOS_DISPONIBLES.find((e) => e.slug === slug);
  const [emoji, ...resto] = (info?.nombre || slug).split(" ");
  return (
    emoji + " Modo " + resto.join(" ") + " activo — tu tema vuelve a estar disponible cuando el docente lo desactive."
  );
}

// Deshabilita visualmente un grid de temas ya armado (pointer-events:none
// + opacidad) e inserta el aviso justo antes, o lo quita si no hay
// evento activo. Se llama después de CADA construirGridTemas() — el
// tema personal del alumno sigue en localStorage/Supabase sin tocarse,
// esto solo bloquea la UI para elegir uno nuevo mientras dura el evento.
function actualizarUIGridSegunEvento(contenedorGrid) {
  if (!contenedorGrid) return;

  const anterior = contenedorGrid.previousElementSibling;
  const avisoExistente = anterior?.classList?.contains("tema-grid__aviso-evento") ? anterior : null;

  if (eventoActivo) {
    contenedorGrid.classList.add("tema-tarjeta__grid--deshabilitado");
    if (!avisoExistente) {
      const aviso = document.createElement("p");
      aviso.className = "tema-grid__aviso-evento";
      aviso.textContent = textoAvisoEventoActivo(eventoActivo);
      contenedorGrid.before(aviso);
    }
  } else {
    contenedorGrid.classList.remove("tema-tarjeta__grid--deshabilitado");
    if (avisoExistente) avisoExistente.remove();
  }
}

// Inserta la superficie de preview en vivo del selector de tema (una vez
// por página, antes del grid) si todavía no existe. A propósito NO es
// aplicarTema(): esa pinta <html> completo y con 10 temas para recorrer
// con el mouse produciría un flash en cada hover — esto solo actualiza 4
// custom properties LOCALES sobre este elemento, el resto de la página
// queda intacta. Decorativa de principio a fin (aria-hidden, sin
// <button> real): no debe entrar al orden de Tab ni robar foco mientras
// se navega el grid con teclado.
function crearPreviewTemaEnVivo(modal) {
  const existente = modal.querySelector(".tema-preview-en-vivo");
  if (existente) return existente;

  const preview = document.createElement("div");
  preview.className = "tema-preview-en-vivo";
  preview.setAttribute("aria-hidden", "true");
  preview.innerHTML =
    '<span class="tema-preview-en-vivo__muestra">Aa</span>' +
    '<div class="tema-preview-en-vivo__info">' +
    '<p class="tema-preview-en-vivo__texto">Así se ve este tema</p>' +
    '<span class="tema-preview-en-vivo__boton">Botón de muestra</span>' +
    "</div>";

  const grid = modal.querySelector("#modal-tema-grid");
  modal.insertBefore(preview, grid);
  return preview;
}

// Escribe los 4 colores de "slug" como custom properties locales sobre
// el elemento de preview (--preview-primario/-turquesa/-superficie/
// -texto), reutilizando leerColoresTema() — la misma lectura que ya usa
// el swatch de cada tarjeta-tema, no una copia. El CSS del preview cae
// a var(--color-*) real como fallback si por lo que sea el custom
// property local no está seteado todavía.
function aplicarColoresAPreview(preview, slug) {
  const { primario, turquesa, superficie, texto } = leerColoresTema(slug);
  preview.style.setProperty("--preview-primario", primario);
  preview.style.setProperty("--preview-turquesa", turquesa);
  preview.style.setProperty("--preview-superficie", superficie);
  preview.style.setProperty("--preview-texto", texto);
}

// Delegado sobre el contenedor del grid (no un listener por tarjeta):
// sobrevive a que construirGridTemas() reconstruya las 10 tarjetas cada
// vez que se abre el modal, sin tener que reenganchar nada. mouseover/
// mouseout y focusin/focusout SÍ burbujean (a diferencia de mouseenter/
// mouseleave y focus/blur), así que un solo par de listeners cubre las
// 10 tarjetas. Al salir el hover/foco de la tarjeta (evento.relatedTarget
// ya no es otra tarjeta del mismo grid), el preview vuelve al tema
// activo real del alumno — nunca se queda "huérfano" en el último tema
// que se pasó a ver.
function activarPreviewTemaEnVivo(grid, preview) {
  if (!grid || !preview) return;

  const revertirAlTemaActivo = () => aplicarColoresAPreview(preview, temaActual);

  const alEntrar = (evento) => {
    const tarjeta = evento.target.closest(".tema-tarjeta");
    if (tarjeta && grid.contains(tarjeta)) {
      aplicarColoresAPreview(preview, tarjeta.dataset.temaSlug);
    }
  };

  const alSalir = (evento) => {
    const tarjeta = evento.target.closest(".tema-tarjeta");
    if (!tarjeta) return;
    const siguienteEsOtraTarjeta = evento.relatedTarget?.closest?.(".tema-tarjeta");
    if (!siguienteEsOtraTarjeta) revertirAlTemaActivo();
  };

  grid.addEventListener("mouseover", alEntrar);
  grid.addEventListener("mouseout", alSalir);
  grid.addEventListener("focusin", alEntrar);
  grid.addEventListener("focusout", alSalir);
}

// Engancha los 2 botones .boton-tema por página (riel flyout desktop +
// sheet de la barra inferior en móvil): al hacer clic abren #modal-tema
// con el grid de 10 temas recién armado (construirGridTemas), en vez de
// alternar el tema directo como antes. Cierre por el botón ✕, click en
// el ::backdrop y ESC nativo del <dialog> — mismo patrón ya usado por
// activarCierreModalDetalle() en la sección 5.
function activarSelectorTema() {
  const modal = document.getElementById("modal-tema");
  if (!modal) return;

  const grid = document.getElementById("modal-tema-grid");
  const botonCerrar = modal.querySelector(".modal-tema__cerrar");
  const preview = crearPreviewTemaEnVivo(modal);
  activarPreviewTemaEnVivo(grid, preview);

  document.querySelectorAll(".boton-tema").forEach((boton) => {
    boton.addEventListener("click", async () => {
      if (grid) {
        await construirGridTemas(grid, temaActual, seleccionarTema);
        actualizarUIGridSegunEvento(grid);
      }
      aplicarColoresAPreview(preview, temaActual);
      modal.showModal();
    });
  });

  if (botonCerrar) botonCerrar.addEventListener("click", () => cerrarDialogoAnimado(modal));
  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });
}

/* ---------------------------------------------------------
   Efectos de "tema de evento": Navidad — ver EVENTOS_DISPONIBLES arriba
   y css/style.css ("EFECTOS DE 'TEMA DE EVENTO': NAVIDAD") para el resto
   de la explicación de cada efecto. Solo activarEfectosNavidad() sabe
   qué activa qué; un futuro evento agrega su propio
   activarEfectosXxxx() + su propio "if" en el DOMContentLoaded de la
   sección 10, sin tocar nada de lo de acá.
   --------------------------------------------------------- */
function activarEfectosNavidad() {
  crearCapaNieveNavidad();
  crearCapaIconosFlotantesNavidad();
}

// 30-40 copos con posición/tamaño/opacidad/velocidad/deriva aleatorios
// por copo, vía variables CSS inline (ver .copo-nieve en css/style.css).
// animationDelay NEGATIVO a propósito: cada copo arranca "a medio
// camino" de su propio ciclo de caída, así la nieve ya se ve dispersa
// por toda la pantalla desde el primer frame en vez de empezar toda
// junta arriba y caer en oleada.
function crearCapaNieveNavidad() {
  const capa = document.createElement("div");
  capa.className = "capa-nieve-navidad";
  capa.setAttribute("aria-hidden", "true");

  const TOTAL_COPOS = 35;
  for (let i = 0; i < TOTAL_COPOS; i++) {
    const copo = document.createElement("div");
    copo.className = "copo-nieve";
    const duracion = 8 + Math.random() * 10;
    copo.style.setProperty("--copo-top", (Math.random() * 100).toFixed(1) + "vh");
    copo.style.setProperty("--copo-left", (Math.random() * 100).toFixed(1) + "vw");
    copo.style.setProperty("--copo-tamano", (3 + Math.random() * 6).toFixed(1) + "px");
    copo.style.setProperty("--copo-opacidad", (0.35 + Math.random() * 0.45).toFixed(2));
    copo.style.setProperty("--copo-deriva", (0.5 + Math.random()).toFixed(2));
    copo.style.setProperty("--copo-duracion", duracion.toFixed(1) + "s");
    copo.style.setProperty("--copo-delay", (-Math.random() * duracion).toFixed(1) + "s");
    capa.appendChild(copo);
  }

  document.body.appendChild(capa);
}

// SVG inline propios (no emoji nativo: el color de un emoji no se puede
// tocar con CSS, y campana/acebo/bastón necesitan su detalle en rojo
// acebo #A6192E). #A6192E queda fijo SOLO dentro de estos 3 SVG
// decorativos — nunca una variable CSS reutilizable, nunca aplicado a
// botones/badges/texto/componentes reales de la UI.
const ICONOS_NAVIDAD = [
  // Árbol
  '<svg viewBox="0 0 24 24"><path d="M12 1 L16 8 H14 L18 14 H15 L19 20 H5 L9 14 H6 L10 8 H8 Z" fill="#1E5A3A"/></svg>',
  // Estrella
  '<svg viewBox="0 0 24 24"><path d="M12 1 L14.7 8.6 L22.5 8.9 L16.3 13.7 L18.5 21.1 L12 16.8 L5.5 21.1 L7.7 13.7 L1.5 8.9 L9.3 8.6 Z" fill="#D4AF37"/></svg>',
  // Reno
  '<svg viewBox="0 0 24 24"><path d="M4 4 L7 8 M20 4 L17 8 M6 7 L4 3 M18 7 L20 3" stroke="#2C7A4F" stroke-width="1.5" fill="none" stroke-linecap="round"/><ellipse cx="12" cy="14" rx="6" ry="7" fill="#2C7A4F"/></svg>',
  // Campana (detalle rojo acebo)
  '<svg viewBox="0 0 24 24"><path d="M12 2c-1 0-1.8.8-1.8 1.8v.6C7.5 5.2 6 7.8 6 11v5l-2 3h16l-2-3v-5c0-3.2-1.5-5.8-4.2-6.6v-.6C13.8 2.8 13 2 12 2z" fill="#D4AF37"/><circle cx="12" cy="21" r="1.6" fill="#D4AF37"/><path d="M9 4.5 L12 3 L15 4.5" stroke="#A6192E" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
  // Acebo (hojas verde pino, bayas rojo acebo)
  '<svg viewBox="0 0 24 24"><path d="M12 2 C15 5 15 9 12 12 C9 9 9 5 12 2Z" fill="#1E5A3A"/><path d="M4 10 C7 11 9 14 8 18 C5 16 3 13 4 10Z" fill="#1E5A3A"/><path d="M20 10 C17 11 15 14 16 18 C19 16 21 13 20 10Z" fill="#1E5A3A"/><circle cx="10.5" cy="16" r="1.6" fill="#A6192E"/><circle cx="13.5" cy="16" r="1.6" fill="#A6192E"/><circle cx="12" cy="18.5" r="1.6" fill="#A6192E"/></svg>',
  // Bastón de caramelo (franjas blanco/rojo acebo)
  '<svg viewBox="0 0 24 24"><path d="M14 22 V10 A5 5 0 1 0 4 10" stroke="#F5F5F0" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M14 22 V10 A5 5 0 1 0 4 10" stroke="#A6192E" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-dasharray="2.6 2.6"/></svg>',
];

// Genera "total" posiciones {top, left} (0-100, unidades vh/vw) para
// repartir íconos flotantes de forma pareja en el viewport: divide el
// área en una cuadrícula imaginaria de celdas y ubica cada ícono en un
// punto al azar DENTRO de su propia celda (jitter acotado al 15%-85% de
// la celda, con margen para no pegarse al borde y amontonarse con la
// celda vecina) — a diferencia de un Math.random() puro sobre las 100
// unidades, que tiende a dejar huecos grandes y amontonamientos y hacía
// sentir "escaso" el efecto aunque el conteo total no lo fuera. Las
// celdas se mezclan (Fisher-Yates) antes de repartirlas para que, cuando
// filas*columnas > total, las celdas "sobrantes" que quedan vacías no
// sean siempre las mismas en cada carga. Compartida por los 3 temas de
// evento (Navidad/Día de Muertos/Regreso a Clases) para mantener la
// misma lógica de distribución en los 3.
function generarPosicionesGridConJitter(total) {
  const columnas = Math.ceil(Math.sqrt(total));
  const filas = Math.ceil(total / columnas);
  const anchoCelda = 100 / columnas;
  const altoCelda = 100 / filas;

  const celdas = [];
  for (let fila = 0; fila < filas; fila++) {
    for (let columna = 0; columna < columnas; columna++) {
      celdas.push({ fila, columna });
    }
  }
  for (let i = celdas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [celdas[i], celdas[j]] = [celdas[j], celdas[i]];
  }

  return celdas.slice(0, total).map(({ fila, columna }) => ({
    top: fila * altoCelda + altoCelda * (0.15 + Math.random() * 0.7),
    left: columna * anchoCelda + anchoCelda * (0.15 + Math.random() * 0.7),
  }));
}

// 35 íconos (antes 12 — se sentían escasos en el viewport pese al
// conteo total, ver commit de ajuste de cantidad/distribución) sobre una
// cuadrícula con jitter (generarPosicionesGridConJitter), ciclando entre
// los 6 SVG de arriba (i % longitud, no al azar: garantiza que los 6
// tipos aparezcan repartidos por igual en vez de dejarlo a la suerte) —
// misma capa fixed/baja opacidad/z-index:-1 que los patrones de los
// otros 8 temas (ver css/style.css), pero con varios íconos
// independientes en vez de un solo pseudo-elemento: por eso es un <div>
// real inyectado acá, no un ::before.
function crearCapaIconosFlotantesNavidad() {
  const capa = document.createElement("div");
  capa.className = "capa-iconos-navidad";
  capa.setAttribute("aria-hidden", "true");

  // Índices de ICONOS_NAVIDAD en tono verde pino (árbol=0, reno=2): sobre
  // el fondo verde pino del tema pierden contraste incluso antes de
  // aplicar opacidad, así que necesitan un rango más alto que el resto
  // (dorado/blanco/rojo acebo, que ya contrastan bien de por sí) para
  // leerse igual de notorios — mismo ícono, misma opacidad final
  // percibida, rango distinto por color.
  const INDICES_TONO_VERDE = new Set([0, 2]);

  const TOTAL_ICONOS = 35;
  const posiciones = generarPosicionesGridConJitter(TOTAL_ICONOS);
  for (let i = 0; i < TOTAL_ICONOS; i++) {
    const indiceIcono = i % ICONOS_NAVIDAD.length;
    const [opacidadMin, opacidadMax] = INDICES_TONO_VERDE.has(indiceIcono) ? [0.55, 0.65] : [0.35, 0.45];

    const icono = document.createElement("span");
    icono.className = "icono-flotante-navidad";
    icono.innerHTML = ICONOS_NAVIDAD[indiceIcono];
    icono.style.setProperty("--icono-top", posiciones[i].top.toFixed(1) + "vh");
    icono.style.setProperty("--icono-left", posiciones[i].left.toFixed(1) + "vw");
    icono.style.setProperty("--icono-tamano", (20 + Math.random() * 16).toFixed(0) + "px");
    icono.style.setProperty("--icono-opacidad", (opacidadMin + Math.random() * (opacidadMax - opacidadMin)).toFixed(2));
    icono.style.setProperty("--icono-duracion", (6 + Math.random() * 6).toFixed(1) + "s");
    icono.style.setProperty("--icono-delay", (-Math.random() * 10).toFixed(1) + "s");
    capa.appendChild(icono);
  }

  document.body.appendChild(capa);
}

/* ---------------------------------------------------------
   Efectos de "tema de evento": Día de Muertos — segundo evento de la
   serie, mismo patrón que Navidad arriba (ver ese bloque de comentarios
   para la explicación completa del mecanismo). La niebla (capa general)
   no necesita JS: reutiliza tal cual el mecanismo de los 8 temas
   personalizados vía css/style.css.
   --------------------------------------------------------- */
function activarEfectosDiaDeMuertos() {
  crearCapaPetalosDiaDeMuertos();
  crearCapaIconosFlotantesDiaDeMuertos();
}

// Mismo mecanismo que crearCapaNieveNavidad(), reemplazando el copo
// blanco por un pétalo naranja (con su propio keyframe caerPetalo, que
// además rota el pétalo al caer — ver css/style.css).
function crearCapaPetalosDiaDeMuertos() {
  const capa = document.createElement("div");
  capa.className = "capa-petalos-diamuertos";
  capa.setAttribute("aria-hidden", "true");

  const TOTAL_PETALOS = 35;
  for (let i = 0; i < TOTAL_PETALOS; i++) {
    const petalo = document.createElement("div");
    petalo.className = "petalo-cempasuchil";
    const duracion = 8 + Math.random() * 10;
    petalo.style.setProperty("--petalo-top", (Math.random() * 100).toFixed(1) + "vh");
    petalo.style.setProperty("--petalo-left", (Math.random() * 100).toFixed(1) + "vw");
    petalo.style.setProperty("--petalo-tamano", (5 + Math.random() * 5).toFixed(1) + "px");
    petalo.style.setProperty("--petalo-opacidad", (0.35 + Math.random() * 0.45).toFixed(2));
    petalo.style.setProperty("--petalo-deriva", (0.5 + Math.random()).toFixed(2));
    petalo.style.setProperty("--petalo-duracion", duracion.toFixed(1) + "s");
    petalo.style.setProperty("--petalo-delay", (-Math.random() * duracion).toFixed(1) + "s");
    capa.appendChild(petalo);
  }

  document.body.appendChild(capa);
}

// SVG inline propios (mismo criterio que ICONOS_NAVIDAD): el naranja
// #FF8C00 de la flor y los colores del papel picado quedan fijos SOLO
// acá, nunca variables CSS reutilizables ni aplicados a componentes
// reales de la UI.
const ICONOS_DIA_DE_MUERTOS = [
  // Calaverita (blanco/morado)
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="7" fill="#F5E6FF"/><ellipse cx="9" cy="9" rx="1.6" ry="2.2" fill="#4A1D6B"/><ellipse cx="15" cy="9" rx="1.6" ry="2.2" fill="#4A1D6B"/><path d="M12 11 L11 13.5 L13 13.5 Z" fill="#4A1D6B"/><path d="M8 15 Q12 18 16 15" stroke="#4A1D6B" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M6 17 L18 17 L16 22 L8 22 Z" fill="#F5E6FF"/></svg>',
  // Flor de cempasúchil (naranja fijo)
  '<svg viewBox="0 0 24 24"><g fill="#FF8C00"><ellipse cx="12" cy="4" rx="2.2" ry="4"/><ellipse cx="12" cy="20" rx="2.2" ry="4"/><ellipse cx="4" cy="12" rx="4" ry="2.2"/><ellipse cx="20" cy="12" rx="4" ry="2.2"/><ellipse cx="6.3" cy="6.3" rx="2.2" ry="3.6" transform="rotate(45 6.3 6.3)"/><ellipse cx="17.7" cy="17.7" rx="2.2" ry="3.6" transform="rotate(45 17.7 17.7)"/><ellipse cx="6.3" cy="17.7" rx="2.2" ry="3.6" transform="rotate(-45 6.3 17.7)"/><ellipse cx="17.7" cy="6.3" rx="2.2" ry="3.6" transform="rotate(-45 17.7 6.3)"/></g><circle cx="12" cy="12" r="3" fill="#FFB84D"/></svg>',
  // Papel picado (multicolor)
  '<svg viewBox="0 0 24 24"><path d="M2 4 H22 L20 8 H4 Z" fill="#E4007C"/><circle cx="8" cy="6" r="0.9" fill="#1A0B2E"/><circle cx="12" cy="6" r="0.9" fill="#1A0B2E"/><circle cx="16" cy="6" r="0.9" fill="#1A0B2E"/><path d="M4 8 L20 8 L18 20 L6 20 Z" fill="#6B2D8C"/><path d="M8 8 L8 20 M12 8 L12 20 M16 8 L16 20" stroke="#FF8C00" stroke-width="1" opacity="0.7"/></svg>',
  // Catrina (silueta blanco/morado)
  '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="7" ry="2" fill="#4A1D6B"/><path d="M6 14 Q6 6 12 6 Q18 6 18 14 Z" fill="#F5E6FF"/><ellipse cx="9.5" cy="11" rx="1.3" ry="1.8" fill="#4A1D6B"/><ellipse cx="14.5" cy="11" rx="1.3" ry="1.8" fill="#4A1D6B"/><path d="M12 12.5 L11.2 14.5 L12.8 14.5 Z" fill="#4A1D6B"/><path d="M4 6 Q12 -1 20 6 Q20 8 17 7 Q12 3 7 7 Q4 8 4 6Z" fill="#4A1D6B"/><circle cx="7" cy="6.5" r="1" fill="#E4007C"/><circle cx="17" cy="6.5" r="1" fill="#E4007C"/></svg>',
];

// 35 íconos (antes 12) sobre cuadrícula con jitter
// (generarPosicionesGridConJitter, definida junto a
// crearCapaIconosFlotantesNavidad), ciclando entre los 4 SVG de arriba
// (i % longitud, no al azar) — mismo mecanismo/razón que
// crearCapaIconosFlotantesNavidad(). Opacidad diferenciada por tono: la
// Catrina (índice 3) está dominada por su sombrero morado oscuro, que
// pierde contraste contra el fondo morado del tema igual que árbol/reno
// perdían contra el verde de Navidad — necesita el rango más alto.
// Calaverita/flor/papel picado ya contrastan bien de por sí (blanco,
// naranja, multicolor).
function crearCapaIconosFlotantesDiaDeMuertos() {
  const capa = document.createElement("div");
  capa.className = "capa-iconos-diamuertos";
  capa.setAttribute("aria-hidden", "true");

  const INDICES_TONO_MORADO = new Set([3]);

  const TOTAL_ICONOS = 35;
  const posiciones = generarPosicionesGridConJitter(TOTAL_ICONOS);
  for (let i = 0; i < TOTAL_ICONOS; i++) {
    const indiceIcono = i % ICONOS_DIA_DE_MUERTOS.length;
    const [opacidadMin, opacidadMax] = INDICES_TONO_MORADO.has(indiceIcono) ? [0.55, 0.65] : [0.35, 0.45];

    const icono = document.createElement("span");
    icono.className = "icono-flotante-diamuertos";
    icono.innerHTML = ICONOS_DIA_DE_MUERTOS[indiceIcono];
    icono.style.setProperty("--icono-top", posiciones[i].top.toFixed(1) + "vh");
    icono.style.setProperty("--icono-left", posiciones[i].left.toFixed(1) + "vw");
    icono.style.setProperty("--icono-tamano", (20 + Math.random() * 16).toFixed(0) + "px");
    icono.style.setProperty("--icono-opacidad", (opacidadMin + Math.random() * (opacidadMax - opacidadMin)).toFixed(2));
    icono.style.setProperty("--icono-duracion", (6 + Math.random() * 6).toFixed(1) + "s");
    icono.style.setProperty("--icono-delay", (-Math.random() * 10).toFixed(1) + "s");
    capa.appendChild(icono);
  }

  document.body.appendChild(capa);
}

/* ---------------------------------------------------------
   Efectos de "tema de evento": Regreso a Clases — tercer evento de la
   serie, mismo patrón que Navidad/Día de Muertos arriba. Los destellos
   violeta y el gradiente de fondo vibrante son puro CSS (ver
   css/style.css, "EFECTOS DE 'TEMA DE EVENTO': REGRESO A CLASES"); acá
   solo los 2 efectos que necesitan elementos inyectados por JS.
   --------------------------------------------------------- */
function activarEfectosRegresoAClases() {
  crearCapaIconosFlotantesRegresoAClases();
  crearCapaConfetiRegresoAClases();
}

// SVG inline propios, 2 tonos fijos (azul/violeta) por ícono — mismo
// criterio que ICONOS_NAVIDAD/ICONOS_DIA_DE_MUERTOS: no emoji nativo
// (no se puede recolorear con CSS), colores fijos SOLO acá, nunca
// variables CSS reutilizables ni aplicados a componentes reales de la UI.
const ICONOS_REGRESO_A_CLASES = [
  // Lápiz
  '<svg viewBox="0 0 24 24"><path d="M3 21 L5 15 L15 5 L19 9 L9 19 Z" fill="#1D63D8"/><path d="M15 5 L19 9 L21 7 L17 3 Z" fill="#7C3AED"/><path d="M3 21 L5 15 L7.5 17.5 Z" fill="#7C3AED"/></svg>',
  // Libreta (espiral)
  '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1.5" fill="#7C3AED"/><rect x="7" y="7" width="10" height="1.6" fill="#1D63D8"/><rect x="7" y="11" width="10" height="1.6" fill="#1D63D8"/><rect x="7" y="15" width="7" height="1.6" fill="#1D63D8"/><circle cx="4" cy="6" r="1" fill="#1D63D8"/><circle cx="4" cy="10" r="1" fill="#1D63D8"/><circle cx="4" cy="14" r="1" fill="#1D63D8"/><circle cx="4" cy="18" r="1" fill="#1D63D8"/></svg>',
  // Mochila
  '<svg viewBox="0 0 24 24"><path d="M8 8 V5 a4 4 0 0 1 8 0 V8" fill="none" stroke="#1D63D8" stroke-width="2"/><rect x="5" y="8" width="14" height="13" rx="3" fill="#1D63D8"/><rect x="4" y="9" width="2" height="6" rx="1" fill="#7C3AED"/><rect x="18" y="9" width="2" height="6" rx="1" fill="#7C3AED"/><rect x="9" y="11" width="6" height="6" rx="1.5" fill="#7C3AED"/></svg>',
  // Regla
  '<svg viewBox="0 0 24 24"><g transform="rotate(-8 12 13)"><rect x="2" y="10" width="20" height="6" rx="1" fill="#1D63D8"/><rect x="4" y="10" width="1.4" height="3" fill="#7C3AED"/><rect x="8" y="10" width="1.4" height="4" fill="#7C3AED"/><rect x="12" y="10" width="1.4" height="3" fill="#7C3AED"/><rect x="16" y="10" width="1.4" height="4" fill="#7C3AED"/><rect x="20" y="10" width="1.4" height="3" fill="#7C3AED"/></g></svg>',
  // Calculadora
  '<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" fill="#7C3AED"/><rect x="7" y="4" width="10" height="5" rx="1" fill="#1D63D8"/><g fill="#1D63D8"><rect x="7" y="11" width="3" height="3" rx="0.6"/><rect x="11" y="11" width="3" height="3" rx="0.6"/><rect x="15" y="11" width="3" height="3" rx="0.6"/><rect x="7" y="15" width="3" height="3" rx="0.6"/><rect x="11" y="15" width="3" height="3" rx="0.6"/><rect x="15" y="15" width="3" height="3" rx="0.6"/><rect x="7" y="19" width="7" height="2" rx="0.6"/></g></svg>',
];

// 35 íconos (antes 12) sobre cuadrícula con jitter
// (generarPosicionesGridConJitter, definida junto a
// crearCapaIconosFlotantesNavidad), ciclando entre los 5 SVG de arriba
// (i % longitud, no al azar) — mismo mecanismo que
// crearCapaIconosFlotantesNavidad(), pero SIN diferenciar opacidad por
// tono (a diferencia de Navidad/Día de Muertos): los 5 íconos ya
// alternan azul/violeta en partes similares, ninguno pierde contraste
// más que otro. Rango de opacidad más alto en general (0.45-0.65 en vez
// de 0.35-0.65) porque este es un tema de fondo CLARO — un mismo % se
// percibe mucho menos que sobre fondo oscuro (misma lección ya aplicada
// a Rosa Pastel/Menta Tecnológico/Editorial Sepia en sus patrones de
// fondo).
function crearCapaIconosFlotantesRegresoAClases() {
  const capa = document.createElement("div");
  capa.className = "capa-iconos-regresoaclases";
  capa.setAttribute("aria-hidden", "true");

  const TOTAL_ICONOS = 35;
  const posiciones = generarPosicionesGridConJitter(TOTAL_ICONOS);
  for (let i = 0; i < TOTAL_ICONOS; i++) {
    const indiceIcono = i % ICONOS_REGRESO_A_CLASES.length;

    const icono = document.createElement("span");
    icono.className = "icono-flotante-regresoaclases";
    icono.innerHTML = ICONOS_REGRESO_A_CLASES[indiceIcono];
    icono.style.setProperty("--icono-top", posiciones[i].top.toFixed(1) + "vh");
    icono.style.setProperty("--icono-left", posiciones[i].left.toFixed(1) + "vw");
    icono.style.setProperty("--icono-tamano", (20 + Math.random() * 16).toFixed(0) + "px");
    icono.style.setProperty("--icono-opacidad", (0.45 + Math.random() * 0.2).toFixed(2));
    icono.style.setProperty("--icono-duracion", (6 + Math.random() * 6).toFixed(1) + "s");
    icono.style.setProperty("--icono-delay", (-Math.random() * 10).toFixed(1) + "s");
    capa.appendChild(icono);
  }

  document.body.appendChild(capa);
}

// Colores fijos del confeti — SIN naranja ni rojo a propósito, para no
// acercarse a ningún tono de estado reservado (--color-estado-vencido,
// --color-estado-avisos-urgente, etc.) dentro de esta mezcla multicolor.
const COLORES_CONFETI_REGRESO_A_CLASES = ["#1D63D8", "#7C3AED", "#14B8A6", "#FFCA3A", "#C724B1"];

// Mismo mecanismo que crearCapaNieveNavidad()/crearCapaPetalosDiaDeMuertos()
// (capa fixed AL FRENTE, pieza con posición/velocidad/deriva/rotación
// aleatorios vía variables CSS inline), con una diferencia: cada pieza
// necesita su PROPIO color (--confeti-color), a diferencia del copo/
// pétalo que usan un solo color fijo en CSS para todas las piezas.
function crearCapaConfetiRegresoAClases() {
  const capa = document.createElement("div");
  capa.className = "capa-confeti-regresoaclases";
  capa.setAttribute("aria-hidden", "true");

  const TOTAL_PIEZAS = 35;
  for (let i = 0; i < TOTAL_PIEZAS; i++) {
    const pieza = document.createElement("div");
    pieza.className = "confeti-regresoaclases";
    const duracion = 8 + Math.random() * 10;
    const color = COLORES_CONFETI_REGRESO_A_CLASES[Math.floor(Math.random() * COLORES_CONFETI_REGRESO_A_CLASES.length)];
    pieza.style.setProperty("--confeti-color", color);
    pieza.style.setProperty("--confeti-top", (Math.random() * 100).toFixed(1) + "vh");
    pieza.style.setProperty("--confeti-left", (Math.random() * 100).toFixed(1) + "vw");
    pieza.style.setProperty("--confeti-tamano", (6 + Math.random() * 5).toFixed(1) + "px");
    pieza.style.setProperty("--confeti-opacidad", (0.55 + Math.random() * 0.35).toFixed(2));
    pieza.style.setProperty("--confeti-deriva", (0.5 + Math.random()).toFixed(2));
    pieza.style.setProperty("--confeti-duracion", duracion.toFixed(1) + "s");
    pieza.style.setProperty("--confeti-delay", (-Math.random() * duracion).toFixed(1) + "s");
    capa.appendChild(pieza);
  }

  document.body.appendChild(capa);
}

/* ---------------------------------------------------------
   Efectos de "tema de evento": Independencia — cuarto evento de la
   serie, mismo patrón que Navidad/Día de Muertos/Regreso a Clases. La
   franja tricolor (ver Fase 2) NO pasa por acá: a diferencia de los
   otros 3 efectos, no depende de patrones_fondo_activos, así que tiene
   su propia llamada incondicional en el DOMContentLoaded (sección 10).
   --------------------------------------------------------- */
function activarEfectosIndependencia() {
  crearCapaIconosFlotantesIndependencia();
  crearCapaConfetiIndependencia();
}

// Franja verde/blanco/rojo fija en el borde superior, por encima de todo
// (riel/barra inferior incluidos) — elemento estructural/identitario del
// evento, no un efecto animado. Un solo <div> contenedor con 3 hijos
// flex en vez de 3 franjas independientes, para que los tercios se
// mantengan iguales sin calcular anchos a mano.
function crearFranjaTricolorIndependencia() {
  const franja = document.createElement("div");
  franja.className = "franja-tricolor-independencia";
  franja.setAttribute("aria-hidden", "true");

  ["verde", "blanco", "rojo"].forEach((color) => {
    const seccion = document.createElement("span");
    seccion.className = "franja-tricolor-independencia__" + color;
    franja.appendChild(seccion);
  });

  document.body.appendChild(franja);
}

// SVG inline propios, mismo criterio que ICONOS_NAVIDAD/ICONOS_DIA_DE_MUERTOS/
// ICONOS_REGRESO_A_CLASES: colores fijos SOLO acá, nunca variables CSS
// reutilizables. El rojo patrio (#CE1126) queda contenido al detalle del
// listón — ningún otro ícono de este set lo usa (ver Fase 2).
const ICONOS_INDEPENDENCIA = [
  // Águila (dorado)
  '<svg viewBox="0 0 24 24"><path d="M12 3c-1 0-1.7.6-2 1.5L9 3.5 8 5l1.5 1C7 6.5 3 8 1 11c3-1 5.5-1.2 7.5-.7-1 1.2-1.5 2.7-1.3 4.2.8-1 2.1-1.8 3.3-2.1-.3 1.6 0 3.6 1 5.1l.5-2 .5 2c1-1.5 1.3-3.5 1-5.1 1.2.3 2.5 1.1 3.3 2.1.2-1.5-.3-3-1.3-4.2 2-.5 4.5-.3 7.5.7-2-3-6-4.5-8.5-5l1.5-1-1-1.5-1 1C13.7 3.6 13 3 12 3Z" fill="#D4AF37"/></svg>',
  // Listón tricolor (verde/blanco/rojo — único ícono con el rojo patrio)
  '<svg viewBox="0 0 24 24"><path d="M9 2 11 11 7 11Z" fill="#006341"/><path d="M15 2 17 11 13 11Z" fill="#CE1126"/><circle cx="12" cy="10" r="4.5" fill="#FFFFFF" stroke="#006341" stroke-width="1"/><circle cx="12" cy="10" r="2.2" fill="#CE1126"/></svg>',
  // Campana (dorado; el acento verde reemplaza el detalle que en Navidad era rojo acebo)
  '<svg viewBox="0 0 24 24"><path d="M12 2c-1 0-1.8.8-1.8 1.8v.6C7.5 5.2 6 7.8 6 11v5l-2 3h16l-2-3v-5c0-3.2-1.5-5.8-4.2-6.6v-.6C13.8 2.8 13 2 12 2z" fill="#D4AF37"/><circle cx="12" cy="21" r="1.6" fill="#D4AF37"/><path d="M9 4.5 12 3 15 4.5" stroke="#006341" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
  // Sombrero charro (blanco/dorado)
  '<svg viewBox="0 0 24 24"><path d="M12 17c-5 0-6-4-6-7 0-4 3-6 6-6s6 2 6 6c0 3-1 7-6 7Z" fill="#FFFFFF" stroke="#D4AF37" stroke-width="0.6"/><ellipse cx="12" cy="17" rx="11" ry="3" fill="#FFFFFF" stroke="#D4AF37" stroke-width="1"/><path d="M6.3 14.3c1.7.8 9.7.8 11.4 0" stroke="#D4AF37" stroke-width="1.4" fill="none"/></svg>',
];

// 35 íconos sobre cuadrícula con jitter (generarPosicionesGridConJitter,
// definida junto a crearCapaIconosFlotantesNavidad), ciclando entre los 4
// SVG de arriba. Opacidad diferenciada por tono, mismo criterio que
// Navidad/Día de Muertos: el listón (índice 1, dominado por su verde y
// rojo saturados) pierde contraste sobre este fondo claro igual que
// árbol/reno perdían contra el verde de Navidad, así que necesita el
// rango más alto; águila/campana/sombrero (dorado/blanco) ya contrastan
// bien de por sí — mismo rango base que Regreso a Clases (el otro tema
// de fondo claro de la serie).
function crearCapaIconosFlotantesIndependencia() {
  const capa = document.createElement("div");
  capa.className = "capa-iconos-independencia";
  capa.setAttribute("aria-hidden", "true");

  const INDICES_TONO_OSCURO = new Set([1]);

  const TOTAL_ICONOS = 35;
  const posiciones = generarPosicionesGridConJitter(TOTAL_ICONOS);
  for (let i = 0; i < TOTAL_ICONOS; i++) {
    const indiceIcono = i % ICONOS_INDEPENDENCIA.length;
    const [opacidadMin, opacidadMax] = INDICES_TONO_OSCURO.has(indiceIcono) ? [0.6, 0.75] : [0.45, 0.55];

    const icono = document.createElement("span");
    icono.className = "icono-flotante-independencia";
    icono.innerHTML = ICONOS_INDEPENDENCIA[indiceIcono];
    icono.style.setProperty("--icono-top", posiciones[i].top.toFixed(1) + "vh");
    icono.style.setProperty("--icono-left", posiciones[i].left.toFixed(1) + "vw");
    icono.style.setProperty("--icono-tamano", (20 + Math.random() * 16).toFixed(0) + "px");
    icono.style.setProperty("--icono-opacidad", (opacidadMin + Math.random() * (opacidadMax - opacidadMin)).toFixed(2));
    icono.style.setProperty("--icono-duracion", (6 + Math.random() * 6).toFixed(1) + "s");
    icono.style.setProperty("--icono-delay", (-Math.random() * 10).toFixed(1) + "s");
    capa.appendChild(icono);
  }

  document.body.appendChild(capa);
}

// Colores fijos del confeti — verde/blanco/rojo patrio, a diferencia del
// confeti multicolor de Regreso a Clases (acá el rojo #CE1126 SÍ se usa,
// es decorativo/de evento, no toca ningún botón/badge/toast real).
const COLORES_CONFETI_INDEPENDENCIA = ["#006341", "#FFFFFF", "#CE1126"];

// Mismo mecanismo que crearCapaConfetiRegresoAClases() (capa fixed AL
// FRENTE, --confeti-color por pieza) — reutiliza también su keyframe
// caerConfeti tal cual en css/style.css, sin duplicarlo.
function crearCapaConfetiIndependencia() {
  const capa = document.createElement("div");
  capa.className = "capa-confeti-independencia";
  capa.setAttribute("aria-hidden", "true");

  const TOTAL_PIEZAS = 35;
  for (let i = 0; i < TOTAL_PIEZAS; i++) {
    const pieza = document.createElement("div");
    pieza.className = "confeti-independencia";
    const duracion = 8 + Math.random() * 10;
    const color = COLORES_CONFETI_INDEPENDENCIA[Math.floor(Math.random() * COLORES_CONFETI_INDEPENDENCIA.length)];
    pieza.style.setProperty("--confeti-color", color);
    pieza.style.setProperty("--confeti-top", (Math.random() * 100).toFixed(1) + "vh");
    pieza.style.setProperty("--confeti-left", (Math.random() * 100).toFixed(1) + "vw");
    pieza.style.setProperty("--confeti-tamano", (6 + Math.random() * 5).toFixed(1) + "px");
    pieza.style.setProperty("--confeti-opacidad", (0.55 + Math.random() * 0.35).toFixed(2));
    pieza.style.setProperty("--confeti-deriva", (0.5 + Math.random()).toFixed(2));
    pieza.style.setProperty("--confeti-duracion", duracion.toFixed(1) + "s");
    pieza.style.setProperty("--confeti-delay", (-Math.random() * duracion).toFixed(1) + "s");
    capa.appendChild(pieza);
  }

  document.body.appendChild(capa);
}

/* ---------------------------------------------------------
   Efectos de "tema de evento": Amor y Amistad — quinto evento de la
   serie, mismo patrón que Navidad/Día de Muertos/Regreso a Clases/
   Independencia. Sin capa de partícula cayendo (nieve/pétalos/confeti):
   solo íconos flotantes + patrón de fondo (::before, ver
   css/style.css) — el evento no pidió una capa extra.
   --------------------------------------------------------- */
function activarEfectosAmorYAmistad() {
  crearCapaIconosFlotantesAmorYAmistad();
}

// SVG inline propios, mismo criterio que ICONOS_NAVIDAD/etc.: no emoji
// nativo (no se puede recolorear con CSS). Rojo clásico de San Valentín
// (#E03131) y rosa vivo (#F2478E) quedan fijos SOLO acá — nunca
// variables CSS reutilizables (Status-Color Exclusivity Rule, rojo es
// SOLO el estado "vencido/error"), mismo criterio ya documentado en el
// bloque de paleta del tema (commit e00a300).
const ICONOS_AMOR_Y_AMISTAD = [
  // Corazón (rojo clásico)
  '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7-4.4-9.5-8.8C.8 8.6 2.3 5 6 5c2 0 3.5 1.1 4 2.6C10.5 6.1 12 5 14 5c3.7 0 5.2 3.6 3.5 6.7C19 16.1 12 20.5 12 20.5Z" fill="#E03131"/></svg>',
  // Sobre con sello de corazón
  '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="15" rx="1.5" fill="#F5F5F0" stroke="#BB265A" stroke-width="1"/><path d="M2 6 L12 14 L22 6" stroke="#BB265A" stroke-width="1.4" fill="none"/><circle cx="12" cy="17" r="2.6" fill="#E03131"/></svg>',
  // Listón/moño (rosa vivo)
  '<svg viewBox="0 0 24 24"><path d="M12 12C12 12 4 8 4 4 4 2 6 2 7 3.5 8.5 6 12 12 12 12Z" fill="#F2478E"/><path d="M12 12C12 12 20 8 20 4 20 2 18 2 17 3.5 15.5 6 12 12 12 12Z" fill="#F2478E"/><circle cx="12" cy="12" r="2.2" fill="#BB265A"/><path d="M12 14 L9 21 M12 14 L15 21" stroke="#F2478E" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
  // Flor de 5 pétalos (rosa medio, centro fucsia)
  '<svg viewBox="0 0 24 24"><g fill="#F28FC2"><circle cx="12" cy="6" r="3.2"/><circle cx="17" cy="10.5" r="3.2"/><circle cx="15" cy="16.5" r="3.2"/><circle cx="9" cy="16.5" r="3.2"/><circle cx="7" cy="10.5" r="3.2"/></g><circle cx="12" cy="12" r="2.6" fill="#BB265A"/></svg>',
  // Estrella (rosa suave, mismo turquesa del tema)
  '<svg viewBox="0 0 24 24"><path d="M12 1 L14.7 8.6 L22.5 8.9 L16.3 13.7 L18.5 21.1 L12 16.8 L5.5 21.1 L7.7 13.7 L1.5 8.9 L9.3 8.6 Z" fill="#F2B8D3"/></svg>',
];

// 35 íconos sobre cuadrícula con jitter (generarPosicionesGridConJitter,
// definida junto a crearCapaIconosFlotantesNavidad), ciclando entre los
// 5 SVG de arriba — mismo mecanismo que
// crearCapaIconosFlotantesRegresoAClases()/Independencia (tema de fondo
// CLARO: rango base más alto que en temas oscuros, 0.45-0.6 en vez de
// 0.35-0.45, para que se perciban igual de notorios). Flor (índice 3) y
// estrella (índice 4) usan tonos de rosa más pálidos, cercanos al fondo
// crema/rosa del tema — necesitan el rango elevado, mismo criterio que
// el listón de Independencia contra su fondo claro.
function crearCapaIconosFlotantesAmorYAmistad() {
  const capa = document.createElement("div");
  capa.className = "capa-iconos-amoryamistad";
  capa.setAttribute("aria-hidden", "true");

  const INDICES_TONO_PALIDO = new Set([3, 4]);

  const TOTAL_ICONOS = 35;
  const posiciones = generarPosicionesGridConJitter(TOTAL_ICONOS);
  for (let i = 0; i < TOTAL_ICONOS; i++) {
    const indiceIcono = i % ICONOS_AMOR_Y_AMISTAD.length;
    const [opacidadMin, opacidadMax] = INDICES_TONO_PALIDO.has(indiceIcono) ? [0.6, 0.75] : [0.45, 0.6];

    const icono = document.createElement("span");
    icono.className = "icono-flotante-amoryamistad";
    icono.innerHTML = ICONOS_AMOR_Y_AMISTAD[indiceIcono];
    icono.style.setProperty("--icono-top", posiciones[i].top.toFixed(1) + "vh");
    icono.style.setProperty("--icono-left", posiciones[i].left.toFixed(1) + "vw");
    icono.style.setProperty("--icono-tamano", (20 + Math.random() * 16).toFixed(0) + "px");
    icono.style.setProperty("--icono-opacidad", (opacidadMin + Math.random() * (opacidadMax - opacidadMin)).toFixed(2));
    icono.style.setProperty("--icono-duracion", (6 + Math.random() * 6).toFixed(1) + "s");
    icono.style.setProperty("--icono-delay", (-Math.random() * 10).toFixed(1) + "s");
    capa.appendChild(icono);
  }

  document.body.appendChild(capa);
}

/* ---------------------------------------------------------
   Efectos de "tema de evento": Día del Maestro — sexto evento de la
   serie, mismo patrón que los 5 anteriores. Sin capa de partícula
   cayendo, mismo criterio que Amor y Amistad arriba.
   --------------------------------------------------------- */
function activarEfectosDiaDelMaestro() {
  crearCapaIconosFlotantesDiaDelMaestro();
}

// SVG inline propios, mismo criterio que el resto de ICONOS_*. La
// manzana usa un rojo clásico fijo (#C41E3A) SOLO acá — mismo criterio
// ya establecido para el rojo acebo de Navidad/el rojo patrio de
// Independencia: nunca una variable CSS reutilizable.
const ICONOS_DIA_DEL_MAESTRO = [
  // Manzana (rojo clásico, hoja verde pizarrón)
  '<svg viewBox="0 0 24 24"><path d="M12 8c-3.5 0-6 3-6 7 0 3.5 2.5 6 5 6 .8 0 1.3-.3 2-.3.7 0 1.2.3 2 .3 2.5 0 5-2.5 5-6 0-4-2.5-7-6-7-.6 0-1.2.1-1.7.3C11.9 8 12 8 12 8Z" fill="#C41E3A"/><path d="M12 8c0-1.5.6-3 2-4" stroke="#355241" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M12.5 4.5c1.2-.6 2.5-.3 3 .8-1.2.8-2.6.4-3-.8Z" fill="#355241"/></svg>',
  // Libro abierto (dorado, lomo verde pizarrón)
  '<svg viewBox="0 0 24 24"><path d="M12 5c-2-1.2-5-1.5-9-1v14c4-.5 7-.2 9 1 2-1.2 5-1.5 9-1V4c-4-.5-7-.2-9 1Z" fill="#C9B327"/><path d="M12 5v14" stroke="#355241" stroke-width="1.2"/></svg>',
  // Lápiz (dorado, punta verde pizarrón)
  '<svg viewBox="0 0 24 24"><path d="M3 21 L5 15 L15 5 L19 9 L9 19 Z" fill="#C9B327"/><path d="M15 5 L19 9 L21 7 L17 3 Z" fill="#355241"/><path d="M3 21 L5 15 L7.5 17.5 Z" fill="#355241"/></svg>',
  // Birrete de graduación (verde pizarrón, borla dorada)
  '<svg viewBox="0 0 24 24"><path d="M12 4 L23 9 L12 14 L1 9 Z" fill="#355241"/><path d="M6 11 V16 C6 18 9 19.5 12 19.5 C15 19.5 18 18 18 16 V11" stroke="#355241" stroke-width="1.4" fill="none"/><circle cx="23" cy="9" r="1" fill="#C9B327"/><line x1="23" y1="9" x2="23" y2="15" stroke="#C9B327" stroke-width="1"/></svg>',
  // Estrella de reconocimiento (dorada)
  '<svg viewBox="0 0 24 24"><path d="M12 1 L14.7 8.6 L22.5 8.9 L16.3 13.7 L18.5 21.1 L12 16.8 L5.5 21.1 L7.7 13.7 L1.5 8.9 L9.3 8.6 Z" fill="#C9B327"/></svg>',
  // Pizarrón con gis (verde pizarrón, marco y gis dorado/blanco)
  '<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="13" rx="1" fill="#355241" stroke="#C9B327" stroke-width="1"/><path d="M6 9 H14 M6 12 H11" stroke="#F5F5F0" stroke-width="1.2" stroke-linecap="round"/><rect x="9" y="19" width="6" height="2" rx="1" fill="#C9B327"/><rect x="16" y="8" width="4" height="1.6" rx="0.8" fill="#F5F5F0"/></svg>',
];

// 35 íconos sobre cuadrícula con jitter, ciclando entre los 6 SVG de
// arriba — mismo mecanismo que crearCapaIconosFlotantesNavidad() (tema
// de fondo OSCURO: mismo rango base 0.35-0.45 que Navidad/Día de
// Muertos). Birrete (índice 3) y pizarrón (índice 5) están dominados
// por el mismo verde pizarrón del fondo — pierden contraste igual que
// árbol/reno contra el verde de Navidad, así que necesitan el rango
// elevado; manzana/libro/lápiz/estrella (rojo/dorado) ya contrastan
// bien de por sí.
function crearCapaIconosFlotantesDiaDelMaestro() {
  const capa = document.createElement("div");
  capa.className = "capa-iconos-diadelmaestro";
  capa.setAttribute("aria-hidden", "true");

  const INDICES_TONO_VERDE = new Set([3, 5]);

  const TOTAL_ICONOS = 35;
  const posiciones = generarPosicionesGridConJitter(TOTAL_ICONOS);
  for (let i = 0; i < TOTAL_ICONOS; i++) {
    const indiceIcono = i % ICONOS_DIA_DEL_MAESTRO.length;
    const [opacidadMin, opacidadMax] = INDICES_TONO_VERDE.has(indiceIcono) ? [0.55, 0.65] : [0.35, 0.45];

    const icono = document.createElement("span");
    icono.className = "icono-flotante-diadelmaestro";
    icono.innerHTML = ICONOS_DIA_DEL_MAESTRO[indiceIcono];
    icono.style.setProperty("--icono-top", posiciones[i].top.toFixed(1) + "vh");
    icono.style.setProperty("--icono-left", posiciones[i].left.toFixed(1) + "vw");
    icono.style.setProperty("--icono-tamano", (20 + Math.random() * 16).toFixed(0) + "px");
    icono.style.setProperty("--icono-opacidad", (opacidadMin + Math.random() * (opacidadMax - opacidadMin)).toFixed(2));
    icono.style.setProperty("--icono-duracion", (6 + Math.random() * 6).toFixed(1) + "s");
    icono.style.setProperty("--icono-delay", (-Math.random() * 10).toFixed(1) + "s");
    capa.appendChild(icono);
  }

  document.body.appendChild(capa);
}

/* ---------------------------------------------------------
   Efectos de "tema de evento": Fin de Curso — séptimo evento de la
   serie, mismo patrón que los 6 anteriores. Sin capa de partícula
   cayendo, mismo criterio que Amor y Amistad/Día del Maestro arriba.
   --------------------------------------------------------- */
function activarEfectosFinDeCurso() {
  crearCapaIconosFlotantesFinDeCurso();
}

// SVG inline propios, mismo criterio que el resto de ICONOS_*. El sol
// usa un naranja fijo (#F2994A) SOLO para sus rayos — mismo criterio ya
// establecido para el rojo de Amor y Amistad/el rojo acebo de Navidad:
// nunca una variable CSS reutilizable (naranja es SOLO
// --color-estado-progreso/pendiente, Status-Color Exclusivity Rule).
const ICONOS_FIN_DE_CURSO = [
  // Sol (amarillo del tema, rayos naranja fijo)
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#FFE53C"/><g stroke="#F2994A" stroke-width="1.6" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/><line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/></g></svg>',
  // Birrete de graduación (azul cielo, borla amarilla)
  '<svg viewBox="0 0 24 24"><path d="M12 4 L23 9 L12 14 L1 9 Z" fill="#0284C7"/><path d="M6 11 V16 C6 18 9 19.5 12 19.5 C15 19.5 18 18 18 16 V11" stroke="#0284C7" stroke-width="1.4" fill="none"/><circle cx="23" cy="9" r="1" fill="#FFE53C"/><line x1="23" y1="9" x2="23" y2="15" stroke="#FFE53C" stroke-width="1"/></svg>',
  // Globo (azul cielo, nudo amarillo)
  '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="9" rx="7" ry="8" fill="#0284C7"/><path d="M12 17 L10 19 L12 21 L14 19 Z" fill="#FFE53C"/><path d="M12 21C12 21 11 22.5 12 23.5" stroke="#0284C7" stroke-width="1" fill="none"/></svg>',
  // Avión de papel (azul cielo, ala clara)
  '<svg viewBox="0 0 24 24"><path d="M2 12 L22 3 L14 22 L11 14 Z" fill="#0284C7"/><path d="M2 12 L11 14 L14 22 Z" fill="#65B5E3"/></svg>',
  // Estrella (amarilla)
  '<svg viewBox="0 0 24 24"><path d="M12 1 L14.7 8.6 L22.5 8.9 L16.3 13.7 L18.5 21.1 L12 16.8 L5.5 21.1 L7.7 13.7 L1.5 8.9 L9.3 8.6 Z" fill="#FFE53C"/></svg>',
];

// 35 íconos sobre cuadrícula con jitter, ciclando entre los 5 SVG de
// arriba — mismo mecanismo que Regreso a Clases/Independencia (tema de
// fondo CLARO: rango base 0.45-0.6). Birrete/globo/avión (índices 1-3)
// están dominados por el mismo azul cielo del fondo — pierden contraste
// igual que el listón de Independencia contra su fondo claro, así que
// necesitan el rango elevado; sol/estrella (amarillo/naranja) ya
// contrastan bien de por sí.
function crearCapaIconosFlotantesFinDeCurso() {
  const capa = document.createElement("div");
  capa.className = "capa-iconos-findecurso";
  capa.setAttribute("aria-hidden", "true");

  const INDICES_TONO_AZUL = new Set([1, 2, 3]);

  const TOTAL_ICONOS = 35;
  const posiciones = generarPosicionesGridConJitter(TOTAL_ICONOS);
  for (let i = 0; i < TOTAL_ICONOS; i++) {
    const indiceIcono = i % ICONOS_FIN_DE_CURSO.length;
    const [opacidadMin, opacidadMax] = INDICES_TONO_AZUL.has(indiceIcono) ? [0.6, 0.75] : [0.45, 0.6];

    const icono = document.createElement("span");
    icono.className = "icono-flotante-findecurso";
    icono.innerHTML = ICONOS_FIN_DE_CURSO[indiceIcono];
    icono.style.setProperty("--icono-top", posiciones[i].top.toFixed(1) + "vh");
    icono.style.setProperty("--icono-left", posiciones[i].left.toFixed(1) + "vw");
    icono.style.setProperty("--icono-tamano", (20 + Math.random() * 16).toFixed(0) + "px");
    icono.style.setProperty("--icono-opacidad", (opacidadMin + Math.random() * (opacidadMax - opacidadMin)).toFixed(2));
    icono.style.setProperty("--icono-duracion", (6 + Math.random() * 6).toFixed(1) + "s");
    icono.style.setProperty("--icono-delay", (-Math.random() * 10).toFixed(1) + "s");
    capa.appendChild(icono);
  }

  document.body.appendChild(capa);
}

/* =========================================================
   8. BARRA LATERAL / BARRA INFERIOR Y FILTRO DE GRUPO
   ========================================================= */

// ---- Barra lateral legada de una sola columna (código muerto) ----
// Colapsa/expande la barra lateral a un riel de solo íconos (ver
// .barra-lateral--colapsada en css/style.css). Quedó sin ningún <aside
// class="barra-lateral"> que la use tras migrar sitemap.html y
// admin.html (las dos últimas) al riel de navegación — se deja tal cual
// (no-op seguro en toda página) en vez de borrarla en ese mismo cambio;
// candidata a limpieza en un pase aparte.
function aplicarEstadoSidebarColapsada(colapsada) {
  document.body.classList.toggle("body--sidebar-colapsada", colapsada);

  const barraLateral = document.querySelector(".barra-lateral");
  if (barraLateral) barraLateral.classList.toggle("barra-lateral--colapsada", colapsada);

  const boton = document.getElementById("boton-colapsar-sidebar");
  if (boton) {
    boton.setAttribute("aria-expanded", String(!colapsada));
    boton.setAttribute("aria-label", colapsada ? "Expandir menú lateral" : "Colapsar menú lateral");
    const icono = boton.querySelector("span");
    if (icono) icono.textContent = colapsada ? "▶" : "◀";
  }
}

function alternarSidebarColapsada() {
  // Se guarda en localStorage para que el estado no se reinicie al
  // navegar entre la portada y las páginas de trimestre.
  sidebarColapsada = !sidebarColapsada;
  localStorage.setItem(CLAVE_SIDEBAR_COLAPSADA, String(sidebarColapsada));
  aplicarEstadoSidebarColapsada(sidebarColapsada);
}

function aplicarEstadoSubmenu(grupo, expandido) {
  const boton = document.querySelector('.barra-lateral__nav-toggle[data-grupo="' + grupo + '"]');
  const submenu = document.getElementById("submenu-" + grupo);
  if (!boton || !submenu) return;
  boton.setAttribute("aria-expanded", String(expandido));
  submenu.hidden = !expandido;
}

// Código muerto (ver nota de aplicarEstadoSidebarColapsada arriba): ese
// selector .barra-lateral__nav-toggle ya no existe en ninguna página.
function activarSubmenusSidebar() {
  ["inicio", "trimestre"].forEach((grupo) => {
    const clave = grupo === "inicio" ? CLAVE_SUBMENU_INICIO : CLAVE_SUBMENU_TRIMESTRE;
    aplicarEstadoSubmenu(grupo, localStorage.getItem(clave) === "true");

    const boton = document.querySelector('.barra-lateral__nav-toggle[data-grupo="' + grupo + '"]');
    if (!boton) return;
    boton.addEventListener("click", () => {
      const nuevoEstado = boton.getAttribute("aria-expanded") !== "true";
      localStorage.setItem(clave, String(nuevoEstado));
      aplicarEstadoSubmenu(grupo, nuevoEstado);
    });
  });
}

// ---- Motor genérico de paneles con disparador (flyouts del riel y
// bottom sheets de la barra inferior comparten esta misma mecánica) ----
// Cada botón con aria-haspopup="true" dentro de selectorDisparadores abre
// su panel asociado, indicado por aria-controls. Reglas de cierre: clic
// fuera del panel Y de su botón trigger, tecla Escape, o clic de nuevo en
// el mismo botón trigger (toggle) — solo un panel abierto a la vez. No se
// usa <dialog> (no cubre el patrón trigger/panel ni "clic afuera"), así
// que el retorno de foco al trigger se implementa a mano en cada cierre.
// opciones.alAbrir/alCerrar son ganchos opcionales para efectos extra
// (bloqueo de scroll, backdrop) que solo necesitan los sheets móviles.
// Devuelve un controlador con cerrarPanel() para que el llamador pueda
// cerrar el panel abierto desde fuera (ej. gesto de swipe).
function activarPanelesConDisparador(selectorDisparadores, claseVisible, opciones = {}) {
  const disparadores = Array.from(document.querySelectorAll(selectorDisparadores));
  if (disparadores.length === 0) return null;

  const prefiereMovimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURACION_MS = prefiereMovimientoReducido ? 0 : (opciones.duracionMs ?? 180);

  let panelAbierto = null; // { boton, panel }

  function cerrarPanel(devolverFoco) {
    if (!panelAbierto) return;
    const { boton, panel } = panelAbierto;
    panel.classList.remove(claseVisible);
    boton.setAttribute("aria-expanded", "false");
    setTimeout(() => { panel.hidden = true; }, DURACION_MS);
    panelAbierto = null;
    opciones.alCerrar?.(panel);
    if (devolverFoco) boton.focus();
  }

  function abrirPanel(boton, panel) {
    if (panelAbierto) cerrarPanel(false);
    panel.hidden = false;
    // Fuerza un reflow para que el cambio de "hidden" a visible no se
    // funda con la transición de entrada (si no, el navegador nunca ve
    // el estado inicial opacity:0 y no anima nada).
    void panel.offsetWidth;
    panel.classList.add(claseVisible);
    boton.setAttribute("aria-expanded", "true");
    panelAbierto = { boton, panel };
    opciones.alAbrir?.(panel);
  }

  disparadores.forEach((boton) => {
    const panel = document.getElementById(boton.getAttribute("aria-controls"));
    if (!panel) return;

    boton.addEventListener("click", () => {
      if (panelAbierto?.panel === panel) cerrarPanel(true);
      else abrirPanel(boton, panel);
    });

    // Los enlaces dentro del panel navegan (anclas locales o a otra
    // página); cerrarlo al hacer clic en uno evita dejarlo superpuesto
    // sobre el contenido después de saltar de sección.
    panel.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", () => cerrarPanel(false));
    });
  });

  document.addEventListener("click", (evento) => {
    if (!panelAbierto) return;
    const { boton, panel } = panelAbierto;
    if (panel.contains(evento.target) || boton.contains(evento.target)) return;
    cerrarPanel(true);
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && panelAbierto) cerrarPanel(true);
  });

  return { cerrarPanel: () => cerrarPanel(true) };
}

// Aplica el multiplicador del nivel (slug de NIVELES_ESCALA_TEXTO) al
// <html> y sincroniza el estado (etiqueta + disabled de A−/A+) de cada
// .control-escala-texto — hay 2 por página, igual que .boton-tema
// (flyout de escritorio + sheet de Perfil en móvil).
function aplicarEscalaTexto(slug) {
  const indice = NIVELES_ESCALA_TEXTO.findIndex((nivel) => nivel.slug === slug);
  const nivel = NIVELES_ESCALA_TEXTO[indice] || NIVELES_ESCALA_TEXTO[0];

  document.documentElement.style.setProperty("--escala-texto", String(nivel.multiplicador));

  document.querySelectorAll(".control-escala-texto").forEach((control) => {
    const etiquetaNivel = control.querySelector(".control-escala-texto__nivel");
    if (etiquetaNivel) etiquetaNivel.textContent = nivel.nombre;

    const disminuir = control.querySelector(".control-escala-texto__disminuir");
    if (disminuir) {
      const deshabilitado = indice <= 0;
      disminuir.disabled = deshabilitado;
      disminuir.setAttribute("aria-disabled", String(deshabilitado));
    }

    const aumentar = control.querySelector(".control-escala-texto__aumentar");
    if (aumentar) {
      const deshabilitado = indice >= NIVELES_ESCALA_TEXTO.length - 1;
      aumentar.disabled = deshabilitado;
      aumentar.setAttribute("aria-disabled", String(deshabilitado));
    }
  });
}

// Guarda el nivel elegido y lo aplica de inmediato — a diferencia de
// seleccionarTema(), esto no tiene contraparte en Supabase (es
// puramente local), así que no hay nada async que esperar. Anuncia el
// cambio reutilizando el mismo mecanismo aria-live que ya usa el resto
// del sitio (#contenedor-toast, ver mostrarToast) en vez de armar una
// región propia.
function seleccionarEscalaTexto(slug) {
  if (slug === escalaTextoActual) return;
  escalaTextoActual = slug;
  localStorage.setItem(CLAVE_ESCALA_TEXTO, slug);
  aplicarEscalaTexto(slug);

  const nivel = NIVELES_ESCALA_TEXTO.find((n) => n.slug === slug);
  mostrarToast("Tamaño de texto: " + (nivel?.nombre || slug), { icono: "🔎" });
}

// Arma el control de 3 partes (A−, nivel actual, A+). Se construye por
// JS en vez de hardcodearse en cada página: así basta con esta función
// (llamada desde activarControlEscalaTexto) para que aparezca en las 10
// páginas públicas del sitio sin duplicar el markup en cada una.
function construirControlEscalaTexto() {
  const contenedor = document.createElement("div");
  contenedor.className = "control-escala-texto riel-flyout__campo";

  const etiquetaCampo = document.createElement("span");
  etiquetaCampo.className = "control-escala-texto__etiqueta";
  etiquetaCampo.textContent = "Tamaño de texto";

  const fila = document.createElement("div");
  fila.className = "control-escala-texto__fila";

  const disminuir = document.createElement("button");
  disminuir.type = "button";
  disminuir.className = "control-escala-texto__boton control-escala-texto__disminuir";
  disminuir.setAttribute("aria-label", "Disminuir tamaño de texto");
  disminuir.textContent = "A−";
  disminuir.addEventListener("click", () => {
    const indice = NIVELES_ESCALA_TEXTO.findIndex((nivel) => nivel.slug === escalaTextoActual);
    if (indice > 0) seleccionarEscalaTexto(NIVELES_ESCALA_TEXTO[indice - 1].slug);
  });

  const etiquetaNivel = document.createElement("span");
  etiquetaNivel.className = "control-escala-texto__nivel";

  const aumentar = document.createElement("button");
  aumentar.type = "button";
  aumentar.className = "control-escala-texto__boton control-escala-texto__aumentar";
  aumentar.setAttribute("aria-label", "Aumentar tamaño de texto");
  aumentar.textContent = "A+";
  aumentar.addEventListener("click", () => {
    const indice = NIVELES_ESCALA_TEXTO.findIndex((nivel) => nivel.slug === escalaTextoActual);
    if (indice < NIVELES_ESCALA_TEXTO.length - 1) seleccionarEscalaTexto(NIVELES_ESCALA_TEXTO[indice + 1].slug);
  });

  fila.append(disminuir, etiquetaNivel, aumentar);
  contenedor.append(etiquetaCampo, fila);
  return contenedor;
}

// Inserta el control justo después de "Elegir tema" (.riel-flyout__tema)
// en los 2 paneles de Ajustes del sitio: #flyout-ajustes (riel de
// escritorio) y #sheet-perfil (sheet de Perfil en móvil, ver el
// subtítulo "Ajustes" dentro de ese sheet). Se ancla en
// .riel-flyout__tema y no en .boton-tema a secas: admin.html también
// tiene un .boton-tema propio (header del panel docente) que no lleva
// esa clase extra, así que queda fuera a propósito — el panel docente no
// forma parte de las 10 páginas públicas de este control.
function activarControlEscalaTexto() {
  document.querySelectorAll(".riel-flyout__tema").forEach((botonTema) => {
    botonTema.insertAdjacentElement("afterend", construirControlEscalaTexto());
  });
  aplicarEscalaTexto(escalaTextoActual);
}

// Trigger vanilla del tooltip flotante (.tooltip-disparador +
// .tooltip-flotante, ver css/style.css) — cubre hover de mouse, foco de
// teclado, y tap en touch. Ninguna librería de tooltips (Radix, React
// Aria) soporta las 3 a la vez en touch (el toque las cierra en vez de
// abrirlas), así que el trigger es propio. El title nativo +
// aria-describedby + .sr-only del disparador (ya en el HTML) no se
// tocan aquí: ese es el camino real para lector de pantalla, este
// tooltip es 100% visual y adicional.
//
// "abierto" vive a nivel de módulo (no local a activarTooltipsInfo) y el
// listener de document se registra una sola vez con
// tooltipsDocumentListenerActivo: esta función necesita poder llamarse
// varias veces sin re-adjuntar ese listener ni perder de vista el
// tooltip abierto por una llamada anterior. Motivo: los disparadores de
// los 3 íconos ⓘ (criterio-tarjeta__info) son estáticos y solo se
// wirean una vez al cargar, pero los de #proximas-fechas-trimestre
// (crearBadgeEstadoCompacto) se reconstruyen en cada renderizarTodo()
// (cambio de grupo/sesión) — dataset.tooltipActivado evita
// re-adjuntar listeners a un disparador que ya los tiene, igual que
// dataset.activado en otras funciones de este archivo.
let tooltipAbierto = null;
let tooltipsDocumentListenerActivo = false;

function cerrarTooltipInfo() {
  if (!tooltipAbierto) return;
  tooltipAbierto.querySelector(".tooltip-flotante")?.classList.remove("tooltip-flotante--visible");
  tooltipAbierto = null;
}

function abrirTooltipInfo(disparador) {
  if (tooltipAbierto === disparador) return;
  cerrarTooltipInfo();
  disparador.querySelector(".tooltip-flotante")?.classList.add("tooltip-flotante--visible");
  tooltipAbierto = disparador;
}

function activarTooltipsInfo() {
  const disparadores = document.querySelectorAll(".tooltip-disparador:not([data-tooltip-activado])");

  disparadores.forEach((disparador) => {
    disparador.dataset.tooltipActivado = "true";
    disparador.addEventListener("mouseenter", () => abrirTooltipInfo(disparador));
    disparador.addEventListener("mouseleave", () => {
      if (tooltipAbierto === disparador) cerrarTooltipInfo();
    });
    disparador.addEventListener("focus", () => abrirTooltipInfo(disparador));
    disparador.addEventListener("blur", () => {
      if (tooltipAbierto === disparador) cerrarTooltipInfo();
    });
    // touchstart en vez de click: responde de inmediato al tap, sin
    // esperar el retraso de ~300ms que algunos navegadores móviles
    // aplican al evento click. El "click" sintético que sigue a ese
    // mismo tap sí llega hasta el listener de document de abajo, pero
    // como el target cae dentro de este mismo disparador, .contains()
    // lo deja intacto — no se cierra solo al abrirlo.
    disparador.addEventListener("touchstart", () => abrirTooltipInfo(disparador), { passive: true });
  });

  // Un solo document.addEventListener("click") cierra al tocar/hacer
  // clic afuera — mismo patrón que ya usa activarPanelesConDisparador()
  // (arriba) para los flyouts del riel, con .contains() en vez de un
  // listener por disparador. Un solo "abierto" a la vez, igual que esos
  // paneles: no hace falta rastrear varios tooltips abiertos porque solo
  // uno puede tener foco/hover/tap al mismo tiempo.
  if (tooltipsDocumentListenerActivo) return;
  tooltipsDocumentListenerActivo = true;
  document.addEventListener("click", (evento) => {
    if (!tooltipAbierto) return;
    if (tooltipAbierto.contains(evento.target)) return;
    cerrarTooltipInfo();
  });
}

// Riel de navegación (Discord/Notion-style, desktop ≥1024px).
function activarFlyoutsRiel() {
  activarPanelesConDisparador('.riel [aria-haspopup="true"]', "riel-flyout--visible");
}

// Barra inferior + bottom sheets (móvil <1024px): mismo motor que el
// riel, con dos extras propios de un sheet — backdrop semitransparente
// detrás y bloqueo de scroll del body mientras está abierto — y cierre
// adicional por swipe hacia abajo sobre el propio sheet.
function activarSheetsMovil() {
  const backdrop = document.getElementById("sheet-backdrop");
  const prefiereMovimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURACION_MS = prefiereMovimientoReducido ? 0 : 220;

  const controlador = activarPanelesConDisparador(
    '.barra-inferior [aria-haspopup="true"]',
    "bottom-sheet--visible",
    {
      duracionMs: DURACION_MS,
      alAbrir: () => {
        document.body.classList.add("body--sheet-abierto");
        if (!backdrop) return;
        backdrop.hidden = false;
        void backdrop.offsetWidth;
        backdrop.classList.add("sheet-backdrop--visible");
      },
      alCerrar: () => {
        document.body.classList.remove("body--sheet-abierto");
        if (!backdrop) return;
        backdrop.classList.remove("sheet-backdrop--visible");
        setTimeout(() => { backdrop.hidden = true; }, DURACION_MS);
      },
    }
  );
  if (!controlador) return;

  // Cierre por swipe hacia abajo: umbral simple de distancia vertical
  // entre touchstart y touchend, sin inercia ni seguimiento visual del
  // dedo (el sheet ya anima su salida vía CSS al recibir la clase
  // "visible" — ver activarPanelesConDisparador).
  const UMBRAL_SWIPE_PX = 60;
  document.querySelectorAll(".bottom-sheet").forEach((sheet) => {
    let inicioY = null;

    sheet.addEventListener("touchstart", (evento) => {
      inicioY = evento.touches[0].clientY;
    }, { passive: true });

    sheet.addEventListener("touchend", (evento) => {
      if (inicioY == null) return;
      const distancia = evento.changedTouches[0].clientY - inicioY;
      inicioY = null;
      if (distancia > UMBRAL_SWIPE_PX) controlador.cerrarPanel();
    }, { passive: true });
  });
}

// Los enlaces de la barra lateral que apuntan a secciones dentro de una
// página de trimestre (identificados por data-enlace en el HTML),
// separados según a qué página quedaron (Teoría: trimestre-N.html,
// Práctica: trimestre-N-practica.html — ver división de Fase 7). En una
// página de trimestre ya son anclas locales ("#temario") y no se tocan;
// en el resto de páginas públicas se reescriben usando ultimoTrimestreVisto.
const ANCLAS_TEORIA = ["temario", "infografias", "presentaciones", "videos"];
const ANCLAS_PRACTICA = [
  "proximas-fechas-trimestre",
  "tareas",
  "entrega",
  "rubricas",
  "actividades",
  "proyectos",
];

// Puebla a la vez el flyout de Trimestre del riel (desktop) y el sheet de
// Trimestre de la barra inferior (móvil): mismo dato (badge, píldora
// "Activo", candados, anclas, tab activa), dos contenedores según
// breakpoint — por eso todas las consultas de abajo son de página
// completa (querySelectorAll/[data-*]), no escopeadas a un único flyout.
function actualizarEnlacesTrimestreEnSidebar() {
  // El badge del ícono "Trimestre" (riel y barra inferior) refleja
  // ultimoTrimestreVisto en cualquier página (incluidas las de trimestre,
  // donde ya coincide con TRIMESTRE_ACTUAL — ver la sincronización en la
  // sección 2).
  document.querySelectorAll(".trimestre-badge").forEach((badge) => {
    badge.textContent = ultimoTrimestreVisto;
  });

  // Píldora "Activo" junto al título del flyout/sheet: solo si el
  // trimestre que se está mostrando ahí (TRIMESTRE_ACTUAL en páginas de
  // trimestre, ultimoTrimestreVisto en el resto) es el mismo que
  // trimestreDesbloqueado — no simplemente "el que se visitó por última
  // vez". Corre en las 7 páginas, antes del early-return de abajo (ese
  // early-return es solo para el reescrito de anclas/tabs, que no aplica
  // en páginas de trimestre).
  const numeroMostrado = Number(TRIMESTRE_ACTUAL || ultimoTrimestreVisto);
  const estadoMostrado = calcularEstadoTrimestre(numeroMostrado);
  document.querySelectorAll(".pill-activo-trimestre").forEach((pill) => {
    pill.hidden = estadoMostrado !== "actual";
  });

  // Candado 🔒 en las mini-tabs 1°/2°/3° que todavía no se desbloquean —
  // también corre en las 7 páginas (incluidas las de trimestre: p. ej.
  // trimestre-1.html debe poder mostrar "3°" bloqueado). Es solo un
  // indicador visual: no intercepta el clic ni reemplaza la guarda real
  // de acceso (ver guardTrimestreDesbloqueado(), sección 2).
  document.querySelectorAll(".riel-flyout__trimestre-tab[data-trimestre-tab]").forEach((tab) => {
    const numero = Number(tab.dataset.trimestreTab);
    const bloqueada = calcularEstadoTrimestre(numero) === "proximamente";
    tab.classList.toggle("riel-flyout__trimestre-tab--bloqueada", bloqueada);
    const numeroTexto = numero + "°";
    tab.textContent = bloqueada ? "🔒 " + numeroTexto : numeroTexto;
  });

  if (TRIMESTRE_ACTUAL) return;

  ANCLAS_TEORIA.forEach((id) => {
    document.querySelectorAll('[data-enlace="' + id + '"]').forEach((enlace) => {
      enlace.href = "trimestre-" + ultimoTrimestreVisto + ".html#" + id;
    });
  });

  ANCLAS_PRACTICA.forEach((id) => {
    document.querySelectorAll('[data-enlace="' + id + '"]').forEach((enlace) => {
      enlace.href = "trimestre-" + ultimoTrimestreVisto + "-practica.html#" + id;
    });
  });

  document.querySelectorAll("[data-texto-trimestre]").forEach((texto) => {
    texto.textContent = "Trimestre " + ultimoTrimestreVisto;
  });

  document.querySelectorAll(".riel-flyout__trimestre-tab[data-trimestre-tab]").forEach((tab) => {
    const activo = tab.dataset.trimestreTab === ultimoTrimestreVisto;
    tab.classList.toggle("riel-flyout__trimestre-tab--activo", activo);
    tab.setAttribute("aria-selected", String(activo));
  });
}

// Selector Teoría/Práctica dentro de #flyout-trimestre y #sheet-trimestre
// (2 copias en el DOM, mismo patrón que el resto de esta sección: alterna
// cuál de las 2 listas de .riel-flyout__lista hermanas se muestra, sin
// navegar — por eso son <button>, no <a>). data-modo-defecto en
// .riel-flyout__modo-selector fija qué mitad se ve al cargar: "teoria" en
// trimestre-N.html, "practica" en trimestre-N-practica.html y en el resto
// de páginas públicas (mismo orden de prioridad que ya tenía el menú
// antes de esta división, con Tareas/Entrega primero).
function activarSelectorModoTrimestre() {
  document.querySelectorAll(".riel-flyout__modo-selector").forEach((selector) => {
    if (selector.dataset.activado) return;
    selector.dataset.activado = "true";

    const contenedor = selector.parentElement;
    const listaTeoria = contenedor.querySelector('[data-modo-lista="teoria"]');
    const listaPractica = contenedor.querySelector('[data-modo-lista="practica"]');
    const tarjetaTeoria = selector.querySelector('[data-modo-tarjeta="teoria"]');
    const tarjetaPractica = selector.querySelector('[data-modo-tarjeta="practica"]');
    if (!listaTeoria || !listaPractica || !tarjetaTeoria || !tarjetaPractica) return;

    // Tabs 1°/2°/3° del mismo contenedor: reescribe su destino para que
    // preserven el modo activo (ej. con Práctica activa, "2°" debe llevar
    // a trimestre-2-practica.html, no a trimestre-2.html). Corre en las
    // 13 páginas por igual — en trimestre-N.html/trimestre-N-practica.html
    // esto sustituye el href hardcodeado del HTML; en el resto de páginas
    // complementa (no reemplaza) el toggle de clase activa/candado que ya
    // hace actualizarEnlacesTrimestreEnSidebar().
    const tabs = contenedor.querySelectorAll(".riel-flyout__trimestre-tab[data-trimestre-tab]");

    function mostrarModo(modo) {
      const esTeoria = modo === "teoria";
      listaTeoria.hidden = !esTeoria;
      listaPractica.hidden = esTeoria;
      tarjetaTeoria.classList.toggle("riel-flyout__modo-tarjeta--activo", esTeoria);
      tarjetaTeoria.setAttribute("aria-pressed", String(esTeoria));
      tarjetaPractica.classList.toggle("riel-flyout__modo-tarjeta--activo", !esTeoria);
      tarjetaPractica.setAttribute("aria-pressed", String(!esTeoria));
      tabs.forEach((tab) => {
        tab.href = "trimestre-" + tab.dataset.trimestreTab + (esTeoria ? "" : "-practica") + ".html";
      });
    }

    tarjetaTeoria.addEventListener("click", () => mostrarModo("teoria"));
    tarjetaPractica.addEventListener("click", () => mostrarModo("practica"));

    mostrarModo(selector.dataset.modoDefecto || "practica");
  });
}

// Compara `numero` contra trimestreDesbloqueado (el control real de
// acceso; ultimoTrimestreVisto solo sirve para los enlaces del sidebar,
// no para esto) y devuelve su estado: "finalizado", "actual" o
// "proximamente". Usado por actualizarEstadoTarjetasTrimestre() (tarjetas
// de la portada) y por actualizarEnlacesTrimestreEnSidebar() (píldora
// "Activo" y candados 🔒 de las mini-tabs), para no duplicar el cálculo.
// Todos los llamadores esperan primero promesaTrimestreDesbloqueado (ver
// sección 10), así que trimestreDesbloqueado ya está resuelto aquí.
function calcularEstadoTrimestre(numero) {
  if (numero < trimestreDesbloqueado) return "finalizado";
  if (numero === trimestreDesbloqueado) return "actual";
  return "proximamente";
}

const TEXTO_ESTADO_TRIMESTRE = {
  finalizado: "Finalizado",
  actual: "Actual",
  proximamente: "🔒 Próximamente",
};

// Marca cada .tarjeta-trimestre de la portada con el estado calculado por
// calcularEstadoTrimestre(). Las tarjetas "proximamente" son <a href>
// funcionales en el HTML (por si se quita el bloqueo más adelante), así
// que aquí también se intercepta su clic para que no naveguen mientras
// sigan bloqueadas.
function actualizarEstadoTarjetasTrimestre() {
  const tarjetas = document.querySelectorAll(".tarjeta-trimestre[data-trimestre]");
  if (tarjetas.length === 0) return;

  tarjetas.forEach((tarjeta) => {
    const numero = Number(tarjeta.dataset.trimestre);
    const etiqueta = tarjeta.querySelector(".tarjeta-trimestre__estado");
    const estado = calcularEstadoTrimestre(numero);

    tarjeta.dataset.estado = estado;
    if (etiqueta) etiqueta.textContent = TEXTO_ESTADO_TRIMESTRE[estado];
    // Borde animado (.borde-animado-acento, ver css/style.css) solo en la
    // tarjeta del trimestre actual — migra sola en cada carga siguiendo a
    // trimestreDesbloqueado, sin tocar calcularEstadoTrimestre() ni el
    // resto del sistema de estados.
    tarjeta.classList.toggle("borde-animado-acento", estado === "actual");

    tarjeta.addEventListener("click", (evento) => {
      if (tarjeta.dataset.estado === "proximamente") {
        evento.preventDefault();
        mostrarMensajeTrimestreBloqueado();
      }
    });
  });
}

// Mensaje accesible (aria-live, ver #mensaje-trimestre-bloqueado en
// index.html) que se muestra al intentar entrar a un trimestre bloqueado
// desde su tarjeta en la portada.
function mostrarMensajeTrimestreBloqueado() {
  const mensaje = document.getElementById("mensaje-trimestre-bloqueado");
  if (mensaje) mensaje.textContent = "Este trimestre aún no está disponible.";
}

// Actualiza el tercer nivel de las migas de pan ("Inicio > Trimestre X >
// [Sección]") con el nombre de la sección que el observer marcó como
// activa. Si la página no tiene migas de pan (por ejemplo la portada),
// los getElementById devuelven null y la función no hace nada.
function actualizarMigaDeSeccion(enlaceActivo) {
  if (!enlaceActivo) return;

  const separador = document.getElementById("miga-separador-seccion");
  const item = document.getElementById("miga-item-seccion");
  const texto = document.getElementById("miga-seccion");
  const migaTrimestre = document.getElementById("miga-trimestre");
  if (!separador || !item || !texto) return;

  texto.textContent = enlaceActivo.textContent;
  texto.setAttribute("aria-current", "page");
  if (migaTrimestre) migaTrimestre.removeAttribute("aria-current");

  separador.hidden = false;
  item.hidden = false;
}

// Botón flotante simple "Volver arriba" (desktop y móvil). Antes era un
// FAB expandible con tema/trimestre-pills/"Ir a..." además de esto; esas
// tres cosas ya tienen equivalente propio (Ajustes del riel/sheet Perfil,
// mini-tabs de Trimestre, contenido de los flyouts/sheets) y se quitaron
// de aquí para no duplicar la misma función en dos lugares de la interfaz.
function activarBotonVolverArriba() {
  const boton = document.getElementById("boton-volver-arriba");
  if (!boton) return;

  const UMBRAL_PX = 400;
  let actualizacionPendiente = false;

  function actualizarEstado() {
    boton.hidden = window.scrollY <= UMBRAL_PX;
    actualizacionPendiente = false;
  }

  // requestAnimationFrame evita recalcular en cada pixel de scroll: como
  // mucho se actualiza una vez por frame, aunque el navegador dispare
  // el evento "scroll" muchas más veces que eso.
  window.addEventListener(
    "scroll",
    () => {
      if (actualizacionPendiente) return;
      actualizacionPendiente = true;
      window.requestAnimationFrame(actualizarEstado);
    },
    { passive: true }
  );

  actualizarEstado(); // por si la página carga con scroll ya restaurado

  boton.addEventListener("click", () => {
    const prefiereMovimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: prefiereMovimientoReducido ? "auto" : "smooth" });
  });
}

// Resalta en el menú el enlace de la sección que se está viendo mientras
// el usuario hace scroll (ej. Temario, Rúbricas, Tareas…). Se basa en
// IntersectionObserver en vez de un listener de "scroll" para no volver a
// calcular esto en cada pixel de desplazamiento. La marca visual (clase
// .nav-link--activo) se aplica al enlace del menú aunque el menú esté
// colapsado en móvil, así que ya aparece resaltado al abrirlo.
function activarResaltadoDeNavegacion() {
  if (typeof IntersectionObserver === "undefined") return;

  // .nav-anclas marca las listas de enlaces de Inicio/Trimestre tanto en
  // los flyouts del riel (desktop) como en los sheets de la barra
  // inferior (móvil) — el resaltado debe marcar el enlace activo en
  // ambos contenedores a la vez, aunque solo uno sea visible según el
  // breakpoint.
  const enlaces = Array.from(document.querySelectorAll('.nav-anclas a[href^="#"]'));
  if (enlaces.length === 0) return;

  // seccionPorEnlace guarda un enlace representativo por sección (da igual
  // cuál de las dos copias, marcarActivo() ya resalta ambas por href) y
  // secciones deduplica para no observar el mismo elemento dos veces.
  const seccionPorEnlace = new Map();
  const secciones = [];
  enlaces.forEach((enlace) => {
    const id = enlace.getAttribute("href").slice(1);
    const seccion = document.getElementById(id);
    if (seccion && !seccionPorEnlace.has(seccion)) {
      seccionPorEnlace.set(seccion, enlace);
      secciones.push(seccion);
    }
  });
  if (secciones.length === 0) return;

  function marcarActivo(enlaceActivo) {
    // Comparación por href (no por referencia): el mismo destino existe
    // dos veces en el DOM (flyout de escritorio + sheet móvil) y ambas
    // copias deben resaltarse juntas, no solo la que disparó el cálculo.
    const hrefActivo = enlaceActivo.getAttribute("href");
    enlaces.forEach((enlace) => {
      enlace.classList.toggle("nav-link--activo", enlace.getAttribute("href") === hrefActivo);
    });
    actualizarMigaDeSeccion(enlaceActivo);
  }

  // A diferencia del header superior que existía antes, la barra lateral
  // y la barra inferior no ocupan espacio vertical en la parte de arriba
  // del viewport (una es una columna fija a la izquierda, la otra vive
  // abajo del todo), así que ya no hace falta descontar la altura de
  // ningún elemento "sticky" superior: el margen es solo un pequeño
  // colchón fijo.
  const altoFijo = 0;

  // IntersectionObserver solo manda, en cada llamada, las secciones cuyo
  // estado CAMBIÓ (entró o salió), no todas las que siguen visibles. Por
  // eso se guarda el último estado conocido de cada sección en este mapa
  // y, en cada evento, se recalcula la activa usando todo lo que sigue
  // intersectando (no solo lo que cambió en esa llamada).
  const ultimoEstadoPorSeccion = new Map();

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => ultimoEstadoPorSeccion.set(entrada.target, entrada));

      const visibles = Array.from(ultimoEstadoPorSeccion.values()).filter(
        (entrada) => entrada.isIntersecting
      );
      if (visibles.length === 0) return;

      // De las secciones visibles, se prefiere la que ya cruzó el borde
      // superior del viewport y está más cerca de él (la que se está
      // leyendo ahora mismo). Si ninguna lo ha cruzado todavía (por
      // ejemplo, al inicio de la página), se toma la más próxima a entrar.
      const yaCruzadas = visibles.filter((entrada) => entrada.boundingClientRect.top <= 0);
      const elegida =
        yaCruzadas.length > 0
          ? yaCruzadas.reduce((a, b) =>
              a.boundingClientRect.top >= b.boundingClientRect.top ? a : b
            )
          : visibles.reduce((a, b) =>
              a.boundingClientRect.top <= b.boundingClientRect.top ? a : b
            );

      marcarActivo(seccionPorEnlace.get(elegida.target));
    },
    {
      root: null,
      rootMargin: "-" + (altoFijo + 16) + "px 0px -65% 0px",
      threshold: 0,
    }
  );

  secciones.forEach((seccion) => observador.observe(seccion));
}

async function renderizarTodo() {
  await Promise.all([
    renderizarAvisos(),
    renderizarHorario(),
    renderizarCalendario(),
    renderizarTemario(),
    renderizarInfografias(),
    renderizarRubricas(),
    renderizarTareas(),
    renderizarActividades(),
    renderizarProyectos(),
    renderizarProximasFechasTrimestre(),
    renderizarVideos(),
    renderizarPresentaciones(),
    renderizarSeccionAplicaConocimientos(),
  ]);
  // Secuenciadas a propósito (no dentro del Promise.all de arriba):
  // ambas piden el mismo detalle por trimestre vía
  // calcularProgresoDetalladoPorTrimestre() (ver cacheProgresoDetallado) —
  // si arrancaran juntas, las dos dispararían las mismas 3x3 consultas en
  // paralelo antes de que la primera pudiera poblar la caché para la
  // segunda. Así, renderizarProgreso() la puebla y
  // renderizarProgresoDetallado() la reutiliza sin volver a consultar.
  await renderizarProgreso();
  await renderizarProgresoDetallado();
  activarBotonEncuadreAnual();
  activarExpansionReglamento();
}

// .selector-grupo-control: hay dos <select> físicos en el DOM (uno en el
// flyout Ajustes del riel, otro en el sheet Perfil de la barra inferior —
// no pueden compartir id), sincronizados por esta misma función en vez de
// duplicarla. Mismo patrón que ya usa aplicarTema() con .boton-tema.
function sincronizarSelectorGrupo(valor) {
  document.querySelectorAll(".selector-grupo-control").forEach((select) => { select.value = valor; });
}

// Ajustes → Grupo: un alumno con sesión iniciada ve el grupo al que
// pertenece como texto fijo (no lo puede cambiar); el <select> manual
// solo aplica a visitantes sin sesión y a docentes (perfil.grupo es
// null). Se llama junto con sincronizarPerfilActivo(), que es quien deja
// perfilActivoCache/grupoActual ya resueltos antes de esto. Actualiza a
// la vez el flyout de escritorio y el sheet Perfil de móvil (selectores
// .campo-grupo-selector-slot/.texto-grupo-alumno-slot, uno de cada por
// contenedor) — mismo dato, dos contenedores según breakpoint.
function actualizarFlyoutAjustesGrupo() {
  const camposSelector = document.querySelectorAll(".campo-grupo-selector-slot");
  const textosFijos = document.querySelectorAll(".texto-grupo-alumno-slot");
  if (camposSelector.length === 0 && textosFijos.length === 0) return;

  const perfil = obtenerPerfilActivo();
  const esAlumnoConGrupo = Boolean(perfil?.grupo);

  camposSelector.forEach((campo) => { campo.hidden = esAlumnoConGrupo; });
  textosFijos.forEach((texto) => {
    texto.hidden = !esAlumnoConGrupo;
    if (esAlumnoConGrupo) texto.textContent = "Viendo contenido de " + textoGrupo(perfil.grupo);
  });
}

async function alCambiarGrupo(evento) {
  // Se guarda en localStorage para que el grupo elegido no se pierda
  // al navegar entre la portada y las páginas de trimestre.
  grupoActual = evento.target.value;
  localStorage.setItem(CLAVE_GRUPO, grupoActual);
  sincronizarSelectorGrupo(grupoActual);
  mostrarToast("Mostrando contenido de " + textoGrupo(grupoActual));
  await renderizarTodo();
  // Re-wirea los badges compactos de #proximas-fechas-trimestre, que se
  // reconstruyen desde cero en cada renderizarTodo() — ver comentario en
  // activarTooltipsInfo() (arriba). Los ⓘ estáticos ya wireados no se
  // tocan de nuevo (dataset.tooltipActivado).
  activarTooltipsInfo();
}

/* =========================================================
   9. FORMULARIO DE CONTACTO (Netlify Forms)
   ========================================================= */

// Tamaño máximo aceptado para la imagen de evidencia — mismo límite que
// ya anuncia el mensaje de error de validación en alEnviarContacto().
const TAMANO_MAXIMO_EVIDENCIA = 5 * 1024 * 1024;

// Object URL de la miniatura de evidencia actualmente mostrada (ver
// mostrarPreviaEvidencia): se guarda aparte para poder revocarlo antes de
// crear uno nuevo o al quitar la imagen — sin esto, cada selección de
// archivo deja el object URL anterior sin liberar (fuga de memoria).
let urlPreviaEvidencia = null;

function ocultarPreviaEvidencia() {
  const previa = document.getElementById("evidencia-preview");
  if (previa) previa.hidden = true;
  if (urlPreviaEvidencia) {
    URL.revokeObjectURL(urlPreviaEvidencia);
    urlPreviaEvidencia = null;
  }
}

function mostrarPreviaEvidencia(archivo) {
  const previa = document.getElementById("evidencia-preview");
  const imagen = document.getElementById("evidencia-preview-imagen");
  const nombre = document.getElementById("evidencia-preview-nombre");
  if (!previa || !imagen || !nombre) return;

  if (urlPreviaEvidencia) URL.revokeObjectURL(urlPreviaEvidencia);
  urlPreviaEvidencia = URL.createObjectURL(archivo);

  imagen.src = urlPreviaEvidencia;
  nombre.textContent = archivo.name;
  previa.hidden = false;
}

// Precarga el <select> de grupo del formulario con el mismo valor que ya
// tiene grupoActual (localStorage bajo CLAVE_GRUPO, ver sincronizarSelec
// torGrupo). Sin preselección si ese valor es "todos": nunca se eligió un
// grupo real todavía, así que el alumno debe elegirlo a mano.
function precargarGrupoContacto(formulario) {
  const selectGrupo = formulario.querySelector("#contacto-grupo");
  if (!selectGrupo) return;
  const grupoGuardado = localStorage.getItem(CLAVE_GRUPO);
  if (grupoGuardado === "3C" || grupoGuardado === "3E") {
    selectGrupo.value = grupoGuardado;
  }
}

// Engancha el <input type="file"> de evidencia: miniatura al elegir
// archivo, botón "Quitar" que limpia el input y la oculta de nuevo.
// Separado de alEnviarContacto() porque corre en un evento distinto
// ("change" del input, no "submit" del formulario).
function activarEvidenciaContacto(formulario) {
  const input = formulario.querySelector("#contacto-evidencia");
  const botonQuitar = document.getElementById("evidencia-preview-quitar");
  if (!input) return;

  input.addEventListener("change", () => {
    const archivo = input.files[0];
    if (!archivo) {
      ocultarPreviaEvidencia();
      return;
    }
    mostrarPreviaEvidencia(archivo);
  });

  if (botonQuitar) {
    botonQuitar.addEventListener("click", () => {
      input.value = "";
      ocultarPreviaEvidencia();
    });
  }
}

async function alEnviarContacto(evento) {
  evento.preventDefault();

  // Modo Demo (Fase 3): ningún envío real a Netlify Forms mientras esté
  // activo — antes de validar evidencia o tocar el estado del botón.
  if (demoModeActivo()) {
    abrirModalDemo();
    return;
  }

  const formulario = evento.target;
  const boton = formulario.querySelector("button[type='submit']");
  const estado = document.getElementById("contacto-estado");
  const archivo = formulario.querySelector("#contacto-evidencia")?.files[0];

  const campoNombre = formulario.querySelector("#contacto-nombre");
  const campoMensaje = formulario.querySelector("#contacto-mensaje");
  [campoNombre, campoMensaje].forEach(limpiarCampoInvalido);

  const resultadoNombre = validarTextoSeguro(campoNombre.value.trim(), { maxLargo: 100 });
  if (!resultadoNombre.valido) {
    marcarCampoInvalido(campoNombre, resultadoNombre.motivo);
    return;
  }
  const resultadoMensaje = validarTextoSeguro(campoMensaje.value.trim(), { maxLargo: 2000 });
  if (!resultadoMensaje.valido) {
    marcarCampoInvalido(campoMensaje, resultadoMensaje.motivo);
    return;
  }

  if (archivo) {
    if (!archivo.type.startsWith("image/")) {
      estado.dataset.estado = "error";
      estado.textContent = "La evidencia debe ser una imagen (JPG, PNG, etc.).";
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_EVIDENCIA) {
      estado.dataset.estado = "error";
      estado.textContent = "La imagen de evidencia pesa más de 5MB. Elige una más ligera.";
      return;
    }
  }

  boton.disabled = true;
  estado.dataset.estado = "";
  estado.textContent = "Enviando…";

  try {
    // Netlify procesa cualquier POST a la propia página que incluya
    // "form-name" con el nombre del formulario declarado en el HTML.
    // new FormData(formulario) ya incluye el archivo de evidencia (si se
    // eligió) gracias a enctype="multipart/form-data" en el <form>; el
    // navegador agrega el boundary multipart solo si NO se fija
    // "Content-Type" a mano, por eso no va en los headers de abajo.
    const respuesta = await fetch("/", {
      method: "POST",
      body: new FormData(formulario),
    });

    if (!respuesta.ok) throw new Error("Respuesta no válida de Netlify Forms");

    estado.dataset.estado = "exito";
    estado.textContent = "Gracias, tu mensaje fue enviado.";
    formulario.reset();
    ocultarPreviaEvidencia();
  } catch (error) {
    estado.dataset.estado = "error";
    estado.textContent = "No se pudo enviar el mensaje. Intenta de nuevo más tarde.";
  } finally {
    boton.disabled = false;
  }
}

/* =========================================================
   11. CUENTA Y SESIÓN (SUPABASE)

   Reemplaza la identificación ligera anterior (localStorage + PIN) por
   autenticación real: cada alumno tiene su propia cuenta de Supabase,
   creada al reclamar un código de invitación (ver cuenta.html). La tabla
   "perfiles" guarda grupo y nombre de cada usuario autenticado.

   clienteSupabase (SUPABASE_URL/SUPABASE_ANON_KEY) ya no se define aquí:
   se movió arriba, junto a TRIMESTRE_DESBLOQUEADO (sección 2), porque el
   guard de trimestre necesita el cliente listo antes de que se ejecute
   ese bloque de nivel superior (que corre antes de llegar a esta
   sección del archivo).
   ========================================================= */

// Convierte un nombre en un fragmento seguro para usar como parte de una
// llave de localStorage: sin acentos, espacios ni mayúsculas.
function slugAlumno(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos ya separados por NFD
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

// perfilActivoCache respalda obtenerPerfilActivo(): el resto del archivo
// (itemEstaCompletado, renderizarProgreso, renderizarProgresoDetallado, el
// banner de examen diagnóstico) lo sigue leyendo de forma síncrona, igual
// que con el perfil de localStorage anterior. sincronizarPerfilActivo()
// es quien la mantiene al día (ver los dos puntos donde se llama más
// abajo: DOMContentLoaded y onAuthStateChange).
function obtenerPerfilActivo() {
  return perfilActivoCache;
}

// Puebla perfilActivoCache y progresoCache en el mismo momento, para que
// ambas queden listas antes del primer renderizarTodo(). Sin sesión activa
// (visitante sin login) las dos quedan vacías: itemEstaCompletado() ya
// reporta todo como no completado, y crearChecklistProgreso() muestra el
// aviso de "inicia sesión" en vez de un indicador de estado.
async function sincronizarPerfilActivo() {
  // Invalida el detalle por trimestre cacheado (ver cacheProgresoDetallado):
  // cualquier repoblación de perfilActivoCache/progresoCache (cambio de
  // sesión o de grupo) puede volver obsoleto el detalle ya calculado.
  cacheProgresoDetallado = null;

  const { data: { session } } = await clienteSupabase.auth.getSession();
  if (!session) {
    perfilActivoCache = null;
    progresoCache = [];
    grupoActual = localStorage.getItem(CLAVE_GRUPO) || "todos";
    sincronizarSelectorGrupo(grupoActual);
    actualizarFlyoutAjustesGrupo();
    return;
  }

  // Las 2 solo dependen de session.user.id, no entre sí — antes corrían en
  // cascada (perfil → sincronizarTemaConCuenta con su propio SELECT →
  // progreso), 3 round-trips secuenciales a Supabase sin necesidad. El
  // SELECT de perfiles ya trae tema_preferido, así que sincronizarTemaConCuenta
  // recibe el valor en vez de consultarlo ella misma (ver esa función).
  const [{ data: perfil }, { data: progreso }] = await Promise.all([
    clienteSupabase
      .from("perfiles")
      .select("nombre, grupo, tema_preferido")
      .eq("id", session.user.id)
      .single(),
    clienteSupabase
      .from("progreso")
      .select("tipo, item_id, trimestre, actualizado_en")
      .eq("alumno_id", session.user.id),
  ]);

  perfilActivoCache = perfil ? { nombre: perfil.nombre, grupo: perfil.grupo } : null;
  await sincronizarTemaConCuenta(perfil?.tema_preferido);

  // El grupo del alumno con sesión iniciada gana sobre el <select>/
  // localStorage (ver actualizarFlyoutAjustesGrupo): un alumno siempre ve
  // el contenido de su propio grupo. Docentes y visitantes sin sesión
  // (perfil.grupo null) siguen controlando el grupo a mano.
  grupoActual = perfilActivoCache?.grupo || localStorage.getItem(CLAVE_GRUPO) || "todos";
  sincronizarSelectorGrupo(grupoActual);
  actualizarFlyoutAjustesGrupo();

  progresoCache = progreso || [];
}

// Aplica temaPreferido (ya leído por sincronizarPerfilActivo() como parte
// del mismo SELECT de perfiles, ver esa función) si es un slug válido y
// distinto del ya aplicado — mismo criterio que ya usa el grupo arriba
// ("el valor de la cuenta gana sobre localStorage"). El try/catch se queda
// por si aplicarTema()/localStorage fallan; si temaPreferido viene null
// (columna sin valor o fila sin match) simplemente no hace nada.
async function sincronizarTemaConCuenta(temaPreferido) {
  // Mismo criterio que el guard de seleccionarTema(): con un evento
  // forzado activo, el tema de la cuenta (aunque sea distinto del ya
  // aplicado) NO debe pisar el tema de evento — se queda en localStorage/
  // Supabase intacto, listo para cuando el docente desactive el evento.
  //
  // A diferencia de seleccionarTema() (solo dispara por clic real, ya
  // con eventoActivo resuelto), esta función también se dispara desde
  // clienteSupabase.auth.onAuthStateChange() — un listener top-level que
  // corre en SU PROPIA carrera contra el DOMContentLoaded de la sección
  // 10, sin ninguna garantía de que "eventoActivo" ya esté asignado en
  // ese momento (bug real: en pruebas, la variable seguía en null
  // cuando este código corría, así que el guard no frenaba nada).
  // Esperar la MISMA promesa que resuelve eventoActivo, en vez de leer
  // la variable, elimina la carrera — awaits repetidos sobre una
  // promesa ya resuelta devuelven el valor cacheado al instante, sin
  // volver a consultar Supabase.
  if (await promesaTemaEventoActivo) return;

  try {
    if (!temaPreferido) return;

    const temaGuardado = temaPreferido;
    if (temaGuardado === temaActual) return;
    if (!TEMAS_DISPONIBLES.some((t) => t.slug === temaGuardado)) return;

    temaActual = temaGuardado;
    localStorage.setItem(CLAVE_TEMA, temaActual);
    aplicarTema(temaActual);
  } catch {
    // aplicarTema()/localStorage fallan: se queda con lo que ya aplicó
    // localStorage/el tema de sistema.
  }
}

// Avatar con inicial: con nombre conocido (alumno o docente, cualquiera
// con sesión iniciada) reemplaza el emoji 👤 genérico por un círculo con
// la inicial, en los tres lugares donde vive un ícono de Perfil — el
// disparador del riel (desktop), el disparador de la barra inferior y la
// cabecera del propio sheet (ambos móvil). Sin nombre (visitante sin
// sesión) los tres vuelven al emoji. En admin.html #riel-boton-perfil es
// un <span> decorativo (sin flyout ni comportamiento de clic, ver
// admin.html) — esta función solo le pinta la inicial, igual que a los
// disparadores reales de las demás páginas.
function actualizarAvatarPerfil(nombre) {
  document.querySelectorAll("#riel-boton-perfil, #boton-inferior-perfil, #sheet-perfil-avatar").forEach((destino) => {
    destino.textContent = "";
    const contenido = document.createElement("span");
    contenido.setAttribute("aria-hidden", "true");
    if (nombre) {
      contenido.className = "riel__avatar";
      contenido.textContent = nombre.trim().charAt(0).toUpperCase();
    } else {
      contenido.textContent = "👤";
    }
    destino.appendChild(contenido);
  });
}

// Botón "Perfil" de la barra lateral (desktop) y de la barra inferior
// (móvil), marcados con data-boton-cuenta: antes alternaban el modal de
// identificación, ahora reflejan la sesión de Supabase y llevan a
// cuenta.html o cierran sesión según el caso.
async function actualizarUISesion() {
  const { data: { session } } = await clienteSupabase.auth.getSession();
  // [data-boton-cuenta] es el patrón viejo: ya ninguna página lo usa
  // (sitemap.html migró al riel), así que este querySelectorAll no
  // encuentra nada — se deja tal cual en vez de borrarlo en este mismo
  // cambio; candidata a limpieza en un pase aparte junto con la barra
  // lateral legada. .perfil-nivel-pill es el patrón vigente: la píldora
  // vive aparte del disparador, una copia por contenedor (flyout de
  // escritorio y sheet Perfil de la barra inferior).
  const elementos = document.querySelectorAll("[data-boton-cuenta]");
  const etiquetasNivel = document.querySelectorAll(".perfil-nivel-pill");

  if (!session) {
    elementos.forEach((el) => {
      el.textContent = "";
      const icono = document.createElement("span");
      icono.setAttribute("aria-hidden", "true");
      icono.textContent = "🧑‍🎓";
      const texto = document.createElement("span");
      texto.textContent = "Iniciar sesión";
      el.append(icono, texto);
      el.onclick = () => { window.location.href = "cuenta.html"; };
    });
    etiquetasNivel.forEach((etiqueta) => { etiqueta.hidden = true; });
    actualizarAvatarPerfil(null);
    return;
  }

  const perfil = obtenerPerfilActivo();
  const nombreMostrado = perfil?.nombre ? perfil.nombre.split(" ")[0] : "Mi cuenta";
  actualizarAvatarPerfil(perfil?.nombre || null);

  // Etiqueta de Nivel (solo el número, sin subtítulo — el espacio del
  // sidebar/barra inferior es reducido; el subtítulo completo ya vive en
  // la tarjeta de progreso.html). calcularAvanceGeneralAlumno() resuelve
  // ANTES de construir el contenido de abajo, para no dejar el botón
  // parpadeando sin la etiqueta y luego con ella.
  //
  // Gate de página: solo dispara las 9 consultas a fechas_override en
  // páginas que ya tienen algo relacionado con progreso a la vista —
  // trimestre-1/2/3.html (<body data-trimestre>) e index.html/
  // progreso.html (#progreso-resumen-general). En faq.html, padres.html,
  // cuenta.html y admin.html ninguna de las dos señales existe, así que
  // ni siquiera se llama a calcularAvanceGeneralAlumno().
  const paginaConNivel = Boolean(document.body.dataset.trimestre) || Boolean(document.getElementById("progreso-resumen-general"));
  const avanceGeneral = perfil && paginaConNivel ? await calcularAvanceGeneralAlumno(perfil) : null;
  const nivelAlumno = avanceGeneral != null ? calcularNivelAlumno(avanceGeneral) : null;

  // Pill de Nivel del flyout Perfil (riel) y del sheet Perfil (barra
  // inferior) — misma etiqueta que ya arma construirTarjetaNivel() en
  // progreso.html, no un cálculo nuevo. Se oculta fuera de las páginas
  // con gate de nivel (paginaConNivel) o si el alumno aún no tiene avance
  // calculable.
  etiquetasNivel.forEach((etiqueta) => {
    etiqueta.hidden = !nivelAlumno;
    if (nivelAlumno) etiqueta.textContent = "Nivel " + nivelAlumno.nivel + " · " + nivelAlumno.subtitulo;
  });

  elementos.forEach((el) => {
    el.textContent = "";
    const icono = document.createElement("span");
    icono.setAttribute("aria-hidden", "true");
    icono.textContent = "🧑‍🎓";
    const texto = document.createElement("span");
    texto.textContent = nombreMostrado;
    el.append(icono, texto);
    if (nivelAlumno) {
      const etiquetaNivel = document.createElement("span");
      etiquetaNivel.className = "etiqueta-nivel etiqueta-nivel--compacta";
      etiquetaNivel.textContent = "Nivel " + nivelAlumno.nivel;
      el.appendChild(etiquetaNivel);
    }
    el.onclick = () => { window.location.href = "cuenta.html"; };
  });
}

// 5 reglas de fuerza de contraseña (Fase 4) — única fuente de verdad,
// usada tanto por el checklist en vivo (activarValidadorContrasena) como
// por los 2 formularios que envían la contraseña a Supabase (Crear
// cuenta, Restablecer contraseña), para no repetir los mismos regex en
// 3 sitios distintos.
function calcularReglasContrasena(valor) {
  const cumple = {
    longitud: valor.length >= 8,
    minuscula: /[a-z]/.test(valor),
    mayuscula: /[A-Z]/.test(valor),
    numero: /[0-9]/.test(valor),
    especial: /[^A-Za-z0-9]/.test(valor),
  };
  const total = Object.values(cumple).filter(Boolean).length;
  return { cumple, total, valida: total === 5 };
}

// Checklist de fuerza de contraseña en vivo (se actualiza en cada tecla,
// sin esperar el submit): barra de color + etiqueta "Fuerza: X" + ✅/⬜
// por regla — el color nunca es el único indicador (WCAG 1.4.1). "boton"
// es opcional: si se pasa, queda deshabilitado hasta que las 5 reglas se
// cumplan (además de la validación normal al enviar, que sigue
// aplicando por separado). Reutilizada tal cual en #crear-contrasena
// (Crear cuenta) y #restablecer-contrasena (Restablecer contraseña) —
// mismas 5 reglas de calcularReglasContrasena(), un solo lugar que las
// pinta.
function activarValidadorContrasena(input, medidor, boton) {
  if (!input || !medidor) return;

  const filas = [
    { clave: "longitud", texto: "Al menos 8 caracteres" },
    { clave: "mayusminus", texto: "Una mayúscula y una minúscula" },
    { clave: "numero", texto: "Un número" },
    { clave: "especial", texto: "Un carácter especial (! @ # $ % …)" },
  ];

  medidor.innerHTML = "";
  const barra = document.createElement("div");
  barra.className = "medidor-contrasena__barra";
  const relleno = document.createElement("div");
  relleno.className = "medidor-contrasena__relleno";
  barra.appendChild(relleno);

  const etiqueta = document.createElement("p");
  etiqueta.className = "medidor-contrasena__etiqueta";

  const lista = document.createElement("ul");
  lista.className = "medidor-contrasena__lista";
  const filasEl = {};
  filas.forEach(({ clave, texto }) => {
    const item = document.createElement("li");
    item.className = "medidor-contrasena__item";
    const icono = document.createElement("span");
    icono.className = "medidor-contrasena__icono";
    icono.setAttribute("aria-hidden", "true");
    icono.textContent = "⬜";
    const textoEl = document.createElement("span");
    textoEl.textContent = texto;
    item.append(icono, textoEl);
    lista.appendChild(item);
    filasEl[clave] = { item, icono };
  });

  medidor.append(barra, etiqueta, lista);

  const TEXTO_FUERZA = { debil: "Débil", aceptable: "Aceptable", fuerte: "Fuerte" };

  function evaluar() {
    const valor = input.value;
    const { cumple, total, valida } = calcularReglasContrasena(valor);
    const filasCumplidas = {
      longitud: cumple.longitud,
      mayusminus: cumple.minuscula && cumple.mayuscula,
      numero: cumple.numero,
      especial: cumple.especial,
    };

    Object.entries(filasCumplidas).forEach(([clave, ok]) => {
      const { item, icono } = filasEl[clave];
      item.classList.toggle("medidor-contrasena__item--ok", ok);
      icono.textContent = ok ? "✅" : "⬜";
    });

    let nivel = "debil";
    if (total === 5) nivel = "fuerte";
    else if (total >= 3) nivel = "aceptable";

    const hayValor = valor.length > 0;
    barra.dataset.nivel = hayValor ? nivel : "";
    relleno.style.width = (total / 5) * 100 + "%";
    etiqueta.textContent = hayValor ? "Fuerza: " + TEXTO_FUERZA[nivel] : "";

    if (boton) boton.disabled = !valida;
    return valida;
  }

  input.addEventListener("input", evaluar);
  evaluar();
}

// Validación inline por campo (WCAG 3.3.1): cada <input>/<textarea> que
// use este patrón trae su propio <p class="campo-formulario__error"
// role="alert" hidden id="{input.id}-error"> referenciado por
// aria-describedby en el HTML (estático, siempre presente — no se
// agrega/quita el atributo en JS, solo se llena/vacía y se
// muestra/oculta el <p> que ya apunta). marcarCampoInvalido/
// limpiarCampoInvalido son las únicas dos funciones que tocan ese
// estado — a nivel de módulo (no solo dentro de
// activarFormulariosCuenta, de donde salieron) para compartirlas con
// los formularios de contacto, nuevo alumno, aviso y popup de
// bienvenida sin duplicar la mecánica de "encontrar el <p>-error por
// convención de id".
function marcarCampoInvalido(input, mensaje) {
  input.setAttribute("aria-invalid", "true");
  const errorEl = document.getElementById(input.id + "-error");
  if (errorEl) {
    errorEl.textContent = mensaje;
    errorEl.hidden = false;
  }
}

function limpiarCampoInvalido(input) {
  input.removeAttribute("aria-invalid");
  const errorEl = document.getElementById(input.id + "-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }
}

// Sanitiza texto libre entrante de formularios (contacto, nuevo alumno,
// aviso, popup de bienvenida) contra XSS almacenado: aunque hoy nada
// pinta estos valores con innerHTML (ver renderizarAvisos/
// mostrarPopupBienvenida, que usan textContent), es la misma clase de
// dato que un cambio futuro sí podría insertar así por descuido — mejor
// rechazarlo en el borde de entrada que confiar en que cada pantalla de
// salida futura recuerde escapar. No se aplica a los campos de
// contraseña de cuenta.html: ahí rechazar '<'/'>' bajaría la seguridad
// de la contraseña en vez de subirla.
function validarTextoSeguro(valor, { maxLargo } = {}) {
  if (/[<>]/.test(valor)) {
    return { valido: false, motivo: "No se permiten los caracteres < o >." };
  }
  if (/\bon\w+\s*=/i.test(valor)) {
    return { valido: false, motivo: "El texto no puede incluir atributos tipo on... =." };
  }
  if (/javascript\s*:/i.test(valor) || /data:text\/html/i.test(valor)) {
    return { valido: false, motivo: "El texto no puede incluir enlaces javascript: o data:text/html." };
  }
  // Caracteres de control salvo tab/salto de línea/retorno de carro
  // (\x09/\x0A/\x0D), legítimos en los <textarea> de mensaje/descripción.
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(valor)) {
    return { valido: false, motivo: "El texto incluye caracteres no permitidos." };
  }
  if (typeof maxLargo === "number" && valor.length > maxLargo) {
    return { valido: false, motivo: "El texto no puede superar los " + maxLargo + " caracteres." };
  }
  return { valido: true, motivo: "" };
}

// Los formularios de "Crear cuenta" / "Iniciar sesión" solo existen en
// cuenta.html (se buscan por id y, si no están, la función no hace nada
// en el resto de páginas).
function activarFormulariosCuenta() {
  // 3 pestañas (Crear cuenta / Iniciar sesión / Recuperar, Fase 4): mismo
  // patrón genérico por id + aria-controls que ya usa activarTabsAdmin()
  // para los 5 módulos del panel docente, en vez del if/else de 2 ramas
  // que había aquí antes (no escalaba a una 3ra pestaña sin repetirse).
  const tabsCuenta = Array.from(document.querySelectorAll(".cuenta-tabs__boton"));
  if (tabsCuenta.length === 0) return;

  function mostrarTab(idActivo) {
    tabsCuenta.forEach((tab) => {
      const activo = tab.id === idActivo;
      tab.classList.toggle("cuenta-tabs__boton--activo", activo);
      tab.setAttribute("aria-selected", String(activo));
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = !activo;
    });
  }

  tabsCuenta.forEach((tab) => {
    tab.addEventListener("click", () => mostrarTab(tab.id));
  });

  // "¿Olvidaste tu contraseña?" (dentro de #panel-login) cambia a la
  // pestaña Recuperar sin navegar — mismo mostrarTab() de arriba.
  document.getElementById("boton-ir-recuperar")?.addEventListener("click", () => mostrarTab("tab-recuperar"));

  // marcarCampoInvalido/limpiarCampoInvalido: ver definición a nivel de
  // módulo justo arriba de esta función (compartidas con los otros
  // formularios que usan el mismo patrón de error por campo).

  const formCrear = document.getElementById("formulario-crear-cuenta");
  const errorCrear = document.getElementById("crear-cuenta-error");
  const campoCodigo = document.getElementById("codigo-invitacion");
  const campoCorreoCrear = document.getElementById("crear-correo");
  const campoContrasenaCrear = document.getElementById("crear-contrasena");
  const campoConfirmarCrear = document.getElementById("crear-contrasena-confirmar");
  const botonCrearCuenta = formCrear?.querySelector("button[type=submit]");
  activarValidadorContrasena(campoContrasenaCrear, document.getElementById("crear-contrasena-medidor"), botonCrearCuenta);

  formCrear?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorCrear.hidden = true;
    [campoCodigo, campoCorreoCrear, campoContrasenaCrear, campoConfirmarCrear].forEach(limpiarCampoInvalido);

    const codigo = campoCodigo.value.trim().toUpperCase();
    const correo = campoCorreoCrear.value.trim();
    const contrasena = campoContrasenaCrear.value;
    const confirmar = campoConfirmarCrear.value;

    // Mismas 4 reglas de antes (mismo regex, mismo umbral de longitud,
    // misma comparación) — la única diferencia es que ya no se corta en
    // la primera que falle: se revisan las 4 y se marca cada campo que
    // aplique, para que "correo mal formateado + contraseña corta" a la
    // vez muestre los dos mensajes de una sola pasada, no uno por
    // intento. checkValidity() en el correo reutiliza el type="email"
    // ya declarado en el HTML (antes este formulario no validaba el
    // correo en el cliente para nada, solo lo mandaba a Supabase).
    let huboError = false;

    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo)) {
      marcarCampoInvalido(campoCodigo, "El código debe tener el formato XXXX-XXXX-XXXX. Verifica que esté bien escrito.");
      huboError = true;
    }
    if (!campoCorreoCrear.checkValidity()) {
      marcarCampoInvalido(campoCorreoCrear, "Ingresa un correo válido, por ejemplo: nombre@ejemplo.com");
      huboError = true;
    }
    // El botón ya queda deshabilitado mientras la contraseña no cumpla
    // las 5 reglas (ver activarValidadorContrasena arriba); esta
    // revalidación es solo el mismo criterio de "defensa en profundidad"
    // que el resto del formulario — no depende de que el botón se haya
    // habilitado a tiempo.
    if (!calcularReglasContrasena(contrasena).valida) {
      marcarCampoInvalido(campoContrasenaCrear, "La contraseña no cumple todas las reglas de seguridad de arriba.");
      huboError = true;
    }
    if (contrasena !== confirmar) {
      marcarCampoInvalido(campoConfirmarCrear, "Las contraseñas no coinciden.");
      huboError = true;
    }
    if (huboError) return;

    const { error: errorSignUp } = await clienteSupabase.auth.signUp({ email: correo, password: contrasena });
    if (errorSignUp) {
      errorCrear.textContent = "No se pudo crear la cuenta: " + errorSignUp.message;
      errorCrear.hidden = false;
      return;
    }

    const { error: errorRpc } = await clienteSupabase.rpc("reclamar_codigo_invitacion", { p_codigo: codigo });
    if (errorRpc) {
      errorCrear.textContent = "Ese código no es válido, ya fue usado, o está inactivo. Verifica con tu profesor.";
      errorCrear.hidden = false;
      await clienteSupabase.auth.signOut();
      return;
    }

    // A guia.html (guía de primeros pasos), no a index.html: solo aquí,
    // en el éxito de CREAR cuenta — "Iniciar sesión" (abajo) sigue yendo
    // a index.html sin cambios.
    window.location.href = "guia.html";
  });

  const formLogin = document.getElementById("formulario-login");
  const errorLogin = document.getElementById("login-error");
  const campoCorreoLogin = document.getElementById("login-correo");
  const campoContrasenaLogin = document.getElementById("login-contrasena");

  formLogin?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorLogin.hidden = true;
    [campoCorreoLogin, campoContrasenaLogin].forEach(limpiarCampoInvalido);

    const correo = campoCorreoLogin.value.trim();
    const contrasena = campoContrasenaLogin.value;

    // Antes este formulario no validaba nada en el cliente (iba directo
    // a Supabase) — checkValidity()/valueMissing reutilizan el
    // type="email"/required ya declarados en el HTML, mismas reglas
    // que el navegador habría aplicado solo si no tuviera novalidate.
    let huboError = false;
    if (!campoCorreoLogin.checkValidity()) {
      marcarCampoInvalido(
        campoCorreoLogin,
        campoCorreoLogin.validity.valueMissing ? "Ingresa tu correo." : "Ingresa un correo válido, por ejemplo: nombre@ejemplo.com"
      );
      huboError = true;
    }
    if (!contrasena) {
      marcarCampoInvalido(campoContrasenaLogin, "Ingresa tu contraseña.");
      huboError = true;
    }
    if (huboError) return;

    // "Correo o contraseña incorrectos" se queda como mensaje de
    // formulario (no por campo): Supabase no distingue cuál de los dos
    // falló (a propósito, por seguridad — no confirmar si un correo
    // existe), así que atribuirlo a un campo específico sería inventar
    // una precisión que la respuesta real no tiene.
    const { error } = await clienteSupabase.auth.signInWithPassword({ email: correo, password: contrasena });
    if (error) {
      errorLogin.textContent = "Correo o contraseña incorrectos.";
      errorLogin.hidden = false;
      return;
    }
    window.location.href = "index.html";
  });

  // Paso 1 de recuperación de contraseña (Fase 4): pide el correo y
  // dispara resetPasswordForEmail(). Supabase nunca revela si ese correo
  // tiene cuenta o no (mismo criterio de seguridad que "Correo o
  // contraseña incorrectos" en Iniciar sesión), así que el mensaje de
  // éxito es genérico y se muestra incluso si Supabase devuelve error —
  // salvo un correo mal formado, que ya se atrapa antes de llamarlo.
  const formRecuperar = document.getElementById("formulario-recuperar");
  const errorRecuperar = document.getElementById("recuperar-error");
  const exitoRecuperar = document.getElementById("recuperar-exito");
  const campoCorreoRecuperar = document.getElementById("recuperar-correo");

  formRecuperar?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorRecuperar.hidden = true;
    exitoRecuperar.hidden = true;
    limpiarCampoInvalido(campoCorreoRecuperar);

    const correo = campoCorreoRecuperar.value.trim();
    if (!campoCorreoRecuperar.checkValidity()) {
      marcarCampoInvalido(campoCorreoRecuperar, "Ingresa un correo válido, por ejemplo: nombre@ejemplo.com");
      return;
    }

    const botonEnviar = formRecuperar.querySelector("button[type=submit]");
    botonEnviar.disabled = true;
    const { error } = await clienteSupabase.auth.resetPasswordForEmail(correo, {
      redirectTo: "https://tecno10mixta.netlify.app/cuenta.html",
    });
    botonEnviar.disabled = false;

    if (error) {
      errorRecuperar.textContent = "No pudimos procesar tu solicitud en este momento. Intenta de nuevo en unos minutos.";
      errorRecuperar.hidden = false;
      return;
    }
    exitoRecuperar.hidden = false;
    formRecuperar.reset();
  });

  // Paso 2 de recuperación de contraseña: solo se ve tras
  // mostrarPanelRestablecer() (ver el listener de PASSWORD_RECOVERY más
  // abajo) — el formulario existe siempre en el HTML pero #panel-restablecer
  // empieza "hidden", así que este listener no hace nada hasta entonces.
  const formRestablecer = document.getElementById("formulario-restablecer");
  const errorRestablecer = document.getElementById("restablecer-error");
  const exitoRestablecer = document.getElementById("restablecer-exito");
  const campoNuevaContrasena = document.getElementById("restablecer-contrasena");
  const campoNuevaContrasenaConfirmar = document.getElementById("restablecer-contrasena-confirmar");
  const botonRestablecer = formRestablecer?.querySelector("button[type=submit]");
  activarValidadorContrasena(campoNuevaContrasena, document.getElementById("restablecer-contrasena-medidor"), botonRestablecer);

  formRestablecer?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorRestablecer.hidden = true;
    [campoNuevaContrasena, campoNuevaContrasenaConfirmar].forEach(limpiarCampoInvalido);

    const contrasena = campoNuevaContrasena.value;
    const confirmar = campoNuevaContrasenaConfirmar.value;

    let huboError = false;
    if (!calcularReglasContrasena(contrasena).valida) {
      marcarCampoInvalido(campoNuevaContrasena, "La contraseña no cumple todas las reglas de seguridad de arriba.");
      huboError = true;
    }
    if (contrasena !== confirmar) {
      marcarCampoInvalido(campoNuevaContrasenaConfirmar, "Las contraseñas no coinciden.");
      huboError = true;
    }
    if (huboError) return;

    const { error } = await clienteSupabase.auth.updateUser({ password: contrasena });
    if (error) {
      errorRestablecer.textContent = "No se pudo actualizar la contraseña: " + error.message;
      errorRestablecer.hidden = false;
      return;
    }

    formRestablecer.hidden = true;
    exitoRestablecer.hidden = false;
  });
}

// Recuperación de contraseña (Fase 4), paso 2: Supabase resuelve el
// token de recuperación del enlace del correo apenas carga la página y
// dispara el evento PASSWORD_RECOVERY (ver el listener de
// onAuthStateChange más abajo) — se llama desde ahí, nunca por clic
// directo. Mismo patrón que activarPanelSesionCuenta(): oculta el resto
// de paneles de #cuenta y muestra solo este.
function mostrarPanelRestablecer() {
  const panelRestablecer = document.getElementById("panel-restablecer");
  if (!panelRestablecer) return;

  const tabs = document.querySelector(".cuenta-tabs");
  const panelCrear = document.getElementById("panel-crear");
  const panelLogin = document.getElementById("panel-login");
  const panelRecuperar = document.getElementById("panel-recuperar");
  const panelSesion = document.getElementById("panel-sesion-activa");
  if (tabs) tabs.hidden = true;
  if (panelCrear) panelCrear.hidden = true;
  if (panelLogin) panelLogin.hidden = true;
  if (panelRecuperar) panelRecuperar.hidden = true;
  if (panelSesion) panelSesion.hidden = true;
  panelRestablecer.hidden = false;
}

// Solo existe #panel-sesion-activa en cuenta.html. Si ya hay sesión al
// cargar esa página, oculta las pestañas de crear cuenta/iniciar sesión
// y muestra este panel en su lugar; boton-cerrar-sesion-cuenta es el
// único disparador real de signOut() en todo el flujo de cuenta.html
// (los botones data-boton-cuenta del sidebar/barra inferior solo llevan
// a cuenta.html, ver actualizarUISesion).
async function activarPanelSesionCuenta() {
  const panelSesion = document.getElementById("panel-sesion-activa");
  if (!panelSesion) return;

  const { data: { session } } = await clienteSupabase.auth.getSession();
  if (!session) return;

  const tabs = document.querySelector(".cuenta-tabs");
  const panelCrear = document.getElementById("panel-crear");
  const panelLogin = document.getElementById("panel-login");
  if (tabs) tabs.hidden = true;
  if (panelCrear) panelCrear.hidden = true;
  if (panelLogin) panelLogin.hidden = true;
  panelSesion.hidden = false;

  const perfil = obtenerPerfilActivo();
  const textoSesion = document.getElementById("cuenta-sesion-texto");
  if (textoSesion) {
    textoSesion.textContent = "Sesión iniciada como: " + (perfil?.nombre || "tu cuenta");
  }

  // Sección "🎨 Personalización": mismo grid de 10 tarjetas que
  // #modal-tema (ver construirGridTemas, sección 7), insertado directo
  // en la página. alSeleccionar reutiliza seleccionarTema tal cual —
  // ya llama a la RPC actualizar_tema_preferido, que es exactamente lo
  // que esta sección necesita.
  const gridTemaCuenta = document.getElementById("cuenta-tema-grid");
  if (gridTemaCuenta) {
    await construirGridTemas(gridTemaCuenta, temaActual, seleccionarTema);
    actualizarUIGridSegunEvento(gridTemaCuenta);
  }

  const botonCerrar = document.getElementById("boton-cerrar-sesion-cuenta");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", async () => {
      if (!window.confirm("¿Seguro que quieres cerrar sesión?")) return;
      await clienteSupabase.auth.signOut();
      window.location.href = "index.html";
    });
  }

  // Atajo visual a admin.html, solo para cuentas docente — mismo RPC y
  // mismo criterio que el guard real de admin.html (guardPanelDocente,
  // sección 11), no una verificación distinta. Sin sesión de alumno
  // normal esto nunca se muestra: si el RPC falla (ej. sin conexión) o
  // devuelve false, el botón se queda oculto sin más (ver su atributo
  // "hidden" ya presente en el HTML) — es conveniencia, no una función
  // crítica que amerite bloquear ni mostrar error.
  const botonPanelDocente = document.getElementById("boton-panel-docente-cuenta");
  if (botonPanelDocente) {
    try {
      const { data: esDocente, error } = await clienteSupabase.rpc("es_docente");
      if (!error && esDocente) botonPanelDocente.hidden = false;
    } catch {
      // Se queda oculto.
    }
  }
}

// Botón "Identificarme" del panel de Progreso (index.html y
// progreso.html): solo es visible sin sesión (ver
// renderizarProgreso/renderizarProgresoDetallado), así que basta con
// llevar a cuenta.html. Ya no existe un botón "Cambiar de alumno" — con
// cuentas reales por alumno, cerrar sesión se hace únicamente desde
// cuenta.html (ver activarPanelSesionCuenta).
function activarAccionesPerfilProgreso() {
  const botonIdentificar = document.getElementById("boton-identificarme-progreso");
  if (botonIdentificar) {
    botonIdentificar.addEventListener("click", () => {
      window.location.href = "cuenta.html";
    });
  }
}

// Mantiene perfilActivoCache al día mientras la pestaña sigue abierta:
// sesión iniciada, cerrada, token refrescado o cerrada en otra pestaña.
// La sincronización inicial (antes del primer renderizarTodo) corre por
// separado en DOMContentLoaded para no depender del orden de disparo del
// evento "INITIAL_SESSION" de Supabase.
clienteSupabase.auth.onAuthStateChange(async (evento) => {
  await sincronizarPerfilActivo();
  await actualizarUISesion();
  await renderizarTodo();
  // Mismo motivo que en alCambiarGrupo(): re-wirea los badges compactos
  // dinámicos de #proximas-fechas-trimestre tras el re-render tras
  // iniciar/cerrar sesión.
  activarTooltipsInfo();
  actualizarVisibilidadBannerExamenDiagnostico();
  // Mismo caso que el comentario de arriba: "INITIAL_SESSION" puede
  // disparar este renderizarTodo() DESPUÉS del de DOMContentLoaded (por
  // eso ese comentario existe), pisando la pestaña que
  // activarPestanaDesdeHash() ya había activado ahí — sin esto, el
  // deep-link desde progreso.html queda en la pestaña por defecto en
  // vez de la correcta. Solo para ese evento puntual: en SIGNED_IN/
  // SIGNED_OUT reales (ya con la página en uso) forzar de vuelta la
  // pestaña deep-linkeada sí sorprendería al alumno si ya había
  // cambiado de pestaña él mismo.
  if (evento === "INITIAL_SESSION" && TRIMESTRE_ACTUAL === "1") activarPestanaDesdeHash();

  // Recuperación de contraseña (Fase 4): el enlace del correo trae un
  // token que Supabase resuelve al cargar cuenta.html, disparando este
  // evento con una sesión de recuperación ya activa. Solo existe
  // #panel-restablecer ahí — en el resto de páginas mostrarPanelRestablecer()
  // no hace nada.
  if (evento === "PASSWORD_RECOVERY") mostrarPanelRestablecer();
});

/* =========================================================
   12. PANEL ADMINISTRATIVO DOCENTE (admin.html)

   admin.html no se enlaza desde la navegación pública: se entra solo por
   URL directa, y el guard de abajo es el control de acceso real (no solo
   visual). ¿Existe una función es_docente() en JS? No: es un RPC de
   Postgres ya expuesto vía PostgREST (clienteSupabase.rpc("es_docente")),
   confirmado en vivo — evalúa el rol del usuario en sesión del lado del
   servidor (perfiles.rol) y devuelve un booleano; no hace falta
   replicar ese chequeo consultando "perfiles" directamente desde aquí.
   ========================================================= */

// admin.html es la única página marcada con <body data-pagina="admin">;
// en el resto queda en false y todo este bloque no hace nada.
const ES_PAGINA_ADMIN = document.body.dataset.pagina === "admin";

// Expuesta para que otros módulos del panel (ver "Calificación y
// progreso" más abajo) esperen a que el guard confirme la sesión de
// docente antes de consultar tablas protegidas por RLS (alumnos_registro,
// progreso). En páginas que no son admin.html queda resuelta de una vez.
let promesaGuardPanelDocente = Promise.resolve();

if (ES_PAGINA_ADMIN) {
  // Mismo criterio de "sin parpadeo" que el guard de trimestre (sección
  // 2): overlay de carga si la verificación tarda más de 150ms, nunca un
  // mensaje de "no autorizado" a medio camino — solo redirección directa.
  promesaGuardPanelDocente = (async function guardPanelDocente() {
    let overlayCarga = null;
    const temporizadorOverlay = setTimeout(() => {
      overlayCarga = mostrarOverlayCargaTrimestre();
    }, 150);

    const {
      data: { session },
    } = await clienteSupabase.auth.getSession();

    if (!session) {
      window.location.replace("cuenta.html");
      return;
    }

    const { data: esDocente, error } = await clienteSupabase.rpc("es_docente");
    if (error || !esDocente) {
      window.location.replace("index.html");
      return;
    }

    // Puebla perfilActivoCache (nombre/grupo) para mostrar el nombre del
    // docente en el header; no depende de que el DOMContentLoaded
    // compartido ya la haya poblado, para no encadenar con esa carrera.
    await sincronizarPerfilActivo();
    const nombreDocente = document.getElementById("admin-nombre-docente");
    if (nombreDocente) {
      nombreDocente.textContent = obtenerPerfilActivo()?.nombre || "Docente";
    }

    clearTimeout(temporizadorOverlay);
    if (overlayCarga) ocultarOverlayCargaTrimestre(overlayCarga);
  })();
}

// Pestañas de los 5 módulos del panel (Calificación y progreso, Alumnos,
// Avisos, Trimestre, Fechas de entrega). Mismo patrón de
// tabs/tabpanels que activarFormulariosCuenta() en cuenta.html, generalizado
// a N pestañas. El contenido real de cada módulo se agrega en prompts
// posteriores; por ahora cada <section> solo trae un placeholder.
function activarTabsAdmin() {
  const tabs = Array.from(document.querySelectorAll(".admin-tabs__boton"));
  if (tabs.length === 0) return;

  function mostrarTab(idActivo) {
    tabs.forEach((tab) => {
      const activo = tab.id === idActivo;
      tab.classList.toggle("admin-tabs__boton--activo", activo);
      tab.setAttribute("aria-selected", String(activo));
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = !activo;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => mostrarTab(tab.id));
  });
}

// Botón "Cerrar sesión" del header de admin.html (distinto del de
// cuenta.html: aquí siempre hay una sesión de docente ya confirmada por
// el guard, así que no hace falta el panel de "sesión activa").
function activarCierreSesionAdmin() {
  const boton = document.getElementById("boton-cerrar-sesion-admin");
  if (!boton) return;

  boton.addEventListener("click", async () => {
    if (!window.confirm("¿Seguro que quieres cerrar sesión?")) return;
    await clienteSupabase.auth.signOut();
    window.location.href = "index.html";
  });
}

// Modo Demo (Fase 4): "numero"|"emoji" — en memoria, sin localStorage
// propio. Se resetea a "numero" en cada carga de página, igual que el
// resto del modo demo ya se resetea con location.reload() al activarse/
// desactivarse (ver activarModoDemo()/desactivarModoDemo(), sección 2).
let formatoCalificacionActivo = "numero";

// Switch global (no vive dentro de un módulo particular): el modal de
// historial de alumno se abre desde Alumnos/Calificación/Evaluación por
// igual, así que un switch anidado en un solo módulo no lo cubriría en
// los otros dos. Solo se muestra en modo demo — con el modo apagado
// queda oculto y formatoCalificacionActivo nunca deja de ser "numero",
// así que formatearCalificacion() se comporta exactamente igual que
// antes de esta fase.
function activarSwitchFormatoCalificacion() {
  const contenedor = document.getElementById("calificacion-switch-formato");
  const input = document.getElementById("calificacion-switch-formato-input");
  const estadoTexto = document.getElementById("calificacion-switch-formato-estado");
  if (!contenedor || !input) return; // no es admin.html

  contenedor.hidden = !demoModeActivo();
  if (!demoModeActivo()) return;

  input.addEventListener("change", (evento) => {
    formatoCalificacionActivo = evento.target.checked ? "emoji" : "numero";
    estadoTexto.textContent = evento.target.checked ? "Emoji" : "Números";

    // Vuelve a pintar las tablas de Evaluación con el formato nuevo, sin
    // recargar la página — ambas ya traen su propio guard
    // "if (!contenedor) return", así que llamarlas sin verificar qué
    // pestaña está activa es seguro (mismo patrón que el resto del
    // panel). El modal de historial, si está abierto, se actualiza solo
    // la próxima vez que se abra (siempre reconstruye su contenido
    // desde cero).
    renderizarTablaEvaluacion();
    renderizarTablaPromedios();
  });
}

// Toast persistente "Modo Demo" (Fase 5) — global, mismo criterio que
// activarSwitchFormatoCalificacion(): se revela una sola vez al cargar
// la página si demoModeActivo(), sin lógica de "ocultar en vivo" — el
// único camino para desactivar el modo demo (este botón, o el switch
// de Apariencia) ya recarga la página vía desactivarModoDemo(), así
// que el toast desaparece solo en la siguiente carga, igual que el
// resto del sistema de modo demo.
function activarToastModoDemo() {
  const toast = document.getElementById("toast-modo-demo");
  if (!toast) return; // no es admin.html
  if (!demoModeActivo()) return;

  toast.hidden = false;
  document.body.classList.add("modo-demo-toast-visible");

  const boton = document.getElementById("boton-desactivar-modo-demo");
  boton?.addEventListener("click", desactivarModoDemo);
}

/* ---------------------------------------------------------
   Módulo "Calificación y progreso" (tab-calificacion)

   Tabla matriz de solo lectura: alumnos (de "alumnos_registro") en
   filas, entregables (de obtenerTareas/Actividades/Proyectos, ya con
   overrides de fecha aplicados) en columnas, y el cruce lo resuelve la
   tabla "progreso" de Supabase. Sin interacciones de edición todavía
   (clic en celda, buscador, exportar CSV son prompts aparte).
   --------------------------------------------------------- */

const ICONO_TIPO_ENTREGABLE = { tarea: "📝", actividad: "🎯", proyecto: "🚀" };

// Código corto del encabezado compacto de columna (Cambio 1: "T1"/"A2"/
// "P1" según su posición dentro de su propio tipo en la secuencia
// seleccionada) — el título completo sigue disponible vía el atributo
// title nativo del <th>, no se pierde información, solo se comprime.
const LETRA_TIPO_ENTREGABLE = { tarea: "T", actividad: "A", proyecto: "P" };

// Texto/ícono de cada estado de badge, en un solo lugar para que la
// variante compacta (Cambio 2: solo ícono + aria-label/title) y la
// variante verbosa (icono + palabra, la que ya usa el modal de
// historial) lean del mismo diccionario en vez de tener cada una el suyo.
const ICONO_ESTADO_CALIFICACION = { completada: "🟢", atrasada: "🔒", pendiente: "🟡", "sin-cuenta": "🚫" };
const TEXTO_ESTADO_CALIFICACION = {
  completada: "Entregado",
  atrasada: "Atrasada",
  pendiente: "Pendiente",
  "sin-cuenta": "Sin cuenta activa",
};

// Título de cada bloque de la impresión "por tipo" (ver
// prepararImpresionTablaPorTipo): plural, para el <h3> de cada tabla
// separada.
const ETIQUETA_TIPO_ENTREGABLE_PLURAL = { tarea: "Tareas", actividad: "Actividades", proyecto: "Proyectos" };

// Mismo texto de respaldo que ya usan renderizarTareas/Actividades/
// Proyectos cuando un ítem no trae "secuencia" (item.secuencia || "Otras
// tareas", etc.) — se reutiliza aquí para que la etiqueta de la columna
// "Secuencia" coincida con la que el alumno ve en su propia página.
const ETIQUETA_SIN_SECUENCIA_POR_TIPO = {
  tarea: "Otras tareas",
  actividad: "Otras actividades",
  proyecto: "Otros proyectos",
};

function claveSecuenciaDeEntregable(item) {
  return item.secuencia || ETIQUETA_SIN_SECUENCIA_POR_TIPO[item.tipoEntregable];
}

// Filtro actual del módulo. trimestre/secuencia empiezan en null: se
// resuelven en inicializarModuloCalificacion() antes del primer render
// (trimestre = el trimestre desbloqueado; secuencia = la primera
// disponible para ese trimestre/tipo). "tipo" ahora también puede ser
// "avance-por-tipo" (Cambio 4: no es un tipo real, activa la tabla
// resumen en vez de columnas de entregables — ver
// renderizarPanelCalificacion()). "vista" es "tabla" o "tarjetas"
// (Cambio 5), recordada en localStorage.
const CLAVE_VISTA_CALIFICACION = "calificacion_vista";
const estadoCalificacion = {
  trimestre: null,
  grupo: "todos",
  tipo: "todos",
  secuencia: null,
  vista: localStorage.getItem(CLAVE_VISTA_CALIFICACION) || "tabla",
};

// alumnos_registro.id (fila) -> objeto alumno completo, para que la
// delegación de "Ver historial completo" recupere el alumno completo a
// partir del data-alumno-id del botón sin volver a consultar Supabase.
// Mismo patrón que mapaDetallesPorId (sección 5) para el modal de detalle
// de tareas/actividades/proyectos. Se repuebla en cada render de la tabla.
const mapaAlumnosCalificacionPorId = new Map();

// Sin distinguir mayúsculas/acentos, para el buscador en vivo del Alumno.
// Mismo criterio de normalización que slugAlumno() (sección 11), pero sin
// convertir espacios en guiones: aquí se necesita una comparación de
// substring normal, no una llave de localStorage.
function normalizarParaBusqueda(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Combina obtenerTareas/Actividades/Proyectos según el tipo elegido,
// marcando cada item con item.tipoEntregable ("tarea"/"actividad"/
// "proyecto") para poder construir la llave de progreso
// (`${alumno_id}-${tipo}-${item_id}`) sin importar de qué array vino.
async function obtenerEntregablesPorTipo(tipo, trimestre) {
  if (tipo === "tarea") {
    return (await obtenerTareas(trimestre)).map((item) => ({ ...item, tipoEntregable: "tarea" }));
  }
  if (tipo === "actividad") {
    return (await obtenerActividades(trimestre)).map((item) => ({ ...item, tipoEntregable: "actividad" }));
  }
  if (tipo === "proyecto") {
    return (await obtenerProyectos(trimestre)).map((item) => ({ ...item, tipoEntregable: "proyecto" }));
  }

  const [tareas, actividades, proyectos] = await Promise.all([
    obtenerTareas(trimestre),
    obtenerActividades(trimestre),
    obtenerProyectos(trimestre),
  ]);
  return [
    ...tareas.map((item) => ({ ...item, tipoEntregable: "tarea" })),
    ...actividades.map((item) => ({ ...item, tipoEntregable: "actividad" })),
    ...proyectos.map((item) => ({ ...item, tipoEntregable: "proyecto" })),
  ];
}

// Todos los alumnos del grupo elegido (activos e inactivos: los
// inactivos se muestran atenuados, ver crearFilaAlumnoCalificacion), no
// solo los que ya reclamaron su cuenta — eso se distingue por celda, no
// excluyendo filas.
async function obtenerAlumnosParaCalificacion(grupo) {
  const opciones = { order: { columna: "numero_lista", ascending: true } };
  if (grupo !== "todos") opciones.eq = { grupo };

  const { data, error } = await obtenerDatos("alumnos_registro", opciones);
  if (error) return [];
  return data;
}

// Map `${alumno_id}-${tipo}-${item_id}` -> fila de progreso, para lookup
// O(1) al pintar cada celda (mismo patrón que TIPOS_DIA_POR_FECHA para el
// calendario). Solo consulta por los alumno_id que sí tienen cuenta
// (auth_user_id no nulo): los que no, nunca van a tener fila de progreso.
async function obtenerMapaProgresoCalificacion(trimestre, tipos, alumnoIds) {
  const mapa = new Map();
  if (alumnoIds.length === 0) return mapa;

  const { data, error } = await obtenerDatos("progreso", {
    eq: { trimestre },
    in: { tipo: tipos, alumno_id: alumnoIds },
  });

  if (error) return mapa;

  data.forEach((fila) => {
    mapa.set(fila.alumno_id + "-" + fila.tipo + "-" + fila.item_id, fila);
  });
  return mapa;
}

// Calcula y persiste la columna "a_tiempo" de la tabla "progreso" (ya
// existe, hasta ahora siempre en null) para las entregas que ya están
// completadas pero todavía no tienen ese valor calculado. Mismo criterio
// que ya usa calcularRachaPuntualidad() (actualizado_en vs. la fecha
// límite del ítem), pero persistido: una vez calculado queda congelado
// — el filtro "a_tiempo === null" de abajo excluye automáticamente las
// filas ya procesadas, así que si después se mueve la fecha límite desde
// "Fechas de entrega" esta función YA NO las vuelve a tocar.
//
// Excluye origen === "manual-docente" a propósito: esas entregas las
// marca el profesor por decisión propia (ver guardarEntregaManual), no
// hay un "a tiempo/tarde" real que calcular ahí — se quedan en null para
// siempre, sin problema (ver pintarBadgeCalificacion, que solo pinta el
// ícono ⏰ cuando a_tiempo === false).
async function calcularYGuardarATiempo(mapaProgreso, trimestre) {
  // Guard de modo demo (Fase 6): red de seguridad explícita — hoy ya
  // está protegida "gratis" porque datos-demo.js siempre genera
  // a_tiempo como booleano (nunca null, ver demoGenerarProgresoAlumno),
  // así que el filtro de abajo nunca encuentra pendientes en modo demo.
  // Sin modal: esta función corre sola en cada render, sin que el
  // docente haya hecho clic en nada — el toast persistente ya avisa.
  if (demoModeActivo()) return;

  const pendientes = [...mapaProgreso.values()].filter(
    (fila) => fila.completado === true && fila.a_tiempo === null && fila.origen !== "manual-docente"
  );
  if (pendientes.length === 0) return;

  const idsAlumnos = [...new Set(pendientes.map((fila) => fila.alumno_id))];
  const { data: alumnosRegistro } = await clienteSupabase
    .from("alumnos_registro")
    .select("auth_user_id, grupo")
    .in("auth_user_id", idsAlumnos);
  const grupoPorAlumno = new Map((alumnosRegistro || []).map((alumno) => [alumno.auth_user_id, alumno.grupo]));

  const items = await obtenerEntregablesPorTipo("todos", trimestre);

  for (const fila of pendientes) {
    if (!fila.actualizado_en) continue; // sin fecha real de entrega: no se puede evaluar

    const item = items.find(
      (candidato) => candidato.tipoEntregable === fila.tipo && String(candidato.id) === String(fila.item_id)
    );
    if (!item) continue; // id desconocido (item borrado/cambiado): se reintenta en la próxima carga

    const grupo = grupoPorAlumno.get(fila.alumno_id);
    if (!grupo) continue;

    const fechaLimite = fechaLimiteISO(fila.tipo, item, grupo);
    if (!fechaLimite) continue; // sin fecha límite resoluble: se reintenta en la próxima carga

    const aTiempo = new Date(fila.actualizado_en) <= new Date(fechaLimite + "T23:59:59");

    try {
      const { error } = await clienteSupabase.from("progreso").update({ a_tiempo: aTiempo }).eq("id", fila.id);
      if (error) throw error;
      // Mismo objeto que ya vive dentro de mapaProgreso (Map de
      // referencias, no de copias): mutarlo aquí ya deja el render de
      // esta misma carga con el valor correcto, sin recargar la página.
      fila.a_tiempo = aTiempo;
    } catch {
      // No detiene el resto (mismo patrón que aplicarRecorridoFechas):
      // esta fila se reintenta en la próxima carga de la tabla, a_tiempo
      // sigue en null hasta entonces.
    }
  }
}

// Recalcula las opciones del <select> de secuencia a partir de los
// entregables del trimestre/tipo actualmente elegidos, en el orden en que
// aparecen en los datos (no alfabético). Conserva la selección previa si
// sigue siendo una opción válida; si no, cae a la primera disponible.
async function actualizarOpcionesSecuenciaCalificacion() {
  const select = document.getElementById("calificacion-filtro-secuencia");
  if (!select) return;

  const entregables = await obtenerEntregablesPorTipo(estadoCalificacion.tipo, estadoCalificacion.trimestre);

  const vistas = new Set();
  const opciones = [];
  entregables.forEach((item) => {
    const clave = claveSecuenciaDeEntregable(item);
    if (!vistas.has(clave)) {
      vistas.add(clave);
      opciones.push(clave);
    }
  });

  const valorPrevio = estadoCalificacion.secuencia;
  select.innerHTML = "";
  opciones.forEach((clave) => {
    const opcion = document.createElement("option");
    opcion.value = clave;
    opcion.textContent = clave;
    select.appendChild(opcion);
  });

  estadoCalificacion.secuencia = opciones.includes(valorPrevio) ? valorPrevio : opciones[0] || null;
  select.value = estadoCalificacion.secuencia || "";
}

// Construye (o repinta) el badge de estado de una celda/ítem
// alumno×entregable dentro de "contenedor" (un <td> en la tabla matriz,
// un <span> envoltorio en el modal de historial): se usa tanto para el
// pintado inicial como para repintar SOLO esta celda después de guardar/
// deshacer una marca manual (Prompt 5c), sin duplicar los 4 estados de
// badge en dos lugares distintos del código — antes crearBadgeCalificacion
// y crearSeccionTrimestreHistorial tenían cada una su propia copia.
//
// Reglas de qué celdas son clicleables (abren el panel de marcar/editar):
//   1. Alumno sin cuenta activa → nunca clicleable (no hay alumno_id
//      válido para insertar en "progreso").
//   2. Con fila de progreso de origen "formulario" → nunca clicleable:
//      es la fuente de verdad real de una entrega, no se altera desde
//      aquí (si algún día hace falta corregir una, es un flujo aparte).
//   3. Sin fila de progreso (pendiente/atrasada) → clicleable, abre en
//      modo "Marcar".
//   4. Con fila de progreso de origen "manual-docente" → clicleable,
//      abre en modo "Editar" (con botón extra "Deshacer marca manual").
//
// "contexto" trae: alumno, item, trimestre, filaProgreso, sinCuenta, y
// opcionalmente mapaProgreso + claveMapaProgreso (el Map y la llave de
// ESE alumno×item×trimestre en ese Map) para poder mantenerlo
// sincronizado tras guardar/deshacer sin que el llamador tenga que saber
// cómo hacerlo. "alRepintarExtra(nuevaFilaProgresoOderNull)" es opcional:
// se llama justo después de repintar el badge, para que un llamador con
// contenido adicional que depende del mismo filaProgreso (el párrafo de
// nota del modal de historial, que la tabla matriz no tiene) lo pueda
// mantener en sincronía sin que esta función genérica necesite saber que
// existe.
function pintarBadgeCalificacion(contenedor, contexto) {
  const { alumno, item, trimestre, filaProgreso, sinCuenta, mapaProgreso, claveMapaProgreso, compacto } = contexto;
  contenedor.innerHTML = "";

  const editable = !sinCuenta && (!filaProgreso || filaProgreso.origen === "manual-docente");
  const badge = document.createElement(editable ? "button" : "span");
  if (editable) badge.type = "button";
  badge.className = "badge-estado";
  if (compacto) badge.classList.add("badge-estado--compacto");

  // Compacto (Cambio 2, solo la tabla matriz): únicamente el ícono, con
  // aria-label + title nativos para no perder accesibilidad. Verboso
  // (comportamiento original, el que sigue usando el modal de
  // historial): ícono + palabra, sin title propio salvo los casos
  // especiales de abajo (sin-cuenta/origen formulario) — mismo
  // comportamiento que antes de este cambio.
  function pintarContenido(estado) {
    badge.dataset.estado = estado;
    const etiqueta = TEXTO_ESTADO_CALIFICACION[estado];
    if (compacto) {
      badge.textContent = ICONO_ESTADO_CALIFICACION[estado];
      badge.setAttribute("aria-label", etiqueta);
      badge.title = etiqueta;
    } else {
      badge.textContent = ICONO_ESTADO_CALIFICACION[estado] + " " + etiqueta;
    }
  }

  if (sinCuenta) {
    pintarContenido("sin-cuenta");
    badge.title = "Este alumno no tiene cuenta activa todavía";
    contenedor.appendChild(badge);
    return;
  }

  if (filaProgreso && filaProgreso.completado) {
    pintarContenido("completada");
  } else if (itemEstaVencido(item.tipoEntregable, item, alumno.grupo)) {
    pintarContenido("atrasada");
  } else {
    pintarContenido("pendiente");
  }

  if (editable) {
    badge.classList.add("badge-estado--editable");
    badge.addEventListener("click", () => {
      abrirModalEditarEntrega({
        alumno,
        item,
        trimestre,
        filaProgreso,
        alGuardar: (nuevaFila) => {
          if (mapaProgreso && claveMapaProgreso) mapaProgreso.set(claveMapaProgreso, nuevaFila);
          pintarBadgeCalificacion(contenedor, { ...contexto, filaProgreso: nuevaFila });
          contexto.alRepintarExtra?.(nuevaFila);
        },
        alDeshacer: () => {
          if (mapaProgreso && claveMapaProgreso) mapaProgreso.delete(claveMapaProgreso);
          pintarBadgeCalificacion(contenedor, { ...contexto, filaProgreso: null });
          contexto.alRepintarExtra?.(null);
        },
      });
    });
  } else if (filaProgreso && filaProgreso.origen === "formulario") {
    badge.title = "Esta entrega llegó por el formulario del alumno; no se puede editar desde aquí.";
  }

  contenedor.appendChild(badge);

  if (filaProgreso?.completado && filaProgreso.origen === "manual-docente") {
    const marcaManual = document.createElement("span");
    marcaManual.className = "calificacion-tabla__origen-manual";
    marcaManual.title = "Marcado manualmente por el docente";
    marcaManual.textContent = "🖊️";
    contenedor.appendChild(marcaManual);
  }

  // a_tiempo === false: entrega completada pero registrada después de la
  // fecha límite (ver calcularYGuardarATiempo). true o null (no
  // calculado todavía, o entrega manual-docente que nunca se calcula) no
  // agregan nada — comportamiento actual sin cambios.
  if (filaProgreso?.completado && filaProgreso.a_tiempo === false) {
    const marcaTardia = document.createElement("span");
    marcaTardia.className = "calificacion-tabla__entrega-tardia";
    marcaTardia.title = "Esta entrega se registró después de la fecha límite";
    marcaTardia.textContent = "⏰";
    contenedor.appendChild(marcaTardia);
  }
}

// Celda <td> de la tabla matriz para un alumno×entregable. "sinCuenta" ya
// viene resuelto por el llamador (alumnos_registro.usado === false o
// auth_user_id nulo) para no repetir esa lectura por cada celda de la
// fila. "mapaProgreso" es el mismo Map que ya construyó
// renderizarTablaCalificacion() para esta vista: se pasa para que
// pintarBadgeCalificacion() pueda actualizarlo en memoria tras marcar/
// deshacer sin volver a consultar Supabase.
function crearBadgeCalificacion(alumno, item, filaProgreso, sinCuenta, trimestre, mapaProgreso) {
  const celda = document.createElement("td");
  // "tabla-calificacion__col-item" es la misma clase del <th> de esta
  // columna: comparte min-width y scroll-snap-align en mobile (ver
  // css/style.css) para que el punto de snap quede en el mismo eje tanto
  // en el encabezado como en cada celda de datos. "--compacto" es propia
  // de este módulo (Cambio 1): NO se agrega a .tabla-calificacion__col-item
  // base porque esa clase también la usa construirTablaEvaluacion() con
  // columnas de calificación numérica, que necesitan más ancho.
  celda.className = "calificacion-tabla__celda tabla-calificacion__col-item tabla-calificacion__col-item--compacto";

  const claveMapaProgreso = alumno.auth_user_id + "-" + item.tipoEntregable + "-" + item.id;
  pintarBadgeCalificacion(celda, {
    alumno,
    item,
    trimestre,
    filaProgreso,
    sinCuenta,
    mapaProgreso,
    claveMapaProgreso,
    compacto: true,
  });

  return celda;
}

// "completados/total" de un alumno sobre un set de entregables ya
// filtrado (por tipo/secuencia/grupo, según lo necesite el llamador) —
// extraído de crearFilaAlumnoCalificacion (antes vivía inline en su
// forEach) para reutilizarlo también en la ficha por alumno (Vista
// Tarjetas, Cambio 5) y en la tabla "Avance por Tipo" (Cambio 4), sin
// triplicar el mismo conteo. porcentaje null cuando no aplica (sin
// cuenta o sin entregables) para que cada llamador decida cómo mostrar
// ese caso ("—", por convención ya usada en el resto del módulo).
function calcularPorcentajeEntrega(items, alumno, mapaProgreso, sinCuenta) {
  if (sinCuenta || items.length === 0) return { completados: 0, porcentaje: null };
  const completados = items.filter((item) => {
    const fila = mapaProgreso.get(alumno.auth_user_id + "-" + item.tipoEntregable + "-" + item.id);
    return fila && fila.completado;
  }).length;
  return { completados, porcentaje: Math.round((completados / items.length) * 100) };
}

function crearFilaAlumnoCalificacion(alumno, entregables, mapaProgreso, trimestre) {
  const fila = document.createElement("tr");
  if (alumno.activo === false) fila.classList.add("fila-alumno--inactivo");

  // Atributos de solo lectura para el buscador en vivo (filtra estas
  // mismas filas ya renderizadas, ver filtrarFilasTablaCalificacion): sin
  // acentos/mayúsculas para nombre, tal cual para número de lista.
  fila.dataset.nombreBusqueda = normalizarParaBusqueda(alumno.nombre);
  fila.dataset.numeroLista = String(alumno.numero_lista);

  mapaAlumnosCalificacionPorId.set(String(alumno.id), alumno);

  const celdaAlumno = document.createElement("td");
  celdaAlumno.className = "tabla-calificacion__col-fija";
  const envoltura = document.createElement("div");
  envoltura.className = "calificacion-tabla__alumno";
  const nombre = document.createElement("span");
  nombre.className = "calificacion-tabla__alumno-nombre";
  nombre.textContent = alumno.nombre;
  const numero = document.createElement("span");
  numero.className = "calificacion-tabla__alumno-numero";
  numero.textContent = "N.° " + alumno.numero_lista;
  const botonHistorial = document.createElement("button");
  botonHistorial.type = "button";
  botonHistorial.className = "calificacion-tabla__boton-historial";
  botonHistorial.dataset.alumnoId = alumno.id;
  botonHistorial.textContent = "👁️ Ver historial completo";
  envoltura.append(nombre, numero, botonHistorial);
  celdaAlumno.appendChild(envoltura);
  fila.appendChild(celdaAlumno);

  const sinCuenta = alumno.usado === false || !alumno.auth_user_id;

  entregables.forEach((item) => {
    const filaProgreso = sinCuenta
      ? null
      : mapaProgreso.get(alumno.auth_user_id + "-" + item.tipoEntregable + "-" + item.id);
    fila.appendChild(crearBadgeCalificacion(alumno, item, filaProgreso, sinCuenta, trimestre, mapaProgreso));
  });

  const { porcentaje } = calcularPorcentajeEntrega(entregables, alumno, mapaProgreso, sinCuenta);
  const celdaAvance = document.createElement("td");
  celdaAvance.className = "calificacion-tabla__avance";
  celdaAvance.textContent = porcentaje == null ? "—" : porcentaje + "%";
  fila.appendChild(celdaAvance);

  return fila;
}

// Fila de totales al pie: % de alumnos CON cuenta activa que tienen cada
// columna completada (los "sin cuenta" quedan fuera del cálculo, para no
// diluir el porcentaje con alumnos que nunca pudieron entregar).
function crearPieCalificacion(alumnos, entregables, mapaProgreso) {
  const tfoot = document.createElement("tfoot");
  const fila = document.createElement("tr");

  const celdaEtiqueta = document.createElement("td");
  celdaEtiqueta.className = "tabla-calificacion__col-fija";
  celdaEtiqueta.textContent = "% completado";
  fila.appendChild(celdaEtiqueta);

  const alumnosConCuenta = alumnos.filter((alumno) => alumno.usado !== false && alumno.auth_user_id);

  entregables.forEach((item) => {
    const celda = document.createElement("td");
    if (alumnosConCuenta.length === 0) {
      celda.textContent = "—";
    } else {
      const completados = alumnosConCuenta.filter((alumno) => {
        const filaProgreso = mapaProgreso.get(alumno.auth_user_id + "-" + item.tipoEntregable + "-" + item.id);
        return filaProgreso && filaProgreso.completado;
      }).length;
      celda.textContent = Math.round((completados / alumnosConCuenta.length) * 100) + "%";
    }
    fila.appendChild(celda);
  });

  const celdaAvance = document.createElement("td");
  celdaAvance.textContent = "—";
  fila.appendChild(celdaAvance);

  tfoot.appendChild(fila);
  return tfoot;
}

function construirTablaCalificacion(alumnos, entregables, mapaProgreso, trimestre) {
  const tabla = document.createElement("table");
  tabla.className = "tabla-calificacion";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");

  const thAlumno = document.createElement("th");
  thAlumno.className = "tabla-calificacion__col-fija";
  thAlumno.textContent = "Alumno";
  filaEncabezado.appendChild(thAlumno);

  // Cambio 1: encabezado compacto — ícono de tipo + código corto ("T1",
  // "A2", "P1"...) según la posición del ítem dentro de su propio tipo
  // en la secuencia ya filtrada (entregables ya viene acotado a una sola
  // secuencia, ver renderizarTablaCalificacion). El título completo NO
  // se pierde: sigue en el atributo title nativo (tooltip del navegador,
  // sin componente nuevo) — ya estaba ahí, solo se dejó de repetir como
  // textContent.
  const contadorPorTipo = { tarea: 0, actividad: 0, proyecto: 0 };
  entregables.forEach((item) => {
    contadorPorTipo[item.tipoEntregable]++;
    const th = document.createElement("th");
    th.className = "tabla-calificacion__col-item tabla-calificacion__col-item--compacto";
    th.title = item.titulo;
    th.textContent =
      ICONO_TIPO_ENTREGABLE[item.tipoEntregable] + " " + LETRA_TIPO_ENTREGABLE[item.tipoEntregable] + contadorPorTipo[item.tipoEntregable];
    // Permite identificar a qué tipo pertenece cada columna leyendo solo
    // el DOM ya renderizado (ver prepararImpresionTablaPorTipo), sin
    // tener que volver a consultar "entregables" fuera de esta función.
    th.dataset.tipoEntregable = item.tipoEntregable;
    filaEncabezado.appendChild(th);
  });

  const thAvance = document.createElement("th");
  thAvance.textContent = "Avance";
  filaEncabezado.appendChild(thAvance);

  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  alumnos.forEach((alumno) => {
    tbody.appendChild(crearFilaAlumnoCalificacion(alumno, entregables, mapaProgreso, trimestre));
  });
  tabla.appendChild(tbody);

  tabla.appendChild(crearPieCalificacion(alumnos, entregables, mapaProgreso));

  return tabla;
}

// Filtra en vivo las FILAS ya renderizadas de <tbody> (no dispara una
// nueva consulta): compara el término contra nombre (sin acentos/
// mayúsculas) y número de lista de cada fila, usando los data-attributes
// que ya deja crearFilaAlumnoCalificacion(). Incluye a los alumnos "Sin
// cuenta activa" — no se excluye a nadie de la búsqueda.
function filtrarFilasTablaCalificacion() {
  const input = document.getElementById("calificacion-buscador-input");
  const contenedor = document.getElementById("calificacion-tabla-contenedor");
  if (!input || !contenedor) return;

  // "[data-nombre-busqueda]" en vez de "tbody tr" (Cambio 5): ese mismo
  // dataset ya lo trae cada <tr> de la tabla matriz Y cada <details> de
  // la Vista Tarjetas (ver crearFichaAlumnoCalificacion), así que una
  // sola función filtra ambas vistas sin necesitar saber cuál está
  // activa. hayContenido detecta cuál de las dos hay en el DOM para el
  // mensaje de "sin coincidencias".
  const hayContenido = Boolean(contenedor.querySelector(".tabla-calificacion, .calificacion-fichas"));
  const filas = contenedor.querySelectorAll("[data-nombre-busqueda]");
  let mensajeSinCoincidencias = contenedor.querySelector(".calificacion-tabla__sin-coincidencias");

  if (!hayContenido || filas.length === 0) {
    if (mensajeSinCoincidencias) mensajeSinCoincidencias.remove();
    return;
  }

  const termino = normalizarParaBusqueda(input.value.trim());
  let algunaVisible = false;

  filas.forEach((fila) => {
    const coincide =
      termino === "" ||
      fila.dataset.nombreBusqueda.includes(termino) ||
      fila.dataset.numeroLista.includes(termino);
    fila.hidden = !coincide;
    if (coincide) algunaVisible = true;
  });

  if (termino !== "" && !algunaVisible) {
    if (!mensajeSinCoincidencias) {
      mensajeSinCoincidencias = document.createElement("p");
      mensajeSinCoincidencias.className = "sin-resultados calificacion-tabla__sin-coincidencias";
      mensajeSinCoincidencias.textContent =
        "No se encontró en esta vista — prueba cambiar el filtro de Trimestre/Secuencia.";
      // appendChild (no .after()): a diferencia de la tabla original, el
      // contenedor ahora puede tener un <table> o un <div class=
      // "calificacion-fichas">, así que se agrega al final del
      // contenedor en vez de anclarse a un elemento "tabla" específico.
      contenedor.appendChild(mensajeSinCoincidencias);
    }
  } else if (mensajeSinCoincidencias) {
    mensajeSinCoincidencias.remove();
  }
}

// El buscador vive fuera de la tabla (no se borra en cada
// renderizarTablaCalificacion), así que su listener se registra una sola
// vez desde inicializarModuloCalificacion(); el filtrado en sí se re-
// aplica en cada render nuevo (ver el final de renderizarTablaCalificacion)
// para que el término de búsqueda siga vigente al cambiar Trimestre/
// Grupo/Tipo/Secuencia, no solo hasta el siguiente cambio de filtro.
function activarBuscadorCalificacion() {
  const input = document.getElementById("calificacion-buscador-input");
  if (!input) return;
  input.addEventListener("input", filtrarFilasTablaCalificacion);
}

// Delegación de eventos (mismo patrón que activarDelegacionVerDetalle en
// sección 5) para el botón "👁️ Ver historial completo" de cada fila: un
// único listener en el contenedor detecta clicks incluso en filas que se
// vuelven a crear en cada render.
function activarDelegacionHistorialCalificacion() {
  const contenedor = document.getElementById("calificacion-tabla-contenedor");
  if (!contenedor) return;

  contenedor.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".calificacion-tabla__boton-historial");
    if (!boton) return;
    evento.preventDefault();
    const alumno = mapaAlumnosCalificacionPorId.get(boton.dataset.alumnoId);
    if (alumno) abrirModalHistorialAlumno(alumno);
  });
}

// Agrega/actualiza/quita el párrafo "📝 Nota: ..." de un ítem del modal
// de historial según su filaProgreso actual — usada tanto al construir
// el <li> por primera vez como para mantenerlo en sincronía después de
// guardar/deshacer una marca manual desde este mismo modal (ver
// alRepintarExtra en crearSeccionTrimestreHistorial), sin duplicar esta
// condición en dos lugares: si ya existe un párrafo y ya no aplica, se
// quita; si no existía y ahora aplica, se crea; si existe y sigue
// aplicando, solo se actualiza su texto.
function actualizarNotaHistorial(li, filaProgreso) {
  const notaExistente = li.querySelector(".calificacion-historial__nota");
  const debeMostrarNota = filaProgreso?.completado && filaProgreso.origen === "manual-docente" && filaProgreso.nota;

  if (!debeMostrarNota) {
    notaExistente?.remove();
    return;
  }

  const nota = notaExistente || document.createElement("p");
  nota.className = "calificacion-historial__nota";
  nota.textContent = "📝 Nota: " + filaProgreso.nota;
  if (!notaExistente) li.appendChild(nota);
}

// Promedio del trimestre para el modal de historial (30% tareas, 30%
// actividades, 40% proyectos, renormalizado entre los tipos con dato —
// ver más abajo). itemsPorTipo = { tarea, actividad, proyecto }, cada
// array con los items del trimestre tal cual los devuelve
// obtenerEntregablesPorTipo (con su "secuencia" y fechaEntrega/fecha ya
// con overrides de grupo aplicados, vía aplicarOverridesFechas()).
// mapaProgreso ya viene scoped a un solo alumno (misma clave
// "tipo-item_id-trimestre" que usa crearSeccionTrimestreHistorial), así
// que alumnoId no participa en ningún lookup — se recibe solo para que
// la firma documente de quién es el mapaProgreso que se le pasa. "grupo"
// (alumno.grupo, "3C"/"3E") es del alumno dueño de mapaProgreso, no del
// filtro de la página — lo necesita itemEstaVencido() para resolver la
// fecha límite real de cada item.
//
// Fórmula, por tipo: se agrupan los items por "secuencia" (string
// exacto); SOLO entran al promedio del tipo las secuencias donde TODOS
// sus items ya vencieron (itemEstaVencido() true para cada uno) — una
// secuencia con algún item todavía no vencido queda fuera completa (no
// cuenta como 0, no participa; calificar un item antes de que venza no
// lo mete al cálculo). Dentro de una secuencia YA vencida, cada
// calificación (null o sin fila en progreso) sigue contando como 0, sin
// excluirse del promedio — ese sub-cálculo no cambia. Un tipo sin
// ninguna secuencia vencida queda SIN dato (null, no 0): "no aplica
// todavía", no "reprobado".
//
// promedioFinal = suma ponderada (0.3/0.3/0.4) SOLO de los tipos con
// dato, renormalizando esos pesos entre sí (ej. solo tarea+actividad →
// 0.5/0.5 en vez de 0.3/0.3 sobre un total de 0.6). Sin ningún tipo con
// dato, promedioFinal es null — mismo "—" que ya existe hoy cuando no
// hay ninguna calificación capturada (tieneAlgunaCalificacionCapturada,
// guard EXTERNO e independiente de este: un trimestre puede quedar en
// "—" por cualquiera de los dos motivos).
function calcularPromedioTrimestre(alumnoId, trimestre, itemsPorTipo, mapaProgreso, grupo) {
  function promedioDeTipo(items, tipo) {
    const itemsPorSecuencia = new Map();
    items.forEach((item) => {
      const clave = claveSecuenciaDeEntregable(item);
      if (!itemsPorSecuencia.has(clave)) itemsPorSecuencia.set(clave, []);
      itemsPorSecuencia.get(clave).push(item);
    });

    const promediosPorSecuenciaVencida = Array.from(itemsPorSecuencia.values())
      .filter((itemsSecuencia) => itemsSecuencia.every((item) => itemEstaVencido(tipo, item, grupo)))
      .map((itemsSecuencia) => {
        const suma = itemsSecuencia.reduce((acumulado, item) => {
          const calificacion = mapaProgreso.get(tipo + "-" + item.id + "-" + trimestre)?.calificacion;
          return acumulado + (calificacion == null ? 0 : Number(calificacion));
        }, 0);
        return suma / itemsSecuencia.length;
      });

    if (promediosPorSecuenciaVencida.length === 0) return null;
    return (
      promediosPorSecuenciaVencida.reduce((acumulado, valor) => acumulado + valor, 0) /
      promediosPorSecuenciaVencida.length
    );
  }

  const redondear1Decimal = (valor) => (valor == null ? null : Math.round(valor * 10) / 10);

  const promedioTarea = promedioDeTipo(itemsPorTipo.tarea || [], "tarea");
  const promedioActividad = promedioDeTipo(itemsPorTipo.actividad || [], "actividad");
  const promedioProyecto = promedioDeTipo(itemsPorTipo.proyecto || [], "proyecto");

  const PESO_BASE_POR_TIPO = { tarea: 0.3, actividad: 0.3, proyecto: 0.4 };
  const tiposConDato = [
    { tipo: "tarea", valor: promedioTarea },
    { tipo: "actividad", valor: promedioActividad },
    { tipo: "proyecto", valor: promedioProyecto },
  ].filter((t) => t.valor != null);

  let promedioFinal = null;
  if (tiposConDato.length > 0) {
    const sumaPesos = tiposConDato.reduce((s, t) => s + PESO_BASE_POR_TIPO[t.tipo], 0);
    promedioFinal = tiposConDato.reduce((s, t) => s + (PESO_BASE_POR_TIPO[t.tipo] / sumaPesos) * t.valor, 0);
  }

  return {
    promedioFinal: redondear1Decimal(promedioFinal),
    promedioTarea: redondear1Decimal(promedioTarea),
    promedioActividad: redondear1Decimal(promedioActividad),
    promedioProyecto: redondear1Decimal(promedioProyecto),
  };
}

// "Sin nada que promediar" (mapaProgreso ya scoped a un solo alumno):
// ni una sola fila con calificacion capturada en todo el trimestre, sin
// importar tipo/secuencia — distinto de "0.0 real", que
// calcularPromedioTrimestre() sí produciría porque trata cada item sin
// calificar como 0 dentro de su propio cálculo (documentado arriba).
// Antes vivía solo como una constante local duplicada dentro de la
// tabla de promedios de Evaluación (crearFilaAlumnoPromedios); extraída
// aquí para que el modal de historial de alumno use exactamente la
// misma regla, sin una segunda definición que pudiera desalinearse.
function tieneAlgunaCalificacionCapturada(mapaProgreso) {
  return Array.from(mapaProgreso.values()).some((filaProgreso) => filaProgreso.calificacion != null);
}

// Una sección <section> por trimestre dentro del modal de historial:
// barra de avance + lista de TODOS los items de ese trimestre (tareas,
// actividades y proyectos juntos, en ese orden — el mismo orden de
// concatenación que ya usa obtenerEntregablesPorTipo("todos", ...), no
// hay un orden distinto especificado para el historial). Mismos 4
// estados de badge que la tabla matriz (vía pintarBadgeCalificacion, con
// las mismas reglas de qué items son clicleables), sin el caso "sin
// cuenta": esta función solo se usa para alumnos que sí tienen cuenta
// activa (ver abrirModalHistorialAlumno). Recibe el "alumno" completo
// (no solo su grupo) porque marcar/editar una entrega desde aquí necesita
// su auth_user_id y nombre, no solo el grupo para itemEstaVencido.
function crearSeccionTrimestreHistorial(trimestre, entregables, mapaProgreso, alumno) {
  const seccion = document.createElement("section");
  seccion.className = "calificacion-historial__trimestre";

  const titulo = document.createElement("h4");
  titulo.textContent = "Trimestre " + trimestre;
  seccion.appendChild(titulo);

  const completados = entregables.filter((item) => {
    const fila = mapaProgreso.get(item.tipoEntregable + "-" + item.id + "-" + trimestre);
    return fila && fila.completado;
  }).length;
  const total = entregables.length;
  const porcentaje = total === 0 ? 0 : Math.round((completados / total) * 100);

  const resumen = document.createElement("p");
  resumen.className = "resumen-progreso__texto";
  resumen.textContent = completados + " de " + total + " completados (" + porcentaje + "%)";
  seccion.appendChild(resumen);

  const barra = document.createElement("div");
  barra.className = "barra-progreso";
  barra.setAttribute("role", "progressbar");
  barra.setAttribute("aria-valuenow", String(completados));
  barra.setAttribute("aria-valuemin", "0");
  barra.setAttribute("aria-valuemax", String(total));
  const relleno = document.createElement("div");
  relleno.className = "barra-progreso__relleno";
  relleno.style.width = porcentaje + "%";
  barra.appendChild(relleno);
  seccion.appendChild(barra);

  if (total === 0) {
    const sinItems = document.createElement("p");
    sinItems.className = "sin-resultados";
    sinItems.textContent = "Sin tareas, actividades ni proyectos registrados para este trimestre.";
    seccion.appendChild(sinItems);
    return seccion;
  }

  // Se recalcula en cada apertura del modal (mapaProgreso siempre viene
  // recién consultado desde abrirModalHistorialAlumno, nunca cacheado),
  // así que una calificación recién guardada ya se refleja la próxima
  // vez que se abre el historial de ese alumno.
  const itemsPorTipo = { tarea: [], actividad: [], proyecto: [] };
  entregables.forEach((item) => {
    itemsPorTipo[item.tipoEntregable]?.push(item);
  });

  const bloquePromedio = document.createElement("div");
  bloquePromedio.className = "calificacion-historial__promedio";

  const textoPromedioFinal = document.createElement("p");
  textoPromedioFinal.className = "calificacion-historial__promedio-final";

  const textoDesglose = document.createElement("p");
  textoDesglose.className = "calificacion-historial__promedio-desglose";

  // Mismo criterio que la tabla de promedios de Evaluación
  // (crearFilaAlumnoPromedios, vía tieneAlgunaCalificacionCapturada()):
  // sin ninguna calificación capturada en el trimestre, "—" en las 4
  // columnas — nunca 0.0 real, que calcularPromedioTrimestre() sí
  // produciría porque trata cada item sin calificar como 0 dentro de su
  // propio cálculo.
  if (!tieneAlgunaCalificacionCapturada(mapaProgreso)) {
    textoPromedioFinal.textContent = "Promedio del trimestre: —";
    textoDesglose.textContent = "Tareas: — · Actividades: — · Proyectos: —";
  } else {
    const promedio = calcularPromedioTrimestre(alumno.auth_user_id, trimestre, itemsPorTipo, mapaProgreso, alumno.grupo);
    textoPromedioFinal.textContent = "Promedio del trimestre: " + formatearCalificacion(promedio.promedioFinal, formatoCalificacionActivo);
    textoDesglose.textContent =
      "Tareas: " +
      formatearCalificacion(promedio.promedioTarea, formatoCalificacionActivo) +
      " · Actividades: " +
      formatearCalificacion(promedio.promedioActividad, formatoCalificacionActivo) +
      " · Proyectos: " +
      formatearCalificacion(promedio.promedioProyecto, formatoCalificacionActivo);
  }

  bloquePromedio.appendChild(textoPromedioFinal);
  bloquePromedio.appendChild(textoDesglose);
  seccion.appendChild(bloquePromedio);

  const lista = document.createElement("ul");
  lista.className = "calificacion-historial__lista";

  entregables.forEach((item) => {
    const li = document.createElement("li");
    li.className = "calificacion-historial__item";

    const encabezadoItem = document.createElement("div");
    encabezadoItem.className = "calificacion-historial__item-encabezado";

    const tituloItem = document.createElement("span");
    tituloItem.textContent = ICONO_TIPO_ENTREGABLE[item.tipoEntregable] + " " + item.titulo;
    encabezadoItem.appendChild(tituloItem);

    const filaProgreso = mapaProgreso.get(item.tipoEntregable + "-" + item.id + "-" + trimestre);
    const contenedorBadge = document.createElement("span");
    contenedorBadge.className = "calificacion-historial__badge-contenedor";
    const claveMapaProgreso = item.tipoEntregable + "-" + item.id + "-" + trimestre;
    pintarBadgeCalificacion(contenedorBadge, {
      alumno,
      item,
      trimestre,
      filaProgreso,
      sinCuenta: false,
      mapaProgreso,
      claveMapaProgreso,
      // Solo el historial tiene un párrafo de nota separado del badge (la
      // tabla matriz no); se mantiene en sincronía tras guardar/deshacer
      // sin que pintarBadgeCalificacion tenga que saber que existe.
      alRepintarExtra: (nuevaFila) => actualizarNotaHistorial(li, nuevaFila),
    });
    encabezadoItem.appendChild(contenedorBadge);
    li.appendChild(encabezadoItem);

    // Título arriba, fecha en una línea pequeña debajo: mismo formato y
    // clase (.tarjeta__fecha) que ya usan las tarjetas públicas de
    // tareas/actividades/proyectos, con la misma etiqueta según tipo
    // ("Entrega:"/"Fecha:"/"Entrega final:") y resolviendo la fecha con
    // el grupo del alumno cuyo historial se ve, no grupoActual.
    const etiquetaFecha =
      item.tipoEntregable === "actividad"
        ? "Fecha: "
        : item.tipoEntregable === "proyecto"
        ? "Entrega final: "
        : "Entrega: ";
    const valorFecha = item.tipoEntregable === "actividad" ? item.fecha : item.fechaEntrega;
    const fechaItem = document.createElement("p");
    fechaItem.className = "tarjeta__fecha";
    fechaItem.textContent = etiquetaFecha + resolverFechaItem(valorFecha, alumno.grupo);
    li.appendChild(fechaItem);

    actualizarNotaHistorial(li, filaProgreso);

    lista.appendChild(li);
  });
  seccion.appendChild(lista);

  return seccion;
}

// Abre el modal de historial para un alumno: CASO A (con cuenta activa)
// consulta los 3 trimestres completos + todo su progreso de una sola vez;
// CASO B (sin cuenta) solo muestra un mensaje con su código de invitación,
// sin intentar simular datos que no existen.
async function abrirModalHistorialAlumno(alumno) {
  const modal = document.getElementById("modal-historial-alumno");
  if (!modal) return;

  const idAlumno = String(alumno.id);
  modal.dataset.alumnoId = idAlumno;

  const titulo = document.getElementById("modal-historial-titulo");
  const subtitulo = document.getElementById("modal-historial-subtitulo");
  const contenido = document.getElementById("modal-historial-contenido");
  const botonImprimir = document.getElementById("boton-imprimir-historial");

  titulo.textContent = alumno.nombre;
  subtitulo.textContent = textoGrupo(alumno.grupo) + " · N.° " + alumno.numero_lista;
  botonImprimir.hidden = true;

  const sinCuenta = alumno.usado === false || !alumno.auth_user_id;

  if (sinCuenta) {
    contenido.innerHTML = "";
    const mensaje = document.createElement("p");
    mensaje.className = "calificacion-historial__sin-cuenta";
    mensaje.textContent =
      "Este alumno todavía no ha activado su cuenta, por lo que no hay progreso registrado. " +
      "Su código de invitación es: " + (alumno.codigo_invitacion || "—") + ".";
    contenido.appendChild(mensaje);
    modal.showModal();
    return;
  }

  contenido.textContent = "Cargando historial…";
  modal.showModal();

  const trimestres = ["1", "2", "3"];
  const [entregablesPorTrimestre, resultadoProgreso] = await Promise.all([
    Promise.all(trimestres.map((trimestre) => obtenerEntregablesPorTipo("todos", trimestre))),
    obtenerDatos("progreso", { eq: { alumno_id: alumno.auth_user_id } }),
  ]);

  // El docente pudo cerrar este modal y abrir el de otro alumno mientras
  // esta consulta seguía en curso; si ya no es el alumno activo, no pisar
  // el contenido del modal con una respuesta que ya no aplica.
  if (modal.dataset.alumnoId !== idAlumno) return;

  const mapaProgreso = new Map();
  if (!resultadoProgreso.error && resultadoProgreso.data) {
    resultadoProgreso.data.forEach((fila) => {
      mapaProgreso.set(fila.tipo + "-" + fila.item_id + "-" + String(fila.trimestre), fila);
    });
  }

  contenido.innerHTML = "";
  trimestres.forEach((trimestre, indice) => {
    contenido.appendChild(
      crearSeccionTrimestreHistorial(trimestre, entregablesPorTrimestre[indice], mapaProgreso, alumno)
    );
  });

  botonImprimir.hidden = false;
}

// Cierre del modal: botón "✕" y click en el ::backdrop — mismo patrón que
// activarCierreModalDetalle() en sección 5 (el <dialog> nativo ya cierra
// con Escape automáticamente).
function activarCierreModalHistorialCalificacion() {
  const modal = document.getElementById("modal-historial-alumno");
  if (!modal) return;

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) botonCerrar.addEventListener("click", () => cerrarDialogoAnimado(modal));

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });
}

// El botón solo es visible en CASO A (ver abrirModalHistorialAlumno). La
// clase "calificacion--imprimiendo-historial" es lo que le dice al CSS
// (ver @media print en style.css) que imprima el modal de historial y no
// la tabla general — sin ella, ambos bloques de @media print (este y el
// de "Imprimir tabla") se pisarían entre sí. Se agrega justo antes de
// window.print() y se quita en "afterprint" (no inmediatamente después de
// window.print(), porque esa llamada no es garantizado-síncrona en todos
// los navegadores mientras el diálogo de impresión sigue abierto).
function activarImpresionHistorialCalificacion() {
  const boton = document.getElementById("boton-imprimir-historial");
  if (!boton) return;

  boton.addEventListener("click", () => {
    document.body.classList.add("calificacion--imprimiendo-historial");
    window.print();
  });

  window.addEventListener("afterprint", () => {
    document.body.classList.remove("calificacion--imprimiendo-historial");
  });
}

// Hace upsert manual en "progreso" (update si ya había fila para este
// alumno×item×trimestre, insert si no) con completado=true, origen=
// "manual-docente" y la fecha/nota del formulario. Se resuelve como
// update-o-insert explícito (no un .upsert() nativo de PostgREST) porque
// eso requeriría una constraint UNIQUE(alumno_id,tipo,item_id,trimestre)
// cuya existencia no está confirmada — con la fila ya cargada (modo
// Editar) alcanza con actualizar por su "id" real, que sí es único.
async function guardarEntregaManual({ alumno, item, trimestre, filaProgreso, fecha, nota }) {
  const payload = {
    completado: true,
    origen: "manual-docente",
    fecha_entrega_manual: fecha,
    nota: nota || null,
    actualizado_en: new Date().toISOString(),
  };

  if (filaProgreso) {
    const { data, error } = await clienteSupabase
      .from("progreso")
      .update(payload)
      .eq("id", filaProgreso.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await clienteSupabase
    .from("progreso")
    .insert({
      alumno_id: alumno.auth_user_id,
      tipo: item.tipoEntregable,
      item_id: item.id,
      trimestre: Number(trimestre),
      ...payload,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Elimina por completo la fila de progreso de una marca manual: el
// estado vuelve a calcularse como pendiente/atrasada normal (ya no hay
// fila que consultar).
async function eliminarEntregaManual(filaProgreso) {
  const { error } = await clienteSupabase.from("progreso").delete().eq("id", filaProgreso.id);
  if (error) throw error;
}

// Contexto del panel de marcar/editar entrega manual actualmente abierto
// (alumno/item/trimestre/filaProgreso + los callbacks alGuardar/
// alDeshacer que sabe repintar la celda o ítem exacto que lo abrió, sea
// en la tabla matriz o en el modal de historial — ver
// pintarBadgeCalificacion). Se reemplaza cada vez que se abre el panel.
let contextoEdicionEntrega = null;

// Abre #modal-editar-entrega en modo "Marcar" (sin filaProgreso previa) o
// "Editar" (con una fila de origen "manual-docente" ya existente),
// precargando fecha/nota según el modo.
function abrirModalEditarEntrega({ alumno, item, trimestre, filaProgreso, alGuardar, alDeshacer }) {
  const modal = document.getElementById("modal-editar-entrega");
  if (!modal) return;

  contextoEdicionEntrega = { alumno, item, trimestre, filaProgreso, alGuardar, alDeshacer };

  const modoEditar = !!filaProgreso;
  document.getElementById("modal-editar-entrega-titulo").textContent = modoEditar
    ? "Editar marca manual"
    : "Marcar entrega";
  document.getElementById("modal-editar-entrega-contexto").textContent = alumno.nombre + " — " + item.titulo;

  const campoFecha = document.getElementById("editar-entrega-fecha");
  const campoNota = document.getElementById("editar-entrega-nota");
  const botonConfirmar = document.getElementById("editar-entrega-confirmar");
  const botonDeshacer = document.getElementById("editar-entrega-deshacer");
  const error = document.getElementById("editar-entrega-error");

  campoFecha.value = filaProgreso?.fecha_entrega_manual || new Date().toISOString().slice(0, 10);
  campoNota.value = filaProgreso?.nota || "";
  botonConfirmar.textContent = modoEditar ? "Guardar cambios" : "Confirmar";
  botonDeshacer.hidden = !modoEditar;
  error.hidden = true;
  error.textContent = "";

  modal.showModal();
}

// Envía el formulario (Confirmar/Guardar cambios), el botón "Deshacer
// marca manual" (con confirmación previa porque borra el registro), y el
// cierre estándar del dialog. Un solo listener por elemento, registrado
// una vez desde inicializarModuloCalificacion() — el contexto de CADA
// apertura vive en contextoEdicionEntrega, no en el DOM.
function activarFormularioEditarEntrega() {
  const modal = document.getElementById("modal-editar-entrega");
  const formulario = document.getElementById("formulario-editar-entrega");
  if (!modal || !formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (demoModeActivo()) {
      // Cierra este dialog antes de abrir modal-demo: sin esto, los dos
      // <dialog> quedarían apilados uno encima del otro (ambos usan
      // showModal(), que no cierra el anterior solo).
      await cerrarDialogoAnimado(modal);
      abrirModalDemo();
      return;
    }
    if (!contextoEdicionEntrega) return;

    const { alumno, item, trimestre, filaProgreso, alGuardar } = contextoEdicionEntrega;
    const campoFecha = document.getElementById("editar-entrega-fecha");
    const campoNota = document.getElementById("editar-entrega-nota");
    const botonConfirmar = document.getElementById("editar-entrega-confirmar");
    const error = document.getElementById("editar-entrega-error");

    error.hidden = true;
    botonConfirmar.disabled = true;

    try {
      const nuevaFila = await guardarEntregaManual({
        alumno,
        item,
        trimestre,
        filaProgreso,
        fecha: campoFecha.value,
        nota: campoNota.value.trim(),
      });
      cerrarDialogoAnimado(modal);
      alGuardar(nuevaFila);
    } catch (err) {
      // No se cierra el dialog ni se pierde lo que el docente ya
      // escribió: el error se muestra dentro del mismo panel.
      error.textContent = "No se pudo guardar: " + (err?.message || "intenta de nuevo.");
      error.hidden = false;
    } finally {
      botonConfirmar.disabled = false;
    }
  });

  document.getElementById("editar-entrega-cancelar").addEventListener("click", () => cerrarDialogoAnimado(modal));

  document.getElementById("editar-entrega-deshacer").addEventListener("click", async () => {
    if (!contextoEdicionEntrega?.filaProgreso) return;
    if (demoModeActivo()) {
      await cerrarDialogoAnimado(modal);
      abrirModalDemo();
      return;
    }
    if (!window.confirm("¿Seguro que quieres deshacer esta marca manual? Se eliminará el registro de progreso."))
      return;

    const error = document.getElementById("editar-entrega-error");
    error.hidden = true;

    try {
      await eliminarEntregaManual(contextoEdicionEntrega.filaProgreso);
      cerrarDialogoAnimado(modal);
      contextoEdicionEntrega.alDeshacer();
    } catch (err) {
      error.textContent = "No se pudo deshacer: " + (err?.message || "intenta de nuevo.");
      error.hidden = false;
    }
  });

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) botonCerrar.addEventListener("click", () => cerrarDialogoAnimado(modal));

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });
}

// Texto plano por estado para el CSV (Paso 4): sin ícono, coincide con
// los mismos 4 estados que ya usa pintarBadgeCalificacion().
const TEXTO_ESTADO_CALIFICACION_CSV = {
  completada: "Entregado",
  pendiente: "Pendiente",
  atrasada: "Atrasada",
  "sin-cuenta": "Sin cuenta activa",
};

// Envuelve en comillas y escapa comillas internas solo si el valor trae
// coma, comilla o salto de línea — regla estándar de CSV (RFC 4180).
function escaparValorCSV(valor) {
  const texto = String(valor ?? "");
  if (/[",\n]/.test(texto)) return '"' + texto.replace(/"/g, '""') + '"';
  return texto;
}

// Genera y descarga (Blob + enlace temporal, sin librerías) un CSV de la
// vista ACTUALMENTE visible en la tabla matriz: mismo filtro de
// Trimestre/Grupo/Tipo/Secuencia ya aplicado, y respeta también las filas
// que el buscador esté ocultando en ese momento (si el docente ya filtró
// hasta un alumno puntual, exportar solo ese es lo esperable). Una
// columna por entregable con el texto plano del estado, no el ícono.
function exportarCSVCalificacion() {
  const contenedor = document.getElementById("calificacion-tabla-contenedor");
  const tabla = contenedor?.querySelector(".tabla-calificacion");
  if (!tabla) return;

  const encabezados = ["Alumno"];
  tabla.querySelectorAll("thead th").forEach((th, indice) => {
    if (indice === 0) return; // "Alumno": ya está arriba
    encabezados.push(th.title || th.textContent.trim());
  });

  const lineas = [encabezados.map(escaparValorCSV).join(",")];

  tabla.querySelectorAll("tbody tr:not([hidden])").forEach((fila) => {
    const celdas = Array.from(fila.querySelectorAll("td"));
    const nombre = celdas[0].querySelector(".calificacion-tabla__alumno-nombre")?.textContent || "";
    const numero = celdas[0].querySelector(".calificacion-tabla__alumno-numero")?.textContent || "";
    const valores = [(nombre + " " + numero).trim()];

    // celdas.slice(1): antes cortaba también la última celda (slice(1,-1))
    // aunque "encabezados" arriba SÍ incluye el <th> de esa columna
    // ("Avance") — desfase preexistente que dejaba esa columna sin datos
    // en el CSV. Se corrige de paso porque la nueva tabla "Avance por
    // Tipo" (Cambio 4) sí necesita exportar su última columna
    // ("Avance Total"). Fallback a textContent cuando la celda no trae
    // .badge-estado (las celdas de "Avance por Tipo" son texto plano,
    // no badges de estado).
    celdas.slice(1).forEach((celda) => {
      const badge = celda.querySelector(".badge-estado");
      valores.push(badge ? TEXTO_ESTADO_CALIFICACION_CSV[badge.dataset.estado] || "" : celda.textContent.trim());
    });

    lineas.push(valores.map(escaparValorCSV).join(","));
  });

  // BOM al inicio para que Excel abra el UTF-8 sin corromper acentos/°
  // ("3°C", nombres con tildes) — sin esto, Excel en Windows suele
  // interpretar el archivo con la codificación regional en vez de UTF-8.
  const blob = new Blob(["﻿" + lineas.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // slugAlumno() ya existe (sección 11) para convertir texto libre en un
  // fragmento sin acentos/espacios/mayúsculas; pese al nombre, su lógica
  // es genérica y sirve igual para simplificar el nombre de la secuencia.
  const nombreArchivo =
    "calificacion_" +
    estadoCalificacion.grupo +
    "_trimestre" +
    estadoCalificacion.trimestre +
    "_" +
    slugAlumno(estadoCalificacion.secuencia || "") +
    ".csv";

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

function activarExportarCSVCalificacion() {
  const boton = document.getElementById("calificacion-boton-csv");
  if (!boton) return;
  boton.addEventListener("click", exportarCSVCalificacion);
}

// Cuando el filtro Tipo = Todos, la tabla en pantalla mezcla tareas +
// actividades + proyectos en una sola fila por alumno (demasiadas
// columnas para caber en una hoja impresa). Esta función arma, dentro de
// #calificacion-impresion-por-tipo (nunca visible en pantalla, ver
// css/style.css), 3 tablas separadas — una por tipo — clonando las
// celdas ya renderizadas de la tabla en pantalla (mismo enfoque que ya
// usa exportarCSVCalificacion: leer del DOM ya construido, no volver a
// consultar Supabase ni reconstruir alumnos/entregables/mapaProgreso
// desde cero). Cada columna se identifica por el "data-tipo-entregable"
// que construirTablaCalificacion ya deja en cada <th>; las columnas
// "Alumno" (primera) y "Avance" (última) no llevan ese atributo y se
// tratan aparte.
function prepararImpresionTablaPorTipo() {
  const contenedorImpresion = document.getElementById("calificacion-impresion-por-tipo");
  const tablaOriginal = document.getElementById("calificacion-tabla-contenedor")?.querySelector(".tabla-calificacion");
  if (!contenedorImpresion || !tablaOriginal) return;

  contenedorImpresion.innerHTML = "";

  const columnasEncabezado = Array.from(tablaOriginal.querySelectorAll("thead th"));
  const filasAlumnos = Array.from(tablaOriginal.querySelectorAll("tbody tr:not([hidden])"));
  const celdasTotales = Array.from(tablaOriginal.querySelector("tfoot tr")?.querySelectorAll("td") || []);

  ["tarea", "actividad", "proyecto"].forEach((tipo) => {
    // Índices (dentro de la fila completa, "Alumno" incluida) de las
    // columnas de este tipo — se usan tal cual para tomar la celda
    // correspondiente de cada <tr> del tbody y del tfoot, que tienen el
    // mismo orden de columnas que el thead.
    const indices = [];
    columnasEncabezado.forEach((th, indice) => {
      if (th.dataset.tipoEntregable === tipo) indices.push(indice);
    });
    if (indices.length === 0) return; // sin columnas de este tipo en la vista actual

    const bloque = document.createElement("div");
    bloque.className = "calificacion-impresion-bloque";

    const titulo = document.createElement("h3");
    titulo.textContent = ICONO_TIPO_ENTREGABLE[tipo] + " " + ETIQUETA_TIPO_ENTREGABLE_PLURAL[tipo];
    bloque.appendChild(titulo);

    const tabla = document.createElement("table");
    tabla.className = "tabla-calificacion";

    const thead = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");
    filaEncabezado.appendChild(columnasEncabezado[0].cloneNode(true)); // "Alumno"
    indices.forEach((indice) => filaEncabezado.appendChild(columnasEncabezado[indice].cloneNode(true)));
    thead.appendChild(filaEncabezado);
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");
    filasAlumnos.forEach((filaOriginal) => {
      const celdasOriginales = filaOriginal.children;
      const filaNueva = document.createElement("tr");
      filaNueva.className = filaOriginal.className;
      filaNueva.appendChild(celdasOriginales[0].cloneNode(true)); // celda "Alumno"
      indices.forEach((indice) => filaNueva.appendChild(celdasOriginales[indice].cloneNode(true)));
      tbody.appendChild(filaNueva);
    });
    tabla.appendChild(tbody);

    // Fila de "% completado": mismos porcentajes ya calculados por
    // crearPieCalificacion(), no se recalculan aquí. Sin columna de
    // Avance (mezcla los 3 tipos, no tiene sentido dentro de un bloque
    // de un solo tipo).
    if (celdasTotales.length > 0) {
      const tfoot = document.createElement("tfoot");
      const filaPie = document.createElement("tr");
      filaPie.appendChild(celdasTotales[0].cloneNode(true));
      indices.forEach((indice) => filaPie.appendChild(celdasTotales[indice].cloneNode(true)));
      tfoot.appendChild(filaPie);
      tabla.appendChild(tfoot);
    }

    bloque.appendChild(tabla);
    contenedorImpresion.appendChild(bloque);
  });
}

// Imprime la tabla matriz general (a diferencia del historial individual,
// sin dialog intermedio: window.print() directo). Las reglas @media
// print de css/style.css (gateadas por ":not(.calificacion--imprimiendo-
// historial)", ver activarImpresionHistorialCalificacion) ya saben mostrar
// solo #calificacion-tabla-contenedor con badges en blanco y negro. Con
// Tipo = Todos, arma antes las 3 tablas separadas de
// prepararImpresionTablaPorTipo() y activa
// ".calificacion--imprimiendo-por-tipo" para que el CSS muestre esas en
// vez de la tabla en pantalla.
// El Cambio 1 volvió compacto el textContent de cada <th> de entregable
// ("T1"/"A2"/...); el título completo solo vive en el atributo title
// nativo (tooltip, no imprime). Antes de imprimir se restaura
// temporalmente el título completo como textContent — mismo patrón de
// "inyectar antes, revertir en afterprint" que ya usa el <style> de
// landscape más abajo — para no perder ese detalle en la versión
// impresa. prepararImpresionTablaPorTipo() CLONA estos mismos <th> del
// DOM en pantalla, así que restaurar aquí también cubre esa ruta sin
// tocar esa función.
function restaurarTitulosParaImpresion(contenedor) {
  contenedor.querySelectorAll(".tabla-calificacion__col-item--compacto[title]").forEach((celda) => {
    celda.dataset.textoCompacto = celda.textContent;
    celda.textContent = celda.title;
  });
}

function restaurarTitulosCompactos(contenedor) {
  contenedor.querySelectorAll(".tabla-calificacion__col-item--compacto[data-texto-compacto]").forEach((celda) => {
    celda.textContent = celda.dataset.textoCompacto;
    delete celda.dataset.textoCompacto;
  });
}

function activarImpresionTablaCalificacion() {
  const boton = document.getElementById("calificacion-boton-imprimir-tabla");
  if (!boton) return;

  boton.addEventListener("click", () => {
    const contenedorTabla = document.getElementById("calificacion-tabla-contenedor");
    if (contenedorTabla) restaurarTitulosParaImpresion(contenedorTabla);

    if (estadoCalificacion.tipo === "todos") {
      prepararImpresionTablaPorTipo();
      document.body.classList.add("calificacion--imprimiendo-por-tipo");
    }

    // "@page" no se puede acotar con selectores tipo
    // "body[data-pagina='admin']" — aplica a nivel de documento completo
    // de impresión, no de elemento. Si viviera fijo en style.css (que es
    // compartido por todo el sitio), forzaría orientación horizontal al
    // imprimir CUALQUIER página (index.html, trimestre-*.html, etc.), no
    // solo esta tabla. Por eso se inyecta como <style> temporal, solo
    // mientras dura esta impresión, y se quita en "afterprint" más abajo.
    const estiloLandscape = document.createElement("style");
    estiloLandscape.id = "estilo-impresion-landscape-calificacion";
    estiloLandscape.textContent = "@media print { @page { size: landscape; } }";
    document.head.appendChild(estiloLandscape);

    window.print();
  });

  window.addEventListener("afterprint", () => {
    document.body.classList.remove("calificacion--imprimiendo-por-tipo");
    document.getElementById("estilo-impresion-landscape-calificacion")?.remove();
    const contenedorTabla = document.getElementById("calificacion-tabla-contenedor");
    if (contenedorTabla) restaurarTitulosCompactos(contenedorTabla);
  });
}

// Filtra entregables YA de un solo trimestre/tipo (según lo que haya
// pedido el llamador a obtenerEntregablesPorTipo) por la secuencia y el
// grupo actualmente elegidos en el panel — extraído de
// renderizarTablaCalificacion (antes vivía inline ahí) para que
// renderizarTablaAvancePorTipo() y actualizarConteosTabsTipo() lo
// reutilicen sin repetir esta misma cadena de dos filtros. Mismo
// criterio que elementoCoincideConGrupo() (sección 4), pero sin
// reutilizar esa función tal cual: en el resto del archivo se le pasa
// directo a Array.filter (`.filter(elementoCoincideConGrupo)`), así que
// agregarle un segundo parámetro capturaría silenciosamente el índice
// del array que Array.filter también le pasa a su callback, no
// "undefined" — eso rompería el filtro por grupo en avisos/horario/
// tareas/etc. de todo el sitio público para cualquier ítem que no sea
// el primero del array.
function entregablesFiltradosPorSecuenciaYGrupo(entregablesTodos) {
  return entregablesTodos
    .filter((item) => claveSecuenciaDeEntregable(item) === estadoCalificacion.secuencia)
    .filter(
      (item) =>
        estadoCalificacion.grupo === "todos" ||
        item.grupo === "todos" ||
        item.grupo === estadoCalificacion.grupo
    );
}

async function renderizarTablaCalificacion() {
  const contenedor = document.getElementById("calificacion-tabla-contenedor");
  if (!contenedor) return;

  if (!estadoCalificacion.secuencia) {
    mostrarSinResultados(contenedor, "No hay entregables para este trimestre y tipo.");
    actualizarEstadoNavegacionTablaCalificacion();
    return;
  }

  mostrarSinResultados(contenedor, "Cargando…");

  const tipos =
    estadoCalificacion.tipo === "todos" ? ["tarea", "actividad", "proyecto"] : [estadoCalificacion.tipo];

  const [alumnos, entregablesTodos] = await Promise.all([
    obtenerAlumnosParaCalificacion(estadoCalificacion.grupo),
    obtenerEntregablesPorTipo(estadoCalificacion.tipo, estadoCalificacion.trimestre),
  ]);

  const entregables = entregablesFiltradosPorSecuenciaYGrupo(entregablesTodos);

  if (alumnos.length === 0) {
    mostrarSinResultados(contenedor, "No hay alumnos registrados para este grupo.");
    actualizarEstadoNavegacionTablaCalificacion();
    return;
  }
  if (entregables.length === 0) {
    mostrarSinResultados(contenedor, "No hay entregables para esta secuencia.");
    actualizarEstadoNavegacionTablaCalificacion();
    return;
  }

  const idsParaProgreso = alumnos.filter((alumno) => alumno.auth_user_id != null).map((alumno) => alumno.auth_user_id);
  const mapaProgreso = await obtenerMapaProgresoCalificacion(estadoCalificacion.trimestre, tipos, idsParaProgreso);
  await calcularYGuardarATiempo(mapaProgreso, estadoCalificacion.trimestre);

  contenedor.innerHTML = "";
  contenedor.appendChild(construirTablaCalificacion(alumnos, entregables, mapaProgreso, estadoCalificacion.trimestre));

  // Los filtros cambian cuántas columnas hay (o si hace falta scroll),
  // así que hay que recalcular el estado de los botones ◀▶ y del
  // gradiente después de CADA render, no solo una vez al inicio.
  actualizarEstadoNavegacionTablaCalificacion();

  // El término de búsqueda no se limpia al cambiar de filtro (Trimestre/
  // Grupo/Tipo/Secuencia genera una tabla nueva), así que hay que
  // reaplicarlo sobre las filas recién creadas para que siga vigente.
  filtrarFilasTablaCalificacion();
}

/* ---------- Cambio 5: Vista Tarjetas (accordion por alumno) ----------
   Alternativa a la tabla matriz, sin scroll horizontal: un <details>
   nativo por alumno con la lista de sus entregables (respeta el mismo
   filtro de Tipo/Secuencia activo). Reutiliza pintarBadgeCalificacion()
   sin "compacto" (mismo formato verboso que ya usa el modal de
   historial: hay espacio de sobra en una lista vertical) y
   calcularPorcentajeEntrega() para el resumen del <summary>. --------- */
function crearFichaAlumnoCalificacion(alumno, entregables, mapaProgreso, trimestre) {
  const sinCuenta = alumno.usado === false || !alumno.auth_user_id;

  const detalles = document.createElement("details");
  detalles.className = "calificacion-ficha";
  if (alumno.activo === false) detalles.classList.add("fila-alumno--inactivo");
  // Mismo dataset que crearFilaAlumnoCalificacion (ver
  // filtrarFilasTablaCalificacion, generalizada para leerlo de
  // cualquiera de las dos vistas).
  detalles.dataset.nombreBusqueda = normalizarParaBusqueda(alumno.nombre);
  detalles.dataset.numeroLista = String(alumno.numero_lista);

  mapaAlumnosCalificacionPorId.set(String(alumno.id), alumno);

  const { completados, porcentaje } = calcularPorcentajeEntrega(entregables, alumno, mapaProgreso, sinCuenta);

  const resumen = document.createElement("summary");
  resumen.className = "calificacion-ficha__resumen";

  const textoResumen = document.createElement("span");
  textoResumen.className = "calificacion-ficha__resumen-texto";
  textoResumen.textContent =
    alumno.nombre +
    " — " +
    (sinCuenta
      ? "Sin cuenta activa"
      : porcentaje + "% — " + completados + "/" + entregables.length + " entregas");
  resumen.appendChild(textoResumen);

  const botonHistorial = document.createElement("button");
  botonHistorial.type = "button";
  botonHistorial.className = "calificacion-tabla__boton-historial";
  botonHistorial.dataset.alumnoId = alumno.id;
  botonHistorial.textContent = "👁️ Ver historial completo";
  // Sin esto, el clic en el botón también dispara la activación por
  // defecto de <summary> (abrir/cerrar el accordion) porque el botón
  // vive dentro de él.
  botonHistorial.addEventListener("click", (evento) => evento.preventDefault());
  resumen.appendChild(botonHistorial);

  detalles.appendChild(resumen);

  const lista = document.createElement("ul");
  lista.className = "calificacion-ficha__lista";

  entregables.forEach((item) => {
    const li = document.createElement("li");
    li.className = "calificacion-ficha__item";

    const tituloItem = document.createElement("span");
    tituloItem.className = "calificacion-ficha__item-titulo";
    tituloItem.textContent = ICONO_TIPO_ENTREGABLE[item.tipoEntregable] + " " + item.titulo;
    li.appendChild(tituloItem);

    const filaProgreso = sinCuenta
      ? null
      : mapaProgreso.get(alumno.auth_user_id + "-" + item.tipoEntregable + "-" + item.id);
    const contenedorBadge = document.createElement("span");
    // Mismo "position: relative" que .calificacion-historial__badge-
    // contenedor: sin esto, el ícono superpuesto de 🖊️/⏰ (position:
    // absolute con top/right) no tiene contra qué anclarse y termina
    // flotando en la esquina de la ventana en vez de junto al badge.
    contenedorBadge.className = "calificacion-ficha__badge-contenedor";
    const claveMapaProgreso = alumno.auth_user_id + "-" + item.tipoEntregable + "-" + item.id;
    pintarBadgeCalificacion(contenedorBadge, {
      alumno,
      item,
      trimestre,
      filaProgreso,
      sinCuenta,
      mapaProgreso,
      claveMapaProgreso,
    });
    li.appendChild(contenedorBadge);

    lista.appendChild(li);
  });

  detalles.appendChild(lista);
  return detalles;
}

async function renderizarTarjetasCalificacion() {
  const contenedor = document.getElementById("calificacion-tabla-contenedor");
  if (!contenedor) return;

  if (!estadoCalificacion.secuencia) {
    mostrarSinResultados(contenedor, "No hay entregables para este trimestre y tipo.");
    return;
  }

  mostrarSinResultados(contenedor, "Cargando…");

  const tipos =
    estadoCalificacion.tipo === "todos" ? ["tarea", "actividad", "proyecto"] : [estadoCalificacion.tipo];

  const [alumnos, entregablesTodos] = await Promise.all([
    obtenerAlumnosParaCalificacion(estadoCalificacion.grupo),
    obtenerEntregablesPorTipo(estadoCalificacion.tipo, estadoCalificacion.trimestre),
  ]);

  const entregables = entregablesFiltradosPorSecuenciaYGrupo(entregablesTodos);

  if (alumnos.length === 0) {
    mostrarSinResultados(contenedor, "No hay alumnos registrados para este grupo.");
    return;
  }
  if (entregables.length === 0) {
    mostrarSinResultados(contenedor, "No hay entregables para esta secuencia.");
    return;
  }

  const idsParaProgreso = alumnos.filter((alumno) => alumno.auth_user_id != null).map((alumno) => alumno.auth_user_id);
  const mapaProgreso = await obtenerMapaProgresoCalificacion(estadoCalificacion.trimestre, tipos, idsParaProgreso);
  await calcularYGuardarATiempo(mapaProgreso, estadoCalificacion.trimestre);

  contenedor.innerHTML = "";
  const lista = document.createElement("div");
  lista.className = "calificacion-fichas";
  alumnos.forEach((alumno) => {
    lista.appendChild(crearFichaAlumnoCalificacion(alumno, entregables, mapaProgreso, estadoCalificacion.trimestre));
  });
  contenedor.appendChild(lista);

  filtrarFilasTablaCalificacion();
}

/* ---------- Cambio 4: panel "📊 Avance por Tipo" ----------
   Tabla resumen (no columnas por entregable): % de entrega por tipo +
   Avance Total, para la secuencia/grupo/trimestre ya filtrados. Usa
   SIEMPRE obtenerEntregablesPorTipo("todos", ...) sin importar qué tab
   de Tipo estaba activa antes (necesita los 3 tipos a la vez para
   calcular sus 3 porcentajes) — misma función que ya usa la vista
   "Tipo: Todos" de la tabla matriz, ninguna consulta nueva. ---------- */
function crearFilaAlumnoAvanceTipo(alumno, itemsPorTipo, mapaProgreso) {
  const fila = document.createElement("tr");
  if (alumno.activo === false) fila.classList.add("fila-alumno--inactivo");
  fila.dataset.nombreBusqueda = normalizarParaBusqueda(alumno.nombre);
  fila.dataset.numeroLista = String(alumno.numero_lista);

  mapaAlumnosCalificacionPorId.set(String(alumno.id), alumno);

  const celdaAlumno = document.createElement("td");
  celdaAlumno.className = "tabla-calificacion__col-fija";
  const envoltura = document.createElement("div");
  envoltura.className = "calificacion-tabla__alumno";
  const nombre = document.createElement("span");
  nombre.className = "calificacion-tabla__alumno-nombre";
  nombre.textContent = alumno.nombre;
  const numero = document.createElement("span");
  numero.className = "calificacion-tabla__alumno-numero";
  numero.textContent = "N.° " + alumno.numero_lista;
  const botonHistorial = document.createElement("button");
  botonHistorial.type = "button";
  botonHistorial.className = "calificacion-tabla__boton-historial";
  botonHistorial.dataset.alumnoId = alumno.id;
  botonHistorial.textContent = "👁️ Ver historial completo";
  envoltura.append(nombre, numero, botonHistorial);
  celdaAlumno.appendChild(envoltura);
  fila.appendChild(celdaAlumno);

  const sinCuenta = alumno.usado === false || !alumno.auth_user_id;

  ["tarea", "actividad", "proyecto"].forEach((tipo) => {
    const { porcentaje } = calcularPorcentajeEntrega(itemsPorTipo[tipo] || [], alumno, mapaProgreso, sinCuenta);
    const celda = document.createElement("td");
    celda.textContent = porcentaje == null ? "—" : porcentaje + "%";
    fila.appendChild(celda);
  });

  const todosLosItems = [...itemsPorTipo.tarea, ...itemsPorTipo.actividad, ...itemsPorTipo.proyecto];
  const { porcentaje: avanceTotal } = calcularPorcentajeEntrega(todosLosItems, alumno, mapaProgreso, sinCuenta);
  const celdaTotal = document.createElement("td");
  celdaTotal.className = "calificacion-tabla__avance";
  celdaTotal.textContent = avanceTotal == null ? "—" : avanceTotal + "%";
  fila.appendChild(celdaTotal);

  return fila;
}

function construirTablaAvanceTipo(alumnos, itemsPorTipo, mapaProgreso) {
  const tabla = document.createElement("table");
  // "tabla-avance-tipo" trae el acento navy propio (Cambio 4: distinto
  // del turquesa de "Ver tabla de promedios" en Evaluación — son datos
  // distintos, % de entrega vs. calificación numérica; ver css/style.css).
  tabla.className = "tabla-calificacion tabla-avance-tipo";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");

  const thAlumno = document.createElement("th");
  thAlumno.className = "tabla-calificacion__col-fija";
  thAlumno.textContent = "Alumno";
  filaEncabezado.appendChild(thAlumno);

  ["📝 % Tareas", "🎯 % Actividades", "🚀 % Proyecto"].forEach((etiqueta) => {
    const th = document.createElement("th");
    th.textContent = etiqueta;
    filaEncabezado.appendChild(th);
  });

  const thTotal = document.createElement("th");
  thTotal.textContent = "Avance Total";
  filaEncabezado.appendChild(thTotal);

  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  alumnos.forEach((alumno) => tbody.appendChild(crearFilaAlumnoAvanceTipo(alumno, itemsPorTipo, mapaProgreso)));
  tabla.appendChild(tbody);

  return tabla;
}

async function renderizarTablaAvancePorTipo() {
  const contenedor = document.getElementById("calificacion-tabla-contenedor");
  if (!contenedor) return;

  if (!estadoCalificacion.secuencia) {
    mostrarSinResultados(contenedor, "No hay entregables para este trimestre.");
    return;
  }

  mostrarSinResultados(contenedor, "Cargando…");

  const [alumnos, entregablesTodos] = await Promise.all([
    obtenerAlumnosParaCalificacion(estadoCalificacion.grupo),
    obtenerEntregablesPorTipo("todos", estadoCalificacion.trimestre),
  ]);

  const entregables = entregablesFiltradosPorSecuenciaYGrupo(entregablesTodos);

  if (alumnos.length === 0) {
    mostrarSinResultados(contenedor, "No hay alumnos registrados para este grupo.");
    return;
  }
  if (entregables.length === 0) {
    mostrarSinResultados(contenedor, "No hay entregables para esta secuencia.");
    return;
  }

  const itemsPorTipo = { tarea: [], actividad: [], proyecto: [] };
  entregables.forEach((item) => itemsPorTipo[item.tipoEntregable]?.push(item));

  const idsParaProgreso = alumnos.filter((alumno) => alumno.auth_user_id != null).map((alumno) => alumno.auth_user_id);
  const mapaProgreso = await obtenerMapaProgresoCalificacion(
    estadoCalificacion.trimestre,
    ["tarea", "actividad", "proyecto"],
    idsParaProgreso
  );

  contenedor.innerHTML = "";
  contenedor.appendChild(construirTablaAvanceTipo(alumnos, itemsPorTipo, mapaProgreso));

  filtrarFilasTablaCalificacion();
}

// Punto único de render del panel: decide entre la tabla matriz, la
// Vista Tarjetas o el resumen "Avance por Tipo" según el estado actual
// — todos los listeners de filtro (trimestre/grupo/secuencia/tipo/vista)
// llaman a ESTA función en vez de llamar directo a cualquiera de las
// tres, para no tener que repetir el mismo if/else en cada uno.
async function renderizarPanelCalificacion() {
  if (estadoCalificacion.tipo === "avance-por-tipo") {
    await renderizarTablaAvancePorTipo();
  } else if (estadoCalificacion.vista === "tarjetas") {
    await renderizarTarjetasCalificacion();
  } else {
    await renderizarTablaCalificacion();
  }
  actualizarVisibilidadControlesCalificacion();
}

// Conteo dinámico "(N)" de cada tab de Tipo (Cambio 3): depende de la
// secuencia/grupo/trimestre ya elegidos (NO de qué tab está activa —
// las 3 cuentas se muestran siempre, sin importar cuál se está viendo),
// así que se recalcula junto con cada cambio de esos 3 filtros, nunca
// al hacer clic en una tab.
async function actualizarConteosTabsTipo() {
  const contadorTarea = document.getElementById("calificacion-tab-contador-tarea");
  if (!contadorTarea || !estadoCalificacion.secuencia) return;

  const entregablesTodos = await obtenerEntregablesPorTipo("todos", estadoCalificacion.trimestre);
  const entregables = entregablesFiltradosPorSecuenciaYGrupo(entregablesTodos);

  const conteos = { tarea: 0, actividad: 0, proyecto: 0 };
  entregables.forEach((item) => conteos[item.tipoEntregable]++);

  contadorTarea.textContent = "(" + conteos.tarea + ")";
  document.getElementById("calificacion-tab-contador-actividad").textContent = "(" + conteos.actividad + ")";
  document.getElementById("calificacion-tab-contador-proyecto").textContent = "(" + conteos.proyecto + ")";
}

// Cambio 3: reemplaza el <select> de Tipo. Mismo patrón de toggle que
// activarTabsAdmin() (clase activa + aria-selected), pero a nivel de
// sub-filtro de este panel — clic en una tab NO recalcula qué
// secuencias existen (actualizarOpcionesSecuenciaCalificacion() sigue
// sin tocarse, ver más abajo), solo cambia qué columnas/vista se
// muestran de la secuencia ya elegida.
function activarTabsTipoCalificacion() {
  const tabs = Array.from(document.querySelectorAll(".calificacion-tabs-tipo__boton"));
  if (tabs.length === 0) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", async () => {
      tabs.forEach((otro) => {
        const activo = otro === tab;
        otro.classList.toggle("calificacion-tabs-tipo__boton--activo", activo);
        otro.setAttribute("aria-selected", String(activo));
      });
      estadoCalificacion.tipo = tab.dataset.tipo;
      await renderizarPanelCalificacion();
    });
  });
}

// Cambio 5: toggle Vista Tabla/Tarjetas, con la preferencia recordada en
// localStorage (mismo patrón que CLAVE_GRUPO/CLAVE_ULTIMO_TRIMESTRE en
// la sección 3: leer al cargar, escribir en cada cambio).
function activarVistaCalificacion() {
  const botonTabla = document.getElementById("calificacion-vista-boton-tabla");
  const botonTarjetas = document.getElementById("calificacion-vista-boton-tarjetas");
  if (!botonTabla || !botonTarjetas) return;

  async function elegirVista(vista) {
    estadoCalificacion.vista = vista;
    localStorage.setItem(CLAVE_VISTA_CALIFICACION, vista);
    botonTabla.setAttribute("aria-pressed", String(vista === "tabla"));
    botonTarjetas.setAttribute("aria-pressed", String(vista === "tarjetas"));
    await renderizarPanelCalificacion();
  }

  botonTabla.addEventListener("click", () => elegirVista("tabla"));
  botonTarjetas.addEventListener("click", () => elegirVista("tarjetas"));

  botonTabla.setAttribute("aria-pressed", String(estadoCalificacion.vista === "tabla"));
  botonTarjetas.setAttribute("aria-pressed", String(estadoCalificacion.vista === "tarjetas"));
}

// Oculta/muestra, según el estado actual, lo que solo tiene sentido en
// Vista Tabla: el toggle de vista y el botón "Avance por Tipo" no
// coexisten (esa tab siempre usa su propia tabla resumen, no hay
// "tarjetas" para ella); exportar/imprimir y la navegación móvil ◀▶
// necesitan un <table> real, que Vista Tarjetas no tiene.
function actualizarVisibilidadControlesCalificacion() {
  const toggleVista = document.getElementById("calificacion-vista-toggle");
  const accionesExportar = document.getElementById("calificacion-acciones-exportar");
  const navMovil = document.getElementById("calificacion-nav-movil");

  const enAvancePorTipo = estadoCalificacion.tipo === "avance-por-tipo";
  const enTarjetas = estadoCalificacion.vista === "tarjetas" && !enAvancePorTipo;

  if (toggleVista) toggleVista.hidden = enAvancePorTipo;
  if (accionesExportar) accionesExportar.hidden = enTarjetas;
  if (navMovil) navMovil.hidden = enTarjetas;
}

// Ancho real de la primera columna de entregable (la de "Alumno" es fija
// y no cuenta), para que el scroll de los botones ◀▶ avance exactamente
// una columna sin importar cuántas haya ni su ancho real. 140 es el
// mismo valor de respaldo que min-width en CSS, por si todavía no hay
// tabla renderizada (mensaje de "Cargando…"/"Sin resultados").
function anchoPrimeraColumnaDatosCalificacion() {
  const contenedor = document.getElementById("calificacion-tabla-contenedor");
  const primeraColumnaDatos = contenedor?.querySelector("thead th:nth-child(2)");
  return primeraColumnaDatos ? primeraColumnaDatos.offsetWidth : 140;
}

// Refresca, en cada evento de scroll del contenedor y después de cada
// renderizado nuevo de la tabla (los filtros cambian el ancho/alto
// scrolleable): el estado deshabilitado de los botones ◀▶, la clase que
// oculta el gradiente de "hay más contenido" al llegar al final, y la
// variable CSS --alto-contenedor-calificacion que usa ese gradiente (ver
// css/style.css: "height: 100%" no se resuelve cuando la tabla es más
// baja que max-height, caso común con pocos alumnos y muchas columnas).
function actualizarEstadoNavegacionTablaCalificacion() {
  const contenedor = document.getElementById("calificacion-tabla-contenedor");
  if (!contenedor) return;

  const botonIzq = document.getElementById("calificacion-scroll-izq");
  const botonDer = document.getElementById("calificacion-scroll-der");

  const alInicio = contenedor.scrollLeft <= 0;
  const alFinal = contenedor.scrollLeft + contenedor.clientWidth >= contenedor.scrollWidth - 1;

  if (botonIzq) botonIzq.disabled = alInicio;
  if (botonDer) botonDer.disabled = alFinal;
  contenedor.classList.toggle("calificacion-tabla-contenedor--fin-alcanzado", alFinal);
  contenedor.style.setProperty("--alto-contenedor-calificacion", contenedor.clientHeight + "px");
}

// Botones ◀▶ de scroll horizontal, solo visibles en mobile por CSS
// (mismo breakpoint <1024px que .barra-lateral/.barra-inferior — ver
// css/style.css). Siguen existiendo en el DOM en desktop, solo ocultos,
// así que no hace falta ningún chequeo de "es mobile" aquí en JS.
function activarNavegacionMovilTablaCalificacion() {
  const contenedor = document.getElementById("calificacion-tabla-contenedor");
  const botonIzq = document.getElementById("calificacion-scroll-izq");
  const botonDer = document.getElementById("calificacion-scroll-der");
  if (!contenedor || !botonIzq || !botonDer) return;

  botonIzq.addEventListener("click", () => {
    const prefiereMovimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    contenedor.scrollBy({
      left: -anchoPrimeraColumnaDatosCalificacion(),
      behavior: prefiereMovimientoReducido ? "auto" : "smooth",
    });
  });
  botonDer.addEventListener("click", () => {
    const prefiereMovimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    contenedor.scrollBy({
      left: anchoPrimeraColumnaDatosCalificacion(),
      behavior: prefiereMovimientoReducido ? "auto" : "smooth",
    });
  });

  contenedor.addEventListener("scroll", actualizarEstadoNavegacionTablaCalificacion);
  window.addEventListener("resize", actualizarEstadoNavegacionTablaCalificacion);
}

async function inicializarModuloCalificacion() {
  const selectTrimestre = document.getElementById("calificacion-filtro-trimestre");
  if (!selectTrimestre) return; // no es admin.html

  // Espera la confirmación del guard (sesión + es_docente) antes de tocar
  // alumnos_registro/progreso: ambas tablas están protegidas por RLS para
  // el rol docente, y no tiene sentido consultarlas mientras el guard
  // todavía podría redirigir a otra página.
  await promesaGuardPanelDocente;

  estadoCalificacion.trimestre = String(trimestreDesbloqueado);
  selectTrimestre.value = estadoCalificacion.trimestre;

  await actualizarOpcionesSecuenciaCalificacion();
  await actualizarConteosTabsTipo();
  await renderizarPanelCalificacion();
  activarNavegacionMovilTablaCalificacion();
  activarBuscadorCalificacion();
  activarDelegacionHistorialCalificacion();
  activarCierreModalHistorialCalificacion();
  activarImpresionHistorialCalificacion();
  activarFormularioEditarEntrega();
  activarExportarCSVCalificacion();
  activarImpresionTablaCalificacion();
  activarTabsTipoCalificacion();
  activarVistaCalificacion();

  selectTrimestre.addEventListener("change", async () => {
    estadoCalificacion.trimestre = selectTrimestre.value;
    await actualizarOpcionesSecuenciaCalificacion();
    await actualizarConteosTabsTipo();
    await renderizarPanelCalificacion();
  });

  const selectGrupo = document.getElementById("calificacion-filtro-grupo");
  selectGrupo.addEventListener("change", async () => {
    estadoCalificacion.grupo = selectGrupo.value;
    await actualizarConteosTabsTipo();
    await renderizarPanelCalificacion();
  });

  // El <select> de Tipo se reemplazó por las tabs (Cambio 3, ver
  // activarTabsTipoCalificacion) — ya no hay listener de "change" aquí.

  const selectSecuencia = document.getElementById("calificacion-filtro-secuencia");
  selectSecuencia.addEventListener("change", async () => {
    estadoCalificacion.secuencia = selectSecuencia.value;
    await actualizarConteosTabsTipo();
    await renderizarPanelCalificacion();
  });
}

/* ---------------------------------------------------------
   Módulo "Alumnos" (tab-alumnos)

   Listado simple de alumnos_registro con filtro de Grupo, buscador en
   vivo y dar de baja/reactivar. Reutiliza deliberadamente varias piezas
   ya construidas en el módulo de Calificación y progreso en vez de
   duplicarlas: obtenerAlumnosParaCalificacion() (consulta genérica, no
   tiene nada específico de calificación pese al nombre),
   normalizarParaBusqueda(), textoGrupo(), y sobre todo
   abrirModalHistorialAlumno() para "Ver historial completo" — se
   invoca tal cual, sin adaptar nada (ver el resumen al final del
   prompt que agregó este módulo).
   --------------------------------------------------------- */

const estadoAlumnos = { grupo: "todos" };

// Sin 0/O ni 1/I/L (fácil de transcribir a mano/distinguir en voz alta) —
// mismo criterio que ya siguen los códigos existentes del roster
// original (confirmado en vivo: ninguno de los códigos ya guardados usa
// esos caracteres, aunque se hayan generado por fuera de este repo).
const ALFABETO_CODIGO_INVITACION = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// Mismo formato ya usado en alumnos_registro.codigo_invitacion: 3 grupos
// de 4 caracteres separados por guion (ej. "X7K2-9PQR-4LMN"). Puramente
// aleatorio, sin verificar unicidad — eso lo hace
// generarCodigoInvitacionUnico(), que es quien realmente se usa al dar
// de alta/regenerar.
function generarCodigoInvitacion() {
  const grupoDeCuatro = () =>
    Array.from({ length: 4 }, () => {
      const indice = Math.floor(Math.random() * ALFABETO_CODIGO_INVITACION.length);
      return ALFABETO_CODIGO_INVITACION[indice];
    }).join("");
  return grupoDeCuatro() + "-" + grupoDeCuatro() + "-" + grupoDeCuatro();
}

// Genera códigos hasta encontrar uno que no exista ya en
// alumnos_registro (colisión prácticamente imposible con este alfabeto:
// 31^12 combinaciones, muy por encima del tamaño real del roster, pero
// se verifica de todos modos por seguridad). Máximo 5 intentos, tal como
// se pidió; si ninguno resulta único, lanza un error legible en vez de
// insertar/actualizar con un código repetido.
async function generarCodigoInvitacionUnico() {
  for (let intento = 0; intento < 5; intento++) {
    const candidato = generarCodigoInvitacion();
    const { data, error } = await clienteSupabase
      .from("alumnos_registro")
      .select("id")
      .eq("codigo_invitacion", candidato)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidato;
  }
  throw new Error("No se pudo generar un código de invitación único después de varios intentos.");
}

// Determina el badge de estado de CUENTA de un alumno (eje distinto al
// de progreso: ver "data-estado-cuenta" en css/style.css), en el orden
// de prioridad pedido: dado de baja siempre gana, sin importar
// usado/auth_user_id.
function estadoCuentaAlumno(alumno) {
  if (alumno.activo === false) return { estado: "baja", texto: "⚪ Dado de baja" };
  if (alumno.usado === false) return { estado: "sin-usar", texto: "🔵 Código sin usar" };
  if (!alumno.auth_user_id) return { estado: "incompleto", texto: "🟡 Registro incompleto" };
  return { estado: "activa", texto: "🟢 Cuenta activa" };
}

// UPDATE activo=false/true en alumnos_registro. Sin mapaProgreso que
// mantener aquí (a diferencia de guardarEntregaManual/eliminarEntregaManual
// en Calificación): esta tabla no tiene ningún caché en memoria más allá
// del objeto "alumno" que ya trae cada fila, así que basta con mutarlo y
// repintar esa fila.
async function actualizarActivoAlumno(alumno, activo) {
  const { error } = await clienteSupabase.from("alumnos_registro").update({ activo }).eq("id", alumno.id);
  if (error) throw error;
  alumno.activo = activo;
}

async function darDeBajaAlumno(alumno, fila) {
  if (demoModeActivo()) {
    abrirModalDemo();
    return;
  }
  if (!window.confirm("¿Seguro que quieres dar de baja a " + alumno.nombre + "?")) return;

  try {
    await actualizarActivoAlumno(alumno, false);
  } catch (error) {
    window.alert("No se pudo dar de baja al alumno: " + (error?.message || "intenta de nuevo."));
    return;
  }

  fila.replaceWith(crearFilaAlumno(alumno));
  filtrarFilasTablaAlumnos();
}

// Reactivar es una acción segura, reversible con "Dar de baja" de
// nuevo, así que no pide confirmación adicional (a diferencia de dar de
// baja o de "Deshacer marca manual" en Calificación, que sí eliminan/
// desactivan algo de forma menos evidente a simple vista).
async function reactivarAlumno(alumno, fila) {
  if (demoModeActivo()) {
    abrirModalDemo();
    return;
  }
  try {
    await actualizarActivoAlumno(alumno, true);
  } catch (error) {
    window.alert("No se pudo reactivar al alumno: " + (error?.message || "intenta de nuevo."));
    return;
  }

  fila.replaceWith(crearFilaAlumno(alumno));
  filtrarFilasTablaAlumnos();
}

// Muestra #modal-codigo-invitacion con el código recién generado —
// compartido por el alta de alumno nuevo y por "🔄 Regenerar código",
// para no construir dos veces la misma confirmación con botón de copiar.
function mostrarModalCodigoInvitacion(alumno, codigo) {
  const modal = document.getElementById("modal-codigo-invitacion");
  if (!modal) return;

  document.getElementById("modal-codigo-invitacion-contexto").textContent = alumno.nombre;
  document.getElementById("modal-codigo-invitacion-valor").textContent = codigo;
  modal.showModal();
}

function activarCierreModalCodigoInvitacion() {
  const modal = document.getElementById("modal-codigo-invitacion");
  if (!modal) return;

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) botonCerrar.addEventListener("click", () => cerrarDialogoAnimado(modal));

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });
}

// navigator.clipboard.writeText requiere contexto seguro (https o
// localhost); si por lo que sea falla (navegador viejo, permiso
// denegado), se cae en un alert con el código tal cual, para que Hiram
// pueda copiarlo a mano igual.
function activarCopiarCodigoInvitacion() {
  const boton = document.getElementById("boton-copiar-codigo");
  if (!boton) return;

  boton.addEventListener("click", async () => {
    const codigo = document.getElementById("modal-codigo-invitacion-valor").textContent;
    const textoOriginal = boton.textContent;
    try {
      await navigator.clipboard.writeText(codigo);
      boton.textContent = "✅ Copiado";
      setTimeout(() => {
        boton.textContent = textoOriginal;
      }, 1500);
    } catch {
      window.alert("No se pudo copiar automáticamente. Código: " + codigo);
    }
  });
}

// Genera un código nuevo y único, y lo guarda en esta fila — el código
// anterior queda inservible de inmediato (deja de existir en la BD), por
// eso pide confirmación antes. Solo tiene sentido mientras usado===false
// (ver el botón condicional en crearFilaAlumno).
async function regenerarCodigoAlumno(alumno, fila) {
  if (demoModeActivo()) {
    abrirModalDemo();
    return;
  }
  if (
    !window.confirm(
      "¿Seguro que quieres regenerar el código de invitación de " +
        alumno.nombre +
        "? El código anterior dejará de servir."
    )
  )
    return;

  let nuevoCodigo;
  try {
    nuevoCodigo = await generarCodigoInvitacionUnico();
    const { error } = await clienteSupabase
      .from("alumnos_registro")
      .update({ codigo_invitacion: nuevoCodigo })
      .eq("id", alumno.id);
    if (error) throw error;
  } catch (error) {
    window.alert("No se pudo regenerar el código: " + (error?.message || "intenta de nuevo."));
    return;
  }

  alumno.codigo_invitacion = nuevoCodigo;
  fila.replaceWith(crearFilaAlumno(alumno));
  filtrarFilasTablaAlumnos();
  mostrarModalCodigoInvitacion(alumno, nuevoCodigo);
}

function crearFilaAlumno(alumno) {
  const fila = document.createElement("tr");
  if (alumno.activo === false) fila.classList.add("fila-alumno--inactivo");

  // Mismos data-attributes y misma normalización que
  // crearFilaAlumnoCalificacion(), para reutilizar filtrarFilasTablaAlumnos
  // con idéntica lógica a filtrarFilasTablaCalificacion.
  fila.dataset.nombreBusqueda = normalizarParaBusqueda(alumno.nombre);
  fila.dataset.numeroLista = String(alumno.numero_lista);

  const celdaNombre = document.createElement("td");
  const nombre = document.createElement("span");
  // Misma clase que en Calificación: hereda gratis el
  // "text-decoration: line-through" de .fila-alumno--inactivo, ya
  // definido ahí (ver css/style.css).
  nombre.className = "calificacion-tabla__alumno-nombre";
  nombre.textContent = alumno.nombre;
  celdaNombre.appendChild(nombre);
  fila.appendChild(celdaNombre);

  const celdaNumero = document.createElement("td");
  celdaNumero.textContent = String(alumno.numero_lista);
  fila.appendChild(celdaNumero);

  const celdaEstado = document.createElement("td");
  const { estado, texto } = estadoCuentaAlumno(alumno);
  const badge = document.createElement("span");
  badge.className = "badge-estado";
  badge.dataset.estadoCuenta = estado;
  badge.textContent = texto;
  celdaEstado.appendChild(badge);
  fila.appendChild(celdaEstado);

  const celdaAcciones = document.createElement("td");
  celdaAcciones.className = "alumnos-tabla__acciones";

  const botonHistorial = document.createElement("button");
  botonHistorial.type = "button";
  botonHistorial.className = "boton-secundario";
  botonHistorial.textContent = "👁️ Ver historial completo";
  botonHistorial.addEventListener("click", () => abrirModalHistorialAlumno(alumno));
  celdaAcciones.appendChild(botonHistorial);

  // Independiente de activo/reactivar-baja: solo tiene sentido mientras
  // el código todavía no se consumió (regenerar uno ya usado no
  // significa nada, la cuenta ya existe).
  if (alumno.usado === false) {
    const botonRegenerar = document.createElement("button");
    botonRegenerar.type = "button";
    botonRegenerar.className = "boton-secundario";
    botonRegenerar.textContent = "🔄 Regenerar código";
    botonRegenerar.addEventListener("click", () => regenerarCodigoAlumno(alumno, fila));
    celdaAcciones.appendChild(botonRegenerar);
  }

  if (alumno.activo === false) {
    const botonReactivar = document.createElement("button");
    botonReactivar.type = "button";
    botonReactivar.className = "boton-secundario";
    botonReactivar.textContent = "Reactivar";
    botonReactivar.addEventListener("click", () => reactivarAlumno(alumno, fila));
    celdaAcciones.appendChild(botonReactivar);
  } else {
    const botonBaja = document.createElement("button");
    botonBaja.type = "button";
    botonBaja.className = "alumnos-tabla__boton-baja";
    botonBaja.textContent = "Dar de baja";
    botonBaja.addEventListener("click", () => darDeBajaAlumno(alumno, fila));
    celdaAcciones.appendChild(botonBaja);
  }

  fila.appendChild(celdaAcciones);
  return fila;
}

function construirTablaAlumnos(alumnos) {
  const tabla = document.createElement("table");
  tabla.className = "tabla-alumnos";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ["Nombre", "N.° de lista", "Estado de cuenta", "Acciones"].forEach((texto) => {
    const th = document.createElement("th");
    th.textContent = texto;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  alumnos.forEach((alumno) => tbody.appendChild(crearFilaAlumno(alumno)));
  tabla.appendChild(tbody);

  return tabla;
}

async function renderizarTablaAlumnos() {
  const contenedor = document.getElementById("alumnos-tabla-contenedor");
  if (!contenedor) return;

  mostrarSinResultados(contenedor, "Cargando…");

  const alumnos = await obtenerAlumnosParaCalificacion(estadoAlumnos.grupo);
  if (alumnos.length === 0) {
    mostrarSinResultados(contenedor, "No hay alumnos registrados para este grupo.");
    return;
  }

  contenedor.innerHTML = "";
  contenedor.appendChild(construirTablaAlumnos(alumnos));

  // El término de búsqueda no se limpia al cambiar de Grupo, así que hay
  // que reaplicarlo sobre las filas recién creadas (mismo motivo que en
  // renderizarTablaCalificacion).
  filtrarFilasTablaAlumnos();
}

// Filtra en vivo las FILAS ya renderizadas (no dispara una nueva
// consulta) — mismo patrón que filtrarFilasTablaCalificacion.
function filtrarFilasTablaAlumnos() {
  const input = document.getElementById("alumnos-buscador-input");
  const contenedor = document.getElementById("alumnos-tabla-contenedor");
  if (!input || !contenedor) return;

  const tabla = contenedor.querySelector(".tabla-alumnos");
  const filas = contenedor.querySelectorAll("tbody tr");
  let mensajeSinCoincidencias = contenedor.querySelector(".alumnos-tabla__sin-coincidencias");

  if (!tabla || filas.length === 0) {
    if (mensajeSinCoincidencias) mensajeSinCoincidencias.remove();
    return;
  }

  const termino = normalizarParaBusqueda(input.value.trim());
  let algunaVisible = false;

  filas.forEach((fila) => {
    const coincide =
      termino === "" ||
      fila.dataset.nombreBusqueda.includes(termino) ||
      fila.dataset.numeroLista.includes(termino);
    fila.hidden = !coincide;
    if (coincide) algunaVisible = true;
  });

  if (termino !== "" && !algunaVisible) {
    if (!mensajeSinCoincidencias) {
      mensajeSinCoincidencias = document.createElement("p");
      mensajeSinCoincidencias.className = "sin-resultados alumnos-tabla__sin-coincidencias";
      mensajeSinCoincidencias.textContent = "No se encontró ningún alumno con ese nombre o número de lista.";
      tabla.after(mensajeSinCoincidencias);
    }
  } else if (mensajeSinCoincidencias) {
    mensajeSinCoincidencias.remove();
  }
}

function activarBuscadorAlumnos() {
  const input = document.getElementById("alumnos-buscador-input");
  if (!input) return;
  input.addEventListener("input", filtrarFilasTablaAlumnos);
}

// Botón "+ Nuevo alumno": solo abre el formulario limpio (el envío real
// vive en activarFormularioNuevoAlumno).
function activarBotonNuevoAlumno() {
  const boton = document.getElementById("alumnos-boton-nuevo");
  const modal = document.getElementById("modal-nuevo-alumno");
  const formulario = document.getElementById("formulario-nuevo-alumno");
  if (!boton || !modal || !formulario) return;

  boton.addEventListener("click", () => {
    formulario.reset();
    document.getElementById("nuevo-alumno-error").hidden = true;
    limpiarCampoInvalido(document.getElementById("nuevo-alumno-nombre"));
    modal.showModal();
  });
}

// Validación mínima (Paso 4 del prompt): nombre no vacío, grupo
// seleccionado, número de lista entero positivo. A propósito NO valida
// unicidad de número de lista dentro del grupo — puede haber
// reasignaciones legítimas, eso queda fuera de este alcance.
function activarFormularioNuevoAlumno() {
  const modal = document.getElementById("modal-nuevo-alumno");
  const formulario = document.getElementById("formulario-nuevo-alumno");
  if (!modal || !formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (demoModeActivo()) {
      await cerrarDialogoAnimado(modal);
      abrirModalDemo();
      return;
    }

    const campoNombre = document.getElementById("nuevo-alumno-nombre");
    const nombre = campoNombre.value.trim();
    const grupo = document.getElementById("nuevo-alumno-grupo").value;
    const numeroLista = Number(document.getElementById("nuevo-alumno-numero-lista").value);
    const error = document.getElementById("nuevo-alumno-error");
    const botonConfirmar = document.getElementById("nuevo-alumno-confirmar");

    error.hidden = true;
    limpiarCampoInvalido(campoNombre);

    if (!nombre) {
      error.textContent = "El nombre no puede estar vacío.";
      error.hidden = false;
      return;
    }
    const resultadoNombre = validarTextoSeguro(nombre, { maxLargo: 100 });
    if (!resultadoNombre.valido) {
      marcarCampoInvalido(campoNombre, resultadoNombre.motivo);
      return;
    }
    if (grupo !== "3C" && grupo !== "3E") {
      error.textContent = "Selecciona un grupo.";
      error.hidden = false;
      return;
    }
    if (!Number.isInteger(numeroLista) || numeroLista <= 0) {
      error.textContent = "El número de lista debe ser un entero positivo.";
      error.hidden = false;
      return;
    }

    botonConfirmar.disabled = true;
    try {
      const codigo = await generarCodigoInvitacionUnico();
      const { data, error: errorInsert } = await clienteSupabase
        .from("alumnos_registro")
        .insert({
          nombre,
          grupo,
          numero_lista: numeroLista,
          codigo_invitacion: codigo,
          activo: true,
          usado: false,
          auth_user_id: null,
        })
        .select()
        .single();
      if (errorInsert) throw errorInsert;

      cerrarDialogoAnimado(modal);
      formulario.reset();
      await renderizarTablaAlumnos();
      mostrarModalCodigoInvitacion(data, codigo);
    } catch (err) {
      error.textContent = "No se pudo crear al alumno: " + (err?.message || "intenta de nuevo.");
      error.hidden = false;
    } finally {
      botonConfirmar.disabled = false;
    }
  });

  document.getElementById("nuevo-alumno-cancelar").addEventListener("click", () => {
    formulario.reset();
    cerrarDialogoAnimado(modal);
  });

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", () => {
      formulario.reset();
      cerrarDialogoAnimado(modal);
    });
  }

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });
}

async function inicializarModuloAlumnos() {
  const contenedor = document.getElementById("alumnos-tabla-contenedor");
  if (!contenedor) return; // no es admin.html

  // Mismo guard que Calificación: alumnos_registro está protegida por
  // RLS para el rol docente.
  await promesaGuardPanelDocente;

  await renderizarTablaAlumnos();
  activarBuscadorAlumnos();
  activarBotonNuevoAlumno();
  activarFormularioNuevoAlumno();
  activarCierreModalCodigoInvitacion();
  activarCopiarCodigoInvitacion();

  const selectGrupo = document.getElementById("alumnos-filtro-grupo");
  selectGrupo.addEventListener("change", async () => {
    estadoAlumnos.grupo = selectGrupo.value;
    await renderizarTablaAlumnos();
  });
}

/* ---------------------------------------------------------
   Módulo "Tomar asistencia" (tab-asistencia)

   Roster real (alumnos_registro) del grupo/fecha elegidos, con un grupo
   de 5 chips por alumno (ver ESTADOS_ASISTENCIA_CHIPS) -- selección
   directa, sin ciclar: tocar cualquier chip lo activa de inmediato
   (actualización optimista en el DOM, ver seleccionarChipAsistencia());
   "Guardar asistencia" es quien persiste el batch completo de una sola
   vez vía guardarAsistenciaLote(). Los alumnos "sin cuenta" (ver nota de
   cabecera de obtenerAsistenciaPorFecha: sin auth_user_id no hay id
   utilizable como asistencia.alumno_id) no reciben chips -- se muestran
   con el mismo badge de 4 estados que ya usa el módulo Alumnos
   (estadoCuentaAlumno()) y quedan fuera del batch a guardar, mismo
   criterio que ya usa crearFilaAlumnoCalificacion() en Calificación.
   --------------------------------------------------------- */

const estadoAsistencia = { grupo: "3C", fecha: null, trimestre: null };

// Texto completo (aria-label del chip) vs. abreviatura visible (pedido
// explícito: "Pres./Ret./Just./Sal." para que los 5 quepan en una sola
// fila incluso en 390px, ver .asistencia-chips en css/style.css).
const TEXTO_ESTADO_ASISTENCIA = {
  presente: "Presente",
  falta: "Falta",
  retardo: "Retardo",
  justificada: "Justificada",
  salida_anticipada: "Salida anticipada",
};

const ESTADOS_ASISTENCIA_CHIPS = [
  { estado: "presente", icono: "✅", texto: "Pres." },
  { estado: "falta", icono: "❌", texto: "Falta" },
  { estado: "retardo", icono: "⏰", texto: "Ret." },
  { estado: "justificada", icono: "📄", texto: "Just." },
  { estado: "salida_anticipada", icono: "🚪", texto: "Sal." },
];

function crearFilaAsistenciaAlumno(fila) {
  const { alumno, sinCuenta, estado, notas } = fila;

  const envoltura = document.createElement("div");
  envoltura.className = "asistencia-alumno";
  if (alumno.activo === false) envoltura.classList.add("fila-alumno--inactivo");

  const info = document.createElement("div");
  info.className = "asistencia-alumno__info";
  const nombre = document.createElement("span");
  nombre.className = "asistencia-alumno__nombre calificacion-tabla__alumno-nombre";
  nombre.textContent = alumno.nombre;
  const numero = document.createElement("span");
  numero.className = "asistencia-alumno__numero";
  numero.textContent = "N.° " + alumno.numero_lista;
  info.append(nombre, numero);
  envoltura.appendChild(info);

  if (sinCuenta) {
    const { estado: estadoCuenta, texto } = estadoCuentaAlumno(alumno);
    const badge = document.createElement("span");
    badge.className = "badge-estado";
    badge.dataset.estadoCuenta = estadoCuenta;
    badge.textContent = texto;
    envoltura.appendChild(badge);
    return envoltura;
  }

  // Default visual "Presente" cuando no hay fila guardada ese día
  // (estado === "sin_registrar"); si ya existe registro real, precarga
  // ese estado tal cual -- nunca se asume "falta".
  const estadoInicial = estado === "sin_registrar" ? "presente" : estado;

  const grupoChips = document.createElement("div");
  grupoChips.className = "asistencia-chips";
  grupoChips.setAttribute("role", "radiogroup");
  grupoChips.setAttribute("aria-label", "Estado de asistencia de " + alumno.nombre);
  grupoChips.dataset.alumnoId = alumno.auth_user_id;
  grupoChips.dataset.notasPrevias = notas || "";

  ESTADOS_ASISTENCIA_CHIPS.forEach(({ estado: estadoChip, icono, texto }) => {
    const activo = estadoChip === estadoInicial;

    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "asistencia-chip" + (activo ? " asistencia-chip--activo" : "");
    chip.dataset.estado = estadoChip;
    chip.setAttribute("role", "radio");
    chip.setAttribute("aria-checked", String(activo));
    chip.setAttribute("aria-label", TEXTO_ESTADO_ASISTENCIA[estadoChip]);

    const iconoEl = document.createElement("span");
    iconoEl.className = "asistencia-chip__icono";
    iconoEl.setAttribute("aria-hidden", "true");
    iconoEl.textContent = icono;

    const textoEl = document.createElement("span");
    textoEl.className = "asistencia-chip__texto";
    textoEl.setAttribute("aria-hidden", "true");
    textoEl.textContent = texto;

    chip.append(iconoEl, textoEl);
    chip.addEventListener("click", () => seleccionarChipAsistencia(grupoChips, chip));
    grupoChips.appendChild(chip);
  });

  envoltura.appendChild(grupoChips);
  return envoltura;
}

// Selección directa (sin ciclar): marca el chip tocado como activo y
// desmarca a los otros 4 del mismo grupo. Actualización optimista en el
// DOM nada más -- guardarAsistenciaDesdeUI() es quien persiste de verdad,
// solo al presionar "Guardar asistencia".
function seleccionarChipAsistencia(grupoChips, chipTocado) {
  Array.from(grupoChips.querySelectorAll(".asistencia-chip")).forEach((chip) => {
    const activo = chip === chipTocado;
    chip.classList.toggle("asistencia-chip--activo", activo);
    chip.setAttribute("aria-checked", String(activo));
  });
}

async function renderizarListaAsistencia() {
  const contenedor = document.getElementById("asistencia-lista-contenedor");
  const aviso = document.getElementById("asistencia-aviso-no-clase");
  const botonGuardar = document.getElementById("asistencia-boton-guardar");
  const { grupo, fecha } = estadoAsistencia;
  if (!contenedor || !fecha) return;

  if (!esDiaDeClasePara(grupo, fecha)) {
    contenedor.innerHTML = "";
    botonGuardar.hidden = true;
    aviso.hidden = false;
    mostrarSinResultados(aviso, "Este día no hay clase para este grupo.", "📅");
    return;
  }

  aviso.hidden = true;
  aviso.innerHTML = "";

  const filas = await obtenerAsistenciaPorFecha(grupo, fecha);
  contenedor.innerHTML = "";

  if (filas.length === 0) {
    mostrarSinResultados(contenedor, "Este grupo no tiene alumnos registrados.", "🧑‍🎓");
    botonGuardar.hidden = true;
    return;
  }

  filas.forEach((fila) => contenedor.appendChild(crearFilaAsistenciaAlumno(fila)));
  botonGuardar.hidden = false;
}

async function guardarAsistenciaDesdeUI() {
  // demoModeActivo() también se revisa aquí (no solo dentro de
  // guardarAsistenciaLote): esta función, tras el await, siempre muestra
  // "Asistencia guardada" y refresca la lista — si guardarAsistenciaLote
  // solo abriera el modal de demo y retornara, este código igual
  // ejecutaría ambas cosas, y renderizarListaAsistencia() revertiría los
  // chips que el docente acababa de tocar a su estado original de
  // DEMO_ASISTENCIA (parecería que "se guardó" y luego se deshizo solo).
  if (demoModeActivo()) {
    abrirModalDemo();
    return;
  }

  const contenedor = document.getElementById("asistencia-lista-contenedor");
  const botonGuardar = document.getElementById("asistencia-boton-guardar");
  const gruposChips = Array.from(contenedor.querySelectorAll(".asistencia-chips"));
  if (gruposChips.length === 0) return;

  const registros = gruposChips.map((grupoChips) => ({
    alumno_id: grupoChips.dataset.alumnoId,
    estado: grupoChips.querySelector(".asistencia-chip--activo").dataset.estado,
    notas: grupoChips.dataset.notasPrevias || null,
  }));

  botonGuardar.disabled = true;
  try {
    await guardarAsistenciaLote(
      estadoAsistencia.grupo,
      estadoAsistencia.fecha,
      Number(estadoAsistencia.trimestre),
      registros
    );
    mostrarToast("Asistencia guardada");
    await renderizarListaAsistencia();
  } catch (error) {
    mostrarToastAdvertencia("No se pudo guardar la asistencia. Intenta de nuevo.");
  } finally {
    botonGuardar.disabled = false;
  }
}

async function inicializarModuloAsistencia() {
  const contenedor = document.getElementById("asistencia-lista-contenedor");
  if (!contenedor) return; // no es admin.html

  // Mismo guard que Alumnos/Calificación: alumnos_registro/asistencia
  // están protegidas por RLS para el rol docente.
  await promesaGuardPanelDocente;

  const selectGrupo = document.getElementById("asistencia-filtro-grupo");
  const inputFecha = document.getElementById("asistencia-filtro-fecha");
  const selectTrimestre = document.getElementById("asistencia-filtro-trimestre");

  // Local (no toISOString(), que es UTC): esDiaDeClasePara()/
  // TIPOS_DIA_POR_FECHA ya arman sus claves de fecha con
  // formatearClaveFecha() -- misma fuente de verdad para "hoy", para que
  // el default nunca quede un día desfasado cerca de medianoche.
  inputFecha.value = formatearClaveFecha(new Date());
  selectTrimestre.value = String(trimestreDesbloqueado || 1);

  estadoAsistencia.grupo = selectGrupo.value;
  estadoAsistencia.fecha = inputFecha.value;
  estadoAsistencia.trimestre = selectTrimestre.value;

  await renderizarListaAsistencia();

  selectGrupo.addEventListener("change", async () => {
    estadoAsistencia.grupo = selectGrupo.value;
    await renderizarListaAsistencia();
  });
  inputFecha.addEventListener("change", async () => {
    estadoAsistencia.fecha = inputFecha.value;
    await renderizarListaAsistencia();
  });
  selectTrimestre.addEventListener("change", () => {
    estadoAsistencia.trimestre = selectTrimestre.value;
  });

  document.getElementById("asistencia-boton-guardar").addEventListener("click", guardarAsistenciaDesdeUI);
}

/* ---------------------------------------------------------
   Módulo "Avisos" (tab-avisos)

   CRUD completo sobre la tabla avisos, directo desde este módulo (no
   reutiliza obtenerAvisos(): esa función es para el sitio público y ya
   filtra los expirados — aquí el panel necesita ver TODOS los avisos,
   incluidos los expirados, para poder editarlos/reactivarlos). Reutiliza
   textoGrupo()/textoPrioridad()/formatearFecha()/mostrarSinResultados(),
   ya genéricas, del resto del archivo.
   --------------------------------------------------------- */

// { aviso, fila } del aviso actualmente en edición, o null cuando el
// dialog está en modo "Crear" — lo usa activarFormularioAviso() para
// decidir INSERT vs. UPDATE y, en edición, reemplazar solo esa fila.
let avisoEditando = null;

// Compara fecha_expiracion (o su ausencia) contra hoy — mismo formato
// ISO de solo fecha ("YYYY-MM-DD") que ya usa obtenerAvisos(), así que
// la comparación de strings es válida sin parsear a Date.
function estadoVigenciaAviso(aviso) {
  const fechaHoyISO = new Date().toISOString().slice(0, 10);
  if (aviso.fecha_expiracion && aviso.fecha_expiracion < fechaHoyISO) {
    return { estado: "expirado", texto: "Expirado" };
  }
  return { estado: "activo", texto: "Activo" };
}

function crearFilaAviso(aviso) {
  const fila = document.createElement("tr");
  const { estado, texto } = estadoVigenciaAviso(aviso);
  // Sigue siendo editable pese a la atenuación (mismo criterio que
  // .fila-alumno--inactivo): por si Hiram quiere extender la fecha de
  // expiración o reactivar el aviso.
  if (estado === "expirado") fila.classList.add("fila-aviso--expirado");

  const celdaFecha = document.createElement("td");
  celdaFecha.textContent = formatearFecha(aviso.fecha);
  fila.appendChild(celdaFecha);

  const celdaTitulo = document.createElement("td");
  celdaTitulo.textContent = aviso.titulo;
  fila.appendChild(celdaTitulo);

  const celdaGrupo = document.createElement("td");
  celdaGrupo.textContent = textoGrupo(aviso.grupo);
  fila.appendChild(celdaGrupo);

  const celdaPrioridad = document.createElement("td");
  const badgePrioridad = document.createElement("span");
  badgePrioridad.className = "badge-prioridad";
  badgePrioridad.dataset.prioridad = aviso.prioridad;
  badgePrioridad.textContent = textoPrioridad(aviso.prioridad);
  celdaPrioridad.appendChild(badgePrioridad);
  fila.appendChild(celdaPrioridad);

  const celdaEstado = document.createElement("td");
  const badgeEstado = document.createElement("span");
  badgeEstado.className = "badge-estado";
  badgeEstado.dataset.estadoAviso = estado;
  badgeEstado.textContent = texto;
  celdaEstado.appendChild(badgeEstado);
  fila.appendChild(celdaEstado);

  const celdaAcciones = document.createElement("td");
  celdaAcciones.className = "avisos-tabla__acciones";

  const botonEditar = document.createElement("button");
  botonEditar.type = "button";
  botonEditar.className = "boton-secundario";
  botonEditar.textContent = "Editar";
  botonEditar.addEventListener("click", () => abrirModalAviso(aviso, fila));
  celdaAcciones.appendChild(botonEditar);

  // Texto simple en rojo, no un botón lleno: mismo criterio que
  // .alumnos-tabla__boton-baja — acción destructiva poco frecuente.
  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "avisos-tabla__boton-eliminar";
  botonEliminar.textContent = "Eliminar";
  botonEliminar.addEventListener("click", () => eliminarAviso(aviso, fila));
  celdaAcciones.appendChild(botonEliminar);

  fila.appendChild(celdaAcciones);
  return fila;
}

function construirTablaAvisos(avisos) {
  const tabla = document.createElement("table");
  tabla.className = "tabla-avisos";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ["Fecha", "Título", "Grupo", "Prioridad", "Estado", "Acciones"].forEach((texto) => {
    const th = document.createElement("th");
    th.textContent = texto;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  avisos.forEach((aviso) => tbody.appendChild(crearFilaAviso(aviso)));
  tabla.appendChild(tbody);

  return tabla;
}

// A diferencia de obtenerAvisos() (sitio público), consulta TODOS los
// avisos sin filtro de expiración y en orden descendente (más recientes
// primero, útil para gestión en vez de para mostrar próximos eventos).
async function renderizarTablaAvisos() {
  const contenedor = document.getElementById("avisos-tabla-contenedor");
  if (!contenedor) return;

  mostrarSinResultados(contenedor, "Cargando…");

  const { data, error } = await obtenerDatos("avisos", { order: { columna: "fecha", ascending: false } });

  if (error || !data || data.length === 0) {
    mostrarSinResultados(contenedor, "No hay avisos registrados.");
    return;
  }

  contenedor.innerHTML = "";
  contenedor.appendChild(construirTablaAvisos(data));
}

// Un solo dialog para ambos modos: aviso===null => "Crear" (formulario
// vacío/default); aviso!==null => "Editar" (precargado, guarda la fila
// en avisoEditando para poder reemplazarla sin refrescar toda la tabla).
function abrirModalAviso(aviso, fila) {
  const modal = document.getElementById("modal-aviso");
  const formulario = document.getElementById("formulario-aviso");
  if (!modal || !formulario) return;

  formulario.reset();
  document.getElementById("aviso-error").hidden = true;
  limpiarCampoInvalido(document.getElementById("aviso-titulo"));
  limpiarCampoInvalido(document.getElementById("aviso-descripcion"));

  if (aviso) {
    avisoEditando = { aviso, fila };
    document.getElementById("modal-aviso-titulo").textContent = "Editar aviso";
    document.getElementById("aviso-confirmar").textContent = "Guardar cambios";
    document.getElementById("aviso-titulo").value = aviso.titulo;
    document.getElementById("aviso-descripcion").value = aviso.descripcion || "";
    document.getElementById("aviso-fecha").value = aviso.fecha;
    document.getElementById("aviso-grupo").value = aviso.grupo;
    document.getElementById("aviso-prioridad").value = aviso.prioridad;
    document.getElementById("aviso-fecha-expiracion").value = aviso.fecha_expiracion || "";
  } else {
    avisoEditando = null;
    document.getElementById("modal-aviso-titulo").textContent = "Nuevo aviso";
    document.getElementById("aviso-confirmar").textContent = "Crear aviso";
  }

  modal.showModal();
}

function activarBotonNuevoAviso() {
  const boton = document.getElementById("avisos-boton-nuevo");
  if (!boton) return;
  boton.addEventListener("click", () => abrirModalAviso(null, null));
}

// Validación mínima (título y fecha no vacíos; grupo y prioridad siempre
// tienen un valor por default en el <select>, así que no hace falta
// validarlos). Dejar la fecha de expiración vacía se guarda como NULL
// ("nunca expira"), tal como ya asume obtenerAvisos().
function activarFormularioAviso() {
  const modal = document.getElementById("modal-aviso");
  const formulario = document.getElementById("formulario-aviso");
  if (!modal || !formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (demoModeActivo()) {
      await cerrarDialogoAnimado(modal);
      abrirModalDemo();
      return;
    }

    const campoTitulo = document.getElementById("aviso-titulo");
    const campoDescripcion = document.getElementById("aviso-descripcion");
    const titulo = campoTitulo.value.trim();
    const descripcion = campoDescripcion.value.trim();
    const fecha = document.getElementById("aviso-fecha").value;
    const grupo = document.getElementById("aviso-grupo").value;
    const prioridad = document.getElementById("aviso-prioridad").value;
    const fechaExpiracion = document.getElementById("aviso-fecha-expiracion").value;
    const error = document.getElementById("aviso-error");
    const botonConfirmar = document.getElementById("aviso-confirmar");

    error.hidden = true;
    limpiarCampoInvalido(campoTitulo);
    limpiarCampoInvalido(campoDescripcion);

    if (!titulo) {
      error.textContent = "El título no puede estar vacío.";
      error.hidden = false;
      return;
    }
    const resultadoTitulo = validarTextoSeguro(titulo, { maxLargo: 150 });
    if (!resultadoTitulo.valido) {
      marcarCampoInvalido(campoTitulo, resultadoTitulo.motivo);
      return;
    }
    const resultadoDescripcion = validarTextoSeguro(descripcion, { maxLargo: 2000 });
    if (!resultadoDescripcion.valido) {
      marcarCampoInvalido(campoDescripcion, resultadoDescripcion.motivo);
      return;
    }
    if (!fecha) {
      error.textContent = "La fecha no puede estar vacía.";
      error.hidden = false;
      return;
    }

    const payload = {
      titulo,
      descripcion,
      fecha,
      grupo,
      prioridad,
      fecha_expiracion: fechaExpiracion || null,
    };

    botonConfirmar.disabled = true;
    try {
      if (avisoEditando) {
        const { data, error: errorUpdate } = await clienteSupabase
          .from("avisos")
          .update(payload)
          .eq("id", avisoEditando.aviso.id)
          .select()
          .single();
        if (errorUpdate) throw errorUpdate;

        cerrarDialogoAnimado(modal);
        formulario.reset();
        avisoEditando.fila.replaceWith(crearFilaAviso(data));
        avisoEditando = null;
      } else {
        const { error: errorInsert } = await clienteSupabase.from("avisos").insert(payload);
        if (errorInsert) throw errorInsert;

        cerrarDialogoAnimado(modal);
        formulario.reset();
        await renderizarTablaAvisos();
      }
    } catch (err) {
      error.textContent = "No se pudo guardar el aviso: " + (err?.message || "intenta de nuevo.");
      error.hidden = false;
    } finally {
      botonConfirmar.disabled = false;
    }
  });

  document.getElementById("aviso-cancelar").addEventListener("click", () => {
    formulario.reset();
    cerrarDialogoAnimado(modal);
  });

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", () => {
      formulario.reset();
      cerrarDialogoAnimado(modal);
    });
  }

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });
}

// Elimina de forma permanente (a diferencia de dar de baja a un alumno,
// aquí no hay soft-delete: la expiración ya cubre el caso de "ocultar
// sin perder", esto es intencional y definitivo).
async function eliminarAviso(aviso, fila) {
  if (demoModeActivo()) {
    abrirModalDemo();
    return;
  }
  if (!window.confirm('¿Seguro que quieres eliminar el aviso "' + aviso.titulo + '"? Esta acción no se puede deshacer.')) return;

  try {
    const { error } = await clienteSupabase.from("avisos").delete().eq("id", aviso.id);
    if (error) throw error;
  } catch (error) {
    window.alert("No se pudo eliminar el aviso: " + (error?.message || "intenta de nuevo."));
    return;
  }

  fila.remove();
}

async function inicializarModuloAvisos() {
  const contenedor = document.getElementById("avisos-tabla-contenedor");
  if (!contenedor) return; // no es admin.html

  // Mismo guard que Calificación/Alumnos: avisos también se administra
  // desde el panel docente protegido por RLS.
  await promesaGuardPanelDocente;

  await renderizarTablaAvisos();
  activarBotonNuevoAviso();
  activarFormularioAviso();
  await inicializarFormularioPopupBienvenida();
}

// Texto legible de "tipo" de evento del calendario — mismo criterio que
// textoPrioridad()/textoGrupo(). Usado tanto por la tabla del panel
// admin (Cambio 2) como por la lista pública "Próximas fechas" (Cambio 3).
function textoTipoEvento(tipo) {
  if (tipo === "escuela") return "🏫 Escuela";
  if (tipo === "evaluacion") return "📝 Evaluación";
  return "📌 General";
}

// Mismo criterio que crearBadgeGrupo(): un <span> con la clase de badge
// y el dato en un atributo data-* para que el color lo resuelva CSS
// (.badge-tipo-evento[data-tipo=...] en style.css).
function crearBadgeTipoEvento(tipo) {
  const span = document.createElement("span");
  span.className = "badge-tipo-evento";
  span.dataset.tipo = tipo;
  span.textContent = textoTipoEvento(tipo);
  return span;
}

/* ---------------------------------------------------------
   Módulo "Calendario" (tab-calendario) — gestiona eventos_calendario.
   Mismo patrón exacto que el módulo Avisos de arriba (tabla + "+ Nuevo
   evento" + un solo dialog reutilizado para crear/editar), sin el
   concepto de expiración/prioridad que sí tiene un aviso.
   --------------------------------------------------------- */

async function renderizarTablaEventos() {
  const contenedor = document.getElementById("calendario-tabla-contenedor");
  if (!contenedor) return;

  mostrarSinResultados(contenedor, "Cargando…");

  const { data, error } = await obtenerDatos("eventos_calendario", { order: { columna: "fecha", ascending: false } });

  if (error || !data || data.length === 0) {
    mostrarSinResultados(contenedor, "No hay eventos registrados.");
    return;
  }

  contenedor.innerHTML = "";
  contenedor.appendChild(construirTablaEventos(data));
}

function construirTablaEventos(eventos) {
  const tabla = document.createElement("table");
  tabla.className = "tabla-eventos";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ["Fecha", "Título", "Grupo", "Tipo", "Acciones"].forEach((texto) => {
    const th = document.createElement("th");
    th.textContent = texto;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  eventos.forEach((evento) => tbody.appendChild(crearFilaEvento(evento)));
  tabla.appendChild(tbody);

  return tabla;
}

function crearFilaEvento(evento) {
  const fila = document.createElement("tr");

  const celdaFecha = document.createElement("td");
  celdaFecha.textContent = formatearFecha(evento.fecha);
  fila.appendChild(celdaFecha);

  const celdaTitulo = document.createElement("td");
  celdaTitulo.textContent = evento.titulo;
  fila.appendChild(celdaTitulo);

  const celdaGrupo = document.createElement("td");
  celdaGrupo.appendChild(crearBadgeGrupo(evento.grupo));
  fila.appendChild(celdaGrupo);

  const celdaTipo = document.createElement("td");
  celdaTipo.appendChild(crearBadgeTipoEvento(evento.tipo));
  fila.appendChild(celdaTipo);

  const celdaAcciones = document.createElement("td");
  celdaAcciones.className = "calendario-tabla__acciones";

  const botonEditar = document.createElement("button");
  botonEditar.type = "button";
  botonEditar.className = "boton-secundario";
  botonEditar.textContent = "Editar";
  botonEditar.addEventListener("click", () => abrirModalEvento(evento, fila));
  celdaAcciones.appendChild(botonEditar);

  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "calendario-tabla__boton-eliminar";
  botonEliminar.textContent = "Eliminar";
  botonEliminar.addEventListener("click", () => eliminarEvento(evento, fila));
  celdaAcciones.appendChild(botonEliminar);

  fila.appendChild(celdaAcciones);
  return fila;
}

// Mismo criterio que avisoEditando: null en modo "Crear", { evento, fila }
// en modo "Editar" para poder reemplazar la fila sin refrescar toda la
// tabla — ver abrirModalEvento()/activarFormularioEvento().
let eventoEditando = null;

function abrirModalEvento(evento, fila) {
  const modal = document.getElementById("modal-evento");
  const formulario = document.getElementById("formulario-evento");
  if (!modal || !formulario) return;

  formulario.reset();
  document.getElementById("evento-error").hidden = true;
  limpiarCampoInvalido(document.getElementById("evento-titulo"));

  if (evento) {
    eventoEditando = { evento, fila };
    document.getElementById("modal-evento-titulo").textContent = "Editar evento";
    document.getElementById("evento-confirmar").textContent = "Guardar cambios";
    document.getElementById("evento-titulo").value = evento.titulo;
    document.getElementById("evento-fecha").value = evento.fecha;
    document.getElementById("evento-grupo").value = evento.grupo;
    document.getElementById("evento-tipo").value = evento.tipo;
  } else {
    eventoEditando = null;
    document.getElementById("modal-evento-titulo").textContent = "Nuevo evento";
    document.getElementById("evento-confirmar").textContent = "Crear evento";
  }

  modal.showModal();
}

function activarBotonNuevoEvento() {
  const boton = document.getElementById("calendario-boton-nuevo");
  if (!boton) return;
  boton.addEventListener("click", () => abrirModalEvento(null, null));
}

// Validación mínima (título y fecha no vacíos; grupo y tipo siempre
// tienen un valor por default en el <select>), mismo criterio que
// activarFormularioAviso().
function activarFormularioEvento() {
  const modal = document.getElementById("modal-evento");
  const formulario = document.getElementById("formulario-evento");
  if (!modal || !formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (demoModeActivo()) {
      await cerrarDialogoAnimado(modal);
      abrirModalDemo();
      return;
    }

    const campoTitulo = document.getElementById("evento-titulo");
    const titulo = campoTitulo.value.trim();
    const fecha = document.getElementById("evento-fecha").value;
    const grupo = document.getElementById("evento-grupo").value;
    const tipo = document.getElementById("evento-tipo").value;
    const error = document.getElementById("evento-error");
    const botonConfirmar = document.getElementById("evento-confirmar");

    error.hidden = true;
    limpiarCampoInvalido(campoTitulo);

    if (!titulo) {
      error.textContent = "El título no puede estar vacío.";
      error.hidden = false;
      return;
    }
    const resultadoTitulo = validarTextoSeguro(titulo, { maxLargo: 150 });
    if (!resultadoTitulo.valido) {
      marcarCampoInvalido(campoTitulo, resultadoTitulo.motivo);
      return;
    }
    if (!fecha) {
      error.textContent = "La fecha no puede estar vacía.";
      error.hidden = false;
      return;
    }

    const payload = { titulo, fecha, grupo, tipo };

    botonConfirmar.disabled = true;
    try {
      if (eventoEditando) {
        const { data, error: errorUpdate } = await clienteSupabase
          .from("eventos_calendario")
          .update(payload)
          .eq("id", eventoEditando.evento.id)
          .select()
          .single();
        if (errorUpdate) throw errorUpdate;

        cerrarDialogoAnimado(modal);
        formulario.reset();
        eventoEditando.fila.replaceWith(crearFilaEvento(data));
        eventoEditando = null;
      } else {
        const { error: errorInsert } = await clienteSupabase.from("eventos_calendario").insert(payload);
        if (errorInsert) throw errorInsert;

        cerrarDialogoAnimado(modal);
        formulario.reset();
        await renderizarTablaEventos();
      }
    } catch (err) {
      error.textContent = "No se pudo guardar el evento: " + (err?.message || "intenta de nuevo.");
      error.hidden = false;
    } finally {
      botonConfirmar.disabled = false;
    }
  });

  document.getElementById("evento-cancelar").addEventListener("click", () => {
    formulario.reset();
    cerrarDialogoAnimado(modal);
  });

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", () => {
      formulario.reset();
      cerrarDialogoAnimado(modal);
    });
  }

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });
}

// Elimina de forma permanente (eventos_calendario no tiene concepto de
// expiración/soft-delete, a diferencia de un aviso).
async function eliminarEvento(evento, fila) {
  if (demoModeActivo()) {
    abrirModalDemo();
    return;
  }
  if (!window.confirm('¿Seguro que quieres eliminar el evento "' + evento.titulo + '"? Esta acción no se puede deshacer.')) return;

  try {
    const { error } = await clienteSupabase.from("eventos_calendario").delete().eq("id", evento.id);
    if (error) throw error;
  } catch (error) {
    window.alert("No se pudo eliminar el evento: " + (error?.message || "intenta de nuevo."));
    return;
  }

  fila.remove();
}

async function inicializarModuloCalendarioAdmin() {
  const contenedor = document.getElementById("calendario-tabla-contenedor");
  if (!contenedor) return; // no es admin.html

  // Mismo guard que Avisos: eventos_calendario también se administra
  // desde el panel docente protegido por RLS.
  await promesaGuardPanelDocente;

  await renderizarTablaEventos();
  activarBotonNuevoEvento();
  activarFormularioEvento();
}

// Lectura/escritura genéricas de una fila de config_sitio (columnas
// clave/valor/actualizado_por), compartidas por los módulos Trimestre y
// Apariencia del panel docente para no duplicar la conexión a Supabase
// en cada uno. Cada módulo sigue resolviendo su propio casteo/validación
// del "valor" (texto en la tabla) al tipo que le corresponde.
async function leerValorConfigSitio(clave) {
  const { data, error } = await clienteSupabase
    .from("config_sitio")
    .select("valor")
    .eq("clave", clave)
    .single();
  if (error) throw error;
  return data.valor;
}

// Se distingue de un Error genérico para que los llamadores (ver
// catch de ejecutarCambioTrimestre/ejecutarCambioPatronesFondo) puedan
// mostrar este mensaje tal cual en vez del genérico "revisa tu
// conexión" — no es un problema de red, es que a la clave le falta su
// fila en config_sitio.
class ErrorClaveConfigSitioInexistente extends Error {}

async function escribirValorConfigSitio(clave, valor) {
  const {
    data: { session },
  } = await clienteSupabase.auth.getSession();

  // .select() de vuelta para conocer cuántas filas afectó el UPDATE: un
  // UPDATE sobre una clave sin fila en config_sitio no da error (0 filas
  // afectadas, éxito silencioso), así que sin este chequeo el toast
  // mostraría "guardado" aunque nada se haya persistido. Aplica a
  // cualquier clave futura de config_sitio, no solo a las que ya existen.
  const { data, error } = await clienteSupabase
    .from("config_sitio")
    .update({ valor: String(valor), actualizado_por: session?.user?.id ?? null })
    .eq("clave", clave)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new ErrorClaveConfigSitioInexistente(
      `La clave "${clave}" no existe en config_sitio. Pide que la agreguen ahí antes de poder guardar este valor.`
    );
  }
}

/* ---------------------------------------------------------
   Asistencia (tabla "asistencia" + config_sitio umbral_faltas/umbral_retardos)

   asistencia.alumno_id es un auth.uid() (mismo id que perfiles.id/
   progreso.alumno_id, ver FK asistencia_alumno_id_fkey -> perfiles.id),
   NO el id de la fila de alumnos_registro. Un alumno sin cuenta reclamada
   (mismo "sinCuenta" que ya usa crearFilaAlumnoCalificacion) no puede
   tener fila real en "asistencia" todavía -- se reporta "sin_registrar",
   igual que un alumno con cuenta que simplemente no tiene fila ese día.
--------------------------------------------------------- */

const NOMBRES_DIA_COMPLETO = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const TIPOS_DIA_SIN_CLASE = new Set(["vacaciones", "cte-intensiva", "cte-ordinaria", "suspension"]);

// true solo si fechaISO no cae en un tipo de día sin clase (calendario
// escolar) Y el grupo tiene al menos un horario ese día de la semana.
function esDiaDeClasePara(grupo, fechaISO) {
  const registroTipo = TIPOS_DIA_POR_FECHA.get(fechaISO);
  if (registroTipo && TIPOS_DIA_SIN_CLASE.has(registroTipo.tipo)) return false;

  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const nombreDia = NOMBRES_DIA_COMPLETO[new Date(anio, mes - 1, dia).getDay()];
  return DATOS_HORARIO.some((registro) => registro.grupo === grupo && registro.dia === nombreDia);
}

// Roster completo del grupo (alumnos_registro, igual que
// obtenerAlumnosParaCalificacion) + su estado de asistencia de fechaISO.
// Alumnos sin fila real ese día -- incluidos los "sin cuenta" -- se
// reportan como estado "sin_registrar", nunca se asume "falta".
async function obtenerAsistenciaPorFecha(grupo, fechaISO) {
  const { data: alumnos, error: errorAlumnos } = await obtenerDatos("alumnos_registro", {
    eq: { grupo },
    order: { columna: "numero_lista", ascending: true },
  });
  if (errorAlumnos) return [];

  const idsConCuenta = alumnos.filter((alumno) => alumno.auth_user_id).map((alumno) => alumno.auth_user_id);

  const mapaAsistencia = new Map();
  if (idsConCuenta.length > 0) {
    const { data: filas, error: errorAsistencia } = await obtenerDatos("asistencia", {
      eq: { fecha: fechaISO },
      in: { alumno_id: idsConCuenta },
    });
    if (errorAsistencia) return [];
    filas.forEach((fila) => mapaAsistencia.set(fila.alumno_id, fila));
  }

  return alumnos.map((alumno) => {
    const sinCuenta = alumno.usado === false || !alumno.auth_user_id;
    const fila = sinCuenta ? null : mapaAsistencia.get(alumno.auth_user_id);
    return {
      alumno,
      sinCuenta,
      estado: fila?.estado || "sin_registrar",
      notas: fila?.notas || null,
    };
  });
}

// Upsert batch de asistencia para un grupo/fecha (onConflict alumno_id,fecha:
// retomar la misma fecha actualiza en vez de duplicar fila). registros:
// [{ alumno_id, estado, notas }], alumno_id = auth_user_id del alumno (ver
// nota de cabecera de esta sección). grupo no se persiste (la tabla
// "asistencia" no tiene columna grupo, ya viaja implícito vía alumno_id) --
// se recibe solo para que el llamador no tenga que reconstruir el batch.
async function guardarAsistenciaLote(grupo, fechaISO, trimestre, registros) {
  if (demoModeActivo()) {
    abrirModalDemo();
    return;
  }

  const {
    data: { session },
  } = await clienteSupabase.auth.getSession();

  const filas = registros.map((registro) => ({
    alumno_id: registro.alumno_id,
    fecha: fechaISO,
    trimestre,
    estado: registro.estado,
    notas: registro.notas || null,
    registrado_por: session?.user?.id ?? null,
    actualizado_en: new Date().toISOString(),
  }));

  const { error } = await clienteSupabase.from("asistencia").upsert(filas, { onConflict: "alumno_id,fecha" });
  if (error) throw error;
}

// Resumen de asistencia de un alumno en un trimestre: conteo por estado
// (sin_registrar no aplica -- esa palabra nunca se inserta, solo existen
// filas reales) + racha actual de asistencia consecutiva. Se corta solo
// con falta/retardo; presente/justificada/salida_anticipada la mantienen
// (a diferencia de calcularRachaPuntualidad, acá "haber estado" basta,
// no hace falta que la salida haya sido a la hora exacta).
async function calcularResumenAsistencia(alumnoId, trimestre) {
  const { data: filas, error } = await obtenerDatos("asistencia", {
    eq: { alumno_id: alumnoId, trimestre },
    order: { columna: "fecha", ascending: true },
  });
  if (error) return null;

  const conteoPorEstado = { presente: 0, falta: 0, retardo: 0, justificada: 0, salida_anticipada: 0 };
  filas.forEach((fila) => {
    if (fila.estado in conteoPorEstado) conteoPorEstado[fila.estado]++;
  });

  const evaluables = filas.length;
  const asistencias = conteoPorEstado.presente + conteoPorEstado.justificada;
  const pctAsistencia = evaluables === 0 ? null : Math.round((asistencias / evaluables) * 100);

  let racha = 0;
  for (let i = filas.length - 1; i >= 0; i--) {
    if (filas[i].estado === "falta" || filas[i].estado === "retardo") break;
    racha++;
  }

  return { conteoPorEstado, pctAsistencia, racha };
}

// Umbrales para alertas de asistencia (config_sitio, claves "umbral_faltas"/
// "umbral_retardos"). Mismo patrón async que obtenerTrimestreDesbloqueado:
// fallback conservador (3/5, acordado con Hiram) si la fila no existe o
// falla la consulta.
async function obtenerUmbralesAsistencia() {
  const [faltas, retardos] = await Promise.all([
    leerValorConfigSitio("umbral_faltas").catch(() => null),
    leerValorConfigSitio("umbral_retardos").catch(() => null),
  ]);
  return {
    umbralFaltas: faltas !== null ? Number(faltas) : 3,
    umbralRetardos: retardos !== null ? Number(retardos) : 5,
  };
}

/* ---------------------------------------------------------
   Popup de bienvenida (config_sitio, clave "popup_bienvenida")

   Overlay configurable desde el admin (tab-avisos) que aparece SOLO en
   index.html, una vez por sesión de navegador. El "valor" de la fila es
   un JSON stringificado con la forma { activo, titulo, mensaje,
   imagenUrl } — mismo patrón clave/valor que tema_evento_activo/
   trimestre_desbloqueado, vía leerValorConfigSitio()/
   escribirValorConfigSitio() de arriba. La clave "popup_bienvenida"
   necesita el INSERT manual de su fila en el SQL Editor de Supabase
   (rol postgres) antes de que el formulario de abajo pueda guardar en
   producción — las políticas anon/authenticated de config_sitio solo
   permiten UPDATE, nunca INSERT (misma lección ya conocida de
   tema_evento_activo/trimestre_desbloqueado).

   mostrarPopupBienvenida()/activarPopupBienvenida() son compartidas por
   dos consumidores con el MISMO <dialog id="popup-bienvenida"> markup
   (duplicado tal cual entre admin.html e index.html, mismo criterio ya
   usado por #modal-demo): la Vista previa de este módulo (abajo) y el
   show real en index.html (ver inicializarPopupBienvenidaIndex()).
   --------------------------------------------------------- */

// activo:false por defecto/seguro — hasta que se guarde explícito desde
// el admin, nadie ve nada (ni siquiera si la fila de Supabase no
// existiera todavía).
const POPUP_BIENVENIDA_DEFECTO = { activo: false, titulo: "", mensaje: "", imagenUrl: "", textoAlt: "" };

// Nunca se cierra con Escape: <dialog> dispara "cancel" antes de
// cerrarse por Escape, y aquí se bloquea a propósito con
// preventDefault() — decisión intencional (no un descuido de
// accesibilidad): el aviso de bienvenida solo se descarta con el botón
// explícito, para asegurar que se lea antes de cerrarse. Tampoco cierra
// con clic en el backdrop: a diferencia de #modal-demo/#modal-tema
// (activarCierreModalDemo()), este <dialog> nunca recibe ese listener.
// Idempotente en la práctica (una sola vez por página, desde
// activarFormularioPopupBienvenida()/inicializarPopupBienvenidaIndex()),
// pero no pasa nada si se llamara dos veces: preventDefault() repetido
// no tiene efecto secundario.
function activarPopupBienvenida() {
  const dialogo = document.getElementById("popup-bienvenida");
  if (!dialogo) return;
  dialogo.addEventListener("cancel", (evento) => evento.preventDefault());
}

// Puebla y muestra #popup-bienvenida con "datos" ({activo, titulo,
// mensaje, imagenUrl} — activo no se lee aquí, ya lo filtró el
// llamador). onCerrar se invoca SOLO al cerrar (nunca al abrir): el show
// real en index.html pasa una función que marca sessionStorage como
// visto; la Vista previa del admin pasa null para no "gastar" el show
// real de un visitante. .onclick (no addEventListener) en el botón de
// cerrar para no acumular un listener nuevo cada vez que se llama esta
// función (ej. cada clic de "Vista previa").
function mostrarPopupBienvenida(datos, onCerrar) {
  const dialogo = document.getElementById("popup-bienvenida");
  if (!dialogo) return;

  const tituloEl = document.getElementById("popup-bienvenida-titulo-texto");
  const mensajeEl = document.getElementById("popup-bienvenida-mensaje-texto");
  const imagenWrap = document.getElementById("popup-bienvenida-imagen-wrap");
  const imagenEl = document.getElementById("popup-bienvenida-imagen-el");

  if (datos.titulo) {
    tituloEl.textContent = datos.titulo;
    tituloEl.hidden = false;
  } else {
    tituloEl.hidden = true;
  }
  mensajeEl.textContent = datos.mensaje || "";

  if (datos.imagenUrl) {
    // onerror ANTES de asignar src: si la ruta está mal (assets/ local
    // inexistente o URL externa caída), oculta el wrapper en silencio en
    // vez de dejar el ícono de imagen rota — nunca rompe el popup.
    imagenEl.onerror = () => {
      imagenWrap.hidden = true;
    };
    imagenEl.alt = datos.textoAlt || "";
    imagenEl.src = datos.imagenUrl;
    imagenWrap.hidden = false;
  } else {
    imagenEl.removeAttribute("src");
    imagenEl.alt = "";
    imagenWrap.hidden = true;
  }

  const botonCerrar = document.getElementById("popup-bienvenida-cerrar");
  botonCerrar.onclick = () => {
    cerrarDialogoAnimado(dialogo);
    if (onCerrar) onCerrar();
  };

  dialogo.showModal();
}

function poblarFormularioPopupBienvenida(datos) {
  document.getElementById("popup-bienvenida-form-activo").checked = !!datos.activo;
  document.getElementById("popup-bienvenida-form-titulo").value = datos.titulo || "";
  document.getElementById("popup-bienvenida-form-mensaje").value = datos.mensaje || "";
  document.getElementById("popup-bienvenida-form-imagen").value = datos.imagenUrl || "";
  document.getElementById("popup-bienvenida-form-alt").value = datos.textoAlt || "";
}

function leerFormularioPopupBienvenida() {
  return {
    activo: document.getElementById("popup-bienvenida-form-activo").checked,
    titulo: document.getElementById("popup-bienvenida-form-titulo").value.trim(),
    mensaje: document.getElementById("popup-bienvenida-form-mensaje").value.trim(),
    imagenUrl: document.getElementById("popup-bienvenida-form-imagen").value.trim(),
    textoAlt: document.getElementById("popup-bienvenida-form-alt").value.trim(),
  };
}

// UPDATE real en config_sitio, vía escribirValorConfigSitio() — mismo
// patrón que guardarTrimestreDesbloqueado()/ejecutarCambioEvento() más
// abajo/arriba.
async function guardarPopupBienvenida(datos) {
  await escribirValorConfigSitio("popup_bienvenida", JSON.stringify(datos));
}

// Guarda con feedback por toast (carga → éxito/error+Reintentar), mismo
// patrón que ejecutarCambioTrimestre()/ejecutarCambioEvento().
async function ejecutarGuardarPopupBienvenida() {
  const error = document.getElementById("popup-bienvenida-form-error");
  const botonGuardar = document.getElementById("popup-bienvenida-boton-guardar");
  const campoTitulo = document.getElementById("popup-bienvenida-form-titulo");
  const campoMensaje = document.getElementById("popup-bienvenida-form-mensaje");
  const campoImagen = document.getElementById("popup-bienvenida-form-imagen");
  error.hidden = true;
  [campoTitulo, campoMensaje, campoImagen].forEach(limpiarCampoInvalido);

  const datos = leerFormularioPopupBienvenida();
  if (datos.activo && !datos.mensaje) {
    error.textContent = "El mensaje no puede estar vacío mientras el popup esté activo.";
    error.hidden = false;
    return;
  }

  const resultadoTitulo = validarTextoSeguro(datos.titulo, { maxLargo: 150 });
  if (!resultadoTitulo.valido) {
    marcarCampoInvalido(campoTitulo, resultadoTitulo.motivo);
    return;
  }
  const resultadoMensaje = validarTextoSeguro(datos.mensaje, { maxLargo: 2000 });
  if (!resultadoMensaje.valido) {
    marcarCampoInvalido(campoMensaje, resultadoMensaje.motivo);
    return;
  }
  const resultadoImagen = validarTextoSeguro(datos.imagenUrl, { maxLargo: 500 });
  if (!resultadoImagen.valido) {
    marcarCampoInvalido(campoImagen, resultadoImagen.motivo);
    return;
  }

  botonGuardar.disabled = true;
  const referenciaToast = mostrarToastCarga("Guardando popup de bienvenida…");
  try {
    await guardarPopupBienvenida(datos);
    actualizarToastCarga(referenciaToast, { tipo: "exito", mensaje: "Popup de bienvenida actualizado" });
  } catch (err) {
    actualizarToastCarga(referenciaToast, {
      tipo: "error",
      mensaje:
        err instanceof ErrorClaveConfigSitioInexistente
          ? err.message
          : "No se pudo guardar. Revisa tu conexión.",
      onReintentar: () => ejecutarGuardarPopupBienvenida(),
    });
  } finally {
    botonGuardar.disabled = false;
  }
}

function activarFormularioPopupBienvenida() {
  const formulario = document.getElementById("formulario-popup-bienvenida");
  if (!formulario) return;

  activarPopupBienvenida();

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    // Guard de modo demo, mismo criterio que activarFormularioTrimestre()/
    // ejecutarCambioEvento(): se corta en el disparador más temprano, antes
    // de intentar ningún UPDATE real.
    if (demoModeActivo()) {
      abrirModalDemo();
      return;
    }
    ejecutarGuardarPopupBienvenida();
  });

  const botonVistaPrevia = document.getElementById("popup-bienvenida-boton-vista-previa");
  if (botonVistaPrevia) {
    // Sin chequeo de "activo": la vista previa muestra los campos del
    // formulario tal cual están AHORA mismo, sin importar si el switch
    // está prendido — es una vista de diseño, no una simulación de "esto
    // se mostraría hoy". onCerrar:null → nunca toca sessionStorage.
    botonVistaPrevia.addEventListener("click", () => {
      mostrarPopupBienvenida(leerFormularioPopupBienvenida(), null);
    });
  }
}

async function inicializarFormularioPopupBienvenida() {
  const formulario = document.getElementById("formulario-popup-bienvenida");
  if (!formulario) return; // no es admin.html

  try {
    const valorGuardado = await leerValorConfigSitio("popup_bienvenida");
    poblarFormularioPopupBienvenida(valorGuardado ? JSON.parse(valorGuardado) : POPUP_BIENVENIDA_DEFECTO);
  } catch {
    // Sin fila todavía en config_sitio (INSERT manual pendiente) o sin
    // red: arranca en el valor seguro. Guardar SÍ fallará hasta que la
    // fila exista (ver ErrorClaveConfigSitioInexistente), pero precargar
    // el formulario no debe romperse por eso.
    poblarFormularioPopupBienvenida(POPUP_BIENVENIDA_DEFECTO);
  }

  activarFormularioPopupBienvenida();
}

// Lectura para el show REAL en index.html — a diferencia del formulario
// admin de arriba (que siempre lee/edita el valor real de Supabase,
// mismo criterio que Trimestre/Apariencia), ESTA sí respeta Modo Demo.
// config_sitio no pasa por obtenerDatos()/DEMO_TABLAS (esa capa mockea
// tablas-lista filtradas por opciones, no una fila clave/valor puntual
// leída con .single()), así que la intercepción vive aquí mismo: con
// demoModeActivo()=true devuelve DEMO_POPUP_BIENVENIDA (datos-demo.js)
// tal cual, sin tocar Supabase.
async function obtenerPopupBienvenida() {
  if (demoModeActivo()) return DEMO_POPUP_BIENVENIDA;
  try {
    const valor = await leerValorConfigSitio("popup_bienvenida");
    return valor ? JSON.parse(valor) : POPUP_BIENVENIDA_DEFECTO;
  } catch {
    return POPUP_BIENVENIDA_DEFECTO;
  }
}

const CLAVE_POPUP_BIENVENIDA_VISTO = "tecno10mixta_popup_bienvenida_visto";

// Una sola vez por sesión de navegador: sessionStorage (no localStorage)
// se limpia solo al cerrar el navegador por completo, nunca "para
// siempre" como sí pasaría con localStorage. Independiente de
// CLAVE_DEMO_ACTIVO (localStorage, Modo Demo — sección 2): storage y
// clave distintos, sin interferencia entre sí — activar/desactivar Modo
// Demo recarga la página (ver activarModoDemo()/desactivarModoDemo())
// pero eso no toca sessionStorage, así que "ya visto" sobrevive ese
// reload igual que cualquier otro. Guard de data-pagina="index" (no solo
// "¿existe #popup-bienvenida?"): admin.html tiene el MISMO <dialog> para
// su Vista previa, así que esa sola comprobación no bastaría para
// distinguir las dos páginas.
async function inicializarPopupBienvenidaIndex() {
  if (document.body.dataset.pagina !== "index") return;

  const dialogo = document.getElementById("popup-bienvenida");
  if (!dialogo) return;

  activarPopupBienvenida();

  if (sessionStorage.getItem(CLAVE_POPUP_BIENVENIDA_VISTO)) return;

  const datos = await obtenerPopupBienvenida();
  if (datos.activo !== true) return;

  mostrarPopupBienvenida(datos, () => {
    sessionStorage.setItem(CLAVE_POPUP_BIENVENIDA_VISTO, "1");
  });
}

/* ---------------------------------------------------------
   Módulo "Trimestre" (tab-trimestre)

   Un selector con confirmación para cambiar config_sitio (clave
   "trimestre_desbloqueado"), la misma fila que ya lee
   obtenerTrimestreDesbloqueado() para el sitio público. Solo 3 opciones
   fijas, así que el <fieldset> de radios vive hardcodeado en admin.html
   (no generado por JS como las tablas de Avisos/Alumnos) — este módulo
   solo maneja estado (actual vs. seleccionado) y el UPDATE.
   --------------------------------------------------------- */

const TEXTOS_TRIMESTRE_DESBLOQUEADO = {
  1: "Solo 1er Trimestre",
  2: "1er y 2do Trimestre",
  3: "Todos los trimestres",
};

const estadoTrimestreModulo = { actual: null };

function textoTrimestreActual(valor) {
  return valor + "° (" + (TEXTOS_TRIMESTRE_DESBLOQUEADO[valor] || "—") + ")";
}

// Marca el radio del valor actual y deja "Guardar cambio" deshabilitado
// (ver activarSelectorTrimestre, que vuelve a llamar a esto en cada
// "change" del fieldset para reevaluar si hay un cambio real pendiente).
function actualizarUITrimestreModulo() {
  const textoActual = document.getElementById("trimestre-actual-texto");
  if (textoActual) textoActual.textContent = textoTrimestreActual(estadoTrimestreModulo.actual);

  const radioActual = document.getElementById("trimestre-opcion-" + estadoTrimestreModulo.actual);
  if (radioActual) radioActual.checked = true;

  const botonGuardar = document.getElementById("trimestre-boton-guardar");
  if (botonGuardar) botonGuardar.disabled = true;
}

// Habilita "Guardar cambio" solo si la opción marcada difiere de la
// actual — no tiene sentido "confirmar" un no-cambio.
function activarSelectorTrimestre() {
  const fieldset = document.querySelector(".trimestre-opciones");
  const botonGuardar = document.getElementById("trimestre-boton-guardar");
  if (!fieldset || !botonGuardar) return;

  fieldset.addEventListener("change", (evento) => {
    const seleccionado = Number(evento.target.value);
    botonGuardar.disabled = seleccionado === estadoTrimestreModulo.actual;
  });
}

// Enumera los trimestres cuyo estado de acceso cambia (no solo el
// límite): al bloquear (nuevo < actual) son los que quedan por encima
// del nuevo tope, de (nuevo+1) a actual; al desbloquear (nuevo > actual)
// son los que se suman por encima del tope anterior, de (actual+1) a
// nuevo. "Trimestre 2 y 3" con "y" cuando son 2; un solo número si es 1.
function trimestresAfectados(actual, nuevo) {
  const [desde, hasta] = nuevo < actual ? [nuevo + 1, actual] : [actual + 1, nuevo];
  const numeros = [];
  for (let n = desde; n <= hasta; n++) numeros.push(n);

  if (numeros.length === 1) return "Trimestre " + numeros[0];
  return "Trimestre " + numeros.slice(0, -1).join(", ") + " y " + numeros[numeros.length - 1];
}

// Arma el texto de confirmación pedido, nombrando TODOS los trimestres
// afectados (no solo el límite) cuando el cambio salta más de un paso
// (p. ej. 3 → 1 afecta Trimestre 2 y 3, no solo el 3).
function textoConfirmacionTrimestre(actual, nuevo) {
  const esDesbloqueo = nuevo > actual;
  const verbo = esDesbloqueo ? "dará acceso a" : "bloqueará el acceso a";
  return (
    "Vas a cambiar el trimestre desbloqueado de " +
    actual +
    "° a " +
    nuevo +
    "°. Esto " +
    verbo +
    " " +
    trimestresAfectados(actual, nuevo) +
    " para todos los alumnos de inmediato. ¿Confirmas?"
  );
}

// UPDATE real en config_sitio, vía escribirValorConfigSitio() (ver
// utilidades compartidas arriba). actualizado_por queda en null si por
// alguna razón no hay sesión activa en este punto (no debería pasar:
// el guard del panel ya la exige), en vez de fallar el guardado entero
// por no poder resolver ese dato secundario.
async function guardarTrimestreDesbloqueado(nuevo) {
  await escribirValorConfigSitio("trimestre_desbloqueado", nuevo);
}

// Guarda el nuevo trimestre desbloqueado con feedback por toast: carga
// mientras se guarda, éxito o error+Reintentar al terminar (ver
// mostrarToastCarga()/actualizarToastCarga()). "Reintentar" vuelve a
// llamar a esta misma función con el mismo "nuevo" — cada intento es
// independiente, no importa cuántas veces falle.
async function ejecutarCambioTrimestre(nuevo) {
  const referenciaToast = mostrarToastCarga("Guardando cambio de trimestre…");
  try {
    await guardarTrimestreDesbloqueado(nuevo);

    estadoTrimestreModulo.actual = nuevo;
    actualizarUITrimestreModulo();

    // Sincroniza el resto del sitio con el nuevo valor de inmediato, sin
    // esperar a que otra pestaña/recarga vuelva a consultar
    // config_sitio — mismo caché que ya usa obtenerTrimestreDesbloqueado()
    // (sección 2), sin modificar esa función.
    localStorage.setItem(CLAVE_CACHE_TRIMESTRE_DESBLOQUEADO, String(nuevo));
    trimestreDesbloqueado = nuevo;

    actualizarToastCarga(referenciaToast, {
      tipo: "exito",
      mensaje: "Trimestre actualizado a " + nuevo + "°",
    });
  } catch (error) {
    actualizarToastCarga(referenciaToast, {
      tipo: "error",
      mensaje:
        error instanceof ErrorClaveConfigSitioInexistente
          ? error.message
          : "No se pudo guardar. Revisa tu conexión.",
      onReintentar: () => ejecutarCambioTrimestre(nuevo),
    });
  }
}

function activarFormularioTrimestre() {
  const formulario = document.getElementById("formulario-trimestre");
  const modal = document.getElementById("modal-confirmar-trimestre");
  const textoConfirmar = document.getElementById("trimestre-confirmar-texto");
  const errorConfirmar = document.getElementById("trimestre-confirmar-error");
  const botonConfirmar = document.getElementById("trimestre-confirmar-confirmar");
  if (!formulario || !modal) return;

  let nuevoPendiente = null;

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    // Guard de modo demo (Fase 6) — la escritura más sensible de las 15:
    // trimestre_desbloqueado es un gate real que afecta a alumnos reales
    // de inmediato (ver ejecutarCambioTrimestre). Se corta aquí, en el
    // disparador más temprano, antes de que se abra siquiera
    // #modal-confirmar-trimestre.
    if (demoModeActivo()) {
      abrirModalDemo();
      return;
    }

    const seleccionado = formulario.querySelector('input[name="trimestre-nuevo"]:checked');
    if (!seleccionado) return;

    nuevoPendiente = Number(seleccionado.value);
    if (nuevoPendiente === estadoTrimestreModulo.actual) return;

    errorConfirmar.hidden = true;
    textoConfirmar.textContent = textoConfirmacionTrimestre(estadoTrimestreModulo.actual, nuevoPendiente);
    modal.showModal();
  });

  // El modal solo confirma la intención; en cuanto se confirma se
  // cierra y el resto del feedback (carga/éxito/error) sigue por toast
  // — un solo lugar para eso en vez de repetirlo dentro del modal.
  botonConfirmar.addEventListener("click", async () => {
    if (nuevoPendiente === null) return;

    const nuevoTrimestre = nuevoPendiente;
    cerrarDialogoAnimado(modal);
    await ejecutarCambioTrimestre(nuevoTrimestre);
  });

  // Si se cierra el dialog sin confirmar (Cancelar, backdrop o ✕), el
  // radio marcado debe volver a reflejar el valor actual — se llama
  // explícito en cada uno en vez de depender solo del evento "close"
  // del <dialog> (Escape nativo sí lo dispara, así que ese caso también
  // queda cubierto por el listener de abajo).
  document.getElementById("trimestre-confirmar-cancelar").addEventListener("click", () => {
    cerrarDialogoAnimado(modal);
    actualizarUITrimestreModulo();
  });

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", () => {
      cerrarDialogoAnimado(modal);
      actualizarUITrimestreModulo();
    });
  }

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      cerrarDialogoAnimado(modal);
      actualizarUITrimestreModulo();
    }
  });

  modal.addEventListener("close", () => {
    actualizarUITrimestreModulo();
  });
}

async function inicializarModuloTrimestre() {
  const formulario = document.getElementById("formulario-trimestre");
  if (!formulario) return; // no es admin.html

  // Mismo guard que Calificación/Alumnos/Avisos: config_sitio también se
  // administra desde el panel docente protegido por RLS.
  await promesaGuardPanelDocente;

  // Consulta propia y directa (no reutiliza el trimestreDesbloqueado ya
  // resuelto por el guard de la sección 2): este módulo quiere el valor
  // más fresco posible al abrir el tab, tal como ya hace Avisos con su
  // propia consulta en vez de obtenerAvisos(). Si falla, cae al valor
  // global ya resuelto (que a su vez ya tiene su propio respaldo en
  // localStorage) en vez de dejar el módulo sin nada que mostrar.
  try {
    const { data, error } = await clienteSupabase
      .from("config_sitio")
      .select("valor")
      .eq("clave", "trimestre_desbloqueado")
      .single();
    if (error) throw error;
    estadoTrimestreModulo.actual = Number(data.valor);
  } catch {
    estadoTrimestreModulo.actual = trimestreDesbloqueado ?? 1;
  }

  actualizarUITrimestreModulo();
  activarSelectorTrimestre();
  activarFormularioTrimestre();
}

/* ---------------------------------------------------------
   Módulo "Apariencia" (tab-apariencia)

   Infraestructura de control para los patrones de fondo que se
   implementarán en una sesión posterior: un solo switch que lee/escribe
   config_sitio (clave "patrones_fondo_activos"), vía las mismas
   leerValorConfigSitio()/escribirValorConfigSitio() que ya usa el
   módulo Trimestre (ver arriba). A diferencia de Trimestre, el cambio
   se guarda de inmediato al togglear (sin modal de confirmación): es
   un ajuste visual de bajo riesgo, no un gate de acceso.
   --------------------------------------------------------- */

function actualizarUISwitchApariencia(activo) {
  const switchPatrones = document.getElementById("apariencia-patrones-switch");
  const estadoTexto = document.getElementById("apariencia-patrones-estado");
  if (switchPatrones) switchPatrones.checked = activo;
  if (estadoTexto) estadoTexto.textContent = activo ? "Activado" : "Desactivado";
}

async function ejecutarCambioPatronesFondo(activo) {
  // El checkbox nativo ya cambió visualmente (evento "change" dispara
  // después de que el navegador actualiza .checked) — hay que revertirlo
  // explícitamente antes de mostrar modal-demo, igual que ya hace el
  // catch de abajo cuando el guardado real falla.
  if (demoModeActivo()) {
    actualizarUISwitchApariencia(!activo);
    abrirModalDemo();
    return;
  }

  const switchPatrones = document.getElementById("apariencia-patrones-switch");
  if (switchPatrones) switchPatrones.disabled = true;

  const referenciaToast = mostrarToastCarga("Guardando cambio de apariencia…");
  try {
    await escribirValorConfigSitio("patrones_fondo_activos", activo);
    localStorage.setItem(CLAVE_CACHE_PATRONES_FONDO_ACTIVOS, String(activo));
    actualizarUISwitchApariencia(activo);
    actualizarToastCarga(referenciaToast, {
      tipo: "exito",
      mensaje: "Apariencia actualizada",
    });
  } catch (error) {
    // Revierte el switch al valor previo: el toggle ya se había marcado
    // visualmente antes de confirmar el guardado (evento "change" nativo
    // del checkbox), así que hay que deshacerlo si el UPDATE falla.
    actualizarUISwitchApariencia(!activo);
    actualizarToastCarga(referenciaToast, {
      tipo: "error",
      mensaje:
        error instanceof ErrorClaveConfigSitioInexistente
          ? error.message
          : "No se pudo guardar. Revisa tu conexión.",
      onReintentar: () => ejecutarCambioPatronesFondo(activo),
    });
  } finally {
    if (switchPatrones) switchPatrones.disabled = false;
  }
}

function activarSwitchApariencia() {
  const switchPatrones = document.getElementById("apariencia-patrones-switch");
  if (!switchPatrones) return;

  switchPatrones.addEventListener("change", (evento) => {
    ejecutarCambioPatronesFondo(evento.target.checked);
  });
}

// A diferencia de activarSwitchApariencia() (Patrones de fondo), este
// switch no pasa por Supabase: demoModeActivo() ya es síncrono, así que
// el valor inicial se pinta de una vez, sin "Cargando…" ni revertir en
// error — activarModoDemo()/desactivarModoDemo() (sección 2) recargan
// la página solas, no hace falta actualizar el DOM desde acá después.
function activarSwitchModoDemo() {
  const switchDemo = document.getElementById("apariencia-demo-switch");
  if (!switchDemo) return;

  switchDemo.checked = demoModeActivo();
  switchDemo.disabled = false;

  switchDemo.addEventListener("change", (evento) => {
    if (evento.target.checked) {
      activarModoDemo();
    } else {
      desactivarModoDemo();
    }
  });
}

// Arma las <option> del selector desde EVENTOS_DISPONIBLES — un futuro
// evento solo agrega una entrada a ese array (sección 7), esta función
// no necesita cambiar.
function poblarSelectEventoAdmin(select) {
  select.innerHTML = "";
  EVENTOS_DISPONIBLES.forEach(({ slug, nombre }) => {
    const option = document.createElement("option");
    option.value = slug;
    option.textContent = nombre;
    select.appendChild(option);
  });
}

// select.dataset.valorGuardado guarda el último valor confirmado en
// Supabase (no el que esté mostrando el <select> en este instante): si
// el guardado falla, esta función lo usa para revertir la selección
// visible — mismo criterio que actualizarUISwitchApariencia(!activo) ya
// usa para el switch de Patrones de fondo.
async function ejecutarCambioEvento(nuevoSlug, valorAnterior) {
  // El <select> nativo ya cambió de valor visualmente (evento "change"
  // dispara después) — hay que revertirlo antes de mostrar modal-demo,
  // igual que ya hace el catch de abajo cuando el guardado real falla.
  if (demoModeActivo()) {
    const select = document.getElementById("apariencia-evento-select");
    if (select) select.value = valorAnterior;
    abrirModalDemo();
    return;
  }

  const select = document.getElementById("apariencia-evento-select");
  if (select) select.disabled = true;

  const referenciaToast = mostrarToastCarga("Guardando cambio de evento…");
  try {
    await escribirValorConfigSitio("tema_evento_activo", nuevoSlug);
    if (select) select.dataset.valorGuardado = nuevoSlug;
    actualizarToastCarga(referenciaToast, {
      tipo: "exito",
      mensaje: "Evento actualizado",
    });
  } catch (error) {
    if (select) select.value = valorAnterior;
    actualizarToastCarga(referenciaToast, {
      tipo: "error",
      mensaje:
        error instanceof ErrorClaveConfigSitioInexistente
          ? error.message
          : "No se pudo guardar. Revisa tu conexión.",
      onReintentar: () => ejecutarCambioEvento(nuevoSlug, valorAnterior),
    });
  } finally {
    if (select) select.disabled = false;
  }
}

async function inicializarSelectorEventoAdmin() {
  const select = document.getElementById("apariencia-evento-select");
  if (!select) return; // no es admin.html

  poblarSelectEventoAdmin(select);

  let valorActual = "ninguno";
  try {
    valorActual = (await leerValorConfigSitio("tema_evento_activo")) || "ninguno";
  } catch {
    valorActual = "ninguno";
  }

  select.value = valorActual;
  select.dataset.valorGuardado = valorActual;
  select.disabled = false;

  select.addEventListener("change", (evento) => {
    const valorAnterior = select.dataset.valorGuardado || "ninguno";
    ejecutarCambioEvento(evento.target.value, valorAnterior);
  });
}

async function inicializarModuloApariencia() {
  const switchPatrones = document.getElementById("apariencia-patrones-switch");
  if (!switchPatrones) return; // no es admin.html

  // Mismo guard que el resto de los módulos: config_sitio se administra
  // desde el panel docente protegido por RLS.
  await promesaGuardPanelDocente;

  let activo = false;
  try {
    activo = (await leerValorConfigSitio("patrones_fondo_activos")) === "true";
  } catch {
    activo = false;
  }

  actualizarUISwitchApariencia(activo);
  switchPatrones.disabled = false;
  activarSwitchApariencia();

  await inicializarSelectorEventoAdmin();

  // Modo Demo no depende de config_sitio ni del guard de arriba (es
  // localStorage puro), pero se inicializa aquí mismo por ser del mismo
  // módulo/tab — así solo hay un punto de entrada para "Apariencia".
  activarSwitchModoDemo();

  // Ya cubierto por el "await promesaGuardPanelDocente" de arriba —
  // mismo guard, mismo módulo/tab, no necesita esperar la promesa otra vez.
  await inicializarSeccionRecompensasAdmin();
}

/* ---------------------------------------------------------
   Fase 13: "🏆 Temas de recompensa" dentro de Apariencia — a diferencia
   de Fondos/Eventos arriba (config_sitio, un valor único global por
   clave), esto es INSERT/DELETE directo en temas_desbloqueados_grupo:
   cada fila es un desbloqueo real para un grupo específico (RLS
   "FOR ALL" con es_docente(), Fase 11 — ya lista, este módulo solo la
   consume). TRIMESTRE_POR_TEMA_RECOMPENSA (Fase 12, sección 7) decide
   el agrupamiento de las 9 filas.
   --------------------------------------------------------- */

// Arma las 3 secciones (Trimestre 1/2/3) con sus 3 filas cada una, UNA
// SOLA VEZ al cargar el módulo — el estado de cada fila (checked/fecha)
// se actualiza aparte (actualizarFilaRecompensaUI, vía
// cargarEstadoRecompensasAdmin) para no reconstruir el DOM —y perder el
// foco/estado disabled de los switches— cada vez que cambia el grupo.
function poblarListaRecompensasAdmin(contenedor) {
  contenedor.innerHTML = "";

  for (let trimestre = 1; trimestre <= 3; trimestre++) {
    const slugsDelTrimestre = Object.entries(TRIMESTRE_POR_TEMA_RECOMPENSA)
      .filter(([, trimestreDelTema]) => trimestreDelTema === trimestre)
      .map(([slug]) => slug);

    const grupoTrimestre = document.createElement("div");
    grupoTrimestre.className = "apariencia-recompensa-grupo";

    const titulo = document.createElement("h4");
    titulo.className = "apariencia-recompensa-grupo__titulo";
    titulo.textContent = "Trimestre " + trimestre;

    const filas = document.createElement("div");
    filas.className = "apariencia-recompensa-grupo__filas";

    slugsDelTrimestre.forEach((slug) => {
      const info = TEMAS_DISPONIBLES.find((t) => t.slug === slug);
      if (!info) return;
      filas.appendChild(crearFilaRecompensaAdmin(slug, info.nombre));
    });

    grupoTrimestre.append(titulo, filas);
    contenedor.appendChild(grupoTrimestre);
  }
}

// Fila individual — mismo componente .apariencia-opcion/.interruptor que
// ya usan Patrones de fondo y Modo Demo arriba, solo que aquí el listener
// de "change" llama a ejecutarCambioTemaRecompensa() en vez de escribir
// directo. "nombre" ya trae el emoji al frente (mismo string de
// TEMAS_DISPONIBLES que usa el selector del alumno, Fase 7/12).
function crearFilaRecompensaAdmin(slug, nombre) {
  const fila = document.createElement("div");
  fila.className = "apariencia-opcion";
  fila.dataset.temaSlug = slug;

  const texto = document.createElement("div");
  texto.className = "apariencia-opcion__texto";
  const tituloId = "apariencia-recompensa-titulo-" + slug;
  const tituloSpan = document.createElement("span");
  tituloSpan.id = tituloId;
  tituloSpan.className = "apariencia-opcion__titulo";
  tituloSpan.textContent = nombre;
  texto.appendChild(tituloSpan);

  const control = document.createElement("div");
  control.className = "apariencia-opcion__control";

  const estado = document.createElement("span");
  estado.className = "apariencia-opcion__estado";
  estado.textContent = "Cargando…";

  const label = document.createElement("label");
  label.className = "interruptor";
  label.setAttribute("aria-labelledby", tituloId);
  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "interruptor__input";
  input.disabled = true;
  const riel = document.createElement("span");
  riel.className = "interruptor__riel";
  riel.setAttribute("aria-hidden", "true");
  label.append(input, riel);

  input.addEventListener("change", (evento) => {
    // input.dataset.desbloqueadoEn: último valor CONFIRMADO (lo deja
    // actualizarFilaRecompensaUI en cada refresco) — es lo que se
    // restaura si Modo Demo intercepta o si el guardado falla, mismo
    // criterio que select.dataset.valorGuardado en ejecutarCambioEvento().
    const valorAnterior = input.dataset.desbloqueadoEn || null;
    const grupoSeleccionado = document.getElementById("apariencia-recompensa-grupo-select")?.value;
    if (grupoSeleccionado) {
      ejecutarCambioTemaRecompensa(slug, evento.target.checked, grupoSeleccionado, valorAnterior);
    }
  });

  control.append(estado, label);
  fila.append(texto, control);
  return fila;
}

// "Bloqueado" o la fecha real de desbloqueo — desbloqueado_en es
// timestamptz con hora, igual que progreso.actualizado_en, así que
// reutiliza formatearFechaHoraCorta() en vez de formatearFecha() (esa
// asume fecha-sola y le concatenaría una "T00:00:00" de más).
function textoEstadoRecompensa(desbloqueadoEn) {
  return desbloqueadoEn ? "Desde " + formatearFechaHoraCorta(desbloqueadoEn) : "Bloqueado";
}

// Repinta UNA fila ya armada por crearFilaRecompensaAdmin() con su
// estado real — "desbloqueadoEn" es el ISO de la columna, o null/"" si
// el tema sigue bloqueado para este grupo. También deja el valor en
// dataset.desbloqueadoEn (ver el listener "change" de arriba).
function actualizarFilaRecompensaUI(slug, desbloqueadoEn) {
  const fila = document.querySelector('.apariencia-opcion[data-tema-slug="' + slug + '"]');
  if (!fila) return;
  const input = fila.querySelector(".interruptor__input");
  const estado = fila.querySelector(".apariencia-opcion__estado");
  if (input) {
    input.checked = !!desbloqueadoEn;
    input.dataset.desbloqueadoEn = desbloqueadoEn || "";
  }
  if (estado) estado.textContent = textoEstadoRecompensa(desbloqueadoEn);
}

// Consulta temas_desbloqueados_grupo para "grupo" — vía obtenerDatos()
// (no clienteSupabase directo) para heredar el mock de Modo Demo ("nada
// desbloqueado", ver DEMO_TABLAS sección 2), exactamente igual que ya
// hace obtenerEstadoDesbloqueoTemas() para el selector del alumno
// (Fase 12) — y repinta las 9 filas ya armadas por
// poblarListaRecompensasAdmin(). Se llama al cargar el módulo y cada vez
// que cambia el <select> de grupo.
async function cargarEstadoRecompensasAdmin(grupo) {
  const select = document.getElementById("apariencia-recompensa-grupo-select");
  const inputs = document.querySelectorAll("#apariencia-recompensa-lista .interruptor__input");
  if (select) select.disabled = true;
  inputs.forEach((input) => (input.disabled = true));

  let filas = [];
  try {
    const { data, error } = await obtenerDatos("temas_desbloqueados_grupo", {
      select: "tema_slug, desbloqueado_en",
      eq: { grupo },
    });
    if (error) throw error;
    filas = data || [];
  } catch {
    filas = [];
  }

  const porSlug = new Map(filas.map((fila) => [fila.tema_slug, fila.desbloqueado_en]));
  Object.keys(TRIMESTRE_POR_TEMA_RECOMPENSA).forEach((slug) => {
    actualizarFilaRecompensaUI(slug, porSlug.get(slug) || null);
  });

  inputs.forEach((input) => (input.disabled = false));
  if (select) select.disabled = false;
}

// Activar → INSERT (grupo, tema_slug) en temas_desbloqueados_grupo;
// desactivar → DELETE de esa fila (deshacer un desbloqueo por error —
// la política RLS "FOR ALL" con es_docente() ya lo permite, Fase 11, sin
// cambios de Supabase). Mismo criterio optimista que
// ejecutarCambioPatronesFondo(): el checkbox nativo ya cambió
// visualmente (evento "change" dispara después), así que hay que
// revertirlo a mano tanto si Modo Demo intercepta como si la escritura
// real falla — "valorAnterior" (capturado por el listener antes de
// llamar aquí) es lo que se restaura en ambos casos.
async function ejecutarCambioTemaRecompensa(slug, activo, grupo, valorAnterior) {
  if (demoModeActivo()) {
    actualizarFilaRecompensaUI(slug, valorAnterior);
    abrirModalDemo();
    return;
  }

  const fila = document.querySelector('.apariencia-opcion[data-tema-slug="' + slug + '"]');
  const input = fila?.querySelector(".interruptor__input");
  if (input) input.disabled = true;

  const referenciaToast = mostrarToastCarga(activo ? "Desbloqueando tema…" : "Bloqueando tema de nuevo…");
  try {
    if (activo) {
      const { data, error } = await clienteSupabase
        .from("temas_desbloqueados_grupo")
        .insert({ grupo, tema_slug: slug })
        .select("desbloqueado_en")
        .single();
      if (error) throw error;
      actualizarFilaRecompensaUI(slug, data.desbloqueado_en);
    } else {
      const { error } = await clienteSupabase
        .from("temas_desbloqueados_grupo")
        .delete()
        .eq("grupo", grupo)
        .eq("tema_slug", slug);
      if (error) throw error;
      actualizarFilaRecompensaUI(slug, null);
    }
    actualizarToastCarga(referenciaToast, {
      tipo: "exito",
      mensaje: activo ? "Tema desbloqueado" : "Tema bloqueado de nuevo",
    });
  } catch (error) {
    actualizarFilaRecompensaUI(slug, valorAnterior);
    actualizarToastCarga(referenciaToast, {
      tipo: "error",
      mensaje: "No se pudo guardar. Revisa tu conexión.",
      onReintentar: () => ejecutarCambioTemaRecompensa(slug, activo, grupo, valorAnterior),
    });
  } finally {
    if (input) input.disabled = false;
  }
}

async function inicializarSeccionRecompensasAdmin() {
  const contenedor = document.getElementById("apariencia-recompensa-lista");
  const select = document.getElementById("apariencia-recompensa-grupo-select");
  if (!contenedor || !select) return; // no es admin.html

  poblarListaRecompensasAdmin(contenedor);
  await cargarEstadoRecompensasAdmin(select.value);

  select.addEventListener("change", () => cargarEstadoRecompensasAdmin(select.value));
}

/* ---------------------------------------------------------
   Módulo "Fechas de entrega" (tab-fechas) — primera parte: listado,
   filtros, editar fecha individual y quitar override. El recorrido
   masivo es un módulo aparte (no implementado aquí).

   obtenerTareas/Actividades/Proyectos() ya devuelven el valor EFECTIVO
   (con cualquier override ya aplicado encima), pero no dicen si ese
   valor vino de fechas_override o del original — por eso este módulo
   consulta fechas_override directamente, en vez de solo apoyarse en esas
   funciones, para saber qué mostrar en la columna "Origen" y cuándo
   ofrecer "Quitar override".
   --------------------------------------------------------- */

const estadoFechas = { trimestre: null, tipo: "tarea", secuencia: null };

// { items, campoFecha } de la última tabla pintada — el recorrido
// masivo (más abajo) lo reutiliza directamente en vez de volver a
// consultar, para operar exactamente sobre lo que el docente ve en
// pantalla en el momento de pedir la vista previa.
let ultimoRenderFechas = { items: [], campoFecha: null };

// { dias, filas } de la vista previa actualmente mostrada en
// #modal-recorrido-fechas, o null si no hay ninguna abierta — "filas"
// es el array de { item, grupo, fechaActual, fechaNueva } que
// aplicarRecorridoFechas() realmente escribe al confirmar.
let recorridoPendiente = null;

// Mismo campo por tipo que ya usan resolverFechaItem()/fechaLimiteISO()/
// aplicarOverridesFechas() (fecha para actividades, fechaEntrega para
// tareas y proyectos) — no se duplica esa lógica, solo se referencia.
const CAMPO_FECHA_POR_TIPO = { tarea: "fechaEntrega", actividad: "fecha", proyecto: "fechaEntrega" };

function claveSecuenciaFechas(item) {
  return item.secuencia || "Sin secuencia";
}

async function obtenerEntregablesFechas(tipo, trimestre) {
  if (tipo === "tarea") return obtenerTareas(trimestre);
  if (tipo === "actividad") return obtenerActividades(trimestre);
  return obtenerProyectos(trimestre);
}

// Recalcula las opciones del <select> de secuencia a partir de los
// entregables del trimestre/tipo actualmente elegidos — mismo criterio
// que actualizarOpcionesSecuenciaCalificacion() (orden de aparición en
// los datos, no alfabético; conserva la selección previa si sigue
// siendo válida).
async function actualizarOpcionesSecuenciaFechas() {
  const select = document.getElementById("fechas-filtro-secuencia");
  if (!select) return;

  const items = await obtenerEntregablesFechas(estadoFechas.tipo, estadoFechas.trimestre);

  const vistas = new Set();
  const opciones = [];
  items.forEach((item) => {
    const clave = claveSecuenciaFechas(item);
    if (!vistas.has(clave)) {
      vistas.add(clave);
      opciones.push(clave);
    }
  });

  const valorPrevio = estadoFechas.secuencia;
  select.innerHTML = "";
  opciones.forEach((clave) => {
    const opcion = document.createElement("option");
    opcion.value = clave;
    opcion.textContent = clave;
    select.appendChild(opcion);
  });

  estadoFechas.secuencia = opciones.includes(valorPrevio) ? valorPrevio : opciones[0] || null;
  select.value = estadoFechas.secuencia || "";
}

// Consulta DIRECTA a fechas_override (no vía aplicarOverridesFechas):
// item_id -> filas de override de ese item, para el trimestre/tipo
// actuales. Puede haber hasta 3 filas por item (grupo "3C", "3E" y/o
// "todos" — ver la restricción única de la tabla).
async function obtenerOverridesPorItem(trimestre, tipo) {
  const mapa = new Map();

  // Modo Demo (Fase 6): mismo criterio que aplicarOverridesFechas() —
  // pasa por obtenerDatos() en vez de clienteSupabase directo.
  const { data, error } = await obtenerDatos("fechas_override", {
    eq: { trimestre: Number(trimestre), tipo },
  });

  if (error || !data) return mapa;

  data.forEach((fila) => {
    if (!mapa.has(fila.item_id)) mapa.set(fila.item_id, []);
    mapa.get(fila.item_id).push(fila);
  });
  return mapa;
}

// Texto de la columna "Grupo": para items de un grupo específico,
// "3°C: <fecha>"; para grupo:"todos" con fecha por grupo, las dos
// separadas por "·" — mismo formato que ya usa resolverFechaItem() para
// "todos", extendido también al caso de un solo grupo para que la
// columna sea autodescriptiva sin depender de otra columna aparte.
function celdaGrupoFecha(item, campoFecha) {
  const valor = item[campoFecha];
  if (typeof valor === "string") return textoGrupo(item.grupo) + ": " + formatearFecha(valor);
  return "3°C: " + formatearFecha(valor["3C"]) + " · 3°E: " + formatearFecha(valor["3E"]);
}

// Texto de la columna "Origen". Para items de grupo específico es
// binario (Original/Override); para grupo:"todos" con fecha por grupo,
// si SOLO uno de los 2 grupos tiene override activo se desglosa por
// grupo ("3°C: Original · 3°E: 🖊️ Override") en vez de un genérico
// "🖊️ Override" para todo el item — con la columna "Grupo" ya mostrando
// dos fechas distintas, un solo badge no diría cuál de las dos es la
// modificada. Una fila de override grupo:"todos" (si existiera, aunque
// este módulo no la crea) cuenta como override para ambos grupos, igual
// que ya hace aplicarOverridesFechas().
function origenTextoItem(item, campoFecha, overridesDelItem) {
  const filas = overridesDelItem || [];
  const valor = item[campoFecha];

  if (typeof valor === "string") {
    const tieneOverride = filas.some((fila) => fila.grupo === item.grupo || fila.grupo === "todos");
    return tieneOverride ? "🖊️ Override" : "Original";
  }

  const overrideEn3C = filas.some((fila) => fila.grupo === "3C" || fila.grupo === "todos");
  const overrideEn3E = filas.some((fila) => fila.grupo === "3E" || fila.grupo === "todos");

  if (overrideEn3C && overrideEn3E) return "🖊️ Override";
  if (!overrideEn3C && !overrideEn3E) return "Original";
  return "3°C: " + (overrideEn3C ? "🖊️ Override" : "Original") + " · 3°E: " + (overrideEn3E ? "🖊️ Override" : "Original");
}

function crearFilaFecha(item, campoFecha, overridesDelItem) {
  const fila = document.createElement("tr");

  const celdaEntregable = document.createElement("td");
  celdaEntregable.textContent = item.titulo;
  fila.appendChild(celdaEntregable);

  const celdaGrupo = document.createElement("td");
  celdaGrupo.textContent = celdaGrupoFecha(item, campoFecha);
  fila.appendChild(celdaGrupo);

  const celdaOrigen = document.createElement("td");
  celdaOrigen.textContent = origenTextoItem(item, campoFecha, overridesDelItem);
  fila.appendChild(celdaOrigen);

  const celdaAcciones = document.createElement("td");
  celdaAcciones.className = "fechas-tabla__acciones";

  const botonEditar = document.createElement("button");
  botonEditar.type = "button";
  botonEditar.className = "boton-secundario";
  botonEditar.textContent = "Editar";
  botonEditar.addEventListener("click", () => abrirModalEditarFecha(item, campoFecha, fila));
  celdaAcciones.appendChild(botonEditar);

  if (overridesDelItem && overridesDelItem.length > 0) {
    const botonQuitar = document.createElement("button");
    botonQuitar.type = "button";
    botonQuitar.className = "fechas-tabla__boton-quitar";
    botonQuitar.textContent = "Quitar override";
    botonQuitar.addEventListener("click", () => quitarOverrideFecha(item, campoFecha, fila));
    celdaAcciones.appendChild(botonQuitar);
  }

  fila.appendChild(celdaAcciones);
  return fila;
}

function construirTablaFechas(items, campoFecha, overridesPorItem) {
  const tabla = document.createElement("table");
  tabla.className = "tabla-fechas";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ["Entregable", "Grupo", "Origen", "Acciones"].forEach((texto) => {
    const th = document.createElement("th");
    th.textContent = texto;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  items.forEach((item) => {
    tbody.appendChild(crearFilaFecha(item, campoFecha, overridesPorItem.get(item.id)));
  });
  tabla.appendChild(tbody);

  return tabla;
}

async function renderizarTablaFechas() {
  const contenedor = document.getElementById("fechas-tabla-contenedor");
  if (!contenedor) return;

  mostrarSinResultados(contenedor, "Cargando…");

  const campoFecha = CAMPO_FECHA_POR_TIPO[estadoFechas.tipo];
  const [items, overridesPorItem] = await Promise.all([
    obtenerEntregablesFechas(estadoFechas.tipo, estadoFechas.trimestre),
    obtenerOverridesPorItem(estadoFechas.trimestre, estadoFechas.tipo),
  ]);

  const itemsFiltrados = items.filter((item) => claveSecuenciaFechas(item) === estadoFechas.secuencia);

  // El recorrido masivo (más abajo) opera sobre exactamente los items
  // que están en pantalla en este momento, así que se guardan aquí en
  // vez de que el botón "Vista previa" dispare su propia consulta —
  // evita que la vista previa se desalinee de lo que el docente
  // realmente está viendo al hacer clic.
  ultimoRenderFechas = { items: itemsFiltrados, campoFecha };
  actualizarEstadoBotonVistaPreviaRecorrido();

  if (itemsFiltrados.length === 0) {
    mostrarSinResultados(contenedor, "No hay entregables para este filtro.");
    return;
  }

  contenedor.innerHTML = "";
  contenedor.appendChild(construirTablaFechas(itemsFiltrados, campoFecha, overridesPorItem));
}

// Vuelve a leer SOLO este item (con aplicarOverridesFechas ya aplicado
// vía obtenerEntregablesFechas, más su estado de override fresco) y
// reemplaza su fila, sin recargar el resto de la tabla. Relee el item
// completo desde obtenerTareas/Actividades/Proyectos en vez de partir
// de la fila ya pintada: tras "Quitar override" ya no hay ninguna fila
// en fechas_override, y aplicarOverridesFechas() devuelve el array tal
// cual cuando no encuentra overrides — si se partiera del valor ya
// pintado (posiblemente ya con override aplicado antes), no habría
// forma de "restar" ese override para volver al original.
async function refrescarFilaFecha(itemId, campoFecha, filaAnterior) {
  const [items, overridesPorItem] = await Promise.all([
    obtenerEntregablesFechas(estadoFechas.tipo, estadoFechas.trimestre),
    obtenerOverridesPorItem(estadoFechas.trimestre, estadoFechas.tipo),
  ]);

  const itemFresco = items.find((item) => String(item.id) === String(itemId));
  if (!itemFresco) {
    filaAnterior.remove();
    return;
  }

  filaAnterior.replaceWith(crearFilaFecha(itemFresco, campoFecha, overridesPorItem.get(itemId)));

  // ultimoRenderFechas.items también debe quedar al día: si no se
  // actualizara aquí, el recorrido masivo (que reutiliza ese array tal
  // cual, sin volver a consultar) partiría del valor viejo de este item
  // hasta el próximo cambio de filtro — justo el caso que debe evitar
  // ("el recorrido calcula desde el valor efectivo, considerando
  // overrides ya existentes").
  const indice = ultimoRenderFechas.items.findIndex((item) => String(item.id) === String(itemId));
  if (indice !== -1) ultimoRenderFechas.items[indice] = itemFresco;
}

// { item, campoFecha, fila, camposIniciales, cambios } del item
// actualmente en edición, o null cuando no hay ningún dialog de Fechas
// abierto — camposIniciales guarda el valor ISO con el que se abrió el
// dialog por grupo, para poder detectar cuáles campos cambiaron de
// verdad al guardar.
let fechaEditando = null;

// Arma #fechas-editar-campos: 1 campo de fecha si el item es de un
// grupo específico, 2 (uno por grupo) si es grupo:"todos" con fecha por
// grupo. Devuelve el valor inicial por grupo para poder diffear en el
// submit.
function construirCamposEditarFecha(item, campoFecha) {
  const contenedor = document.getElementById("fechas-editar-campos");
  contenedor.innerHTML = "";

  const valor = item[campoFecha];
  const camposIniciales = {};
  const grupos = typeof valor === "string" ? [item.grupo] : ["3C", "3E"];

  grupos.forEach((grupo) => {
    const valorGrupo = typeof valor === "string" ? valor : valor[grupo];
    camposIniciales[grupo] = valorGrupo;

    const label = document.createElement("label");
    label.setAttribute("for", "fechas-editar-fecha-" + grupo);
    label.textContent = grupos.length > 1 ? "Fecha de entrega — " + textoGrupo(grupo) : "Fecha de entrega";
    contenedor.appendChild(label);

    const input = document.createElement("input");
    input.type = "date";
    input.id = "fechas-editar-fecha-" + grupo;
    input.dataset.grupo = grupo;
    input.value = valorGrupo;
    input.required = true;
    contenedor.appendChild(input);
  });

  return camposIniciales;
}

function abrirModalEditarFecha(item, campoFecha, fila) {
  const modal = document.getElementById("modal-editar-fecha");
  if (!modal) return;

  document.getElementById("modal-editar-fecha-contexto").textContent = item.titulo;
  const camposIniciales = construirCamposEditarFecha(item, campoFecha);
  document.getElementById("fechas-editar-error").hidden = true;

  fechaEditando = { item, campoFecha, fila, camposIniciales, cambios: null };
  modal.showModal();
}

// "Guardar cambios" no guarda directo: arma el diff (solo los campos que
// de verdad cambiaron respecto a camposIniciales) y abre
// #modal-confirmar-fecha con el mensaje pedido — mismo patrón de doble
// confirmación que el módulo Trimestre. Si no hay ningún campo
// modificado, cierra sin abrir nada (no tiene sentido "confirmar" un
// no-cambio).
function activarFormularioEditarFecha() {
  const modal = document.getElementById("modal-editar-fecha");
  const formulario = document.getElementById("formulario-editar-fecha");
  if (!modal || !formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (demoModeActivo()) {
      await cerrarDialogoAnimado(modal);
      abrirModalDemo();
      return;
    }
    if (!fechaEditando) return;

    const cambios = [];
    formulario.querySelectorAll("input[type=date]").forEach((input) => {
      const grupo = input.dataset.grupo;
      const valorNuevo = input.value;
      if (valorNuevo && valorNuevo !== fechaEditando.camposIniciales[grupo]) {
        cambios.push({ grupo, fecha: valorNuevo });
      }
    });

    if (cambios.length === 0) {
      cerrarDialogoAnimado(modal);
      fechaEditando = null;
      return;
    }

    fechaEditando.cambios = cambios;

    const grupos = cambios.map((cambio) => textoGrupo(cambio.grupo)).join(" y ");
    document.getElementById("fechas-confirmar-texto").textContent =
      'Vas a modificar la fecha de "' + fechaEditando.item.titulo + '" para ' + grupos + ". ¿Confirmas?";
    document.getElementById("fechas-confirmar-error").hidden = true;
    document.getElementById("modal-confirmar-fecha").showModal();
  });

  document.getElementById("fechas-editar-cancelar").addEventListener("click", () => {
    formulario.reset();
    cerrarDialogoAnimado(modal);
    fechaEditando = null;
  });

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", () => {
      formulario.reset();
      cerrarDialogoAnimado(modal);
      fechaEditando = null;
    });
  }

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      formulario.reset();
      cerrarDialogoAnimado(modal);
      fechaEditando = null;
    }
  });
}

// Upsert real en fechas_override, uno por cada campo cambiado (clave
// única trimestre+tipo+item_id+grupo: Supabase decide insert vs. update
// según si ya existe fila para esa combinación). creado_por va en
// ambos casos, tal como se pidió.
async function guardarCambiosFecha() {
  const { trimestre, tipo } = estadoFechas;
  const { item, cambios } = fechaEditando;

  const {
    data: { session },
  } = await clienteSupabase.auth.getSession();

  for (const cambio of cambios) {
    const { error } = await clienteSupabase.from("fechas_override").upsert(
      {
        trimestre: Number(trimestre),
        tipo,
        item_id: item.id,
        grupo: cambio.grupo,
        fecha: cambio.fecha,
        creado_por: session?.user?.id ?? null,
      },
      { onConflict: "trimestre,tipo,item_id,grupo" }
    );
    if (error) throw error;
  }
}

function activarConfirmarFecha() {
  const modalConfirmar = document.getElementById("modal-confirmar-fecha");
  const modalEditar = document.getElementById("modal-editar-fecha");
  const errorConfirmar = document.getElementById("fechas-confirmar-error");
  const botonConfirmar = document.getElementById("fechas-confirmar-confirmar");
  if (!modalConfirmar || !modalEditar || !botonConfirmar) return;

  botonConfirmar.addEventListener("click", async () => {
    if (!fechaEditando || !fechaEditando.cambios) return;

    errorConfirmar.hidden = true;
    botonConfirmar.disabled = true;
    try {
      await guardarCambiosFecha();

      const { item, campoFecha, fila } = fechaEditando;
      cerrarDialogoAnimado(modalConfirmar);
      cerrarDialogoAnimado(modalEditar);
      document.getElementById("formulario-editar-fecha").reset();
      await refrescarFilaFecha(item.id, campoFecha, fila);
      fechaEditando = null;
    } catch (error) {
      errorConfirmar.textContent = "No se pudo guardar el cambio: " + (error?.message || "intenta de nuevo.");
      errorConfirmar.hidden = false;
    } finally {
      botonConfirmar.disabled = false;
    }
  });

  document.getElementById("fechas-confirmar-cancelar").addEventListener("click", () => cerrarDialogoAnimado(modalConfirmar));

  const botonCerrar = modalConfirmar.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) botonCerrar.addEventListener("click", () => cerrarDialogoAnimado(modalConfirmar));

  modalConfirmar.addEventListener("click", (evento) => {
    if (evento.target === modalConfirmar) cerrarDialogoAnimado(modalConfirmar);
  });
}

// DELETE de TODAS las filas de fechas_override de este item (los 2
// grupos si aplica, no solo uno visible en pantalla): "quitar override"
// es una reversión completa al dato original de main.js, no una
// reversión parcial.
async function quitarOverrideFecha(item, campoFecha, fila) {
  if (demoModeActivo()) {
    abrirModalDemo();
    return;
  }
  if (!window.confirm('Esto regresará la fecha de "' + item.titulo + '" a su valor original. ¿Confirmas?')) return;

  try {
    const { error } = await clienteSupabase
      .from("fechas_override")
      .delete()
      .eq("trimestre", Number(estadoFechas.trimestre))
      .eq("tipo", estadoFechas.tipo)
      .eq("item_id", item.id);
    if (error) throw error;
  } catch (error) {
    window.alert("No se pudo quitar el override: " + (error?.message || "intenta de nuevo."));
    return;
  }

  await refrescarFilaFecha(item.id, campoFecha, fila);
}

/* ---------------------------------------------------------
   Recorrido masivo: mueve TODAS las fechas de ultimoRenderFechas.items
   (los items visibles en la tabla actual, ya con overrides existentes
   aplicados) ±X días de una sola vez, con vista previa obligatoria.
   --------------------------------------------------------- */

function sumarDiasISO(fechaISO, dias) {
  const fecha = new Date(fechaISO + "T00:00:00");
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

// Una fila por cada fecha afectada (1 por item de grupo específico, 2
// por item grupo:"todos" con fecha por grupo) — parte de la fecha
// EFECTIVA ya en pantalla (items ya trae cualquier override existente
// aplicado vía obtenerEntregablesFechas), no del original de main.js.
function construirFilasRecorrido(items, campoFecha, dias) {
  const filas = [];
  items.forEach((item) => {
    const valor = item[campoFecha];
    const grupos = typeof valor === "string" ? [item.grupo] : ["3C", "3E"];
    grupos.forEach((grupo) => {
      const fechaActual = typeof valor === "string" ? valor : valor[grupo];
      filas.push({ item, grupo, fechaActual, fechaNueva: sumarDiasISO(fechaActual, dias) });
    });
  });
  return filas;
}

function construirTablaRecorrido(filas) {
  const tabla = document.createElement("table");
  tabla.className = "tabla-fechas";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ["Entregable", "Grupo", "Fecha actual → Fecha nueva"].forEach((texto) => {
    const th = document.createElement("th");
    th.textContent = texto;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  filas.forEach((fila) => {
    const tr = document.createElement("tr");

    const celdaEntregable = document.createElement("td");
    celdaEntregable.textContent = fila.item.titulo;
    tr.appendChild(celdaEntregable);

    const celdaGrupo = document.createElement("td");
    celdaGrupo.textContent = textoGrupo(fila.grupo);
    tr.appendChild(celdaGrupo);

    const celdaTransicion = document.createElement("td");
    celdaTransicion.textContent = formatearFecha(fila.fechaActual) + " → " + formatearFecha(fila.fechaNueva);
    tr.appendChild(celdaTransicion);

    tbody.appendChild(tr);
  });
  tabla.appendChild(tbody);

  return tabla;
}

// "Vista previa" deshabilitado si el campo está vacío, en 0, o si la
// tabla actual no tiene ningún item que mover (filtro sin resultados).
function actualizarEstadoBotonVistaPreviaRecorrido() {
  const input = document.getElementById("fechas-recorrido-dias");
  const boton = document.getElementById("fechas-recorrido-vista-previa");
  if (!input || !boton) return;

  const dias = Number(input.value);
  boton.disabled = input.value === "" || dias === 0 || Number.isNaN(dias) || ultimoRenderFechas.items.length === 0;
}

function activarRecorridoFechas() {
  const input = document.getElementById("fechas-recorrido-dias");
  const botonVistaPrevia = document.getElementById("fechas-recorrido-vista-previa");
  const modal = document.getElementById("modal-recorrido-fechas");
  if (!input || !botonVistaPrevia || !modal) return;

  input.addEventListener("input", actualizarEstadoBotonVistaPreviaRecorrido);

  botonVistaPrevia.addEventListener("click", () => {
    if (demoModeActivo()) {
      abrirModalDemo();
      return;
    }
    const dias = Number(input.value);
    if (!dias) return;

    const filas = construirFilasRecorrido(ultimoRenderFechas.items, ultimoRenderFechas.campoFecha, dias);
    recorridoPendiente = { dias, filas };

    document.getElementById("modal-recorrido-fechas-contexto").textContent =
      (dias > 0 ? "+" : "") + dias + " día(s) — " + filas.length + " fecha(s) afectada(s) en esta secuencia.";

    const contenedorTabla = document.getElementById("fechas-recorrido-tabla-contenedor");
    contenedorTabla.innerHTML = "";
    contenedorTabla.appendChild(construirTablaRecorrido(filas));

    document.getElementById("fechas-recorrido-error").hidden = true;
    modal.showModal();
  });

  document.getElementById("fechas-recorrido-cancelar").addEventListener("click", () => {
    cerrarDialogoAnimado(modal);
    recorridoPendiente = null;
  });

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", () => {
      cerrarDialogoAnimado(modal);
      recorridoPendiente = null;
    });
  }

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      cerrarDialogoAnimado(modal);
      recorridoPendiente = null;
    }
  });
}

// Upsert uno por uno (mismo criterio de fechas_override que
// guardarCambiosFecha: clave única trimestre+tipo+item_id+grupo decide
// insert vs. update) — sin transacción: si alguno falla, los anteriores
// ya quedaron aplicados de verdad en la base, así que se sigue con el
// resto en vez de abortar, y se reporta al final cuáles fallaron.
async function aplicarRecorridoFechas() {
  const errorEl = document.getElementById("fechas-recorrido-error");
  const botonConfirmar = document.getElementById("fechas-recorrido-confirmar");
  if (!recorridoPendiente) return;

  errorEl.hidden = true;
  botonConfirmar.disabled = true;

  const { trimestre, tipo } = estadoFechas;
  const { dias, filas } = recorridoPendiente;
  const nota = "Movido por recorrido masivo (" + (dias > 0 ? "+" : "") + dias + " días)";

  const {
    data: { session },
  } = await clienteSupabase.auth.getSession();

  const fallidas = [];
  for (const fila of filas) {
    try {
      const { error } = await clienteSupabase.from("fechas_override").upsert(
        {
          trimestre: Number(trimestre),
          tipo,
          item_id: fila.item.id,
          grupo: fila.grupo,
          fecha: fila.fechaNueva,
          nota,
          creado_por: session?.user?.id ?? null,
        },
        { onConflict: "trimestre,tipo,item_id,grupo" }
      );
      if (error) throw error;
    } catch (error) {
      fallidas.push({ titulo: fila.item.titulo, grupo: fila.grupo, mensaje: error?.message || "error desconocido" });
    }
  }

  botonConfirmar.disabled = false;

  // Éxito total: cierra, limpia el campo y refresca TODA la tabla (a
  // diferencia de refrescarFilaFecha en la edición individual, aquí
  // cambiaron todos los items visibles, no solo uno).
  if (fallidas.length === 0) {
    cerrarDialogoAnimado(document.getElementById("modal-recorrido-fechas"));
    document.getElementById("fechas-recorrido-dias").value = "";
    recorridoPendiente = null;
    await renderizarTablaFechas();
    return;
  }

  // Falla total o parcial: el dialog se queda abierto con el detalle de
  // qué sí y qué no se aplicó (los que sí ya quedaron escritos, por
  // eso se refresca la tabla igual) — no hay rollback, solo un mensaje
  // claro del estado real.
  const totalOk = filas.length - fallidas.length;
  errorEl.textContent =
    "Se aplicaron " +
    totalOk +
    " de " +
    filas.length +
    " fecha(s). Fallaron: " +
    fallidas.map((f) => f.titulo + " (" + textoGrupo(f.grupo) + "): " + f.mensaje).join("; ");
  errorEl.hidden = false;
  await renderizarTablaFechas();
}

function activarConfirmarRecorridoFechas() {
  const boton = document.getElementById("fechas-recorrido-confirmar");
  if (!boton) return;
  boton.addEventListener("click", aplicarRecorridoFechas);
}

async function inicializarModuloFechas() {
  const contenedor = document.getElementById("fechas-tabla-contenedor");
  if (!contenedor) return; // no es admin.html

  // Mismo guard que el resto de módulos del panel: fechas_override
  // también se administra protegido por RLS.
  await promesaGuardPanelDocente;

  const selectTrimestre = document.getElementById("fechas-filtro-trimestre");
  estadoFechas.trimestre = String(trimestreDesbloqueado);
  selectTrimestre.value = estadoFechas.trimestre;

  await actualizarOpcionesSecuenciaFechas();
  await renderizarTablaFechas();
  activarFormularioEditarFecha();
  activarConfirmarFecha();
  activarRecorridoFechas();
  activarConfirmarRecorridoFechas();

  selectTrimestre.addEventListener("change", async () => {
    estadoFechas.trimestre = selectTrimestre.value;
    await actualizarOpcionesSecuenciaFechas();
    await renderizarTablaFechas();
  });

  const selectTipo = document.getElementById("fechas-filtro-tipo");
  selectTipo.addEventListener("change", async () => {
    estadoFechas.tipo = selectTipo.value;
    await actualizarOpcionesSecuenciaFechas();
    await renderizarTablaFechas();
  });

  const selectSecuencia = document.getElementById("fechas-filtro-secuencia");
  selectSecuencia.addEventListener("change", async () => {
    estadoFechas.secuencia = selectSecuencia.value;
    await renderizarTablaFechas();
  });
}

/* ---------------------------------------------------------
   Módulo "Evaluación" (tab-evaluacion)

   Captura la calificación numérica (0.0–10.0) de entregas YA
   realizadas. Reutiliza toda la consulta de datos del módulo
   Calificación y progreso (obtenerAlumnosParaCalificacion,
   obtenerEntregablesPorTipo, obtenerMapaProgresoCalificacion,
   claveSecuenciaDeEntregable, ICONO_TIPO_ENTREGABLE) y su misma clase
   de tabla (.tabla-calificacion y compañía, ver css/style.css) para
   idéntica estructura visual — pero con su propio estado de filtros,
   su propia consulta de secuencia y su propia navegación de scroll
   móvil (copias adaptadas, en vez de darle una segunda responsabilidad
   a las de Calificación, que están acopladas a sus propios ids de
   DOM). El contenido de cada celda es un eje distinto al de
   pintarBadgeCalificacion: aquí importa si HAY calificación numérica,
   no el estado de entrega en sí.
   --------------------------------------------------------- */

const estadoEvaluacion = { trimestre: null, grupo: "todos", tipo: "todos", secuencia: null };

// "captura" (tabla individual, la de siempre), "promedios" (tabla
// concentrada de un trimestre) o "final" (calificación final del ciclo,
// combinando los 3) — decide cuál de las 3 tablas refrescan los cambios
// de Trimestre/Grupo (ver activarVistasEvaluacion()).
let vistaEvaluacionActiva = "captura";

// Copia adaptada de actualizarOpcionesSecuenciaCalificacion(), apuntando
// a estadoEvaluacion/#evaluacion-filtro-secuencia — la original está
// acoplada a estadoCalificacion y no se toca (módulo Calificación y
// progreso fuera de alcance).
async function actualizarOpcionesSecuenciaEvaluacion() {
  const select = document.getElementById("evaluacion-filtro-secuencia");
  if (!select) return;

  const entregables = await obtenerEntregablesPorTipo(estadoEvaluacion.tipo, estadoEvaluacion.trimestre);

  const vistas = new Set();
  const opciones = [];
  entregables.forEach((item) => {
    const clave = claveSecuenciaDeEntregable(item);
    if (!vistas.has(clave)) {
      vistas.add(clave);
      opciones.push(clave);
    }
  });

  const valorPrevio = estadoEvaluacion.secuencia;
  select.innerHTML = "";
  opciones.forEach((clave) => {
    const opcion = document.createElement("option");
    opcion.value = clave;
    opcion.textContent = clave;
    select.appendChild(opcion);
  });

  estadoEvaluacion.secuencia = opciones.includes(valorPrevio) ? valorPrevio : opciones[0] || null;
  select.value = estadoEvaluacion.secuencia || "";
}

// Modo Demo (Fase 4): "formato" es "numero" (default, comportamiento de
// siempre) o "emoji" — alterna vía el switch global en
// .admin-header__acciones (ver formatoCalificacionActivo/
// activarSwitchFormatoCalificacion más abajo), solo visible en modo
// demo. rangoPromedio() (más abajo, function hoisted) ya define los
// umbrales reales (UMBRAL_PROMEDIO_APROBATORIO/BUEN_NIVEL) que también
// usa crearChipRangoPromedio() — se reutiliza tal cual para que el chip
// y el emoji nunca puedan desalinearse por tener dos fuentes de umbral
// distintas. valor null/undefined es "sin calificar": mismo "—" en
// ambos formatos, nunca un emoji falso de calificación.
const EMOJI_RANGO_CALIFICACION = { aprobado: "✅", riesgo: "⚠️", reprobado: "❌" };

function formatearCalificacion(valor, formato = "numero") {
  if (valor == null) return "—";
  if (formato === "emoji") return EMOJI_RANGO_CALIFICACION[rangoPromedio(Number(valor))];
  return Number(valor).toFixed(1);
}

// "sin-cuenta"/"pendiente"/"atrasada": mismo criterio que
// pintarBadgeCalificacion (itemEstaVencido) — nada que calificar todavía.
// "sin-calificar": entregó pero calificacion es null. "calificada": entregó
// y ya tiene calificacion (sin importar el origen de la entrega, formulario
// o manual-docente).
function estadoCeldaEvaluacion(sinCuenta, filaProgreso, item, alumno) {
  if (sinCuenta) return "sin-cuenta";
  if (!filaProgreso || !filaProgreso.completado) {
    return itemEstaVencido(item.tipoEntregable, item, alumno.grupo) ? "atrasada" : "pendiente";
  }
  return filaProgreso.calificacion == null ? "sin-calificar" : "calificada";
}

// Repinta una celda según su estado actual — mismo patrón que
// pintarBadgeCalificacion (recibe el contenedor + contexto completo, se
// puede volver a llamar tras guardar para repintar SOLO esa celda sin
// reconstruir toda la tabla).
function pintarCeldaEvaluacion(contenedor, contexto) {
  const { alumno, item, trimestre, filaProgreso, sinCuenta, mapaProgreso, claveMapaProgreso } = contexto;
  contenedor.innerHTML = "";

  const estado = estadoCeldaEvaluacion(sinCuenta, filaProgreso, item, alumno);

  if (estado === "sin-cuenta" || estado === "pendiente" || estado === "atrasada") {
    const span = document.createElement("span");
    span.className = "evaluacion-tabla__sin-entrega";
    span.textContent = estado === "sin-cuenta" ? "🚫" : estado === "pendiente" ? "🟡" : "🔒";
    contenedor.appendChild(span);
    return;
  }

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "badge-calificacion";
  boton.dataset.estado = estado;
  boton.textContent = "🟢 " + (estado === "calificada" ? formatearCalificacion(filaProgreso.calificacion, formatoCalificacionActivo) : "Sin calificar");
  boton.addEventListener("click", () => {
    abrirModalCalificar({
      alumno,
      item,
      filaProgreso,
      alGuardar: (nuevaFila) => {
        if (mapaProgreso && claveMapaProgreso) mapaProgreso.set(claveMapaProgreso, nuevaFila);
        pintarCeldaEvaluacion(contenedor, { ...contexto, filaProgreso: nuevaFila });
      },
    });
  });
  contenedor.appendChild(boton);
}

function crearCeldaEvaluacion(alumno, item, filaProgreso, sinCuenta, trimestre, mapaProgreso) {
  const celda = document.createElement("td");
  celda.className = "calificacion-tabla__celda tabla-calificacion__col-item";

  const claveMapaProgreso = alumno.auth_user_id + "-" + item.tipoEntregable + "-" + item.id;
  pintarCeldaEvaluacion(celda, { alumno, item, trimestre, filaProgreso, sinCuenta, mapaProgreso, claveMapaProgreso });

  return celda;
}

// Misma estructura de fila que crearFilaAlumnoCalificacion (celda de
// alumno + una celda por entregable), sin el botón "Ver historial
// completo" ni la columna "Avance": ninguno de los dos se pidió para
// este módulo (el resumen numérico del trimestre es el Prompt 12b,
// aparte).
function crearFilaAlumnoEvaluacion(alumno, entregables, mapaProgreso, trimestre) {
  const fila = document.createElement("tr");
  if (alumno.activo === false) fila.classList.add("fila-alumno--inactivo");

  fila.dataset.nombreBusqueda = normalizarParaBusqueda(alumno.nombre);
  fila.dataset.numeroLista = String(alumno.numero_lista);

  const celdaAlumno = document.createElement("td");
  celdaAlumno.className = "tabla-calificacion__col-fija";
  const envoltura = document.createElement("div");
  envoltura.className = "calificacion-tabla__alumno";
  const nombre = document.createElement("span");
  nombre.className = "calificacion-tabla__alumno-nombre";
  nombre.textContent = alumno.nombre;
  const numero = document.createElement("span");
  numero.className = "calificacion-tabla__alumno-numero";
  numero.textContent = "N.° " + alumno.numero_lista;
  envoltura.append(nombre, numero);
  celdaAlumno.appendChild(envoltura);
  fila.appendChild(celdaAlumno);

  const sinCuenta = alumno.usado === false || !alumno.auth_user_id;

  entregables.forEach((item) => {
    const filaProgreso = sinCuenta
      ? null
      : mapaProgreso.get(alumno.auth_user_id + "-" + item.tipoEntregable + "-" + item.id);
    fila.appendChild(crearCeldaEvaluacion(alumno, item, filaProgreso, sinCuenta, trimestre, mapaProgreso));
  });

  return fila;
}

function construirTablaEvaluacion(alumnos, entregables, mapaProgreso, trimestre) {
  const tabla = document.createElement("table");
  tabla.className = "tabla-calificacion";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");

  const thAlumno = document.createElement("th");
  thAlumno.className = "tabla-calificacion__col-fija";
  thAlumno.textContent = "Alumno";
  filaEncabezado.appendChild(thAlumno);

  const mostrarIconoTipo = estadoEvaluacion.tipo === "todos";
  entregables.forEach((item) => {
    const th = document.createElement("th");
    th.className = "tabla-calificacion__col-item";
    th.title = item.titulo;
    th.textContent = (mostrarIconoTipo ? ICONO_TIPO_ENTREGABLE[item.tipoEntregable] + " " : "") + item.titulo;
    filaEncabezado.appendChild(th);
  });

  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  alumnos.forEach((alumno) => {
    tbody.appendChild(crearFilaAlumnoEvaluacion(alumno, entregables, mapaProgreso, trimestre));
  });
  tabla.appendChild(tbody);

  return tabla;
}

// Copias adaptadas de filtrarFilasTablaCalificacion/activarBuscadorCalificacion,
// apuntando a los ids propios de este módulo.
function filtrarFilasTablaEvaluacion() {
  const input = document.getElementById("evaluacion-buscador-input");
  const contenedor = document.getElementById("evaluacion-tabla-contenedor");
  if (!input || !contenedor) return;

  const tabla = contenedor.querySelector(".tabla-calificacion");
  const filas = contenedor.querySelectorAll("tbody tr");
  let mensajeSinCoincidencias = contenedor.querySelector(".evaluacion-tabla__sin-coincidencias");

  if (!tabla || filas.length === 0) {
    if (mensajeSinCoincidencias) mensajeSinCoincidencias.remove();
    return;
  }

  const termino = normalizarParaBusqueda(input.value.trim());
  let algunaVisible = false;

  filas.forEach((fila) => {
    const coincide =
      termino === "" ||
      fila.dataset.nombreBusqueda.includes(termino) ||
      fila.dataset.numeroLista.includes(termino);
    fila.hidden = !coincide;
    if (coincide) algunaVisible = true;
  });

  if (termino !== "" && !algunaVisible) {
    if (!mensajeSinCoincidencias) {
      mensajeSinCoincidencias = document.createElement("p");
      mensajeSinCoincidencias.className = "sin-resultados evaluacion-tabla__sin-coincidencias";
      mensajeSinCoincidencias.textContent =
        "No se encontró en esta vista — prueba cambiar el filtro de Trimestre/Secuencia.";
      tabla.after(mensajeSinCoincidencias);
    }
  } else if (mensajeSinCoincidencias) {
    mensajeSinCoincidencias.remove();
  }
}

function activarBuscadorEvaluacion() {
  const input = document.getElementById("evaluacion-buscador-input");
  if (!input) return;
  input.addEventListener("input", filtrarFilasTablaEvaluacion);
}

// Copias adaptadas de anchoPrimeraColumnaDatosCalificacion/
// actualizarEstadoNavegacionTablaCalificacion/
// activarNavegacionMovilTablaCalificacion — mismo comportamiento de
// scroll ◀▶ + gradiente, apuntando a los ids propios de este módulo.
// Las clases CSS que consumen (.calificacion-tabla-contenedor,
// --alto-contenedor-calificacion, .calificacion-tabla-contenedor--fin-
// alcanzado) son genéricas por clase, no por id, así que ya aplican
// tal cual sin tocar css/style.css.
function anchoPrimeraColumnaDatosEvaluacion() {
  const contenedor = document.getElementById("evaluacion-tabla-contenedor");
  const primeraColumnaDatos = contenedor?.querySelector("thead th:nth-child(2)");
  return primeraColumnaDatos ? primeraColumnaDatos.offsetWidth : 140;
}

function actualizarEstadoNavegacionTablaEvaluacion() {
  const contenedor = document.getElementById("evaluacion-tabla-contenedor");
  if (!contenedor) return;

  const botonIzq = document.getElementById("evaluacion-scroll-izq");
  const botonDer = document.getElementById("evaluacion-scroll-der");

  const alInicio = contenedor.scrollLeft <= 0;
  const alFinal = contenedor.scrollLeft + contenedor.clientWidth >= contenedor.scrollWidth - 1;

  if (botonIzq) botonIzq.disabled = alInicio;
  if (botonDer) botonDer.disabled = alFinal;
  contenedor.classList.toggle("calificacion-tabla-contenedor--fin-alcanzado", alFinal);
  contenedor.style.setProperty("--alto-contenedor-calificacion", contenedor.clientHeight + "px");
}

function activarNavegacionMovilTablaEvaluacion() {
  const contenedor = document.getElementById("evaluacion-tabla-contenedor");
  const botonIzq = document.getElementById("evaluacion-scroll-izq");
  const botonDer = document.getElementById("evaluacion-scroll-der");
  if (!contenedor || !botonIzq || !botonDer) return;

  botonIzq.addEventListener("click", () => {
    const prefiereMovimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    contenedor.scrollBy({
      left: -anchoPrimeraColumnaDatosEvaluacion(),
      behavior: prefiereMovimientoReducido ? "auto" : "smooth",
    });
  });
  botonDer.addEventListener("click", () => {
    const prefiereMovimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    contenedor.scrollBy({
      left: anchoPrimeraColumnaDatosEvaluacion(),
      behavior: prefiereMovimientoReducido ? "auto" : "smooth",
    });
  });

  contenedor.addEventListener("scroll", actualizarEstadoNavegacionTablaEvaluacion);
  window.addEventListener("resize", actualizarEstadoNavegacionTablaEvaluacion);
}

// Copia adaptada de renderizarTablaCalificacion, sin el cálculo de
// avance/pie: apunta a estadoEvaluacion y a los ids propios de este
// módulo, reutilizando las mismas 3 consultas de datos.
async function renderizarTablaEvaluacion() {
  const contenedor = document.getElementById("evaluacion-tabla-contenedor");
  if (!contenedor) return;

  if (!estadoEvaluacion.secuencia) {
    mostrarSinResultados(contenedor, "No hay entregables para este trimestre y tipo.");
    actualizarEstadoNavegacionTablaEvaluacion();
    return;
  }

  mostrarSinResultados(contenedor, "Cargando…");

  const tipos = estadoEvaluacion.tipo === "todos" ? ["tarea", "actividad", "proyecto"] : [estadoEvaluacion.tipo];

  const [alumnos, entregablesTodos] = await Promise.all([
    obtenerAlumnosParaCalificacion(estadoEvaluacion.grupo),
    obtenerEntregablesPorTipo(estadoEvaluacion.tipo, estadoEvaluacion.trimestre),
  ]);

  const entregables = entregablesTodos
    .filter((item) => claveSecuenciaDeEntregable(item) === estadoEvaluacion.secuencia)
    .filter(
      (item) =>
        estadoEvaluacion.grupo === "todos" || item.grupo === "todos" || item.grupo === estadoEvaluacion.grupo
    );

  if (alumnos.length === 0) {
    mostrarSinResultados(contenedor, "No hay alumnos registrados para este grupo.");
    actualizarEstadoNavegacionTablaEvaluacion();
    return;
  }
  if (entregables.length === 0) {
    mostrarSinResultados(contenedor, "No hay entregables para esta secuencia.");
    actualizarEstadoNavegacionTablaEvaluacion();
    return;
  }

  const idsParaProgreso = alumnos.filter((alumno) => alumno.auth_user_id != null).map((alumno) => alumno.auth_user_id);
  const mapaProgreso = await obtenerMapaProgresoCalificacion(estadoEvaluacion.trimestre, tipos, idsParaProgreso);

  contenedor.innerHTML = "";
  contenedor.appendChild(construirTablaEvaluacion(alumnos, entregables, mapaProgreso, estadoEvaluacion.trimestre));

  actualizarEstadoNavegacionTablaEvaluacion();
  filtrarFilasTablaEvaluacion();
}

// Contexto del dialog de calificar actualmente abierto (alumno/item/
// filaProgreso + el callback que sabe repintar la celda exacta que lo
// abrió) — se reemplaza cada vez que se abre el dialog, mismo patrón
// que contextoEdicionEntrega en Calificación y progreso.
let contextoCalificar = null;

// filaProgreso siempre existe al llegar aquí: esta función solo se
// invoca desde celdas en estado "sin-calificar"/"calificada", ambas
// con completado=true, o sea que ya hay una fila real en progreso que
// actualizar — nunca hace falta un INSERT.
function abrirModalCalificar({ alumno, item, filaProgreso, alGuardar }) {
  const modal = document.getElementById("modal-calificar");
  if (!modal) return;

  contextoCalificar = { filaProgreso, alGuardar };

  document.getElementById("modal-calificar-contexto").textContent = alumno.nombre + " — " + item.titulo;

  const enlaceArchivo = document.getElementById("modal-calificar-archivo");
  if (filaProgreso.archivo_url) {
    enlaceArchivo.href = filaProgreso.archivo_url;
    enlaceArchivo.hidden = false;
  } else {
    enlaceArchivo.hidden = true;
  }

  const campoValor = document.getElementById("calificar-valor");
  campoValor.value = filaProgreso.calificacion != null ? filaProgreso.calificacion : "";
  sincronizarBotonesValorRapidoCalificacion();

  document.getElementById("calificar-error").hidden = true;
  modal.showModal();
}

// UPDATE de progreso.calificacion (+ actualizado_en) SOLO — nunca toca
// completado/origen/fecha_entrega_manual/nota de esa fila, sin importar
// si la entrega original vino del formulario del alumno o de una marca
// manual del docente.
async function guardarCalificacion(filaProgreso, valor) {
  const { data, error } = await clienteSupabase
    .from("progreso")
    .update({ calificacion: valor, actualizado_en: new Date().toISOString() })
    .eq("id", filaProgreso.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Campo vacío guarda NULL (permite "desmarcar" una calificación puesta
// por error, sin un botón aparte para eso) — no es required a propósito.
function activarFormularioCalificar() {
  const modal = document.getElementById("modal-calificar");
  const formulario = document.getElementById("formulario-calificar");
  if (!modal || !formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (demoModeActivo()) {
      await cerrarDialogoAnimado(modal);
      abrirModalDemo();
      return;
    }
    if (!contextoCalificar) return;

    const { filaProgreso, alGuardar } = contextoCalificar;
    const campoValor = document.getElementById("calificar-valor");
    const error = document.getElementById("calificar-error");
    const botonConfirmar = document.getElementById("calificar-confirmar");

    error.hidden = true;

    const texto = campoValor.value.trim();
    let valor = null;
    if (texto !== "") {
      valor = Number(texto);
      if (Number.isNaN(valor) || valor < 0 || valor > 10) {
        error.textContent = "La calificación debe ser un número entre 0.0 y 10.0.";
        error.hidden = false;
        return;
      }
      // step="0.1" ya lo sugiere en el input, pero no impide escribir más
      // decimales a mano — se redondea a 1 decimal antes de guardar.
      valor = Math.round(valor * 10) / 10;
    }

    botonConfirmar.disabled = true;
    try {
      const nuevaFila = await guardarCalificacion(filaProgreso, valor);
      cerrarDialogoAnimado(modal);
      alGuardar(nuevaFila);
    } catch (err) {
      error.textContent = "No se pudo guardar: " + (err?.message || "intenta de nuevo.");
      error.hidden = false;
    } finally {
      botonConfirmar.disabled = false;
    }
  });

  document.getElementById("calificar-cancelar").addEventListener("click", () => cerrarDialogoAnimado(modal));

  const botonCerrar = modal.querySelector(".modal-detalle__cerrar");
  if (botonCerrar) botonCerrar.addEventListener("click", () => cerrarDialogoAnimado(modal));

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarDialogoAnimado(modal);
  });
}

// Marca el botón de valor rápido cuyo data-valor-rapido coincide con el
// valor actual de #calificar-valor (si aplica) — se llama al escribir a
// mano, al tocar un botón y al abrir el modal (ver abrirModalCalificar()),
// así el estado visual nunca queda desincronizado del campo.
function sincronizarBotonesValorRapidoCalificacion() {
  const campoValor = document.getElementById("calificar-valor");
  const contenedor = document.querySelector(".calificar-valor-rapido");
  if (!campoValor || !contenedor) return;

  const valorActual = campoValor.value.trim();
  contenedor.querySelectorAll(".calificar-valor-rapido__boton").forEach((boton) => {
    boton.classList.toggle("calificar-valor-rapido__boton--activo", boton.dataset.valorRapido === valorActual);
  });
}

// Atajo sobre #calificar-valor: solo llena el campo, nunca hace submit.
// El input sigue siendo editable a mano para notas con decimales (7.5,
// 8.3, etc.) — ver PARTE 2 de la Fase 9a.
function activarBotonesValorRapidoCalificacion() {
  const campoValor = document.getElementById("calificar-valor");
  const contenedor = document.querySelector(".calificar-valor-rapido");
  if (!campoValor || !contenedor) return;

  contenedor.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".calificar-valor-rapido__boton");
    if (!boton) return;
    campoValor.value = boton.dataset.valorRapido;
    sincronizarBotonesValorRapidoCalificacion();
  });

  campoValor.addEventListener("input", sincronizarBotonesValorRapidoCalificacion);
}

/* ---------- Tabla de promedios (dentro de Evaluación) ----------
   Vista alterna con la de captura individual: en vez de una fila por
   entregable, una fila por alumno con su promedio de Tareas/Actividades/
   Proyectos y su promedio final del trimestre (30/30/40), vía la MISMA
   calcularPromedioTrimestre() que ya usa el modal de historial — aquí
   se llama una vez por alumno en vez de una sola vez para uno solo.
   Solo Trimestre/Grupo aplican (Tipo/Secuencia se ocultan mientras esta
   vista está activa, ver activarVistasEvaluacion()); "todos" los grupos a
   la vez no se soporta a propósito (ver mensaje en renderizarTablaPromedios). --------- */

// Mismo patrón que obtenerMapaProgresoCalificacion, pero sin filtrar por
// "tipo" (el promedio necesita el trimestre completo) y agrupado por
// alumno_id: calcularPromedioTrimestre espera un Map por alumno, sin el
// alumno_id en la llave (mismo formato que ya arma abrirModalHistorialAlumno
// para un único alumno).
async function obtenerMapaProgresoPorAlumno(trimestre, alumnoIds) {
  const mapaPorAlumno = new Map();
  if (alumnoIds.length === 0) return mapaPorAlumno;

  const { data, error } = await obtenerDatos("progreso", {
    eq: { trimestre },
    in: { alumno_id: alumnoIds },
  });

  if (error) return mapaPorAlumno;

  data.forEach((fila) => {
    if (!mapaPorAlumno.has(fila.alumno_id)) mapaPorAlumno.set(fila.alumno_id, new Map());
    mapaPorAlumno.get(fila.alumno_id).set(fila.tipo + "-" + fila.item_id + "-" + String(fila.trimestre), fila);
  });
  return mapaPorAlumno;
}

// Cortes de la tabla de promedios, confirmados con Hiram (no hay ningún
// criterio de 3 rangos ya usado en el sitio: la fórmula de riesgo del
// Dashboard es binaria y mide avance/puntualidad, no promedio numérico
// — no aplica aquí). Escala 0-10 estándar (ver min/max del input
// #calificar-valor en admin.html). 6.0 = mínimo aprobatorio SEP; 8.0
// separa "aprobado pero en riesgo" de "aprobado con buen nivel".
const UMBRAL_PROMEDIO_APROBATORIO = 6.0;
const UMBRAL_PROMEDIO_BUEN_NIVEL = 8.0;

// Reutiliza el MISMO triplete de tokens --color-estado-* que ya usa
// .badge-estado (completado/pendiente/vencido = verde/ámbar/rojo, ya AA
// en los 10 temas) — nunca --color-turquesa aquí (Status-Color
// Exclusivity Rule, DESIGN.md). El chip acompaña al número, nunca lo
// reemplaza: ícono + palabra visibles para todos, no solo color (WCAG
// 1.4.1) — font-variant-emoji:text en el CSS evita que ⚠ se renderice
// como emoji a color en algunas plataformas, para que se vea consistente
// sobre el fondo ámbar del chip.
const CHIP_RANGO_PROMEDIO = {
  reprobado: { texto: "✕ Reprobado", clase: "chip-rango-promedio--rojo" },
  riesgo: { texto: "⚠ En riesgo", clase: "chip-rango-promedio--ambar" },
  aprobado: { texto: "✓ Aprobado", clase: "chip-rango-promedio--verde" },
};

function rangoPromedio(promedioFinal) {
  if (promedioFinal < UMBRAL_PROMEDIO_APROBATORIO) return "reprobado";
  if (promedioFinal < UMBRAL_PROMEDIO_BUEN_NIVEL) return "riesgo";
  return "aprobado";
}

function crearChipRangoPromedio(promedioFinal) {
  const { texto, clase } = CHIP_RANGO_PROMEDIO[rangoPromedio(promedioFinal)];
  const chip = document.createElement("span");
  chip.className = "chip-rango-promedio " + clase;
  chip.textContent = texto;
  return chip;
}

/* ---------- Calificación final del ciclo (combina los 3 trimestres) ----------
   Regla acordada con Hiram: reprobar 2 de los 3 trimestres manda a
   extraordinario, sin importar el promedio de los 3 combinados; reprobar
   solo 1 (o ninguno) se resuelve con el promedio simple de los
   trimestres capturados. Con exactamente 2 trimestres capturados y
   ambos reprobados, el 3° trimestre define si el extraordinario ya es
   matemáticamente seguro o si el alumno todavía puede evitarlo. --------- */

// promediosPorTrimestre: {1: number|null, 2: number|null, 3: number|null}
// null = ese trimestre no tiene NINGUNA calificación capturada (mismo
// criterio "tieneAlgunaCalificacion" que ya usa crearFilaAlumnoPromedios).
function calcularEstadoFinalAlumno(promediosPorTrimestre) {
  const trimestres = [1, 2, 3];
  const conDatos = trimestres
    .map((t) => ({ trimestre: t, valor: promediosPorTrimestre[t] }))
    .filter((p) => p.valor != null);

  if (conDatos.length === 0) return { estado: "sin_datos", calificacionFinal: null };

  const reprobados = conDatos.filter((p) => p.valor < UMBRAL_PROMEDIO_APROBATORIO);
  const calificacionFinal = Math.round((conDatos.reduce((s, p) => s + p.valor, 0) / conDatos.length) * 10) / 10;

  if (reprobados.length < 2) {
    return {
      estado: conDatos.length < 3 ? "provisional" : rangoPromedio(calificacionFinal),
      calificacionFinal,
    };
  }

  if (conDatos.length === 3) {
    return {
      estado: calificacionFinal < UMBRAL_PROMEDIO_APROBATORIO ? "extraordinario" : rangoPromedio(calificacionFinal),
      calificacionFinal,
    };
  }

  // Exactamente 2 capturados y ambos reprobados; el 3° sigue pendiente.
  const sumaReprobados = reprobados.reduce((s, p) => s + p.valor, 0);
  const trimestrePendiente = trimestres.find((t) => promediosPorTrimestre[t] == null);
  const necesario = Math.round((18 - sumaReprobados) * 10) / 10; // 6.0 × 3 = 18

  return {
    estado: necesario > 10 ? "extraordinario_seguro" : "riesgo_extraordinario",
    calificacionFinal,
    trimestrePendiente,
    necesario: Math.min(Math.max(necesario, 0), 10),
  };
}

// Mismo triplete verde/ámbar/rojo que CHIP_RANGO_PROMEDIO (Status-Color
// Exclusivity Rule: nunca turquesa) más un estado neutro para
// "provisional" (todavía no hay 3 trimestres capturados y no hay riesgo).
const CHIP_ESTADO_FINAL = {
  aprobado: { texto: "✓ Aprobado", clase: "chip-rango-promedio--verde" },
  riesgo: { texto: "⚠ En riesgo", clase: "chip-rango-promedio--ambar" },
  provisional: { texto: "… En curso", clase: "chip-rango-promedio--neutro" },
  riesgo_extraordinario: { texto: "⚠ Riesgo de extraordinario", clase: "chip-rango-promedio--ambar" },
  extraordinario_seguro: { texto: "✕ Extraordinario (matemáticamente)", clase: "chip-rango-promedio--rojo" },
  extraordinario: { texto: "✕ Extraordinario", clase: "chip-rango-promedio--rojo" },
  sin_datos: { texto: "—", clase: null },
};

// Sparkline de 4 puntos FIJOS (Tareas→Actividades→Proyectos→Promedio
// final) — no confundir con construirTendenciaKPI/construirSparklineSVG
// (esas son tendencia semanal, con eje de tiempo y escala relativa
// min/max). Aquí la escala es fija 0-10 (rango real de calificación,
// igual que construirFiguraBarrasVerticales con escalaMax:10) a
// propósito, NO relativa a min/max de la fila: así las líneas de filas
// distintas son comparables entre sí al recorrer la columna de arriba a
// abajo — con escala relativa, un alumno con 7/7.5/8/7.7 se vería con
// un quiebre tan dramático como uno con 2/9/4/6.
const ETIQUETAS_TENDENCIA_PROMEDIOS = ["Tareas", "Actividades", "Proyectos", "Promedio"];

function construirSparklinePromedios(valores) {
  const svgNS = "http://www.w3.org/2000/svg";
  const ANCHO = 60;
  const ALTO = 20;
  const PAD = 3;
  const ESCALA_MAX = 10;

  const puntosTexto = valores
    .map((valor, indice) => {
      const x = PAD + (indice / (valores.length - 1)) * (ANCHO - PAD * 2);
      const y = ALTO - PAD - (Math.min(valor, ESCALA_MAX) / ESCALA_MAX) * (ALTO - PAD * 2);
      return x + "," + y;
    })
    .join(" ");

  // Un solo <svg> + <title> + <polyline> por fila (mismo patrón barato
  // que construirSparklineSVG: los 4 puntos van en un solo atributo
  // "points", sin crear un nodo por punto) — 30-60 filas por grupo no
  // deben sentirse lentas al renderizar.
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 " + ANCHO + " " + ALTO);
  svg.setAttribute("role", "img");
  svg.classList.add("tabla-promedios__tendencia-svg");

  const titulo = document.createElementNS(svgNS, "title");
  titulo.textContent = ETIQUETAS_TENDENCIA_PROMEDIOS.map(
    (etiqueta, indice) => etiqueta + ": " + valores[indice].toFixed(1)
  ).join(" · ");
  svg.appendChild(titulo);

  const linea = document.createElementNS(svgNS, "polyline");
  linea.setAttribute("points", puntosTexto);
  linea.classList.add("tabla-promedios__tendencia-linea");
  svg.appendChild(linea);

  return svg;
}

// "—" en vez de un path roto/vacío si algún valor no es un número finito
// — ahora un caso real, no solo defensivo: calcularPromedioTrimestre()
// devuelve null (Number.isFinite(null) === false) para un tipo sin
// ninguna secuencia ya vencida, o para el trimestre completo si ningún
// tipo tiene dato todavía.
function construirCeldaTendenciaPromedios(promedio) {
  const celda = document.createElement("td");
  celda.className = "tabla-promedios__celda-tendencia";
  const valores = [
    promedio.promedioTarea,
    promedio.promedioActividad,
    promedio.promedioProyecto,
    promedio.promedioFinal,
  ];
  if (valores.some((valor) => !Number.isFinite(valor))) {
    celda.textContent = "—";
    return celda;
  }
  celda.appendChild(construirSparklinePromedios(valores));
  return celda;
}

// Alumno sin cuenta activa: "—" en las 5 columnas numéricas/gráfica, sin
// intentar promediar nada (no hay progreso real que leer para él).
// "—" (sin dataset.valor) cuando valor es null, en vez de String(null)
// = "null" — mismo criterio null-safe que ya usa crearFilaAlumnoFinal
// (Calificación Final) para promediosPorTrimestre[trimestre]. Antes de
// este fix, un valor null aquí corrompía dataset.valor con el string
// literal "null" (rompía extraerValorCeldaCSV()/el ordenamiento por
// columna) y crearChipRangoPromedio(null) clasificaba el trimestre como
// "✕ Reprobado" por coerción de JS (null < 6.0 es true).
function construirCeldaPromedioTipo(valor) {
  const celda = document.createElement("td");
  if (valor == null) {
    celda.textContent = "—";
  } else {
    celda.textContent = formatearCalificacion(valor, formatoCalificacionActivo);
    celda.dataset.valor = String(valor);
  }
  return celda;
}

function crearFilaAlumnoPromedios(alumno, itemsPorTipo, mapaProgresoPorAlumno, trimestre) {
  const fila = document.createElement("tr");
  if (alumno.activo === false) fila.classList.add("fila-alumno--inactivo");
  fila.dataset.numeroLista = String(alumno.numero_lista);

  const celdaAlumno = document.createElement("td");
  const envoltura = document.createElement("div");
  envoltura.className = "calificacion-tabla__alumno";
  const nombre = document.createElement("span");
  nombre.className = "calificacion-tabla__alumno-nombre";
  nombre.textContent = alumno.nombre;
  const numero = document.createElement("span");
  numero.className = "calificacion-tabla__alumno-numero";
  numero.textContent = "N.° " + alumno.numero_lista;
  envoltura.append(nombre, numero);
  celdaAlumno.appendChild(envoltura);
  fila.appendChild(celdaAlumno);

  const sinCuenta = alumno.usado === false || !alumno.auth_user_id;
  const mapaProgresoAlumno = sinCuenta ? new Map() : mapaProgresoPorAlumno.get(alumno.auth_user_id) || new Map();

  // "Sin nada que promediar" cubre dos casos con el mismo "—": sin cuenta
  // activa, o con cuenta pero SIN NINGUNA calificación capturada en todo
  // el trimestre (sin importar tipo/secuencia) — para no confundir un
  // trimestre vacío con un 0.0 real. Guard INDEPENDIENTE del que ahora
  // vive dentro de calcularPromedioTrimestre() (secuencias/tipos aún sin
  // vencer): un trimestre puede quedar en "—" por cualquiera de los dos
  // motivos, este solo decide si se llega a llamarla.
  const tieneAlgunaCalificacion = tieneAlgunaCalificacionCapturada(mapaProgresoAlumno);

  if (sinCuenta || !tieneAlgunaCalificacion) {
    for (let i = 0; i < 5; i++) {
      const celda = document.createElement("td");
      celda.textContent = "—";
      fila.appendChild(celda);
    }
    return fila;
  }

  const promedio = calcularPromedioTrimestre(alumno.auth_user_id, trimestre, itemsPorTipo, mapaProgresoAlumno, alumno.grupo);

  fila.appendChild(construirCeldaPromedioTipo(promedio.promedioTarea));
  fila.appendChild(construirCeldaPromedioTipo(promedio.promedioActividad));
  fila.appendChild(construirCeldaPromedioTipo(promedio.promedioProyecto));

  // El chip de rango solo tiene sentido con un número real detrás —
  // crearChipRangoPromedio(null) clasificaría por coerción (null < 6.0)
  // como "✕ Reprobado" en vez de "sin datos". construirCeldaPromedioTipo
  // ya deja "—" sin dataset.valor cuando promedioFinal es null; el chip
  // (+ su clase propia para diferenciar la celda) solo se agrega encima
  // en el caso con dato.
  const celdaFinal = construirCeldaPromedioTipo(promedio.promedioFinal);
  celdaFinal.className = "tabla-promedios__promedio-final";
  if (promedio.promedioFinal != null) {
    const numeroFinal = document.createElement("span");
    numeroFinal.className = "tabla-promedios__promedio-final-numero";
    numeroFinal.textContent = celdaFinal.textContent;
    celdaFinal.textContent = "";
    celdaFinal.append(numeroFinal, crearChipRangoPromedio(promedio.promedioFinal));
  }
  fila.appendChild(celdaFinal);

  fila.appendChild(construirCeldaTendenciaPromedios(promedio));

  return fila;
}

// Columnas ordenables de la tabla de promedios (Commit C). "texto" ==
// Alumno (localeCompare por nombre); las otras 4 son "numero" y leen
// dataset.valor de la celda correspondiente (ver crearFilaAlumnoPromedios
// — Tareas/Actividades/Proyectos/Promedio final lo traen todas). Un
// alumno sin cuenta/sin calificación no tiene dataset.valor en esas
// celdas: sus filas siempre quedan al final, sin importar la dirección.
const COLUMNAS_ORDENABLES_PROMEDIOS = [
  { texto: "Alumno", tipo: "texto" },
  { texto: "Tareas", tipo: "numero" },
  { texto: "Actividades", tipo: "numero" },
  { texto: "Proyectos", tipo: "numero" },
  { texto: "Promedio final", tipo: "numero" },
];

function valorOrdenFilaPromedios(fila, indiceColumna, tipo) {
  if (tipo === "texto") {
    return fila.querySelector(".calificacion-tabla__alumno-nombre")?.textContent || "";
  }
  const valor = fila.children[indiceColumna]?.dataset.valor;
  return valor == null ? null : Number(valor);
}

function compararFilasPromedios(filaA, filaB, indiceColumna, tipo, direccion) {
  const valorA = valorOrdenFilaPromedios(filaA, indiceColumna, tipo);
  const valorB = valorOrdenFilaPromedios(filaB, indiceColumna, tipo);

  if (valorA == null && valorB == null) return 0;
  if (valorA == null) return 1;
  if (valorB == null) return -1;

  const comparacion =
    tipo === "texto" ? String(valorA).localeCompare(String(valorB), "es") : valorA - valorB;
  return direccion === "asc" ? comparacion : -comparacion;
}

// Reutiliza la clase "tabla-calificacion" (no solo "tabla-promedios")
// para heredar gratis el mismo look (bordes, encabezado sticky) y las
// mismas reglas @media print en blanco y negro que ya apuntan a esa
// clase — sin sticky de columna "Alumno" (aquí solo son 6 columnas,
// caben sin scroll horizontal, a diferencia de la tabla de captura).
//
// Ordenamiento (Commit C) SOLO vive aquí, dentro de esta función — no
// toca .tabla-calificacion genérico ni las otras 4 vistas que la
// comparten. Reordena las mismas filas <tr> ya construidas (con
// tbody.append(...filasOrdenadas), que MUEVE nodos existentes en vez de
// reconstruirlos) en vez de volver a pedir datos a Supabase: el thead
// sticky no se entera del reorden (solo depende de posición dentro del
// contenedor con scroll, no del orden de las filas del tbody).
function construirTablaPromedios(alumnos, itemsPorTipo, mapaProgresoPorAlumno, trimestre) {
  const tabla = document.createElement("table");
  tabla.className = "tabla-calificacion tabla-promedios";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");

  const tbody = document.createElement("tbody");
  alumnos.forEach((alumno) => {
    tbody.appendChild(crearFilaAlumnoPromedios(alumno, itemsPorTipo, mapaProgresoPorAlumno, trimestre));
  });

  let columnaOrdenActual = null;
  let direccionOrdenActual = "asc";

  function actualizarEncabezadosOrdenamiento() {
    Array.from(filaEncabezado.children).forEach((th, indice) => {
      const flecha = th.querySelector(".tabla-promedios__flecha-orden");
      if (indice === columnaOrdenActual) {
        th.setAttribute("aria-sort", direccionOrdenActual === "asc" ? "ascending" : "descending");
        if (flecha) flecha.textContent = direccionOrdenActual === "asc" ? "▲" : "▼";
      } else {
        th.setAttribute("aria-sort", "none");
        if (flecha) flecha.textContent = "";
      }
    });
  }

  function reordenarPor(indiceColumna, tipo) {
    // Re-click en la misma columna alterna dirección; una columna nueva
    // siempre arranca ascendente.
    direccionOrdenActual =
      columnaOrdenActual === indiceColumna && direccionOrdenActual === "asc" ? "desc" : "asc";
    columnaOrdenActual = indiceColumna;

    const filasOrdenadas = Array.from(tbody.querySelectorAll("tr")).sort((filaA, filaB) =>
      compararFilasPromedios(filaA, filaB, indiceColumna, tipo, direccionOrdenActual)
    );
    tbody.append(...filasOrdenadas);

    actualizarEncabezadosOrdenamiento();
  }

  COLUMNAS_ORDENABLES_PROMEDIOS.forEach(({ texto, tipo }, indice) => {
    const th = document.createElement("th");
    th.setAttribute("aria-sort", "none");

    // <button> nativo: foco y activación por teclado (Enter/Espacio)
    // gratis, sin tener que agregar tabindex ni manejar keydown a mano.
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "tabla-promedios__boton-orden";
    boton.append(texto);

    const flecha = document.createElement("span");
    flecha.className = "tabla-promedios__flecha-orden";
    flecha.setAttribute("aria-hidden", "true");
    boton.appendChild(flecha);

    boton.addEventListener("click", () => reordenarPor(indice, tipo));

    th.appendChild(boton);
    filaEncabezado.appendChild(th);
  });

  // No es sortable (un sparkline de 4 puntos no es un solo número
  // comparable) — <th> simple, fuera de COLUMNAS_ORDENABLES_PROMEDIOS.
  const thTendencia = document.createElement("th");
  thTendencia.textContent = "Tendencia";
  filaEncabezado.appendChild(thTendencia);

  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);
  tabla.appendChild(tbody);

  return tabla;
}

async function renderizarTablaPromedios() {
  const contenedor = document.getElementById("evaluacion-promedios-contenedor");
  if (!contenedor) return;

  // "Todos" los grupos a la vez no se soporta a propósito (tabla
  // combinada confusa) — el docente cambia el filtro de Grupo en vez de
  // que esta vista intente resolverlo.
  if (estadoEvaluacion.grupo === "todos") {
    mostrarSinResultados(contenedor, "Selecciona un grupo específico (3°C o 3°E) para ver la tabla de promedios.");
    return;
  }

  mostrarSinResultados(contenedor, "Cargando…");

  const [alumnos, entregablesTodos] = await Promise.all([
    obtenerAlumnosParaCalificacion(estadoEvaluacion.grupo),
    obtenerEntregablesPorTipo("todos", estadoEvaluacion.trimestre),
  ]);

  if (alumnos.length === 0) {
    mostrarSinResultados(contenedor, "No hay alumnos registrados para este grupo.");
    return;
  }

  // Mismo filtro de grupo por ítem que ya usa construirTablaEvaluacion:
  // un ítem con grupo específico (no "todos") solo cuenta para el
  // promedio de ese grupo.
  const entregables = entregablesTodos.filter(
    (item) => item.grupo === "todos" || item.grupo === estadoEvaluacion.grupo
  );
  const itemsPorTipo = { tarea: [], actividad: [], proyecto: [] };
  entregables.forEach((item) => itemsPorTipo[item.tipoEntregable]?.push(item));

  const idsParaProgreso = alumnos.filter((alumno) => alumno.auth_user_id != null).map((alumno) => alumno.auth_user_id);
  const mapaProgresoPorAlumno = await obtenerMapaProgresoPorAlumno(estadoEvaluacion.trimestre, idsParaProgreso);

  contenedor.innerHTML = "";
  contenedor.appendChild(
    construirTablaPromedios(alumnos, itemsPorTipo, mapaProgresoPorAlumno, estadoEvaluacion.trimestre)
  );
}

/* ---------- Tabla de calificación final (dentro de Evaluación) ----------
   Tercera vía del toggle, junto a captura y promedios: una fila por
   alumno con su promedio de cada uno de los 3 trimestres y el estado
   final del ciclo vía calcularEstadoFinalAlumno(). A diferencia de la
   vista de promedios, esta SIEMPRE usa los 3 trimestres (el filtro
   Trimestre se oculta mientras está activa, ver activarVistasEvaluacion()). --------- */

// Un {itemsPorTipo, mapaProgresoPorAlumno} por trimestre (1/2/3, en ese
// orden), ya filtrado por el grupo elegido — misma forma que ya
// construyen renderizarTablaPromedios()/construirResumenAlumnosDashboard
// para UN trimestre, aquí para los 3 a la vez.
async function obtenerDatosPorTrimestreParaFinal(grupo, idsParaProgreso) {
  const trimestres = [1, 2, 3];
  const [entregablesPorTrimestre, mapasProgresoPorTrimestre] = await Promise.all([
    Promise.all(trimestres.map((t) => obtenerEntregablesPorTipo("todos", String(t)))),
    Promise.all(trimestres.map((t) => obtenerMapaProgresoPorAlumno(String(t), idsParaProgreso))),
  ]);

  return trimestres.map((t, indice) => {
    const entregables = entregablesPorTrimestre[indice].filter(
      (item) => item.grupo === "todos" || item.grupo === grupo
    );
    const itemsPorTipo = { tarea: [], actividad: [], proyecto: [] };
    entregables.forEach((item) => itemsPorTipo[item.tipoEntregable]?.push(item));
    return { itemsPorTipo, mapaProgresoPorAlumno: mapasProgresoPorTrimestre[indice] };
  });
}

// datosPorTrimestre[i] corresponde al trimestre i+1 (ver
// obtenerDatosPorTrimestreParaFinal). Mismo criterio "sin cuenta/sin
// calificación capturada" que crearFilaAlumnoPromedios, aplicado trimestre
// por trimestre — un trimestre vacío queda null, nunca 0, para no
// confundirlo con un extraordinario real. Pura (sin DOM): la reutiliza
// tanto crearFilaAlumnoFinal (tabla de Evaluación) como
// contarAlumnosRiesgoExtraordinario (KPI del Dashboard).
function calcularPromediosPorTrimestreDeAlumno(alumno, datosPorTrimestre) {
  const sinCuenta = alumno.usado === false || !alumno.auth_user_id;
  const promediosPorTrimestre = { 1: null, 2: null, 3: null };

  [1, 2, 3].forEach((trimestre, indice) => {
    const { itemsPorTipo, mapaProgresoPorAlumno } = datosPorTrimestre[indice];
    const mapaProgresoAlumno = sinCuenta ? new Map() : mapaProgresoPorAlumno.get(alumno.auth_user_id) || new Map();
    if (sinCuenta || !tieneAlgunaCalificacionCapturada(mapaProgresoAlumno)) return;

    const promedio = calcularPromedioTrimestre(alumno.auth_user_id, trimestre, itemsPorTipo, mapaProgresoAlumno, alumno.grupo);
    promediosPorTrimestre[trimestre] = promedio.promedioFinal;
  });

  return promediosPorTrimestre;
}

function crearFilaAlumnoFinal(alumno, datosPorTrimestre) {
  const fila = document.createElement("tr");
  if (alumno.activo === false) fila.classList.add("fila-alumno--inactivo");
  fila.dataset.numeroLista = String(alumno.numero_lista);

  const celdaAlumno = document.createElement("td");
  const envoltura = document.createElement("div");
  envoltura.className = "calificacion-tabla__alumno";
  const nombre = document.createElement("span");
  nombre.className = "calificacion-tabla__alumno-nombre";
  nombre.textContent = alumno.nombre;
  const numero = document.createElement("span");
  numero.className = "calificacion-tabla__alumno-numero";
  numero.textContent = "N.° " + alumno.numero_lista;
  envoltura.append(nombre, numero);
  celdaAlumno.appendChild(envoltura);
  fila.appendChild(celdaAlumno);

  const promediosPorTrimestre = calcularPromediosPorTrimestreDeAlumno(alumno, datosPorTrimestre);

  [1, 2, 3].forEach((trimestre) => {
    const celda = document.createElement("td");
    const valor = promediosPorTrimestre[trimestre];
    if (valor == null) {
      celda.textContent = "—";
    } else {
      celda.textContent = formatearCalificacion(valor, formatoCalificacionActivo);
      celda.dataset.valor = String(valor);
    }
    fila.appendChild(celda);
  });

  const estadoInfo = calcularEstadoFinalAlumno(promediosPorTrimestre);

  const celdaFinal = document.createElement("td");
  celdaFinal.className = "tabla-promedios__promedio-final";
  if (estadoInfo.calificacionFinal != null) {
    celdaFinal.dataset.valor = String(estadoInfo.calificacionFinal);
    celdaFinal.textContent = formatearCalificacion(estadoInfo.calificacionFinal, formatoCalificacionActivo);
  } else {
    celdaFinal.textContent = "—";
  }
  fila.appendChild(celdaFinal);

  const celdaEstado = document.createElement("td");
  const { texto, clase } = CHIP_ESTADO_FINAL[estadoInfo.estado];
  if (clase) {
    const chip = document.createElement("span");
    chip.className = "chip-rango-promedio " + clase;
    chip.textContent =
      estadoInfo.estado === "riesgo_extraordinario"
        ? texto + " — necesita " + estadoInfo.necesario.toFixed(1) + " en T" + estadoInfo.trimestrePendiente
        : texto;
    celdaEstado.appendChild(chip);
  } else {
    celdaEstado.textContent = texto;
  }
  fila.appendChild(celdaEstado);

  return { fila, alumno, estadoInfo };
}

const ESTADOS_RIESGO_EXTRAORDINARIO = ["riesgo_extraordinario", "extraordinario_seguro", "extraordinario"];

// Reutiliza "tabla-calificacion" + "tabla-promedios" (mismo look/reglas
// print que construirTablaPromedios) — sin ordenamiento por columna, a
// diferencia de esa tabla: 6 filas fijas y pocos alumnos por grupo, no
// hace falta.
function construirTablaFinal(alumnos, datosPorTrimestre) {
  const tabla = document.createElement("table");
  tabla.className = "tabla-calificacion tabla-promedios";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ["Alumno", "T1", "T2", "T3", "Calificación Final", "Estado"].forEach((texto) => {
    const th = document.createElement("th");
    th.textContent = texto;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  const alumnosEnRiesgo = [];
  alumnos.forEach((alumno) => {
    const { fila, estadoInfo } = crearFilaAlumnoFinal(alumno, datosPorTrimestre);
    tbody.appendChild(fila);
    if (ESTADOS_RIESGO_EXTRAORDINARIO.includes(estadoInfo.estado)) alumnosEnRiesgo.push({ alumno, estadoInfo });
  });
  tabla.appendChild(tbody);

  return { tabla, alumnosEnRiesgo };
}

// Banner de #evaluacion-final-alertas: oculto sin alumnos en riesgo,
// listando solo los 3 estados de riesgo de extraordinario (nunca
// aprobado/en riesgo/provisional — esos ya se ven en la tabla).
function actualizarAlertasFinal(contenedor, alumnosEnRiesgo) {
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (alumnosEnRiesgo.length === 0) {
    contenedor.hidden = true;
    return;
  }

  contenedor.hidden = false;

  const titulo = document.createElement("p");
  titulo.className = "evaluacion-final-alertas__titulo";
  titulo.textContent =
    "⚠ " + alumnosEnRiesgo.length + (alumnosEnRiesgo.length === 1 ? " alumno" : " alumnos") + " en riesgo de extraordinario";
  contenedor.appendChild(titulo);

  const lista = document.createElement("ul");
  lista.className = "evaluacion-final-alertas__lista";
  alumnosEnRiesgo.forEach(({ alumno, estadoInfo }) => {
    const item = document.createElement("li");
    const { texto } = CHIP_ESTADO_FINAL[estadoInfo.estado];
    item.textContent =
      alumno.nombre +
      " — " +
      (estadoInfo.estado === "riesgo_extraordinario"
        ? texto + " (necesita " + estadoInfo.necesario.toFixed(1) + " en T" + estadoInfo.trimestrePendiente + ")"
        : texto);
    lista.appendChild(item);
  });
  contenedor.appendChild(lista);
}

async function renderizarTablaFinal() {
  const contenedor = document.getElementById("evaluacion-final-contenedor");
  const alertas = document.getElementById("evaluacion-final-alertas");
  if (!contenedor) return;

  // Mismo motivo que renderizarTablaPromedios: "todos" los grupos a la
  // vez mezclaría alumnos de 3°C y 3°E en una sola tabla sin poder
  // distinguirlos.
  if (estadoEvaluacion.grupo === "todos") {
    mostrarSinResultados(contenedor, "Selecciona un grupo específico (3°C o 3°E) para ver la calificación final.");
    if (alertas) alertas.hidden = true;
    return;
  }

  mostrarSinResultados(contenedor, "Cargando…");

  const alumnos = await obtenerAlumnosParaCalificacion(estadoEvaluacion.grupo);
  if (alumnos.length === 0) {
    mostrarSinResultados(contenedor, "No hay alumnos registrados para este grupo.");
    if (alertas) alertas.hidden = true;
    return;
  }

  const idsParaProgreso = alumnos.filter((alumno) => alumno.auth_user_id != null).map((alumno) => alumno.auth_user_id);
  const datosPorTrimestre = await obtenerDatosPorTrimestreParaFinal(estadoEvaluacion.grupo, idsParaProgreso);

  const { tabla, alumnosEnRiesgo } = construirTablaFinal(alumnos, datosPorTrimestre);
  contenedor.innerHTML = "";
  contenedor.appendChild(tabla);
  actualizarAlertasFinal(alertas, alumnosEnRiesgo);
}

// Alterna entre #evaluacion-captura-vista, #evaluacion-promedios-vista y
// #evaluacion-final-vista (nunca más de una visible) y oculta Tipo/
// Secuencia mientras promedios o final están activos — esos dos filtros
// no aplican ahí. Trimestre TAMBIÉN se oculta en 'final' (siempre usa
// los 3, a diferencia de promedios que usa el trimestre elegido).
function activarVistasEvaluacion() {
  const botonVerPromedios = document.getElementById("evaluacion-boton-vista-promedios");
  const botonVerFinal = document.getElementById("evaluacion-boton-vista-final");
  const botonVolverPromedios = document.getElementById("evaluacion-boton-vista-captura");
  const botonVolverFinal = document.getElementById("evaluacion-final-boton-volver");
  const vistaCaptura = document.getElementById("evaluacion-captura-vista");
  const vistaPromedios = document.getElementById("evaluacion-promedios-vista");
  const vistaFinal = document.getElementById("evaluacion-final-vista");
  if (
    !botonVerPromedios ||
    !botonVerFinal ||
    !botonVolverPromedios ||
    !botonVolverFinal ||
    !vistaCaptura ||
    !vistaPromedios ||
    !vistaFinal
  )
    return;

  const filtroTipo = document.getElementById("evaluacion-filtro-tipo")?.closest(".calificacion-filtro");
  const filtroSecuencia = document.getElementById("evaluacion-filtro-secuencia")?.closest(".calificacion-filtro");
  const filtroTrimestre = document.getElementById("evaluacion-filtro-trimestre")?.closest(".calificacion-filtro");

  async function mostrarVista(vista) {
    vistaEvaluacionActiva = vista;
    vistaCaptura.hidden = vista !== "captura";
    vistaPromedios.hidden = vista !== "promedios";
    vistaFinal.hidden = vista !== "final";
    if (filtroTipo) filtroTipo.hidden = vista !== "captura";
    if (filtroSecuencia) filtroSecuencia.hidden = vista !== "captura";
    if (filtroTrimestre) filtroTrimestre.hidden = vista === "final";

    if (vista === "promedios") await renderizarTablaPromedios();
    else if (vista === "final") await renderizarTablaFinal();
  }

  botonVerPromedios.addEventListener("click", () => mostrarVista("promedios"));
  botonVerFinal.addEventListener("click", () => mostrarVista("final"));
  botonVolverPromedios.addEventListener("click", () => mostrarVista("captura"));
  botonVolverFinal.addEventListener("click", () => mostrarVista("captura"));
}

// Compartido entre exportarCSVPromedios/exportarCSVFinal: ambas tablas
// tienen la misma primera celda (nombre + N.° lista en un solo <td>) y la
// necesitan como 2 columnas CSV separadas.
function extraerNombreYNumeroListaDeFila(fila) {
  const nombre = fila.querySelector(".calificacion-tabla__alumno-nombre")?.textContent || "";
  return [nombre, fila.dataset.numeroLista || ""];
}

// dataset.valor es la fuente numérica limpia de una celda cuyo
// .textContent ya no es solo el número (trae un chip de rango pegado,
// ver crearFilaAlumnoPromedios/crearFilaAlumnoFinal); "—" (alumno sin
// cuenta/sin calificación) no lo trae, ahí cae al textContent normal.
function extraerValorCeldaCSV(celda) {
  return celda?.dataset.valor ? Number(celda.dataset.valor).toFixed(1) : celda?.textContent || "";
}

// Mismo patrón que exportarCSVCalificacion() (BOM UTF-8 + Blob) —
// compartido por exportarCSVPromedios/exportarCSVFinal.
function descargarCSV(lineas, nombreArchivo) {
  const blob = new Blob(["﻿" + lineas.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

// Lee la tabla de promedios ya renderizada: Alumno y N.° lista van en
// columnas separadas (a diferencia de la otra tabla, que las junta en
// una sola), pedido así para esta vista.
function exportarCSVPromedios() {
  const contenedor = document.getElementById("evaluacion-promedios-contenedor");
  const tabla = contenedor?.querySelector(".tabla-promedios");
  if (!tabla) return;

  const encabezados = ["Alumno", "N.° lista", "Tareas", "Actividades", "Proyectos", "Promedio final"];
  const lineas = [encabezados.map(escaparValorCSV).join(",")];

  tabla.querySelectorAll("tbody tr").forEach((fila) => {
    const celdas = Array.from(fila.querySelectorAll("td"));
    const [nombre, numeroLista] = extraerNombreYNumeroListaDeFila(fila);
    const valores = [
      nombre,
      numeroLista,
      celdas[1]?.textContent || "",
      celdas[2]?.textContent || "",
      celdas[3]?.textContent || "",
      extraerValorCeldaCSV(celdas[4]),
    ];
    lineas.push(valores.map(escaparValorCSV).join(","));
  });

  descargarCSV(lineas, "promedios_" + estadoEvaluacion.grupo + "_trimestre" + estadoEvaluacion.trimestre + ".csv");
}

function activarExportarCSVPromedios() {
  const boton = document.getElementById("evaluacion-promedios-boton-csv");
  if (!boton) return;
  boton.addEventListener("click", exportarCSVPromedios);
}

// Mismas 2 columnas iniciales que exportarCSVPromedios (ver
// extraerNombreYNumeroListaDeFila); T1/T2/T3 y Calificación final leen
// dataset.valor cuando existe (celda con chip pegado o "—" sin él).
function exportarCSVFinal() {
  const contenedor = document.getElementById("evaluacion-final-contenedor");
  const tabla = contenedor?.querySelector(".tabla-promedios");
  if (!tabla) return;

  const encabezados = ["Alumno", "N.° lista", "T1", "T2", "T3", "Calificación final", "Estado"];
  const lineas = [encabezados.map(escaparValorCSV).join(",")];

  tabla.querySelectorAll("tbody tr").forEach((fila) => {
    const celdas = Array.from(fila.querySelectorAll("td"));
    const [nombre, numeroLista] = extraerNombreYNumeroListaDeFila(fila);
    const valores = [
      nombre,
      numeroLista,
      extraerValorCeldaCSV(celdas[1]),
      extraerValorCeldaCSV(celdas[2]),
      extraerValorCeldaCSV(celdas[3]),
      extraerValorCeldaCSV(celdas[4]),
      celdas[5]?.textContent || "",
    ];
    lineas.push(valores.map(escaparValorCSV).join(","));
  });

  descargarCSV(lineas, "calificacion_final_" + estadoEvaluacion.grupo + ".csv");
}

function activarExportarCSVFinal() {
  const boton = document.getElementById("evaluacion-final-boton-csv");
  if (!boton) return;
  boton.addEventListener("click", exportarCSVFinal);
}

// Sin división "por tipo" (a diferencia de activarImpresionTablaCalificacion):
// las tablas de promedios/calificación final siempre tienen las mismas
// columnas fijas, así que no hace falta partirlas ni forzar landscape
// para que quepan. Su contenedor ya comparte la clase
// "calificacion-tabla-contenedor", así que las reglas @media print de
// "Impresión de la tabla general" (css/style.css) ya saben mostrar solo
// esto al imprimir — window.print() no necesita saber cuál de las dos
// vistas disparó el botón.
function activarImpresionTabla(idBoton) {
  const boton = document.getElementById(idBoton);
  if (!boton) return;
  boton.addEventListener("click", () => window.print());
}

async function inicializarModuloEvaluacion() {
  const selectTrimestre = document.getElementById("evaluacion-filtro-trimestre");
  if (!selectTrimestre) return; // no es admin.html

  // Mismo guard que el resto de módulos del panel: progreso también
  // está protegido por RLS para el rol docente.
  await promesaGuardPanelDocente;

  estadoEvaluacion.trimestre = String(trimestreDesbloqueado);
  selectTrimestre.value = estadoEvaluacion.trimestre;

  await actualizarOpcionesSecuenciaEvaluacion();
  await renderizarTablaEvaluacion();
  activarNavegacionMovilTablaEvaluacion();
  activarBuscadorEvaluacion();
  activarFormularioCalificar();
  activarBotonesValorRapidoCalificacion();
  activarVistasEvaluacion();
  activarExportarCSVPromedios();
  activarExportarCSVFinal();
  activarImpresionTabla("evaluacion-promedios-boton-imprimir");
  activarImpresionTabla("evaluacion-final-boton-imprimir");

  selectTrimestre.addEventListener("change", async () => {
    estadoEvaluacion.trimestre = selectTrimestre.value;
    await actualizarOpcionesSecuenciaEvaluacion();
    if (vistaEvaluacionActiva === "promedios") {
      await renderizarTablaPromedios();
    } else if (vistaEvaluacionActiva === "final") {
      await renderizarTablaFinal();
    } else {
      await renderizarTablaEvaluacion();
    }
  });

  const selectGrupo = document.getElementById("evaluacion-filtro-grupo");
  selectGrupo.addEventListener("change", async () => {
    estadoEvaluacion.grupo = selectGrupo.value;
    if (vistaEvaluacionActiva === "promedios") {
      await renderizarTablaPromedios();
    } else if (vistaEvaluacionActiva === "final") {
      await renderizarTablaFinal();
    } else {
      await renderizarTablaEvaluacion();
    }
  });

  const selectTipo = document.getElementById("evaluacion-filtro-tipo");
  selectTipo.addEventListener("change", async () => {
    estadoEvaluacion.tipo = selectTipo.value;
    await actualizarOpcionesSecuenciaEvaluacion();
    await renderizarTablaEvaluacion();
  });

  const selectSecuencia = document.getElementById("evaluacion-filtro-secuencia");
  selectSecuencia.addEventListener("change", async () => {
    estadoEvaluacion.secuencia = selectSecuencia.value;
    await renderizarTablaEvaluacion();
  });
}

/* ---------------------------------------------------------
   Módulo "Dashboard" (tab-dashboard)

   Panel-resumen de solo lectura para el docente: NO recalcula nada que
   ya calculen Calificación/Evaluación/Progreso — reutiliza
   calcularPromedioTrimestre (30/30/40), calcularAvanceGeneralAlumno
   (avance del ciclo), calcularNivelAlumno (umbrales del semáforo),
   fechaLimiteISO/resolverValorFechaPorGrupo (fecha límite por grupo) y
   abrirModalHistorialAlumno (modal de historial). Gráficas en SVG puro
   (skill dataviz), cada una con su vista de tabla alternativa.
   --------------------------------------------------------- */

// Sin opción "Todos" en esta pestaña (a diferencia de Calificación/
// Evaluación): la Ficha de análisis compara semáforo vs. tasa de entrega
// de UN grupo a la vez, así que "todos" mezclaría dos grupos distintos
// en una sola barra sin poder distinguirlos. 3°C es el default al cargar.
const estadoDashboard = { trimestre: null, grupo: "3C" };

const UMBRAL_RIESGO_ZONA_ROJA = 50;

// riesgo_score = (100 - % avance) * 0.6 + (% entregas tarde o faltantes) * 0.4.
// Pura: recibe los dos porcentajes ya calculados por el llamador, sin
// volver a consultar Supabase ni repetir la resolución de fechas.
function calcularRiesgoAlumno(avancePorcentaje, pctTardeOFaltante) {
  return (100 - avancePorcentaje) * 0.6 + pctTardeOFaltante * 0.4;
}

// Un Map por trimestre (misma forma que ya devuelve
// obtenerMapaProgresoCalificacion: `${alumno_id}-${tipo}-${item_id}` ->
// fila), consultados en paralelo — mismo patrón que ya usa
// calcularRachaPuntualidad() para los 3 trimestres de UN alumno, aquí
// para TODOS los alumnos filtrados a la vez.
async function obtenerMapasProgresoPorTrimestre(alumnoIds) {
  const trimestres = ["1", "2", "3"];
  const mapas = await Promise.all(
    trimestres.map((trimestre) =>
      obtenerMapaProgresoCalificacion(trimestre, ["tarea", "actividad", "proyecto"], alumnoIds)
    )
  );
  const porTrimestre = new Map();
  trimestres.forEach((trimestre, indice) => porTrimestre.set(trimestre, mapas[indice]));
  return porTrimestre;
}

// Adaptador que cierra sobre el progreso YA consultado de un alumno
// puntual, para poder pasarlo como "estaCompletado" a
// calcularAvanceGeneralAlumno() sin que esa función tenga que saber que
// aquí no existe progresoCache (ver comentario junto a su definición).
function crearEstaCompletadoParaAlumno(mapasPorTrimestre, alumno) {
  return (tipo, id, trimestre) =>
    Boolean(mapasPorTrimestre.get(String(trimestre))?.get(alumno.auth_user_id + "-" + tipo + "-" + id)?.completado);
}

// calcularPromedioTrimestre() espera un mapaProgreso ya scoped a UN solo
// alumno y con clave `${tipo}-${item_id}-${trimestre}` (así lo arma
// abrirModalHistorialAlumno para su propio uso). Aquí el progreso ya
// consultado viene en mapasPorTrimestre con la forma multi-alumno de
// obtenerMapaProgresoCalificacion (`${alumno_id}-${tipo}-${item_id}`,
// sin trimestre porque ya viene scoped a uno). Este adaptador solo
// traduce esa forma a la otra al vuelo — no reimplementa el cálculo del
// promedio, solo el .get() que esa función ya llama.
function crearMapaProgresoAdaptadoParaPromedio(mapasPorTrimestre, alumno) {
  return {
    get(claveTipoItemTrimestre) {
      const partes = claveTipoItemTrimestre.split("-");
      const trimestre = partes.pop();
      const idItem = partes.pop();
      const tipo = partes.join("-");
      return mapasPorTrimestre.get(trimestre)?.get(alumno.auth_user_id + "-" + tipo + "-" + idItem);
    },
  };
}

// Equivalente a tieneAlgunaCalificacionCapturada(), pero para una fuente
// de progreso que solo expone .get() (ver crearMapaProgresoAdaptadoParaPromedio
// arriba) — esa fuente no tiene .values() para recorrer, así que en vez de
// iterar el mapa se recorre el catálogo real de items y se consulta cada
// clave. Recorre como máximo los ~21 items del trimestre, mismo orden de
// magnitud que ya recorre calcularPromedioTrimestre() para el mismo alumno.
function tieneAlgunaCalificacionCapturadaEnItems(itemsPorTipo, trimestre, mapaProgreso) {
  return ["tarea", "actividad", "proyecto"].some((tipo) =>
    (itemsPorTipo[tipo] || []).some(
      (item) => mapaProgreso.get(tipo + "-" + item.id + "-" + trimestre)?.calificacion != null
    )
  );
}

// % de entregables YA VENCIDOS de "entregables" (del trimestre/grupo del
// alumno) que llegaron tarde o nunca llegaron. Reutiliza
// fechaLimiteISO()/resolverValorFechaPorGrupo() para la fecha límite —
// mismo criterio que calcularRachaPuntualidad(), sin reimplementarlo:
// esa función está scoped al alumno de la sesión activa (progresoCache),
// aquí se necesita para alumnos arbitrarios vía mapaProgresoTrimestre ya
// consultado. Entregables aún no vencidos no cuentan ni a favor ni en
// contra (todavía no se puede juzgar si llegarán tarde).
function calcularPctTardeOFaltante(entregables, mapaProgresoTrimestre, alumno) {
  let evaluables = 0;
  let tardeOFaltante = 0;

  entregables.forEach((item) => {
    const fechaLimite = fechaLimiteISO(item.tipoEntregable, item, alumno.grupo);
    if (!fechaLimite) return;
    if (new Date(fechaLimite + "T23:59:59") >= new Date()) return;

    evaluables++;
    const fila = mapaProgresoTrimestre.get(alumno.auth_user_id + "-" + item.tipoEntregable + "-" + item.id);
    if (!fila || !fila.completado) {
      tardeOFaltante++;
      return;
    }
    if (fila.actualizado_en && new Date(fila.actualizado_en) > new Date(fechaLimite + "T23:59:59")) {
      tardeOFaltante++;
    }
  });

  return evaluables === 0 ? 0 : Math.round((tardeOFaltante / evaluables) * 100);
}

// Desglose por tipo de entregable de calcularPctTardeOFaltante para la
// gráfica de puntualidad del Dashboard (ver renderizarPuntualidadPorTipoDashboard()):
// mismo cálculo puro reutilizado tal cual, solo filtrando los entregables
// de entrada por tipo antes de llamarlo — sin reimplementar la lógica de
// "evaluable"/"tarde o faltante".
function calcularPctTardeOFaltantePorTipo(entregablesDelAlumno, mapaProgresoTrimestre, alumno) {
  const resultado = {};
  ["tarea", "actividad", "proyecto"].forEach((tipo) => {
    const entregablesDelTipo = entregablesDelAlumno.filter((item) => item.tipoEntregable === tipo);
    resultado[tipo] = calcularPctTardeOFaltante(entregablesDelTipo, mapaProgresoTrimestre, alumno);
  });
  return resultado;
}

// KPI 🚩 "Riesgo de extraordinario" del Dashboard — concepto DISTINTO de
// "Alumnos en riesgo" (🚨, calcularRiesgoAlumno: avance/puntualidad de UN
// trimestre): este cuenta alumnos con 2 trimestres reprobados del ciclo,
// vía la MISMA calcularEstadoFinalAlumno() que ya usa la vista
// "Calificación Final" de Evaluación. Ignora a propósito el filtro de
// Trimestre del Dashboard (estadoDashboard.trimestre): siempre mira los
// 3 trimestres completos, sea cual sea el trimestre elegido ahí.
// "alumnos" ya viene filtrado por grupo y con auth_user_id (mismo filtro
// que construirResumenAlumnosDashboard), así que no vuelve a consultar
// alumnos_registro.
async function contarAlumnosRiesgoExtraordinario(grupo, alumnos) {
  if (alumnos.length === 0) return 0;

  const idsAlumnos = alumnos.map((alumno) => alumno.auth_user_id);
  const datosPorTrimestre = await obtenerDatosPorTrimestreParaFinal(grupo, idsAlumnos);

  return alumnos.filter((alumno) => {
    const promediosPorTrimestre = calcularPromediosPorTrimestreDeAlumno(alumno, datosPorTrimestre);
    return ESTADOS_RIESGO_EXTRAORDINARIO.includes(calcularEstadoFinalAlumno(promediosPorTrimestre).estado);
  }).length;
}

// Núcleo del módulo: UNA sola consulta de alumnos + progreso (3
// trimestres en paralelo) para derivar todo lo que necesitan los KPIs,
// el semáforo, la tasa de entrega y el Top 5 — evita repetir esas
// consultas por cada pieza del dashboard.
async function construirResumenAlumnosDashboard(trimestre, grupoFiltro) {
  const alumnos = (await obtenerAlumnosParaCalificacion(grupoFiltro)).filter(
    (alumno) => alumno.usado !== false && alumno.auth_user_id
  );
  if (alumnos.length === 0) return [];

  const idsAlumnos = alumnos.map((alumno) => alumno.auth_user_id);
  const mapasPorTrimestre = await obtenerMapasProgresoPorTrimestre(idsAlumnos);
  const mapaProgresoTrimestre = mapasPorTrimestre.get(trimestre);
  const entregablesDelTrimestre = await obtenerEntregablesPorTipo("todos", trimestre);

  const resultados = [];
  for (const alumno of alumnos) {
    const coincideConGrupoDelAlumno = (item) => item.grupo === "todos" || item.grupo === alumno.grupo;
    const entregablesDelAlumno = entregablesDelTrimestre.filter(coincideConGrupoDelAlumno);

    const itemsPorTipo = { tarea: [], actividad: [], proyecto: [] };
    entregablesDelAlumno.forEach((item) => itemsPorTipo[item.tipoEntregable]?.push(item));
    const mapaProgresoAdaptado = crearMapaProgresoAdaptadoParaPromedio(mapasPorTrimestre, alumno);
    // Mismo guard que ya usan crearFilaAlumnoPromedios/crearFilaAlumnoFinal:
    // sin ninguna calificación capturada, promedioFinal queda null (nunca
    // 0) — antes de este fix se llamaba calcularPromedioTrimestre() sin
    // chequeo, y ese null/0 podía contagiar de NaN el promedio del grupo
    // completo en renderizarKPIsDashboard/metricasGrupoDashboard.
    const promedio = tieneAlgunaCalificacionCapturadaEnItems(itemsPorTipo, trimestre, mapaProgresoAdaptado)
      ? calcularPromedioTrimestre(alumno.auth_user_id, trimestre, itemsPorTipo, mapaProgresoAdaptado, alumno.grupo)
      : null;

    const detalleAvance = await calcularAvanceGeneralAlumnoDetallado(
      { grupo: alumno.grupo },
      crearEstaCompletadoParaAlumno(mapasPorTrimestre, alumno)
    );
    const avance = detalleAvance.avance;

    const pctTardeOFaltante = calcularPctTardeOFaltante(entregablesDelAlumno, mapaProgresoTrimestre, alumno);
    const pctTardeOFaltantePorTipo = calcularPctTardeOFaltantePorTipo(entregablesDelAlumno, mapaProgresoTrimestre, alumno);

    resultados.push({
      alumno,
      avance,
      avancePorTipo: detalleAvance.porTipo,
      promedioFinal: promedio?.promedioFinal ?? null,
      pctTardeOFaltante,
      pctTardeOFaltantePorTipo,
      riesgo: calcularRiesgoAlumno(avance, pctTardeOFaltante),
    });
  }
  return resultados;
}

// Cuenta directa sobre "progreso" (completado=true, calificacion nula):
// no hay una función previa que cuente esto, así que es consulta nueva,
// pero sigue el mismo patrón de las demás (Supabase + IDs ya filtrados).
async function contarPendientesPorCalificar(trimestre, idsAlumnos) {
  if (idsAlumnos.length === 0) return 0;

  const { count, error } = await obtenerDatos("progreso", {
    count: "exact",
    head: true,
    eq: { trimestre, completado: true },
    esNulo: { calificacion: true },
    in: { alumno_id: idsAlumnos },
  });

  return error ? 0 : count || 0;
}

// Histórico semanal de "progreso" (calificacion/completado) para los
// sparklines de KPI, SCOPEADO AL TRIMESTRE FILTRADO (a propósito distinto
// del alcance de calcularAvanceGeneralAlumno, que es de todo el ciclo —
// ver nota junto a construirTendenciaKPI: el sparkline muestra dinámica
// reciente del trimestre, no una réplica histórica del número ciclo-wide
// del KPI). Una sola consulta adicional (no una por KPI), reutilizando
// los ids ya resueltos por construirResumenAlumnosDashboard.
// pendientesSemanal (agregado junto con Commit C de "extender sparkline
// a las 4 KPIs"): cuenta, por semana, filas con completado=true Y
// calificacion=null a partir de actualizado_en — es decir, "de las
// entregas que SIGUEN sin calificar hoy, cuántas llegaron cada semana".
// No es "tamaño del backlog medido esa semana en el pasado" (para eso
// haría falta la fecha en que se calificó cada una, que no se
// registra aparte de actualizado_en, que se pisa al calificar) — es
// una vista honesta de "antigüedad del backlog actual", derivada de la
// MISMA fila ya traída para promedioSemanal/avanceSemanal, sin
// consulta nueva. "Alumnos en riesgo" no tiene un equivalente así de
// simple: su fórmula (calcularRiesgoAlumno) es POR ALUMNO y depende de
// fechas límite por entregable, no de una sola columna de progreso —
// reconstruirla semana a semana requeriría re-correr esa fórmula por
// alumno con un corte de fecha distinto en cada semana, mucho más
// trabajo que sumar una columna más al mismo bucket. Se deja sin
// tendencia a propósito (ver renderizarKPIsDashboard).
async function obtenerTendenciasSemanalesDashboard(trimestre, grupo, idsAlumnos) {
  const vacio = { promedioSemanal: [], avanceSemanal: [], pendientesSemanal: [] };
  if (idsAlumnos.length === 0) return vacio;

  const [{ data, error }, entregablesTodos] = await Promise.all([
    obtenerDatos("progreso", {
      select: "calificacion, completado, actualizado_en",
      eq: { trimestre },
      in: { alumno_id: idsAlumnos },
      noNulo: ["actualizado_en"],
      order: { columna: "actualizado_en", ascending: true },
    }),
    obtenerEntregablesPorTipo("todos", trimestre),
  ]);

  if (error || !data || data.length === 0) return vacio;

  // Mismos entregables que ve cada alumno del grupo filtrado (grupo
  // fijo, sin opción "Todos" en este módulo) × cantidad de alumnos =
  // total de "completados posibles" para el % de avance acumulado.
  const totalEntregablesGrupo =
    entregablesTodos.filter((item) => item.grupo === "todos" || item.grupo === grupo).length * idsAlumnos.length;

  const inicioSemanaISO = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const diaISO = (fecha.getDay() + 6) % 7; // lunes = 0
    fecha.setUTCDate(fecha.getUTCDate() - diaISO);
    return fecha.toISOString().slice(0, 10);
  };

  const semanas = new Map();
  data.forEach((fila) => {
    const clave = inicioSemanaISO(fila.actualizado_en);
    if (!semanas.has(clave)) {
      semanas.set(clave, { sumaCalificacion: 0, nCalificaciones: 0, completadas: 0, pendientes: 0 });
    }
    const bucket = semanas.get(clave);
    if (fila.calificacion != null) {
      bucket.sumaCalificacion += Number(fila.calificacion);
      bucket.nCalificaciones++;
    }
    if (fila.completado) bucket.completadas++;
    if (fila.completado && fila.calificacion == null) bucket.pendientes++;
  });

  const clavesOrdenadas = [...semanas.keys()].sort();
  // Con menos de 3 semanas con datos, una línea no comunica una
  // tendencia real (2 puntos siempre "suben" o "bajan") — se omite el
  // sparkline en vez de simular una tendencia que no existe.
  if (clavesOrdenadas.length < 3) return vacio;

  const promedioSemanal = [];
  const avanceSemanal = [];
  const pendientesSemanal = [];
  let acumuladoCompletadas = 0;

  clavesOrdenadas.forEach((clave) => {
    const bucket = semanas.get(clave);
    if (bucket.nCalificaciones > 0) {
      promedioSemanal.push(bucket.sumaCalificacion / bucket.nCalificaciones);
    }
    acumuladoCompletadas += bucket.completadas;
    if (totalEntregablesGrupo > 0) {
      avanceSemanal.push(Math.min(100, (acumuladoCompletadas / totalEntregablesGrupo) * 100));
    }
    // A diferencia de promedioSemanal (que omite semanas sin
    // calificaciones), aquí 0 es un dato real ("esa semana no dejó
    // backlog pendiente"), no una semana sin datos — se empuja siempre.
    pendientesSemanal.push(bucket.pendientes);
  });

  return {
    promedioSemanal: promedioSemanal.length >= 3 ? promedioSemanal : [],
    avanceSemanal: avanceSemanal.length >= 3 ? avanceSemanal : [],
    pendientesSemanal: pendientesSemanal.length >= 3 ? pendientesSemanal : [],
  };
}

function formatearValorTendencia(valor, unidad) {
  if (unidad === "porcentaje") return Math.round(valor) + "%";
  // "conteo" (Pendientes por calificar): entero sin decimales — a
  // diferencia de "decimal" (Promedio general, escala 0-10), acá
  // valor.toFixed(1) daría "5.0" en vez de "5" para un simple número
  // de entregas.
  if (unidad === "conteo") return String(Math.round(valor));
  return valor.toFixed(1);
}

// SVG puro (skill dataviz, mismo enfoque que construirFiguraBarraApilada
// más abajo): polyline + relleno translúcido, sin librerías. role="img" +
// <title> con el rango en palabras porque una línea sola no dice nada a
// un lector de pantalla.
function construirSparklineSVG(valores, unidad) {
  const svgNS = "http://www.w3.org/2000/svg";
  const ANCHO = 72;
  const ALTO = 24;
  const PAD = 2;

  const minVal = Math.min(...valores);
  const maxVal = Math.max(...valores);
  const rango = maxVal - minVal || 1; // todos los valores iguales: línea plana, no división entre 0

  const puntos = valores.map((valor, indice) => {
    const x = PAD + (indice / (valores.length - 1)) * (ANCHO - PAD * 2);
    const y = ALTO - PAD - ((valor - minVal) / rango) * (ALTO - PAD * 2);
    return [x, y];
  });
  const puntosTexto = puntos.map(([x, y]) => x + "," + y).join(" ");

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 " + ANCHO + " " + ALTO);
  svg.setAttribute("role", "img");
  svg.classList.add("kpi-tarjeta__tendencia-svg");

  const titulo = document.createElementNS(svgNS, "title");
  titulo.textContent =
    "Tendencia de las últimas " +
    valores.length +
    " semanas: de " +
    formatearValorTendencia(valores[0], unidad) +
    " a " +
    formatearValorTendencia(valores[valores.length - 1], unidad);
  svg.appendChild(titulo);

  const relleno = document.createElementNS(svgNS, "polygon");
  relleno.setAttribute(
    "points",
    PAD + "," + (ALTO - PAD) + " " + puntosTexto + " " + (ANCHO - PAD) + "," + (ALTO - PAD)
  );
  relleno.classList.add("kpi-tarjeta__tendencia-relleno");
  svg.appendChild(relleno);

  const linea = document.createElementNS(svgNS, "polyline");
  linea.setAttribute("points", puntosTexto);
  linea.classList.add("kpi-tarjeta__tendencia-linea");
  svg.appendChild(linea);

  return svg;
}

// null si no hay suficiente histórico (ver obtenerTendenciasSemanalesDashboard)
// — el llamador simplemente no agrega el bloque, en vez de mostrar un
// sparkline vacío o inventado.
//
// menorEsMejor: la flecha (▲/▼) siempre refleja la dirección real del
// número, pero el COLOR es un juicio de valor aparte — para la mayoría
// de los KPI "subir" es la mejora (más promedio, más avance), pero en
// Pendientes por calificar es al revés (menos pendientes = mejora).
// Sin este parámetro, un backlog creciendo se pintaría verde.
function construirTendenciaKPI(valores, unidad, menorEsMejor) {
  if (!valores || valores.length < 3) return null;

  const contenedor = document.createElement("div");
  contenedor.className = "kpi-tarjeta__tendencia";
  contenedor.appendChild(construirSparklineSVG(valores, unidad));

  const primero = valores[0];
  const ultimo = valores[valores.length - 1];
  const delta = ultimo - primero;
  const deltaAbsFormateado =
    unidad === "porcentaje"
      ? Math.round(Math.abs(delta)) + " pts"
      : unidad === "conteo"
      ? String(Math.round(Math.abs(delta)))
      : Math.abs(delta).toFixed(1);

  const esMejora = menorEsMejor ? delta <= 0 : delta >= 0;

  const deltaTexto = document.createElement("span");
  deltaTexto.className =
    "kpi-tarjeta__tendencia-delta " +
    (esMejora ? "kpi-tarjeta__tendencia-delta--mejora" : "kpi-tarjeta__tendencia-delta--empeora");
  deltaTexto.textContent = (delta >= 0 ? "▲ " : "▼ ") + deltaAbsFormateado;
  contenedor.appendChild(deltaTexto);

  return contenedor;
}

// Mensaje visible cuando construirTendenciaKPI no dibuja nada (exige
// >=3 puntos, ver esa función) — antes la tarjeta se quedaba sin ese
// bloque sin explicar por qué, y se leía como que faltaba algo por
// error. "hayFuente" distingue "sí hay una serie que calcular, solo
// falta historial todavía" (Promedio general/Avance del ciclo/
// Pendientes con <3 semanas) de "esta KPI no tiene ninguna fuente de
// tendencia implementada" (Alumnos en riesgo — ver nota junto a
// obtenerTendenciasSemanalesDashboard sobre por qué no es trivial).
function construirMensajeTendenciaPendiente(hayFuente) {
  const mensaje = document.createElement("p");
  mensaje.className = "kpi-tarjeta__tendencia-pendiente";
  mensaje.textContent = hayFuente
    ? "Necesitas más semanas de datos para ver la tendencia"
    : "Tendencia no disponible todavía para este KPI";
  return mensaje;
}

function construirTarjetaKPISimple(datos) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "kpi-tarjeta";

  const etiqueta = document.createElement("h3");
  etiqueta.className = "kpi-tarjeta__etiqueta";
  etiqueta.textContent = datos.icono + " " + datos.titulo;

  const valor = document.createElement("div");
  valor.className = "kpi-tarjeta__valor";
  valor.textContent = datos.valor;

  tarjeta.append(etiqueta, valor);

  const tendenciaEl = construirTendenciaKPI(datos.tendencia, datos.unidad, datos.menorEsMejor);
  tarjeta.appendChild(tendenciaEl || construirMensajeTendenciaPendiente(datos.tendenciaDisponible !== false));

  return tarjeta;
}

const ETIQUETAS_TIPO_ENTREGABLE_DASHBOARD = { tarea: "Tareas", actividad: "Actividades", proyecto: "Proyectos" };

// Card "Avance del ciclo": barra de progreso como punto focal + desglose por
// tipo de entregable debajo (patrón "Storage Dashboard" de 21st.dev,
// traducido a HTML/CSS puro). porTipoPromedio ya viene promediado entre
// resumenAlumnos, construido a partir de avancePorTipo de cada alumno
// (calcularAvanceGeneralAlumnoDetallado), sin duplicar ese cálculo aquí.
function construirTarjetaAvanceCiclo(avancePromedio, porTipoPromedio, tendencia) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "kpi-tarjeta";

  const etiqueta = document.createElement("h3");
  etiqueta.className = "kpi-tarjeta__etiqueta";
  etiqueta.textContent = "🎯 Avance del ciclo";

  const valor = document.createElement("div");
  valor.className = "kpi-tarjeta__valor";
  valor.textContent = avancePromedio + "%";

  const barra = document.createElement("div");
  barra.className = "kpi-tarjeta__barra";
  const relleno = document.createElement("div");
  relleno.className = "kpi-tarjeta__relleno";
  relleno.style.width = avancePromedio + "%";
  barra.appendChild(relleno);

  tarjeta.append(etiqueta, valor, barra);

  const desglose = document.createElement("ul");
  desglose.className = "kpi-tarjeta__desglose";
  Object.entries(ETIQUETAS_TIPO_ENTREGABLE_DASHBOARD).forEach(([tipo, etiquetaTipo]) => {
    const item = document.createElement("li");
    const etiquetaEl = document.createElement("span");
    etiquetaEl.textContent = etiquetaTipo;
    const valorEl = document.createElement("span");
    valorEl.textContent = (porTipoPromedio[tipo] ?? 0) + "%";
    item.append(etiquetaEl, valorEl);
    desglose.appendChild(item);
  });
  tarjeta.appendChild(desglose);

  const tendenciaEl = construirTendenciaKPI(tendencia, "porcentaje");
  tarjeta.appendChild(tendenciaEl || construirMensajeTendenciaPendiente(true));

  return tarjeta;
}

function renderizarKPIsDashboard(resumenAlumnos, pendientes, tendencias, riesgoExtraordinario) {
  const contenedor = document.getElementById("dashboard-kpis");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const total = resumenAlumnos.length;
  // Excluye del promedio a los alumnos sin dato (promedioFinal null) en
  // vez de tratarlos como 0 — un solo null en la suma sin filtrar
  // contagiaba de NaN el "Promedio general" de TODO el grupo.
  const resumenConPromedio = resumenAlumnos.filter((r) => r.promedioFinal != null);
  // null (no 0) cuando nadie del grupo tiene promedioFinal todavía —
  // 0 aquí se convertía en "0.0" al pasar por .toFixed(1) más abajo,
  // mostrando una calificación real donde debía decir "—" (bug
  // encontrado en producción: T1/T3 de 3°C recién arrancados).
  const promedioGeneral =
    resumenConPromedio.length === 0
      ? null
      : resumenConPromedio.reduce((suma, r) => suma + r.promedioFinal, 0) / resumenConPromedio.length;
  const avancePromedio =
    total === 0 ? 0 : Math.round(resumenAlumnos.reduce((suma, r) => suma + r.avance, 0) / total);
  const enRiesgo = resumenAlumnos.filter((r) => r.riesgo >= UMBRAL_RIESGO_ZONA_ROJA).length;
  const porTipoPromedio = {};
  Object.keys(ETIQUETAS_TIPO_ENTREGABLE_DASHBOARD).forEach((tipo) => {
    porTipoPromedio[tipo] =
      total === 0
        ? 0
        : Math.round(resumenAlumnos.reduce((suma, r) => suma + (r.avancePorTipo?.[tipo] || 0), 0) / total);
  });

  contenedor.append(
    construirTarjetaKPISimple({
      icono: "📈",
      titulo: "Promedio general",
      valor: promedioGeneral == null ? "—" : promedioGeneral.toFixed(1),
      tendencia: tendencias?.promedioSemanal,
      unidad: "decimal",
    }),
    construirTarjetaKPISimple({
      icono: "✅",
      titulo: "Pendientes por calificar",
      valor: String(pendientes),
      tendencia: tendencias?.pendientesSemanal,
      unidad: "conteo",
      // Menos pendientes = mejora (al revés que promedio/avance, donde
      // subir es lo bueno) — ver nota junto a construirTendenciaKPI.
      menorEsMejor: true,
    }),
    construirTarjetaAvanceCiclo(avancePromedio, porTipoPromedio, tendencias?.avanceSemanal),
    construirTarjetaKPISimple({
      icono: "🚨",
      titulo: "Alumnos en riesgo",
      valor: String(enRiesgo),
      tendencia: null,
      unidad: null,
      // A diferencia de las otras 3, esta KPI no tiene ninguna fuente de
      // tendencia semanal calculada (ver el comentario largo junto a
      // obtenerTendenciasSemanalesDashboard: calcularRiesgoAlumno es por
      // alumno y depende de fechas límite por entregable, reconstruirla
      // semana a semana es scope mayor al de este commit) —
      // tendenciaDisponible:false le pone a la tarjeta el mensaje
      // correcto ("no disponible todavía") en vez de "necesitas más
      // semanas", que prometería algo que más historial no va a resolver.
      tendenciaDisponible: false,
    }),
    construirTarjetaKPISimple({
      icono: "🚩",
      titulo: "Riesgo de extraordinario",
      valor: String(riesgoExtraordinario),
      tendencia: null,
      unidad: null,
      // Mismo motivo que "Alumnos en riesgo": calcularEstadoFinalAlumno
      // es por alumno y mira los 3 trimestres completos, reconstruirlo
      // semana a semana no aplica aquí (no hay un "avance parcial del
      // ciclo" que trackear por semana, a diferencia del avance/promedio
      // de un solo trimestre).
      tendenciaDisponible: false,
    })
  );
}

// Construye una gráfica de barra horizontal 100%-apilada de UNA sola
// fila (SVG puro, skill dataviz) para el grupo actualmente seleccionado
// en el filtro de la pestaña — ya no hay vista "ambos grupos lado a
// lado" (ver estadoDashboard: esta pestaña no tiene opción "Todos").
// Leyenda + vista de tabla alternativa siempre presente (toggle, mismo
// patrón ya usado en "Ver tabla de promedios" del módulo Evaluación).
// Reutilizada por el semáforo (3 categorías) y la tasa de entrega (2
// categorías): misma pieza visual, distintas categorías/colores. El
// título ya lo pone el <h4> de la celda de la Ficha en el HTML, así que
// aquí no se repite como figcaption visible.
let contadorFigurasDashboard = 0;
function construirFiguraBarraApilada({ tituloAccesible, categorias, valores, colores, inkPorCategoria }) {
  contadorFigurasDashboard++;
  const idTabla = "dashboard-tabla-" + contadorFigurasDashboard;
  const svgNS = "http://www.w3.org/2000/svg";

  const figura = document.createElement("figure");
  figura.className = "dashboard-grafica";

  const leyenda = document.createElement("div");
  leyenda.className = "dashboard-grafica__leyenda";
  categorias.forEach((categoria) => {
    const item = document.createElement("span");
    item.className = "dashboard-grafica__leyenda-item";
    const swatch = document.createElement("span");
    swatch.className = "dashboard-grafica__swatch";
    swatch.style.backgroundColor = colores[categoria];
    swatch.setAttribute("aria-hidden", "true");
    item.append(swatch, document.createTextNode(categoria));
    leyenda.appendChild(item);
  });
  figura.appendChild(leyenda);

  const ANCHO = 320;
  const ALTO_BARRA = 28;
  const ALTO = ALTO_BARRA + 12;
  const GAP = 2;
  const Y = 6;

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 " + ANCHO + " " + ALTO);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", tituloAccesible + " — ver la tabla de abajo para el detalle exacto");
  svg.classList.add("dashboard-grafica__svg");

  const track = document.createElementNS(svgNS, "rect");
  track.setAttribute("x", "0");
  track.setAttribute("y", String(Y));
  track.setAttribute("width", String(ANCHO));
  track.setAttribute("height", String(ALTO_BARRA));
  track.setAttribute("rx", "4");
  track.setAttribute("class", "dashboard-grafica__track");
  svg.appendChild(track);

  let xActual = 0;
  categorias.forEach((categoria) => {
    const valor = valores[categoria] || 0;
    const anchoSegmento = Math.max(0, (valor / 100) * ANCHO - GAP);
    if (anchoSegmento <= 0) return;

    const segmento = document.createElementNS(svgNS, "rect");
    segmento.setAttribute("x", String(xActual));
    segmento.setAttribute("y", String(Y));
    segmento.setAttribute("width", String(anchoSegmento));
    segmento.setAttribute("height", String(ALTO_BARRA));
    segmento.setAttribute("fill", colores[categoria]);
    const tituloSegmento = document.createElementNS(svgNS, "title");
    tituloSegmento.textContent = categoria + ": " + valor + "%";
    segmento.appendChild(tituloSegmento);
    svg.appendChild(segmento);

    // Etiqueta directa solo si el segmento mide lo suficiente para el
    // texto sin recortarlo (ver marks-and-anatomy.md de la skill
    // dataviz): si no cabe, el valor sigue disponible en la leyenda +
    // la tabla, nunca se recorta con overflow.
    if (anchoSegmento >= 30) {
      const texto = document.createElementNS(svgNS, "text");
      texto.setAttribute("x", String(xActual + anchoSegmento / 2));
      texto.setAttribute("y", String(Y + ALTO_BARRA / 2 + 4));
      texto.setAttribute(
        "class",
        "dashboard-grafica__texto-segmento dashboard-grafica__texto-segmento--" + inkPorCategoria[categoria]
      );
      texto.textContent = valor + "%";
      svg.appendChild(texto);
    }

    xActual += anchoSegmento + GAP;
  });

  figura.appendChild(svg);

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton-secundario dashboard-grafica__boton-tabla";
  boton.textContent = "📊 Ver como tabla";
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute("aria-controls", idTabla);
  figura.appendChild(boton);

  const contenedorTabla = document.createElement("div");
  contenedorTabla.id = idTabla;
  contenedorTabla.className = "dashboard-grafica__tabla";
  contenedorTabla.hidden = true;

  const tabla = document.createElement("table");
  tabla.className = "tabla-calificacion";
  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  categorias.forEach((categoria) => {
    const th = document.createElement("th");
    th.textContent = categoria;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  const filaValores = document.createElement("tr");
  categorias.forEach((categoria) => {
    const td = document.createElement("td");
    td.textContent = (valores[categoria] || 0) + "%";
    filaValores.appendChild(td);
  });
  tbody.appendChild(filaValores);
  tabla.appendChild(tbody);
  contenedorTabla.appendChild(tabla);
  figura.appendChild(contenedorTabla);

  boton.addEventListener("click", () => {
    const seVaAAbrir = contenedorTabla.hidden;
    contenedorTabla.hidden = !seVaAAbrir;
    boton.setAttribute("aria-expanded", String(seVaAAbrir));
  });

  return figura;
}

// Umbrales EXACTOS de calcularNivelAlumno() (0/50/75): Rojo <50, Amarillo
// 50-74, Verde >=75 — no se inventa una escala nueva. Colores: los 3
// tokens de estado ya existentes y validados AA en el sitio
// (--color-estado-cuenta-activa/registro-incompleto/vencido), reutilizados
// en vez de definir un tercer trío nuevo.
const COLORES_SEMAFORO = {
  Verde: "var(--color-estado-cuenta-activa)",
  Amarillo: "var(--color-estado-registro-incompleto)",
  Rojo: "var(--color-estado-vencido)",
};
const INK_SEMAFORO = { Verde: "oscuro", Amarillo: "oscuro", Rojo: "claro" };

function renderizarSemaforoDashboard(resumenAlumnos) {
  const contenedor = document.getElementById("dashboard-semaforo");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const total = resumenAlumnos.length;
  const pct = (predicado) => (total === 0 ? 0 : Math.round((resumenAlumnos.filter(predicado).length / total) * 100));
  const valores = {
    Verde: pct((r) => r.avance >= 75),
    Amarillo: pct((r) => r.avance >= 50 && r.avance < 75),
    Rojo: pct((r) => r.avance < 50),
  };

  contenedor.appendChild(
    construirFiguraBarraApilada({
      tituloAccesible: "Distribución de alumnos por nivel de avance",
      categorias: ["Verde", "Amarillo", "Rojo"],
      valores,
      colores: COLORES_SEMAFORO,
      inkPorCategoria: INK_SEMAFORO,
    })
  );
}

// Mismos 2 de los 3 tokens del semáforo (cuenta-activa/vencido): "a
// tiempo" y "atrasado" son, en espíritu, los mismos dos estados que ya
// usa el badge "atrasada" en el resto del sitio.
const COLORES_ENTREGA = {
  "A tiempo": "var(--color-estado-cuenta-activa)",
  "Tarde o faltante": "var(--color-estado-vencido)",
};
const INK_ENTREGA = { "A tiempo": "oscuro", "Tarde o faltante": "claro" };

function renderizarTasaEntregaDashboard(resumenAlumnos) {
  const contenedor = document.getElementById("dashboard-entrega");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const total = resumenAlumnos.length;
  const promedioTarde =
    total === 0 ? 0 : Math.round(resumenAlumnos.reduce((suma, r) => suma + r.pctTardeOFaltante, 0) / total);
  const valores = { "A tiempo": 100 - promedioTarde, "Tarde o faltante": promedioTarde };

  contenedor.appendChild(
    construirFiguraBarraApilada({
      tituloAccesible: "Tasa de entregas a tiempo vs. tarde o faltantes",
      categorias: ["A tiempo", "Tarde o faltante"],
      valores,
      colores: COLORES_ENTREGA,
      inkPorCategoria: INK_ENTREGA,
    })
  );
}

// "Ver historial" reutiliza abrirModalHistorialAlumno() TAL CUAL (mismo
// modal que Calificación): closure directa sobre el alumno, sin
// necesitar el mapa id->alumno que sí hace falta en la tabla matriz
// (ahí la delegación solo tiene el data-alumno-id del botón; aquí el
// botón se construye ya con el alumno completo a mano).
function renderizarTop5RiesgoDashboard(resumenAlumnos) {
  const contenedor = document.getElementById("dashboard-top-riesgo");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const top5 = [...resumenAlumnos].sort((a, b) => b.riesgo - a.riesgo).slice(0, 5);

  if (top5.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "sin-resultados";
    vacio.textContent = "Sin alumnos con cuenta activa para este filtro.";
    contenedor.appendChild(vacio);
    return;
  }

  const lista = document.createElement("ul");
  lista.className = "dashboard-riesgo-lista";

  top5.forEach(({ alumno, riesgo }) => {
    const li = document.createElement("li");
    li.className = "dashboard-riesgo-lista__item";
    if (riesgo >= UMBRAL_RIESGO_ZONA_ROJA) li.classList.add("dashboard-riesgo-lista__item--zona-roja");

    const info = document.createElement("span");
    info.className = "dashboard-riesgo-lista__info";
    info.textContent = alumno.nombre + " · " + textoGrupo(alumno.grupo) + " · N.° " + alumno.numero_lista;
    li.appendChild(info);

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-secundario";
    boton.setAttribute("aria-label", "Ver historial completo de " + alumno.nombre);
    boton.textContent = "👁️ Ver historial";
    boton.addEventListener("click", () => abrirModalHistorialAlumno(alumno));
    li.appendChild(boton);

    lista.appendChild(li);
  });

  contenedor.appendChild(lista);
}

// Métricas agregadas de un resumenAlumnos (mismo array que produce
// construirResumenAlumnosDashboard) para la comparativa de grupos: cero
// cálculo nuevo, solo promedios/porcentajes sobre promedioFinal/
// pctTardeOFaltante/riesgo que esa función ya deja listos por alumno.
function metricasGrupoDashboard(resumenAlumnos) {
  const total = resumenAlumnos.length;
  // promedio:null (no 0) tanto sin alumnos como sin nadie con
  // promedioFinal todavía — el consumidor (renderizarComparativaGruposDashboard)
  // decide entre "—" y .toFixed(1), mismo criterio que promedioGeneral
  // en renderizarKPIsDashboard.
  if (total === 0) return { promedio: null, pctATiempo: 0, pctEnRiesgo: 0 };

  // Mismo criterio que renderizarKPIsDashboard: excluye del promedio a
  // los alumnos sin dato (promedioFinal null), no los cuenta como 0.
  const resumenConPromedio = resumenAlumnos.filter((r) => r.promedioFinal != null);
  const promedio =
    resumenConPromedio.length === 0
      ? null
      : resumenConPromedio.reduce((suma, r) => suma + r.promedioFinal, 0) / resumenConPromedio.length;
  const promedioTarde = resumenAlumnos.reduce((suma, r) => suma + r.pctTardeOFaltante, 0) / total;
  const enRiesgo = resumenAlumnos.filter((r) => r.riesgo >= UMBRAL_RIESGO_ZONA_ROJA).length;

  return {
    promedio: promedio == null ? null : Math.round(promedio * 10) / 10,
    pctATiempo: Math.round(100 - promedioTarde),
    pctEnRiesgo: Math.round((enRiesgo / total) * 100),
  };
}

// Comparativa 3°C vs 3°E: la ÚNICA sección del Dashboard que ignora el
// filtro de Grupo por definición (ver nota visual en
// renderizarComparativaGruposDashboard). Reutiliza resumenGrupoActual (ya
// calculado por renderizarDashboard para el grupo filtrado) y solo hace
// UNA consulta adicional — vía construirResumenAlumnosDashboard tal
// cual, sin query nueva — para el grupo complementario.
async function construirResumenPorGrupoDashboard(trimestre, resumenGrupoActual, grupoActual) {
  const resultado = {};
  for (const grupo of ["3C", "3E"]) {
    resultado[grupo] =
      grupo === grupoActual ? resumenGrupoActual : await construirResumenAlumnosDashboard(trimestre, grupo);
  }
  return resultado;
}

function renderizarComparativaGruposDashboard(resumenPorGrupo) {
  const contenedor = document.getElementById("dashboard-comparativa-grupos");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const metricas3C = metricasGrupoDashboard(resumenPorGrupo["3C"]);
  const metricas3E = metricasGrupoDashboard(resumenPorGrupo["3E"]);

  const filas = [
    {
      etiqueta: "Promedio general",
      valor3C: metricas3C.promedio == null ? "—" : metricas3C.promedio.toFixed(1),
      valor3E: metricas3E.promedio == null ? "—" : metricas3E.promedio.toFixed(1),
    },
    { etiqueta: "% a tiempo", valor3C: metricas3C.pctATiempo + "%", valor3E: metricas3E.pctATiempo + "%" },
    { etiqueta: "% en riesgo", valor3C: metricas3C.pctEnRiesgo + "%", valor3E: metricas3E.pctEnRiesgo + "%" },
  ];

  // Reutiliza .tabla-calificacion tal cual (misma clase que la tabla de
  // fallback de construirFiguraBarraApilada) en vez de definir un estilo
  // de tabla nuevo solo para esta comparación.
  const tabla = document.createElement("table");
  tabla.className = "tabla-calificacion";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ["Métrica", "3°C", "3°E"].forEach((texto) => {
    const th = document.createElement("th");
    th.textContent = texto;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  filas.forEach(({ etiqueta, valor3C, valor3E }) => {
    const tr = document.createElement("tr");
    const thFila = document.createElement("th");
    thFila.scope = "row";
    thFila.textContent = etiqueta;
    const td3C = document.createElement("td");
    td3C.textContent = valor3C;
    const td3E = document.createElement("td");
    td3E.textContent = valor3E;
    tr.append(thFila, td3C, td3E);
    tbody.appendChild(tr);
  });
  tabla.appendChild(tbody);

  contenedor.appendChild(tabla);
}

// Puntualidad por tipo de entregable: reutiliza construirFiguraBarraApilada
// (misma pieza del semáforo/tasa de entrega) 3 veces, una por tipo, con las
// mismas categorías/colores de COLORES_ENTREGA/INK_ENTREGA — y
// pctTardeOFaltantePorTipo, ya calculado por alumno en
// construirResumenAlumnosDashboard, así que no hace falta ninguna consulta
// adicional.
function renderizarPuntualidadPorTipoDashboard(resumenAlumnos) {
  const contenedor = document.getElementById("dashboard-puntualidad-tipo");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const total = resumenAlumnos.length;
  if (total === 0) {
    const vacio = document.createElement("p");
    vacio.className = "sin-resultados";
    vacio.textContent = "Sin alumnos con cuenta activa para este filtro.";
    contenedor.appendChild(vacio);
    return;
  }

  Object.entries(ETIQUETAS_TIPO_ENTREGABLE_DASHBOARD).forEach(([tipo, etiqueta]) => {
    const promedioTarde =
      resumenAlumnos.reduce((suma, r) => suma + (r.pctTardeOFaltantePorTipo?.[tipo] || 0), 0) / total;
    const valores = { "A tiempo": Math.round(100 - promedioTarde), "Tarde o faltante": Math.round(promedioTarde) };

    const subtitulo = document.createElement("p");
    subtitulo.className = "dashboard-grafica__titulo";
    subtitulo.textContent = etiqueta;
    contenedor.appendChild(subtitulo);

    contenedor.appendChild(
      construirFiguraBarraApilada({
        tituloAccesible: "Puntualidad de " + etiqueta.toLowerCase(),
        categorias: ["A tiempo", "Tarde o faltante"],
        valores,
        colores: COLORES_ENTREGA,
        inkPorCategoria: INK_ENTREGA,
      })
    );
  });
}

// item.secuencia es un string largo predefinido ("🧠 Secuencia 1 — ...",
// ver claveSecuenciaDeEntregable) — se extrae solo el número para el eje X
// y una etiqueta corta. Los entregables sin secuencia numerada (fallback
// "Otras tareas"/etc.) quedan fuera de este gráfico a propósito: el
// alcance pedido es "las 9 secuencias", no una 10ª categoría de sobras.
function etiquetaCortaSecuencia(claveSecuencia) {
  const coincidencia = claveSecuencia.match(/Secuencia\s+(\d+)/);
  return coincidencia ? "Sec. " + coincidencia[1] : null;
}

// Promedio de calificacion por secuencia (extensión del mismo patrón de
// agrupar-por-claveSecuenciaDeEntregable que ya usa promedioDeTipo() dentro
// de calcularPromedioTrimestre, pero agregado por grupo completo en vez de
// por alumno). Reutiliza obtenerAlumnosParaCalificacion/
// obtenerEntregablesPorTipo/obtenerMapasProgresoPorTrimestre tal cual —
// mismas funciones de consulta ya existentes, sin inventar una forma de
// query nueva.
async function obtenerEvolucionPromedioPorSecuencia(trimestre, grupoFiltro) {
  const idsAlumnos = (await obtenerAlumnosParaCalificacion(grupoFiltro))
    .filter((alumno) => alumno.usado !== false && alumno.auth_user_id)
    .map((alumno) => alumno.auth_user_id);
  if (idsAlumnos.length === 0) return [];

  const entregablesTodos = await obtenerEntregablesPorTipo("todos", trimestre);
  const entregablesDelGrupo = entregablesTodos.filter(
    (item) => item.grupo === "todos" || item.grupo === grupoFiltro
  );

  const mapasPorTrimestre = await obtenerMapasProgresoPorTrimestre(idsAlumnos);
  const mapaProgresoTrimestre = mapasPorTrimestre.get(trimestre);

  const porSecuencia = new Map();
  entregablesDelGrupo.forEach((item) => {
    const etiqueta = etiquetaCortaSecuencia(claveSecuenciaDeEntregable(item));
    if (!etiqueta) return;

    if (!porSecuencia.has(etiqueta)) {
      porSecuencia.set(etiqueta, { suma: 0, n: 0, orden: Number(etiqueta.replace("Sec. ", "")) });
    }
    const bucket = porSecuencia.get(etiqueta);

    idsAlumnos.forEach((alumnoId) => {
      const fila = mapaProgresoTrimestre.get(alumnoId + "-" + item.tipoEntregable + "-" + item.id);
      if (fila && fila.calificacion != null) {
        bucket.suma += Number(fila.calificacion);
        bucket.n++;
      }
    });
  });

  return [...porSecuencia.entries()]
    .filter(([, bucket]) => bucket.n > 0)
    .sort((a, b) => a[1].orden - b[1].orden)
    .map(([etiqueta, bucket]) => ({ etiqueta, promedio: bucket.suma / bucket.n }));
}

// Gráfica de barras verticales en escala absoluta (0-escalaMax), SVG puro:
// distinta de construirFiguraBarraApilada (esa es una sola fila 100%
// apilada de porcentajes) porque aquí cada barra es independiente sobre la
// misma escala 0-10 de calificación — mismo patrón de accesibilidad
// (role="img" + aria-label + tabla de respaldo con el mismo botón toggle)
// para que ambas gráficas del Dashboard se sientan consistentes.
// MARGEN_SUPERIOR: franja reservada arriba de las barras para el valor
// numérico de cada una (Commit D — antes solo estaba en el <title> al
// hover y en "Ver como tabla", así que un valor cercano a escalaMax con
// pocas categorías llenaba el lienzo de borde a borde sin ningún dato
// visible, y se leía como roto aunque no lo estuviera). El valor SIEMPRE
// se dibuja en esta franja fija, nunca encima/dentro de la barra: así no
// hace falta un color de texto distinto según si la barra es alta o
// baja (evita el problema de contraste de escribir texto claro/oscuro
// encima de un relleno de color que puede variar).
function construirFiguraBarrasVerticales({ tituloAccesible, etiquetas, valores, colorBarra, escalaMax }) {
  contadorFigurasDashboard++;
  const idTabla = "dashboard-tabla-" + contadorFigurasDashboard;
  const svgNS = "http://www.w3.org/2000/svg";

  const figura = document.createElement("figure");
  figura.className = "dashboard-grafica";

  const ANCHO = 320;
  const MARGEN_SUPERIOR = 18;
  const ALTO_BARRAS = 116;
  const ALTO_TOTAL = MARGEN_SUPERIOR + ALTO_BARRAS + 24;
  const GAP = 6;
  const anchoBarra = (ANCHO - GAP * (etiquetas.length - 1)) / etiquetas.length;

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 " + ANCHO + " " + ALTO_TOTAL);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", tituloAccesible + " — ver la tabla de abajo para el detalle exacto");
  svg.classList.add("dashboard-grafica__svg");

  etiquetas.forEach((etiqueta, indice) => {
    const valor = valores[indice] || 0;
    const alturaBarra = Math.max(0, (valor / escalaMax) * ALTO_BARRAS);
    const x = indice * (anchoBarra + GAP);
    const y = MARGEN_SUPERIOR + (ALTO_BARRAS - alturaBarra);

    const barra = document.createElementNS(svgNS, "rect");
    barra.setAttribute("x", String(x));
    barra.setAttribute("y", String(y));
    barra.setAttribute("width", String(anchoBarra));
    barra.setAttribute("height", String(alturaBarra));
    barra.setAttribute("rx", "3");
    barra.setAttribute("fill", colorBarra);
    const tituloBarra = document.createElementNS(svgNS, "title");
    tituloBarra.textContent = etiqueta + ": " + valor.toFixed(1);
    barra.appendChild(tituloBarra);
    svg.appendChild(barra);

    const textoValor = document.createElementNS(svgNS, "text");
    textoValor.setAttribute("x", String(x + anchoBarra / 2));
    textoValor.setAttribute("y", String(y - 5));
    textoValor.setAttribute("class", "dashboard-grafica__valor-barra");
    textoValor.textContent = valor.toFixed(1);
    svg.appendChild(textoValor);

    const texto = document.createElementNS(svgNS, "text");
    texto.setAttribute("x", String(x + anchoBarra / 2));
    texto.setAttribute("y", String(MARGEN_SUPERIOR + ALTO_BARRAS + 16));
    texto.setAttribute("class", "dashboard-grafica__etiqueta-barra");
    texto.textContent = etiqueta;
    svg.appendChild(texto);
  });

  figura.appendChild(svg);

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton-secundario dashboard-grafica__boton-tabla";
  boton.textContent = "📊 Ver como tabla";
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute("aria-controls", idTabla);
  figura.appendChild(boton);

  const contenedorTabla = document.createElement("div");
  contenedorTabla.id = idTabla;
  contenedorTabla.className = "dashboard-grafica__tabla";
  contenedorTabla.hidden = true;

  const tabla = document.createElement("table");
  tabla.className = "tabla-calificacion";
  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  etiquetas.forEach((etiqueta) => {
    const th = document.createElement("th");
    th.textContent = etiqueta;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  const filaValores = document.createElement("tr");
  valores.forEach((valor) => {
    const td = document.createElement("td");
    td.textContent = valor.toFixed(1);
    filaValores.appendChild(td);
  });
  tbody.appendChild(filaValores);
  tabla.appendChild(tbody);
  contenedorTabla.appendChild(tabla);
  figura.appendChild(contenedorTabla);

  boton.addEventListener("click", () => {
    const seVaAAbrir = contenedorTabla.hidden;
    contenedorTabla.hidden = !seVaAAbrir;
    boton.setAttribute("aria-expanded", String(seVaAAbrir));
  });

  return figura;
}

function renderizarEvolucionSecuenciaDashboard(datosSecuencia) {
  const contenedor = document.getElementById("dashboard-evolucion-secuencia");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (datosSecuencia.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "sin-resultados";
    vacio.textContent = "Sin calificaciones registradas todavía para este trimestre y grupo.";
    contenedor.appendChild(vacio);
    return;
  }

  contenedor.appendChild(
    construirFiguraBarrasVerticales({
      tituloAccesible: "Promedio de calificación por secuencia",
      etiquetas: datosSecuencia.map((d) => d.etiqueta),
      valores: datosSecuencia.map((d) => d.promedio),
      colorBarra: "var(--color-turquesa)",
      escalaMax: 10,
    })
  );
}

// Igual que formatearFecha() pero para timestamps completos (con hora) —
// esa función asume fecha-sola (le concatena "T00:00:00"), aquí
// actualizado_en ya trae hora, así que se formatea directo.
function formatearFechaHoraCorta(fechaHoraISO) {
  const fecha = new Date(fechaHoraISO);
  return (
    fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) +
    " · " +
    fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
  );
}

// Feed de actividad reciente: combina entregas (progreso) + avisos.
// Modo "Recientes" (fechaFiltro null): últimos TAMANO_PAGINA_FEED_ACTIVIDAD
// eventos combinados; entregas respetan el trimestre activo (avisos no
// tienen columna trimestre, nunca se filtran por eso). Modo "Por día"
// (fechaFiltro = "YYYY-MM-DD"): TODOS los eventos de ese día exacto, sin
// filtro de trimestre para entregas tampoco (el día manda) — la
// paginación de ese modo se recorta en el cliente, ver
// cargarFeedActividadDashboard().
const TAMANO_PAGINA_FEED_ACTIVIDAD = 20;

// Límites de un día calendario en América/Ciudad_de_México, que ya no
// observa horario de verano (reforma 2022): offset fijo -06:00 todo el
// año, así que no hace falta resolver DST aquí. Se fija el offset en el
// propio literal en vez de dejar que Postgres lo asuma en UTC (que
// correría la frontera del día 6 horas).
function limitesDiaCDMX(fechaISO) {
  return {
    inicio: fechaISO + "T00:00:00-06:00",
    fin: sumarDiasISO(fechaISO, 1) + "T00:00:00-06:00",
  };
}

async function obtenerEntregasFeedActividad(trimestreActivo, idsAlumnos, fechaFiltro) {
  if (idsAlumnos.length === 0) return [];

  const opciones = {
    select: "alumno_id, tipo, item_id, trimestre, origen, actualizado_en",
    eq: { completado: true },
    in: { alumno_id: idsAlumnos },
    noNulo: ["actualizado_en"],
    order: { columna: "actualizado_en", ascending: false },
  };

  if (fechaFiltro) {
    const { inicio, fin } = limitesDiaCDMX(fechaFiltro);
    opciones.gte = { actualizado_en: inicio };
    opciones.lt = { actualizado_en: fin };
  } else {
    opciones.eq.trimestre = trimestreActivo;
    opciones.limit = TAMANO_PAGINA_FEED_ACTIVIDAD;
  }

  const { data, error } = await obtenerDatos("progreso", opciones);
  if (error || !data) return [];

  // "Por día" ignora el trimestre activo, así que las entregas de ese día
  // pueden venir de cualquiera de los 3 -- se necesitan los entregables de
  // los 3 para poder resolver el título de cada una (ver mapaEntregables).
  const trimestresNecesarios = fechaFiltro ? ["1", "2", "3"] : [String(trimestreActivo)];
  const entregablesPorTrimestre = await Promise.all(
    trimestresNecesarios.map(async (t) => [t, await obtenerEntregablesPorTipo("todos", t)])
  );
  const mapaEntregables = new Map();
  for (const [t, entregables] of entregablesPorTrimestre) {
    for (const item of entregables) mapaEntregables.set(t + "-" + item.tipoEntregable + "-" + item.id, item);
  }

  return data
    .map((fila) => {
      const entregable = mapaEntregables.get(String(fila.trimestre) + "-" + fila.tipo + "-" + fila.item_id);
      if (!entregable) return null;
      return {
        tipo: "entrega",
        timestamp: fila.actualizado_en,
        alumnoId: fila.alumno_id,
        entregable,
        origen: fila.origen,
      };
    })
    .filter(Boolean);
}

// grupo destino "todos" en avisos aplica a ambos grupos (ver <select
// id="aviso-grupo"> en admin.html) -- por eso el filtro de Grupo del
// Dashboard busca ese valor además del grupo activo, igual que ya hace
// coincideConGrupoDelAlumno() para entregables.
async function obtenerAvisosFeedActividad(grupo, fechaFiltro) {
  const opciones = {
    select: "id, titulo, descripcion, fecha, fecha_expiracion, grupo, prioridad, creado_en",
    in: { grupo: [grupo, "todos"] },
    noNulo: ["creado_en"],
    order: { columna: "creado_en", ascending: false },
  };

  if (fechaFiltro) {
    const { inicio, fin } = limitesDiaCDMX(fechaFiltro);
    opciones.gte = { creado_en: inicio };
    opciones.lt = { creado_en: fin };
  } else {
    opciones.limit = TAMANO_PAGINA_FEED_ACTIVIDAD;
  }

  const { data, error } = await obtenerDatos("avisos", opciones);
  if (error || !data) return [];

  return data.map((aviso) => ({ tipo: "aviso", timestamp: aviso.creado_en, ...aviso }));
}

async function obtenerActividadDashboard(trimestre, resumenAlumnos, grupo, fechaFiltro) {
  const idsAlumnos = resumenAlumnos.map((r) => r.alumno.auth_user_id);
  const mapaAlumnos = new Map(resumenAlumnos.map((r) => [r.alumno.auth_user_id, r.alumno]));

  const [entregasCrudas, avisos] = await Promise.all([
    obtenerEntregasFeedActividad(trimestre, idsAlumnos, fechaFiltro),
    obtenerAvisosFeedActividad(grupo, fechaFiltro),
  ]);

  const entregas = entregasCrudas
    .map((fila) => {
      const alumno = mapaAlumnos.get(fila.alumnoId);
      if (!alumno) return null;
      return { ...fila, alumno };
    })
    .filter(Boolean);

  const eventos = [...entregas, ...avisos].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  // En "Recientes" cada fuente ya trae como mucho TAMANO_PAGINA_FEED_ACTIVIDAD
  // (hasta 40 combinados) -- se recorta aquí a los 20 más recientes reales.
  // En "Por día" no hay límite: se trae el día completo para paginar en
  // cargarFeedActividadDashboard().
  return fechaFiltro ? eventos : eventos.slice(0, TAMANO_PAGINA_FEED_ACTIVIDAD);
}

// alumno.nombre/entregable.titulo (entregas) o titulo/prioridad (avisos) ya
// vienen resueltos en cada evento -- ver obtenerActividadDashboard().
function renderizarFeedActividadDashboard(eventos, { modoDia = false } = {}) {
  const contenedor = document.getElementById("dashboard-feed-actividad");
  if (!contenedor) return;

  if (eventos.length === 0) {
    mostrarSinResultados(
      contenedor,
      modoDia ? "Sin actividad registrada este día." : "Sin actividad registrada todavía para este trimestre y grupo."
    );
    return;
  }

  contenedor.innerHTML = "";
  const lista = document.createElement("ul");
  lista.className = "dashboard-riesgo-lista";

  eventos.forEach((evento) => {
    const li = document.createElement("li");
    li.className = "dashboard-riesgo-lista__item";

    const info = document.createElement("span");
    info.className = "dashboard-riesgo-lista__info";

    const meta = document.createElement("span");
    meta.className = "dashboard-riesgo-lista__meta";

    if (evento.tipo === "entrega") {
      info.textContent = "📤 " + evento.alumno.nombre + " · " + evento.entregable.titulo;
      const etiquetaOrigen = evento.origen === "formulario" ? "📝 Formulario" : "🧑‍🏫 Registro manual";
      meta.textContent = formatearFechaHoraCorta(evento.timestamp) + " · " + etiquetaOrigen;
    } else {
      info.textContent = "📢 " + evento.titulo;
      meta.textContent = formatearFechaHoraCorta(evento.timestamp);
      if (evento.prioridad === "urgente") {
        meta.appendChild(document.createTextNode(" "));
        const badge = document.createElement("span");
        badge.className = "badge-prioridad";
        badge.dataset.prioridad = "urgente";
        badge.textContent = "Urgente";
        meta.appendChild(badge);
      }
    }

    li.append(info, meta);
    lista.appendChild(li);
  });

  contenedor.appendChild(lista);
}

// Estado del modo "Por día": fecha null = modo "Recientes". resumenAlumnos
// se cachea aquí (poblado por renderizarDashboard()) para que los botones
// de paginación puedan volver a pedir el feed sin re-renderizar todo el
// Dashboard (mismo criterio que filasAsistenciaDashboard más abajo).
const estadoFeedActividad = { fecha: null, pagina: 1 };
let resumenAlumnosParaFeedActividad = [];

async function cargarFeedActividadDashboard(trimestre, resumenAlumnos, grupo) {
  resumenAlumnosParaFeedActividad = resumenAlumnos;

  const botonVolver = document.getElementById("dashboard-feed-actividad-volver");
  if (botonVolver) botonVolver.hidden = !estadoFeedActividad.fecha;

  const contenedorPaginacion = document.getElementById("dashboard-feed-actividad-paginacion");

  const eventos = await obtenerActividadDashboard(trimestre, resumenAlumnos, grupo, estadoFeedActividad.fecha);

  if (!estadoFeedActividad.fecha) {
    if (contenedorPaginacion) contenedorPaginacion.hidden = true;
    renderizarFeedActividadDashboard(eventos, { modoDia: false });
    return;
  }

  const totalPaginas = Math.max(1, Math.ceil(eventos.length / TAMANO_PAGINA_FEED_ACTIVIDAD));
  estadoFeedActividad.pagina = Math.min(estadoFeedActividad.pagina, totalPaginas);
  const inicio = (estadoFeedActividad.pagina - 1) * TAMANO_PAGINA_FEED_ACTIVIDAD;
  const eventosPagina = eventos.slice(inicio, inicio + TAMANO_PAGINA_FEED_ACTIVIDAD);

  renderizarFeedActividadDashboard(eventosPagina, { modoDia: true });

  if (contenedorPaginacion) {
    contenedorPaginacion.hidden = eventos.length <= TAMANO_PAGINA_FEED_ACTIVIDAD;
    const textoPagina = document.getElementById("dashboard-feed-actividad-pagina-texto");
    if (textoPagina) textoPagina.textContent = "Página " + estadoFeedActividad.pagina + " de " + totalPaginas;
    const botonAnterior = document.getElementById("dashboard-feed-actividad-anterior");
    const botonSiguiente = document.getElementById("dashboard-feed-actividad-siguiente");
    if (botonAnterior) botonAnterior.disabled = estadoFeedActividad.pagina <= 1;
    if (botonSiguiente) botonSiguiente.disabled = estadoFeedActividad.pagina >= totalPaginas;
  }
}

// Barra de progreso simple (misma .barra-progreso ya usada en Progreso):
// config_sitio SOLO guarda trimestre_desbloqueado (1/2/3) — las 9
// "secuencias" de proyectos NO están bloqueadas por trimestre (las 9
// aparecen completas dentro de cada trimestre, son una taxonomía
// transversal, no un candado progresivo), así que el cronograma se
// queda en el único nivel de granularidad real: el trimestre.
// No depende de los filtros de trimestre/grupo del módulo (usa
// trimestreDesbloqueado directo, ya resuelto antes de renderizarTodo()).
function renderizarCronogramaDashboard() {
  const contenedor = document.getElementById("dashboard-cronograma");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const TOTAL_TRIMESTRES = 3;
  const porcentaje = Math.round((trimestreDesbloqueado / TOTAL_TRIMESTRES) * 100);

  const etiqueta = document.createElement("p");
  etiqueta.className = "dashboard-cronograma__etiqueta";
  etiqueta.textContent = "Bloque " + trimestreDesbloqueado + " de " + TOTAL_TRIMESTRES + " — Trimestre " + trimestreDesbloqueado + " desbloqueado";
  contenedor.appendChild(etiqueta);

  const barra = document.createElement("div");
  barra.className = "barra-progreso";
  barra.setAttribute("role", "progressbar");
  barra.setAttribute("aria-valuenow", String(trimestreDesbloqueado));
  barra.setAttribute("aria-valuemin", "0");
  barra.setAttribute("aria-valuemax", String(TOTAL_TRIMESTRES));
  barra.setAttribute("aria-label", "Bloques del ciclo escolar desbloqueados");
  const relleno = document.createElement("div");
  relleno.className = "barra-progreso__relleno";
  relleno.style.width = porcentaje + "%";
  barra.appendChild(relleno);
  contenedor.appendChild(barra);
}

/* ---------------------------------------------------------
   Módulo "Asistencia" del Dashboard (dentro de tab-dashboard)

   KPI de % de asistencia + tendencia semanal, tabla "Alumnos con más
   faltas/retardos" con chips de filtro, impresión de reporte, y el aviso
   "no has tomado lista hoy" -- todo sobre resumenAlumnos, ya calculado por
   renderizarDashboard() (mismos alumnos con cuenta activa que las demás
   piezas de este módulo, ver construirResumenAlumnosDashboard).
   --------------------------------------------------------- */

// Caché en memoria de la última tabla calculada (grupo/trimestre
// actuales de estadoDashboard) -- los chips de filtro y la impresión la
// reutilizan tal cual, sin volver a consultar Supabase.
let filasAsistenciaDashboard = [];
let filtroAsistenciaDashboard = "todos";

// Una fila por alumno con cuenta activa (mismo resumenAlumnos que el
// resto del Dashboard): Faltas/Retardos/Justificadas de conteoPorEstado
// (ver calcularResumenAsistencia) + el mismo pctAsistencia ya calculado
// ahí, para no tener 2 fórmulas de "% asistencia" distintas en el sitio.
// "perfecta" se deriva de ESE MISMO pctAsistencia (100% implica 0 faltas
// y 0 retardos, ya que solo presente/justificada cuentan en el
// numerador) en vez de una condición aparte. Ordenada de mayor a menor
// por faltas+retardos, como pide el prompt.
async function construirFilasAsistenciaDashboard(resumenAlumnos, trimestre) {
  const umbrales = await obtenerUmbralesAsistencia();

  const filas = await Promise.all(
    resumenAlumnos.map(async ({ alumno }) => {
      const resumen = await calcularResumenAsistencia(alumno.auth_user_id, trimestre);
      const faltas = resumen?.conteoPorEstado.falta || 0;
      const retardos = resumen?.conteoPorEstado.retardo || 0;
      const justificadas = resumen?.conteoPorEstado.justificada || 0;
      const pctAsistencia = resumen?.pctAsistencia ?? null;

      return {
        alumno,
        faltas,
        retardos,
        justificadas,
        pctAsistencia,
        enSeguimiento: faltas >= umbrales.umbralFaltas || retardos >= umbrales.umbralRetardos,
        perfecta: pctAsistencia === 100,
      };
    })
  );

  filas.sort((a, b) => b.faltas + b.retardos - (a.faltas + a.retardos));
  return filas;
}

function filasAsistenciaFiltradas() {
  return filasAsistenciaDashboard.filter((fila) => {
    if (filtroAsistenciaDashboard === "seguimiento") return fila.enSeguimiento;
    if (filtroAsistenciaDashboard === "perfecta") return fila.perfecta;
    return true;
  });
}

const ENCABEZADOS_TABLA_ASISTENCIA = ["Nombre", "Faltas", "Retardos", "Justificadas", "% Asistencia"];

function valoresFilaAsistencia(fila) {
  return [
    fila.alumno.nombre,
    String(fila.faltas),
    String(fila.retardos),
    String(fila.justificadas),
    fila.pctAsistencia == null ? "—" : fila.pctAsistencia + "%",
  ];
}

function renderizarTablaAsistenciaDashboard() {
  const contenedor = document.getElementById("dashboard-asistencia-tabla-contenedor");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const filtradas = filasAsistenciaFiltradas();
  if (filtradas.length === 0) {
    mostrarSinResultados(contenedor, "Sin alumnos que coincidan con este filtro.");
    return;
  }

  const tabla = document.createElement("table");
  tabla.className = "tabla-calificacion";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ENCABEZADOS_TABLA_ASISTENCIA.forEach((texto) => {
    const th = document.createElement("th");
    th.textContent = texto;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  filtradas.forEach((fila) => {
    const tr = document.createElement("tr");
    if (fila.enSeguimiento) tr.classList.add("fila-asistencia--seguimiento");

    valoresFilaAsistencia(fila).forEach((valor) => {
      const td = document.createElement("td");
      td.textContent = valor;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  tabla.appendChild(tbody);
  contenedor.appendChild(tabla);
}

function activarFiltrosAsistenciaDashboard() {
  const botones = Array.from(document.querySelectorAll("#dashboard-asistencia-filtros .calificacion-tabs-tipo__boton"));
  if (botones.length === 0) return;

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      botones.forEach((otro) => {
        const activo = otro === boton;
        otro.classList.toggle("calificacion-tabs-tipo__boton--activo", activo);
        otro.setAttribute("aria-selected", String(activo));
      });
      filtroAsistenciaDashboard = boton.dataset.filtro;
      renderizarTablaAsistenciaDashboard();
    });
  });
}

// Tendencia semanal de % de asistencia del GRUPO (no por alumno): barras
// simples con divs a propósito (pedido explícito), distinto del
// sparkline SVG que ya usan las 4 KPIs de arriba (ver construirSparklineSVG).
// Mismo umbral ">=3 semanas" que obtenerTendenciasSemanalesDashboard: con
// menos puntos una barra no comunica una tendencia real.
//
// A diferencia de esa función (agrupa por actualizado_en, un timestamptz,
// con inicioSemanaISO en UTC), "asistencia.fecha" ya es una columna date
// pura ("YYYY-MM-DD" sin hora) -- parsear con "T00:00:00" evita el
// corrimiento de día que toISOString() (UTC) podría introducir cerca de
// medianoche, mismo criterio que ya usa formatearClaveFecha().
async function obtenerTendenciaSemanalAsistencia(trimestre, idsAlumnos) {
  if (idsAlumnos.length === 0) return [];

  const { data, error } = await obtenerDatos("asistencia", {
    select: "estado, fecha",
    eq: { trimestre },
    in: { alumno_id: idsAlumnos },
    order: { columna: "fecha", ascending: true },
  });
  if (error || !data || data.length === 0) return [];

  const inicioSemanaISO = (fechaISO) => {
    const fecha = new Date(fechaISO + "T00:00:00");
    const diaISO = (fecha.getDay() + 6) % 7; // lunes = 0
    fecha.setDate(fecha.getDate() - diaISO);
    return formatearClaveFecha(fecha);
  };

  const semanas = new Map();
  data.forEach((fila) => {
    const clave = inicioSemanaISO(fila.fecha);
    if (!semanas.has(clave)) semanas.set(clave, { asistio: 0, total: 0 });
    const bucket = semanas.get(clave);
    bucket.total++;
    if (fila.estado === "presente" || fila.estado === "justificada") bucket.asistio++;
  });

  const clavesOrdenadas = [...semanas.keys()].sort();
  if (clavesOrdenadas.length < 3) return [];

  // { clave, valor } en vez de solo el número: clave (lunes de esa semana,
  // "YYYY-MM-DD") es lo que construirTendenciaBarrasAsistencia() necesita
  // para pintar la etiqueta visible de cada barra (antes se descartaba
  // aquí mismo y esa función solo recibía el número, sin fecha real que
  // mostrar).
  return clavesOrdenadas.map((clave) => {
    const bucket = semanas.get(clave);
    const valor = bucket.total === 0 ? 0 : Math.round((bucket.asistio / bucket.total) * 100);
    return { clave, valor };
  });
}

// Meses cortos en español, escritos a mano en vez de
// toLocaleDateString("es-MX", {month:"short"}): el formato exacto de esa
// llamada depende del motor ICU de cada navegador (Node da "31-ago" con
// guion y sin espacio; un navegador real puede dar otra cosa) — con 10-22
// barras en esta gráfica, cualquier variación de ancho/puntuación entre
// navegadores se nota. Un arreglo fijo es determinista en todos lados.
const MESES_CORTOS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Etiqueta visible de cada barra: solo el día de inicio de esa semana
// (el lunes que ya calcula inicioSemanaISO en obtenerTendenciaSemanalAsistencia),
// no el rango completo lunes-viernes — un rango fabricado sería engañoso
// aquí, porque cada grupo solo tiene clase 2 días de esa semana (ver
// DATOS_HORARIO), no los 5, y además una semana que cruza de mes (ej.
// 31 ago-4 sep) necesitaría mostrar 2 meses para no ser incorrecta.
// "al menos el día de inicio" ya es suficiente para ubicar la semana en
// el calendario sin ese riesgo.
function formatearInicioSemanaCorto(claveISO) {
  const fecha = new Date(claveISO + "T00:00:00");
  return fecha.getDate() + " " + MESES_CORTOS_ES[fecha.getMonth()];
}

// Alto máximo de barra: antes el contenedor entero medía 56px vía CSS y
// cada barra tomaba un % de ESE alto; ahora cada barra recibe su alto en
// px calculado aquí mismo, porque el contenedor ya no tiene una altura
// fija — su alto real lo define la barra más alta + la etiqueta de fecha
// debajo (ver .asistencia-kpi__columna en css/style.css).
const ALTO_MAXIMO_BARRA_ASISTENCIA = 90;

// role="img" + aria-label con el resumen (primer/último valor): cada
// barra individual es decorativa (::before/title no llega de forma
// confiable a lectores de pantalla), así que el resumen en el
// contenedor es la única vía accesible de verdad para esta gráfica. La
// etiqueta de fecha bajo cada barra sí es texto real y visible siempre
// (no solo en :hover/title), así que se marca aria-hidden para no
// duplicar información que el resumen del contenedor ya cubre.
function construirTendenciaBarrasAsistencia(tendenciaSemanal) {
  const contenedor = document.createElement("div");
  contenedor.className = "asistencia-kpi__barras";
  contenedor.setAttribute("role", "img");
  contenedor.setAttribute(
    "aria-label",
    "Tendencia semanal de asistencia del grupo: de " +
      tendenciaSemanal[0].valor +
      "% a " +
      tendenciaSemanal[tendenciaSemanal.length - 1].valor +
      "%"
  );

  tendenciaSemanal.forEach(({ clave, valor }) => {
    const columna = document.createElement("div");
    columna.className = "asistencia-kpi__columna";

    const barra = document.createElement("div");
    barra.className = "asistencia-kpi__barra";
    barra.style.height = Math.max(4, Math.round((valor / 100) * ALTO_MAXIMO_BARRA_ASISTENCIA)) + "px";
    barra.title = formatearInicioSemanaCorto(clave) + ": " + valor + "%";

    const etiqueta = document.createElement("span");
    etiqueta.className = "asistencia-kpi__barra-etiqueta";
    etiqueta.setAttribute("aria-hidden", "true");
    etiqueta.textContent = formatearInicioSemanaCorto(clave);

    columna.append(barra, etiqueta);
    contenedor.appendChild(columna);
  });

  return contenedor;
}

// % de asistencia del grupo = promedio de pctAsistencia por alumno
// (mismo criterio que ya usan promedioGeneral/promedioTarde en
// renderizarKPIsDashboard/renderizarTasaEntregaDashboard: promedio de
// valores por alumno, no un agregado global de filas), excluyendo a
// quien no tenga ningún día registrado todavía (pctAsistencia null).
async function renderizarAsistenciaKPIDashboard(trimestre, idsAlumnos) {
  const contenedor = document.getElementById("dashboard-asistencia-kpi");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const pctsValidos = filasAsistenciaDashboard.map((fila) => fila.pctAsistencia).filter((valor) => valor != null);
  const pctGrupo =
    pctsValidos.length === 0 ? null : Math.round(pctsValidos.reduce((suma, valor) => suma + valor, 0) / pctsValidos.length);

  const valor = document.createElement("div");
  valor.className = "kpi-tarjeta__valor";
  valor.textContent = pctGrupo == null ? "—" : pctGrupo + "%";
  contenedor.appendChild(valor);

  const tendenciaSemanal = await obtenerTendenciaSemanalAsistencia(trimestre, idsAlumnos);
  contenedor.appendChild(
    tendenciaSemanal.length >= 3
      ? construirTendenciaBarrasAsistencia(tendenciaSemanal)
      : construirMensajeTendenciaPendiente(true)
  );
}

// Ambos grupos SIEMPRE, sin importar el filtro Grupo del dashboard (ver
// comentario del HTML junto a #dashboard-aviso-asistencia): un docente
// filtrado en 3°C no debe perderse el aviso de que 3°E, que hoy también
// tiene clase, sigue sin ningún registro. "Parcialmente guardado" ya
// cuenta como registrado -- basta con que UN alumno tenga estado real
// ese día para que el grupo salga de la lista (ver obtenerAsistenciaPorFecha,
// que nunca reporta "falta" por default, así que "algo distinto de
// sin_registrar" es la única señal confiable de que ya se guardó).
async function obtenerGruposSinRegistrarHoy() {
  const hoy = formatearClaveFecha(new Date());
  const sinRegistrar = [];

  for (const grupo of ["3C", "3E"]) {
    if (!esDiaDeClasePara(grupo, hoy)) continue;
    const filas = await obtenerAsistenciaPorFecha(grupo, hoy);
    const hayRegistroReal = filas.some((fila) => fila.estado !== "sin_registrar");
    if (!hayRegistroReal) sinRegistrar.push(grupo);
  }

  return sinRegistrar;
}

function renderizarAvisoAsistenciaHoy(gruposSinRegistrar) {
  const aviso = document.getElementById("dashboard-aviso-asistencia");
  if (!aviso) return;

  if (gruposSinRegistrar.length === 0) {
    aviso.hidden = true;
    aviso.innerHTML = "";
    return;
  }

  aviso.hidden = false;
  aviso.className = "formulario__advertencia";
  aviso.textContent = "⚠️ No has registrado asistencia de hoy para " + gruposSinRegistrar.map(textoGrupo).join(" y ") + ".";
}

// Mismo mecanismo que generarVistaImpresionProgreso() (progreso.html):
// arma #plantilla-impresion-asistencia en el momento y llama a
// window.print() -- ninguna generación de PDF en servidor. Imprime la
// tabla TAL CUAL está filtrada en pantalla (mismos chips Todos/En
// seguimiento/Asistencia perfecta), para que el papel refleje justo lo
// que el docente está viendo.
function generarVistaImpresionAsistencia() {
  const contenedor = document.getElementById("plantilla-impresion-asistencia");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const encabezado = document.createElement("div");
  encabezado.className = "impresion-progreso__encabezado";

  const titulo = document.createElement("h2");
  titulo.textContent =
    "Reporte de asistencia — " + textoGrupo(estadoDashboard.grupo) + " · Trimestre " + estadoDashboard.trimestre;
  const fecha = document.createElement("p");
  fecha.textContent =
    "Generado el " + new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  encabezado.append(titulo, fecha);
  contenedor.appendChild(encabezado);

  const tabla = document.createElement("table");
  tabla.className = "impresion-progreso__tabla";

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ENCABEZADOS_TABLA_ASISTENCIA.forEach((texto) => {
    const th = document.createElement("th");
    th.textContent = texto;
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  filasAsistenciaFiltradas().forEach((fila) => {
    const tr = document.createElement("tr");
    valoresFilaAsistencia(fila).forEach((valor) => {
      const td = document.createElement("td");
      td.textContent = valor;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  tabla.appendChild(tbody);
  contenedor.appendChild(tabla);

  document.body.classList.add("dashboard--imprimiendo-asistencia");
  window.print();
}

function activarImpresionAsistenciaDashboard() {
  const boton = document.getElementById("dashboard-asistencia-boton-imprimir");
  if (!boton) return;

  boton.addEventListener("click", generarVistaImpresionAsistencia);
  window.addEventListener("afterprint", () => {
    document.body.classList.remove("dashboard--imprimiendo-asistencia");
  });
}

async function renderizarDashboard() {
  const contenedorKpis = document.getElementById("dashboard-kpis");
  if (!contenedorKpis) return;

  const { trimestre, grupo } = estadoDashboard;
  const resumenAlumnos = await construirResumenAlumnosDashboard(trimestre, grupo);
  const idsAlumnos = resumenAlumnos.map((r) => r.alumno.auth_user_id);
  const pendientes = await contarPendientesPorCalificar(trimestre, idsAlumnos);
  const tendencias = await obtenerTendenciasSemanalesDashboard(trimestre, grupo, idsAlumnos);
  const riesgoExtraordinario = await contarAlumnosRiesgoExtraordinario(
    grupo,
    resumenAlumnos.map((r) => r.alumno)
  );

  renderizarKPIsDashboard(resumenAlumnos, pendientes, tendencias, riesgoExtraordinario);
  renderizarSemaforoDashboard(resumenAlumnos);
  renderizarTasaEntregaDashboard(resumenAlumnos);
  renderizarTop5RiesgoDashboard(resumenAlumnos);
  renderizarPuntualidadPorTipoDashboard(resumenAlumnos);

  filasAsistenciaDashboard = await construirFilasAsistenciaDashboard(resumenAlumnos, trimestre);
  renderizarTablaAsistenciaDashboard();
  await renderizarAsistenciaKPIDashboard(trimestre, idsAlumnos);
  // Ambos grupos, no solo el filtrado arriba -- ver la nota junto a
  // obtenerGruposSinRegistrarHoy().
  renderizarAvisoAsistenciaHoy(await obtenerGruposSinRegistrarHoy());

  const [resumenPorGrupo, evolucionSecuencia] = await Promise.all([
    construirResumenPorGrupoDashboard(trimestre, resumenAlumnos, grupo),
    obtenerEvolucionPromedioPorSecuencia(trimestre, grupo),
  ]);
  renderizarComparativaGruposDashboard(resumenPorGrupo);
  renderizarEvolucionSecuenciaDashboard(evolucionSecuencia);
  await cargarFeedActividadDashboard(trimestre, resumenAlumnos, grupo);
}

async function inicializarModuloDashboard() {
  const selectTrimestre = document.getElementById("dashboard-filtro-trimestre");
  if (!selectTrimestre) return; // no es admin.html

  // Mismo guard que el resto de módulos del panel: progreso/alumnos_registro
  // están protegidos por RLS para el rol docente.
  await promesaGuardPanelDocente;

  estadoDashboard.trimestre = String(trimestreDesbloqueado);
  selectTrimestre.value = estadoDashboard.trimestre;

  // Sin opción "Todos" en esta pestaña: 3°C es el valor por defecto al
  // cargar (ver comentario junto a la declaración de estadoDashboard).
  const selectGrupo = document.getElementById("dashboard-filtro-grupo");
  estadoDashboard.grupo = "3C";
  selectGrupo.value = estadoDashboard.grupo;

  renderizarCronogramaDashboard();
  activarFiltrosAsistenciaDashboard();
  activarImpresionAsistenciaDashboard();
  await renderizarDashboard();

  selectTrimestre.addEventListener("change", async () => {
    estadoDashboard.trimestre = selectTrimestre.value;
    await renderizarDashboard();
  });

  selectGrupo.addEventListener("change", async () => {
    estadoDashboard.grupo = selectGrupo.value;
    estadoFeedActividad.pagina = 1;
    await renderizarDashboard();
  });

  const inputFechaFeed = document.getElementById("dashboard-feed-actividad-fecha");
  const botonVolverFeed = document.getElementById("dashboard-feed-actividad-volver");
  const botonFeedAnterior = document.getElementById("dashboard-feed-actividad-anterior");
  const botonFeedSiguiente = document.getElementById("dashboard-feed-actividad-siguiente");

  if (inputFechaFeed) {
    inputFechaFeed.addEventListener("change", async () => {
      estadoFeedActividad.fecha = inputFechaFeed.value || null;
      estadoFeedActividad.pagina = 1;
      await cargarFeedActividadDashboard(estadoDashboard.trimestre, resumenAlumnosParaFeedActividad, estadoDashboard.grupo);
    });
  }

  if (botonVolverFeed) {
    botonVolverFeed.addEventListener("click", async () => {
      estadoFeedActividad.fecha = null;
      estadoFeedActividad.pagina = 1;
      if (inputFechaFeed) inputFechaFeed.value = "";
      await cargarFeedActividadDashboard(estadoDashboard.trimestre, resumenAlumnosParaFeedActividad, estadoDashboard.grupo);
    });
  }

  if (botonFeedAnterior) {
    botonFeedAnterior.addEventListener("click", async () => {
      if (estadoFeedActividad.pagina <= 1) return;
      estadoFeedActividad.pagina -= 1;
      await cargarFeedActividadDashboard(estadoDashboard.trimestre, resumenAlumnosParaFeedActividad, estadoDashboard.grupo);
    });
  }

  if (botonFeedSiguiente) {
    botonFeedSiguiente.addEventListener("click", async () => {
      estadoFeedActividad.pagina += 1;
      await cargarFeedActividadDashboard(estadoDashboard.trimestre, resumenAlumnosParaFeedActividad, estadoDashboard.grupo);
    });
  }
}

/* =========================================================
   13. GUÍA DEL ALUMNO (guia.html)
   ========================================================= */

// Guarda el paso actual del wizard ("1".."7" o "cierre"; bienvenida no se
// guarda — sin valor en localStorage siempre se arranca ahí, mismo
// criterio que CLAVE_ULTIMO_TRIMESTRE de la sección 3). Solo actúa en
// guia.html: #guia-wizard no existe en el resto de páginas.
const CLAVE_GUIA_PASO = "guiaAlumnoPasoActual";
const GUIA_TOTAL_PASOS = 13;

function activarGuiaAlumno() {
  const wizard = document.getElementById("guia-wizard");
  if (!wizard) return;

  const pantallas = Array.from(wizard.querySelectorAll(".guia-pantalla"));
  const indicador = document.getElementById("guia-wizard-indicador");
  const barraRelleno = document.getElementById("guia-wizard-barra-relleno");
  const progresoContenedor = document.getElementById("guia-wizard-progreso");
  const controlesContenedor = document.getElementById("guia-wizard-controles");
  const stepperBotones = Array.from(wizard.querySelectorAll("[data-ir-a-paso]"));
  const botonAnterior = document.getElementById("guia-boton-anterior");
  const botonSiguiente = document.getElementById("guia-boton-siguiente");
  const botonComenzar = document.getElementById("guia-boton-comenzar");
  const botonReiniciar = document.getElementById("guia-boton-reiniciar");
  const botonVistaCompleta = document.getElementById("guia-boton-vista-completa");
  const enlaceVistaCompletaCierre = document.getElementById("guia-enlace-ver-completa-cierre");
  const botonDescargarPdf = document.getElementById("guia-boton-descargar-pdf");

  function idDePantalla(pantalla) {
    if (pantalla === "bienvenida") return "guia-pantalla-bienvenida";
    if (pantalla === "cierre") return "guia-pantalla-cierre";
    return "guia-pantalla-paso-" + pantalla;
  }

  function pantallaGuardadaValida(valor) {
    return valor === "cierre" || (Number(valor) >= 1 && Number(valor) <= GUIA_TOTAL_PASOS);
  }

  let pantallaActual = localStorage.getItem(CLAVE_GUIA_PASO);
  if (!pantallaGuardadaValida(pantallaActual)) pantallaActual = "bienvenida";

  // moverFoco es false solo en la carga inicial (retomar el paso guardado
  // no debe robarle el foco a la página); en cualquier transición
  // disparada por el alumno (Anterior/Siguiente/stepper/Comenzar/
  // Reiniciar) sí se mueve, y #guia-wizard-indicador (aria-live="polite")
  // ya hace de anuncio del cambio — no se duplica con una región aparte.
  function mostrarPantalla(pantalla, { moverFoco = true } = {}) {
    pantallaActual = pantalla;
    if (pantalla === "bienvenida") localStorage.removeItem(CLAVE_GUIA_PASO);
    else localStorage.setItem(CLAVE_GUIA_PASO, String(pantalla));

    const idActivo = idDePantalla(pantalla);
    pantallas.forEach((el) => {
      el.classList.toggle("guia-pantalla--activa", el.id === idActivo);
    });

    const esPaso = pantalla !== "bienvenida" && pantalla !== "cierre";
    progresoContenedor.hidden = !esPaso;
    controlesContenedor.hidden = !esPaso;
    botonReiniciar.hidden = pantalla === "bienvenida";

    if (esPaso) {
      const numero = Number(pantalla);
      indicador.textContent = "Paso " + numero + " de " + GUIA_TOTAL_PASOS;
      barraRelleno.style.width = (numero / GUIA_TOTAL_PASOS) * 100 + "%";
      stepperBotones.forEach((boton) => {
        const activo = Number(boton.dataset.irAPaso) === numero;
        boton.classList.toggle("guia-wizard__stepper-numero--activo", activo);
        boton.setAttribute("aria-selected", String(activo));
      });
      botonSiguiente.textContent = numero === GUIA_TOTAL_PASOS ? "Finalizar ✅" : "Siguiente →";
    }

    if (moverFoco) document.getElementById(idActivo)?.querySelector("h2")?.focus();
  }

  botonComenzar.addEventListener("click", () => mostrarPantalla(1));

  botonAnterior.addEventListener("click", () => {
    const numero = Number(pantallaActual);
    mostrarPantalla(numero <= 1 ? "bienvenida" : numero - 1);
  });

  botonSiguiente.addEventListener("click", () => {
    const numero = Number(pantallaActual);
    mostrarPantalla(numero >= GUIA_TOTAL_PASOS ? "cierre" : numero + 1);
  });

  stepperBotones.forEach((boton) => {
    boton.addEventListener("click", () => mostrarPantalla(Number(boton.dataset.irAPaso)));
  });

  botonReiniciar.addEventListener("click", () => mostrarPantalla("bienvenida"));

  // Único de los dos enlaces de "ver guía completa" que alterna
  // (el de la pantalla de Cierre solo activa la vista, sin volver): este
  // vive fijo arriba del wizard en todo momento, así que necesita poder
  // revertirse sin recargar la página.
  botonVistaCompleta.addEventListener("click", () => {
    const activar = !wizard.classList.contains("guia-wizard--vista-completa");
    wizard.classList.toggle("guia-wizard--vista-completa", activar);
    botonVistaCompleta.textContent = activar
      ? "🧭 Volver a la vista de pasos"
      : "📄 Ver guía completa en una sola página";
  });

  enlaceVistaCompletaCierre.addEventListener("click", (evento) => {
    evento.preventDefault();
    wizard.classList.add("guia-wizard--vista-completa");
    botonVistaCompleta.textContent = "🧭 Volver a la vista de pasos";
  });

  // La vista expandida también se fuerza por CSS en @media print
  // (ver css/style.css) sin importar esta clase — se agrega aquí además
  // para que la vista en pantalla ya quede correcta si el alumno vuelve
  // de la vista previa de impresión sin haber impreso.
  botonDescargarPdf.addEventListener("click", () => {
    wizard.classList.add("guia-wizard--vista-completa");
    botonVistaCompleta.textContent = "🧭 Volver a la vista de pasos";
    window.print();
  });

  mostrarPantalla(pantallaActual, { moverFoco: false });
}

/* =========================================================
   10. INICIALIZACIÓN
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  // Un evento forzado (Navidad, ver Fase 4) gana siempre sobre el tema
  // personal — ni siquiera se lee localStorage/Supabase de temaActual en
  // ese caso, aplicarTema() recibe directo el slug del evento.
  eventoActivo = await promesaTemaEventoActivo;
  aplicarTema(eventoActivo || temaActual);

  // Franja tricolor de Independencia: elemento estructural, no depende
  // de patrones_fondo_activos (a diferencia de los otros 3 efectos del
  // evento, ver activarEfectosIndependencia más abajo) — mismo criterio
  // que la paleta base del tema, que tampoco depende de ese flag.
  if (eventoActivo === "independencia") crearFranjaTricolorIndependencia();

  // Mientras la promesa no resuelve (o si falla/devuelve false), el
  // <body> se queda sin la clase y css/style.css no muestra ningún
  // patrón — el mismo fallback "false" de obtenerPatronesFondoActivos()
  // ya evita el parpadeo de "aparece y desaparece". Los 4 efectos de
  // Navidad comparten ese mismo gate (ver activarEfectosNavidad).
  const patronesActivos = await promesaPatronesFondoActivos;
  if (patronesActivos) {
    document.body.classList.add("patrones-activos");
  }

  if (patronesActivos) {
    if (eventoActivo === "navidad") activarEfectosNavidad();
    else if (eventoActivo === "dia-de-muertos") activarEfectosDiaDeMuertos();
    else if (eventoActivo === "regreso-a-clases") activarEfectosRegresoAClases();
    else if (eventoActivo === "independencia") activarEfectosIndependencia();
    else if (eventoActivo === "amor-y-amistad") activarEfectosAmorYAmistad();
    else if (eventoActivo === "dia-del-maestro") activarEfectosDiaDelMaestro();
    else if (eventoActivo === "fin-de-curso") activarEfectosFinDeCurso();
  }

  // Sincroniza el <select> de grupo de la barra lateral con el grupo
  // recuperado de localStorage (por defecto "todos").
  sincronizarSelectorGrupo(grupoActual);

  // calcularEstadoTrimestre() (usado por las dos llamadas de abajo)
  // necesita trimestreDesbloqueado ya resuelto. La consulta arrancó al
  // cargar el script (ver sección 2), así que normalmente esta espera es
  // instantánea; solo tarda de verdad si el guard de arriba todavía no
  // había resuelto (por ejemplo en index.html, donde no hay overlay que
  // lo cubra).
  trimestreDesbloqueado = await promesaTrimestreDesbloqueado;

  actualizarEnlacesTrimestreEnSidebar();
  actualizarEstadoTarjetasTrimestre();

  // Espera la sesión de Supabase antes del primer render: itemEstaCompletado,
  // renderizarProgreso y renderizarProgresoDetallado leen
  // obtenerPerfilActivo()/progresoCache de forma síncrona y necesitan las
  // cachés ya pobladas (ver sección 11).
  await sincronizarPerfilActivo();
  // Fase 14: sin await a propósito — no bloquea renderizarTodo() ni el
  // resto de la carga; solo alumnos con grupo y sesión llegan a
  // consultar algo (ver verificarCelebracionTemasDesbloqueados), así que
  // para el resto de casos (sin sesión, docente, Modo Demo) esto resuelve
  // casi de inmediato de todos modos.
  verificarCelebracionTemasDesbloqueados();
  await renderizarTodo();

  // Deep-link desde progreso.html (#tarea-{id}/#actividad-{id}/
  // #proyecto-{id}): solo hace algo en trimestre-1.html y en modo
  // "pestañas" — ver activarPestanaDesdeHash(). Se llama UNA sola vez,
  // aquí en la carga inicial, no en los otros renderizarTodo() (cambio
  // de grupo/sesión): el hash no cambia ahí, y forzar la pestaña de
  // vuelta en cada re-render sería sorprender al alumno si ya había
  // cambiado de pestaña él mismo.
  if (TRIMESTRE_ACTUAL === "1") activarPestanaDesdeHash();

  activarSelectorTema();
  activarModalCelebracionTema();
  // Código muerto (ver nota de aplicarEstadoSidebarColapsada arriba):
  // #boton-colapsar-sidebar ya no existe en ninguna página.
  const botonColapsarSidebar = document.getElementById("boton-colapsar-sidebar");
  if (botonColapsarSidebar) botonColapsarSidebar.addEventListener("click", alternarSidebarColapsada);
  document.querySelectorAll(".selector-grupo-control").forEach((select) => {
    select.addEventListener("change", alCambiarGrupo);
  });
  activarFormulariosCuenta();
  activarPanelSesionCuenta();
  activarAccionesPerfilProgreso();
  activarBotonImprimirProgreso();
  actualizarUISesion();
  activarSubmenusSidebar();
  activarFlyoutsRiel();
  activarSheetsMovil();
  activarSelectorModoTrimestre();
  activarControlEscalaTexto();
  activarTooltipsInfo();
  activarResaltadoDeNavegacion();
  activarBotonVolverArriba();
  activarBannerExamenDiagnostico();
  activarTabsAdmin();
  activarCierreSesionAdmin();
  activarSwitchFormatoCalificacion();
  activarToastModoDemo();
  activarGuiaAlumno();
  activarTabsMateriales();
  activarFiltroTipoEventos();
  await inicializarModuloCalificacion();
  await inicializarModuloAlumnos();
  await inicializarModuloAsistencia();
  await inicializarModuloAvisos();
  await inicializarModuloTrimestre();
  await inicializarModuloFechas();
  await inicializarModuloCalendarioAdmin();
  await inicializarModuloEvaluacion();
  await inicializarModuloDashboard();
  await inicializarModuloApariencia();

  const botonMesAnterior = document.getElementById("calendario-mes-anterior");
  if (botonMesAnterior) botonMesAnterior.addEventListener("click", () => avanzarMesCalendario(-1));
  const botonMesSiguiente = document.getElementById("calendario-mes-siguiente");
  if (botonMesSiguiente) botonMesSiguiente.addEventListener("click", () => avanzarMesCalendario(1));

  // Modal de detalle: un listener delegado por sección más el cierre
  // (botón "✕" y click en el ::backdrop) del <dialog> compartido.
  activarDelegacionVerDetalle("contenedor-tareas");
  activarDelegacionVerDetalle("contenedor-actividades");
  activarDelegacionVerDetalle("contenedor-proyectos");
  activarDelegacionVerDetalle("contenedor-temario");
  activarDelegacionInfografias();
  activarSpotlightTarjetas();
  activarCierreModalDetalle();
  activarCierreModalDemo();
  activarInterceptorEntregaDemo();
  await inicializarPopupBienvenidaIndex();

  // El formulario de contacto solo existe en la portada (index.html).
  const formularioContacto = document.getElementById("formulario-contacto");
  if (formularioContacto) {
    precargarGrupoContacto(formularioContacto);
    activarEvidenciaContacto(formularioContacto);
    formularioContacto.addEventListener("submit", alEnviarContacto);
  }
});

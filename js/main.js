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

const DATOS_EVENTOS = [
  { id: "e1", grupo: "todos", titulo: "Entrega reglamento de taller", fecha: "2026-07-04" },
  { id: "e2", grupo: "3E", titulo: "Entrega diseño CAD", fecha: "2026-07-08" },
  { id: "e3", grupo: "3C", titulo: "Entrega investigación de robótica", fecha: "2026-07-10" },
  { id: "e4", grupo: "todos", titulo: "Revisión de avance de proyectos", fecha: "2026-07-24" },
  { id: "e5", grupo: "todos", titulo: "Entrega final de proyectos", fecha: "2026-08-14" },
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
// concepto DISTINTO de DATOS_EVENTOS/TAREAS/ACTIVIDADES/PROYECTOS (eso es
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
  { fecha: "2026-08-24", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva", verificado: true },
  { fecha: "2026-08-25", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva", verificado: true },
  { fecha: "2026-08-26", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva", verificado: true },
  { fecha: "2026-08-27", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva", verificado: true },
  { fecha: "2026-08-28", tipo: "cte-intensiva", etiqueta: "CTE Fase Intensiva", verificado: true },

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
  { fecha: "2026-09-25", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria", verificado: true },
  { fecha: "2026-10-30", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria", verificado: true },
  { fecha: "2026-11-27", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria", verificado: true },
  { fecha: "2027-01-29", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria", verificado: true },
  { fecha: "2027-02-26", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria", verificado: true },
  { fecha: "2027-04-30", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria", verificado: true },
  { fecha: "2027-05-28", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria", verificado: true },
  { fecha: "2027-06-25", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria", verificado: true },

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
  // FECHAS TENTATIVAS/PLACEHOLDER (t5-t13): aún no existe calendario
  // escolar oficial para el Bloque 1; ajustar cuando se confirme.
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
  // FECHAS TENTATIVAS/PLACEHOLDER: ajustar cuando se asignen fechas reales
  // (ver checklist pendiente de fechas de todo el sitio).
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
  // FECHAS TENTATIVAS/PLACEHOLDER: ajustar cuando se asignen fechas reales.
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
  // FECHAS TENTATIVAS/PLACEHOLDER (a4-a12): aún no existe calendario
  // escolar oficial para el Bloque 1; ajustar cuando se confirme.
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
  // FECHAS TENTATIVAS/PLACEHOLDER (p3-p5): aún no existe calendario
  // escolar oficial para el Bloque 1; ajustar cuando se confirme.
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
async function obtenerAvisos() {
  return DATOS_AVISOS;
}

async function obtenerEventos() {
  return DATOS_EVENTOS;
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

async function obtenerPresentaciones(trimestre) {
  return DATOS_PRESENTACIONES[trimestre] || [];
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

const CLAVE_SIDEBAR_COLAPSADA = "sidebarColapsada";
const CLAVE_SUBMENU_INICIO = "submenuInicioExpandido";
const CLAVE_SUBMENU_TRIMESTRE = "submenuTrimestreExpandido";

// Preferencia de sidebar colapsada/expandida (desktop ≥1024px). Se lee
// y se aplica aquí mismo, en código de nivel superior que corre antes
// de DOMContentLoaded: el <aside> y el botón ya existen en el DOM en
// este punto porque el <script> va al final del <body>, así que no hay
// que esperar al evento para evitar un "flash" de sidebar expandida
// que luego se colapsa. aplicarEstadoSidebarColapsada está definida
// más abajo (sección 8) pero se puede llamar aquí por hoisting.
let sidebarColapsada = localStorage.getItem(CLAVE_SIDEBAR_COLAPSADA) === "true";
aplicarEstadoSidebarColapsada(sidebarColapsada);

// Trimestre desbloqueado de verdad. El sitio no tiene un calendario
// académico real que decida solo cuándo abrir cada trimestre, así que
// esto se sube a mano (a 2 o a 3) cuando toca abrirlo.
const TRIMESTRE_DESBLOQUEADO = 3; // Cambiar manualmente a 2 o 3 para abrir ese trimestre

// Trimestre de la página actual ('1', '2' o '3'), tomado de
// <body data-trimestre="…">. En la portada (index.html) no existe
// ese atributo, por lo que queda en null.
const TRIMESTRE_ACTUAL = document.body.dataset.trimestre || null;

// Guarda de acceso real (no solo visual): si se entra por URL directa a
// la página de un trimestre que TRIMESTRE_DESBLOQUEADO todavía no
// libera, se redirige a la portada de inmediato, antes de renderizar
// nada de esa página.
if (TRIMESTRE_ACTUAL && Number(TRIMESTRE_ACTUAL) > TRIMESTRE_DESBLOQUEADO) {
  window.location.replace("index.html");
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

// Resuelve el valor de fechaEntrega/fecha de un ítem a texto ya formateado.
// Soporta el formato legado (string, una sola fecha para ambos grupos) y el
// formato por grupo ({ "3C": ..., "3E": ... }, para ítems grupo:"todos" con
// horarios distintos por grupo). Por defecto resuelve contra grupoActual
// (el selector de grupo de la portada), pero acepta un "grupoParaResolver"
// explícito para los casos donde el grupo relevante es otro (ej. el panel
// de Progreso, que debe usar el grupo del alumno identificado, no el
// selector de grupo de la página — son conceptos independientes). Con
// "todos" se muestran las dos fechas juntas porque no hay una sola fecha
// "correcta" que mostrar.
function resolverFechaItem(valorFecha, grupoParaResolver) {
  if (typeof valorFecha === "string") return formatearFecha(valorFecha);

  const grupo = grupoParaResolver || grupoActual;

  if (grupo === "3C" || grupo === "3E") return formatearFecha(valorFecha[grupo]);

  return "3°C: " + formatearFecha(valorFecha["3C"]) + " · 3°E: " + formatearFecha(valorFecha["3E"]);
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
// actividades, item.fechaEntrega para tareas/proyectos) y mismo soporte de
// fecha por grupo ({3C, 3E}) para ítems "todos" con horarios distintos.
function fechaLimiteISO(tipo, item, grupo) {
  const valor = tipo === "actividad" ? item.fecha : item.fechaEntrega;
  if (valor == null) return null;
  if (typeof valor === "string") return valor;
  return valor[grupo] || null;
}

// Vencido = ya pasó el final del día de la fecha límite. Solo tiene
// sentido para ítems no completados (ver crearChecklistProgreso).
function itemEstaVencido(tipo, item, grupo) {
  const iso = fechaLimiteISO(tipo, item, grupo);
  if (!iso) return false;
  return new Date(iso + "T23:59:59") < new Date();
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

function mostrarSinResultados(contenedor, mensaje) {
  contenedor.innerHTML = "";
  const parrafo = document.createElement("p");
  parrafo.className = "sin-resultados";
  parrafo.textContent = mensaje;
  contenedor.appendChild(parrafo);
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

// Llena el <dialog id="modal-detalle"> de la página actual con el
// título y el texto largo del item, y lo muestra.
// "detalleCompleto" es HTML de confianza (escrito a mano en DATOS_*,
// no entrada de usuarios finales) con <p>/<ul>/<li> para tiempo,
// modalidad, materiales e instrucciones; por eso se inserta con
// innerHTML en vez de textContent.
function abrirModalDetalle(item) {
  const modal = document.getElementById("modal-detalle");
  if (!modal) return;

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
    botonCerrar.addEventListener("click", () => modal.close());
  }

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) modal.close();
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
    mostrarSinResultados(contenedor, "No hay horario registrado para este grupo.");
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
    mostrarSinResultados(contenedor, "No hay avisos por el momento.");
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
    mostrarSinResultados(contenedor, "El temario de este trimestre aún no está disponible.");
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
      if (item.detalleTemario) {
        info.appendChild(crearBotonVerDetalle(item));
      }

      tarjeta.append(imagen, info);
      cuadriculaGrupo.appendChild(tarjeta);
      indiceGlobal++;
    });

    bloqueGrupo.appendChild(cuadriculaGrupo);
    contenedor.appendChild(bloqueGrupo);
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

      resumen.append(cabecera, descripcion, meta, icono);

      const niveles = document.createElement("ul");
      niveles.className = "tarjeta-rubrica__niveles";
      (item.niveles || []).forEach((nivelInfo) => {
        const li = document.createElement("li");
        li.className = "nivel-item";
        li.dataset.nivel = nivelInfo.nivel.toLowerCase();

        const cabeceraNivel = document.createElement("div");
        cabeceraNivel.className = "nivel-item__cabecera";
        const nombreNivel = document.createElement("span");
        nombreNivel.className = "nivel-item__nombre";
        nombreNivel.textContent = nivelInfo.nivel;
        const puntosNivel = document.createElement("span");
        puntosNivel.className = "nivel-item__puntos";
        puntosNivel.textContent = nivelInfo.puntos + " pts";
        cabeceraNivel.append(nombreNivel, puntosNivel);

        const descripcionNivel = document.createElement("p");
        descripcionNivel.className = "nivel-item__descripcion";
        descripcionNivel.textContent = nivelInfo.descripcion;

        li.append(cabeceraNivel, descripcionNivel);
        niveles.appendChild(li);
      });

      tarjeta.append(resumen, niveles);
      cuadriculaGrupo.appendChild(tarjeta);
    });

    bloqueGrupo.appendChild(cuadriculaGrupo);
    contenedor.appendChild(bloqueGrupo);
  });
}

// Indicador de solo lectura del progreso personal de una tarjeta de tarea,
// actividad o proyecto: el progreso ya no lo marca el alumno con un
// checkbox, se calcula automático a partir de progresoCache (tabla
// "progreso" de Supabase, ver sección 11). Común a renderizarTareas,
// renderizarActividades y renderizarProyectos.
function crearChecklistProgreso(tipo, item, tarjeta) {
  const indicador = document.createElement("div");
  indicador.className = "indicador-progreso";

  const perfil = obtenerPerfilActivo();
  if (!perfil) {
    const aviso = document.createElement("span");
    aviso.className = "indicador-progreso__aviso-sesion";
    aviso.textContent = "🔑 Inicia sesión para ver tu progreso";
    indicador.appendChild(aviso);
    return indicador;
  }

  const completada = itemEstaCompletado(tipo, item.id);
  tarjeta.classList.toggle("tarjeta--completada", completada);

  const badge = document.createElement("span");
  badge.className = "badge-estado";
  if (completada) {
    badge.dataset.estado = "completada";
    badge.textContent = "🟢 Entregado";
  } else if (itemEstaVencido(tipo, item, perfil.grupo)) {
    badge.dataset.estado = "atrasada";
    badge.textContent = "🔒 Vencido sin entregar";
  } else {
    badge.dataset.estado = "pendiente";
    badge.textContent = "🟡 Pendiente";
  }
  indicador.appendChild(badge);

  return indicador;
}

async function renderizarTareas() {
  const contenedor = document.getElementById("contenedor-tareas");
  if (!contenedor) return;

  const datos = (await obtenerTareas(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay tareas registradas para este grupo.");
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
}

async function renderizarActividades() {
  const contenedor = document.getElementById("contenedor-actividades");
  if (!contenedor) return;

  const datos = (await obtenerActividades(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay actividades registradas para este grupo.");
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
}

async function renderizarProyectos() {
  const contenedor = document.getElementById("contenedor-proyectos");
  if (!contenedor) return;

  const datos = (await obtenerProyectos(TRIMESTRE_ACTUAL)).filter(elementoCoincideConGrupo);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay proyectos registrados para este grupo.");
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

async function renderizarPresentaciones() {
  const contenedor = document.getElementById("contenedor-presentaciones");
  if (!contenedor) return;

  const datos = await obtenerPresentaciones(TRIMESTRE_ACTUAL);

  if (datos.length === 0) {
    mostrarSinResultados(contenedor, "No hay presentaciones registradas para este bloque.");
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
function activarBotonEncuadreAnual() {
  const boton = document.getElementById("boton-ver-encuadre-anual");
  if (!boton) return;
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

  const coincideConGrupoDelAlumno = (item) => item.grupo === "todos" || item.grupo === perfil.grupo;

  let totalGeneral = 0;
  let completadasGeneral = 0;
  const porTrimestre = [];

  for (const trimestre of ["1", "2", "3"]) {
    const tareas = (await obtenerTareas(trimestre)).filter(coincideConGrupoDelAlumno);
    const actividades = (await obtenerActividades(trimestre)).filter(coincideConGrupoDelAlumno);
    const proyectos = (await obtenerProyectos(trimestre)).filter(coincideConGrupoDelAlumno);

    const completadasTareas = tareas.filter((item) =>
      itemEstaCompletado("tarea", item.id, trimestre)
    ).length;
    const completadasActividades = actividades.filter((item) =>
      itemEstaCompletado("actividad", item.id, trimestre)
    ).length;
    const completadasProyectos = proyectos.filter((item) =>
      itemEstaCompletado("proyecto", item.id, trimestre)
    ).length;

    const total = tareas.length + actividades.length + proyectos.length;
    const completadas = completadasTareas + completadasActividades + completadasProyectos;

    totalGeneral += total;
    completadasGeneral += completadas;
    porTrimestre.push({ trimestre, total, completadas });
  }

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
async function renderizarProgresoDetallado() {
  const sinPerfil = document.getElementById("progreso-sin-perfil");
  const conPerfil = document.getElementById("progreso-con-perfil");
  if (!sinPerfil || !conPerfil) return;

  const perfil = obtenerPerfilActivo();
  sinPerfil.hidden = Boolean(perfil);
  conPerfil.hidden = !perfil;
  if (!perfil) return;

  const nombreEl = document.getElementById("progreso-alumno-nombre");
  const grupoEl = document.getElementById("progreso-alumno-grupo");
  if (nombreEl) nombreEl.textContent = perfil.nombre;
  if (grupoEl) grupoEl.textContent = textoGrupo(perfil.grupo);

  const coincideConGrupoDelAlumno = (item) => item.grupo === "todos" || item.grupo === perfil.grupo;

  let totalGeneral = 0;
  let completadasGeneral = 0;
  const porTrimestre = [];

  for (const trimestre of ["1", "2", "3"]) {
    const tareas = (await obtenerTareas(trimestre)).filter(coincideConGrupoDelAlumno);
    const actividades = (await obtenerActividades(trimestre)).filter(coincideConGrupoDelAlumno);
    const proyectos = (await obtenerProyectos(trimestre)).filter(coincideConGrupoDelAlumno);

    const completadasTareas = tareas.filter((item) =>
      itemEstaCompletado("tarea", item.id, trimestre)
    ).length;
    const completadasActividades = actividades.filter((item) =>
      itemEstaCompletado("actividad", item.id, trimestre)
    ).length;
    const completadasProyectos = proyectos.filter((item) =>
      itemEstaCompletado("proyecto", item.id, trimestre)
    ).length;

    const total = tareas.length + actividades.length + proyectos.length;
    const completadas = completadasTareas + completadasActividades + completadasProyectos;

    totalGeneral += total;
    completadasGeneral += completadas;
    porTrimestre.push({ trimestre, tareas, actividades, proyectos, total, completadas });
  }

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
  }

  // --- Detalle itemizado por trimestre (solo existe en progreso.html) ---
  const detalle = document.getElementById("progreso-detalle-trimestres");
  if (!detalle) return;

  detalle.innerHTML = "";
  // TRIMESTRE_ACTUAL es null aquí (esta página no tiene <body
  // data-trimestre>), así que se abre por defecto el último trimestre
  // visto en vez del "actual" de la página.
  const trimestreParaAbrir = TRIMESTRE_ACTUAL || ultimoTrimestreVisto;

  porTrimestre.forEach(({ trimestre, tareas, actividades, proyectos, total, completadas }) => {
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
          enlace.href = "trimestre-" + trimestre + ".html#" + tipo + "-" + item.id;
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
  "cte-intensiva": "CTE Fase Intensiva",
  "cte-ordinaria": "CTE Sesión Ordinaria",
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

  const esOscuro = tema === "oscuro";

  document.querySelectorAll(".boton-tema").forEach((boton) => {
    boton.setAttribute("aria-pressed", String(esOscuro));
    boton.setAttribute("aria-label", esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    const icono = boton.querySelector(".boton-tema__icono");
    if (icono) icono.textContent = esOscuro ? "☀️" : "🌙";
    const texto = boton.querySelector(".boton-tema__texto");
    if (texto) texto.textContent = esOscuro ? "Modo claro" : "Modo oscuro";
  });
}

function alternarTema() {
  // Se guarda en localStorage para que el tema no se reinicie al
  // navegar entre la portada y las páginas de trimestre.
  temaActual = temaActual === "oscuro" ? "claro" : "oscuro";
  localStorage.setItem(CLAVE_TEMA, temaActual);
  aplicarTema(temaActual);
}

/* =========================================================
   8. BARRA LATERAL / BARRA INFERIOR Y FILTRO DE GRUPO
   ========================================================= */

// Colapsa/expande la barra lateral de escritorio a un riel de solo
// íconos (ver .barra-lateral--colapsada en css/style.css). El estado
// se refleja en dos clases porque son dos elementos distintos que
// necesitan animarse juntos: una en el <aside> (para su ancho) y otra
// en <body> (para el padding-left que le hace espacio al contenido).
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

// Los 7 enlaces de la barra lateral que apuntan a secciones dentro de una
// página de trimestre (identificados por data-enlace en el HTML). En una
// página de trimestre ya son anclas locales ("#temario") y no se tocan;
// en la portada y en FAQ se reescriben para apuntar a
// "trimestre-N.html#ancla" usando ultimoTrimestreVisto.
const ANCLAS_DE_TRIMESTRE = [
  "temario",
  "presentaciones",
  "rubricas",
  "tareas",
  "actividades",
  "proyectos",
  "videos",
  "entrega",
];

function actualizarEnlacesTrimestreEnSidebar() {
  if (TRIMESTRE_ACTUAL) return;

  const nav = document.getElementById("nav-principal");
  if (!nav) return;

  ANCLAS_DE_TRIMESTRE.forEach((id) => {
    const enlace = nav.querySelector('[data-enlace="' + id + '"]');
    if (enlace) enlace.href = "trimestre-" + ultimoTrimestreVisto + ".html#" + id;
  });

  const textoTrimestre = nav.querySelector("[data-texto-trimestre]");
  if (textoTrimestre) {
    textoTrimestre.textContent = "Trimestre " + ultimoTrimestreVisto;
    const enlacePadre = textoTrimestre.closest("a");
    if (enlacePadre) enlacePadre.href = "trimestre-" + ultimoTrimestreVisto + ".html";
  }
}

// Marca cada .tarjeta-trimestre de la portada como "finalizado", "actual"
// o "proximamente" comparando su número contra TRIMESTRE_DESBLOQUEADO (el
// control real de acceso; ultimoTrimestreVisto solo sirve para los
// enlaces del sidebar, no para esto). Las tarjetas "proximamente" son
// <a href> funcionales en el HTML (por si se quita el bloqueo más
// adelante), así que aquí también se intercepta su clic para que no
// naveguen mientras sigan bloqueadas.
function actualizarEstadoTarjetasTrimestre() {
  const tarjetas = document.querySelectorAll(".tarjeta-trimestre[data-trimestre]");
  if (tarjetas.length === 0) return;

  const actual = TRIMESTRE_DESBLOQUEADO;

  tarjetas.forEach((tarjeta) => {
    const numero = Number(tarjeta.dataset.trimestre);
    const etiqueta = tarjeta.querySelector(".tarjeta-trimestre__estado");
    let estado;
    let texto;

    if (numero < actual) {
      estado = "finalizado";
      texto = "Finalizado";
    } else if (numero === actual) {
      estado = "actual";
      texto = "Actual";
    } else {
      estado = "proximamente";
      texto = "🔒 Próximamente";
    }

    tarjeta.dataset.estado = estado;
    if (etiqueta) etiqueta.textContent = texto;

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

// Botón flotante "Volver arriba": solo existe en las páginas de
// trimestre (no en la portada), así que si no se encuentra el botón la
// función simplemente no hace nada.
function activarBotonVolverArriba() {
  const boton = document.getElementById("boton-volver-arriba");
  if (!boton) return;

  const UMBRAL_PX = 400;
  let actualizacionPendiente = false;

  function actualizarVisibilidad() {
    const visible = window.scrollY > UMBRAL_PX;
    boton.classList.toggle("boton-volver-arriba--visible", visible);
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
      window.requestAnimationFrame(actualizarVisibilidad);
    },
    { passive: true }
  );

  actualizarVisibilidad(); // por si la página carga con scroll ya restaurado

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

  const nav = document.getElementById("nav-principal");
  if (!nav) return;

  const enlaces = Array.from(nav.querySelectorAll('a[href^="#"]'));
  if (enlaces.length === 0) return;

  const seccionPorEnlace = new Map();
  const secciones = [];
  enlaces.forEach((enlace) => {
    const id = enlace.getAttribute("href").slice(1);
    const seccion = document.getElementById(id);
    if (seccion) {
      seccionPorEnlace.set(seccion, enlace);
      secciones.push(seccion);
    }
  });
  if (secciones.length === 0) return;

  function marcarActivo(enlaceActivo) {
    enlaces.forEach((enlace) => {
      enlace.classList.toggle("nav-link--activo", enlace === enlaceActivo);
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
    renderizarRubricas(),
    renderizarTareas(),
    renderizarActividades(),
    renderizarProyectos(),
    renderizarVideos(),
    renderizarPresentaciones(),
    renderizarProgreso(),
    renderizarProgresoDetallado(),
  ]);
  activarBotonEncuadreAnual();
}

// La barra lateral (desktop) y el modal de grupo (barra inferior móvil)
// tienen cada uno su propio <select> ("selector-grupo" y
// "selector-grupo-movil" respectivamente, un <select> no puede repetir
// id). Cambiar cualquiera de los dos debe reflejarse en el otro para que
// no queden desincronizados al cambiar de tamaño de ventana.
function sincronizarSelectoresGrupo(valor) {
  const desktop = document.getElementById("selector-grupo");
  const movil = document.getElementById("selector-grupo-movil");
  if (desktop) desktop.value = valor;
  if (movil) movil.value = valor;
}

async function alCambiarGrupo(evento) {
  // Se guarda en localStorage para que el grupo elegido no se pierda
  // al navegar entre la portada y las páginas de trimestre.
  grupoActual = evento.target.value;
  localStorage.setItem(CLAVE_GRUPO, grupoActual);
  sincronizarSelectoresGrupo(grupoActual);
  await renderizarTodo();
}

// Modal de grupo: mismo patrón que activarCierreModalDetalle (showModal/
// close, cierre por botón "✕" o click en el ::backdrop; ESC lo maneja el
// <dialog> nativo). Solo tiene disparador en la barra inferior móvil.
function activarModalGrupo() {
  const boton = document.getElementById("boton-grupo-movil");
  const modal = document.getElementById("modal-grupo");
  if (!boton || !modal) return;

  boton.addEventListener("click", () => modal.showModal());

  const botonCerrar = modal.querySelector(".modal-grupo__cerrar");
  if (botonCerrar) botonCerrar.addEventListener("click", () => modal.close());

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) modal.close();
  });
}

/* =========================================================
   9. FORMULARIO DE CONTACTO (Netlify Forms)
   ========================================================= */

// Convierte los datos del formulario al formato que espera Netlify
// ("application/x-www-form-urlencoded") para poder enviarlos con fetch
// y así evitar que la página se recargue al enviar el mensaje.
function codificarDatosFormulario(datos) {
  return Object.keys(datos)
    .map((clave) => encodeURIComponent(clave) + "=" + encodeURIComponent(datos[clave]))
    .join("&");
}

async function alEnviarContacto(evento) {
  evento.preventDefault();

  const formulario = evento.target;
  const boton = formulario.querySelector("button[type='submit']");
  const estado = document.getElementById("contacto-estado");
  const datos = {};
  new FormData(formulario).forEach((valor, clave) => {
    datos[clave] = valor;
  });

  boton.disabled = true;
  estado.dataset.estado = "";
  estado.textContent = "Enviando…";

  try {
    // Netlify procesa cualquier POST a la propia página que incluya
    // "form-name" con el nombre del formulario declarado en el HTML.
    const respuesta = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: codificarDatosFormulario(datos),
    });

    if (!respuesta.ok) throw new Error("Respuesta no válida de Netlify Forms");

    estado.dataset.estado = "exito";
    estado.textContent = "Gracias, tu mensaje fue enviado.";
    formulario.reset();
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
   ========================================================= */

const SUPABASE_URL = "https://dugfyqtzcnuwjfvijsqs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_aofoI-IHSwFh4yi5jzLANw_k_2e11dj";

const clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const { data: { session } } = await clienteSupabase.auth.getSession();
  if (!session) {
    perfilActivoCache = null;
    progresoCache = [];
    return;
  }

  const { data: perfil } = await clienteSupabase
    .from("perfiles")
    .select("nombre, grupo")
    .eq("id", session.user.id)
    .single();

  perfilActivoCache = perfil ? { nombre: perfil.nombre, grupo: perfil.grupo } : null;

  const { data: progreso } = await clienteSupabase
    .from("progreso")
    .select("tipo, item_id, trimestre")
    .eq("perfil_id", session.user.id);

  progresoCache = progreso || [];
}

// Botón "Perfil" de la barra lateral (desktop) y de la barra inferior
// (móvil), marcados con data-boton-cuenta: antes alternaban el modal de
// identificación, ahora reflejan la sesión de Supabase y llevan a
// cuenta.html o cierran sesión según el caso.
async function actualizarUISesion() {
  const { data: { session } } = await clienteSupabase.auth.getSession();
  const elementos = document.querySelectorAll("[data-boton-cuenta]");

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
    return;
  }

  const perfil = obtenerPerfilActivo();
  const nombreMostrado = perfil?.nombre ? perfil.nombre.split(" ")[0] : "Mi cuenta";

  elementos.forEach((el) => {
    el.textContent = "";
    const icono = document.createElement("span");
    icono.setAttribute("aria-hidden", "true");
    icono.textContent = "🧑‍🎓";
    const texto = document.createElement("span");
    texto.textContent = nombreMostrado;
    el.append(icono, texto);
    el.onclick = () => { window.location.href = "cuenta.html"; };
  });
}

// Los formularios de "Crear cuenta" / "Iniciar sesión" solo existen en
// cuenta.html (se buscan por id y, si no están, la función no hace nada
// en el resto de páginas).
function activarFormulariosCuenta() {
  const tabCrear = document.getElementById("tab-crear");
  const tabLogin = document.getElementById("tab-login");
  const panelCrear = document.getElementById("panel-crear");
  const panelLogin = document.getElementById("panel-login");
  if (!tabCrear || !tabLogin) return;

  function mostrarTab(activo) {
    const esCrear = activo === "crear";
    tabCrear.classList.toggle("cuenta-tabs__boton--activo", esCrear);
    tabLogin.classList.toggle("cuenta-tabs__boton--activo", !esCrear);
    tabCrear.setAttribute("aria-selected", String(esCrear));
    tabLogin.setAttribute("aria-selected", String(!esCrear));
    panelCrear.hidden = !esCrear;
    panelLogin.hidden = esCrear;
  }

  tabCrear.addEventListener("click", () => mostrarTab("crear"));
  tabLogin.addEventListener("click", () => mostrarTab("login"));

  const formCrear = document.getElementById("formulario-crear-cuenta");
  const errorCrear = document.getElementById("crear-cuenta-error");

  formCrear?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorCrear.hidden = true;

    const codigo = document.getElementById("codigo-invitacion").value.trim().toUpperCase();
    const correo = document.getElementById("crear-correo").value.trim();
    const contrasena = document.getElementById("crear-contrasena").value;
    const confirmar = document.getElementById("crear-contrasena-confirmar").value;

    const formatoValido = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo);
    if (!formatoValido) {
      errorCrear.textContent = "El código debe tener el formato XXXX-XXXX-XXXX. Verifica que esté bien escrito.";
      errorCrear.hidden = false;
      return;
    }
    if (contrasena !== confirmar) {
      errorCrear.textContent = "Las contraseñas no coinciden.";
      errorCrear.hidden = false;
      return;
    }
    if (contrasena.length < 6) {
      errorCrear.textContent = "La contraseña debe tener al menos 6 caracteres.";
      errorCrear.hidden = false;
      return;
    }

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

    window.location.href = "index.html";
  });

  const formLogin = document.getElementById("formulario-login");
  const errorLogin = document.getElementById("login-error");

  formLogin?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorLogin.hidden = true;

    const correo = document.getElementById("login-correo").value.trim();
    const contrasena = document.getElementById("login-contrasena").value;

    const { error } = await clienteSupabase.auth.signInWithPassword({ email: correo, password: contrasena });
    if (error) {
      errorLogin.textContent = "Correo o contraseña incorrectos.";
      errorLogin.hidden = false;
      return;
    }
    window.location.href = "index.html";
  });
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

  const botonCerrar = document.getElementById("boton-cerrar-sesion-cuenta");
  if (botonCerrar) {
    botonCerrar.addEventListener("click", async () => {
      if (!window.confirm("¿Seguro que quieres cerrar sesión?")) return;
      await clienteSupabase.auth.signOut();
      window.location.href = "index.html";
    });
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
clienteSupabase.auth.onAuthStateChange(async () => {
  await sincronizarPerfilActivo();
  await actualizarUISesion();
  await renderizarTodo();
  actualizarVisibilidadBannerExamenDiagnostico();
});

/* =========================================================
   10. INICIALIZACIÓN
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  aplicarTema(temaActual);

  // Sincroniza los <select> de grupo (barra lateral y modal móvil) con
  // el grupo recuperado de localStorage (por defecto "todos").
  sincronizarSelectoresGrupo(grupoActual);

  actualizarEnlacesTrimestreEnSidebar();
  actualizarEstadoTarjetasTrimestre();

  // Espera la sesión de Supabase antes del primer render: itemEstaCompletado,
  // renderizarProgreso y renderizarProgresoDetallado leen
  // obtenerPerfilActivo()/progresoCache de forma síncrona y necesitan las
  // cachés ya pobladas (ver sección 11).
  await sincronizarPerfilActivo();
  await renderizarTodo();

  document.querySelectorAll(".boton-tema").forEach((boton) => boton.addEventListener("click", alternarTema));
  document.getElementById("boton-colapsar-sidebar").addEventListener("click", alternarSidebarColapsada);
  ["selector-grupo", "selector-grupo-movil"].forEach((id) => {
    const selector = document.getElementById(id);
    if (selector) selector.addEventListener("change", alCambiarGrupo);
  });
  activarModalGrupo();
  activarFormulariosCuenta();
  activarPanelSesionCuenta();
  activarAccionesPerfilProgreso();
  actualizarUISesion();
  activarSubmenusSidebar();
  activarResaltadoDeNavegacion();
  activarBotonVolverArriba();
  activarBannerExamenDiagnostico();

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
  activarCierreModalDetalle();

  // El formulario de contacto solo existe en la portada (index.html).
  const formularioContacto = document.getElementById("formulario-contacto");
  if (formularioContacto) {
    formularioContacto.addEventListener("submit", alEnviarContacto);
  }
});

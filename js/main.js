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

// Calendario oficial del ciclo escolar SEP 2026-2027 (agosto 2026 a julio
// 2027): "tipo de día" del ciclo (vacaciones, CTE, suspensión, etc.), un
// concepto DISTINTO de DATOS_EVENTOS/TAREAS/ACTIVIDADES/PROYECTOS (eso es
// "hay algo entregable ese día"; esto es "qué tipo de día es"). No se
// filtra por grupo: aplica igual a 3°C y 3°E.
//
// Fuente: calendario oficial SEP 2026-2027. Los registros con
// verificado:false son fechas aproximadas tomadas de referencias no
// oficiales (p. ej. ciclos anteriores) y DEBEN confirmarse contra el PDF
// oficial de la SEP antes de publicar. No borrar el campo verificado al
// completar las fechas reales; solo cambiarlo a true.
//
// Tipos válidos: "inicio", "fin", "vacaciones", "cte-intensiva",
// "cte-ordinaria", "suspension", "evaluacion"
//
// Ejemplo de formato — Hiram reemplaza/completa con las fechas reales:
// { fecha: "2026-08-31", tipo: "inicio", etiqueta: "Inicio de clases", verificado: true },
// { fecha: "2026-09-16", tipo: "suspension", etiqueta: "Día festivo", verificado: true },
// { fecha: "2026-10-09", tipo: "cte-ordinaria", etiqueta: "CTE Sesión Ordinaria", verificado: false },
// { fecha: "2026-12-21", tipo: "vacaciones", etiqueta: "Vacaciones de invierno (inicio)", verificado: true },
const CALENDARIO_ESCOLAR_2026_2027 = [];

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
    // ===== PROYECTO INTEGRADOR: MI ESCUELA EN DATOS (Bloque 2) =====
    {
      id: "pi1",
      secuencia: "📊 Proyecto Integrador — Mi Escuela en Datos",
      grupo: "todos",
      titulo: "📊 Análisis de Datos",
      descripcion: "Evalúa la capacidad de analizar datos reales, identificar patrones y proponer conclusiones.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Escuela en Datos",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Analiza 10+ datos reales, identifica patrones y propone conclusiones claras." },
        { nivel: "Bueno", puntos: "3", descripcion: "Analiza 6-9 datos, identifica algunos patrones y conclusiones básicas." },
        { nivel: "Regular", puntos: "2", descripcion: "Analiza 3-5 datos, patrones confusos, conclusiones vagas." },
        { nivel: "Deficiente", puntos: "1", descripcion: "Analiza menos de 3 datos o datos irrelevantes." },
      ],
    },
    {
      id: "pi2",
      secuencia: "📊 Proyecto Integrador — Mi Escuela en Datos",
      grupo: "todos",
      titulo: "🧮 Uso de Excel",
      descripcion: "Evalúa el dominio de funciones, tablas y gráficas de Excel aplicadas al proyecto.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Escuela en Datos",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Usa 8+ funciones de Excel, tablas dinámicas, gráficas avanzadas y formato profesional." },
        { nivel: "Bueno", puntos: "3", descripcion: "Usa 5-7 funciones de Excel, gráficas básicas y formato adecuado." },
        { nivel: "Regular", puntos: "2", descripcion: "Usa 2-4 funciones de Excel con errores, gráficas simples." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No usa funciones de Excel o todas son incorrectas." },
      ],
    },
    {
      id: "pi3",
      secuencia: "📊 Proyecto Integrador — Mi Escuela en Datos",
      grupo: "todos",
      titulo: "🔒 Ciberseguridad Aplicada",
      descripcion: "Evalúa la implementación y justificación de medidas de seguridad digital en el proyecto.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Escuela en Datos",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Implementa 5+ medidas de seguridad digital con justificación técnica." },
        { nivel: "Bueno", puntos: "3", descripcion: "Implementa 3-4 medidas de seguridad digital con justificación básica." },
        { nivel: "Regular", puntos: "2", descripcion: "Implementa 1-2 medidas de seguridad sin justificación clara." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No implementa medidas de seguridad." },
      ],
    },
    {
      id: "pi4",
      secuencia: "📊 Proyecto Integrador — Mi Escuela en Datos",
      grupo: "todos",
      titulo: "🎨 Comunicación Visual",
      descripcion: "Evalúa la calidad y claridad de la infografía o póster con los resultados del proyecto.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Escuela en Datos",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Infografía/póster profesional con jerarquía visual, colores y datos claros." },
        { nivel: "Bueno", puntos: "3", descripcion: "Infografía/póster clara con datos y colores apropiados." },
        { nivel: "Regular", puntos: "2", descripcion: "Infografía/póster básica con pocos elementos visuales." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No presenta infografía/póster." },
      ],
    },
    {
      id: "pi5",
      secuencia: "📊 Proyecto Integrador — Mi Escuela en Datos",
      grupo: "todos",
      titulo: "🤝 Trabajo en Equipo",
      descripcion: "Evalúa la participación equitativa, liderazgo y resolución de conflictos dentro del equipo.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Escuela en Datos",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Todos participan equitativamente, liderazgo compartido, resolución de conflictos." },
        { nivel: "Bueno", puntos: "3", descripcion: "Mayoría participa, algunos lideran más que otros, pocos conflictos." },
        { nivel: "Regular", puntos: "2", descripcion: "Algunos participan poco, desequilibrio en tareas, conflictos no resueltos." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No participan varios miembros o conflictos graves." },
      ],
    },
    {
      id: "pi6",
      secuencia: "📊 Proyecto Integrador — Mi Escuela en Datos",
      grupo: "todos",
      titulo: "🗣️ Presentación Oral",
      descripcion: "Evalúa el dominio del tema y la seguridad al exponer y responder preguntas.",
      ponderacion: "4 de 24 pts — Proyecto: Mi Escuela en Datos",
      niveles: [
        { nivel: "Excelente", puntos: "4", descripcion: "Presentación clara, dominio total, responde preguntas con seguridad, tiempo exacto." },
        { nivel: "Bueno", puntos: "3", descripcion: "Presentación clara, dominio parcial, responde con algunas dudas." },
        { nivel: "Regular", puntos: "2", descripcion: "Presentación con dificultades, lectura excesiva, dudas al responder." },
        { nivel: "Deficiente", puntos: "1", descripcion: "No presenta o no domina el tema." },
      ],
    },
  ],
  3: [
    {
      id: "r1",
      grupo: "todos",
      titulo: "Rúbrica de proyecto tecnológico",
      descripcion: "Criterios de diseño, funcionalidad, trabajo en equipo y presentación final.",
      ponderacion: "40%",
      niveles: [
        { nivel: "Excelente", puntos: "18-20", descripcion: "El prototipo funciona completamente, resuelve el problema planteado, con buen trabajo en equipo y presentación clara." },
        { nivel: "Bueno", puntos: "14-17", descripcion: "El prototipo funciona con fallas menores; presentación adecuada." },
        { nivel: "Regular", puntos: "10-13", descripcion: "El prototipo presenta fallas importantes o el trabajo en equipo es desigual." },
        { nivel: "Deficiente", puntos: "0-9", descripcion: "El prototipo no funciona o no se presenta." },
      ],
    },
    {
      id: "r2",
      grupo: "todos",
      titulo: "Rúbrica de bitácora de taller",
      descripcion: "Evalúa el registro diario de actividades, orden y limpieza en el taller.",
      ponderacion: "15%",
      niveles: [
        { nivel: "Excelente", puntos: "18-20", descripcion: "Registro diario completo del avance del proyecto, con fotos y reflexión." },
        { nivel: "Bueno", puntos: "14-17", descripcion: "Registro constante con detalle suficiente." },
        { nivel: "Regular", puntos: "10-13", descripcion: "Registro incompleto o con poco detalle." },
        { nivel: "Deficiente", puntos: "0-9", descripcion: "Bitácora ausente o sin relación con el proyecto." },
      ],
    },
    {
      id: "r3",
      grupo: "3C",
      titulo: "Rúbrica de exposición: robótica básica",
      descripcion: "Claridad, dominio del tema y uso de apoyos visuales en la exposición.",
      ponderacion: "20%",
      niveles: [
        { nivel: "Excelente", puntos: "18-20", descripcion: "Explica con claridad los principios de movimiento del robot y demuestra su funcionamiento." },
        { nivel: "Bueno", puntos: "14-17", descripcion: "Explica correctamente con una demostración parcial." },
        { nivel: "Regular", puntos: "10-13", descripcion: "Explicación incompleta o sin demostración." },
        { nivel: "Deficiente", puntos: "0-9", descripcion: "No domina los conceptos básicos de robótica." },
      ],
    },
    {
      id: "r4",
      grupo: "3E",
      titulo: "Rúbrica de exposición: impresión 3D",
      descripcion: "Claridad, dominio del tema y uso de apoyos visuales en la exposición.",
      ponderacion: "20%",
      niveles: [
        { nivel: "Excelente", puntos: "18-20", descripcion: "Explica el proceso completo de impresión 3D y muestra una pieza impresa por el propio alumno." },
        { nivel: "Bueno", puntos: "14-17", descripcion: "Explica el proceso correctamente, con una pieza impresa parcialmente terminada." },
        { nivel: "Regular", puntos: "10-13", descripcion: "Explicación superficial o sin pieza impresa." },
        { nivel: "Deficiente", puntos: "0-9", descripcion: "No demuestra comprensión del proceso de impresión 3D." },
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
      grupo: "todos",
      titulo: "Detective de IA en mi casa",
      descripcion: "Identifica 5 ejemplos de Inteligencia Artificial presentes en la vida diaria.",
      fechaEntrega: "2025-09-01",
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
      grupo: "todos",
      titulo: "Mi diálogo con un asistente virtual",
      descripcion: "Escribe un diálogo de al menos 8 líneas con un asistente virtual y reflexiona sobre su \"inteligencia\".",
      fechaEntrega: "2025-09-03",
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
      grupo: "todos",
      titulo: "La IA y mi creatividad",
      descripcion: "Representa con un dibujo o collage cómo la IA podría apoyar a un artista sin reemplazarlo.",
      fechaEntrega: "2025-09-05",
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
      grupo: "todos",
      titulo: "Cazador de AR/VR",
      descripcion: "Clasifica 4 ejemplos cotidianos como Realidad Aumentada, Virtual o Mixta.",
      fechaEntrega: "2025-09-22",
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
      grupo: "todos",
      titulo: "Mi casa en Realidad Aumentada",
      descripcion: "Dibuja una habitación de tu casa con anotaciones tipo Realidad Aumentada.",
      fechaEntrega: "2025-09-24",
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
      grupo: "todos",
      titulo: "Noticia del futuro",
      descripcion: "Redacta una noticia de periódico ambientada en 2035 sobre el metaverso educativo.",
      fechaEntrega: "2025-09-26",
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
      grupo: "todos",
      titulo: "Detective de Robots",
      descripcion: "Investiga 4 robots reales o ficticios y clasifica si usan IA.",
      fechaEntrega: "2025-10-13",
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
      grupo: "todos",
      titulo: "Mi rutina como algoritmo",
      descripcion: "Describe tu rutina matutina como un algoritmo con condicionales SI/ENTONCES/SINO.",
      fechaEntrega: "2025-10-15",
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
      grupo: "todos",
      titulo: "Mi robot ideal — Boceto inicial",
      descripcion: "Diseña el boceto de un robot que resuelva un problema de tu familia o comunidad.",
      fechaEntrega: "2025-10-17",
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
  2: [
    // Fechas TENTATIVAS/PLACEHOLDER: aún no existe calendario escolar
    // oficial para este periodo; ajustar cuando el docente lo confirme.
    {
      id: "t1",
      grupo: "todos",
      titulo: "Detective de Algoritmos",
      descripcion: "Durante 2 días, registra en una tabla cada vez que una app (YouTube, TikTok, Spotify, etc.) te recomiende algo: qué te recomendó, si te gustó y por qué crees que te lo recomendó. Cierra con una reflexión de 3 renglones sobre si el algoritmo te conoce bien.",
      fechaEntrega: "2025-11-07",
      estado: "entregada",
    },
    {
      id: "t2",
      grupo: "todos",
      titulo: "Mi presupuesto semanal",
      descripcion: "Registra tus gastos de una semana (o inventa datos realistas) en una tabla con día, concepto, categoría y monto (mínimo 10 registros). Si tienes Excel, usa fórmulas SUMA/PROMEDIO/MAX/MIN y una gráfica de barras; si no, hazlo a mano en tu cuaderno.",
      fechaEntrega: "2025-11-14",
      estado: "entregada",
    },
    {
      id: "t3",
      grupo: "todos",
      titulo: "Auditoría de Seguridad Personal",
      descripcion: "Responde de forma confidencial (no se comparte en clase) un cuestionario sobre tus hábitos digitales y contraseñas. Después, crea 3 contraseñas nuevas y fuertes, y escribe las reglas que usaste para crearlas.",
      fechaEntrega: "2025-11-21",
      estado: "entregada",
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
      instruccionesUrl: "https://drive.google.com/REEMPLAZAR-CON-LINK-REAL",
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
    {
      id: "t5",
      grupo: "3C",
      titulo: "Reporte de avance: brazo robótico",
      descripcion: "Entrega parcial con diagrama y lista de materiales del prototipo.",
      fechaEntrega: "2026-07-20",
      estado: "pendiente",
      // Ejemplo con AMBOS campos: instrucciones formales + material de
      // apoyo (en este caso, una plantilla de diagrama).
      instruccionesUrl: "https://drive.google.com/REEMPLAZAR-CON-LINK-REAL",
      materialApoyoUrl: "https://drive.google.com/REEMPLAZAR-CON-LINK-REAL",
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
      grupo: "todos",
      titulo: "Rompecabezas de Conceptos",
      descripcion: "Dinámica grupal de emparejar términos de IA con sus definiciones.",
      fecha: "2025-09-02",
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
      grupo: "todos",
      titulo: "Teatro de Chatbots",
      descripcion: "En equipos, diseñan el árbol de decisión de un chatbot y lo representan en una obra corta.",
      fecha: "2025-09-04",
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
      grupo: "todos",
      titulo: "Círculo de Debate: ¿La IA nos quitará el trabajo?",
      descripcion: "Debate grupal sobre si la IA reemplazará los trabajos humanos.",
      fecha: "2025-09-08",
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
      grupo: "todos",
      titulo: "Juego de Cartas AR/VR/MR",
      descripcion: "Juego de cartas para clasificar escenarios de AR, VR y MR en equipo.",
      fecha: "2025-09-23",
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
      grupo: "todos",
      titulo: "Construcción de Mundos Virtuales",
      descripcion: "Equipos diseñan un mundo virtual educativo sobre un tema escolar.",
      fecha: "2025-09-29",
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
      grupo: "todos",
      titulo: "Tribunal del Metaverso",
      descripcion: "Juicio simulado sobre dilemas éticos del metaverso.",
      fecha: "2025-10-02",
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
      grupo: "todos",
      titulo: "Simulación de Fábrica Robotizada",
      descripcion: "Simulación de una línea de producción, comparando trabajo manual vs. instrucciones tipo robot.",
      fecha: "2025-10-14",
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
      grupo: "todos",
      titulo: "Programación en Papel: El Laberinto",
      descripcion: "En parejas, un alumno programa con instrucciones exactas para resolver un laberinto.",
      fecha: "2025-10-21",
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
      grupo: "todos",
      titulo: "Estación de Sensores",
      descripcion: "Equipos identifican qué sensores necesitaría un robot para interactuar con objetos cotidianos.",
      fecha: "2025-10-24",
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
    // Fechas TENTATIVAS/PLACEHOLDER: aún no existe calendario escolar
    // oficial para este periodo; ajustar cuando el docente lo confirme.
    {
      id: "a1",
      grupo: "todos",
      titulo: "Juego de Roles: El Algoritmo en Acción",
      descripcion: "En equipos, cada uno recibe el perfil de un 'usuario' ficticio y debe crear una lista de 10 recomendaciones que un algoritmo le haría. Otro equipo juega a ser ese usuario y califica qué tan acertadas fueron. Cierra con debate sobre filtros burbuja.",
      fecha: "2025-11-05",
    },
    {
      id: "a2",
      grupo: "todos",
      titulo: "Hackatón de Excel: La Cafetería Escolar",
      descripcion: "En equipos de 4, organizan datos reales de ventas de la cafetería en Excel (o papel), calculan totales con fórmulas, identifican el producto más y menos vendido, crean una gráfica de barras y proponen 2 mejoras basadas en los datos.",
      fecha: "2025-11-12",
    },
    {
      id: "a3",
      grupo: "todos",
      titulo: "Simulación de Ataque Cibernético",
      descripcion: "La escuela sufre un ataque de ransomware ficticio. En equipos de 6, cada integrante toma un rol (director, técnico, policía cibernética, comunicación, abogado, experto en prevención) y presenta su plan de acción ante la clase, que vota cuál manejó mejor la crisis.",
      fecha: "2025-11-19",
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

// "detalleCompleto": mismo campo OPCIONAL que en DATOS_TAREAS (ver
// comentario ahí); abre el modal "📖 Ver detalles" con HTML de confianza.
const DATOS_PROYECTOS = {
  // FECHAS TENTATIVAS/PLACEHOLDER (p3-p5): aún no existe calendario
  // escolar oficial para el Bloque 1; ajustar cuando se confirme.
  1: [
    {
      id: "p3",
      grupo: "todos",
      titulo: "Mi Chatbot en Papel",
      descripcion: "Diseño individual de un chatbot en papel que resuelve un problema real de la escuela.",
      avance: 0,
      fechaEntrega: "2025-09-19",
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
      grupo: "todos",
      titulo: "Mi Metaverso Educativo",
      descripcion: "Equipos diseñan un prototipo de espacio educativo en el metaverso.",
      avance: 0,
      fechaEntrega: "2025-10-10",
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
      grupo: "todos",
      titulo: "Diseña tu Robot Ideal",
      descripcion: "Diseño individual de un robot que resuelve un problema social de la comunidad.",
      avance: 0,
      fechaEntrega: "2025-11-07",
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
    // Fecha TENTATIVA/PLACEHOLDER: aún no existe calendario escolar
    // oficial para este periodo; ajustar cuando el docente lo confirme.
    {
      id: "p1",
      grupo: "todos",
      titulo: "Mi Escuela en Datos: Análisis, Visualización y Protección",
      descripcion: "Proyecto integrador en equipos de 5 que une las 3 secuencias del bloque: recolectan datos reales de la escuela (biblioteca, cafetería, deportes, eventos o infraestructura), los analizan y grafican en Excel, comunican los hallazgos en una infografía, y diseñan un plan de ciberseguridad para proteger esa información. Cierra con una presentación oral de 5 minutos ante el grupo.",
      avance: 0,
      fechaEntrega: "2025-12-05",
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
      imagen: "assets/temario/t1-seq1-tema1.jpg",
    },
    {
      id: "tm1-2",
      unidad: "🧠 Secuencia 1 — Inteligencia Artificial",
      titulo: "¿Qué tan inteligente es tu asistente virtual?",
      descripcion: "Uso cotidiano de asistentes virtuales como Siri, Alexa y Google Assistant.",
      imagen: "assets/temario/t1-seq1-tema2.jpg",
    },
    {
      id: "tm1-3",
      unidad: "🧠 Secuencia 1 — Inteligencia Artificial",
      titulo: "Explorando la IA conversacional",
      descripcion: "Chatbots y procesamiento de lenguaje natural (NLP).",
      imagen: "assets/temario/t1-seq1-tema3.jpg",
    },
    {
      id: "tm1-4",
      unidad: "🧠 Secuencia 1 — Inteligencia Artificial",
      titulo: "Creando tu propio chatbot",
      descripcion: "Diseño de chatbots simples y el papel de la IA en la creatividad y el diseño.",
      imagen: "assets/temario/t1-seq1-tema4.jpg",
    },

    // ===== SECUENCIA 2 — REALIDAD VIRTUAL (p. 31) =====
    {
      id: "tm1-5",
      unidad: "🥽 Secuencia 2 — Realidad Virtual",
      titulo: "Del papel a la inmersión: cómo se crean los mundos virtuales",
      descripcion: "Diseño de entornos 3D y motores de renderizado.",
      imagen: "assets/temario/t1-seq2-tema1.jpg",
    },
    {
      id: "tm1-6",
      unidad: "🥽 Secuencia 2 — Realidad Virtual",
      titulo: "Realidad aumentada vs. realidad virtual",
      descripcion: "Diferencias entre AR y VR, con aplicaciones educativas y lúdicas.",
      imagen: "assets/temario/t1-seq2-tema2.jpg",
    },
    {
      id: "tm1-7",
      unidad: "🥽 Secuencia 2 — Realidad Virtual",
      titulo: "Explorando el metaverso",
      descripcion: "Construcción de experiencias interactivas en mundos virtuales colaborativos.",
      imagen: "assets/temario/t1-seq2-tema3.jpg",
    },

    // ===== SECUENCIA 3 — ROBÓTICA (p. 51) =====
    {
      id: "tm1-8",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "Evaluación de sistemas tecnológicos a través de la robótica",
      descripcion: "Análisis crítico de sistemas robóticos.",
      imagen: "assets/temario/t1-seq3-tema1.jpg",
    },
    {
      id: "tm1-9",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "¿Qué relación existe entre robótica, IA y automatización?",
      descripcion: "Relación entre robótica, inteligencia artificial y automatización.",
      imagen: "assets/temario/t1-seq3-tema2.jpg",
    },
    {
      id: "tm1-10",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "De la idea al movimiento: programando un robot desde cero",
      descripcion: "Programación básica de robots con bloques o código.",
      imagen: "assets/temario/t1-seq3-tema3.jpg",
    },
    {
      id: "tm1-11",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "Robots en acción: automatización y toma de decisiones",
      descripcion: "Sensores, actuadores y lógica de decisiones.",
      imagen: "assets/temario/t1-seq3-tema4.jpg",
    },
    {
      id: "tm1-12",
      unidad: "🤖 Secuencia 3 — Robótica",
      titulo: "Diseña tu robot ideal",
      descripcion: "Desafíos de creatividad y tecnología en el diseño de un robot.",
      imagen: "assets/temario/t1-seq3-tema5.jpg",
    },
  ],
  2: [
    // ===== SECUENCIA 4 — CIENCIA DE DATOS =====
    {
      id: "tm2-1",
      unidad: "📊 Secuencia 4 — Ciencia de Datos",
      titulo: "¿Qué es la ciencia de datos?",
      descripcion: "Qué son los datos, tipos de datos (numéricos, categóricos, temporales, geoespaciales) y cómo se convierten en información útil.",
      imagen: "assets/temario/trimestre2-tema1.jpg",
    },
    {
      id: "tm2-2",
      unidad: "📊 Secuencia 4 — Ciencia de Datos",
      titulo: "Algoritmos y decisiones",
      descripcion: "Cómo los algoritmos de recomendación (redes sociales, streaming) influyen en lo que vemos y compramos, y qué son los sesgos algorítmicos.",
      imagen: "assets/temario/trimestre2-tema2.jpg",
    },
    {
      id: "tm2-3",
      unidad: "📊 Secuencia 4 — Ciencia de Datos",
      titulo: "Visualizando datos",
      descripcion: "Cómo convertir datos en gráficas e infografías que cuenten una historia clara.",
      imagen: "assets/temario/trimestre2-tema3.jpg",
    },

    // ===== SECUENCIA 5 — HOJAS DE CÁLCULO =====
    {
      id: "tm2-4",
      unidad: "🧮 Secuencia 5 — Hojas de Cálculo",
      titulo: "Primeros pasos en Excel",
      descripcion: "Celdas, filas, columnas, tipos de datos y formato básico.",
      imagen: "assets/temario/trimestre2-tema4.jpg",
    },
    {
      id: "tm2-5",
      unidad: "🧮 Secuencia 5 — Hojas de Cálculo",
      titulo: "Fórmulas y funciones",
      descripcion: "SUMA, PROMEDIO, CONTAR y otras funciones para analizar datos.",
      imagen: "assets/temario/trimestre2-tema5.jpg",
    },
    {
      id: "tm2-6",
      unidad: "🧮 Secuencia 5 — Hojas de Cálculo",
      titulo: "Gráficos e infografías",
      descripcion: "Cómo representar datos visualmente para tomar mejores decisiones.",
      imagen: "assets/temario/trimestre2-tema6.jpg",
    },

    // ===== SECUENCIA 6 — SEGURIDAD DIGITAL =====
    {
      id: "tm2-7",
      unidad: "🔒 Secuencia 6 — Seguridad Digital",
      titulo: "Identidad digital y ciberataques",
      descripcion: "Phishing, robo de identidad y huella digital.",
      imagen: "assets/temario/trimestre2-tema7.jpg",
    },
    {
      id: "tm2-8",
      unidad: "🔒 Secuencia 6 — Seguridad Digital",
      titulo: "Contraseñas y cifrado",
      descripcion: "Cómo crear contraseñas seguras y proteger información personal.",
      imagen: "assets/temario/trimestre2-tema8.jpg",
    },
    {
      id: "tm2-9",
      unidad: "🔒 Secuencia 6 — Seguridad Digital",
      titulo: "Casos históricos de ciberataques",
      descripcion: "Ejemplos reales (como WannaCry) para aprender a prevenir ataques.",
      imagen: "assets/temario/trimestre2-tema9.jpg",
    },
  ],
  3: [
    {
      id: "tm3-1",
      unidad: "Unidad 1",
      titulo: "Soluciones Digitales",
      descripcion: "Pensamiento computacional y descomposición de problemas cotidianos en algoritmos.",
      imagen: "assets/temario/trimestre3-tema1.jpg",
    },
    {
      id: "tm3-2",
      unidad: "Unidad 2",
      titulo: "Diseño Web",
      descripcion: "Lógica de las páginas web con HTML y CSS básico para un portafolio digital propio.",
      imagen: "assets/temario/trimestre3-tema2.jpg",
    },
    {
      id: "tm3-3",
      unidad: "Unidad 3",
      titulo: "Prototipos Tecnológicos e IoT",
      descripcion: "Design thinking, MVP e Internet de las Cosas para presentar un prototipo.",
      imagen: "assets/temario/trimestre3-tema3.jpg",
    },
  ],
};

// Nombres de alumnos por grupo, usados para llenar el selector de nombre
// del modal de identificación (ver sección 11 más abajo). TODO(Hiram):
// reemplazar estos arreglos con la lista real de cada grupo; mientras
// estén vacíos, el modal avisa que aún no hay nombres cargados para ese
// grupo. Los 2 nombres de ejemplo comentados sirven para probar el flujo
// de identificación sin tener la lista final todavía.
const ALUMNOS_3C = [
  // "Nombre Apellido",
  // "Otro Alumno",
];

const ALUMNOS_3E = [
  // "Nombre Apellido",
  // "Otro Alumno",
];

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

// Identificación ligera de alumno (ver sección 11 para el resto de la
// lógica). CLAVE_PERFIL guarda quién está "identificado" ahora mismo;
// CLAVE_PINES guarda, por separado, el PIN que cada alumno registró la
// primera vez que se identificó (para poder "confirmar que es él" luego).
const CLAVE_PERFIL = "perfilActivo";
const CLAVE_PINES = "pinesAlumnos";

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

// Clave de localStorage para el progreso personal de un ítem (tarea o
// actividad, según "tipo"): incluye trimestre, tipo e id para que no se
// mezcle "tarea t1 del Trimestre 1" con "actividad t1" ni con el mismo id
// en otro trimestre. Si hay un alumno identificado (ver sección 11 y
// CLAVE_PERFIL), la clave también incluye su grupo y nombre para que cada
// quien vea su propio checklist aunque compartan equipo; si nadie se ha
// identificado, cae a una clave "invitado" compartida por el dispositivo
// (el comportamiento de antes de agregar identificación de alumno).
// "trimestre" por defecto es el de la página actual; el panel de Progreso
// de la portada (que no tiene TRIMESTRE_ACTUAL) lo pasa explícito para
// poder leer el checklist de los 3 trimestres desde ahí.
function claveProgreso(tipo, id, trimestre) {
  trimestre = trimestre || TRIMESTRE_ACTUAL;
  const perfil = obtenerPerfilActivo();
  const base = "progreso_" + (perfil ? perfil.grupo + "_" + slugAlumno(perfil.nombre) : "invitado");
  return base + "_trimestre" + trimestre + "_" + tipo + "_" + id;
}

function itemEstaCompletado(tipo, id, trimestre) {
  return localStorage.getItem(claveProgreso(tipo, id, trimestre)) === "true";
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
  contenido.innerHTML = item.detalleCompleto || "";

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

  grupos.forEach((itemsDelGrupo, nombreGrupo) => {
    const bloqueGrupo = document.createElement("div");
    bloqueGrupo.className = "temario-grupo";

    const tituloGrupo = document.createElement("h3");
    tituloGrupo.className = "temario-grupo__titulo";
    tituloGrupo.textContent = nombreGrupo;
    bloqueGrupo.appendChild(tituloGrupo);

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
      imagen.appendChild(textoImagen);

      const info = document.createElement("div");
      info.className = "tarjeta-temario__info";
      const titulo = document.createElement("h4");
      titulo.textContent = item.titulo;
      const descripcion = document.createElement("p");
      descripcion.textContent = item.descripcion;
      info.append(titulo, descripcion);

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

  grupos.forEach((itemsDelGrupo, nombreGrupo) => {
    const bloqueGrupo = document.createElement("div");
    bloqueGrupo.className = "rubricas-grupo";

    const tituloGrupo = document.createElement("h3");
    tituloGrupo.className = "rubricas-grupo__titulo";
    tituloGrupo.textContent = nombreGrupo;
    bloqueGrupo.appendChild(tituloGrupo);

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

// Construye el <label> con checkbox de "Marcar como completada" para una
// tarjeta de tarea o actividad, y engancha su guardado en localStorage
// (ver claveProgreso). Común a renderizarTareas y renderizarActividades.
function crearChecklistProgreso(tipo, item, tarjeta, datos, idResumen, etiqueta) {
  const completada = itemEstaCompletado(tipo, item.id);
  tarjeta.classList.toggle("tarjeta--completada", completada);

  const checklist = document.createElement("label");
  checklist.className = "checklist-tarea";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "checklist-tarea__input";
  checkbox.checked = completada;
  const textoChecklist = document.createElement("span");
  textoChecklist.className = "checklist-tarea__texto";
  textoChecklist.textContent = completada ? "Completada" : "Marcar como completada";

  checkbox.addEventListener("change", () => {
    localStorage.setItem(claveProgreso(tipo, item.id), String(checkbox.checked));
    tarjeta.classList.toggle("tarjeta--completada", checkbox.checked);
    textoChecklist.textContent = checkbox.checked ? "Completada" : "Marcar como completada";
    actualizarResumenProgreso(idResumen, datos, tipo, etiqueta);
    renderizarProgreso();
  });

  checklist.append(checkbox, textoChecklist);
  return checklist;
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

    // Checklist de progreso personal: guardado en localStorage, aparte
    // por completo del filtro de grupo (ver claveProgreso).
    tarjeta.appendChild(
      crearChecklistProgreso("tarea", item, tarjeta, datos, "resumen-progreso-tareas", "tareas")
    );

    contenedor.appendChild(tarjeta);
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
    if (item.archivoUrl) {
      tarjeta.appendChild(crearEnlaceDescarga(item.archivoUrl));
    }
    if (item.detalleCompleto) {
      tarjeta.appendChild(crearBotonVerDetalle(item));
    }

    // Checklist de progreso personal, mismo patrón que en Tareas (ver
    // claveProgreso). Antes de este rediseño Actividades no tenía
    // seguimiento de progreso.
    tarjeta.appendChild(
      crearChecklistProgreso(
        "actividad",
        item,
        tarjeta,
        datos,
        "resumen-progreso-actividades",
        "actividades"
      )
    );

    contenedor.appendChild(tarjeta);
  });

  actualizarResumenProgreso("resumen-progreso-actividades", datos, "actividad", "actividades");
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
    // Insignia de proyecto completado: solo decorativa, no cambia cómo se
    // calcula ni se guarda "avance" (sigue siendo el campo estático de
    // DATOS_PROYECTOS).
    if (item.avance >= 100) {
      const insignia = document.createElement("span");
      insignia.className = "insignia-proyecto";
      insignia.title = "Proyecto completado";
      insignia.setAttribute("aria-label", "Proyecto completado");
      insignia.textContent = "🏆";
      cabecera.appendChild(insignia);
    }
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
    if (item.detalleCompleto) {
      tarjeta.appendChild(crearBotonVerDetalle(item));
    }
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
// 11). Suma tareas + actividades completadas de los 3 trimestres,
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

    const completadasTareas = tareas.filter((item) =>
      itemEstaCompletado("tarea", item.id, trimestre)
    ).length;
    const completadasActividades = actividades.filter((item) =>
      itemEstaCompletado("actividad", item.id, trimestre)
    ).length;

    const total = tareas.length + actividades.length;
    const completadas = completadasTareas + completadasActividades;

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
      completadasGeneral + " de " + totalGeneral + " tareas y actividades completadas";

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

    resumen.append(texto, barra);
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
          ? "Sin tareas ni actividades registradas todavía."
          : completadas + " de " + total + " completadas";

      bloque.append(titulo, texto);
      bloques.appendChild(bloque);
    });
  }
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
   8. BARRA LATERAL / BARRA INFERIOR Y FILTRO DE GRUPO
   ========================================================= */

// Los 7 enlaces de la barra lateral que apuntan a secciones dentro de una
// página de trimestre (identificados por data-enlace en el HTML). En una
// página de trimestre ya son anclas locales ("#temario") y no se tocan;
// en la portada y en FAQ se reescriben para apuntar a
// "trimestre-N.html#ancla" usando ultimoTrimestreVisto.
const ANCLAS_DE_TRIMESTRE = [
  "temario",
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

  const enlaceProgreso = document.querySelector('[data-enlace-movil="progreso"]');
  if (enlaceProgreso && !document.getElementById("progreso")) {
    enlaceProgreso.href = "index.html#progreso";
  }
}

// Marca cada .tarjeta-trimestre de la portada como "finalizado", "actual"
// o "proximamente" comparando su número contra ultimoTrimestreVisto (la
// mejor aproximación disponible a "en qué trimestre estamos", ya que los
// datos de ejemplo no incluyen fechas de inicio/fin de cada trimestre).
function actualizarEstadoTarjetasTrimestre() {
  const tarjetas = document.querySelectorAll(".tarjeta-trimestre[data-trimestre]");
  if (tarjetas.length === 0) return;

  const actual = Number(ultimoTrimestreVisto);

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
  });
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
    renderizarCalendario(),
    renderizarTemario(),
    renderizarRubricas(),
    renderizarTareas(),
    renderizarActividades(),
    renderizarProyectos(),
    renderizarVideos(),
    renderizarProgreso(),
  ]);
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
   11. IDENTIFICACIÓN DE ALUMNO (PERFIL)

   IMPORTANTE: esto NO es un sistema de autenticación real. No hay
   backend ni contraseñas con hash: todo vive en localStorage del
   navegador, legible y modificable por cualquiera con las herramientas
   de desarrollador. Su único propósito es evitar que compañeros que
   comparten equipo mezclen su checklist de progreso sin querer. No debe
   usarse para nada sensible ni tratarse como una cuenta protegida.
   ========================================================= */

function obtenerPerfilActivo() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PERFIL));
  } catch (error) {
    return null;
  }
}

function guardarPerfilActivo(perfil) {
  localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil));
}

function limpiarPerfilActivo() {
  localStorage.removeItem(CLAVE_PERFIL);
}

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

function obtenerPines() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PINES)) || {};
  } catch (error) {
    return {};
  }
}

// La primera vez que alguien elige un nombre, el PIN que escribe queda
// registrado como suyo. Las veces siguientes tiene que volver a
// escribirlo para "confirmar que es él". No hay hash: se guarda tal cual,
// así que esto no protege nada — solo evita que dos compañeros que
// comparten equipo se confundan de perfil por accidente.
function verificarOCrearPin(grupo, nombre, pin) {
  const pines = obtenerPines();
  const clave = grupo + "_" + nombre;
  if (pines[clave]) return pines[clave] === pin;
  pines[clave] = pin;
  localStorage.setItem(CLAVE_PINES, JSON.stringify(pines));
  return true;
}

function poblarSelectorNombreAlumno(grupo) {
  const select = document.getElementById("perfil-nombre");
  if (!select) return;

  const nombres = grupo === "3C" ? ALUMNOS_3C : grupo === "3E" ? ALUMNOS_3E : [];
  select.innerHTML = "";

  if (nombres.length === 0) {
    const opcion = document.createElement("option");
    opcion.value = "";
    opcion.textContent = grupo
      ? "Aún no hay nombres cargados para este grupo"
      : "Primero elige tu grupo";
    opcion.disabled = true;
    opcion.selected = true;
    select.appendChild(opcion);
    select.disabled = true;
    return;
  }

  const marcador = document.createElement("option");
  marcador.value = "";
  marcador.textContent = "Elige tu nombre";
  marcador.disabled = true;
  marcador.selected = true;
  select.appendChild(marcador);

  nombres.forEach((nombre) => {
    const opcion = document.createElement("option");
    opcion.value = nombre;
    opcion.textContent = nombre;
    select.appendChild(opcion);
  });

  select.disabled = false;
}

function mostrarErrorPerfil(mensaje) {
  const error = document.getElementById("perfil-error");
  if (!error) return;
  error.textContent = mensaje;
  error.hidden = false;
}

function ocultarErrorPerfil() {
  const error = document.getElementById("perfil-error");
  if (error) error.hidden = true;
}

// Alterna entre el formulario de identificación (sin perfil activo) y el
// resumen con botón "Cambiar de alumno" (con perfil activo).
function actualizarVistaModalPerfil() {
  const perfil = obtenerPerfilActivo();
  const formulario = document.getElementById("formulario-perfil");
  const resumen = document.getElementById("perfil-resumen");
  if (!formulario || !resumen) return;

  formulario.hidden = Boolean(perfil);
  resumen.hidden = !perfil;

  if (perfil) {
    const nombreEl = document.getElementById("perfil-resumen-nombre");
    const grupoEl = document.getElementById("perfil-resumen-grupo");
    if (nombreEl) nombreEl.textContent = perfil.nombre;
    if (grupoEl) grupoEl.textContent = textoGrupo(perfil.grupo);
  }
}

// Refleja si hay perfil activo en los botones "Perfil" de la barra
// lateral (desktop) y de la barra inferior (móvil).
function actualizarIndicadorPerfil() {
  const perfil = obtenerPerfilActivo();
  const etiquetaCorta = perfil ? perfil.nombre.split(" ")[0] : "Perfil";

  const textoMovil = document.querySelector("#boton-perfil-movil .barra-inferior__texto");
  if (textoMovil) textoMovil.textContent = etiquetaCorta;

  const textoSidebar = document.getElementById("texto-perfil-sidebar");
  if (textoSidebar) textoSidebar.textContent = perfil ? perfil.nombre : "Identificarme";
}

function abrirModalPerfil() {
  const modal = document.getElementById("modal-perfil");
  if (!modal) return;
  ocultarErrorPerfil();
  actualizarVistaModalPerfil();
  modal.showModal();
}

function alEnviarFormularioPerfil(evento) {
  evento.preventDefault();
  ocultarErrorPerfil();

  const grupo = document.getElementById("perfil-grupo").value;
  const nombre = document.getElementById("perfil-nombre").value;
  const pin = document.getElementById("perfil-pin").value;

  if (!grupo || !nombre || !/^[0-9]{4}$/.test(pin)) {
    mostrarErrorPerfil("Elige tu grupo, tu nombre y escribe un PIN de 4 dígitos.");
    return;
  }

  if (!verificarOCrearPin(grupo, nombre, pin)) {
    mostrarErrorPerfil("Ese PIN no coincide con el que registraste antes para este nombre.");
    return;
  }

  guardarPerfilActivo({ grupo, nombre, pin });

  // Identificarse también fija el grupo del sitio: no tendría sentido ver
  // el contenido de otro grupo mientras se navega con este perfil activo.
  grupoActual = grupo;
  localStorage.setItem(CLAVE_GRUPO, grupo);
  sincronizarSelectoresGrupo(grupo);
  renderizarTodo();

  document.getElementById("formulario-perfil").reset();
  actualizarVistaModalPerfil();
  actualizarIndicadorPerfil();
  renderizarProgreso();

  const modal = document.getElementById("modal-perfil");
  if (modal) modal.close();
}

function alCambiarAlumno() {
  limpiarPerfilActivo();
  actualizarVistaModalPerfil();
  actualizarIndicadorPerfil();
  renderizarTodo();
  renderizarProgreso();
}

// Mismo patrón que activarCierreModalDetalle: showModal()/close(), cierre
// por botón "✕" o click en el ::backdrop, ESC vía el <dialog> nativo.
// Tiene dos disparadores: el botón de la barra lateral (desktop) y el de
// la barra inferior (móvil).
function activarModalPerfil() {
  const modal = document.getElementById("modal-perfil");
  if (!modal) return;

  ["boton-perfil-movil", "boton-perfil-sidebar", "boton-identificarme-progreso"].forEach((id) => {
    const boton = document.getElementById(id);
    if (boton) boton.addEventListener("click", abrirModalPerfil);
  });

  const botonCerrar = modal.querySelector(".modal-perfil__cerrar");
  if (botonCerrar) botonCerrar.addEventListener("click", () => modal.close());

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) modal.close();
  });

  const selectorGrupoPerfil = document.getElementById("perfil-grupo");
  if (selectorGrupoPerfil) {
    selectorGrupoPerfil.addEventListener("change", () => {
      poblarSelectorNombreAlumno(selectorGrupoPerfil.value);
    });
  }

  const formulario = document.getElementById("formulario-perfil");
  if (formulario) formulario.addEventListener("submit", alEnviarFormularioPerfil);

  const botonCambiar = document.getElementById("boton-cambiar-alumno");
  if (botonCambiar) botonCambiar.addEventListener("click", alCambiarAlumno);

  actualizarIndicadorPerfil();
}

/* =========================================================
   10. INICIALIZACIÓN
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  aplicarTema(temaActual);

  // Sincroniza los <select> de grupo (barra lateral y modal móvil) con
  // el grupo recuperado de localStorage (por defecto "todos").
  sincronizarSelectoresGrupo(grupoActual);

  actualizarEnlacesTrimestreEnSidebar();
  actualizarEstadoTarjetasTrimestre();

  renderizarTodo();

  document.getElementById("boton-tema").addEventListener("click", alternarTema);
  ["selector-grupo", "selector-grupo-movil"].forEach((id) => {
    const selector = document.getElementById(id);
    if (selector) selector.addEventListener("change", alCambiarGrupo);
  });
  activarModalGrupo();
  activarModalPerfil();
  activarResaltadoDeNavegacion();
  activarBotonVolverArriba();

  const botonMesAnterior = document.getElementById("calendario-mes-anterior");
  if (botonMesAnterior) botonMesAnterior.addEventListener("click", () => avanzarMesCalendario(-1));
  const botonMesSiguiente = document.getElementById("calendario-mes-siguiente");
  if (botonMesSiguiente) botonMesSiguiente.addEventListener("click", () => avanzarMesCalendario(1));

  // Modal de detalle: un listener delegado por sección más el cierre
  // (botón "✕" y click en el ::backdrop) del <dialog> compartido.
  activarDelegacionVerDetalle("contenedor-tareas");
  activarDelegacionVerDetalle("contenedor-actividades");
  activarDelegacionVerDetalle("contenedor-proyectos");
  activarCierreModalDetalle();

  // El formulario de contacto solo existe en la portada (index.html).
  const formularioContacto = document.getElementById("formulario-contacto");
  if (formularioContacto) {
    formularioContacto.addEventListener("submit", alEnviarContacto);
  }
});

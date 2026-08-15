/* =========================================================
   datos-demo.js — Dataset ficticio para "Modo Demo" (Fase 1)

   Fase 1 de "Modo Demo": esta estructura existe y está lista, pero
   TODAVÍA NO se carga desde ninguna página ni se conecta a ningún
   módulo (eso es Fase 2, que sustituirá las llamadas reales a
   Supabase por estos datos cuando demoModeActivo() === true, ver
   js/main.js sección 2). Por eso este archivo es 100% autocontenido:
   no depende de que js/main.js se haya cargado antes, y no lo
   modifica ni le agrega variables.

   Las 3 formas reales que replica son las de Supabase:
     - alumnos_registro: id, nombre, grupo, numero_lista,
       codigo_invitacion, activo, usado, auth_user_id
     - perfiles: id (= auth_user_id), nombre, grupo, tema_preferido, rol
     - progreso: id, alumno_id, tipo, item_id, trimestre, completado,
       calificacion, a_tiempo, origen, fecha_entrega_manual, nota,
       actualizado_en
     - avisos: id, titulo, descripcion, fecha, grupo, prioridad,
       fecha_expiracion
   (columnas confirmadas leyendo los .from(...)/.insert(...)/.update(...)
   reales en js/main.js — no son un esquema inventado).

   Todos los IDs de alumno/registro/progreso/aviso empiezan con "demo-"
   a propósito: nunca deben poder confundirse con un id real de
   Supabase (que son UUID/serial), y Fase 2 puede filtrar por ese
   prefijo si necesita distinguir origen en algún punto de depuración.
   ========================================================= */

/* ---------------------------------------------------------
   alumnos_registro / perfiles — 9 alumnos ficticios, mezcla 3C/3E
   --------------------------------------------------------- */

const DEMO_ALUMNOS = [
  { id: "demo-reg-01", auth_user_id: "demo-uid-01", nombre: "Valeria Reyes Cortés", grupo: "3C", numero_lista: 1, codigo_invitacion: "DEMO-A001-VRC1", activo: true, usado: true },
  { id: "demo-reg-02", auth_user_id: "demo-uid-02", nombre: "Emiliano Duarte Salas", grupo: "3C", numero_lista: 2, codigo_invitacion: "DEMO-A002-EDS2", activo: true, usado: true },
  { id: "demo-reg-03", auth_user_id: "demo-uid-03", nombre: "Ximena Rosales Peña", grupo: "3C", numero_lista: 3, codigo_invitacion: "DEMO-A003-XRP3", activo: true, usado: true },
  { id: "demo-reg-04", auth_user_id: "demo-uid-04", nombre: "Bruno Aguilar Nieto", grupo: "3C", numero_lista: 4, codigo_invitacion: "DEMO-A004-BAN4", activo: true, usado: true },
  { id: "demo-reg-05", auth_user_id: "demo-uid-05", nombre: "Camila Torres Villagómez", grupo: "3C", numero_lista: 5, codigo_invitacion: "DEMO-A005-CTV5", activo: true, usado: true },
  { id: "demo-reg-06", auth_user_id: "demo-uid-06", nombre: "Santiago Ibarra Montes", grupo: "3E", numero_lista: 1, codigo_invitacion: "DEMO-A006-SIM6", activo: true, usado: true },
  { id: "demo-reg-07", auth_user_id: "demo-uid-07", nombre: "Renata Cabrera Solís", grupo: "3E", numero_lista: 2, codigo_invitacion: "DEMO-A007-RCS7", activo: true, usado: true },
  { id: "demo-reg-08", auth_user_id: "demo-uid-08", nombre: "Diego Farías Quintero", grupo: "3E", numero_lista: 3, codigo_invitacion: "DEMO-A008-DFQ8", activo: true, usado: true },
  { id: "demo-reg-09", auth_user_id: "demo-uid-09", nombre: "Paulina Escamilla Rúa", grupo: "3E", numero_lista: 4, codigo_invitacion: "DEMO-A009-PER9", activo: true, usado: true },
];

// perfiles es una tabla real aparte (poblada por trigger al crear
// cuenta, no por el docente) — se deriva de DEMO_ALUMNOS solo para no
// duplicar nombre/grupo a mano en dos arreglos; la forma resultante
// sigue siendo la de "perfiles", no la de "alumnos_registro".
const DEMO_PERFILES = DEMO_ALUMNOS.map((alumno) => ({
  id: alumno.auth_user_id,
  nombre: alumno.nombre,
  grupo: alumno.grupo,
  tema_preferido: "claro",
  rol: "alumno",
}));

/* ---------------------------------------------------------
   progreso — generado a partir de los 21 items REALES de trimestre 1
   (9 tareas + 9 actividades + 3 proyectos, ver DATOS_TAREAS/
   DATOS_ACTIVIDADES/DATOS_PROYECTOS[1] en js/main.js) para que Fase 2
   pueda mezclar este progreso con el catálogo real sin inventar items
   nuevos que no existen en el temario.
   --------------------------------------------------------- */

const DEMO_ITEMS_TRIMESTRE_1 = {
  tarea: ["t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12", "t13"],
  actividad: ["a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12"],
  proyecto: ["p3", "p4", "p5"],
};

// Fecha de entrega real de cada item en trimestre 1 (columna "3C" de
// fechaEntrega/fecha en js/main.js) — copiada aquí porque este archivo
// debe poder existir sin cargar main.js todavía (Fase 1). Si esas
// fechas cambian ahí, hay que actualizarlas aquí también para que
// Fase 2 siga siendo realista.
const DEMO_FECHAS_ENTREGA_T1 = {
  tarea: {
    t5: "2026-08-31", t6: "2026-09-07", t7: "2026-09-14", t8: "2026-09-22", t9: "2026-09-29",
    t10: "2026-10-13", t11: "2026-10-19", t12: "2026-10-26", t13: "2026-11-03",
  },
  actividad: {
    a4: "2026-09-01", a5: "2026-09-08", a6: "2026-09-15", a7: "2026-09-28", a8: "2026-10-05",
    a9: "2026-10-06", a10: "2026-10-20", a11: "2026-10-27", a12: "2026-11-09",
  },
  proyecto: { p3: "2026-09-21", p4: "2026-10-12", p5: "2026-11-10" },
};

function demoSumarDias(fechaISO, dias) {
  const fecha = new Date(fechaISO + "T12:00:00Z");
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

// Recorre los 21 items reales en orden y marca como "ya entregados" los
// primeros N según porcentajeAvance (no al azar): así, al leer este
// archivo, se sabe de inmediato cuáles items le quedan pendientes/
// vencidos a cada alumno sin tener que ejecutar nada. entregasTardias
// marca cuáles de esos entregados llevan a_tiempo:false (completados,
// pero 3 días después de la fecha límite) — mismo campo que ya usa el
// cálculo real de puntualidad (ver calcularYGuardarATiempo() en
// js/main.js).
function demoGenerarProgresoAlumno({ authUserId, porcentajeAvance, calificacionMin, calificacionMax, entregasTardias = [] }) {
  const todosLosItems = [
    ...DEMO_ITEMS_TRIMESTRE_1.tarea.map((id) => ({ tipo: "tarea", id })),
    ...DEMO_ITEMS_TRIMESTRE_1.actividad.map((id) => ({ tipo: "actividad", id })),
    ...DEMO_ITEMS_TRIMESTRE_1.proyecto.map((id) => ({ tipo: "proyecto", id })),
  ];

  const cantidadEntregada = Math.round(todosLosItems.length * porcentajeAvance);
  const itemsEntregados = todosLosItems.slice(0, cantidadEntregada);

  return itemsEntregados.map(({ tipo, id }) => {
    const fechaLimite = DEMO_FECHAS_ENTREGA_T1[tipo][id];
    const tardia = entregasTardias.includes(id);
    const fechaEntregaReal = demoSumarDias(fechaLimite, tardia ? 3 : -1);
    const calificacion = Number((calificacionMin + Math.random() * (calificacionMax - calificacionMin)).toFixed(1));

    return {
      alumno_id: authUserId,
      tipo,
      item_id: id,
      trimestre: 1,
      completado: true,
      calificacion,
      a_tiempo: !tardia,
      origen: "alumno",
      fecha_entrega_manual: null,
      nota: null,
      actualizado_en: fechaEntregaReal + "T18:00:00.000Z",
    };
  });
}

// Un perfil de avance por alumno: alto (Valeria, Santiago), medio
// (Emiliano, Bruno, Renata, Paulina), bajo (Ximena, Camila, Diego —
// candidatos naturales a "Top 5 en riesgo" del Dashboard). 5 de los 9
// llevan al menos una entrega tardía, por encima del mínimo de 1-2
// pedido, para que la métrica de puntualidad también se vea variada.
const DEMO_CONFIG_AVANCE_ALUMNOS = [
  { authUserId: "demo-uid-01", porcentajeAvance: 0.95, calificacionMin: 8.5, calificacionMax: 10.0, entregasTardias: [] },
  { authUserId: "demo-uid-02", porcentajeAvance: 0.60, calificacionMin: 6.5, calificacionMax: 8.5, entregasTardias: ["t9"] },
  { authUserId: "demo-uid-03", porcentajeAvance: 0.25, calificacionMin: 5.0, calificacionMax: 6.5, entregasTardias: ["t5", "a4"] },
  { authUserId: "demo-uid-04", porcentajeAvance: 0.75, calificacionMin: 7.0, calificacionMax: 9.0, entregasTardias: [] },
  { authUserId: "demo-uid-05", porcentajeAvance: 0.20, calificacionMin: 4.5, calificacionMax: 6.0, entregasTardias: ["t6"] },
  { authUserId: "demo-uid-06", porcentajeAvance: 0.90, calificacionMin: 8.0, calificacionMax: 9.8, entregasTardias: [] },
  { authUserId: "demo-uid-07", porcentajeAvance: 0.55, calificacionMin: 6.0, calificacionMax: 8.0, entregasTardias: ["a5"] },
  { authUserId: "demo-uid-08", porcentajeAvance: 0.15, calificacionMin: 4.0, calificacionMax: 5.5, entregasTardias: ["t5", "t6"] },
  { authUserId: "demo-uid-09", porcentajeAvance: 0.65, calificacionMin: 6.5, calificacionMax: 8.5, entregasTardias: [] },
];

const DEMO_PROGRESO = DEMO_CONFIG_AVANCE_ALUMNOS
  .flatMap((config) => demoGenerarProgresoAlumno(config))
  .map((fila, indice) => ({ id: "demo-prog-" + (indice + 1), ...fila }));

/* ---------------------------------------------------------
   avisos — 3 ejemplos, uno por cada prioridad real (urgente,
   importante, recordatorio)
   --------------------------------------------------------- */

const DEMO_AVISOS = [
  {
    id: "demo-aviso-01",
    titulo: "Recordatorio: entrega de Detective de IA en mi casa",
    descripcion: "Última llamada para quienes aún no suben la tarea de la Secuencia 1. Se cierra el viernes.",
    fecha: "2026-08-28",
    grupo: "todos",
    prioridad: "recordatorio",
    fecha_expiracion: "2026-08-31",
  },
  {
    id: "demo-aviso-02",
    titulo: "Cambia el horario del taller la próxima semana",
    descripcion: "Por evento escolar, el taller de 3°C se recorre al miércoles en el mismo horario.",
    fecha: "2026-09-10",
    grupo: "3C",
    prioridad: "importante",
    fecha_expiracion: "2026-09-17",
  },
  {
    id: "demo-aviso-03",
    titulo: "Cambia a formato digital la entrega del proyecto",
    descripcion: "La entrega de Mi Chatbot en Papel pasa a formato digital (fotos) mientras se resuelve una falla eléctrica en el taller.",
    fecha: "2026-09-19",
    grupo: "todos",
    prioridad: "urgente",
    fecha_expiracion: "2026-09-22",
  },
];

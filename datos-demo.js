/* =========================================================
   datos-demo.js — Dataset ficticio para "Modo Demo"

   Creado en Fase 1, conectado a los módulos admin en Fase 2 (ver
   obtenerDatos()/obtenerDatosDemo() en js/main.js, que lo consultan
   solo cuando demoModeActivo() === true). Progreso ficticio en los 3
   trimestres (originalmente solo T1; T2/T3 agregados después,
   manteniendo el mismo progreso relativo por alumno — ver
   demoOffsetAvancePorTrimestre() más abajo). Este archivo sigue siendo
   100% autocontenido: no depende de que js/main.js se haya cargado
   antes, y no lo modifica ni le agrega variables.

   Las formas reales que replica son las de Supabase:
     - alumnos_registro: id, nombre, grupo, numero_lista,
       codigo_invitacion, activo, usado, auth_user_id
     - perfiles: id (= auth_user_id), nombre, grupo, tema_preferido, rol
     - progreso: id, alumno_id, tipo, item_id, trimestre, completado,
       calificacion, a_tiempo, origen, fecha_entrega_manual, nota,
       actualizado_en
     - avisos: id, titulo, descripcion, fecha, grupo, prioridad,
       fecha_expiracion
     - fechas_override: id, trimestre, tipo, item_id, grupo, fecha,
       nota, creado_por (agregada en la Fase 6 de "Modo Demo", ver
       DEMO_FECHAS_OVERRIDE más abajo)
   (columnas confirmadas leyendo los .from(...)/.insert(...)/.update(...)/
   .upsert(...) reales en js/main.js — no son un esquema inventado).

   Todos los IDs de alumno/registro/progreso/aviso/override empiezan con
   "demo-" a propósito: nunca deben poder confundirse con un id real de
   Supabase (que son UUID/serial), y Fase 2 puede filtrar por ese
   prefijo si necesita distinguir origen en algún punto de depuración.
   ========================================================= */

/* ---------------------------------------------------------
   alumnos_registro / perfiles — 25 alumnos ficticios: 13 en 3C
   (5 originales + 8 nuevos), 12 en 3E (4 originales + 8 nuevos).
   Ningún apellido se repite entre los 25 (verificado aparte, en un
   contexto VM aislado, no con un chequeo dentro de este archivo) y
   ningún nombre completo coincide con un alumno real de los grupos
   3C/3E — son nombres genéricos inventados, no derivados de ninguna
   lista real.
   --------------------------------------------------------- */

const DEMO_ALUMNOS = [
  // --- 3C (13): 5 originales + 8 nuevos ---
  { id: "demo-reg-01", auth_user_id: "demo-uid-01", nombre: "Valeria Reyes Cortés", grupo: "3C", numero_lista: 1, codigo_invitacion: "DEMO-A001-VRC1", activo: true, usado: true },
  { id: "demo-reg-02", auth_user_id: "demo-uid-02", nombre: "Emiliano Duarte Salas", grupo: "3C", numero_lista: 2, codigo_invitacion: "DEMO-A002-EDS2", activo: true, usado: true },
  { id: "demo-reg-03", auth_user_id: "demo-uid-03", nombre: "Ximena Rosales Peña", grupo: "3C", numero_lista: 3, codigo_invitacion: "DEMO-A003-XRP3", activo: true, usado: true },
  { id: "demo-reg-04", auth_user_id: "demo-uid-04", nombre: "Bruno Aguilar Nieto", grupo: "3C", numero_lista: 4, codigo_invitacion: "DEMO-A004-BAN4", activo: true, usado: true },
  { id: "demo-reg-05", auth_user_id: "demo-uid-05", nombre: "Camila Torres Villagómez", grupo: "3C", numero_lista: 5, codigo_invitacion: "DEMO-A005-CTV5", activo: true, usado: true },
  { id: "demo-reg-10", auth_user_id: "demo-uid-10", nombre: "Fernanda González Lara", grupo: "3C", numero_lista: 6, codigo_invitacion: "DEMO-A010-FGL0", activo: true, usado: true },
  { id: "demo-reg-11", auth_user_id: "demo-uid-11", nombre: "Rodrigo Martínez Ochoa", grupo: "3C", numero_lista: 7, codigo_invitacion: "DEMO-A011-RMO1", activo: true, usado: true },
  { id: "demo-reg-12", auth_user_id: "demo-uid-12", nombre: "Isabela Hernández Cruz", grupo: "3C", numero_lista: 8, codigo_invitacion: "DEMO-A012-IHC2", activo: true, usado: true },
  { id: "demo-reg-13", auth_user_id: "demo-uid-13", nombre: "Mateo López Guzmán", grupo: "3C", numero_lista: 9, codigo_invitacion: "DEMO-A013-MLG3", activo: true, usado: true },
  { id: "demo-reg-14", auth_user_id: "demo-uid-14", nombre: "Regina Pérez Contreras", grupo: "3C", numero_lista: 10, codigo_invitacion: "DEMO-A014-RPC4", activo: true, usado: true },
  { id: "demo-reg-15", auth_user_id: "demo-uid-15", nombre: "Leonardo Sánchez Delgado", grupo: "3C", numero_lista: 11, codigo_invitacion: "DEMO-A015-LSD5", activo: true, usado: true },
  { id: "demo-reg-16", auth_user_id: "demo-uid-16", nombre: "Antonia Ramírez Salazar", grupo: "3C", numero_lista: 12, codigo_invitacion: "DEMO-A016-ARS6", activo: true, usado: true },
  { id: "demo-reg-17", auth_user_id: "demo-uid-17", nombre: "Joaquín Flores Bautista", grupo: "3C", numero_lista: 13, codigo_invitacion: "DEMO-A017-JFB7", activo: true, usado: true },

  // --- 3E (12): 4 originales + 8 nuevos ---
  { id: "demo-reg-06", auth_user_id: "demo-uid-06", nombre: "Santiago Ibarra Montes", grupo: "3E", numero_lista: 1, codigo_invitacion: "DEMO-A006-SIM6", activo: true, usado: true },
  { id: "demo-reg-07", auth_user_id: "demo-uid-07", nombre: "Renata Cabrera Solís", grupo: "3E", numero_lista: 2, codigo_invitacion: "DEMO-A007-RCS7", activo: true, usado: true },
  { id: "demo-reg-08", auth_user_id: "demo-uid-08", nombre: "Diego Farías Quintero", grupo: "3E", numero_lista: 3, codigo_invitacion: "DEMO-A008-DFQ8", activo: true, usado: true },
  { id: "demo-reg-09", auth_user_id: "demo-uid-09", nombre: "Paulina Escamilla Rúa", grupo: "3E", numero_lista: 4, codigo_invitacion: "DEMO-A009-PER9", activo: true, usado: true },
  { id: "demo-reg-18", auth_user_id: "demo-uid-18", nombre: "Daniela Gómez Cervantes", grupo: "3E", numero_lista: 5, codigo_invitacion: "DEMO-A018-DGC8", activo: true, usado: true },
  { id: "demo-reg-19", auth_user_id: "demo-uid-19", nombre: "Emilio Díaz Franco", grupo: "3E", numero_lista: 6, codigo_invitacion: "DEMO-A019-EDF9", activo: true, usado: true },
  { id: "demo-reg-20", auth_user_id: "demo-uid-20", nombre: "Sofía Vázquez Miranda", grupo: "3E", numero_lista: 7, codigo_invitacion: "DEMO-A020-SVM0", activo: true, usado: true },
  { id: "demo-reg-21", auth_user_id: "demo-uid-21", nombre: "Alonso Castillo Palacios", grupo: "3E", numero_lista: 8, codigo_invitacion: "DEMO-A021-ACP1", activo: true, usado: true },
  { id: "demo-reg-22", auth_user_id: "demo-uid-22", nombre: "Natalia Jiménez Serrano", grupo: "3E", numero_lista: 9, codigo_invitacion: "DEMO-A022-NJS2", activo: true, usado: true },
  { id: "demo-reg-23", auth_user_id: "demo-uid-23", nombre: "Gael Morales Valdez", grupo: "3E", numero_lista: 10, codigo_invitacion: "DEMO-A023-GMV3", activo: true, usado: true },
  { id: "demo-reg-24", auth_user_id: "demo-uid-24", nombre: "Abril Ortiz Zúñiga", grupo: "3E", numero_lista: 11, codigo_invitacion: "DEMO-A024-AOZ4", activo: true, usado: true },
  { id: "demo-reg-25", auth_user_id: "demo-uid-25", nombre: "Iker Gutiérrez Barrera", grupo: "3E", numero_lista: 12, codigo_invitacion: "DEMO-A025-IGB5", activo: true, usado: true },
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
   progreso — generado a partir de los 21 items REALES de cada trimestre
   (9 tareas + 9 actividades + 3 proyectos, ver DATOS_TAREAS/
   DATOS_ACTIVIDADES/DATOS_PROYECTOS[1|2|3] en js/main.js) para que
   Fase 2 pueda mezclar este progreso con el catálogo real sin inventar
   items nuevos que no existen en el temario. Los 3 trimestres tienen la
   misma forma (9+9+3=21) por diseño del temario real, así que el mismo
   generador sirve para los tres sin cambios.
   --------------------------------------------------------- */

const DEMO_ITEMS_POR_TRIMESTRE = {
  1: {
    tarea: ["t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12", "t13"],
    actividad: ["a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12"],
    proyecto: ["p3", "p4", "p5"],
  },
  2: {
    tarea: ["t-s4-1", "t-s4-2", "t-s4-3", "t-s5-1", "t-s5-2", "t-s5-3", "t-s6-1", "t-s6-2", "t-s6-3"],
    actividad: ["a-s4-1", "a-s4-2", "a-s4-3", "a-s5-1", "a-s5-2", "a-s5-3", "a-s6-1", "a-s6-2", "a-s6-3"],
    proyecto: ["p-s4", "p-s5", "p-s6"],
  },
  3: {
    tarea: ["t-s7-1", "t-s7-2", "t-s7-3", "t-s8-1", "t-s8-2", "t-s8-3", "t-s9-1", "t-s9-2", "t-s9-3"],
    actividad: ["a-s7-1", "a-s7-2", "a-s7-3", "a-s8-1", "a-s8-2", "a-s8-3", "a-s9-1", "a-s9-2", "a-s9-3"],
    proyecto: ["p-s7", "p-s8", "p-s9"],
  },
};

// Fecha de entrega real de cada item por trimestre (columna "3C" de
// fechaEntrega/fecha en js/main.js) — copiada aquí porque este archivo
// debe poder existir sin cargar main.js todavía (Fase 1). Si esas
// fechas cambian ahí, hay que actualizarlas aquí también para que
// Fase 2 siga siendo realista.
const DEMO_FECHAS_ENTREGA_POR_TRIMESTRE = {
  1: {
    tarea: {
      t5: "2026-08-31", t6: "2026-09-07", t7: "2026-09-14", t8: "2026-09-22", t9: "2026-09-29",
      t10: "2026-10-13", t11: "2026-10-19", t12: "2026-10-26", t13: "2026-11-03",
    },
    actividad: {
      a4: "2026-09-01", a5: "2026-09-08", a6: "2026-09-15", a7: "2026-09-28", a8: "2026-10-05",
      a9: "2026-10-06", a10: "2026-10-20", a11: "2026-10-27", a12: "2026-11-09",
    },
    proyecto: { p3: "2026-09-21", p4: "2026-10-12", p5: "2026-11-10" },
  },
  2: {
    tarea: {
      "t-s4-1": "2026-11-17", "t-s4-2": "2026-11-23", "t-s4-3": "2026-11-24",
      "t-s5-1": "2026-12-15", "t-s5-2": "2027-01-12", "t-s5-3": "2027-01-25",
      "t-s6-1": "2027-02-09", "t-s6-2": "2027-02-16", "t-s6-3": "2027-03-01",
    },
    actividad: {
      "a-s4-1": "2026-11-30", "a-s4-2": "2026-12-07", "a-s4-3": "2026-12-08",
      "a-s5-1": "2027-01-11", "a-s5-2": "2027-01-18", "a-s5-3": "2027-01-26",
      "a-s6-1": "2027-02-08", "a-s6-2": "2027-02-15", "a-s6-3": "2027-02-23",
    },
    proyecto: { "p-s4": "2026-12-14", "p-s5": "2027-02-02", "p-s6": "2027-03-02" },
  },
  3: {
    tarea: {
      "t-s7-1": "2027-03-09", "t-s7-2": "2027-04-06", "t-s7-3": "2027-04-19",
      "t-s8-1": "2027-05-03", "t-s8-2": "2027-05-11", "t-s8-3": "2027-05-24",
      "t-s9-1": "2027-06-07", "t-s9-2": "2027-06-14", "t-s9-3": "2027-06-22",
    },
    actividad: {
      "a-s7-1": "2027-03-08", "a-s7-2": "2027-04-05", "a-s7-3": "2027-04-13",
      "a-s8-1": "2027-04-27", "a-s8-2": "2027-05-04", "a-s8-3": "2027-05-17",
      "a-s9-1": "2027-05-31", "a-s9-2": "2027-06-08", "a-s9-3": "2027-06-21",
    },
    proyecto: { "p-s7": "2027-04-20", "p-s8": "2027-05-25", "p-s9": "2027-06-29" },
  },
};

function demoSumarDias(fechaISO, dias) {
  const fecha = new Date(fechaISO + "T12:00:00Z");
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

// Recorre los 21 items reales en orden y marca como "ya entregados" los
// primeros N según porcentajeAvance (no al azar): así, al leer este
// archivo, se sabe de inmediato cuáles items le quedan pendientes/
// vencidos a cada alumno sin tener que ejecutar nada.
//
// numeroEntregasTardias (0-3): a diferencia de la versión anterior
// (lista de ids a mano, ej. entregasTardias: ["t5", "a4"]), las
// tardías se calculan tomando las ÚLTIMAS N entregas DENTRO de
// itemsEntregados — nunca pueden apuntar a un item que el alumno no
// alcanzó a entregar según su avance real. Eso era justo el bug de
// demo-uid-03/Ximena: con 24% de avance (5 de 21 items, todos
// tareas), "a4" nunca estaba en itemsEntregados, así que ese id de la
// lista nunca se activaba — configuración muerta que no daba error ni
// aviso. Tomar las últimas N (no al azar) también es más realista: un
// alumno que se atrasa es más probable que se haya atrasado en lo
// último que entregó, no en algo de hace semanas que ya tenía resuelto.
//
// sinCalificar fuerza calificacion:null en todas las filas del alumno
// (entregó, pero el docente aún no calificó nada) — para probar que la
// tabla de promedios muestre "—" en vez de "0.0" cuando no hay ninguna
// calificacion numérica que promediar.
function demoGenerarProgresoAlumno({ authUserId, trimestre, porcentajeAvance, calificacionMin, calificacionMax, numeroEntregasTardias = 0, sinCalificar = false }) {
  const itemsDelTrimestre = DEMO_ITEMS_POR_TRIMESTRE[trimestre];
  const fechasDelTrimestre = DEMO_FECHAS_ENTREGA_POR_TRIMESTRE[trimestre];
  const todosLosItems = [
    ...itemsDelTrimestre.tarea.map((id) => ({ tipo: "tarea", id })),
    ...itemsDelTrimestre.actividad.map((id) => ({ tipo: "actividad", id })),
    ...itemsDelTrimestre.proyecto.map((id) => ({ tipo: "proyecto", id })),
  ];

  const cantidadEntregada = Math.round(todosLosItems.length * porcentajeAvance);
  const itemsEntregados = todosLosItems.slice(0, cantidadEntregada);

  const cantidadTardias = Math.min(numeroEntregasTardias, itemsEntregados.length);
  const idsEntregasTardias = new Set(
    itemsEntregados.slice(itemsEntregados.length - cantidadTardias).map((item) => item.id)
  );

  return itemsEntregados.map(({ tipo, id }) => {
    const fechaLimite = fechasDelTrimestre[tipo][id];
    const tardia = idsEntregasTardias.has(id);
    const fechaEntregaReal = demoSumarDias(fechaLimite, tardia ? 3 : -1);
    const calificacion = sinCalificar
      ? null
      : Number((calificacionMin + Math.random() * (calificacionMax - calificacionMin)).toFixed(1));

    return {
      alumno_id: authUserId,
      tipo,
      item_id: id,
      trimestre,
      completado: true,
      calificacion,
      a_tiempo: !tardia,
      // "formulario", no "alumno": es el valor real que usa el resto del
      // código para distinguir una entrega normal de una marcada a mano
      // por el docente (ver "origen === 'formulario'" en
      // renderizarFeedActividadDashboard/pintarBadgeCalificacion,
      // js/main.js) — encontrado al verificar en vivo que el feed de
      // Actividad reciente del Dashboard etiquetaba las 25 entregas
      // ficticias como "🧑‍🏫 Registro manual" en vez de "📝 Formulario".
      origen: "formulario",
      fecha_entrega_manual: null,
      nota: null,
      actualizado_en: fechaEntregaReal + "T18:00:00.000Z",
    };
  });
}

// Semáforo de la Ficha de Análisis (≥75% verde / 50-74% ámbar / <50%
// rojo) aplicado sobre el TOTAL de 25: 10 verde, 8 ámbar, 7 rojo.
// porcentajeAvance se escribe como fracción k/21 (k = cuántos de los 21
// items reales de trimestre 1 ya entregó) en vez de un decimal como
// 0.75, para que el % resultante sea exacto y auditable a simple vista
// — con 21 items el propio redondeo ya da porcentajes "orgánicos" (no
// caen en múltiplos de 25/50 salvo 0% y 100%, que aquí nadie usa).
//
// Casos especiales (ver PASO 4): demo-uid-15 y demo-uid-20 llevan
// sinCalificar:true (0 calificaciones capturadas, deben verse como "—"
// en la tabla de promedios). demo-uid-01/04/06/09/13/19 tienen 0
// entregas tardías con avance alto/medio — candidatos a "Racha de
// puntualidad". numeroEntregasTardias varía entre 0, 1, 2 y 3 en vez
// de ser binario sí/no.
const DEMO_CONFIG_AVANCE_ALUMNOS = [
  // --- 3C (13) ---
  { authUserId: "demo-uid-01", porcentajeAvance: 20 / 21, calificacionMin: 8.5, calificacionMax: 10.0, numeroEntregasTardias: 0 }, // Valeria — verde 95.2%
  { authUserId: "demo-uid-02", porcentajeAvance: 13 / 21, calificacionMin: 6.5, calificacionMax: 8.5, numeroEntregasTardias: 1 }, // Emiliano — ámbar 61.9%
  { authUserId: "demo-uid-03", porcentajeAvance: 5 / 21, calificacionMin: 5.0, calificacionMax: 6.5, numeroEntregasTardias: 1 }, // Ximena — rojo 23.8%
  { authUserId: "demo-uid-04", porcentajeAvance: 16 / 21, calificacionMin: 7.0, calificacionMax: 9.0, numeroEntregasTardias: 0 }, // Bruno — verde 76.2%
  { authUserId: "demo-uid-05", porcentajeAvance: 4 / 21, calificacionMin: 4.5, calificacionMax: 6.0, numeroEntregasTardias: 1 }, // Camila — rojo 19.0%
  { authUserId: "demo-uid-10", porcentajeAvance: 17 / 21, calificacionMin: 7.8, calificacionMax: 9.4, numeroEntregasTardias: 0 }, // Fernanda — verde 81.0%
  { authUserId: "demo-uid-11", porcentajeAvance: 18 / 21, calificacionMin: 8.0, calificacionMax: 9.5, numeroEntregasTardias: 1 }, // Rodrigo — verde 85.7%
  { authUserId: "demo-uid-12", porcentajeAvance: 16 / 21, calificacionMin: 7.5, calificacionMax: 9.0, numeroEntregasTardias: 2 }, // Isabela — verde 76.2%
  { authUserId: "demo-uid-13", porcentajeAvance: 19 / 21, calificacionMin: 8.3, calificacionMax: 9.7, numeroEntregasTardias: 0 }, // Mateo — verde 90.5%
  { authUserId: "demo-uid-14", porcentajeAvance: 11 / 21, calificacionMin: 6.0, calificacionMax: 7.5, numeroEntregasTardias: 1 }, // Regina — ámbar 52.4%
  { authUserId: "demo-uid-15", porcentajeAvance: 13 / 21, calificacionMin: 6.3, calificacionMax: 7.8, numeroEntregasTardias: 0, sinCalificar: true }, // Leonardo — ámbar 61.9%, sin calificar
  { authUserId: "demo-uid-16", porcentajeAvance: 2 / 21, calificacionMin: 3.5, calificacionMax: 5.0, numeroEntregasTardias: 0 }, // Antonia — rojo 9.5%
  { authUserId: "demo-uid-17", porcentajeAvance: 8 / 21, calificacionMin: 4.5, calificacionMax: 6.0, numeroEntregasTardias: 3 }, // Joaquín — rojo 38.1%

  // --- 3E (12) ---
  { authUserId: "demo-uid-06", porcentajeAvance: 19 / 21, calificacionMin: 8.0, calificacionMax: 9.8, numeroEntregasTardias: 0 }, // Santiago — verde 90.5%
  { authUserId: "demo-uid-07", porcentajeAvance: 12 / 21, calificacionMin: 6.0, calificacionMax: 8.0, numeroEntregasTardias: 1 }, // Renata — ámbar 57.1%
  { authUserId: "demo-uid-08", porcentajeAvance: 3 / 21, calificacionMin: 4.0, calificacionMax: 5.5, numeroEntregasTardias: 2 }, // Diego — rojo 14.3%
  { authUserId: "demo-uid-09", porcentajeAvance: 14 / 21, calificacionMin: 6.5, calificacionMax: 8.5, numeroEntregasTardias: 0 }, // Paulina — ámbar 66.7%
  { authUserId: "demo-uid-18", porcentajeAvance: 20 / 21, calificacionMin: 8.5, calificacionMax: 10.0, numeroEntregasTardias: 1 }, // Daniela — verde 95.2%
  { authUserId: "demo-uid-19", porcentajeAvance: 17 / 21, calificacionMin: 7.8, calificacionMax: 9.3, numeroEntregasTardias: 0 }, // Emilio — verde 81.0%
  { authUserId: "demo-uid-20", porcentajeAvance: 18 / 21, calificacionMin: 8.0, calificacionMax: 9.5, numeroEntregasTardias: 0, sinCalificar: true }, // Sofía — verde 85.7%, sin calificar
  { authUserId: "demo-uid-21", porcentajeAvance: 12 / 21, calificacionMin: 6.1, calificacionMax: 7.6, numeroEntregasTardias: 2 }, // Alonso — ámbar 57.1%
  { authUserId: "demo-uid-22", porcentajeAvance: 14 / 21, calificacionMin: 6.5, calificacionMax: 8.0, numeroEntregasTardias: 1 }, // Natalia — ámbar 66.7%
  { authUserId: "demo-uid-23", porcentajeAvance: 15 / 21, calificacionMin: 6.8, calificacionMax: 8.3, numeroEntregasTardias: 3 }, // Gael — ámbar 71.4%
  { authUserId: "demo-uid-24", porcentajeAvance: 6 / 21, calificacionMin: 4.0, calificacionMax: 5.5, numeroEntregasTardias: 1 }, // Abril — rojo 28.6%
  { authUserId: "demo-uid-25", porcentajeAvance: 9 / 21, calificacionMin: 4.8, calificacionMax: 6.2, numeroEntregasTardias: 2 }, // Iker — rojo 42.9%
];

// T2/T3: MISMO progreso relativo por alumno que en T1 (mismo
// calificacionMin/Max, mismo numeroEntregasTardias, mismo
// sinCalificar) — nunca trimestres independientes al azar, porque el
// Dashboard "Avance del ciclo"/Ficha de Análisis promedia los 3 y un
// alumno que salta de 95% a 20% de un trimestre a otro se vería como
// dos personas distintas, no una real. Solo el AVANCE (cuántos de los
// 21 items entregó) recibe un ajuste chico y determinista por
// trimestre — ±1 item sobre su nivel base de T1, en un patrón cíclico
// por posición en el arreglo (no aleatorio, para que el dataset sea
// reproducible y auditable) — así T2/T3 no son un calco exacto de T1
// pero tampoco un alumno distinto: sigue siendo reconociblemente la
// misma persona con leves altibajos entre trimestres.
function demoOffsetAvancePorTrimestre(indice, trimestre) {
  if (trimestre === 1) return 0;
  const ciclo = [-1, 0, 1];
  const fase = trimestre === 2 ? indice : indice + 1;
  return ciclo[fase % 3];
}

const TOTAL_ITEMS_POR_TRIMESTRE = 21; // igual en los 3 (9 tareas + 9 actividades + 3 proyectos)

const DEMO_PROGRESO = DEMO_CONFIG_AVANCE_ALUMNOS
  .flatMap((config, indice) =>
    [1, 2, 3].flatMap((trimestre) => {
      const kBase = Math.round(TOTAL_ITEMS_POR_TRIMESTRE * config.porcentajeAvance);
      const k = Math.max(0, Math.min(TOTAL_ITEMS_POR_TRIMESTRE, kBase + demoOffsetAvancePorTrimestre(indice, trimestre)));
      return demoGenerarProgresoAlumno({
        ...config,
        trimestre,
        porcentajeAvance: k / TOTAL_ITEMS_POR_TRIMESTRE,
      });
    })
  )
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

/* ---------------------------------------------------------
   fechas_override (Fase 6 de "Modo Demo") — 3 overrides de ejemplo
   sobre items reales de T1 (mismos ids que ya usa
   DEMO_ITEMS_POR_TRIMESTRE/DEMO_FECHAS_ENTREGA_POR_TRIMESTRE más
   arriba), para que la demo muestre la funcionalidad "🖊️ Override" en
   acción y no solo un estado vacío. Cubre ambos casos de la jerarquía
   que resuelve aplicarOverridesFechas() en js/main.js:
     - t6 (grupo "3C"): override de grupo específico — mueve la fecha
       base (2026-09-07) 3 días, "3E" conserva la fecha original.
     - a7 (grupo "todos"): override que aplica a ambos grupos por
       igual — mueve la fecha base (2026-09-28) 4 días.
     - p3 (grupo "3E"): override de grupo específico sobre un
       proyecto, cuyo campo de fecha es un objeto {3C,3E} en vez de un
       string — ejercita esa otra rama de aplicarOverridesFechas() que
       t6/a7 no cubren. Mueve la fecha base (2026-09-21) 4 días.
   Ninguna fecha cae en el pasado ni se aleja de forma poco creíble de
   su fecha base real. --------------------------------------------- */

const DEMO_FECHAS_OVERRIDE = [
  {
    id: "demo-override-01",
    trimestre: 1,
    tipo: "tarea",
    item_id: "t6",
    grupo: "3C",
    fecha: "2026-09-10",
    nota: "Extensión por evento escolar",
    creado_por: null,
  },
  {
    id: "demo-override-02",
    trimestre: 1,
    tipo: "actividad",
    item_id: "a7",
    grupo: "todos",
    fecha: "2026-10-02",
    nota: "Recorrido general de fechas",
    creado_por: null,
  },
  {
    id: "demo-override-03",
    trimestre: 1,
    tipo: "proyecto",
    item_id: "p3",
    grupo: "3E",
    fecha: "2026-09-25",
    nota: "Ajuste puntual para 3°E",
    creado_por: null,
  },
];

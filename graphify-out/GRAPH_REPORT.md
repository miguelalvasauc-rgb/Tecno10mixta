# Graph Report - .  (2026-08-04)

## Corpus Check
- Large corpus: 350 files · ~1,791,661 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 471 nodes · 906 edges · 64 communities (27 shown, 37 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 65 edges (avg confidence: 0.7)
- Token cost: 621,808 input · 0 output

## Community Hubs (Navigation)
- Panel Admin - Nucleo main.js
- Datos Curriculares del Sitio
- Panel Admin - Evaluacion
- Progreso del Alumno
- Panel Admin - Fechas de Entrega
- Panel Admin - Historial de Calificacion
- Panel Admin - Trimestre y Sesion
- Curriculo: Bloque 1 (Secuencias 1-3)
- Panel Admin - Alumnos
- Temario T1 Seq2-3: Diseno y Robotica
- Panel Admin - Avisos
- Panel Admin - Dashboard
- Panel Admin - Calificar
- Calendario Escolar
- Temario T3 Seq7-9: Programacion y Prototipos
- Calculo de Vencimientos
- Temario T1 Seq1: Imagenes de IA
- Temario T2 Seq4-5: Identidad Digital
- Curriculo: Secuencia 6 Seguridad Digital
- Temario T2-T3: Datos y Redes
- Temario T2 Seq6: Imagenes de Seguridad
- Curriculo: Secuencia 5 Hojas de Calculo
- Curriculo: Secuencia 8 Diseno Web
- Exportacion CSV de Promedios
- Navegacion Riel/Flyouts Movil
- Edicion Manual de Entregas
- Navegacion Movil Tabla Calificacion
- Temario T1 Seq3: Imagenes de Robotica
- Temario T3 Seq9: Imagenes de Presentacion
- Principios de Producto y Flujo de Diseno
- Guia del Alumno (Wizard)
- Navegacion por Pestanas (Hash)
- Submenus del Sidebar
- Formulario de Contacto
- Colapso del Sidebar
- Utilidades de Fechas ISO
- Flip 3D de Tarjetas Temario
- Modal Confirmar Trimestre
- Modal Nuevo Alumno
- Panel Admin - Seccion Avisos
- Imagen Instructiva FAQ
- Logo Institucional
- Reglas de Uso de graphify
- Regla de Exploracion main.js
- Stack Tecnologico Fijo
- Formulario Crear Cuenta
- Formulario Login
- Regla de Una Sola Sombra
- Botones en Forma de Pildora
- Tipografia del Sitio
- FAQ: Aviso de Privacidad
- FAQ: Calificacion
- FAQ: Entrega de Trabajos
- FAQ: Uso del Sitio
- Guia Paso 2: Navegacion
- Criterios de Evaluacion (30/30/40)
- Seccion Encuadre Anual
- Seccion Examen Diagnostico
- Seccion Hero (Inicio)
- Seccion Horario de Clases
- Seccion Perfil Docente
- Posicionamiento: No es un LMS
- Usuarios: Alumnos 3C/3E
- README del Proyecto

## God Nodes (most connected - your core abstractions)
1. `mostrarSinResultados()` - 19 edges
2. `renderizarTareas()` - 16 edges
3. `textoGrupo()` - 15 edges
4. `renderizarActividades()` - 15 edges
5. `renderizarProyectos()` - 15 edges
6. `renderizarTodo()` - 15 edges
7. `obtenerEntregablesPorTipo()` - 15 edges
8. `inicializarModuloCalificacion()` - 14 edges
9. `renderizarProgresoDetallado()` - 12 edges
10. `renderizarCalendario()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `guia.html — Guía del Alumno` --references--> `actualizarEnlacesTrimestreEnSidebar()`  [EXTRACTED]
  guia.html → js/main.js
- `#modal-editar-entrega` --references--> `pintarBadgeCalificacion()`  [EXTRACTED]
  admin.html → js/main.js
- `Panel: Calificación y progreso` --references--> `filtrarFilasTablaCalificacion()`  [EXTRACTED]
  admin.html → js/main.js
- `#modal-historial-alumno` --references--> `abrirModalHistorialAlumno()`  [EXTRACTED]
  admin.html → js/main.js
- `Panel: Calificación y progreso` --references--> `renderizarTablaAvancePorTipo()`  [EXTRACTED]
  admin.html → js/main.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Bloque 1: las 3 secuencias curriculares (IA, RV, Robótica)** — bloque1_detalle_tareas_actividades_proyectos_documento, bloque1_detalle_tareas_actividades_proyectos_secuencia1_ia, bloque1_detalle_tareas_actividades_proyectos_secuencia2_rv, bloque1_detalle_tareas_actividades_proyectos_secuencia3_robotica [EXTRACTED 1.00]
- **Módulos del panel docente (admin-tabs)** — admin_tab_calificacion, admin_tab_alumnos, admin_tab_avisos, admin_tab_trimestre, admin_tab_fechas, admin_tab_evaluacion, admin_tab_dashboard [EXTRACTED 1.00]
- **Migración de los 3 bloques curriculares al sitio (trimestre-1/2/3.html + js/main.js)** — bloque1_detalle_tareas_actividades_proyectos_documento, bloque_2_datos_diseno_ciberseguridad_documento, bloque_3_creando_el_futuro_documento, trimestre_1_page, trimestre_2_page, trimestre_3_page [INFERRED 0.85]
- **Conjunto de ilustraciones de la Secuencia 1 (Trimestre 1): tecnología inteligente/IA cotidiana** — assets_temario_t1_seq1_tema1_ilustracion_cerebro_ia, assets_temario_t1_seq1_tema2_ilustracion_asistente_voz, assets_temario_t1_seq1_tema3_ilustracion_chatbot_dialogo, assets_temario_t1_seq1_tema4_ilustracion_robot_automatizacion [INFERRED 0.80]
- **Secuencia 2 (Trimestre 1): temas 1-3 comparten la narrativa visual de transición analógico/digital y tecnología-sociedad** — assets_temario_t1_seq2_tema1_image, assets_temario_t1_seq2_tema2_image, assets_temario_t1_seq2_tema3_image [INFERRED 0.75]
- **Secuencia 3 (Trimestre 1): temas 1-3 comparten iconografía de robots, IA y automatización** — assets_temario_t1_seq3_tema1_image, assets_temario_t1_seq3_tema2_image, assets_temario_t1_seq3_tema3_image [INFERRED 0.80]
- **Temas de la Secuencia 4 del Trimestre 2 (identidad digital, redes y datos)** — assets_temario_t2_seq4_tema1_illustration, assets_temario_t2_seq4_tema2_illustration, assets_temario_t2_seq4_tema3_illustration [INFERRED 0.85]
- **Tema de seguridad y proteccion digital/corporal (Secuencia 6, Trimestre 2)** — assets_temario_t2_seq6_tema1_image, assets_temario_t2_seq6_tema2_image, assets_temario_t2_seq6_tema3_image [INFERRED 0.75]
- **Secuencia 8 — Diseño Web: temas 1, 2 y 3 comparten estilo visual de ventana/navegador neón** — assets_temario_t3_seq8_tema1, assets_temario_t3_seq8_tema2, assets_temario_t3_seq8_tema3 [INFERRED 0.85]

## Communities (64 total, 37 thin omitted)

### Community 0 - "Panel Admin - Nucleo main.js"
Cohesion: 0.04
Nodes (46): RFC-4180, anioVisible, CAMPO_FECHA_POR_TIPO, CICLO_ESCOLAR, clienteSupabase, COLORES_ENTREGA, COLORES_SEMAFORO, DATOS_ACTIVIDADES (+38 more)

### Community 1 - "Datos Curriculares del Sitio"
Cohesion: 0.05
Nodes (52): DATOS_ACTIVIDADES (constante js/main.js), DATOS_PROYECTOS (constante js/main.js), DATOS_RUBRICAS (constante js/main.js), DATOS_TAREAS (constante js/main.js), DATOS_TEMARIO (constante js/main.js), Bloque 1: Tecnologías del Mañana — Tareas, Actividades y Proyectos, Bloque 2: Datos, Diseño y Ciberseguridad, Bloque 3: Creando el Futuro (+44 more)

### Community 2 - "Panel Admin - Evaluacion"
Cohesion: 0.08
Nodes (45): #modal-editar-entrega, Panel: Evaluación, abrirModalEditarEntrega(), activarBuscadorCalificacion(), activarBuscadorEvaluacion(), activarImpresionTablaPromedios(), activarNavegacionMovilTablaEvaluacion(), activarVistaPromedios() (+37 more)

### Community 3 - "Progreso del Alumno"
Cohesion: 0.11
Nodes (45): activarBotonEncuadreAnual(), actualizarControlesVistaSecuencias(), actualizarResumenProgreso(), actualizarUISesion(), aplicarModoVistaSecuencia(), aplicarOverridesFechas(), calcularAvanceGeneralAlumno(), calcularNivelAlumno() (+37 more)

### Community 4 - "Panel Admin - Fechas de Entrega"
Cohesion: 0.09
Nodes (32): #modal-confirmar-fecha, #modal-editar-fecha, #modal-recorrido-fechas, Panel: Fechas de entrega, abrirModalEditarFecha(), activarConfirmarFecha(), activarConfirmarRecorridoFechas(), activarFormularioEditarFecha() (+24 more)

### Community 5 - "Panel Admin - Historial de Calificacion"
Cohesion: 0.10
Nodes (26): #modal-historial-alumno, Panel: Calificación y progreso, abrirModalHistorialAlumno(), activarBannerExamenDiagnostico(), activarCierreModalHistorialCalificacion(), activarDelegacionHistorialCalificacion(), activarExportarCSVCalificacion(), activarImpresionHistorialCalificacion() (+18 more)

### Community 6 - "Panel Admin - Trimestre y Sesion"
Cohesion: 0.10
Nodes (23): admin.html — Panel docente, Panel: Trimestre, TRIMESTRE_DESBLOQUEADO gate funcional (Supabase config_sitio), #panel-sesion-activa, activarFormularioTrimestre(), activarPanelSesionCuenta(), activarSelectorTrimestre(), actualizarAvatarPerfil() (+15 more)

### Community 7 - "Curriculo: Bloque 1 (Secuencias 1-3)"
Cohesion: 0.10
Nodes (21): Proyecto: Diseña tu Robot Ideal, Proyecto: Mi Chatbot en Papel, Proyecto: Mi Metaverso Educativo, Secuencia 1 — Inteligencia Artificial, Secuencia 2 — Realidad Virtual, Secuencia 3 — Robótica, Filtro burbuja, Proyecto: Mi Análisis de Datos Escolar (+13 more)

### Community 8 - "Panel Admin - Alumnos"
Cohesion: 0.16
Nodes (20): #modal-codigo-invitacion, Panel: Alumnos, activarBotonNuevoAlumno(), activarBuscadorAlumnos(), activarCierreModalCodigoInvitacion(), activarCopiarCodigoInvitacion(), activarFormularioNuevoAlumno(), actualizarActivoAlumno() (+12 more)

### Community 9 - "Temario T1 Seq2-3: Diseno y Robotica"
Cohesion: 0.20
Nodes (14): Secuencia 2 (Trimestre 1): Tecnología, diseño digital y sociedad, Transformación digital del diseño (de boceto analógico a modelo 3D digital), Boceto a mano vs. modelo digital (diagonal claro/oscuro), Contraste realidad virtual (visor, fantasía) / realidad aumentada (smartphone, mundo real), Realidad virtual vs. realidad aumentada (retrato dividido azul/rojo), Sociedad conectada globalmente / diversidad de personas como valor central (gema), Figuras humanas holográficas sobre gema con globo terráqueo de red, Secuencia 3 (Trimestre 1): Robótica y automatización (+6 more)

### Community 10 - "Panel Admin - Avisos"
Cohesion: 0.25
Nodes (11): #modal-aviso, abrirModalAviso(), activarBotonNuevoAviso(), activarFormularioAviso(), construirTablaAvisos(), crearFilaAviso(), eliminarAviso(), estadoVigenciaAviso() (+3 more)

### Community 11 - "Panel Admin - Dashboard"
Cohesion: 0.22
Nodes (10): Panel: Dashboard, construirFiguraBarraApilada(), contarPendientesPorCalificar(), inicializarModuloDashboard(), renderizarCronogramaDashboard(), renderizarDashboard(), renderizarKPIsDashboard(), renderizarSemaforoDashboard() (+2 more)

### Community 12 - "Panel Admin - Calificar"
Cohesion: 0.22
Nodes (9): #modal-calificar, abrirModalCalificar(), activarFormularioCalificar(), construirTablaEvaluacion(), crearCeldaEvaluacion(), crearFilaAlumnoEvaluacion(), formatearCalificacion(), guardarCalificacion() (+1 more)

### Community 13 - "Calendario Escolar"
Cohesion: 0.25
Nodes (9): actualizarBotonesNavegacionCalendario(), avanzarMesCalendario(), claveMes(), estaDentroDelCicloEscolar(), formatearClaveFecha(), NOMBRES_DIA, obtenerEventos(), renderizarCalendario() (+1 more)

### Community 14 - "Temario T3 Seq7-9: Programacion y Prototipos"
Cohesion: 0.53
Nodes (6): Imagen: red geométrica brillante sobre fondo de circuitos (Secuencia 7, Tema 2 — Abstracción y reconocimiento de patrones), Imagen: foco de luz sostenido por manos con rayos tipo circuito (Secuencia 7, Tema 3 — Programación con propósito social), Imagen: ventana de navegador estilo neón con cursor y bloques de contenido (Secuencia 8, Tema 1 — Diseño Web), Imagen: wireframe de sitio web con múltiples secciones y jerarquía visual (Secuencia 8, Tema 2 — UX/UI y arquitectura de la información), Imagen: ventana dividida en dos paneles, contenido estático vs. interactivo (Secuencia 8, Tema 3 — Sitios estáticos vs. dinámicos), Imagen: microchip rodeado de iconos de herramientas y bombilla (Secuencia 9, Tema 1 — Prototipos Tecnológicos e IoT)

### Community 15 - "Calculo de Vencimientos"
Cohesion: 0.40
Nodes (5): calcularPctTardeOFaltante(), estadoCeldaEvaluacion(), fechaLimiteISO(), itemEstaVencido(), resolverValorFechaPorGrupo()

### Community 16 - "Temario T1 Seq1: Imagenes de IA"
Cohesion: 0.67
Nodes (4): Ilustración Tema 1 (Trimestre 1, Secuencia 1): cerebro neón conectado a dispositivos/IoT, Ilustración Tema 2 (Trimestre 1, Secuencia 1): asistente de voz activado por smartphone, Ilustración Tema 3 (Trimestre 1, Secuencia 1): dos siluetas dialogando conectadas por circuito, Ilustración Tema 4 (Trimestre 1, Secuencia 1): robot amigable con herramientas y engranes

### Community 17 - "Temario T2 Seq4-5: Identidad Digital"
Cohesion: 0.83
Nodes (4): Textura abstracta de malla digital ondulante turquesa (Trimestre 2, Secuencia 4, Tema 1), Silueta de persona conectada a íconos de redes sociales (Trimestre 2, Secuencia 4, Tema 2), Gráfica de barras ascendente sobre onda de datos digital (Trimestre 2, Secuencia 4, Tema 3), Laptop con pantalla de cuadrícula/lienzo digital y cursor (Trimestre 2, Secuencia 5, Tema 1)

### Community 18 - "Curriculo: Secuencia 6 Seguridad Digital"
Cohesion: 0.50
Nodes (4): Proyecto: Mi Manual de Supervivencia Digital, Rúbrica — Secuencia 6: Seguridad Digital Avanzada, Secuencia 6 — Seguridad Digital Avanzada, Caso WannaCry (2017)

### Community 19 - "Temario T2-T3: Datos y Redes"
Cohesion: 0.67
Nodes (3): Identidad algebraica luminosa (temario T2-Seq5-Tema2), Grafico de barras y datos en red (temario T2-Seq5-Tema3), Nodo central enlazado a red de simbolos de sistema (temario T3-Seq7-Tema1)

### Community 20 - "Temario T2 Seq6: Imagenes de Seguridad"
Cohesion: 1.00
Nodes (3): Escudo con silueta corporal y circuitos (temario T2-Seq6-Tema1), Candado de seguridad digital luminoso (temario T2-Seq6-Tema2), Mapa mundial con red global y foco de alerta roja (temario T2-Seq6-Tema3)

### Community 21 - "Curriculo: Secuencia 5 Hojas de Calculo"
Cohesion: 0.67
Nodes (3): Proyecto: Mi Hoja de Cálculo para Decidir, Rúbrica — Secuencia 5: Hojas de Cálculo, Secuencia 5 — Dominando las Hojas de Cálculo

### Community 22 - "Curriculo: Secuencia 8 Diseno Web"
Cohesion: 0.67
Nodes (3): Proyecto: Mi Portafolio Web en Papel, Rúbrica — Secuencia 8: Diseño Web, Secuencia 8 — Diseño Web: Crea tu Propio Sitio desde Cero

### Community 23 - "Exportacion CSV de Promedios"
Cohesion: 0.67
Nodes (3): activarExportarCSVPromedios(), escaparValorCSV(), exportarCSVPromedios()

### Community 24 - "Navegacion Riel/Flyouts Movil"
Cohesion: 0.67
Nodes (3): activarFlyoutsRiel(), activarPanelesConDisparador(), activarSheetsMovil()

### Community 25 - "Edicion Manual de Entregas"
Cohesion: 0.67
Nodes (3): activarFormularioEditarEntrega(), eliminarEntregaManual(), guardarEntregaManual()

### Community 26 - "Navegacion Movil Tabla Calificacion"
Cohesion: 0.67
Nodes (3): activarNavegacionMovilTablaCalificacion(), actualizarEstadoNavegacionTablaCalificacion(), anchoPrimeraColumnaDatosCalificacion()

## Knowledge Gaps
- **126 isolated node(s):** `DATOS_AVISOS`, `DATOS_EVENTOS`, `DATOS_HORARIO`, `DATOS_RUBRICAS`, `DATOS_TAREAS` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `actualizarEnlacesTrimestreEnSidebar()` connect `Datos Curriculares del Sitio` to `Panel Admin - Nucleo main.js`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `abrirModalDetalle()` connect `Datos Curriculares del Sitio` to `Panel Admin - Nucleo main.js`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `activarResaltadoDeNavegacion()` connect `Datos Curriculares del Sitio` to `Panel Admin - Nucleo main.js`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `DATOS_AVISOS`, `DATOS_EVENTOS`, `DATOS_HORARIO` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Panel Admin - Nucleo main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._
- **Should `Datos Curriculares del Sitio` be split into smaller, more focused modules?**
  _Cohesion score 0.050505050505050504 - nodes in this community are weakly interconnected._
- **Should `Panel Admin - Evaluacion` be split into smaller, more focused modules?**
  _Cohesion score 0.0797979797979798 - nodes in this community are weakly interconnected._
# 📘 Guía del Alumno — Estructura y Contenido

> **Página:** `/guia.html` · **Formato:** asistente paso a paso (wizard) + versión PDF descargable
> **Estado:** implementado y en producción (13 pasos) — commit `f069436`

---

## 🧩 1. Cómo funciona la interfaz (especificación)

### Navegación del asistente
- **Indicador de progreso:** pastilla "Paso X de 13" + barra de progreso (`.barra-progreso` ya existente en `style.css`).
- **Botones:** `← Anterior` / `Siguiente →`. En el paso 13, `Siguiente` cambia a `Finalizar ✅`.
- **Selector de pasos (stepper):** fila de 13 números clicables en la parte superior, para saltar directo a cualquier paso.
- **Persistencia:** el paso actual se guarda en `localStorage` (`guiaAlumnoPasoActual`, mismo patrón que grupo/tema) para que si el alumno cierra el sitio y vuelve, retome donde se quedó. Enlace visible "🔄 Reiniciar guía desde el paso 1".
- **Bienvenida y Cierre:** son pantallas propias, fuera de la numeración 1-13 (como portada y contraportada).

### Vista alternativa (accesibilidad + PDF)
- Enlace fijo arriba: **"📄 Ver guía completa en una sola página"**. Muestra los 13 pasos + bienvenida + cierre uno debajo del otro, sin botones de navegación — resuelve accesibilidad (scroll en vez de clics) y es la vista que alimenta el botón **"⬇️ Descargar guía en PDF"** (`@media print` oculta sidebar/botones, mismo enfoque que `progreso.html`).

---

## 🧭 2. Integración en la navegación existente

El enlace a la Guía vive **dentro del flyout/sheet de Perfil**, justo después de "🧑‍🎓 Mi cuenta":

```
👤 Perfil
 ├── 📊 Mi progreso        → progreso.html
 ├── 🧑‍🎓 Mi cuenta          → cuenta.html
 └── 📖 Guía del alumno     → guia.html
```

Sin cambios respecto a la versión de 7 pasos: mismo ícono (📖), mismas 9 páginas con `flyout-perfil`/`sheet-perfil`, mismo lugar en `sitemap.html`.

---

## 👋 Bienvenida (pantalla de portada, sin numerar)

> **Título:** ¡Bienvenido a Tecno10mixta! 🎓
>
> Esta es tu plataforma para la materia de **Educación Tecnológica**. Aquí vas a consultar tus temas, entregar tus trabajos y ver tu propio avance — todo en un solo lugar, sin depender de WhatsApp o Google Classroom.
>
> Esta guía te lleva paso a paso por todo lo que puedes hacer. Tómate 5 minutos la primera vez — después la tendrás dominada.
>
> `[Botón: Comenzar →]`

---

## 1️⃣ Paso 1 de 13 — 🔑 Tu cuenta

**¿Por qué importa?** Tu cuenta es lo que conecta todo tu trabajo contigo. Sin ella, el sitio no sabe quién eres ni puede guardar tu progreso.

**Así se hace:**
1. Ve a la sección "Mi cuenta" (ícono de perfil en la barra lateral, o botón "Perfil" en la barra inferior si usas celular).
2. En la pestaña "Crear cuenta", ingresa: tu código de invitación (formato `XXXX-XXXX-XXXX`), un correo, y una contraseña.
3. Si ya creaste tu cuenta antes, usa la pestaña "Iniciar sesión".
4. Ya dentro, el ícono de perfil cambia a un círculo con tu inicial — eso confirma que tu sesión está activa.

**Ejemplo típico:** Entregaste tu tarea desde la computadora del taller el lunes. El martes revisas tu progreso desde tu celular en casa — como iniciaste sesión con tu cuenta, tu progreso te sigue a cualquier dispositivo.

`[Captura: assets/guia/paso1-cuenta.png]`

---

## 2️⃣ Paso 2 de 13 — 🔓 ¿Olvidaste tu contraseña?

**¿Por qué importa?** No necesitas pedirle a tu profesor un código nuevo solo porque olvidaste tu contraseña — se recupera tú mismo en un minuto.

**Así se hace:**
1. En "Mi cuenta", toca la pestaña "Recuperar contraseña".
2. Escribe el mismo correo con el que creaste tu cuenta.
3. Revisa tu bandeja de entrada (y spam) — llega un enlace para crear una nueva contraseña.
4. Sigue el enlace, define tu nueva contraseña y vuelve a iniciar sesión.

**Ejemplo típico:** Llevas semanas sin entrar y ya no recuerdas tu contraseña. Usas "Recuperar contraseña" con tu correo de siempre en vez de crear una cuenta nueva (que perdería tu progreso).

`[Captura: assets/guia/paso2-recuperar-contrasena.png]`

---

## 3️⃣ Paso 3 de 13 — 🧭 Cómo moverte por el sitio

**¿Por qué importa?** El sitio tiene bastante contenido (3 trimestres, cada uno con varias secciones), así que conocer el mapa te ahorra tiempo.

**Así se hace:**
1. La barra lateral es tu punto de partida en computadora: Inicio, tu Trimestre actual, FAQ, Para Padres.
2. El selector de Grupo (3°C / 3°E), dentro de Ajustes, filtra el contenido para que veas solo lo que aplica a tu grupo.
3. El botón "Elegir tema" abre un selector con temas — pasa el mouse o el foco sobre cada uno para verlo en vivo. Tu elección se guarda sola.
4. En celular, la barra inferior (Inicio, Trimestre, FAQ, Para Padres, Perfil) te lleva directo a lo más usado.
5. Cuando cambias algo (tema, tamaño de texto, tu grupo), aparece un mensaje breve confirmando el cambio.

**Ejemplo típico:** Ves que tu compañero de 3°C tiene una fecha de entrega distinta a la tuya en 3°E para la misma actividad — cada grupo puede tener su propio calendario.

`[Captura: assets/guia/paso3-navegacion.png]`

---

## 4️⃣ Paso 4 de 13 — 🔤 Ajusta el tamaño de texto

**¿Por qué importa?** Si te cuesta leer letra pequeña, puedes agrandarla sin depender del zoom del navegador.

**Así se hace:**
1. En Ajustes, junto al botón de tema, encuentras el control A- / A+.
2. Tiene 3 niveles: normal, grande, muy grande.
3. Tu elección se guarda sola y se aplica en todas las páginas.

**Ejemplo típico:** Estás en la computadora del taller y el texto se ve pequeño. Tocas A+ dos veces y todo el sitio se ve más grande de ahí en adelante.

`[Captura: assets/guia/paso4-tamano-texto.png]`

---

## 5️⃣ Paso 5 de 13 — 📚 Contenido de tu Trimestre

**¿Por qué importa?** Aquí está todo el material para aprender antes de que te evalúen.

**Así se hace:**
- **Temario:** los temas de cada secuencia. Toca "Ver más" para ver qué vas a aprender, por qué importa, y un dato curioso.
- **Infografías:** resumen visual de cada secuencia — toca una para verla en grande.
- **Presentaciones:** diapositivas de apoyo, por si quieres repasar.
- **Videos:** material audiovisual corto para dudas puntuales.

**Ejemplo típico:** No entendiste bien un tema en clase. Antes de preguntar, revisas su infografía y su video — muchas veces con eso se resuelve la duda.

`[Captura: assets/guia/paso5-contenido-trimestre.png]`

---

## 6️⃣ Paso 6 de 13 — 📋 Rúbricas y trimestres bloqueados

**¿Por qué importa?** Saber cómo te van a calificar antes de entregar, y entender por qué a veces no puedes ver el trimestre siguiente todavía.

**Así se hace:**
1. Toca una rúbrica para desplegarla y ver los niveles (Excelente / Bueno / Regular / Deficiente) y sus puntos.
2. En "Elige tu trimestre" (portada), cada tarjeta muestra su estado: Actual, Finalizado, o 🔒 Próximamente.

**Ejemplo típico:** Antes de entregar tu proyecto integrador, ves que "Excelente" pide una conclusión — la agregas antes de entregar, en vez de enterarte hasta que ya te calificaron.

`[Captura: assets/guia/paso6-rubricas-bloqueo.png]`

---

## 7️⃣ Paso 7 de 13 — 🏆 Retos de grupo

**¿Por qué importa?** Cada trimestre hay un reto especial que se resuelve entre todo el grupo, en persona con tu profesor.

**Así se hace:**
1. En "🏆 Aplica tus conocimientos" de tu trimestre, ves el planteamiento de un reto de 3 partes.
2. El sitio solo muestra el planteamiento, nunca la respuesta.
3. Si todo el grupo lo resuelve correctamente, tu profesor desbloquea 3 temas visuales nuevos para todos.

**Ejemplo típico:** Tu grupo resuelve el reto del Trimestre 1 en clase. Unos días después, ves un aviso de "¡Nuevo tema desbloqueado!" la próxima vez que entras al sitio.

`[Captura: assets/guia/paso7-retos-grupo.png]`

---

## 8️⃣ Paso 8 de 13 — 🎨 Temas de recompensa

**¿Por qué importa?** No todos los temas están disponibles desde el inicio — algunos se ganan como grupo.

**Así se hace:**
1. Al abrir el selector de temas, verás "⭐ Destacados" (siempre disponibles) y "🔒 Más temas" (bloqueados hasta que tu grupo los desbloquee con un reto).
2. Un tema bloqueado muestra 🔒 y en qué trimestre se desbloquea.
3. Cuando tu grupo desbloquea uno, aparece una celebración 🎉 la próxima vez que entras.

**Ejemplo típico:** Ves un tema con candado que dice "Se desbloquea en Trimestre 2" — no es un error, tu grupo aún no ha resuelto ese reto.

`[Captura: assets/guia/paso8-temas-recompensa.png]`

---

## 9️⃣ Paso 9 de 13 — 📤 Cómo entregar tus trabajos

**¿Por qué importa?** La entrega real siempre es por el formulario de Google — no existe un botón de "marcar como entregado" dentro del sitio.

**Así se hace:**
1. Asegúrate de tener sesión iniciada (Paso 1).
2. Revisa que tu archivo esté en PDF, Word, Excel, PowerPoint, o una foto bien iluminada de tu cuaderno (si tu profesor lo indicó).
3. Toca "Abrir formulario de entrega" — se abre en una pestaña nueva.
4. Llena tu Grupo, tu Número de Lista, y elige exactamente qué estás entregando.
5. Envía el formulario. En un par de minutos, tu progreso cambiará solo a 🟢 Entregado.

**Ejemplo típico:** Entregaste hace 10 minutos pero tu progreso sigue en 🟡 Pendiente. No vuelvas a entregar por si acaso — a veces tarda un poco más.

`[Captura: assets/guia/paso9-entrega.png]`

---

## 🔟 Paso 10 de 13 — 📊 Tu Progreso

**¿Por qué importa?** Aquí ves qué llevas entregado y qué te falta, y vas ganando reconocimientos por tu constancia.

**Así se hace — qué significa cada ícono:**
- 🟢 Entregado — tu entrega quedó registrada correctamente.
- 🟡 Pendiente — aún no entregas, pero todavía estás a tiempo.
- 🔒 Vencido sin entregar — ya pasó la fecha límite, pero aún puedes entregar tarde (calificación reducida a la mitad).
- 🔑 Inicia sesión — no hay sesión activa en este dispositivo.

**Y también vas desbloqueando:**
- Nivel (según tu % de avance): Nivel 1 Explorador Tecnológico → Nivel 2 Analista de Datos (50%+) → Nivel 3 Creador Digital (75%+).
- 🔥 Racha de puntualidad: se desbloquea al llevar 3 entregas seguidas a tiempo.

**Ejemplo típico:** Llevas 2 entregas seguidas a tiempo — te falta solo una más para desbloquear tu racha 🔥.

`[Captura: assets/guia/paso10-progreso.png]`

---

## 1️⃣1️⃣ Paso 11 de 13 — 📋 Tu asistencia

**¿Por qué importa?** Además de tus entregas, tu asistencia también se registra y puedes consultarla tú mismo.

**Así se hace:**
1. En "Mi progreso", ves un resumen con tus Presentes, Faltas, Retardos y Justificadas del **trimestre activo** (no necesariamente el que estás viendo — la tarjeta siempre lee de `trimestre_desbloqueado`).
2. También llevas una racha 🎯 de asistencia: se desbloquea al llevar 3 clases seguidas presente. Una falta o un retardo la reinicia.

**Ejemplo típico:** Llevas 2 clases seguidas de asistencia perfecta — te falta solo una más para desbloquear tu racha 🎯.

`[Captura: assets/guia/paso11-asistencia.png]`

---

## 1️⃣2️⃣ Paso 12 de 13 — 📢 Avisos y Calendario

**¿Por qué importa?** Aquí se anuncian cambios de fecha, recordatorios y días sin clases.

**Así se hace:**
1. Revisa la sección Avisos en la portada; los de prioridad "Urgente" (magenta) van primero.
2. Consulta el Calendario para ver fechas de evaluación, entregas próximas, y suspensiones de clases por CTE.

**Ejemplo típico:** Ves en el calendario un día marcado como "CTE" — significa que ese día no hay clases, no que tengas una entrega pendiente.

`[Captura: assets/guia/paso12-avisos.png]`

---

## 1️⃣3️⃣ Paso 13 de 13 — ❓ ¿Algo no funciona o tienes dudas?

**¿Por qué importa?** La mayoría de las dudas comunes ya están resueltas antes de que necesites preguntar en clase.

**Así se hace:**
1. Revisa primero la página ❓ FAQ — cubre entrega, calificación, uso del sitio y privacidad.
2. Si tu duda es más personal, usa el formulario de "Contacto" en la portada.

**Ejemplo típico:** No estás seguro de si tu progreso ya se actualizó. Revisas la FAQ y encuentras la respuesta: puede tardar un par de minutos.

`[Captura: assets/guia/paso13-faq.png]`

---

## 🎉 Cierre (pantalla final, sin numerar)

> **Título:** ¡Listo, ya conoces todo el sitio! 🎉
>
> Ya sabes cómo entrar, consultar tu trimestre, entregar tus trabajos y revisar tu progreso. Vuelve a esta guía cuando la necesites — siempre está disponible desde el menú de Perfil.
>
> `[Botón: ⬇️ Descargar esta guía en PDF]`
> `[Botón secundario: 🏠 Ir al inicio del sitio]`
> `[Enlace: 🔄 Ver la guía completa en una sola página]`

---

## 📸 Rutas de imagen — estado actual

| Paso | Ruta del archivo | Estado |
|---|---|---|
| 1 — Tu cuenta | `assets/guia/paso1-cuenta.png` | subida |
| 2 — Recuperar contraseña | `assets/guia/paso2-recuperar-contrasena.png` | pendiente |
| 3 — Navegación | `assets/guia/paso3-navegacion.png` | pendiente |
| 4 — Tamaño de texto | `assets/guia/paso4-tamano-texto.png` | pendiente |
| 5 — Contenido del Trimestre | `assets/guia/paso5-contenido-trimestre.png` | pendiente |
| 6 — Rúbricas y bloqueo | `assets/guia/paso6-rubricas-bloqueo.png` | pendiente |
| 7 — Retos de grupo | `assets/guia/paso7-retos-grupo.png` | pendiente |
| 8 — Temas de recompensa | `assets/guia/paso8-temas-recompensa.png` | pendiente |
| 9 — Entrega de trabajos | `assets/guia/paso9-entrega.png` | pendiente |
| 10 — Tu Progreso | `assets/guia/paso10-progreso.png` | pendiente |
| 11 — Asistencia | `assets/guia/paso11-asistencia.png` | tomada, lista para subir |
| 12 — Avisos y Calendario | `assets/guia/paso12-avisos.png` | pendiente |
| 13 — Dudas (FAQ) | `assets/guia/paso13-faq.png` | pendiente |

Actualiza la columna "Estado" conforme subas cada captura. Una vez que todas digan "subida", el siguiente paso es convertirlas a `.webp` (misma resolución, menor peso — mismo tratamiento que `assets/infografias/*.webp`).

---

## ✅ Historial de cambios

- **Sesión original (7 pasos):** contenido cerrado, implementado en su momento.
- **Ampliación a 13 pasos (commit `f069436`):** se agregaron los pasos 2 (Recuperar contraseña), 4 (Tamaño de texto), 7 (Retos de grupo), 8 (Temas de recompensa) y 11 (Asistencia); se dividió el viejo Paso 3 en los actuales Paso 5 (Contenido del Trimestre) y Paso 6 (Rúbricas y trimestres bloqueados). `GUIA_TOTAL_PASOS` en `js/main.js` pasó de 7 a 13. Sin cambios de CSS.
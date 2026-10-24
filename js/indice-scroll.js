/* =========================================================
   ÍNDICE DE SECCIONES CON EFECTO DE SCROLL
   (index.html, trimestre-1.html, trimestre-2.html, trimestre-3.html)

   Cada título del índice se parte en letras sueltas que viajan como un
   tren rígido (cada letra detrás de la del frente según su posición en
   la palabra) conforme se hace scroll:
     1. Esperando: pila chica (14px) abajo a la derecha, encima del botón
        "Volver arriba", RECORRIDO_HORIZONTAL px a la izquierda del giro.
     2. Viajando: en cuanto el borde superior de la sección entra por
        abajo del viewport, la palabra avanza hacia la derecha, dobla la
        esquina (0° → -90°) y sube por el riel derecho hasta la y de su
        fila, sin pasarla.
     3. Abatimiento: la columna gira de -90° a 0° como un bloque, con
        pivote en la letra del frente, mientras crece a 28px y se desliza
        a su x final. La palabra queda en orden y nunca sube de su fila.
     4. Actual: llega cuando el borde de su sección está en BORDE_LLEGADA.
     5. Pasada: durante el abatimiento de la siguiente se encoge a 14px y
        se queda como una fila chica arriba.
   Un solo progreso por entrada (0 cuando la sección asoma por abajo, 1
   con su borde en BORDE_LLEGADA) reparte todo el camino: es función
   directa de scrollY, así que el scroll hacia arriba lo deshace igual.

   Solo se activa con ≥1440px, puntero fino y sin prefers-reduced-motion
   (ver CONSULTA_ACTIVACION). Fuera de eso no se crea nada en el DOM y la
   navegación queda como antes (flyouts del riel / sheets móviles).

   Las letras viven en una capa aria-hidden; el índice accesible es un
   <nav> real con un <a href="#id"> por sección, cuya caja se recoloca
   cada frame encima de las letras de su palabra.
   ========================================================= */
(function () {
  "use strict";

  const CONSULTA_ACTIVACION =
    "(min-width: 1440px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

  const ANCHO_RIEL = 56; // igual que el padding-right de body.indice-scroll-activo
  const TAMANO_GRANDE = 28; // font-size real de cada letra (ver .indice-scroll__palabra)
  const ESCALA_CHICA = 14 / TAMANO_GRANDE;
  const ALTO_FILA = 20; // fila de 14px + aire, tanto en la pila de abajo como en la de arriba
  const SEPARACION_BORDE = 16; // aire entre el final de cada palabra y el riel
  const AIRE_TOPE = 12; // aire bajo la franja Demo / barra de lectura
  const AIRE_FAB = 16; // aire sobre el botón "Volver arriba"
  const RECORRIDO_HORIZONTAL = 120; // distancia de la pila de espera al inicio del giro
  const RADIO_GIRO = 38; // cuarto de círculo de ~60px de recorrido
  const LARGO_GIRO = (Math.PI / 2) * RADIO_GIRO;
  const LARGO_ABATIMIENTO = 100; // cuánto camino "cuesta" el abatimiento final
  const BORDE_LLEGADA = 24; // la sección queda "actual" con su borde a 24px del tope
  const SEPARACION_FINAL_PAGINA = 120; // ver comprimirFinalDePagina()
  const ALTO_MIN_ENLACE = 24; // WCAG 2.5.8: zona de clic mínima de 24px

  const consulta = window.matchMedia(CONSULTA_ACTIVACION);
  const main = document.getElementById("main-content");
  if (!main) return;

  let raiz = null;
  let capaLetras = null;
  let nav = null;
  let velo = null;
  let veloAbajo = null;
  let regla = null;
  let digitos = [];
  let ultimoPorcentaje = -1;
  let entradas = [];
  let indiceActual = -1;
  let framePendiente = false;
  let medidas = null;
  let observadorTamano = null;
  let observadorHidden = null;
  let observadorBody = null;
  let observadorTema = null;

  /* ---------- Entradas (secciones del índice) ---------- */

  // Si la página marca secciones con data-indice, solo entran esas (la
  // portada lo usa para dejar fuera el hero y las celdas bento, que están
  // lado a lado y viajarían todas a la vez). Si ninguna lo tiene, entran
  // todas las <section> hijas directas de <main>.
  function obtenerSecciones() {
    const marcadas = main.querySelectorAll("section[data-indice]");
    const candidatas = marcadas.length > 0
      ? Array.from(marcadas)
      : Array.from(main.querySelectorAll(":scope > section"));
    return candidatas.filter((seccion) => seccion.id && !seccion.hidden);
  }

  function textoDeSeccion(seccion) {
    const corto = seccion.dataset.indice?.trim();
    if (corto) return corto;
    const titulo = seccion.querySelector("h2")?.textContent ?? seccion.id;
    // Los emojis de algunos <h2> (🎨, 📋) no se pueden girar letra por letra
    return titulo.replace(/\p{Extended_Pictographic}/gu, "").trim();
  }

  // Por grafema y no con split(""): "Infografías" escrito con acento
  // combinado (í = i + ◌́) se rompería en dos "letras" con split.
  function partirEnLetras(texto) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmentador = new Intl.Segmenter("es", { granularity: "grapheme" });
      return Array.from(segmentador.segment(texto), (parte) => parte.segment);
    }
    return Array.from(texto);
  }

  function construir() {
    capaLetras.replaceChildren();
    nav.replaceChildren();
    indiceActual = -1;

    entradas = obtenerSecciones().map((seccion) => {
      const texto = textoDeSeccion(seccion);

      const palabra = document.createElement("div");
      palabra.className = "indice-scroll__palabra";
      const letras = partirEnLetras(texto).map((caracter) => {
        const span = document.createElement("span");
        span.className = "indice-scroll__letra";
        span.textContent = caracter;
        palabra.appendChild(span);
        return { span, ancho: 0, centro: 0 };
      });
      capaLetras.appendChild(palabra);

      const enlace = document.createElement("a");
      enlace.className = "indice-scroll__enlace";
      enlace.href = "#" + seccion.id;
      enlace.textContent = texto;

      const entrada = { seccion, palabra, letras, enlace, largo: 0, inicio: 0, progreso: 0, abatimiento: 0 };

      enlace.addEventListener("click", (evento) => irASeccion(evento, entrada));
      // Mismo resaltado que .migas-de-pan a:hover/:focus-visible, aplicado
      // a las letras (el <a> en sí es una caja transparente encima).
      const resaltar = (activo) => palabra.classList.toggle("indice-scroll__palabra--resaltada", activo);
      enlace.addEventListener("pointerenter", () => resaltar(true));
      enlace.addEventListener("pointerleave", () => resaltar(document.activeElement === enlace));
      enlace.addEventListener("focus", () => resaltar(enlace.matches(":focus-visible") || enlace.matches(":hover")));
      enlace.addEventListener("blur", () => resaltar(enlace.matches(":hover")));

      nav.appendChild(enlace);
      return entrada;
    });

    medirLetras();
    medir();
    dibujar();
  }

  /* ---------- Medidas (en caché; dibujar() no lee el layout) ---------- */

  // Ancho real de cada letra a 28px. Se quitan todas las transformaciones
  // primero y se lee después, para no forzar un layout por letra.
  function medirLetras() {
    entradas.forEach((entrada) => entrada.letras.forEach((letra) => { letra.span.style.transform = "none"; }));
    entradas.forEach((entrada) => {
      let acumulado = 0;
      entrada.letras.forEach((letra) => {
        letra.ancho = letra.span.getBoundingClientRect().width;
        letra.centro = acumulado + letra.ancho / 2;
        acumulado += letra.ancho;
      });
      entrada.largo = acumulado;
    });
  }

  // Borde inferior real de lo que esté fijo arriba (franja Modo Demo,
  // barra de progreso de lectura): la fila superior empieza debajo.
  function medirTope() {
    let tope = 0;
    const fijosArriba = [
      document.body.classList.contains("modo-demo-toast-visible") ? document.getElementById("toast-modo-demo") : null,
      document.querySelector(".barra-progreso-lectura"),
    ];
    fijosArriba.forEach((elemento) => {
      if (!elemento || elemento.hidden) return;
      const caja = elemento.getBoundingClientRect();
      if (caja.height > 0) tope = Math.max(tope, caja.bottom);
    });
    return tope + AIRE_TOPE;
  }

  // Con el estilo calculado y no con su caja: abajo de los 400px de scroll
  // el botón está oculto (sin caja) y la pila no debe brincar cuando
  // aparece. bottom/height siguen resolviéndose aunque no se dibuje.
  function medirPieEspera(alto) {
    const fab = document.getElementById("boton-volver-arriba");
    if (!fab) return alto - AIRE_FAB;
    const estilo = getComputedStyle(fab);
    const ocupado = parseFloat(estilo.bottom) + parseFloat(estilo.height);
    return Number.isFinite(ocupado) ? alto - ocupado - AIRE_FAB : alto - AIRE_FAB;
  }

  function medir() {
    if (!raiz) return;
    // clientWidth y no innerWidth: position:fixed + right:0 se mide sin la
    // barra de scroll, igual que la capa (inset: 0).
    const ancho = document.documentElement.clientWidth;
    const alto = window.innerHeight;
    const tope = medirTope();
    const pieEspera = medirPieEspera(alto);
    const total = entradas.length;

    entradas.forEach((entrada, k) => {
      entrada.inicioReal = entrada.seccion.getBoundingClientRect().top + window.scrollY;
      entrada.filaEspera = pieEspera - (total - 1 - k) * ALTO_FILA - ALTO_FILA / 2;
      // Largo del camino de la letra del frente: horizontal + giro + subida
      // hasta la y de su fila (a tamaño grande) + abatimiento.
      const yFila = tope + k * ALTO_FILA + TAMANO_GRANDE / 2;
      const subida = Math.max(0, entrada.filaEspera - RADIO_GIRO - yFila);
      entrada.inicioAbatimiento = RECORRIDO_HORIZONTAL + LARGO_GIRO + subida;
      entrada.largoCamino = entrada.inicioAbatimiento + LARGO_ABATIMIENTO;
      entrada.centroFrente = entrada.letras[entrada.letras.length - 1]?.centro ?? 0;
    });
    const scrollMaximo = document.documentElement.scrollHeight - alto;
    comprimirFinalDePagina(scrollMaximo);
    // La primera sección de los trimestres empieza ~110px abajo del tope:
    // en scroll 0 quedaría a medio abatir, con las letras en diagonal. Si
    // al cargar ya estaría dentro del abatimiento, cuenta como llegada
    // (las migas de pan también la marcan como actual desde el inicio).
    entradas.forEach((entrada) => {
      const bordeSinAbatir = alto - (alto - BORDE_LLEGADA) * (entrada.inicioAbatimiento / entrada.largoCamino);
      if (entrada.inicio < bordeSinAbatir) entrada.inicio = Math.min(entrada.inicio, BORDE_LLEGADA);
    });

    medidas = {
      alto,
      tope,
      scrollMaximo,
      xDerecha: ancho - ANCHO_RIEL - SEPARACION_BORDE,
      xRiel: ancho - ANCHO_RIEL / 2,
    };

    const masLarga = entradas.reduce((maximo, entrada) => Math.max(maximo, entrada.largo), 0);
    velo.style.width = masLarga + SEPARACION_BORDE + ANCHO_RIEL + 48 + "px";
    velo.style.height = tope + total * ALTO_FILA + TAMANO_GRANDE + 32 + "px";
    // Abajo: cubre la pila de espera, desde el borde del riel hasta la
    // palabra más larga, y de la fila de arriba de la pila al fondo.
    veloAbajo.style.width = RADIO_GIRO + RECORRIDO_HORIZONTAL + masLarga * ESCALA_CHICA + 48 + "px";
    veloAbajo.style.height = alto - (pieEspera - total * ALTO_FILA) + 32 + "px";
  }

  // Las últimas secciones (Videos, Contacto) muchas veces no pueden subir
  // hasta el tope porque la página se acaba antes. Se adelanta su punto de
  // llegada para que, al final del scroll, todas hayan llegado en orden y
  // la última quede como actual — mismo criterio que el resaltado del menú
  // en activarResaltadoDeNavegacion() de js/main.js, que también marca la
  // última sección visible.
  function comprimirFinalDePagina(scrollMaximo) {
    for (let k = entradas.length - 1; k >= 0; k--) {
      const entrada = entradas[k];
      const limite = scrollMaximo + BORDE_LLEGADA - (entradas.length - 1 - k) * SEPARACION_FINAL_PAGINA;
      entrada.inicio = Math.min(entrada.inicioReal, limite);
      const siguiente = entradas[k + 1];
      if (siguiente) entrada.inicio = Math.min(entrada.inicio, siguiente.inicio - SEPARACION_FINAL_PAGINA);
    }
  }

  /* ---------- Dibujo (un frame por evento de scroll) ---------- */

  const limitar01 = (valor) => Math.min(1, Math.max(0, valor));
  const mezclar = (desde, hasta, t) => desde + (hasta - desde) * t;

  // Posición de una letra sobre el camino en "L". d = 0 es la pila de
  // espera (d < 0: letras de atrás, todavía más a la izquierda); luego el
  // tramo horizontal, el cuarto de círculo y la subida por el riel, que
  // se detiene en yTope (la fila destino).
  function puntoDelCamino(d, fila, yTope) {
    const xGiro = medidas.xRiel - RADIO_GIRO;
    const p = d - RECORRIDO_HORIZONTAL;
    if (p <= 0) return { x: xGiro + p, y: fila, giro: 0 };
    if (p <= LARGO_GIRO) {
      const angulo = p / RADIO_GIRO;
      return {
        x: xGiro + RADIO_GIRO * Math.sin(angulo),
        y: fila - RADIO_GIRO + RADIO_GIRO * Math.cos(angulo),
        giro: -angulo * (180 / Math.PI),
      };
    }
    return { x: medidas.xRiel, y: Math.max(yTope, fila - RADIO_GIRO - (p - LARGO_GIRO)), giro: -90 };
  }

  function dibujar() {
    framePendiente = false;
    if (!raiz || !medidas) return;
    const scroll = window.scrollY;
    const { alto, tope, xDerecha, xRiel } = medidas;

    // Primera pasada: progreso de cada entrada (0 cuando su sección asoma
    // por abajo, 1 con su borde en BORDE_LLEGADA) y cuánto lleva de
    // abatimiento. Hace falta antes de dibujar porque el abatimiento de la
    // siguiente encoge a la actual.
    entradas.forEach((entrada) => {
      const bordeSeccion = entrada.inicio - scroll;
      entrada.progreso = limitar01((alto - bordeSeccion) / (alto - BORDE_LLEGADA));
      entrada.recorrido = entrada.progreso * entrada.largoCamino;
      entrada.abatimiento = limitar01((entrada.recorrido - entrada.inicioAbatimiento) / LARGO_ABATIMIENTO);
    });

    let nuevoActual = -1;
    entradas.forEach((entrada, k) => {
      if (entrada.progreso >= 1) nuevoActual = k;

      const encogido = entradas[k + 1]?.abatimiento ?? 0;
      const escalaFinal = mezclar(1, ESCALA_CHICA, encogido);
      const yFinal = tope + k * ALTO_FILA + (TAMANO_GRANDE * escalaFinal) / 2;
      const q = entrada.abatimiento;
      const angulo = q * (Math.PI / 2);
      const escalaAbatida = mezclar(ESCALA_CHICA, escalaFinal, q);
      // El pivote es la letra del frente: sale del riel y se desliza hasta
      // su x final sobre la misma fila.
      const xPivote = mezclar(xRiel, xDerecha - (entrada.largo - entrada.centroFrente) * escalaFinal, q);
      const n = entrada.letras.length;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      entrada.letras.forEach((letra) => {
        // Tren rígido: cada letra va detrás de la del frente tanto como
        // la separan sus centros en la palabra, así conserva orden y
        // espaciado.
        const atras = entrada.centroFrente - letra.centro;
        let x, y, giro, escala;
        if (q <= 0) {
          const punto = puntoDelCamino(entrada.recorrido - atras * ESCALA_CHICA, entrada.filaEspera, yFinal);
          ({ x, y, giro } = punto);
          escala = ESCALA_CHICA;
        } else {
          // Abatimiento: la columna (letras debajo del pivote) gira 90° en
          // sentido horario hasta quedar a su izquierda. Ningún punto
          // queda arriba del pivote, que ya está en yFinal.
          const separacion = atras * escalaAbatida;
          x = xPivote - separacion * Math.sin(angulo);
          y = yFinal + separacion * Math.cos(angulo);
          giro = -90 * (1 - q);
          escala = escalaAbatida;
        }

        letra.span.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${giro.toFixed(2)}deg) scale(${escala.toFixed(4)})`;

        // Caja aproximada de la letra girada, para la zona de clic del <a>
        const vertical = Math.abs(giro) / 90;
        const medioAncho = mezclar(letra.ancho, TAMANO_GRANDE, vertical) * escala / 2;
        const medioAlto = mezclar(TAMANO_GRANDE, letra.ancho, vertical) * escala / 2;
        minX = Math.min(minX, x - medioAncho);
        maxX = Math.max(maxX, x + medioAncho);
        minY = Math.min(minY, y - medioAlto);
        maxY = Math.max(maxY, y + medioAlto);
      });

      if (n > 0) colocarEnlace(entrada.enlace, minX, maxX, minY, maxY);
      const enEspera = entrada.progreso <= 0;
      if (enEspera !== entrada.enEspera) {
        entrada.enEspera = enEspera;
        entrada.enlace.classList.toggle("indice-scroll__enlace--espera", enEspera);
      }
    });

    if (nuevoActual !== indiceActual) marcarActual(nuevoActual);
    velo.style.opacity = entradas[0] ? entradas[0].abatimiento.toFixed(3) : "0";
    const ultima = entradas[entradas.length - 1];
    veloAbajo.style.opacity = ultima ? (1 - ultima.progreso).toFixed(3) : "0";
    dibujarRegla(scroll);
  }

  // Marcas: el mosaico de la regla mide 300px (ver .indice-scroll__regla),
  // así que basta desplazarlo el residuo para que suba 1:1 con el scroll.
  // Contador: solo se tocan los dígitos cuando cambia el porcentaje, para
  // no reiniciar su transition en cada frame.
  function dibujarRegla(scroll) {
    regla.style.setProperty("--regla-offset", -(scroll % 300) + "px");

    const { scrollMaximo } = medidas;
    const porcentaje = scrollMaximo > 0 ? Math.round(limitar01(scroll / scrollMaximo) * 100) : 0;
    if (porcentaje === ultimoPorcentaje) return;
    ultimoPorcentaje = porcentaje;

    const cifras = String(porcentaje).padStart(digitos.length, "0");
    digitos.forEach((digito, i) => {
      // Ceros a la izquierda ocultos ("7%", no "007%"); la unidad siempre se ve
      const oculto = i < digitos.length - 1 && cifras.slice(0, i + 1).split("").every((c) => c === "0");
      digito.contenedor.classList.toggle("indice-scroll__digito--oculto", oculto);
      digito.columna.style.setProperty("--digito", cifras[i]);
    });
  }

  function crearContador() {
    const contador = document.createElement("div");
    contador.className = "indice-scroll__contador";
    digitos = [0, 1, 2].map(() => {
      const contenedor = document.createElement("span");
      contenedor.className = "indice-scroll__digito";
      const columna = document.createElement("span");
      columna.className = "indice-scroll__digito-columna";
      for (let n = 0; n <= 9; n++) {
        const cifra = document.createElement("span");
        cifra.textContent = String(n);
        columna.appendChild(cifra);
      }
      contenedor.appendChild(columna);
      contador.appendChild(contenedor);
      return { contenedor, columna };
    });
    const signo = document.createElement("span");
    signo.textContent = "%";
    contador.appendChild(signo);
    return contador;
  }

  function colocarEnlace(enlace, minX, maxX, minY, maxY) {
    const ancho = maxX - minX + 8;
    const alto = Math.max(ALTO_MIN_ENLACE, maxY - minY + 8);
    const centroY = (minY + maxY) / 2;
    enlace.style.width = ancho.toFixed(1) + "px";
    enlace.style.height = alto.toFixed(1) + "px";
    enlace.style.transform = `translate3d(${(minX - 4).toFixed(2)}px, ${(centroY - alto / 2).toFixed(2)}px, 0)`;
  }

  function marcarActual(nuevoActual) {
    indiceActual = nuevoActual;
    entradas.forEach((entrada, k) => {
      const esActual = k === nuevoActual;
      entrada.palabra.classList.toggle("indice-scroll__palabra--actual", esActual);
      if (esActual) entrada.enlace.setAttribute("aria-current", "location");
      else entrada.enlace.removeAttribute("aria-current");
    });
  }

  // requestAnimationFrame evita recalcular en cada pixel de scroll: como
  // mucho se dibuja una vez por frame (mismo patrón que
  // activarBotonVolverArriba() en js/main.js).
  function programarDibujo() {
    if (framePendiente) return;
    framePendiente = true;
    window.requestAnimationFrame(dibujar);
  }

  function remedir() {
    if (!raiz) return;
    medir();
    programarDibujo();
  }

  function remedirLetras() {
    if (!raiz) return;
    medirLetras();
    remedir();
  }

  /* ---------- Navegación ---------- */

  function irASeccion(evento, entrada) {
    evento.preventDefault();
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    entrada.seccion.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
    history.pushState(null, "", "#" + entrada.seccion.id);
    // Mueve el foco a la sección (como haría un ancla nativa) para que el
    // siguiente Tab siga desde ahí y no desde el índice.
    if (!entrada.seccion.hasAttribute("tabindex")) entrada.seccion.setAttribute("tabindex", "-1");
    entrada.seccion.focus({ preventScroll: true });
  }

  /* ---------- Montaje / desmontaje según CONSULTA_ACTIVACION ---------- */

  function alCambiarHidden(mutaciones) {
    const afectaSecciones = mutaciones.some(
      (mutacion) => mutacion.target.tagName === "SECTION" && mutacion.target.parentElement === main
    );
    if (afectaSecciones) construir();
  }

  function alCambiarGrupo(evento) {
    if (!evento.target.matches?.(".selector-grupo-control")) return;
    // renderizarTodo() (main.js) redibuja el contenido de forma asíncrona;
    // el ResizeObserver recoge las alturas nuevas cuando terminen de llegar.
    window.requestAnimationFrame(() => { if (raiz) construir(); });
  }

  function montar() {
    if (raiz) return;

    raiz = document.createElement("div");
    raiz.className = "indice-scroll";

    const riel = document.createElement("div");
    riel.className = "indice-scroll__riel";
    riel.setAttribute("aria-hidden", "true");
    const fondoRiel = document.createElement("div");
    fondoRiel.className = "indice-scroll__riel-fondo";
    regla = document.createElement("div");
    regla.className = "indice-scroll__regla";
    riel.append(fondoRiel, regla, crearContador());

    velo = document.createElement("div");
    velo.className = "indice-scroll__velo";
    velo.setAttribute("aria-hidden", "true");
    veloAbajo = document.createElement("div");
    veloAbajo.className = "indice-scroll__velo indice-scroll__velo--abajo";
    veloAbajo.setAttribute("aria-hidden", "true");

    capaLetras = document.createElement("div");
    capaLetras.className = "indice-scroll__letras";
    capaLetras.setAttribute("aria-hidden", "true");

    nav = document.createElement("nav");
    nav.className = "indice-scroll__nav";
    nav.setAttribute("aria-label", "Índice de la página");

    raiz.append(riel, velo, veloAbajo, capaLetras, nav);
    // Antes de <main>: en el orden de Tab queda como una tabla de
    // contenido; el skip link ("Saltar al contenido") la salta igual.
    main.before(raiz);
    document.body.classList.add("indice-scroll-activo");

    construir();

    window.addEventListener("scroll", programarDibujo, { passive: true });
    window.addEventListener("resize", remedir);
    document.addEventListener("change", alCambiarGrupo);

    // body y no solo <main>: también cambia de alto cuando algo de arriba
    // de <main> se mueve (franja Demo, banner) o cuando Avisos/rúbricas
    // terminan de cargar.
    observadorTamano = new ResizeObserver(remedir);
    observadorTamano.observe(document.body);

    observadorHidden = new MutationObserver(alCambiarHidden);
    observadorHidden.observe(main, { attributes: true, attributeFilter: ["hidden"], subtree: true });

    // body.modo-demo-toast-visible: la franja Demo aparece/desaparece
    observadorBody = new MutationObserver(remedir);
    observadorBody.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // Cada tema puede traer otra --font-encabezados: hay que volver a medir
    // las letras cuando la fuente nueva termine de cargar.
    observadorTema = new MutationObserver(() => {
      window.requestAnimationFrame(() => document.fonts.ready.then(remedirLetras));
    });
    observadorTema.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    document.fonts.ready.then(remedirLetras);
  }

  function desmontar() {
    if (!raiz) return;
    window.removeEventListener("scroll", programarDibujo);
    window.removeEventListener("resize", remedir);
    document.removeEventListener("change", alCambiarGrupo);
    [observadorTamano, observadorHidden, observadorBody, observadorTema].forEach((observador) => observador?.disconnect());
    observadorTamano = observadorHidden = observadorBody = observadorTema = null;

    raiz.remove();
    raiz = capaLetras = nav = velo = veloAbajo = regla = null;
    digitos = [];
    ultimoPorcentaje = -1;
    entradas = [];
    medidas = null;
    indiceActual = -1;
    document.body.classList.remove("indice-scroll-activo");
  }

  function evaluar() {
    if (consulta.matches) montar();
    else desmontar();
  }

  consulta.addEventListener("change", evaluar);
  evaluar();
})();

/* ==========================================================================
   nico66fx PRO — muro de capturas + visor
   Tres piezas, separadas a propósito:

   1. DATOS   → los <li class="muro-item"> de index.html. Ahí y solo ahí
                vive la lista de testimonios: ruta .webp, ruta .jpg y alt.
                Añadir uno es copiar un <li>. Ni layout ni contadores ni
                este fichero se tocan.
   2. GALERÍA → la rejilla, en styles.css (.muro). CSS puro.
   3. VISOR   → lo de aquí abajo. Se rellena leyendo el muro, así que
                nunca puede desincronizarse de los datos.

   Sin dependencias. Si este fichero no carga, el muro sigue viéndose
   entero: son <img> normales dentro del HTML.
   ========================================================================== */
(() => {
    'use strict';

    const muro = document.getElementById('muro-testimonios');
    const visor = document.getElementById('visor-testimonios');
    if (!muro || !visor) return;

    const disparadores = [...muro.querySelectorAll('.muro-btn')];
    if (!disparadores.length) return;

    /* --- DATOS: se derivan del muro, no se declaran aquí ---
       En la rejilla se sirve una miniatura; el visor necesita la grande.
       Cuando la tarjeta trae data-visor-webp/jpg se usan esas; si no
       (las capturas verticales, que solo existen en un tamaño) se cae al
       src de la propia miniatura. */
    const capturas = disparadores.map((boton) => {
        const img = boton.querySelector('img');
        const fuente = boton.querySelector('source');
        const jpg = boton.dataset.visorJpg || img.getAttribute('src');
        return {
            jpg,
            webp: boton.dataset.visorWebp || fuente?.getAttribute('srcset') || jpg,
            alt: img.getAttribute('alt') || '',
            ancho: boton.dataset.visorW || ''
        };
    });

    /* La cifra que se anuncia es el número de capturas que hay. Se
       recalcula sola al añadir o quitar un <li>. */
    document.querySelectorAll('[data-muro-total], [data-visor-total]')
        .forEach((el) => { el.textContent = String(capturas.length); });

    const imagen = visor.querySelector('[data-visor-img]');
    const fuenteWebp = visor.querySelector('[data-visor-webp]');
    const pie = visor.querySelector('[data-visor-pie]');
    const indiceEl = visor.querySelector('[data-visor-indice]');
    const tiras = visor.querySelector('[data-visor-tiras]');

    let actual = 0;
    let focoPrevio = null;
    let temporizador = null;

    /* ---------------------------------------------------------------
       Tira de miniaturas — es lo que dice "hay más y vas por aquí".
       --------------------------------------------------------------- */
    const botonesTira = capturas.map((c, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'visor-tira';
        b.setAttribute('aria-label', `Ver captura ${i + 1} de ${capturas.length}`);
        const img = document.createElement('img');
        img.src = c.webp;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        b.appendChild(img);
        b.addEventListener('click', () => ir(i));
        tiras.appendChild(b);
        return b;
    });

    /* ---------------------------------------------------------------
       Pintar una captura
       --------------------------------------------------------------- */
    function precargar(i) {
        const c = capturas[(i + capturas.length) % capturas.length];
        if (c) new Image().src = c.webp;
    }

    function pintar(i, conFundido) {
        actual = (i + capturas.length) % capturas.length;
        const c = capturas[actual];

        const aplicar = () => {
            if (fuenteWebp) fuenteWebp.srcset = c.webp;
            imagen.removeAttribute('width');
            imagen.removeAttribute('height');
            imagen.src = c.jpg;
            imagen.alt = c.alt;
            // tope de ampliación = ancho real del archivo, para no interpolar
            visor.style.setProperty('--visor-ancho', (c.ancho || 440) + 'px');
            pie.textContent = c.alt;
            indiceEl.textContent = String(actual + 1);
            visor.classList.remove('cambiando');
        };

        clearTimeout(temporizador);
        if (conFundido) {
            visor.classList.add('cambiando');
            temporizador = setTimeout(aplicar, 130);
        } else {
            aplicar();
        }

        botonesTira.forEach((b, n) => {
            const activa = n === actual;
            b.setAttribute('aria-current', String(activa));
            if (activa) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        });

        precargar(actual + 1);
        precargar(actual - 1);
    }

    function ir(i) { pintar(i, true); }
    function mover(paso) { ir(actual + paso); }

    /* ---------------------------------------------------------------
       Abrir / cerrar
       --------------------------------------------------------------- */
    function anchoBarra() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    function abrir(i) {
        focoPrevio = document.activeElement;
        pintar(i, false);
        const compensa = anchoBarra();
        if (compensa > 0) document.body.style.paddingRight = compensa + 'px';
        document.body.classList.add('visor-abierto');
        visor.hidden = false;
        visor.querySelector('.visor-cerrar')?.focus({ preventScroll: true });
    }

    function cerrar() {
        clearTimeout(temporizador);
        visor.classList.remove('cambiando');
        visor.hidden = true;
        document.body.classList.remove('visor-abierto');
        document.body.style.paddingRight = '';
        focoPrevio?.focus?.({ preventScroll: true });
        focoPrevio = null;
    }

    const abierto = () => !visor.hidden;

    disparadores.forEach((boton, i) => {
        boton.addEventListener('click', () => abrir(i));
    });

    visor.querySelectorAll('[data-visor-cerrar]').forEach((el) => {
        el.addEventListener('click', cerrar);
    });
    visor.querySelectorAll('[data-visor-ir]').forEach((el) => {
        el.addEventListener('click', () => mover(parseInt(el.dataset.visorIr, 10)));
    });

    /* ---------------------------------------------------------------
       "Ver las N capturas" — solo hace falta en móvil, donde el muro
       completo son varias pantallas. El CSS decide cuándo se ve.
       --------------------------------------------------------------- */
    const botonMas = document.getElementById('muro-mas');
    botonMas?.addEventListener('click', () => {
        const abierto = muro.classList.toggle('muro--completo');
        botonMas.setAttribute('aria-expanded', String(abierto));
        botonMas.querySelector('.muro-mas-txt').innerHTML = abierto
            ? 'Ver menos'
            : `Ver las <strong>${capturas.length}</strong> capturas`;
    });

    /* ---------------------------------------------------------------
       Teclado: navegar, cerrar y no perder el foco fuera del visor
       --------------------------------------------------------------- */
    const FOCUSABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    document.addEventListener('keydown', (e) => {
        if (!abierto()) return;

        switch (e.key) {
            case 'Escape':      e.preventDefault(); cerrar(); return;
            case 'ArrowLeft':   e.preventDefault(); mover(-1); return;
            case 'ArrowRight':  e.preventDefault(); mover(1); return;
            case 'Home':        e.preventDefault(); ir(0); return;
            case 'End':         e.preventDefault(); ir(capturas.length - 1); return;
        }

        if (e.key !== 'Tab') return;
        const focos = [...visor.querySelectorAll(FOCUSABLES)].filter((el) => el.offsetParent !== null);
        if (!focos.length) return;
        const primero = focos[0];
        const ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
            e.preventDefault(); ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
            e.preventDefault(); primero.focus();
        } else if (!visor.contains(document.activeElement)) {
            e.preventDefault(); primero.focus();
        }
    });

    /* ---------------------------------------------------------------
       Gesto táctil: deslizar al lado para cambiar, hacia abajo para
       cerrar. El umbral vertical es alto para no cerrar sin querer.
       --------------------------------------------------------------- */
    let x0 = 0, y0 = 0, tocando = false;

    visor.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) { tocando = false; return; }
        tocando = true;
        x0 = e.touches[0].clientX;
        y0 = e.touches[0].clientY;
    }, { passive: true });

    visor.addEventListener('touchend', (e) => {
        if (!tocando) return;
        tocando = false;
        const t = e.changedTouches[0];
        const dx = t.clientX - x0;
        const dy = t.clientY - y0;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
            mover(dx < 0 ? 1 : -1);
        } else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.4) {
            cerrar();
        }
    }, { passive: true });
})();

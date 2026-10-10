/* ==========================================================================
   nico66fx PRO v2 · JS vanilla, sin librerías ni build.
   Cada módulo va aislado en su propio try/catch: un fallo en uno no debe
   parar el resto (cookies, barra inferior, acordeón...).
   ========================================================================== */
(function () {
    'use strict';

    var doc = document;
    var root = doc.documentElement;
    var mm = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener: function () {} }; };
    var movReducido = mm('(prefers-reduced-motion: reduce)');

    /* Marca de "hay JS". Distinta de .js (que exige IntersectionObserver):
       sin JavaScript el botón flotante de WhatsApp no se pinta, porque nada lo
       colocaría y taparía el hero; el pie ya lleva el enlace de WhatsApp. */
    root.classList.add('con-js');

    function seguro(nombre, fn) {
        try { fn(); } catch (err) {
            if (window.console && console.warn) console.warn('[pro-v2] ' + nombre + ':', err);
        }
    }

    /* Puente entre módulos: la barra inferior y el botón de WhatsApp necesitan
       saber cuánto mide el banner de cookies para colocarse encima. */
    var inferior = { actualizar: function () {} };

    /* ---------------------------------------------------------------
       1 · ?src= → client_reference_id de Stripe
       Los Payment Links aceptan client_reference_id en la URL y lo pasan a la
       Checkout Session y al webhook checkout.session.completed. Stripe DESCARTA
       EN SILENCIO los valores no válidos (solo admite A-Z a-z 0-9 - _ y hasta
       200 caracteres), así que se sanea aquí antes de enviarlo.
       Los utm_* no sirven en este caso: solo se reenvían a la URL de
       redirección y los dos Payment Links usan confirmación alojada por Stripe
       (hosted_confirmation), sin redirección, de modo que se perderían.
       Nunca se envía nada más que este identificador de origen.
       --------------------------------------------------------------- */
    seguro('src', function () {
        var CLAVE = 'nico66fx_src';
        var bruto = '';
        try { bruto = new URLSearchParams(window.location.search).get('src') || ''; } catch (e) { bruto = ''; }
        if (!bruto) {
            try { bruto = window.sessionStorage.getItem(CLAVE) || ''; } catch (e) { bruto = ''; }
        }
        var src = String(bruto).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 200);
        if (!src) return;
        try { window.sessionStorage.setItem(CLAVE, src); } catch (e) { /* sin storage: seguimos */ }
        doc.querySelectorAll('a[href^="https://buy.stripe.com/"]').forEach(function (a) {
            try {
                var u = new URL(a.href);
                u.searchParams.set('client_reference_id', src);
                a.href = u.toString();
            } catch (e) { /* enlace raro: se deja como está */ }
        });
    });

    /* ---------------------------------------------------------------
       2 · Entradas animadas una sola vez (tarjetas y embudo)
       La clase .js solo se pone si el observador existe: sin JS o sin
       IntersectionObserver, todo se ve desde el principio.
       --------------------------------------------------------------- */
    seguro('revelar', function () {
        if (!('IntersectionObserver' in window)) return;
        var grupos = Array.prototype.slice.call(doc.querySelectorAll('[data-revelar]'));
        var pendientes = grupos.length;
        var io = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('is-in');
                io.unobserve(e.target);
                pendientes -= 1;
                if (pendientes <= 0) io.disconnect();
            });
        }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
        grupos.forEach(function (g) { io.observe(g); });
        root.classList.add('js');
    });

    /* ---------------------------------------------------------------
       3 · Acordeón exclusivo: respaldo para navegadores sin <details name>
       Con soporte nativo no hace nada (las demás ya están cerradas).
       --------------------------------------------------------------- */
    seguro('acordeon', function () {
        doc.querySelectorAll('details[name]').forEach(function (d) {
            d.addEventListener('toggle', function () {
                if (!d.open) return;
                var nombre = d.getAttribute('name');
                doc.querySelectorAll('details[name]').forEach(function (otro) {
                    if (otro !== d && otro.open && otro.getAttribute('name') === nombre) otro.open = false;
                });
            });
        });
    });

    /* ---------------------------------------------------------------
       3b · Menú principal: desplegable «Robots» y panel móvil
       En el HTML son <details> nativos, así que sin JS se abren y se
       cierran solos y todos sus enlaces funcionan. Aquí cada <summary>
       pasa a ser un <button> con aria-expanded y aria-controls, y el
       panel queda como hijo directo de su contenedor (el CSS anima así
       la entrada y la salida). Escape cierra y devuelve el foco al botón;
       un clic fuera o en un enlace del panel cierra; con el panel móvil
       abierto, el fondo no se desplaza (clase .menu-abierto en <html>).
       --------------------------------------------------------------- */
    seguro('menu', function () {
        var menus = [];

        function preparar(caja) {
            var det = caja.querySelector('details');
            var sum = det && det.querySelector('summary');
            var panel = sum && sum.nextElementSibling;
            if (!sum || !panel || !panel.id) return null;

            var btn = doc.createElement('button');
            btn.type = 'button';
            btn.className = sum.className;
            btn.innerHTML = sum.innerHTML;
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', panel.id);
            caja.insertBefore(btn, det);
            caja.insertBefore(panel, det);
            caja.removeChild(det);

            var bloqueaFondo = caja.getAttribute('data-desplegable') === 'movil';
            var menu = { caja: caja, abierto: false };

            menu.abrir = function () {
                menus.forEach(function (otro) { if (otro !== menu) otro.cerrar(false); });
                menu.abierto = true;
                caja.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
                if (bloqueaFondo) root.classList.add('menu-abierto');
            };
            menu.cerrar = function (devolverFoco) {
                if (!menu.abierto) return;
                menu.abierto = false;
                caja.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
                if (bloqueaFondo) root.classList.remove('menu-abierto');
                if (devolverFoco) btn.focus();
            };

            btn.addEventListener('click', function () {
                if (menu.abierto) menu.cerrar(false); else menu.abrir();
            });
            /* un enlace del panel cierra antes de navegar: así el ancla
               desplaza la página con el fondo ya desbloqueado */
            panel.addEventListener('click', function (e) {
                if (e.target.closest && e.target.closest('a')) menu.cerrar(false);
            });
            /* con el teclado: si el foco sale del menú, se cierra */
            caja.addEventListener('focusout', function (e) {
                if (e.relatedTarget && !caja.contains(e.relatedTarget)) menu.cerrar(false);
            });
            return menu;
        }

        doc.querySelectorAll('[data-desplegable]').forEach(function (caja) {
            var menu = preparar(caja);
            if (menu) menus.push(menu);
        });
        if (!menus.length) return;

        /* clic o toque fuera: cierra. pointerdown porque iOS Safari no
           siempre manda el click de un toque sobre contenido no interactivo
           hasta document; el click se queda de respaldo */
        function cerrarSiFuera(e) {
            menus.forEach(function (m) { if (m.abierto && !m.caja.contains(e.target)) m.cerrar(false); });
        }
        if ('PointerEvent' in window) doc.addEventListener('pointerdown', cerrarSiFuera);
        doc.addEventListener('click', cerrarSiFuera);
        doc.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape' && e.key !== 'Esc') return;
            menus.forEach(function (m) { if (m.abierto) m.cerrar(true); });
        });
        /* al cruzar los 1024 px cambia qué menú se ve: se cierra todo */
        var escritorio = mm('(min-width: 1024px)');
        var cerrarTodo = function () { menus.forEach(function (m) { m.cerrar(false); }); };
        if (escritorio.addEventListener) escritorio.addEventListener('change', cerrarTodo);
        else if (escritorio.addListener) escritorio.addListener(cerrarTodo);
    });

    /* ---------------------------------------------------------------
       4 · Carrusel de capturas
       Si una imagen falla se quita su tarjeta; si no queda ninguna, el
       bloque entero desaparece (sin hueco). Flechas solo en escritorio.
       --------------------------------------------------------------- */
    seguro('carrusel', function () {
        var bloque = doc.getElementById('capturas');
        if (!bloque) return;
        var pista = bloque.querySelector('.carrusel');
        var nav = bloque.querySelector('.capturas__nav');
        var pistaHint = bloque.querySelector('.capturas__hint');
        var prev = bloque.querySelector('[data-carrusel="prev"]');
        var next = bloque.querySelector('[data-carrusel="next"]');

        function quedan() { return bloque.querySelectorAll('.captura').length; }
        function comprobar() {
            if (!quedan() && bloque.parentNode) bloque.parentNode.removeChild(bloque);
            else actualizarFlechas();
        }
        function actualizarFlechas() {
            if (!pista || !prev || !next) return;
            var max = pista.scrollWidth - pista.clientWidth - 2;
            /* aria-disabled y no disabled: un botón que se desactiva con el foco
               dentro lo tira al body y el teclado pierde su sitio */
            prev.setAttribute('aria-disabled', String(pista.scrollLeft <= 2));
            next.setAttribute('aria-disabled', String(pista.scrollLeft >= max));
            pista.classList.toggle('en-final', pista.scrollLeft >= max);
            if (nav) nav.hidden = max <= 0;
            if (pistaHint) pistaHint.hidden = max <= 0;
        }

        bloque.querySelectorAll('.captura img').forEach(function (img) {
            var fallo = function () {
                var li = img.closest('.captura');
                if (li && li.parentNode) li.parentNode.removeChild(li);
                comprobar();
            };
            img.addEventListener('error', fallo, { once: true });
            if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fallo();
        });
        comprobar();
        if (!doc.body.contains(bloque) || !pista) return;

        function mover(dir) {
            var boton = dir < 0 ? prev : next;
            if (boton && boton.getAttribute('aria-disabled') === 'true') return;
            var tarjeta = pista.querySelector('.captura');
            if (!tarjeta) return;
            var paso = tarjeta.getBoundingClientRect().width + 14;
            pista.scrollBy({ left: dir * paso, behavior: movReducido.matches ? 'auto' : 'smooth' });
        }
        if (prev) prev.addEventListener('click', function () { mover(-1); });
        if (next) next.addEventListener('click', function () { mover(1); });

        var pendiente = false;
        pista.addEventListener('scroll', function () {
            if (pendiente) return;
            pendiente = true;
            window.requestAnimationFrame(function () { pendiente = false; actualizarFlechas(); });
        }, { passive: true });
        window.addEventListener('resize', actualizarFlechas, { passive: true });
        if (nav) nav.hidden = false;
        actualizarFlechas();
    });

    /* ---------------------------------------------------------------
       5 · Barra fija inferior (móvil) y botón flotante de WhatsApp
       Todo por IntersectionObserver, nada de umbrales de scroll:
       · la barra aparece cuando el hero sale de pantalla y se oculta
         cuando el bloque de precio (o el pie) está a la vista;
       · oculta = inert + aria-hidden, para que el teclado no caiga en ella;
       · con el banner de cookies abierto, se apoya ENCIMA de él;
       · el botón de WhatsApp sube por encima de la barra y del banner.
       --------------------------------------------------------------- */
    seguro('inferior', function () {
        var barra = doc.getElementById('barra-movil');
        var fab = doc.getElementById('fab');
        var hero = doc.getElementById('inicio');
        var precio = doc.getElementById('precio');
        var pie = doc.querySelector('.pie');
        var movil = mm('(max-width: 767px)');
        var estado = { hero: !!hero, precio: false, pie: false };

        function setInert(el, si) {
            if (si) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
            else { el.removeAttribute('inert'); el.setAttribute('aria-hidden', 'false'); }
        }

        function actualizar() {
            var mostrar = !!barra && movil.matches && !estado.hero && !estado.precio && !estado.pie;
            if (barra) {
                barra.classList.toggle('is-visible', mostrar);
                setInert(barra, !mostrar);
                root.style.setProperty('--alto-barra', mostrar ? barra.offsetHeight + 'px' : '0px');
            }
            if (fab) {
                /* fuera en el hero (un solo CTA por pantalla) y en el pie, que ya lleva WhatsApp.
                   En móvil, también en el bloque de precio: ahí pisaría los botones de pago. */
                var verFab = !estado.hero && !estado.pie && !(estado.precio && movil.matches);
                fab.classList.toggle('is-visible', verFab);
                if (verFab) { fab.removeAttribute('aria-hidden'); fab.removeAttribute('tabindex'); }
                else { fab.setAttribute('aria-hidden', 'true'); fab.setAttribute('tabindex', '-1'); }
            }
        }
        inferior.actualizar = actualizar;

        if ('IntersectionObserver' in window) {
            var observar = function (el, clave, opciones) {
                if (!el) return;
                new IntersectionObserver(function (entradas) {
                    estado[clave] = entradas[entradas.length - 1].isIntersecting;
                    actualizar();
                }, opciones || { threshold: 0 }).observe(el);
            };
            /* el hero cuenta como fuera cuando su borde inferior pasa bajo la barra superior */
            observar(hero, 'hero', { threshold: 0, rootMargin: '-64px 0px 0px 0px' });
            observar(precio, 'precio');
            observar(pie, 'pie');
        } else {
            estado.hero = false;
        }
        if (movil.addEventListener) movil.addEventListener('change', actualizar);
        else if (movil.addListener) movil.addListener(actualizar);
        actualizar();
    });

    /* ---------------------------------------------------------------
       6 · Consentimiento de cookies (RGPD/LSSI)
       Misma clave de almacenamiento y mismo evento que /pro, para que el
       consentimiento dado allí valga aquí y al revés. Nada se activa sin
       permiso explícito y siempre se puede revocar desde el pie.
       --------------------------------------------------------------- */
    seguro('cookies', function () {
        var CLAVE_CONSENTIMIENTO = 'nico66fx_consentimiento_v2';
        var banner = doc.getElementById('cookie-banner');
        var modal = doc.getElementById('cookie-modal');
        var interruptores = Array.prototype.slice.call(doc.querySelectorAll('.cookie-switch[data-consent]'));
        var ultimoFoco = null;
        var temporizador = null;

        function leerConsentimiento() {
            try { return JSON.parse(window.localStorage.getItem(CLAVE_CONSENTIMIENTO)); }
            catch (e) { return null; }
        }

        function guardarConsentimiento(valor) {
            var datos = {};
            Object.keys(valor).forEach(function (k) { datos[k] = valor[k]; });
            datos.fecha = new Date().toISOString();
            try { window.localStorage.setItem(CLAVE_CONSENTIMIENTO, JSON.stringify(datos)); } catch (e) { /* sin storage */ }
            window.consentimientoCookies = datos;
            // Punto de enganche: aquí se cargarían los scripts de medición si datos.analitica === true
            try { doc.dispatchEvent(new CustomEvent('consentimiento', { detail: datos })); } catch (e) { /* navegador antiguo */ }
            ocultarBanner();
            cerrarModal();
        }

        function altoBanner(px) {
            root.style.setProperty('--alto-banner', px + 'px');
            inferior.actualizar();
        }

        function mostrarBanner() {
            if (!banner) return;
            window.clearTimeout(temporizador);
            banner.classList.remove('is-saliendo');
            banner.hidden = false;
            /* con el banner abierto, la barra inferior ya no toca el borde:
               no repite la zona segura que el banner ya reserva */
            root.classList.add('con-banner');
            altoBanner(banner.offsetHeight);
            if ('ResizeObserver' in window) {
                new ResizeObserver(function () {
                    if (!banner.hidden && !banner.classList.contains('is-saliendo')) altoBanner(banner.offsetHeight);
                }).observe(banner);
            }
        }

        function ocultarBanner() {
            if (!banner || banner.hidden) return;
            banner.classList.add('is-saliendo');
            root.classList.remove('con-banner');
            altoBanner(0);
            temporizador = window.setTimeout(function () { banner.hidden = true; }, 300);
        }

        function enfocables() {
            return Array.prototype.slice.call(modal.querySelectorAll('button:not([disabled]), a[href]'));
        }

        function abrirModal() {
            if (!modal) return;
            ultimoFoco = doc.activeElement;
            var actual = leerConsentimiento() || {};
            interruptores.forEach(function (sw) {
                sw.setAttribute('aria-checked', String(Boolean(actual[sw.dataset.consent])));
            });
            modal.hidden = false;
            modal.classList.add('is-open');
            var cerrar = doc.getElementById('cookie-modal-close');
            if (cerrar) cerrar.focus();
        }

        function cerrarModal() {
            if (!modal || !modal.classList.contains('is-open')) return;
            modal.classList.remove('is-open');
            modal.hidden = true;
            if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
        }

        interruptores.forEach(function (sw) {
            sw.addEventListener('click', function () {
                sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
            });
        });

        var on = function (id, fn) { var el = doc.getElementById(id); if (el) el.addEventListener('click', fn); };
        on('btn-accept-cookies', function () { guardarConsentimiento({ analitica: true, marketing: true }); });
        on('btn-reject-cookies', function () { guardarConsentimiento({ analitica: false, marketing: false }); });
        on('btn-config-cookies', abrirModal);
        on('cookie-modal-close', cerrarModal);
        on('cookie-accept-all', function () {
            interruptores.forEach(function (sw) { sw.setAttribute('aria-checked', 'true'); });
            guardarConsentimiento({ analitica: true, marketing: true });
        });
        on('cookie-save', function () {
            var valor = {};
            interruptores.forEach(function (sw) { valor[sw.dataset.consent] = sw.getAttribute('aria-checked') === 'true'; });
            guardarConsentimiento(valor);
        });
        on('abrir-preferencias-cookies', abrirModal);

        if (modal) {
            modal.addEventListener('click', function (e) { if (e.target === modal) cerrarModal(); });
            doc.addEventListener('keydown', function (e) {
                if (!modal.classList.contains('is-open')) return;
                if (e.key === 'Escape') { cerrarModal(); return; }
                if (e.key !== 'Tab') return;
                /* el foco no sale del diálogo mientras está abierto */
                var lista = enfocables();
                if (!lista.length) return;
                var primero = lista[0];
                var ultimo = lista[lista.length - 1];
                if (e.shiftKey && doc.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
                else if (!e.shiftKey && doc.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
            });
        }

        var guardado = leerConsentimiento();
        if (guardado) window.consentimientoCookies = guardado;
        else mostrarBanner();
    });
})();

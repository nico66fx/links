/* ==========================================================================
   nico66fx PRO v4 · Black Friday, eventos de medición y panel de prototipo.
   Se carga después de v2.js. Sin dependencias.
   ========================================================================== */
(function () {
    'use strict';
    var doc = document, root = doc.documentElement;

    /* --- 1 · Ajustes -------------------------------------------------------
       BF_MASTERCLASS: enciende o apaga el bloque de la masterclass de puesta
       en marcha (gancho extra de BF). Sin fecha hasta que Nico la decida. */
    var BF_MASTERCLASS = false;

    /* Fechas de la campaña, en hora de Madrid (UTC+1 en noviembre). */
    var BF = {
        anticipado: Date.parse('2026-11-27T00:00:00+01:00'),   /* 26/11: la lista prioritaria compra por Telegram; la web cambia sola el 27 a las 00:00 */
        abierta:    Date.parse('2026-11-27T00:00:00+01:00'),
        fin:        Date.parse('2026-12-01T00:00:00+01:00')   /* lunes 30 a las 23:59 */
    };

    function estadoPorFecha(t) {
        if (t >= BF.fin) return 'fin';
        if (t >= BF.abierta) return 'abierta';
        if (t >= BF.anticipado) return 'anticipado';
        return 'antes';
    }

    /* --- 2 · Estado de campaña -------------------------------------------
       html[data-bf] = antes | anticipado | abierta | fin
       html[data-precios] = normal | bf  (bf solo en anticipado y abierta)  */
    function aplicarEstado(estado) {
        root.setAttribute('data-bf', estado);
        var precios = (estado === 'anticipado' || estado === 'abierta') ? 'bf' : 'normal';
        root.setAttribute('data-precios', precios);
        doc.querySelectorAll('[data-bf-masterclass]').forEach(function (el) {
            el.hidden = !(BF_MASTERCLASS && precios === 'bf');
        });
        doc.querySelectorAll('[data-proto-estado]').forEach(function (b) {
            b.setAttribute('aria-pressed', b.getAttribute('data-proto-estado') === estado ? 'true' : 'false');
        });
        /* la barra inferior cambia de alto según el texto */
        if (window.nicoInferior && window.nicoInferior.actualizar) window.nicoInferior.actualizar();
    }

    /* --- 3 · Eventos de medición -----------------------------------------
       Puntos de integración listos para GA4 / Meta más adelante: todo va a
       window.dataLayer. No se envía nada a ningún sitio desde aquí.
       pro_page_view · pro_hero_click · pro_live_view · pro_lite_compare_view
       pro_annual_click · pro_lifetime_click · pro_checkout_click · pro_purchase (lo marca Stripe, no esta web) */
    window.dataLayer = window.dataLayer || [];
    function evt(nombre, datos) {
        var e = Object.assign({ event: nombre, bf: root.getAttribute('data-bf') }, datos || {});
        window.dataLayer.push(e);
        if (root.getAttribute('data-proto') === '1' && window.console) console.debug('[evento]', e);
    }
    window.nicoEvt = evt;

    function init() {
        var estado = estadoPorFecha(Date.now());
        try { var p = sessionStorage.getItem('proto-bf'); if (p && root.getAttribute('data-proto') === '1') estado = p; } catch (e) {}
        aplicarEstado(estado);
        evt('pro_page_view');

        /* clics */
        doc.addEventListener('click', function (ev) {
            var a = ev.target.closest('[data-evt]');
            if (!a) return;
            var nombre = a.getAttribute('data-evt');
            var datos = { cta: a.getAttribute('data-evt-cta') || undefined, plan: a.getAttribute('data-evt-plan') || undefined };
            evt(nombre, datos);
            if (nombre === 'pro_annual_click' || nombre === 'pro_lifetime_click' || a.getAttribute('data-evt-plan')) evt('pro_checkout_click', datos);
        });

        /* vistas de sección (una vez) */
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (es) {
                es.forEach(function (en) {
                    if (en.isIntersecting) { evt(en.target.getAttribute('data-evt-view'), { seccion: en.target.id }); io.unobserve(en.target); }
                });
            }, { threshold: 0.35 });
            doc.querySelectorAll('[data-evt-view]:not(#inicio)').forEach(function (s) { io.observe(s); });
        }

        /* --- 4 · Panel de prototipo (solo con data-proto="1") --- */
        var panel = doc.getElementById('proto-panel');
        if (panel && root.getAttribute('data-proto') === '1') {
            panel.hidden = false;
            if (window.matchMedia && window.matchMedia('(max-width: 599px)').matches) panel.classList.add('is-min');
            panel.addEventListener('click', function (ev) {
                var b = ev.target.closest('[data-proto-estado]');
                if (b) {
                    var st = b.getAttribute('data-proto-estado');
                    try { sessionStorage.setItem('proto-bf', st); } catch (e) {}
                    aplicarEstado(st);
                }
                if (ev.target.closest('[data-proto-min]')) panel.classList.toggle('is-min');
            });
            var chk = panel.querySelector('[data-proto-masterclass]');
            if (chk) chk.addEventListener('change', function () { BF_MASTERCLASS = chk.checked; aplicarEstado(root.getAttribute('data-bf')); });
        }
    }


    /* Cuenta atrás de la banda de Black Friday (hasta BF.fin) */
    function cuentaAtras() {
        var els = doc.querySelectorAll('[data-bf-cd]');
        if (!els.length) return;
        function pinta() {
            var ms = BF.fin - Date.now();
            var txt = '';
            if (ms > 0 && root.getAttribute('data-precios') === 'bf') {
                var m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mi = m % 60;
                txt = 'Quedan ' + (d ? d + ' d ' : '') + h + ' h ' + mi + ' min';
            }
            els.forEach(function (e) { e.textContent = txt; });
        }
        pinta();
        setInterval(pinta, 30000);
    }

    function arranca() { init(); cuentaAtras(); }
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', arranca); else arranca();
})();

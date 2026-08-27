/* ==========================================================================
   nico66fx PRO — lógica de la landing
   Los iconos van pre-renderizados en el HTML: no hay dependencia de Lucide.
   ========================================================================== */
(() => {
    'use strict';

    /* ---------------------------------------------------------------
       Menú móvil
       --------------------------------------------------------------- */
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const iconOpen = menuBtn?.querySelector('.menu-open');
    const iconClose = menuBtn?.querySelector('.menu-close');

    function setMenu(abierto) {
        if (!menu || !menuBtn) return;
        menu.classList.toggle('hidden', !abierto);
        iconOpen?.classList.toggle('hidden', abierto);
        iconClose?.classList.toggle('hidden', !abierto);
        menuBtn.setAttribute('aria-expanded', String(abierto));
        menuBtn.querySelector('.sr-only').textContent = abierto ? 'Cerrar menú' : 'Abrir menú';
    }

    menuBtn?.addEventListener('click', () => {
        setMenu(menu.classList.contains('hidden'));
    });
    document.querySelectorAll('.mobile-link').forEach((link) => {
        link.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu && !menu.classList.contains('hidden')) {
            setMenu(false);
            menuBtn?.focus();
        }
    });

    /* ---------------------------------------------------------------
       FAQ — acordeón accesible
       --------------------------------------------------------------- */
    document.querySelectorAll('.faq-toggle').forEach((boton) => {
        boton.addEventListener('click', () => {
            const panel = boton.nextElementSibling;
            const abierto = boton.getAttribute('aria-expanded') === 'true';

            document.querySelectorAll('.faq-toggle').forEach((otro) => {
                if (otro !== boton) {
                    otro.setAttribute('aria-expanded', 'false');
                    otro.nextElementSibling?.classList.add('hidden');
                }
            });

            boton.setAttribute('aria-expanded', String(!abierto));
            panel?.classList.toggle('hidden', abierto);
        });
    });

    /* ---------------------------------------------------------------
       Pestañas de la comunidad — patrón ARIA con navegación por teclado
       --------------------------------------------------------------- */
    const tabs = [...document.querySelectorAll('.tab-btn')];
    const paneles = [...document.querySelectorAll('.tab-panel')];

    function activarTab(tab, mover = true) {
        tabs.forEach((t) => {
            const activo = t === tab;
            t.classList.toggle('active', activo);
            t.setAttribute('aria-selected', String(activo));
            t.tabIndex = activo ? 0 : -1;
        });
        paneles.forEach((p) => {
            const activo = p.dataset.panel === tab.dataset.tab;
            p.classList.toggle('active', activo);
            p.hidden = !activo;
        });
        if (mover) tab.focus();
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activarTab(tab, false));
        tab.addEventListener('keydown', (e) => {
            const saltos = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
            if (e.key in saltos) {
                e.preventDefault();
                activarTab(tabs[(i + saltos[e.key] + tabs.length) % tabs.length]);
            } else if (e.key === 'Home') {
                e.preventDefault(); activarTab(tabs[0]);
            } else if (e.key === 'End') {
                e.preventDefault(); activarTab(tabs[tabs.length - 1]);
            }
        });
    });

    /* ---------------------------------------------------------------
       Scroll reveal + contadores
       --------------------------------------------------------------- */
    function animarContador(el) {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        const objetivo = parseFloat(el.dataset.counter);
        const sufijo = el.dataset.suffix || '';
        const prefijo = el.dataset.prefix || '';
        const decimales = (el.dataset.counter.split('.')[1] || '').length;
        const duracion = 1400;
        const inicio = performance.now();

        function paso(ahora) {
            const p = Math.min(1, (ahora - inicio) / duracion);
            const ease = 1 - Math.pow(1 - p, 3);
            const v = objetivo * ease;
            el.textContent = prefijo + (decimales ? v.toFixed(decimales) : Math.round(v).toLocaleString('es-ES')) + sufijo;
            if (p < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
    }

    const revelables = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
    const ioReveal = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            e.target.querySelectorAll?.('[data-counter]').forEach(animarContador);
            ioReveal.unobserve(e.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revelables.forEach((el) => ioReveal.observe(el));

    const ioContadores = new IntersectionObserver((entradas, obs) => {
        entradas.forEach((e) => {
            if (!e.isIntersecting) return;
            animarContador(e.target);
            obs.unobserve(e.target);
        });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-counter]').forEach((el) => ioContadores.observe(el));

    /* ---------------------------------------------------------------
       Barra de progreso, parallax y CTA fijo
       --------------------------------------------------------------- */
    const progreso = document.getElementById('scroll-progress');
    const sticky = document.getElementById('sticky-cta');
    const parallax = [...document.querySelectorAll('[data-parallax]')];
    const heroSpot = document.getElementById('hero-spot');
    const footer = document.querySelector('footer');
    let footerVisible = false;
    let bannerAbierto = false;

    if (footer) {
        new IntersectionObserver((entradas) => {
            footerVisible = entradas[0].isIntersecting;
            actualizarSticky();
        }, { threshold: 0, rootMargin: '0px 0px -120px 0px' }).observe(footer);
    }

    function actualizarSticky() {
        if (!sticky) return;
        const debeVerse = window.scrollY > window.innerHeight * 0.85 && !footerVisible && !bannerAbierto;
        sticky.classList.toggle('in', debeVerse);
    }

    let pendiente = false;
    function alHacerScroll() {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? Math.max(0, Math.min(100, (h.scrollTop / max) * 100)) : 0;
        if (progreso) progreso.style.width = pct + '%';
        actualizarSticky();
        parallax.forEach((el) => {
            const velocidad = parseFloat(el.dataset.parallax) || 0.05;
            const r = el.getBoundingClientRect();
            const centro = r.top + r.height / 2 - window.innerHeight / 2;
            el.style.transform = `translate3d(0, ${centro * -velocidad}px, 0)`;
        });
        pendiente = false;
    }
    document.addEventListener('scroll', () => {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(alHacerScroll);
    }, { passive: true });
    alHacerScroll();

    /* ---------------------------------------------------------------
       Foco de luz del hero (solo con ratón)
       --------------------------------------------------------------- */
    const hero = document.getElementById('hero');
    if (hero && heroSpot && window.matchMedia('(pointer:fine)').matches) {
        hero.addEventListener('mousemove', (e) => {
            const r = hero.getBoundingClientRect();
            heroSpot.style.left = (e.clientX - r.left) + 'px';
            heroSpot.style.top = (e.clientY - r.top) + 'px';
            heroSpot.style.opacity = '1';
        });
        hero.addEventListener('mouseleave', () => { heroSpot.style.opacity = '0'; });
    }

    /* ---------------------------------------------------------------
       Panel de demostración (datos de ejemplo, claramente etiquetados)
       --------------------------------------------------------------- */
    const operacionesEjemplo = [
        { hora: '08:14', par: 'XAUUSD', tipo: 'BUY', lotes: 0.10, pnl: 42.80 },
        { hora: '11:32', par: 'EURUSD', tipo: 'SELL', lotes: 0.20, pnl: 18.20 },
        { hora: '14:05', par: 'XAUUSD', tipo: 'BUY', lotes: 0.10, pnl: -9.50 },
        { hora: '17:48', par: 'AUDCAD', tipo: 'BUY', lotes: 0.15, pnl: 24.60 }
    ];
    const cuerpoTabla = document.getElementById('tickerBody');
    const pnlEl = document.getElementById('pnl-live');

    // Curva de ejemplo determinista: mismo dibujo en cada visita, sin aleatoriedad
    const puntosEquity = [];
    for (let i = 0, v = 0; i < 30; i++) {
        v += 14 + Math.sin(i / 2.6) * 11 + Math.sin(i / 7.3) * 6;
        puntosEquity.push(v);
    }

    function pintarOperaciones() {
        if (!cuerpoTabla) return;
        cuerpoTabla.innerHTML = '';
        let total = 0;
        operacionesEjemplo.forEach((t, i) => {
            total += t.pnl;
            const tr = document.createElement('tr');
            tr.className = 'ticker-row';
            tr.innerHTML =
                `<td class="text-gray-400">${t.hora}</td>` +
                `<td class="text-white font-semibold">${t.par}</td>` +
                `<td class="${t.tipo === 'BUY' ? 'pnl-up' : 'pnl-down'}">${t.tipo}</td>` +
                `<td class="text-gray-400">${t.lotes.toFixed(2)}</td>` +
                `<td class="text-right pr-2 ${t.pnl >= 0 ? 'pnl-up' : 'pnl-down'}">${t.pnl >= 0 ? '+' : ''}€${t.pnl.toFixed(2)}</td>`;
            tr.style.opacity = '0';
            cuerpoTabla.appendChild(tr);
            setTimeout(() => { tr.style.transition = 'opacity .6s ease'; tr.style.opacity = '1'; }, i * 260 + 200);
        });
        if (pnlEl) {
            pnlEl.textContent = `${total >= 0 ? '+' : ''}€${total.toFixed(2)}`;
            pnlEl.className = total >= 0 ? 'pnl-up' : 'pnl-down';
        }
        dibujarEquity();
    }

    function dibujarEquity() {
        const linea = document.getElementById('equityLine');
        const area = document.getElementById('equityArea');
        if (!linea || !area || puntosEquity.length < 2) return;
        const w = 320, h = 80, pad = 4;
        const min = Math.min(...puntosEquity, 0);
        const max = Math.max(...puntosEquity, 1);
        const rango = (max - min) || 1;
        const pasoX = (w - pad * 2) / (puntosEquity.length - 1);
        let d = '';
        puntosEquity.forEach((v, i) => {
            const x = pad + i * pasoX;
            const y = h - pad - ((v - min) / rango) * (h - pad * 2);
            d += (i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`);
        });
        linea.setAttribute('d', d);
        const ultimaX = pad + (puntosEquity.length - 1) * pasoX;
        area.setAttribute('d', `${d} L ${ultimaX.toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`);
    }

    const seccionDemo = document.getElementById('live-terminal');
    if (seccionDemo) {
        const ioDemo = new IntersectionObserver((entradas, obs) => {
            if (!entradas[0].isIntersecting) return;
            pintarOperaciones();   // se pinta una sola vez: es una demo, no un feed en vivo
            obs.disconnect();
        }, { threshold: 0.2 });
        ioDemo.observe(seccionDemo);
    }

    /* ---------------------------------------------------------------
       Consentimiento de cookies (RGPD/LSSI)
       Nada se activa sin permiso explícito y siempre se puede revocar.
       --------------------------------------------------------------- */
    const CLAVE_CONSENTIMIENTO = 'nico66fx_consentimiento_v2';
    const banner = document.getElementById('cookie-banner');
    const modal = document.getElementById('cookie-modal');
    const interruptores = [...document.querySelectorAll('.cookie-switch[data-consent]')];
    let ultimoFoco = null;

    function leerConsentimiento() {
        try {
            return JSON.parse(localStorage.getItem(CLAVE_CONSENTIMIENTO));
        } catch { return null; }
    }

    function guardarConsentimiento(valor) {
        const datos = { ...valor, fecha: new Date().toISOString() };
        try { localStorage.setItem(CLAVE_CONSENTIMIENTO, JSON.stringify(datos)); } catch { /* sin storage */ }
        window.consentimientoCookies = datos;
        // Punto de enganche: aquí se cargarían los scripts de medición si datos.analitica === true
        document.dispatchEvent(new CustomEvent('consentimiento', { detail: datos }));
        ocultarBanner();
        cerrarModal();
    }

    function mostrarBanner() {
        if (!banner) return;
        banner.hidden = false;
        bannerAbierto = true;
        actualizarSticky();
        requestAnimationFrame(() => banner.classList.remove('translate-y-full'));
    }

    function ocultarBanner() {
        if (!banner) return;
        banner.classList.add('translate-y-full');
        bannerAbierto = false;
        actualizarSticky();
        setTimeout(() => { banner.hidden = true; }, 500);
    }

    function abrirModal() {
        if (!modal) return;
        ultimoFoco = document.activeElement;
        const actual = leerConsentimiento() || {};
        interruptores.forEach((sw) => {
            sw.setAttribute('aria-checked', String(Boolean(actual[sw.dataset.consent])));
        });
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.querySelector('#cookie-modal-close')?.focus();
    }

    function cerrarModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        ultimoFoco?.focus?.();
    }

    interruptores.forEach((sw) => {
        sw.addEventListener('click', () => {
            sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
        });
    });

    document.getElementById('btn-accept-cookies')?.addEventListener('click', () => guardarConsentimiento({ analitica: true, marketing: true }));
    document.getElementById('btn-reject-cookies')?.addEventListener('click', () => guardarConsentimiento({ analitica: false, marketing: false }));
    document.getElementById('btn-config-cookies')?.addEventListener('click', abrirModal);
    document.getElementById('cookie-modal-close')?.addEventListener('click', cerrarModal);
    document.getElementById('cookie-accept-all')?.addEventListener('click', () => {
        interruptores.forEach((sw) => sw.setAttribute('aria-checked', 'true'));
        guardarConsentimiento({ analitica: true, marketing: true });
    });
    document.getElementById('cookie-save')?.addEventListener('click', () => {
        const valor = {};
        interruptores.forEach((sw) => { valor[sw.dataset.consent] = sw.getAttribute('aria-checked') === 'true'; });
        guardarConsentimiento(valor);
    });
    document.getElementById('abrir-preferencias-cookies')?.addEventListener('click', abrirModal);

    modal?.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) cerrarModal();
    });

    const consentimientoGuardado = leerConsentimiento();
    if (consentimientoGuardado) {
        window.consentimientoCookies = consentimientoGuardado;
    } else {
        mostrarBanner();
    }
})();

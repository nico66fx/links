/** @type {import('tailwindcss').Config} */

/* Rampa de marca — azul real, no el azul por defecto de Tailwind.
   El 500 sube de #3b82f6 a #1544E0: sobre fondo claro tiene peso y contraste. */
const brand = {
  50: '#EEF3FF', 100: '#DBE5FF', 200: '#B8CBFF', 300: '#8AA8FF', 400: '#4E7AF7',
  500: '#1544E0', 600: '#0F35B4', 700: '#0C2A8C', 800: '#091F66', 900: '#061642'
}

/* Toda la familia violeta/fucsia/cian/sky/índigo pasa a azul: sobre claro
   una paleta de 7 acentos es un caramelo. Un solo tono, en su rampa. */
const azul = { ...brand }

/* Verde y rojo SOLO de dato. Stops bajos = tintes de fondo, altos = texto. */
const verde = {
  50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399',
  500: '#10B981', 600: '#047857', 700: '#065F46', 800: '#064E3B', 900: '#022C22'
}
const rojo = {
  50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA', 300: '#FCA5A5', 400: '#F87171',
  500: '#EF4444', 600: '#DC2626', 700: '#B91C1C', 800: '#991B1B', 900: '#7F1D1D'
}
/* Ámbar: reservado a avisos legales y al aviso de contenido simulado. */
const ambar = {
  50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D', 400: '#FBBF24',
  500: '#F59E0B', 600: '#B45309', 700: '#92400E', 800: '#78350F', 900: '#451A03'
}

module.exports = {
  content: ["./*.html", "./tools/**/*.html", "./assets/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Instrument Sans', 'Inter', 'ui-sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      colors: {
        brand,
        canvas: { DEFAULT: '#F2F5FA', alt: '#E9EEF7' },
        surface: '#FFFFFF',
        ink: { DEFAULT: '#08111F', 2: '#46566B', 3: '#5D6D84', 4: '#94A3B8' },
        pos: { DEFAULT: '#047857', soft: '#ECFDF5' },
        neg: { DEFAULT: '#DC2626', soft: '#FEF2F2' },
        warn: { DEFAULT: '#B45309', soft: '#FFFBEB' },

        /* La escala gris se INVIERTE: los roles del tema oscuro (900 = fondo,
           800 = filete, 400 = texto apagado) se conservan, pero en claro.
           Así `bg-gray-900/40`, `border-gray-800` y `text-gray-400` siguen
           significando lo mismo y los modificadores de opacidad funcionan solos. */
        gray: {
          50: '#08111F',
          100: '#08111F',
          200: '#1E2A3B',
          300: '#46566B',
          400: '#5D6D84',
          500: '#5D6D84',
          600: '#94A3B8',
          700: '#D9E0EA',
          800: '#E2E8F1',
          900: '#FFFFFF',
          950: '#FFFFFF'
        },

        violet: azul, purple: azul, fuchsia: azul, pink: azul,
        cyan: azul, sky: azul, indigo: azul, blue: azul, teal: azul,

        emerald: verde, green: verde,
        red: rojo, rose: rojo, orange: ambar,
        amber: ambar, yellow: ambar
      },
      animation: {
        'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 7s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'marquee': 'marquee 38s linear infinite',
        'marquee-rev': 'marquee 60s linear infinite reverse',
        'rise': 'rise 0.8s ease-out both'
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        rise: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
      }
    }
  },
  plugins: []
}

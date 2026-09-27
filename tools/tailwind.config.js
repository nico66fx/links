/** @type {import('tailwindcss').Config} */

/* Paleta de nico66fx.com. Mismos valores que /pro: un solo azul, verde y
   rojo solo de dato, ambar solo de aviso. */
const brand = {
  50: '#EEF3FF', 100: '#DBE5FF', 200: '#B8CBFF', 300: '#8AA8FF', 400: '#1544E0',
  500: '#1544E0', 600: '#0F35B4', 700: '#0C2A8C', 800: '#091F66', 900: '#061642'
}
const verde = {
  50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#047857', 400: '#10B981',
  500: '#10B981', 600: '#047857', 700: '#065F46', 800: '#064E3B', 900: '#022C22'
}
const rojo = {
  50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA', 300: '#DC2626', 400: '#F87171',
  500: '#EF4444', 600: '#DC2626', 700: '#B91C1C', 800: '#991B1B', 900: '#7F1D1D'
}
const ambar = {
  50: '#FFFBEB', 100: '#7C3D06', 200: '#7C3D06', 300: '#B45309', 400: '#F59E0B',
  500: '#F59E0B', 600: '#B45309', 700: '#92400E', 800: '#78350F', 900: '#451A03'
}

/* Rampa INVERTIDA. La pagina venia de un tema oscuro, donde los stops bajos
   eran texto claro sobre fondo negro. Al pasar a claro ese papel lo hace la
   tinta azul casi negra, asi que la rampa se da la vuelta y el marcado no se
   toca: text-slate-300 sigue significando "secundario" sin editar una clase. */
const tinta = {
  50: '#08111F', 100: '#08111F', 200: '#08111F', 300: '#46566B', 400: '#5D6D84',
  500: '#5D6D84', 600: '#94A3B8', 700: '#D9E0EA', 800: '#E2E8F1', 900: '#FFFFFF',
  950: '#FFFFFF'
}

module.exports = {
  content: ['./*.html', './prompt-lab/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Instrument Sans', 'Inter', 'ui-sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      colors: {
        brand,
        /* accent existia en el marcado pero NO estaba definido en la config
           antigua, asi que text-accent-400 no pintaba nada. Se define como
           el mismo azul: un solo acento en todo el sitio. */
        accent: brand,
        canvas: { DEFAULT: '#F2F5FA', alt: '#E9EEF7' },
        surface: '#FFFFFF',
        ink: { DEFAULT: '#08111F', 2: '#46566B', 3: '#5D6D84', 4: '#94A3B8' },

        /* En un tema oscuro el blanco es la tinta de contraste. En claro ese
           papel lo hace el azul casi negro. Remapearlo arregla de una vez
           text-white, border-white/NN y bg-white/NN con la semantica correcta. */
        white: '#08111F',
        /* y queda un blanco de verdad para cuando haga falta superficie */
        papel: '#FFFFFF',

        slate: tinta, gray: tinta, zinc: tinta, neutral: tinta, stone: tinta,
        violet: brand, purple: brand, fuchsia: brand, pink: brand,
        cyan: brand, sky: brand, indigo: brand, blue: brand, teal: brand,
        emerald: verde, green: verde,
        red: rojo, rose: rojo,
        orange: ambar, amber: ambar, yellow: ambar
      }
    }
  },
  plugins: []
}

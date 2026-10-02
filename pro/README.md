# nico66fx PRO — web

Landing estática (GitHub Pages). El CSS ahora se **compila**: ya no se carga Tailwind desde un CDN.

## Trabajar en la web

```bash
npm install
```

Mientras editas HTML, deja el compilador escuchando:

```bash
npm run dev
```

Antes de subir cambios, genera el CSS minificado:

```bash
npm run build
```

> **Importante:** si tocas clases en cualquier `.html` y no ejecutas `npm run build`, los estilos nuevos
> no aparecerán en producción. El fichero `assets/output.css` es el que se publica.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | La landing completa |
| `src/styles.css` | Fuente de estilos (Tailwind + componentes propios) |
| `assets/output.css` | **Generado** por `npm run build`. No editar a mano |
| `assets/scripts.js` | Toda la lógica: menú, FAQ, pestañas, demo y consentimiento |
| `assets/og-cover.png` | Imagen de previsualización al compartir el enlace |
| `tailwind.config.js` | Paleta, fuentes y animaciones |
| `robots.txt`, `sitemap.xml` | SEO |

## Iconos

Los iconos van **incrustados como SVG** en el HTML. No hay librería de iconos en tiempo de ejecución.
Para añadir uno nuevo, copia el SVG de [lucide.dev](https://lucide.dev) y pégalo con
`class="lucide w-4 h-4 ..."`.

## Publicar

Sube todo **menos `node_modules/`** (ya está en `.gitignore`).
No borres la carpeta `tools/` del repositorio: no viene incluida en este paquete.

## Analítica (pendiente de conectar)

No se carga ningún script de medición. Cuando quieras añadir uno, engánchalo al consentimiento
para no romper el RGPD:

```js
document.addEventListener('consentimiento', (e) => {
  if (e.detail.analitica) {
    // cargar aquí el script de medición
  }
});
```

El consentimiento vive en `localStorage` bajo `nico66fx_consentimiento_v2`.

## Datos que hay que revisar periódicamente

Están escritos a mano en `index.html` y envejecen solos:

- Rendimiento y drawdown de Myfxbook (`data-counter`) — actualizados el 15/9/2026:
  RAW XAU +563,61 % / 23,42 % · Axi Select +15,94 % / 5,32 % · Portfolio PRO +210,73 % / 14,17 %.
  Al cambiarlos, actualiza también la fecha visible en la sección `#resultados`.
- Número de miembros (200+) y del Telegram gratuito (9.000+), tal como aparecen en la página
- Precios (49,99 €/mes · 249 € de por vida) y la aritmética asociada: 599,88 € al año y 350,88 € de diferencia

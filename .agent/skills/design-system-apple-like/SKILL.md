---
name: design-system-apple-like
description: Reglas del sistema de diseño de AirPop (tokens, tipografía, material, movimiento, iconografía, accesibilidad) con acabado tipo Apple sin copiar activos de Apple. Úsala al crear o revisar cualquier componente visual.
---

# Objetivo
Coherencia visual y calidad de acabado en todas las superficies.

# Reglas
- Tokens solo en `ui/src/shared/tokens.css`. Resortes solo en `spring.ts`.
- Radio de tarjeta 28 px, pastilla para el estado compacto, control 14 px.
- Tipografía Inter; números tabulares en porcentajes.
- Modo claro y oscuro automáticos.
- Material: flyout con Acrylic/Mica nativo; popup con material simulado (gradientes translúcidos, ruido, borde de 1 px con gradiente, sombra en dos capas).
- Iconos propios en SVG, trazo de 1.75 px, esquinas redondeadas. Nada de SF Symbols.
- Batería: verde por encima del 30 %, ámbar por debajo del 30 %, rojo por debajo del 15 %.
- Contraste AA, `aria-live="polite"`, cierre con Esc, `prefers-reduced-motion`.

# Hecho cuando
- No hay colores ni medidas fijas fuera de los tokens.
- Capturas de los estados A, B y flyout en claro y oscuro revisadas.

---
name: r3f-popup-scene
description: Escena 3D del popup con React Three Fiber (caja, tapa, auriculares, HDRI, bloom) y su secuencia de animación. Úsala al tocar ui/src/popup.
---

# Objetivo
Una escena ligera y pulida, con la secuencia de entrada de ~3,5 s.

# Pasos
1. Carga el `.glb` del modelo desde el catálogo (`useGLTF` con Draco).
2. Iluminación: HDRI de estudio y una luz direccional suave. Sombra de contacto.
3. Bloom sutil solo en el LED (`@react-three/postprocessing`).
4. Animación de la tapa con la jerarquía `case_lid`; auriculares con salida escalonada y rotación lenta en Y.
5. Anillos de batería en `BatteryRing.tsx` con `stroke-dashoffset` animado.
6. Parallax leve con el ratón.
7. Montar la escena solo mientras el popup esté visible; liberar geometrías y texturas al ocultar.

# Reglas
- Resortes de `ui/src/shared/spring.ts`. Nunca ease lineal.
- `prefers-reduced-motion`: solo fade de 150 ms.
- Sin colores ni medidas fijas: usar tokens.

# Hecho cuando
- 60 fps en una GPU integrada.
- Cambiar de modelo o color desde el catálogo no requiere tocar la escena.

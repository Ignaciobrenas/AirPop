---
name: blender-render-pipeline
description: Renderiza en lote caja, auriculares y estuches de todos los modelos con Blender (bpy) y exporta GLB optimizados. Úsala al añadir o actualizar modelos y renders.
---

# Objetivo
Renders y GLB coherentes, reproducibles y ligeros.

# Pasos
1. Un `.blend` por modelo con jerarquía: `case_body`, `case_lid`, `bud_left`, `bud_right`, `led` (y `ear_cushions` en Max).
2. `tools/blender/render_all.py` recorre los `.blend`, aplica la misma cámara y el mismo HDRI, y renderiza cada pieza y color con fondo transparente.
3. Salida: `ui/src/assets/renders/<id>/<pieza>[-<color>].png` a 1024 px y @2x; convertir a WebP/AVIF.
4. Exportar `.glb` y optimizar con `gltf-transform` (Draco o Meshopt, texturas WebP/KTX2). Menos de 2 MB por modelo.
5. Registrar rutas en `catalog/models.json`.

# Reglas
- Modelos propios o con licencia. Nunca ripear modelos o renders de Apple.
- Nombres estables en minúsculas con guiones.

# Hecho cuando
- Un solo comando regenera todos los renders.
- Todos los modelos del catálogo tienen sus assets y pasan el presupuesto de tamaño.

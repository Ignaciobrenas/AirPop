---
description: Añadir un modelo nuevo de auriculares al catálogo
---

1. Captura los anuncios BLE del modelo y guarda los payloads en tests/fixtures.
2. Rellena bleModelIds en catalog/models.json.
3. Modela el .blend con la jerarquía estándar y ejecuta tools/blender/render_all.py.
4. Exporta y optimiza el .glb; registra las rutas en el catálogo.
5. Añade modos de escucha soportados y colores.
6. Ejecuta cargo test y npm test.
7. Revisa el popup con --simulate en claro y oscuro.

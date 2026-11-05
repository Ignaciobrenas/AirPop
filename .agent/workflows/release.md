---
description: Preparar una release
---

1. cargo fmt, cargo clippy -D warnings, cargo test.
2. npm run lint, npm test.
3. Subir versión en Cargo.toml, tauri.conf.json y package.json.
4. Construir el instalador con tauri build y firmarlo.
5. Probar instalación limpia en Windows 10 y 11.
6. Actualizar README y changelog.

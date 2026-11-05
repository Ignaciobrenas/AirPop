# AirPop

App de escritorio en Rust (Tauri 2) con UI en React + React Three Fiber.
Muestra un popup 3D al abrir la caja de unos auriculares Bluetooth cerca del PC o al conectarlos,
con icono dinámico en la bandeja, flyout con batería y modo de escucha.

Lee PLAN_AIRPOP.md antes de empezar cualquier tarea.

## Reglas
- Núcleo en Rust. Nada de Go.
- Windows primero. Linux y macOS después, detrás de los módulos bt/*.
- Código sin comentarios.
- Respuestas concisas.
- No copies activos de Apple (modelos, renders, sonidos, iconos). No uses SF Symbols.
- No uses "AirPods" ni el logo de Apple en nombres, iconos o marca.
- Parser BLE aislado y con tests con fixtures reales.
- Toda animación con resortes. Nunca ease lineal.
- Respeta prefers-reduced-motion.
- El webview oculto no debe consumir CPU.
- Sin telemetría.
- Antes de dar una tarea por terminada: cargo fmt, cargo clippy -D warnings, cargo test, npm run lint, npm test.

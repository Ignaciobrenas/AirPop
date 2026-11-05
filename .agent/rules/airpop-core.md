---
trigger: always_on
---

- Stack fijo: Tauri 2, Rust, React, TypeScript, Vite, Three.js con React Three Fiber, Framer Motion, Tailwind, zustand.
- El contrato IPC vive en src-tauri/src/ipc.rs y ui/src/shared/ipc.ts. Cambia ambos a la vez.
- Los modelos de auriculares se definen solo en catalog/models.json.
- Tokens de diseño solo en ui/src/shared/tokens.css y spring.ts. No hardcodear colores ni medidas.
- Los offsets del protocolo de Apple son hipótesis hasta que un test con fixture reales los confirme.

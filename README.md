<div align="center">

<img src="docs/assets/logo.png" alt="AirPop Logo" width="128" height="128" />

# AirPop

**Popup 3D de proximidad Bluetooth, icono de bandeja dinámico y flyout de batería en Rust + Tauri 2 + React Three Fiber**

[![Release](https://img.shields.io/github/v/release/Ignaciobrenas/AirPop?style=flat-square&color=0a84ff)](https://github.com/Ignaciobrenas/AirPop/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/Ignaciobrenas/AirPop/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/Ignaciobrenas/AirPop/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-30d158.svg?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-Rust%20%7C%20Tauri%202%20%7C%20R3F-38bdf8?style=flat-square)](#arquitectura)
[![Telemetry](https://img.shields.io/badge/Telemetr%C3%ADa-0%25%20Offline-10b981?style=flat-square)](#privacidad-y-aviso-legal)

<br />

<img src="docs/assets/banner.png" alt="AirPop Hero Banner" width="100%" />

</div>

---

## ✨ Características Principales

- **Detección de Proximidad BLE (`0x004C` / `0x07`)**: Escaneo en tiempo real con filtro de intensidad de señal (`RSSI > -60 dBm`), correlación por firma de payload resistente a rotación de direcciones MAC (RPA) y antirrebote inteligente de 12 segundos.
- **Escena 3D Interactiva en 60 FPS**: Renderizado con **React Three Fiber (Three.js)**, iluminación de estudio de 3 puntos, apertura de tapa sobre bisagra animada (`case_lid`), salida escalonada de auriculares (`bud_left`, `bud_right`), LED emisivo y parallax suave con el ratón.
- **Dos Estados de Popup con Física de Resortes**:
  - **Estado A — Proximidad (Caja abierta)**: Tarjeta translúcida (`28 px` de radio) con modelo 3D, anillos de batería individuales (`L`, `R`, `Caja`) y acción rápida de conexión.
  - **Estado B — Conectado (Compacto)**: Pastilla flotante con estado de conexión, modo de escucha activo y porcentajes en números tabulares (`tabular-nums`).
- **Barra de Tareas de Windows 10/11**:
  - **Icono de bandeja dinámico**: Dibujado en memoria con `tiny-skia` mostrando el anillo del nivel mínimo entre `L`, `R` y `Caja`.
  - **Flyout con Acrylic / Mica nativo**: Anclado al icono del sistema con selector segmentado de modo de escucha (*Cancelación*, *Transparencia*, *Adaptativo*, *Desactivado*) y ajustes rápidos.
  - **Toasts nativos con Anti-Spam**: Alertas al 20 % y 10 % de batería y estuche cargado al 100 %, limitadas a máximo 1 notificación cada 30 minutos por evento y dispositivo.
- **Modo `--simulate` sin Hardware**: Prueba cualquier modelo, color y escenario (`case-open`, `connected`, `low-battery`, `charging`) desde la línea de comandos.

---

## 🏗️ Arquitectura

```text
┌──────────────────────────────────────────────────────────┐
│ Núcleo Rust (Tauri 2)                                     │
│                                                           │
│  ble::scanner ──► ble::apple_proximity (parser)           │
│        │                     │                            │
│  bt::watcher (conexión)      ▼                            │
│        │              device::registry (catálogo)         │
│        ▼                     │                            │
│  state::machine ◄────────────┘                            │
│        │                                                  │
│        ├─► ipc (eventos JSON) ──► ventana popup           │
│        ├─► tray (icono dinámico) ──► ventana flyout       │
│        ├─► toast (notificaciones nativas)                 │
│        └─► settings (store) / autostart / single-instance │
│                                                           │
│  aap: protocolo L2CAP (con degradación automática en Win) │
└──────────────────────────────────────────────────────────┘
                         │ eventos / comandos IPC
                         ▼
┌──────────────────────────────────────────────────────────┐
│ UI (WebView2)                                             │
│  popup:  React + R3F + Framer Motion                      │
│  flyout: React + SVG propios + controles segmentados      │
│  stores (zustand), tokens.css, spring.ts, assets .glb     │
└──────────────────────────────────────────────────────────┘
```

---

## 🎧 Catálogo de Modelos (`catalog/models.json`)

El catálogo está desacoplado en [`catalog/models.json`](catalog/models.json) para añadir nuevos modelos o variantes de color sin recompilar la lógica de interfaz:

| ID de Catálogo | Nombre en UI | Tipo | Año | Modos de Escucha | Colores |
|---|---|---|---|---|---|
| `airpods-pro-3` | **Pro 3** | In-ear | 2025 | Cancelación, Transparencia, Adaptativo, Off | Blanco |
| `airpods-4` | **Series 4** | In-ear | 2024 | — | Blanco |
| `airpods-4-anc` | **Series 4 ANC** | In-ear | 2024 | Cancelación, Transparencia, Adaptativo, Off | Blanco |
| `airpods-max-2` | **Max 2** | Over-ear | 2026 | Cancelación, Transparencia, Adaptativo, Off | Medianoche, Blanco estelar, Naranja, Morado, Azul |
| `airpods-pro-2` | **Pro 2** | In-ear | 2023 | Cancelación, Transparencia, Adaptativo, Off | Blanco |
| `airpods-pro-1` | **Pro 1** | In-ear | 2019 | Cancelación, Transparencia, Off | Blanco |
| `airpods-3` | **Series 3** | In-ear | 2021 | — | Blanco |
| `airpods-2` | **Series 2** | In-ear | 2019 | — | Blanco |
| `airpods-1` | **Series 1** | In-ear | 2016 | — | Blanco |
| `airpods-max` | **Max** | Over-ear | 2020 | Cancelación, Transparencia, Off | Gris espacial, Plata, Azul cielo |

---

## 🚀 Inicio Rápido y Uso

### Requisitos
- **Sistema Operativo**: Windows 10 (1903+) o Windows 11 (con soporte experimental para Linux vía BlueZ y macOS vía IOBluetooth).
- **Bluetooth**: Adaptador compatible con Bluetooth 4.0+ (BLE).
- **Entorno de desarrollo**: Node.js 22+, Rust Stable y dependencias de Tauri 2.

### Desarrollo y Tests de UI
```bash
cd ui
npm install
npm run lint
npm test
npm run dev
```

### Modo Simulación (`--simulate`)
Itera sobre el diseño o prueba cualquier escenario sin necesidad de auriculares físicos:
```bash
# Sintaxis: airpop --simulate <modelo> <color> <escenario>
cargo run -p airpop -- --simulate airpods-pro-3 white case-open
cargo run -p airpop -- --simulate airpods-max-2 orange connected
cargo run -p airpop -- --simulate airpods-4-anc white charging
cargo run -p airpop -- --simulate airpods-pro-3 white low-battery
```

### Captura de Payloads BLE Propios (`tools/capture`)
```bash
cargo run -p airpop-capture -- --duration-secs 30
```

### Regenerar Modelos `.glb` y Renders `.webp`
```bash
node tools/blender/generate_assets.mjs
# O con Blender instalado en PATH:
blender --background --python tools/blender/render_all.py
```

---

## ⚡ Presupuesto de Calidad y Rendimiento

| Métrica | Objetivo | Implementación |
|---|---|---|
| **CPU en reposo** | `~0 %` | El `<Canvas>` 3D solo se monta mientras el popup es visible |
| **Primer frame** | `< 150 ms` | Ventanas pre-inicializadas ocultas al arranque |
| **Framerate** | `60 fps` | Resortes en `spring.ts` y `dpr={[1, 1.5]}` |
| **Accesibilidad** | `WCAG AA` | `aria-live="polite"`, cierre con `Esc` y soporte `prefers-reduced-motion` |
| **Tamaño por modelo** | `< 2 MB` | Geometría `.glb` optimizada y renders `.webp` |

---

## 🔒 Privacidad y Aviso Legal

- **Cero Telemetría**: AirPop funciona 100 % en local. No realiza conexiones de red ni recopila métricas.
- **Activos Originales**: Todos los modelos 3D, renders, iconos SVG (trazo de `1.75 px`) y elementos de marca son creación propia bajo licencia MIT. No se utilizan modelos, renders, iconos (SF Symbols), sonidos ni logotipos propietarios de Apple Inc.

---

## 📄 Licencia

Distribuido bajo la licencia [MIT](LICENSE).

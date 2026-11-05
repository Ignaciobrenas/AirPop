<div align="center">

<img src="docs/assets/logo.png" alt="AirPop Logo" width="128" height="128" />

# AirPop

**3D Bluetooth Proximity Popup, Dynamic System Tray Battery Ring, and Listening-Mode Flyout built with Rust, Tauri 2, and React Three Fiber**

[![Release](https://img.shields.io/github/v/release/Ignaciobrenas/AirPop?style=flat-square&color=0a84ff)](https://github.com/Ignaciobrenas/AirPop/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/Ignaciobrenas/AirPop/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/Ignaciobrenas/AirPop/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-30d158.svg?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-Rust%20%7C%20Tauri%202%20%7C%20R3F-38bdf8?style=flat-square)](#architecture)
[![Telemetry](https://img.shields.io/badge/Telemetry-0%25%20Offline-10b981?style=flat-square)](#security--privacy)

<br />

<img src="docs/assets/banner.png" alt="AirPop Hero Banner" width="100%" />

</div>

---

## <img src="docs/assets/icons/sparkles.svg" width="22" height="22" align="absmiddle" alt="" /> Key Features

- **Real-Time BLE Proximity Detection (`0x004C` / `0x07`)**: Scans Bluetooth Low Energy advertisements, filters by signal strength (`RSSI > -60 dBm`), correlates devices via payload signature to handle rotating random MAC addresses (RPA), and enforces a 12-second per-device debounce.
- **60 FPS Interactive 3D Scene**: Powered by **React Three Fiber (Three.js)** with studio 3-point lighting, animated hinge lid (`case_lid`), staggered floating earbuds (`bud_left`, `bud_right`), emissive status LED, and subtle mouse parallax.
- **Two Spring-Driven Popup States**:
  - **State A — Proximity (Case Open)**: Translucent glass card (`28px` border radius) displaying the 3D charging case, individual battery rings (`L`, `R`, `Case`), and quick connect action.
  - **State B — Connected (Compact Pill)**: Compact floating pill displaying connection status, active listening mode badge, and tabular battery percentages (`tabular-nums`).
- **Native Windows 10/11 Taskbar Integration**:
  - **Dynamic System Tray Icon**: Rendered in-memory via `tiny-skia` showing a color-coded battery ring for the lowest level among `L`, `R`, and `Case`.
  - **Acrylic / Mica Flyout**: Anchored to the tray icon with a segmented listening-mode selector (*Noise Cancellation*, *Transparency*, *Adaptive*, *Off*) using custom `1.75px` stroke SVG icons and quick settings toggles.
  - **Anti-Spam Native Toasts**: Low-battery alerts (20% and 10%) and case fully charged notifications rate-limited to at most 1 toast per event and device every 30 minutes.
- **Zero Idle CPU & GPU Footprint**: Code-split frontend bundles, automatic `frameloop="never"` suspension when hidden, explicit Three.js geometry/material disposal on unmount, and optional low-power WebView destruction mode.
- **Hardware-Free `--simulate` CLI Mode**: Preview any model, color variant, and scenario (`case-open`, `connected`, `low-battery`, `charging`) directly from the command line.

---

## <img src="docs/assets/icons/layers.svg" width="22" height="22" align="absmiddle" alt="" /> Architecture

```text
┌──────────────────────────────────────────────────────────┐
│ Rust Core (Tauri 2)                                      │
│                                                           │
│  ble::scanner ──► ble::apple_proximity (parser)           │
│        │                     │                            │
│  bt::watcher (connection)    ▼                            │
│        │              device::registry (LRU/TTL catalog) │
│        ▼                     │                            │
│  state::machine ◄────────────┘                            │
│        │                                                  │
│        ├─► ipc (validated JSON) ──► popup window          │
│        ├─► tray (tiny-skia icon) ──► flyout window        │
│        ├─► toast (rate-limited notifications)             │
│        └─► settings (store) / autostart / single-instance │
│                                                           │
│  aap: L2CAP protocol (with automatic degradation on Win)  │
└──────────────────────────────────────────────────────────┘
                         │ IPC events & commands
                         ▼
┌──────────────────────────────────────────────────────────┐
│ UI (WebView2)                                             │
│  popup:  React + R3F + Framer Motion (lazy chunk)         │
│  flyout: React + Custom SVG Icon Library (lightweight)    │
│  stores (zustand), tokens.css, spring.ts, .glb assets     │
└──────────────────────────────────────────────────────────┘
```

---

## <img src="docs/assets/icons/headphones.svg" width="22" height="22" align="absmiddle" alt="" /> Model Catalog (`catalog/models.json`)

All supported models and colorways are defined declaratively in [`catalog/models.json`](catalog/models.json):

| Catalog ID | Display Name | Form Factor | Year | Listening Modes | Colorways |
|---|---|---|---|---|---|
| `airpods-pro-3` | **Pro 3** | In-ear | 2025 | Noise Cancellation, Transparency, Adaptive, Off | White |
| `airpods-4` | **Series 4** | In-ear | 2024 | — | White |
| `airpods-4-anc` | **Series 4 ANC** | In-ear | 2024 | Noise Cancellation, Transparency, Adaptive, Off | White |
| `airpods-max-2` | **Max 2** | Over-ear | 2026 | Noise Cancellation, Transparency, Adaptive, Off | Midnight, Starlight, Orange, Purple, Blue |
| `airpods-pro-2` | **Pro 2** | In-ear | 2023 | Noise Cancellation, Transparency, Adaptive, Off | White |
| `airpods-pro-1` | **Pro 1** | In-ear | 2019 | Noise Cancellation, Transparency, Off | White |
| `airpods-3` | **Series 3** | In-ear | 2021 | — | White |
| `airpods-2` | **Series 2** | In-ear | 2019 | — | White |
| `airpods-1` | **Series 1** | In-ear | 2016 | — | White |
| `airpods-max` | **Max** | Over-ear | 2020 | Noise Cancellation, Transparency, Off | Space Gray, Silver, Sky Blue |

---

## <img src="docs/assets/icons/terminal.svg" width="22" height="22" align="absmiddle" alt="" /> Quick Start & CLI Usage

### Prerequisites
- **Operating System**: Windows 10 (1903+) or Windows 11 (with cross-platform backend abstractions for Linux via BlueZ and macOS via IOBluetooth).
- **Bluetooth**: Bluetooth 4.0+ (BLE) adapter.
- **Toolchain**: Node.js 22+, Rust Stable, and Tauri 2 build prerequisites.

### Frontend Development & Testing
```bash
cd ui
npm install
npm run lint
npm test
npm run build
```

### Simulation Mode (`--simulate`)
Iterate on UI choreography or test any model and scenario without physical hardware:
```bash
# Syntax: airpop --simulate <model> <color> <scenario>
cargo run -p airpop -- --simulate airpods-pro-3 white case-open
cargo run -p airpop -- --simulate airpods-max-2 orange connected
cargo run -p airpop -- --simulate airpods-4-anc white charging
cargo run -p airpop -- --simulate airpods-pro-3 white low-battery
```

### Capturing Live BLE Payloads (`tools/capture`)
```bash
cargo run -p airpop-capture -- --duration-secs 30
```

### Regenerating `.glb` Models & `.webp` Renders
```bash
node tools/blender/generate_assets.mjs
# Or using Blender in headless mode:
blender --background --python tools/blender/render_all.py
```

---

## <img src="docs/assets/icons/gauge.svg" width="22" height="22" align="absmiddle" alt="" /> Performance & Resource Budget

| Metric | Target Budget | Implementation Strategy |
|---|---|---|
| **Idle CPU Usage** | `~0%` | 3D `<Canvas>` unmounts when hidden and sets `frameloop="never"` on background visibility |
| **Popup First Frame** | `< 150 ms` | Pre-initialized hidden overlay windows + vendor code-splitting |
| **Animation Frame Rate** | `60 fps` | Physics springs (`spring.ts`), `dpr={[1, 1.5]}`, and `powerPreference: "low-power"` |
| **Memory Overhead** | `< 100 MB` | Explicit GPU geometry/material disposal + bounded LRU/TTL device registry |
| **Accessibility** | `WCAG 2.1 AA` | `aria-live="polite"`, `Escape` key dismissal, and `prefers-reduced-motion` support |

---

## <img src="docs/assets/icons/shield.svg" width="22" height="22" align="absmiddle" alt="" /> Security & Privacy

- **Zero Telemetry & Offline-Only**: AirPop makes zero external network requests and collects no analytics or telemetry.
- **Strict Content Security Policy (CSP) & Tauri Capabilities**: Enforces a locked-down CSP (`default-src 'self'; connect-src ipc: http://ipc.localhost`) and least-privilege Tauri v2 capabilities (`src-tauri/capabilities/default.json`).
- **Allowlist IPC Validation**: Every IPC command validates `modelId`, `color`, and settings fields against the catalog allowlist and strict length bounds. See [`SECURITY.md`](SECURITY.md) for the full threat model.
- **100% Original Assets**: All 3D `.glb` meshes, `.webp` renders, custom `1.75px` stroke SVG icons (`ui/src/shared/icons.tsx`), and synthesized Web Audio chimes are original creations. No Apple Inc. models, renders, SF Symbols, audio files, or trademarks are used.

---

## <img src="docs/assets/icons/scale.svg" width="22" height="22" align="absmiddle" alt="" /> License

Distributed under the [MIT License](LICENSE).

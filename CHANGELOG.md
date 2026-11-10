# Changelog

All notable changes to **AirPop** are documented in this file.

## [1.2.0] - 2026-11-10

### Added
- **Interactive Windows installer** with setup wizard, terms and conditions, audio chimes and settings controls.
- **Standalone `uninstall.exe`** with registry integration.
- **Taskbar flyout**: glassmorphism styling, close controls and DPI-aware positioning.
- **Multi-language support** (ES/EN/PT/FR/DE), brand assets and security hardening.

### Fixed
- Uninstaller no longer kills its own process and removes files in a hidden background step.
- Production builds are sanitized and the frontend is bundled self-contained.

## [1.1.0] - 2026-11-05

### Added
- **Universal Multi-Brand & Over-Ear (Headband) Detection (`catalog/models.json`, `src-tauri/src/device/catalog.rs`)**: Added automatic detection and 3D support for **Sony WH-1000XM5**, **Sony WH-1000XM4**, **Sony WF-1000XM5**, **Bose QuietComfort Ultra Headphones**, **Bose QuietComfort Ultra Earbuds**, **Sennheiser Momentum 4**, **Studio Pro**, and **Galaxy Buds3 Pro** alongside the existing lineup.
- **Three Sculpted 3D Rigs with Damped Spring Physics (`ui/src/popup/Scene.tsx`)**:
  - `OverEarHeadbandRig`: Articulated headband arch, metallic telescopic yokes, swiveling earcups (`over-ear-sculpted` & `over-ear-oval`), and memory-foam cushions.
  - `EarbudsRig` (`stem-earbuds` & `bud-in-ear`): Contoured case with metallic hinge insert, spring-driven lid opening, and stemmed or stemless acoustic buds.
- **Custom SVG Icon Library (`ui/src/shared/icons.tsx`, `docs/assets/icons/*.svg`)**: Added `HeadbandGlyphIcon`, `EarbudsGlyphIcon`, `ChargingBoltIcon`, and listening mode icons with zero emojis across the UI and English documentation.
- **Resource & GPU Memory Optimization**: Added vendor chunk splitting in Vite, `disposeObject3D` GPU cleanup on unmount, `frameloop="never"` when hidden, LRU/TTL bounds (`MAX_TRACKED_DEVICES = 32`) in `DeviceRegistry`, and Windows `SHQueryUserNotificationState` fullscreen detection.
- **Security Hardening (`SECURITY.md`, `src-tauri/capabilities/default.json`)**: Added strict Content Security Policy (CSP), least-privilege Tauri v2 capabilities, and allowlist IPC input validation.
- **Automated Windows `.exe` Release Pipeline (`.github/workflows/release.yml`)**: Compiles and attaches `airpop.exe`, `airpop-windows-x64.exe`, and `airpop-capture-windows-x64.exe` directly to GitHub Releases.

## [1.0.0] - 2026-11-05

### Added
- Persistent settings (`src-tauri/src/settings.rs`), Vitest automated test suite (`ui/src/__tests__/airpop.test.tsx`), CI/CD workflows, and initial production release.

# Changelog

Todos los cambios notables en **AirPop** están documentados en este archivo.

## [1.0.0] - 2026-11-05

### Añadido
- **Ajustes persistentes (`src-tauri/src/settings.rs`)**: Arranque con Windows (`autostart`), modo *No molestar*, modo de *Bajo consumo* y sonido sutil.
- **Suite de pruebas automatizadas (`ui/src/__tests__/airpop.test.tsx`)**: Cobertura de umbrales de batería, coreografía de resortes, `prefers-reduced-motion`, cierre con `Esc`, estados A/B del popup y degradación del selector de modo de escucha.
- **CI/CD en GitHub Actions (`.github/workflows/ci.yml`, `release.yml`)**: Pipeline de verificación continua y empaquetado de instaladores MSI/NSIS.
- **Documentación y Guía de Arquitectura (`README.md`, `docs/aap-spike.md`)**.

## [0.7.0] - 2026-11-05

### Añadido
- **Escena 3D en React Three Fiber (`ui/src/popup/Scene.tsx`)**: Iluminación de estudio de 3 puntos, apertura animada de la tapa (`case_lid`), salida escalonada de auriculares (`bud_left`, `bud_right`), LED emisivo y parallax suave con el ratón.
- **Popup de Proximidad y Conexión (`ui/src/popup/Popup.tsx`)**: Estado A (tarjeta de 28 px con modelo 3D y botón Conectar) y Estado B (pastilla compacta), secuencia de 3,5 s con resortes (`spring.ts`), pausa al pasar el ratón y cierre con `Esc`.
- **Anillos de Batería (`ui/src/popup/BatteryRing.tsx`)**: SVG con `stroke-dashoffset` animado, números tabulares y rayo de carga.
- **Flyout y Selector de Modo de Escucha (`ui/src/flyout/`)**: Control segmentado con iconos propios en SVG (trazo de 1,75 px) y ocultación automática cuando L2CAP no está disponible en Windows.
- **Icono de Bandeja Dinámico y Toasts (`src-tauri/src/tray.rs`, `toast.rs`)**: Renderizado en tiempo real con `tiny-skia` y limitador anti-spam de 30 minutos por evento y dispositivo.

## [0.5.0] - 2026-11-05

### Añadido
- **Ventanas Overlay Transparentes en Tauri 2 (`src-tauri/tauri.conf.json`, `lib.rs`)**: Ventanas `popup` (420×480) y `flyout` (360×420) siempre encima, sin foco, con posicionamiento DPI sobre la barra de tareas y flag `--simulate <modelo> <color> <escenario>`.
- **Contrato IPC Sincronizado (`src-tauri/src/ipc.rs`, `ui/src/shared/ipc.ts`)**.
- **Catálogo de 10 Modelos (`catalog/models.json`)**: Gama actual (`Pro 3`, `Series 4`, `Series 4 ANC`, `Max 2` en 5 colores) y gama legada.
- **Pipeline de Assets 3D (`tools/blender/render_all.py`, `generate_assets.mjs`)**: Exportación de `.glb` y `.webp` propios bajo el presupuesto de 2 MB.

## [0.3.0] - 2026-11-05

### Añadido
- **Spike AAP sobre L2CAP (`docs/aap-spike.md`, `src-tauri/src/aap/mod.rs`)**: Análisis de viabilidad en Windows frente a Linux (`bluer`) y macOS (`IOBluetooth`), más codificador/decodificador de tramas AAP.
- **Watcher Bluetooth Clásico (`src-tauri/src/bt/`)**: Trait `BtBackend`, `WindowsBtBackend` con WinRT `DeviceWatcher` y `ConnectionStatusChanged`, `ConnectionDebouncer` y `FakeBackend`.
- **Registro de Dispositivos Resistente a RPA (`src-tauri/src/device/`)**: Correlación por firma de payload sin depender de direcciones MAC rotativas.
- **Máquina de Estados (`src-tauri/src/state.rs`)**: `Idle -> CaseOpenNearby -> Connecting -> Connected -> Dismissed` con filtro RSSI (`> -60 dBm`) y antirrebote de 12 s.

## [0.2.0] - 2026-11-05

### Añadido
- **Parser BLE de Proximidad (`src-tauri/src/ble/apple_proximity.rs`)**: Decodificación de anuncios `0x004C` tipo `0x07` a `ProximityPayload` con soporte para inversión de auriculares (`flipped`), estado de tapa, color y nibbles de batería.
- **Escáner BLE (`src-tauri/src/ble/scanner.rs`)** y utilidad CLI **`tools/capture`**.
- **Fixtures de Prueba (`tests/fixtures/`)**: Payloads hexadecimales y JSON verificados con tests unitarios.

## [0.1.0] - 2026-11-05

### Añadido
- Estructura inicial del repositorio, `.gitignore`, licencia MIT, reglas y skills de agente (`.agent/`) e identidad visual de marca (`docs/assets/`).

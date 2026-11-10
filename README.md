<div align="center">

<img src="docs/assets/logo.png" alt="AirPop Logo" width="128" height="128" />

# AirPop

**3D Bluetooth Proximity Popup, Universal Multi-Brand Support, 10-Band Graphic Equalizer with Equalizer APO Sync, Dynamic Windows Tray Battery Ring, and Native Toast Notifications built with Rust (Tauri 2) and React Three Fiber.**

[![Release](https://img.shields.io/github/v/release/Ignaciobrenas/AirPop?style=flat-square&color=0a84ff)](https://github.com/Ignaciobrenas/AirPop/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/Ignaciobrenas/AirPop/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/Ignaciobrenas/AirPop/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-30d158.svg?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-Rust%20%7C%20Tauri%202%20%7C%20R3F-38bdf8?style=flat-square)](#arquitectura)
[![Languages](https://img.shields.io/badge/Languages-ES%20%7C%20EN%20%7C%20PT%20%7C%20FR%20%7C%20DE-a855f7?style=flat-square)](#sistema-de-traducciones-i18n)
[![Telemetry](https://img.shields.io/badge/Telemetry-0%25%20Offline-10b981?style=flat-square)](#privacidad-y-rendimiento)

<br />

> **Nota del autor**: Este proyecto ha sido desarrollado principalmente por un alumno del ciclo formativo de **DAW (Desarrollo de Aplicaciones Web)** que quería dar el salto a la programación de escritorio nativa de alto rendimiento, combinando el poder y seguridad de **Rust (Tauri 2)** con un frontend moderno en **React, Three.js (React Three Fiber), Framer Motion y Tailwind CSS**.

<br />

<img src="docs/assets/banner.png" alt="AirPop Hero Banner" width="100%" />

</div>

---

## 📸 Capturas de la Aplicación

### 1. Popup 3D de Proximidad y Conexión Automática
Aparece suavemente sobre la barra de tareas al abrir la caja o conectar los auriculares, con renderizado 3D a 60 FPS, física de muelles y niveles de batería individuales:

```text
  ┌──────────────────────────────────────────────────────────────┐
  │                        AirPop Overlay                        │
  │                                                              │
  │                ┌──────────────────────────┐                  │
  │                │   In-Ear · True Wireless │                  │
  │                └──────────────────────────┘                  │
  │                                                              │
  │                            ╭───╮                             │
  │                           │ 3D  │  ◄── Render interactivo    │
  │                            ╰───╯       con iluminación PBR   │
  │                                        y física de resortes  │
  │                                                              │
  │                       Sony WF-1000XM5                        │
  │                                                              │
  │          ╭────╮               ╭────╮               ╭────╮    │
  │         │ 82% │              │ 80% │              │ 64% │    │
  │          ╰────╯               ╰────╯               ╰────╯    │
  │         Izquierdo             Derecho              Estuche   │
  │                                                              │
  │                     ┌─────────────────┐                      │
  │                     │    Conectar     │                      │
  │                     └─────────────────┘                      │
  └──────────────────────────────────────────────────────────────┘
```

### 2. Ecualizador Gráfico de 10 Bandas con Curva de Frecuencia y Sincronización APO
Curva visual en tiempo real, 16 presets ajustados al estándar ISO, protección anti-clipping y sincronización directa con el driver Equalizer APO de Windows:

```text
  ┌──────────────────────────────────────────────────────────────┐
  │                     Ecualizador Gráfico                      │
  │  Activo · Preamplificador: -4.0 dB       [Plano] [ ON / OFF] │
  ├──────────────────────────────────────────────────────────────┤
  │  ▲ +12 dB        ╭───────╮                                   │
  │  │              ╱         ╲        ╭──────╮                  │
  │  │  0 dB ──────╱───────────╲──────╱────────╲─────── 0 dB     │
  │  │                               ╱                           │
  │  ▼ -12 dB                       ╱                            │
  ├──────────────────────────────────────────────────────────────┤
  │   +6    +4    +2    -1    -2    -1    +2    +4    +5    +5   │
  │   │█│   │█│   │ │   │ │   │ │   │ │   │ │   │█│   │█│   │█│  │
  │   │█│   │█│   │█│   │ │   │ │   │ │   │█│   │█│   │█│   │█│  │
  │   │█│   │█│   │█│   │█│   │█│   │█│   │█│   │█│   │█│   │█│  │
  │   31    62    125   250   500   1k    2k    4k    8k    16k  │
  ├──────────────────────────────────────────────────────────────┤
  │  Estilos: [Plano] [Graves +] [Agudos +] [Rock] [Pop] [Gaming]│
  │  ● Sincronizado con Equalizer APO             [Sincronizar]  │
  └──────────────────────────────────────────────────────────────┘
```

### 3. Flyout de Barra de Tareas con 3 Pestañas y Notificaciones Nativas
Integrado en la bandeja del sistema de Windows con icono de batería dinámico y menús Mica/Acrílico:

```text
  ┌──────────────────────────────────────────────────────────────┐
  │  [ Dispositivo ]       [ Ecualizador ]         [ Ajustes ]   │
  ├──────────────────────────────────────────────────────────────┤
  │  🎧 Sony WH-1000XM5                   [ ⇄ Cambiar a In-Ear ] │
  │     Diadema · Over-Ear · Conectado                           │
  │                                                              │
  │                    ╭──────────────────╮                      │
  │                   │    Diadema 90%   │                       │
  │                    ╰──────────────────╯                      │
  │                                                              │
  │  Modo de escucha:                                            │
  │  ┌──────────────┬──────────────┬──────────────┬───────────┐  │
  │  │ Cancelación  │   Ambiente   │  Adaptativo  │ Desactiv. │  │
  │  └──────────────┴──────────────┴──────────────┴───────────┘  │
  └──────────────────────────────────────────────────────────────┘
  
  ┌──────────────────────────────────────────────────────────────┐
  │ 🔔 Windows Notification                                   ✕  │
  │ AirPop • Conectado                                           │
  │ Sony WH-1000XM5 conectado • Batería: L 90% | R 90%           │
  └──────────────────────────────────────────────────────────────┘
```

---

## ✨ Características Principales

- **Compatibilidad Universal Multi-Marca (53+ Modelos + Genéricos)**:
  - **Sony**: WH-1000XM5, WH-1000XM4, WH-1000XM3, WF-1000XM5, WF-1000XM4, LinkBuds S.
  - **Bose**: QuietComfort Ultra Headphones, QuietComfort Ultra Earbuds, QuietComfort 45, QuietComfort 35 II, Noise Cancelling Headphones 700.
  - **Beats**: Studio Pro, Studio3 Wireless, Solo 4, Solo3, Fit Pro, Powerbeats Pro, Beats Flex.
  - **Sennheiser**: Momentum 4 Wireless, Momentum 3 Wireless, Accentum Plus, HD 450BT.
  - **JBL**: Tour One M2, Live 660NC, Tune 770NC.
  - **Nothing**: Ear (2), Ear (a), Headphone (1).
  - **Familia Pro / Max**: Pro 1/2/3, Series 1/2/3/4/4 ANC, Max 1/2.
  - **Genéricos Universales**: Detección inteligente de cualquier auricular Bluetooth o diadema mediante análisis de nombres (`Name Token Classifier`) y Clase de Dispositivo Bluetooth (`Class of Device 0x200404`).
- **Selector Dinámico de Factor de Forma**:
  - ¿Tus auriculares son detectados como In-Ear pero son de diadema (o viceversa)? Con un solo clic en el botón `[⇄ Over-Ear / In-Ear]` del Flyout puedes alternar el factor de forma al instante.
- **Ecualizador Gráfico Paramétrico de 10 Bandas**:
  - Bandas estándar ISO: **31 Hz, 62 Hz, 125 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz, 8 kHz, 16 kHz**.
  - Ganancia continua de **-12 dB a +12 dB** con filtros biquad peaking (Q = 1.41).
  - Cálculo automático de **preamplificador anti-clipping** (`headroom` de seguridad).
  - **16 Presets Afinados**: *Plano, Graves+, Graves−, Agudos+, Voces, Podcast, Rock, Pop, Hip-hop, Electrónica, Jazz, Clásica, Acústica, Loudness, Gaming y Nocturno*.
  - **Integración con Equalizer APO**: Detección del directorio de instalación en Windows y exportación directa de directivas limpias a `config.txt` con aislamiento seguro de inyecciones.
- **Sistema de Traducciones Completo (5 Idiomas)**:
  - 🇪🇸 **Español** (ES)
  - 🇬🇧 **English** (EN)
  - 🇵🇹 **Português** (PT)
  - 🇫🇷 **Français** (FR)
  - 🇩🇪 **Deutsch** (DE)
  - Detección automática del idioma del sistema operativo y selector manual en la pestaña de Ajustes con persistencia.
- **Presencia Discreta en la Barra de Tareas de Windows**:
  - **Icono Dinámico en la Bandeja**: Dibujado en memoria píxel a píxel con `tiny-skia`, mostrando un anillo de batería con color semántico (verde >30%, amarillo 15-30%, rojo <15%).
  - **Notificaciones Nativas al Conectar**: Al vincularse o encender los auriculares, Windows muestra una notificación nativa con el nombre y nivel de carga.
  - **Toasts Anti-Spam Inteligentes**: Alertas de batería baja (20% y 10%) con limitador de spam de máximo 1 notificación cada 30 minutos por dispositivo.
- **Diseño Ultra Moderno con Estilo Apple y Bordes Redondeados**:
  - Tokens de diseño unificados: `--radius-card: 28px`, `--radius-control: 14px`, `--radius-pill: 999px`.
  - Animaciones 100% basadas en física de muelles (`spring.ts`), respetando `prefers-reduced-motion`.
  - Materiales Mica y Acrílico nativos de Windows 11 vía `window-vibrancy`.
- **Rendimiento y Privacidad Absoluta**:
  - 0% CPU y GPU cuando las ventanas están ocultas (`frameloop="never"`).
  - Supresión automática del popup cuando hay videojuegos o aplicaciones a pantalla completa (`SHQueryUserNotificationState`).
  - Sin telemetría, sin rastreadores y sin conexión a internet. Funciona 100% offline.

---

## 🏗️ Arquitectura

```text
┌───────────────────────────────────────────────────────────┐
│ Rust Core (Tauri 2)                                       │
│                                                           │
│  ble::scanner ──► ble::apple_proximity                    │
│        │                                                  │
│  bt::windows (DeviceWatcher) ──► device::classify         │
│        │                                │                 │
│        ▼                                ▼                 │
│  state::machine ◄────────────── device::registry          │
│        │                                                  │
│        ├─► ipc (contrato sincronizado) ──► popup window   │
│        ├─► tray (icono tiny-skia)       ──► flyout window  │
│        ├─► toast (notificaciones Windows)                 │
│        ├─► eq::apo (generador Equalizer APO)              │
│        └─► settings (preferencias y arranque)             │
└───────────────────────────────────────────────────────────┘
                         │ IPC Commands & Events
                         ▼
┌───────────────────────────────────────────────────────────┐
│ Frontend UI (WebView2)                                    │
│  popup:   React + R3F + 3 Rigs 3D + Física de resortes    │
│  flyout:  Segmented Tabs + Equalizer 10-Band + Settings   │
│  i18n:    Traducciones (ES, EN, PT, FR, DE)               │
│  store:   Zustand Store reactivo con persistencia local   │
└───────────────────────────────────────────────────────────┘
```

---

## 🌍 Sistema de Traducciones (i18n)

El sistema de internacionalización implementado en [`ui/src/shared/i18n.ts`](ui/src/shared/i18n.ts) cubre la totalidad de la interfaz:

| Idioma | Código | Pestañas | Modos de Escucha | Ecualizador | Ajustes |
|---|---|---|---|---|---|
| **Español** | `es` | Dispositivo, Ecualizador, Ajustes | Cancelación, Ambiente, Adaptativo, Off | 10 bandas, 16 presets, APO | No molestar, Bajo consumo, Autostart |
| **English** | `en` | Device, Equalizer, Settings | Noise Cancellation, Transparency, Adaptive, Off | 10 bands, 16 presets, APO | Do Not Disturb, Low Power, Autostart |
| **Português** | `pt` | Dispositivo, Equalizador, Ajustes | Cancelamento de Ruído, Ambiente, Adaptativo, Off | 10 bandas, 16 predefinições, APO | Não perturbe, Economia de energia |
| **Français** | `fr` | Appareil, Égaliseur, Paramètres | Réduction de bruit, Transparence, Adaptatif, Off | 10 bandes, 16 préréglages, APO | Ne pas déranger, Économie d'énergie |
| **Deutsch** | `de` | Gerät, Equalizer, Einstellungen | Geräuschunterdrückung, Transparenz, Adaptiv, Aus | 10 Bänder, 16 Voreinstellungen, APO | Nicht stören, Energiesparmodus |

---

## 🎛️ Ecualizador y Presets Disponibles

El ecualizador paramétrico incluye 16 perfiles calibrados:

| Preset | Graves (31-125 Hz) | Medios (250-2000 Hz) | Agudos (4k-16k Hz) | Descripción |
|---|---|---|---|---|
| **Plano** | `0, 0, 0 dB` | `0, 0, 0, 0 dB` | `0, 0, 0 dB` | Respuesta lineal y transparente |
| **Graves +** | `+6, +5, +4 dB` | `+2, 0, 0, 0 dB` | `0, 0, 0 dB` | Refuerzo de subgraves y pegada |
| **Graves −** | `-6, -5, -3 dB` | `-1, 0, 0, 0 dB` | `0, 0, 0 dB` | Atenuación de frecuencias retumbantes |
| **Agudos +** | `0, 0, 0 dB` | `0, 0, +1, +2 dB` | `+4, +5, +6 dB` | Brillo, aire y definición en instrumentos |
| **Voces** | `-2, -2, -1 dB` | `+1, +3, +4, +4 dB` | `+2, 0, -1 dB` | Claridad óptima para voz humana |
| **Podcast** | `-4, -3, -1 dB` | `+2, +4, +4, +3 dB` | `+1, -1, -3 dB` | Filtro de corte bajo y realce vocal |
| **Rock** | `+5, +4, +2 dB` | `-1, -2, -1, +2 dB` | `+4, +5, +5 dB` | Curva en V para guitarras y batería |
| **Pop** | `-1, +1, +3 dB` | `+4, +3, 0, -1 dB` | `-1, +1, +2 dB` | Ritmo balanceado y voces al frente |
| **Hip-hop** | `+5, +4, +2 dB` | `+3, -1, -1, +1 dB` | `-1, +2, +3 dB` | Subgraves contundentes y agudos nítidos |
| **Electrónica** | `+5, +4, +1 dB` | `0, -2, +2, +1 dB` | `+2, +4, +5 dB` | Pegada rápida y brillo sintético |
| **Jazz** | `+3, +2, +1 dB` | `+2, -2, -2, 0 dB` | `+1, +2, +3 dB` | Calidez en contrabajo y metales suaves |
| **Clásica** | `+4, +3, +2 dB` | `+2, -1, -1, 0 dB` | `+2, +3, +4 dB` | Rango dinámico amplio para orquesta |
| **Acústica** | `+4, +3, +2 dB` | `+1, +2, +2, +3 dB` | `+3, +3, +2 dB` | Realce para cuerdas y percusión ligera |
| **Loudness** | `+6, +4, +1 dB` | `0, -1, 0, -1 dB` | `+1, +4, +5 dB` | Compensación para bajo volumen |
| **Gaming** | `-2, -1, 0 dB` | `0, 0, +2, +4 dB` | `+5, +3, +1 dB` | Enfoque en pasos y pistas de audio espacial |
| **Nocturno** | `-3, -2, 0 dB` | `+2, +3, +3, +2 dB` | `+1, 0, -2 dB` | Graves suaves para no cansar el oído |

---

## 📥 Descarga

Descarga el ejecutable de Windows (`airpop-windows-x64.exe`) desde la [última release](https://github.com/Ignaciobrenas/AirPop/releases/latest) y ejecútalo directamente.

## 🚀 Compilación y Desarrollo

### Requisitos
- **Node.js** v18+ y `npm`
- **Rust** 1.80+ (`stable-x86_64-pc-windows-gnu` o `msvc`)
- **Tauri CLI 2**

### Pasos de compilación

```powershell
# 1. Clonar el repositorio
git clone https://github.com/Ignaciobrenas/AirPop.git
cd AirPop

# 2. Instalar dependencias del frontend
cd ui
npm install

# 3. Compilar el frontend a producción
npm run build

# 4. Compilar el ejecutable nativo de Rust
cd ../src-tauri
cargo build --release --bin airpop
```

El ejecutable compilado se encontrará en:
`target/x86_64-pc-windows-gnu/release/airpop.exe`

### Ejecución de Tests y Verificación de Calidad

```powershell
# Tests unitarios del backend Rust (39 tests de Bluetooth, BLE, EQ y Estado)
cargo test

# Linter sin advertencias
cargo clippy --all-targets -- -D warnings

# Verificación de formato de código
cargo fmt --check

# Tests unitarios del frontend React / Vitest (8 suites completas)
cd ui
npm test

# Verificación de tipos TypeScript
npm run lint
```

---

## 🎮 Comandos de Simulación (CLI)

Puedes probar cualquier modelo y escenario sin necesidad de conectar hardware físico:

```powershell
# Probar popup de Sony WH-1000XM5
.\airpop.exe --simulate sony-wh-1000xm5 black case-open

# Probar conexión con notificación de Bose QC Ultra
.\airpop.exe --simulate bose-qc-ultra-headphones white connected

# Probar aviso de batería baja
.\airpop.exe --simulate sennheiser-momentum-4 graphite low-battery

# Probar auriculares genéricos
.\airpop.exe --simulate generic-headphones black connected
```

---

## 🛡️ Privacidad y Seguridad

- **100% Fuera de Línea**: La aplicación no realiza peticiones HTTP/HTTPS externas ni envía telemetría.
- **Sin Inyección de DLLs**: Toda la comunicación con el subsistema de audio se realiza mediante directivas estándar declarativas de Equalizer APO.
- **Limpieza de Recursos GPU**: Los búferes y texturas de WebGL se destruyen explícitamente al cerrar ventanas para evitar fugas de VRAM.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <sub>Desarrollado con dedicación y pasión por el desarrollo de software nativo y web.</sub>
</div>

# Spike: Protocolo AAP sobre L2CAP para Modo de Escucha

## 1. Resumen y Decisión

| Plataforma | Viabilidad de L2CAP (`PSM 0x1001`) | Estado en AirPop |
|---|---|---|
| **Windows 10/11 (Stack nativo `bthport.sys`)** | **No viable en espacio de usuario estándar** (bloqueado por Winsock/WinRT para PSM dinámicos BR/EDR) | **Plan B (Degradación elegante)**: ocultar el selector de modo de escucha en hardware real bajo Windows estándar; habilitar en modo `--simulate` |
| **Linux (BlueZ / `bluer`)** | **Viable** (`bluer::l2cap::Socket` con `SocketAddr::new(addr, AddressType::BrEdr, 0x1001)`) | **Soportado** detrás de `#[cfg(target_os = "linux")]` |
| **macOS (`IOBluetooth`)** | **Viable** (`openL2CAPChannelSync:withPSM:delegate:` sobre `0x1001`) | **Soportado** detrás de `#[cfg(target_os = "macos")]` |

---

## 2. Investigación Técnica en Windows

El protocolo **AAP (Apple Accessory Protocol)** intercambia mensajes de control y notificaciones de estado (incluyendo el modo de escucha: Cancelación de ruido, Transparencia, Adaptativo y Desactivado) sobre un canal **Bluetooth Clásico (BR/EDR) L2CAP** en el **PSM `0x1001` (4097)**.

### 2.1 Winsock (`AF_BTH`)
- Windows expone sockets Bluetooth mediante `socket(AF_BTH, SOCK_STREAM, BTHPROTO_RFCOMM)`.
- La constante `BTHPROTO_L2CAP` (`0x0100`) existe en los encabezados del SDK (`ws2bth.h`), pero el proveedor Winsock de Microsoft (`bthprops.cpl` / `wshbth.dll`) rechaza llamadas `socket(AF_BTH, SOCK_SEQPACKET, BTHPROTO_L2CAP)` desde procesos de usuario con el error `WSAEPROTONOSUPPORT` (`10043`).
- El acceso a canales L2CAP BR/EDR en Windows está restringido a **drivers de perfil en modo kernel (KMDF/WDM)** que envían IRPs (`BRB_L2CA_OPEN_CHANNEL`) directamente a `bthport.sys`.

### 2.2 WinRT (`Windows.Devices.Bluetooth`)
- `BluetoothDevice` permite enumerar servicios SDP y abrir `RfcommDeviceService`.
- No existe ninguna clase pública en WinRT para abrir un canal L2CAP sobre Bluetooth clásico (`BluetoothL2capChannel` solo existe de forma limitada para BLE CoC en versiones recientes y no aplica a BR/EDR `PSM 0x1001`).

### 2.3 Alternativas con Driver de Terceros (Descartadas para MVP/v1)
- Reemplazar el driver Bluetooth del sistema mediante **WinUSB / Zadig** inutiliza el stack de audio A2DP/HFP de Windows, haciendo que los auriculares dejen de funcionar como dispositivo de sonido del sistema.
- Un **Filter Driver KMDF firmado con EV** que exponga un dispositivo IOCTL para enviar BRBs a `bthport.sys` es técnicamente posible pero introduce riesgo de BSOD, requisitos de firma de kernel de Microsoft (WHQL/HLK) y fricción de instalación desproporcionada.

---

## 3. Estructura de Paquetes AAP (Referencia Multiplataforma)

1. **Handshake inicial (Host → Auriculares)**:
   ```text
   00 00 04 00 01 00 02 00 00 00 00 00 00 00 00 00
   ```
2. **Suscripción a notificaciones (Host → Auriculares)**:
   ```text
   04 00 04 00 0F 00 FF FF FE FF
   ```
3. **Notificación / Cambio de Modo de Escucha (`0x0D` / ajuste `0x09`)**:
   ```text
   04 00 04 00 09 00 0D <MODE_BYTE> 00 00 00
   ```
   Donde `<MODE_BYTE>`:
   - `0x01`: `Off` (Desactivado)
   - `0x02`: `NoiseCancellation` (Cancelación activa de ruido)
   - `0x03`: `Transparency` (Transparencia)
   - `0x04`: `Adaptive` (Audio adaptativo)

---

## 4. Estrategia de Degradación (Plan B en Windows)

De acuerdo con la sección 5.C y la skill `aap-listening-mode-spike`:
1. `aap::AapController::is_supported()` devuelve `false` en sesiones reales de Windows y `true` en Linux, macOS o cuando la app se ejecuta en modo `--simulate`.
2. El payload IPC e interfaz de estado exponen `aapSupported: boolean`.
3. En el **Flyout** (`ui/src/flyout/Flyout.tsx`), si `aapSupported` es `false` o el modelo del catálogo no tiene modos de escucha (`listeningModes.length === 0`), el componente `ModeSelector` se oculta limpiamente sin romper el layout ni dejar espacios vacíos.

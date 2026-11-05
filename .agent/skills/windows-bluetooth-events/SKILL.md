---
name: windows-bluetooth-events
description: Detecta conexión y desconexión de dispositivos Bluetooth clásicos en Windows con el crate windows y las envía a la máquina de estados. Úsala al tocar src-tauri/src/bt.
---

# Objetivo
Emitir eventos `Connected` y `Disconnected` fiables para el dispositivo del usuario.

# Pasos
1. Usa `DeviceWatcher` sobre el selector de dispositivos Bluetooth emparejados.
2. Para cada dispositivo, suscríbete a `BluetoothDevice.ConnectionStatusChanged`.
3. Mapea el cambio a un `BtEvent` y envíalo por un canal `tokio::sync::mpsc` a `state::machine`.
4. Aplica antirrebote para no emitir dos veces por reconexión rápida.
5. Expón un trait `BtBackend` implementado por `bt::windows`; deja stubs en `linux.rs` y `macos.rs`.

# Reglas
- Todo el código de WinRT detrás de `#[cfg(windows)]`.
- No bloquear el hilo principal de Tauri.
- Logs con `tracing`.

# Hecho cuando
- Conectar y desconectar los auriculares produce los eventos esperados en un log.
- Hay un `FakeBackend` para tests de la máquina de estados.

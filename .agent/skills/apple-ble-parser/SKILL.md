---
name: apple-ble-parser
description: Decodifica los anuncios BLE de proximidad de Apple (company ID 0x004C, tipo 0x07) a modelo, batería, carga, tapa y color. Úsala al tocar src-tauri/src/ble o al añadir fixtures.
---

# Objetivo
Convertir bytes de manufacturer data en una estructura tipada, con tests.

# Pasos
1. Define `ProximityPayload { model_id, color, battery_left, battery_right, battery_case, charging, lid_open, flipped }`.
2. Implementa `parse(data: &[u8]) -> Result<ProximityPayload, ParseError>` en `ble/apple_proximity.rs`. Rechaza longitudes y tipos inesperados.
3. Batería en nibbles: 0..=10 es 0-100 % en pasos de 10, 0xF es desconocido. Usa `Option<u8>`.
4. Aplica el bit de intercambio de auriculares antes de asignar izquierdo y derecho.
5. Guarda cada payload capturado en `tests/fixtures/<modelo>-<escenario>.hex` con nombre descriptivo.
6. Un test por fixture, con los valores esperados anotados en el propio nombre o en un `.json` junto al fixture.

# Reglas
- No asumas offsets: confírmalos con fixtures reales.
- Correlaciona dispositivos por payload, no por dirección MAC (rota).
- Sin `unwrap` en el parser. Errores con `thiserror`.

# Hecho cuando
- `cargo test` pasa con al menos un fixture por modelo capturado.
- Un payload desconocido devuelve `ParseError`, no panic.

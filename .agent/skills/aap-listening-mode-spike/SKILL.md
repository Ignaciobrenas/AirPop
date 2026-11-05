---
name: aap-listening-mode-spike
description: Spike para leer y cambiar el modo de escucha (cancelación, transparencia, adaptativo) por AAP sobre L2CAP. Úsala antes de construir el selector de modo.
---

# Objetivo
Decidir con evidencia si el modo de escucha es viable en Windows.

# Pasos
1. Investiga si hay una API de L2CAP utilizable en Windows (WinRT, Winsock Bluetooth, driver de terceros).
2. Prueba el mismo enfoque en Linux con `bluer` como referencia.
3. Documenta en `docs/aap-spike.md`: qué funciona, qué no y qué falta.
4. Si es inviable en Windows, define la degradación: ocultar el selector y mostrar solo batería y modelo.

# Reglas
- Es un spike: no integres en la app hasta tener la conclusión.
- No escribas ningún paquete al dispositivo sin entender el handshake.

# Hecho cuando
- Existe `docs/aap-spike.md` con decisión (viable, no viable, solo Linux/macOS).

---
name: tray-flyout-toast
description: Icono de bandeja dinámico con anillo de batería, flyout con selector de modo de escucha y toasts nativos. Úsala al tocar src-tauri/src/tray.rs, toast.rs o ui/src/flyout.
---

# Objetivo
Presencia útil y discreta en la barra de tareas.

# Pasos
1. Dibuja el icono de bandeja con `tiny-skia`: anillo con el mínimo entre L, R y caja, color por nivel.
2. Actualiza icono y tooltip con cada `device://battery`.
3. Menú contextual: Ajustes, No molestar, Probar popup, Salir.
4. Flyout: render de la caja, tres baterías y control segmentado con los modos que soporta el modelo.
5. Toasts solo para batería al 20 % y al 10 %, caja cargada y conexión (si el popup está desactivado).

# Reglas
- Si el modo de escucha no es viable en Windows, ocultar el selector sin romper el layout.
- No spamear: máximo un toast por evento y por dispositivo cada 30 minutos.

# Hecho cuando
- El icono refleja la batería en menos de 1 s tras un cambio.
- El flyout se ancla bien con la barra de tareas arriba, abajo y a los lados.

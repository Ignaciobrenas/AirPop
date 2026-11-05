---
name: tauri-overlay-window
description: Crea y gestiona las ventanas transparentes, sin foco y siempre encima (popup y flyout) en Tauri 2, con posicionamiento sobre la barra de tareas y multi-monitor. Úsala al tocar tauri.conf.json o la gestión de ventanas.
---

# Objetivo
Ventanas overlay que aparezcan al instante, no roben el foco y no consuman CPU en reposo.

# Pasos
1. Declara las ventanas `popup` y `flyout` ocultas en `tauri.conf.json` (transparent, decorations false, alwaysOnTop, skipTaskbar, focus false).
2. Muestra con `show()` sin darle foco y oculta con `hide()` tras el temporizador.
3. Posiciona el popup en el centro inferior del monitor con la barra de tareas, con margen de 16-24 px, teniendo en cuenta DPI.
4. Click-through con `set_ignore_cursor_events`, desactivado mientras el ratón esté sobre la tarjeta.
5. El flyout se ancla al `rect` del icono de la bandeja.
6. Ajuste de modo bajo consumo: destruir el webview cuando no se use.

# Reglas
- Material: Acrylic/Mica nativo (`window-vibrancy`) solo en el flyout. El popup usa material simulado con esquinas de 28 px.
- Nada de lógica de negocio en este módulo.

# Hecho cuando
- El popup aparece en menos de 150 ms y no roba el foco de la app activa.
- CPU cercano a 0 % con las ventanas ocultas.

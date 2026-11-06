pub mod aap;
pub mod ble;
pub mod bt;
pub mod commands;
pub mod device;
pub mod eq;
pub mod ipc;
pub mod settings;
pub mod state;
pub mod toast;
pub mod tray;

use crate::aap::{AapController, ListeningMode};
use crate::ble::apple_proximity::{BatteryState, ChargingState};
use crate::device::catalog::ModelCatalog;
use crate::device::registry::DeviceRegistry;
use crate::ipc::{
    BatteryEventPayload, CaseOpenEventPayload, ConnectedEventPayload, SimulationScenario,
    EVENT_BATTERY, EVENT_CASE_OPEN, EVENT_CONNECTED,
};
use crate::settings::AppSettings;
use crate::state::StateMachine;
use crate::toast::ToastLimiter;
use clap::Parser;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, WebviewWindow};

#[derive(Parser, Debug, Clone, Default)]
#[command(name = "airpop")]
pub struct CliArgs {
    #[arg(long, num_args = 1..=3, value_names = ["MODEL", "COLOR", "SCENARIO"])]
    pub simulate: Option<Vec<String>>,

    #[arg(long, default_value_t = false)]
    pub debug: bool,
}

pub struct AppRuntimeState {
    pub settings: AppSettings,
    pub state_machine: StateMachine,
    pub registry: DeviceRegistry,
    pub aap: AapController,
    pub toast_limiter: ToastLimiter,
    pub eq_presets: crate::eq::EqPresets,
    pub eq_profile: crate::eq::EqProfile,
    pub apo_dir: Option<std::path::PathBuf>,
}

impl AppRuntimeState {
    pub fn new(simulated: bool) -> Self {
        let apo_dir = crate::eq::apo::locate_config_dir();
        Self {
            settings: AppSettings::default(),
            state_machine: StateMachine::new(),
            registry: DeviceRegistry::new(ModelCatalog::embedded()),
            aap: AapController::new(simulated),
            toast_limiter: ToastLimiter::new(),
            eq_presets: crate::eq::EqPresets::embedded(),
            eq_profile: crate::eq::EqProfile::default(),
            apo_dir,
        }
    }
}

pub fn is_windows_fullscreen_busy() -> bool {
    #[cfg(windows)]
    {
        use windows::Win32::UI::Shell::{
            SHQueryUserNotificationState, QUNS_BUSY, QUNS_PRESENTATION_MODE,
            QUNS_RUNNING_D3D_FULL_SCREEN,
        };
        if let Ok(state) = unsafe { SHQueryUserNotificationState() } {
            return state == QUNS_RUNNING_D3D_FULL_SCREEN
                || state == QUNS_PRESENTATION_MODE
                || state == QUNS_BUSY;
        }
        false
    }
    #[cfg(not(windows))]
    {
        false
    }
}

pub fn sanitize_settings(mut settings: AppSettings) -> AppSettings {
    if let Some(ref monitor) = settings.preferred_monitor {
        let valid = monitor.len() <= 64
            && monitor
                .chars()
                .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == ' ');
        if !valid {
            settings.preferred_monitor = None;
        }
    }
    settings
}

pub fn position_popup_bottom_center(window: &WebviewWindow) {
    if let Ok(Some(monitor)) = window
        .current_monitor()
        .or_else(|_| window.primary_monitor())
    {
        let screen_size = monitor.size();
        let screen_pos = monitor.position();
        let scale = monitor.scale_factor();
        let win_size = window.outer_size().unwrap_or(tauri::PhysicalSize::new(
            (420.0 * scale) as u32,
            (480.0 * scale) as u32,
        ));
        let taskbar_margin_px = (68.0 * scale) as i32;

        let x = screen_pos.x + ((screen_size.width as i32 - win_size.width as i32) / 2);
        let y = screen_pos.y + (screen_size.height as i32)
            - (win_size.height as i32)
            - taskbar_margin_px;
        let _ = window.set_position(PhysicalPosition::new(x, y));
    }
}

pub fn show_connected_notification(app: &AppHandle, name: &str, battery: &BatteryState) {
    use tauri_plugin_notification::NotificationExt;
    let body = match (battery.left, battery.right) {
        (Some(l), Some(r)) => format!("{} conectado • Batería: L {}% | R {}%", name, l, r),
        (Some(l), None) => format!("{} conectado • Batería: {}%", name, l),
        _ => format!("{} conectado y listo para usar", name),
    };
    let _ = app
        .notification()
        .builder()
        .title("AirPop • Conectado")
        .body(body)
        .show();
}

pub fn show_popup_overlay(app: &AppHandle) {
    if is_windows_fullscreen_busy() {
        return;
    }
    if let Some(window) = app.get_webview_window("popup") {
        position_popup_bottom_center(&window);
        let _ = window.set_ignore_cursor_events(false);
        let _ = window.show();
    }
}

pub fn trigger_simulation(
    app: &AppHandle,
    state: &Mutex<AppRuntimeState>,
    model_id: &str,
    color: &str,
    scenario: SimulationScenario,
) {
    let (display_name, is_over_ear, resolved_color) = if let Ok(guard) = state.lock() {
        let catalog = guard.registry.catalog();
        if let Some(m) = catalog.find_by_id(model_id) {
            let valid_color = if m.colors.iter().any(|c| c.id == color) {
                color.to_string()
            } else {
                m.colors
                    .first()
                    .map(|c| c.id.clone())
                    .unwrap_or_else(|| "white".to_string())
            };
            (m.display_name.clone(), m.is_over_ear(), valid_color)
        } else {
            ("Pro 3".to_string(), false, "white".to_string())
        }
    } else {
        ("Pro 3".to_string(), false, "white".to_string())
    };

    show_popup_overlay(app);

    let default_case = if is_over_ear { None } else { Some(64) };

    match scenario {
        SimulationScenario::CaseOpen => {
            let payload = CaseOpenEventPayload {
                model_id: model_id.to_string(),
                display_name,
                color: resolved_color,
                battery: BatteryState {
                    left: Some(82),
                    right: Some(80),
                    case: default_case,
                },
                charging: ChargingState {
                    left: false,
                    right: false,
                    case: false,
                },
                rssi: -46,
                aap_supported: true,
            };
            let _ = app.emit(EVENT_CASE_OPEN, payload);
        }
        SimulationScenario::Connected => {
            show_connected_notification(
                app,
                &display_name,
                &BatteryState {
                    left: Some(82),
                    right: Some(80),
                    case: default_case,
                },
            );
            let payload = ConnectedEventPayload {
                name: display_name,
                model_id: model_id.to_string(),
                color: resolved_color,
                battery: BatteryState {
                    left: Some(82),
                    right: Some(80),
                    case: default_case,
                },
                listening_mode: Some(ListeningMode::NoiseCancellation),
                aap_supported: true,
            };
            let _ = app.emit(EVENT_CONNECTED, payload);
        }
        SimulationScenario::LowBattery => {
            let payload = CaseOpenEventPayload {
                model_id: model_id.to_string(),
                display_name,
                color: resolved_color,
                battery: BatteryState {
                    left: Some(14),
                    right: Some(14),
                    case: if is_over_ear { None } else { Some(10) },
                },
                charging: ChargingState {
                    left: false,
                    right: false,
                    case: false,
                },
                rssi: -49,
                aap_supported: true,
            };
            let _ = app.emit(EVENT_CASE_OPEN, payload);
        }
        SimulationScenario::Charging => {
            let payload = CaseOpenEventPayload {
                model_id: model_id.to_string(),
                display_name,
                color: resolved_color,
                battery: BatteryState {
                    left: Some(54),
                    right: Some(58),
                    case: if is_over_ear { None } else { Some(76) },
                },
                charging: ChargingState {
                    left: true,
                    right: true,
                    case: !is_over_ear,
                },
                rssi: -44,
                aap_supported: true,
            };
            let _ = app.emit(EVENT_CASE_OPEN, payload);
            let _ = app.emit(
                EVENT_BATTERY,
                BatteryEventPayload {
                    left: Some(54),
                    right: Some(58),
                    case: if is_over_ear { None } else { Some(76) },
                    charging: ChargingState {
                        left: true,
                        right: true,
                        case: !is_over_ear,
                    },
                },
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use super::sanitize_settings;
    use crate::settings::AppSettings;

    #[test]
    fn test_sanitize_settings_rejects_invalid_monitor_names() {
        let bad = AppSettings {
            preferred_monitor: Some("../../malicious/path".to_string()),
            ..AppSettings::default()
        };
        let sanitized = sanitize_settings(bad);
        assert_eq!(sanitized.preferred_monitor, None);

        let good = AppSettings {
            preferred_monitor: Some("DISPLAY-1".to_string()),
            ..AppSettings::default()
        };
        let sanitized_good = sanitize_settings(good);
        assert_eq!(
            sanitized_good.preferred_monitor,
            Some("DISPLAY-1".to_string())
        );
    }
}

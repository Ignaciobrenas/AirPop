pub mod aap;
pub mod ble;
pub mod bt;
pub mod device;
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
    BatteryEventPayload, CaseOpenEventPayload, ConnectedEventPayload, ListeningModeEventPayload,
    SimulationScenario, EVENT_BATTERY, EVENT_CASE_OPEN, EVENT_CONNECTED, EVENT_LISTENING_MODE,
    EVENT_SETTINGS,
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
}

impl AppRuntimeState {
    pub fn new(simulated: bool) -> Self {
        Self {
            settings: AppSettings::default(),
            state_machine: StateMachine::new(),
            registry: DeviceRegistry::new(ModelCatalog::embedded()),
            aap: AapController::new(simulated),
            toast_limiter: ToastLimiter::new(),
        }
    }
}

pub fn position_popup_bottom_center(window: &WebviewWindow) {
    if let Ok(Some(monitor)) = window.current_monitor().or_else(|_| window.primary_monitor()) {
        let screen_size = monitor.size();
        let screen_pos = monitor.position();
        let scale = monitor.scale_factor();
        let win_size = window
            .outer_size()
            .unwrap_or(tauri::PhysicalSize::new((420.0 * scale) as u32, (480.0 * scale) as u32));
        let taskbar_margin_px = (68.0 * scale) as i32;

        let x = screen_pos.x + ((screen_size.width as i32 - win_size.width as i32) / 2);
        let y = screen_pos.y + (screen_size.height as i32) - (win_size.height as i32) - taskbar_margin_px;
        let _ = window.set_position(PhysicalPosition::new(x, y));
    }
}

pub fn show_popup_overlay(app: &AppHandle) {
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
    let display_name = if let Ok(guard) = state.lock() {
        guard
            .registry
            .catalog()
            .find_by_id(model_id)
            .map(|m| m.display_name.clone())
            .unwrap_or_else(|| "Pro 3".to_string())
    } else {
        "Pro 3".to_string()
    };

    show_popup_overlay(app);

    match scenario {
        SimulationScenario::CaseOpen => {
            let payload = CaseOpenEventPayload {
                model_id: model_id.to_string(),
                display_name,
                color: color.to_string(),
                battery: BatteryState {
                    left: Some(82),
                    right: Some(80),
                    case: Some(64),
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
            let payload = ConnectedEventPayload {
                name: display_name,
                model_id: model_id.to_string(),
                color: color.to_string(),
                battery: BatteryState {
                    left: Some(82),
                    right: Some(80),
                    case: Some(64),
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
                color: color.to_string(),
                battery: BatteryState {
                    left: Some(14),
                    right: Some(22),
                    case: Some(10),
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
                color: color.to_string(),
                battery: BatteryState {
                    left: Some(54),
                    right: Some(58),
                    case: Some(76),
                },
                charging: ChargingState {
                    left: true,
                    right: true,
                    case: true,
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
                    case: Some(76),
                    charging: ChargingState {
                        left: true,
                        right: true,
                        case: true,
                    },
                },
            );
        }
    }
}

#[tauri::command]
pub fn set_listening_mode(
    app: AppHandle,
    state: tauri::State<'_, Mutex<AppRuntimeState>>,
    mode: ListeningMode,
) -> Result<(), String> {
    if let Ok(mut guard) = state.lock() {
        guard.aap.set_listening_mode(mode).map_err(|e| e.to_string())?;
        let _ = app.emit(EVENT_LISTENING_MODE, ListeningModeEventPayload { mode });
    }
    Ok(())
}

#[tauri::command]
pub fn get_settings(state: tauri::State<'_, Mutex<AppRuntimeState>>) -> AppSettings {
    state
        .lock()
        .map(|g| g.settings.clone())
        .unwrap_or_default()
}

#[tauri::command]
pub fn set_settings(
    app: AppHandle,
    state: tauri::State<'_, Mutex<AppRuntimeState>>,
    settings: AppSettings,
) -> AppSettings {
    if let Ok(mut guard) = state.lock() {
        guard.state_machine.set_do_not_disturb(settings.do_not_disturb);
        guard.settings = settings.clone();
    }
    let _ = app.emit(EVENT_SETTINGS, settings.clone());
    settings
}

#[tauri::command]
pub fn dismiss_popup(app: AppHandle, state: tauri::State<'_, Mutex<AppRuntimeState>>) {
    if let Ok(mut guard) = state.lock() {
        guard.state_machine.dismiss();
    }
    if let Some(window) = app.get_webview_window("popup") {
        let _ = window.hide();
    }
}

#[tauri::command]
pub fn set_popup_cursor_passthrough(app: AppHandle, ignore: bool) {
    if let Some(window) = app.get_webview_window("popup") {
        let _ = window.set_ignore_cursor_events(ignore);
    }
}

#[tauri::command]
pub fn simulate(
    app: AppHandle,
    state: tauri::State<'_, Mutex<AppRuntimeState>>,
    model_id: String,
    color: String,
    scenario: SimulationScenario,
) {
    trigger_simulation(&app, &state, &model_id, &color, scenario);
}

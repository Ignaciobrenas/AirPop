use crate::aap::ListeningMode;
use crate::device::classify::FormFactor;
use crate::eq::apo::{ApoEntry, ApoStatus};
use crate::eq::{EqProfile, PresetDefinition};
use crate::ipc::{
    ListeningModeEventPayload, SimulationScenario, EVENT_EQ, EVENT_LISTENING_MODE, EVENT_SETTINGS,
};
use crate::settings::AppSettings;
use crate::{sanitize_settings, trigger_simulation, AppRuntimeState};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

#[tauri::command]
pub fn set_listening_mode(
    app: AppHandle,
    state: State<'_, Mutex<AppRuntimeState>>,
    mode: ListeningMode,
) -> Result<(), String> {
    if let Ok(mut guard) = state.lock() {
        guard
            .aap
            .set_listening_mode(mode)
            .map_err(|e| e.to_string())?;
        let _ = app.emit(EVENT_LISTENING_MODE, ListeningModeEventPayload { mode });
    }
    Ok(())
}

#[tauri::command]
pub fn get_settings(state: State<'_, Mutex<AppRuntimeState>>) -> AppSettings {
    state.lock().map(|g| g.settings.clone()).unwrap_or_default()
}

#[tauri::command]
pub fn set_settings(
    app: AppHandle,
    state: State<'_, Mutex<AppRuntimeState>>,
    settings: AppSettings,
) -> AppSettings {
    let clean = sanitize_settings(settings);
    if let Ok(mut guard) = state.lock() {
        guard.state_machine.set_do_not_disturb(clean.do_not_disturb);
        guard.settings = clean.clone();
    }
    let _ = app.emit(EVENT_SETTINGS, clean.clone());
    clean
}

#[tauri::command]
pub fn dismiss_popup(app: AppHandle, state: State<'_, Mutex<AppRuntimeState>>) {
    if let Ok(mut guard) = state.lock() {
        guard.state_machine.dismiss();
    }
    if let Some(window) = app.get_webview_window("popup") {
        let _ = window.set_ignore_cursor_events(true);
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
    state: State<'_, Mutex<AppRuntimeState>>,
    model_id: String,
    color: String,
    scenario: SimulationScenario,
) -> Result<(), String> {
    if model_id.len() > 64 || color.len() > 32 {
        return Err("invalid model or color identifier length".to_string());
    }
    if let Ok(guard) = state.lock() {
        if guard.registry.catalog().find_by_id(&model_id).is_none() {
            return Err("unknown catalog model_id".to_string());
        }
    }
    trigger_simulation(&app, &state, &model_id, &color, scenario);
    Ok(())
}

#[tauri::command]
pub fn get_eq_presets(state: State<'_, Mutex<AppRuntimeState>>) -> Vec<PresetDefinition> {
    state
        .lock()
        .map(|g| g.eq_presets.all().to_vec())
        .unwrap_or_default()
}

#[tauri::command]
pub fn get_eq_profile(state: State<'_, Mutex<AppRuntimeState>>) -> EqProfile {
    state
        .lock()
        .map(|g| g.eq_profile.clone())
        .unwrap_or_default()
}

#[tauri::command]
pub fn set_eq_profile(
    app: AppHandle,
    state: State<'_, Mutex<AppRuntimeState>>,
    profile: EqProfile,
) -> Result<EqProfile, String> {
    let clean = if let Ok(guard) = state.lock() {
        profile.sanitized(&guard.eq_presets)
    } else {
        profile
    };

    if let Ok(mut guard) = state.lock() {
        guard.eq_profile = clean.clone();
        if let Some(ref dir) = guard.apo_dir {
            let active_device = guard
                .registry
                .latest_device()
                .map(|d| d.display_name.clone())
                .unwrap_or_else(|| "all".to_string());
            let entries = [ApoEntry {
                device_name: active_device,
                profile: clean.clone(),
            }];
            let _ = crate::eq::apo::write_config(dir, &entries);
        }
    }
    let _ = app.emit(EVENT_EQ, clean.clone());
    Ok(clean)
}

#[tauri::command]
pub fn get_apo_status(state: State<'_, Mutex<AppRuntimeState>>) -> ApoStatus {
    let dir = state
        .lock()
        .ok()
        .and_then(|g| g.apo_dir.clone())
        .or_else(crate::eq::apo::locate_config_dir);
    crate::eq::apo::status(dir.as_deref())
}

#[tauri::command]
pub fn sync_apo_config(state: State<'_, Mutex<AppRuntimeState>>) -> Result<ApoStatus, String> {
    let mut guard = state.lock().map_err(|e| e.to_string())?;
    let dir = guard
        .apo_dir
        .clone()
        .or_else(crate::eq::apo::locate_config_dir)
        .ok_or_else(|| "Equalizer APO no está instalado en el sistema".to_string())?;
    guard.apo_dir = Some(dir.clone());

    let active_device = guard
        .registry
        .latest_device()
        .map(|d| d.display_name.clone())
        .unwrap_or_else(|| "all".to_string());
    let entries = [ApoEntry {
        device_name: active_device,
        profile: guard.eq_profile.clone(),
    }];
    crate::eq::apo::write_config(&dir, &entries).map_err(|e| e.to_string())?;
    Ok(crate::eq::apo::status(Some(&dir)))
}

#[tauri::command]
pub fn set_form_factor(
    app: AppHandle,
    state: State<'_, Mutex<AppRuntimeState>>,
    device_name: String,
    form_factor: FormFactor,
) -> Result<(), String> {
    if let Ok(mut guard) = state.lock() {
        guard.registry.set_form_override(&device_name, form_factor);
    }
    let _ = app;
    Ok(())
}

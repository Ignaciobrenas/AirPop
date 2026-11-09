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

use tauri_plugin_autostart::ManagerExt;

#[tauri::command]
pub fn get_settings(app: AppHandle, state: State<'_, Mutex<AppRuntimeState>>) -> AppSettings {
    let mut s = state.lock().map(|g| g.settings.clone()).unwrap_or_default();
    if let Ok(enabled) = app.autolaunch().is_enabled() {
        s.autostart = enabled;
    }
    s
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
    let autolaunch = app.autolaunch();
    if clean.autostart {
        let _ = autolaunch.enable();
    } else {
        let _ = autolaunch.disable();
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

pub fn validate_device_name(name: &str) -> Result<&str, String> {
    let trimmed = name.trim();
    if trimmed.is_empty() || trimmed.len() > 128 {
        return Err("device_name must be between 1 and 128 characters".to_string());
    }
    if trimmed.chars().any(|c| c.is_control()) {
        return Err("invalid control characters in device_name".to_string());
    }
    Ok(trimmed)
}

pub fn validate_simulation_params(model_id: &str, color: &str) -> Result<(), String> {
    if model_id.is_empty() || model_id.len() > 64 || color.is_empty() || color.len() > 32 {
        return Err("invalid model or color identifier length".to_string());
    }
    if !model_id
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    {
        return Err("invalid characters in model_id".to_string());
    }
    if !color
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    {
        return Err("invalid characters in color".to_string());
    }
    Ok(())
}

#[tauri::command]
pub fn simulate(
    app: AppHandle,
    state: State<'_, Mutex<AppRuntimeState>>,
    model_id: String,
    color: String,
    scenario: SimulationScenario,
) -> Result<(), String> {
    validate_simulation_params(&model_id, &color)?;
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
    let valid_name = validate_device_name(&device_name)?;
    if let Ok(mut guard) = state.lock() {
        guard.registry.set_form_override(valid_name, form_factor);
    }
    let _ = app;
    Ok(())
}

#[tauri::command]
pub fn install_app(
    autostart: bool,
    desktop_shortcut: bool,
    start_menu_shortcut: bool,
) -> Result<(), String> {
    crate::installer::install_files_and_shortcuts(autostart, desktop_shortcut, start_menu_shortcut)
}

#[tauri::command]
pub fn uninstall_app(app: AppHandle) -> Result<(), String> {
    crate::installer::run_uninstaller(true)?;
    app.exit(0);
    Ok(())
}

#[tauri::command]
pub fn launch_installed_app(app: AppHandle) -> Result<(), String> {
    crate::installer::launch_installed_app()?;
    app.exit(0);
    Ok(())
}

#[tauri::command]
pub fn get_eula_text() -> Result<String, String> {
    Ok(crate::installer::TERMS_TEXT.to_string())
}

#[tauri::command]
pub fn open_test_popup(
    app: AppHandle,
    state: State<'_, Mutex<AppRuntimeState>>,
) -> Result<(), String> {
    trigger_simulation(
        &app,
        &state,
        "airpods-pro-3",
        "white",
        SimulationScenario::CaseOpen,
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_device_name_validation() {
        assert!(validate_device_name("Sony WH-1000XM5").is_ok());
        assert!(validate_device_name("").is_err());
        assert!(validate_device_name("   ").is_err());
        assert!(validate_device_name(&"a".repeat(129)).is_err());
        assert!(validate_device_name("bad\nname").is_err());
        assert!(validate_device_name("bad\0name").is_err());
    }

    #[test]
    fn test_simulation_params_validation() {
        assert!(validate_simulation_params("sony-wh-1000xm5", "black").is_ok());
        assert!(validate_simulation_params("invalid/path", "black").is_err());
        assert!(validate_simulation_params("model", "color; rm -rf").is_err());
        assert!(validate_simulation_params("", "white").is_err());
        assert!(validate_simulation_params("model", "").is_err());
    }

    #[test]
    fn test_eula_text_available() {
        let eula = get_eula_text().unwrap();
        assert!(!eula.is_empty());
        assert!(eula.contains("AirPop"));
    }
}

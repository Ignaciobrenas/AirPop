#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use airpop_lib::ble::apple_proximity::BatteryState;
use airpop_lib::commands::*;
use airpop_lib::ipc::SimulationScenario;
use airpop_lib::tray::{render_tray_icon_rgba, TRAY_ICON_SIZE};
use airpop_lib::{trigger_simulation, AppRuntimeState, CliArgs};
use clap::Parser;
use std::sync::Mutex;
use tauri::image::Image;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::Manager;

fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    let cli = CliArgs::parse();
    let is_simulated = cli.simulate.is_some();

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|_app, _argv, _cwd| {}))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .manage(Mutex::new(AppRuntimeState::new(is_simulated)))
        .setup(move |app| {
            if let Some(flyout_win) = app.get_webview_window("flyout") {
                #[cfg(target_os = "windows")]
                {
                    let _ = window_vibrancy::apply_mica(&flyout_win, Some(true)).or_else(|_| {
                        window_vibrancy::apply_acrylic(&flyout_win, Some((18, 18, 22, 180)))
                    });
                }
            }

            let settings_item = MenuItem::with_id(app, "settings", "Ajustes", true, None::<&str>)?;
            let dnd_item = MenuItem::with_id(app, "dnd", "No molestar", true, None::<&str>)?;
            let test_popup_item =
                MenuItem::with_id(app, "test_popup", "Probar popup", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Salir", true, None::<&str>)?;
            let menu = Menu::with_items(
                app,
                &[&settings_item, &dnd_item, &test_popup_item, &quit_item],
            )?;

            let initial_rgba = render_tray_icon_rgba(
                &BatteryState {
                    left: Some(82),
                    right: Some(80),
                    case: Some(64),
                },
                true,
            );
            let tray_image = Image::new_owned(initial_rgba, TRAY_ICON_SIZE, TRAY_ICON_SIZE);

            let _tray = TrayIconBuilder::with_id("airpop-tray")
                .icon(tray_image)
                .tooltip("AirPop • L 82% | R 80% | Caja 64%")
                .menu(&menu)
                .on_menu_event(|app_handle, event| match event.id().as_ref() {
                    "test_popup" => {
                        let state = app_handle.state::<Mutex<AppRuntimeState>>();
                        trigger_simulation(
                            app_handle,
                            &state,
                            "airpods-pro-3",
                            "white",
                            SimulationScenario::CaseOpen,
                        );
                    }
                    "dnd" => {
                        let state = app_handle.state::<Mutex<AppRuntimeState>>();
                        if let Ok(mut guard) = state.lock() {
                            guard.settings.do_not_disturb = !guard.settings.do_not_disturb;
                            let dnd = guard.settings.do_not_disturb;
                            guard.state_machine.set_do_not_disturb(dnd);
                        };
                    }
                    "settings" => {
                        if let Some(flyout) = app_handle.get_webview_window("flyout") {
                            let _ = flyout.show();
                            let _ = flyout.set_focus();
                        }
                    }
                    "quit" => {
                        app_handle.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        rect,
                        ..
                    } = event
                    {
                        let app_handle = tray.app_handle();
                        if let Some(flyout) = app_handle.get_webview_window("flyout") {
                            if flyout.is_visible().unwrap_or(false) {
                                let _ = flyout.hide();
                            } else {
                                if let tauri::Position::Physical(pos) = rect.position {
                                    let x = (pos.x - 160).max(16);
                                    let y = (pos.y - 436).max(16);
                                    let _ = flyout.set_position(tauri::PhysicalPosition::new(x, y));
                                }
                                let _ = flyout.show();
                                let _ = flyout.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            if let Some(sim_args) = &cli.simulate {
                let model = sim_args
                    .first()
                    .map(|s| s.as_str())
                    .unwrap_or("airpods-pro-3");
                let color = sim_args.get(1).map(|s| s.as_str()).unwrap_or("white");
                let scenario = sim_args
                    .get(2)
                    .map(|s| SimulationScenario::from_str_name(s))
                    .unwrap_or(SimulationScenario::CaseOpen);

                let handle = app.handle().clone();
                let state = app.state::<Mutex<AppRuntimeState>>();
                trigger_simulation(&handle, &state, model, color, scenario);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_listening_mode,
            get_settings,
            set_settings,
            dismiss_popup,
            set_popup_cursor_passthrough,
            simulate,
            get_eq_presets,
            get_eq_profile,
            set_eq_profile,
            get_apo_status,
            sync_apo_config,
            set_form_factor
        ])
        .run(tauri::generate_context!())
        .expect("error while running AirPop tauri application");
}

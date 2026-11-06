#[cfg(windows)]
use std::env;
#[cfg(windows)]
use std::fs;
#[cfg(windows)]
use std::path::{Path, PathBuf};
#[cfg(windows)]
use std::process::Command;

#[cfg(windows)]
use windows::core::HSTRING;
#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::{
    MessageBoxW, MB_ICONASTERISK, MB_ICONINFORMATION, MB_OK,
};

#[cfg(windows)]
pub fn handle_cli_installer_modes() -> bool {
    let args: Vec<String> = env::args().collect();
    let is_silent = args
        .iter()
        .any(|a| a == "--silent" || a == "-s" || a == "--quiet");

    if args.iter().any(|a| a == "--uninstall") {
        let _ = run_uninstaller(is_silent);
        return true;
    }

    let is_explicit_install = args.iter().any(|a| a == "--install" || a == "--setup");
    let current_exe = env::current_exe().unwrap_or_default();
    let file_stem = current_exe
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();

    let is_setup_name = file_stem.contains("setup") || file_stem.contains("installer");
    let target_dir = get_target_install_dir();
    let is_already_installed_location = current_exe
        .parent()
        .map(|p| p == target_dir.as_path())
        .unwrap_or(false);

    if (is_explicit_install || is_setup_name) && !is_already_installed_location {
        let _ = run_installer(&current_exe, is_silent);
        return true;
    }

    false
}

#[cfg(not(windows))]
pub fn handle_cli_installer_modes() -> bool {
    false
}

#[cfg(windows)]
fn get_target_install_dir() -> PathBuf {
    let local_app_data = env::var("LOCALAPPDATA").unwrap_or_else(|_| "C:\\".to_string());
    Path::new(&local_app_data).join("AirPop")
}

#[cfg(windows)]
fn show_msg_box(title: &str, text: &str) {
    let title_h = HSTRING::from(title);
    let text_h = HSTRING::from(text);
    unsafe {
        let _ = MessageBoxW(
            None,
            &text_h,
            &title_h,
            MB_OK | MB_ICONINFORMATION | MB_ICONASTERISK,
        );
    }
}

#[cfg(windows)]
fn run_installer(current_exe: &Path, is_silent: bool) -> Result<(), String> {
    let target_dir = get_target_install_dir();
    let target_exe = target_dir.join("airpop.exe");

    fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;

    let _ = Command::new("taskkill")
        .args(["/F", "/IM", "airpop.exe"])
        .output();

    std::thread::sleep(std::time::Duration::from_millis(200));

    fs::copy(current_exe, &target_exe).map_err(|e| e.to_string())?;

    let target_exe_str = target_exe.to_string_lossy().to_string();
    let quoted_target = format!("\\\"{}\\\"", target_exe_str);

    let _ = Command::new("reg")
        .args([
            "add",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            "/v",
            "AirPop",
            "/t",
            "REG_SZ",
            "/d",
            &quoted_target,
            "/f",
        ])
        .output();

    let uninstall_key = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AirPop";
    let _ = Command::new("reg")
        .args([
            "add",
            uninstall_key,
            "/v",
            "DisplayName",
            "/t",
            "REG_SZ",
            "/d",
            "AirPop",
            "/f",
        ])
        .output();
    let _ = Command::new("reg")
        .args([
            "add",
            uninstall_key,
            "/v",
            "DisplayVersion",
            "/t",
            "REG_SZ",
            "/d",
            "1.1.0",
            "/f",
        ])
        .output();
    let _ = Command::new("reg")
        .args([
            "add",
            uninstall_key,
            "/v",
            "Publisher",
            "/t",
            "REG_SZ",
            "/d",
            "Ignacio Brena",
            "/f",
        ])
        .output();
    let _ = Command::new("reg")
        .args([
            "add",
            uninstall_key,
            "/v",
            "InstallLocation",
            "/t",
            "REG_SZ",
            "/d",
            &format!("\\\"{}\\\"", target_dir.to_string_lossy()),
            "/f",
        ])
        .output();
    let uninstall_cmd = format!("\\\"{}\\\" --uninstall", target_exe_str);
    let _ = Command::new("reg")
        .args([
            "add",
            uninstall_key,
            "/v",
            "UninstallString",
            "/t",
            "REG_SZ",
            "/d",
            &uninstall_cmd,
            "/f",
        ])
        .output();
    let icon_val = format!("\\\"{}\\\",0", target_exe_str);
    let _ = Command::new("reg")
        .args([
            "add",
            uninstall_key,
            "/v",
            "DisplayIcon",
            "/t",
            "REG_SZ",
            "/d",
            &icon_val,
            "/f",
        ])
        .output();

    if let Ok(userprofile) = env::var("USERPROFILE") {
        let desktop_lnk = Path::new(&userprofile).join("Desktop").join("AirPop.lnk");
        create_shortcut(&desktop_lnk, &target_exe);
    }

    if let Ok(appdata) = env::var("APPDATA") {
        let start_menu_lnk = Path::new(&appdata)
            .join("Microsoft")
            .join("Windows")
            .join("Start Menu")
            .join("Programs")
            .join("AirPop.lnk");
        create_shortcut(&start_menu_lnk, &target_exe);
    }

    let _ = Command::new(&target_exe).spawn();

    if !is_silent {
        show_msg_box(
            "AirPop - Instalacion completada",
            "AirPop se ha instalado correctamente en su sistema y ya esta activo en la bandeja del sistema (al lado del reloj).\n\nSe iniciara de forma automatica cada vez que encienda su ordenador.",
        );
    }

    Ok(())
}

#[cfg(windows)]
fn run_uninstaller(is_silent: bool) -> Result<(), String> {
    let _ = Command::new("taskkill")
        .args(["/F", "/IM", "airpop.exe"])
        .output();

    let _ = Command::new("reg")
        .args([
            "delete",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            "/v",
            "AirPop",
            "/f",
        ])
        .output();

    let _ = Command::new("reg")
        .args([
            "delete",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AirPop",
            "/f",
        ])
        .output();

    if let Ok(userprofile) = env::var("USERPROFILE") {
        let desktop_lnk = Path::new(&userprofile).join("Desktop").join("AirPop.lnk");
        let _ = fs::remove_file(desktop_lnk);
    }

    if let Ok(appdata) = env::var("APPDATA") {
        let start_menu_lnk = Path::new(&appdata)
            .join("Microsoft")
            .join("Windows")
            .join("Start Menu")
            .join("Programs")
            .join("AirPop.lnk");
        let _ = fs::remove_file(start_menu_lnk);
    }

    let target_dir = get_target_install_dir();
    let _ = fs::remove_dir_all(&target_dir);

    if !is_silent {
        show_msg_box(
            "AirPop - Desinstalacion",
            "AirPop ha sido desinstalado correctamente de su sistema.",
        );
    }

    Ok(())
}

#[cfg(windows)]
fn create_shortcut(lnk_path: &Path, target_exe: &Path) {
    let lnk_str = lnk_path.to_string_lossy().replace('\'', "''");
    let target_str = target_exe.to_string_lossy().replace('\'', "''");
    let script = format!(
        "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('{}'); $s.TargetPath = '{}'; $s.IconLocation = '{},0'; $s.Save()",
        lnk_str, target_str, target_str
    );

    let _ = Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", &script])
        .output();
}

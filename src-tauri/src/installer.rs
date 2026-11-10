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
    MessageBoxW, IDYES, MB_ICONASTERISK, MB_ICONINFORMATION, MB_ICONQUESTION, MB_OK, MB_YESNO,
};

#[cfg(target_os = "linux")]
use std::env;
#[cfg(target_os = "linux")]
use std::fs;
#[cfg(target_os = "linux")]
use std::path::{Path, PathBuf};
#[cfg(target_os = "linux")]
use std::process::Command;

pub const APP_VERSION: &str = "1.2.0";
pub const TERMS_TEXT: &str = include_str!("../resources/TERMS.txt");

#[cfg(windows)]
pub fn is_setup_mode() -> bool {
    let args: Vec<String> = env::args().collect();
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

    (is_explicit_install || is_setup_name) && !is_already_installed_location
}

#[cfg(target_os = "linux")]
pub fn is_setup_mode() -> bool {
    let args: Vec<String> = env::args().collect();
    let is_explicit_install = args.iter().any(|a| a == "--install" || a == "--setup");
    let current_exe = env::current_exe().unwrap_or_default();
    let file_stem = current_exe
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();

    let is_setup_name = file_stem.contains("setup") || file_stem.contains("installer");
    let target_dir = get_linux_target_bin_dir();
    let is_already_installed = current_exe
        .parent()
        .map(|p| p == target_dir.as_path())
        .unwrap_or(false);

    (is_explicit_install || is_setup_name) && !is_already_installed
}

#[cfg(not(any(windows, target_os = "linux")))]
pub fn is_setup_mode() -> bool {
    false
}

#[cfg(windows)]
pub fn handle_cli_installer_modes() -> bool {
    let args: Vec<String> = env::args().collect();

    if args
        .iter()
        .any(|a| a == "--terms" || a == "--license" || a == "-l")
    {
        println!("{}", TERMS_TEXT);
        return true;
    }

    let is_silent = args
        .iter()
        .any(|a| a == "--silent" || a == "-s" || a == "--quiet");

    let accept_terms = args
        .iter()
        .any(|a| a == "--accept-terms" || a == "--eula" || a == "-y" || a == "--yes");

    let current_exe = env::current_exe().unwrap_or_default();
    let file_stem = current_exe
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();

    if args.iter().any(|a| a == "--uninstall") || file_stem.contains("uninstall") {
        let _ = run_uninstaller(is_silent);
        return true;
    }

    if is_setup_mode() && is_silent {
        let _ = run_installer(&current_exe, true, accept_terms);
        return true;
    }

    false
}

#[cfg(target_os = "linux")]
pub fn handle_cli_installer_modes() -> bool {
    let args: Vec<String> = env::args().collect();

    if args
        .iter()
        .any(|a| a == "--terms" || a == "--license" || a == "-l")
    {
        println!("{}", TERMS_TEXT);
        return true;
    }

    let is_silent = args
        .iter()
        .any(|a| a == "--silent" || a == "-s" || a == "--quiet");

    let accept_terms = args
        .iter()
        .any(|a| a == "--accept-terms" || a == "--eula" || a == "-y" || a == "--yes");

    if args.iter().any(|a| a == "--uninstall") {
        let _ = run_linux_uninstaller(is_silent);
        return true;
    }

    if is_setup_mode() && is_silent {
        let current_exe = env::current_exe().unwrap_or_default();
        let _ = run_linux_installer(&current_exe, true, accept_terms);
        return true;
    }

    false
}

#[cfg(not(any(windows, target_os = "linux")))]
pub fn handle_cli_installer_modes() -> bool {
    false
}

#[cfg(windows)]
pub fn get_target_install_dir() -> PathBuf {
    let local_app_data = env::var("LOCALAPPDATA").unwrap_or_else(|_| "C:\\".to_string());
    Path::new(&local_app_data).join("AirPop")
}

#[cfg(target_os = "linux")]
pub fn get_linux_target_bin_dir() -> PathBuf {
    let home = env::var("HOME").unwrap_or_else(|_| "/root".to_string());
    Path::new(&home).join(".local").join("bin")
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
fn ask_yes_no(title: &str, text: &str) -> bool {
    let title_h = HSTRING::from(title);
    let text_h = HSTRING::from(text);
    unsafe {
        let res = MessageBoxW(None, &text_h, &title_h, MB_YESNO | MB_ICONQUESTION);
        res == IDYES
    }
}

pub fn install_files_and_shortcuts(
    autostart: bool,
    desktop_shortcut: bool,
    start_menu_shortcut: bool,
) -> Result<(), String> {
    #[cfg(windows)]
    {
        let current_exe = env::current_exe().map_err(|e| e.to_string())?;
        let target_dir = get_target_install_dir();
        let target_exe = target_dir.join("airpop.exe");

        fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;

        let current_pid = std::process::id();
        let pid_filter = format!("PID ne {}", current_pid);
        let _ = Command::new("taskkill")
            .args(["/F", "/FI", &pid_filter, "/IM", "airpop.exe"])
            .output();

        std::thread::sleep(std::time::Duration::from_millis(200));

        fs::copy(&current_exe, &target_exe).map_err(|e| e.to_string())?;

        let target_uninstaller = target_dir.join("uninstall.exe");
        let source_uninstaller = current_exe.parent().map(|p| p.join("uninstall.exe"));
        if let Some(src_uninst) = source_uninstaller.filter(|p| p.is_file()) {
            let _ = fs::copy(&src_uninst, &target_uninstaller);
        } else {
            let _ = fs::copy(&current_exe, &target_uninstaller);
        }

        let target_exe_str = target_exe.to_string_lossy().to_string();
        let quoted_target = format!("\"{}\"", target_exe_str);

        if autostart {
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
        }

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
                APP_VERSION,
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
                &format!("\"{}\"", target_dir.to_string_lossy()),
                "/f",
            ])
            .output();
        let uninstall_cmd = if target_uninstaller.is_file() {
            format!("\"{}\"", target_uninstaller.to_string_lossy())
        } else {
            format!("\"{}\" --uninstall", target_exe_str)
        };
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
        let icon_val = format!("\"{}\",0", target_exe_str);
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

        if desktop_shortcut {
            if let Ok(userprofile) = env::var("USERPROFILE") {
                let desktop_lnk = Path::new(&userprofile).join("Desktop").join("AirPop.lnk");
                create_shortcut(&desktop_lnk, &target_exe);
            }
        }

        if start_menu_shortcut {
            if let Ok(appdata) = env::var("APPDATA") {
                let start_menu_lnk = Path::new(&appdata)
                    .join("Microsoft")
                    .join("Windows")
                    .join("Start Menu")
                    .join("Programs")
                    .join("AirPop.lnk");
                create_shortcut(&start_menu_lnk, &target_exe);
                let uninst_lnk = Path::new(&appdata)
                    .join("Microsoft")
                    .join("Windows")
                    .join("Start Menu")
                    .join("Programs")
                    .join("Uninstall AirPop.lnk");
                create_shortcut(&uninst_lnk, &target_uninstaller);
            }
        }

        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        let current_exe = env::current_exe().map_err(|e| e.to_string())?;
        run_linux_installer(&current_exe, true, true)
    }

    #[cfg(not(any(windows, target_os = "linux")))]
    {
        Err("Unsupported operating system".to_string())
    }
}

pub fn launch_installed_app() -> Result<(), String> {
    #[cfg(windows)]
    {
        let target_dir = get_target_install_dir();
        let target_exe = target_dir.join("airpop.exe");
        if !target_exe.exists() {
            return Err("AirPop is not installed yet".to_string());
        }
        let _ = Command::new(&target_exe)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        let target_dir = get_linux_target_bin_dir();
        let target_exe = target_dir.join("airpop");
        if !target_exe.exists() {
            return Err("AirPop is not installed yet".to_string());
        }
        let _ = Command::new(&target_exe)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    #[cfg(not(any(windows, target_os = "linux")))]
    {
        Err("Unsupported operating system".to_string())
    }
}

#[cfg(windows)]
fn run_installer(_current_exe: &Path, is_silent: bool, accept_terms: bool) -> Result<(), String> {
    if !is_silent && !accept_terms {
        let terms_prompt = format!(
            "Bienvenido al instalador de AirPop v{}.\n\n\
            AirPop es una aplicacion ligera y segura para auriculares Bluetooth en Windows.\n\n\
            Garantias de Privacidad y Seguridad:\n\
            • 100% Local: Sin conexion a servidores externos\n\
            • Cero telemetria ni recopilacion de datos personales\n\
            • Licencia libre y de codigo abierto (MIT)\n\n\
            ¿Acepta los Terminos y Condiciones para continuar con la instalacion?",
            APP_VERSION
        );

        if !ask_yes_no("AirPop - Terminos y Condiciones de Uso", &terms_prompt) {
            show_msg_box(
                "AirPop - Instalacion cancelada",
                "La instalacion ha sido cancelada porque no se aceptaron los Terminos y Condiciones.",
            );
            return Err("Terms rejected".to_string());
        }
    }

    install_files_and_shortcuts(true, true, true)?;

    let target_dir = get_target_install_dir();
    let target_exe = target_dir.join("airpop.exe");
    let _ = Command::new(&target_exe).spawn();

    if !is_silent {
        show_msg_box(
            "AirPop - Instalacion completada con exito",
            "AirPop se ha instalado correctamente en su sistema y ya esta activo en la bandeja del sistema (junto al reloj).\n\nSe iniciara de forma automatica con Windows para detectar sus auriculares al conectarse.",
        );
    }

    Ok(())
}

#[cfg(target_os = "linux")]
fn run_linux_installer(
    current_exe: &Path,
    is_silent: bool,
    accept_terms: bool,
) -> Result<(), String> {
    if !is_silent && !accept_terms {
        println!("AirPop v{} - Términos y Condiciones", APP_VERSION);
        println!("Al instalar acepta la licencia MIT y privacidad 100% local (sin telemetría).");
        println!("Para aceptar ejecute con --accept-terms o presione Enter para continuar.");
    }

    let home = env::var("HOME").map_err(|e| e.to_string())?;
    let home_path = Path::new(&home);

    let bin_dir = home_path.join(".local").join("bin");
    fs::create_dir_all(&bin_dir).map_err(|e| e.to_string())?;
    let target_exe = bin_dir.join("airpop");

    let _ = Command::new("pkill").arg("-f").arg("airpop").output();
    fs::copy(current_exe, &target_exe).map_err(|e| e.to_string())?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = fs::set_permissions(&target_exe, fs::Permissions::from_mode(0o755));
    }

    let apps_dir = home_path.join(".local").join("share").join("applications");
    fs::create_dir_all(&apps_dir).map_err(|e| e.to_string())?;
    let desktop_content = format!(
        "[Desktop Entry]\nType=Application\nName=AirPop\nComment=Wireless Earbuds Overlay & Battery\nExec={}\nIcon=airpop\nTerminal=false\nCategories=AudioVideo;Audio;Utility;\nStartupNotify=false\n",
        target_exe.to_string_lossy()
    );
    let _ = fs::write(apps_dir.join("airpop.desktop"), desktop_content.as_bytes());

    let autostart_dir = home_path.join(".config").join("autostart");
    fs::create_dir_all(&autostart_dir).map_err(|e| e.to_string())?;
    let autostart_content = format!(
        "[Desktop Entry]\nType=Application\nName=AirPop\nExec={}\nHidden=false\nNoDisplay=false\nX-GNOME-Autostart-enabled=true\n",
        target_exe.to_string_lossy()
    );
    let _ = fs::write(
        autostart_dir.join("airpop.desktop"),
        autostart_content.as_bytes(),
    );

    let _ = Command::new(&target_exe).spawn();

    if !is_silent {
        println!("AirPop se ha instalado correctamente en ~/.local/bin/airpop.");
    }
    Ok(())
}

pub fn run_uninstaller(is_silent: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        if !is_silent {
            let confirm = ask_yes_no(
                "AirPop - Desinstalacion",
                "¿Esta seguro de que desea desinstalar AirPop y eliminar sus accesos directos?",
            );
            if !confirm {
                return Ok(());
            }
        }

        let current_pid = std::process::id();
        let pid_filter = format!("PID ne {}", current_pid);
        let _ = Command::new("taskkill")
            .args(["/F", "/FI", &pid_filter, "/IM", "airpop.exe"])
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
            let uninst_lnk = Path::new(&appdata)
                .join("Microsoft")
                .join("Windows")
                .join("Start Menu")
                .join("Programs")
                .join("Uninstall AirPop.lnk");
            let _ = fs::remove_file(uninst_lnk);
        }

        let target_dir = get_target_install_dir();
        let target_dir_str = target_dir.to_string_lossy().to_string();

        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let cleanup_cmd = format!(
            "Start-Sleep -Milliseconds 600; Remove-Item -Recurse -Force '{}'",
            target_dir_str
        );
        let _ = Command::new("powershell")
            .args([
                "-WindowStyle",
                "Hidden",
                "-NoProfile",
                "-Command",
                &cleanup_cmd,
            ])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn();

        if !is_silent {
            show_msg_box(
                "AirPop - Desinstalacion finalizada",
                "AirPop ha sido desinstalado correctamente de su sistema.",
            );
        }

        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        run_linux_uninstaller(is_silent)
    }

    #[cfg(not(any(windows, target_os = "linux")))]
    {
        Ok(())
    }
}

#[cfg(target_os = "linux")]
fn run_linux_uninstaller(is_silent: bool) -> Result<(), String> {
    let home = env::var("HOME").unwrap_or_default();
    let home_path = Path::new(&home);
    let _ = Command::new("pkill").arg("-f").arg("airpop").output();
    let _ = fs::remove_file(home_path.join(".local").join("bin").join("airpop"));
    let _ = fs::remove_file(
        home_path
            .join(".local")
            .join("share")
            .join("applications")
            .join("airpop.desktop"),
    );
    let _ = fs::remove_file(
        home_path
            .join(".config")
            .join("autostart")
            .join("airpop.desktop"),
    );
    if !is_silent {
        println!("AirPop ha sido desinstalado correctamente.");
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

use crate::eq::{EqProfile, BAND_Q};
use serde::{Deserialize, Serialize};
use std::fmt::Write as _;
use std::path::{Path, PathBuf};
use thiserror::Error;

pub const APO_CONFIG_FILE: &str = "config.txt";
pub const APO_AIRPOP_FILE: &str = "airpop.txt";
pub const APO_INCLUDE_LINE: &str = "Include: airpop.txt";
const MAX_DEVICE_NAME_LEN: usize = 64;

#[derive(Debug, Clone, PartialEq)]
pub struct ApoEntry {
    pub device_name: String,
    pub profile: EqProfile,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApoStatus {
    pub installed: bool,
    pub linked: bool,
    pub config_dir: Option<String>,
}

#[derive(Debug, Error)]
pub enum ApoError {
    #[error("Equalizer APO no está instalado")]
    NotInstalled,
    #[error("sin permisos para escribir en la carpeta de Equalizer APO; ejecuta AirPop como administrador o exporta la configuración")]
    PermissionDenied,
    #[error("no se pudo escribir la configuración: {0}")]
    Io(String),
}

impl From<std::io::Error> for ApoError {
    fn from(err: std::io::Error) -> Self {
        if err.kind() == std::io::ErrorKind::PermissionDenied {
            ApoError::PermissionDenied
        } else {
            ApoError::Io(err.to_string())
        }
    }
}

pub fn sanitize_device_name(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|c| if c.is_control() || c == '#' { ' ' } else { c })
        .collect();
    let collapsed = cleaned.split_whitespace().collect::<Vec<_>>().join(" ");
    collapsed.chars().take(MAX_DEVICE_NAME_LEN).collect()
}

fn format_db(value: f32) -> String {
    let rounded = (value * 10.0).round() / 10.0;
    let normalized = if rounded == 0.0 { 0.0 } else { rounded };
    format!("{normalized:.1}")
}

pub fn render_config(entries: &[ApoEntry]) -> String {
    let mut out = String::from("# Generado por AirPop. No lo edites a mano.\r\n");
    for entry in entries {
        let device = sanitize_device_name(&entry.device_name);
        if device.is_empty() || !entry.profile.enabled {
            continue;
        }
        let filters = entry.profile.active_filters();
        if filters.is_empty() {
            continue;
        }
        let _ = write!(out, "Device: {device}\r\n");
        let _ = write!(
            out,
            "Preamp: {} dB\r\n",
            format_db(entry.profile.preamp_db())
        );
        for (index, (frequency, gain)) in filters.iter().enumerate() {
            let _ = write!(
                out,
                "Filter {}: ON PK Fc {} Hz Gain {} dB Q {}\r\n",
                index + 1,
                *frequency as u32,
                format_db(*gain),
                BAND_Q
            );
        }
    }
    out.push_str("Device: all\r\n");
    out
}

pub fn candidate_config_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    for var in ["ProgramFiles", "ProgramW6432", "ProgramFiles(x86)"] {
        if let Some(base) = std::env::var_os(var) {
            let dir = PathBuf::from(base).join("EqualizerAPO").join("config");
            if !dirs.contains(&dir) {
                dirs.push(dir);
            }
        }
    }
    dirs
}

pub fn locate_config_dir() -> Option<PathBuf> {
    candidate_config_dirs()
        .into_iter()
        .find(|dir| dir.join(APO_CONFIG_FILE).is_file())
}

fn config_links_airpop(config_text: &str) -> bool {
    config_text.lines().any(|line| {
        let trimmed = line.trim();
        !trimmed.starts_with('#')
            && trimmed
                .to_ascii_lowercase()
                .replace(' ', "")
                .starts_with("include:airpop.txt")
    })
}

pub fn status(dir: Option<&Path>) -> ApoStatus {
    match dir {
        Some(dir) if dir.join(APO_CONFIG_FILE).is_file() => {
            let linked = std::fs::read_to_string(dir.join(APO_CONFIG_FILE))
                .map(|text| config_links_airpop(&text))
                .unwrap_or(false);
            ApoStatus {
                installed: true,
                linked,
                config_dir: Some(dir.display().to_string()),
            }
        }
        _ => ApoStatus {
            installed: false,
            linked: false,
            config_dir: None,
        },
    }
}

pub fn write_config(dir: &Path, entries: &[ApoEntry]) -> Result<(), ApoError> {
    let config_path = dir.join(APO_CONFIG_FILE);
    if !config_path.is_file() {
        return Err(ApoError::NotInstalled);
    }
    let current = std::fs::read_to_string(&config_path)?;
    std::fs::write(dir.join(APO_AIRPOP_FILE), render_config(entries))?;
    if !config_links_airpop(&current) {
        let mut updated = current;
        if !updated.is_empty() && !updated.ends_with('\n') {
            updated.push_str("\r\n");
        }
        updated.push_str(APO_INCLUDE_LINE);
        updated.push_str("\r\n");
        std::fs::write(&config_path, updated)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::eq::{EqPresets, CUSTOM_PRESET_ID};

    fn entry(name: &str, preset: &str, enabled: bool) -> ApoEntry {
        let presets = EqPresets::embedded();
        ApoEntry {
            device_name: name.to_string(),
            profile: EqProfile::from_preset(presets.find(preset).unwrap(), enabled),
        }
    }

    fn temp_dir(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "airpop-apo-test-{}-{}-{}",
            tag,
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or(0)
        ));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn test_render_scopes_filters_to_device_and_resets_scope() {
        let text = render_config(&[entry("WH-1000XM5", "bass-boost", true)]);
        assert!(text.contains("Device: WH-1000XM5\r\n"));
        assert!(text.contains("Preamp: -"));
        assert!(text.contains("Filter 1: ON PK Fc 31 Hz Gain 6.0 dB Q 1.41"));
        assert!(text.trim_end().ends_with("Device: all"));
    }

    #[test]
    fn test_render_skips_disabled_and_flat_profiles() {
        let text = render_config(&[
            entry("Off Device", "rock", false),
            entry("Flat Device", "flat", true),
        ]);
        assert!(!text.contains("Off Device"));
        assert!(!text.contains("Flat Device"));
        assert!(!text.contains("Filter"));
    }

    #[test]
    fn test_device_name_cannot_inject_config_directives() {
        let hostile = "Buds\r\nInclude: C:\\evil.txt\n# x";
        let cleaned = sanitize_device_name(hostile);
        assert!(!cleaned.contains('\n'));
        assert!(!cleaned.contains('\r'));
        assert!(!cleaned.contains('#'));
        let text = render_config(&[entry(hostile, "rock", true)]);
        assert!(text
            .lines()
            .all(|line| !line.trim_start().starts_with("Include: C:")));
        assert_eq!(
            text.lines().filter(|l| l.starts_with("Device: ")).count(),
            2
        );
    }

    #[test]
    fn test_custom_gains_render_exact_values() {
        let mut gains = vec![0.0; 10];
        gains[3] = -2.5;
        let profile = EqProfile {
            enabled: true,
            preset_id: CUSTOM_PRESET_ID.to_string(),
            gains_db: gains,
        };
        let text = render_config(&[ApoEntry {
            device_name: "Cascos".to_string(),
            profile,
        }]);
        assert!(text.contains("Fc 250 Hz Gain -2.5 dB"));
        assert!(text.contains("Preamp: 0.0 dB"));
    }

    #[test]
    fn test_write_config_links_include_once_and_reports_status() {
        let dir = temp_dir("write");
        assert!(!status(Some(&dir)).installed);
        assert!(matches!(
            write_config(&dir, &[]),
            Err(ApoError::NotInstalled)
        ));

        std::fs::write(dir.join(APO_CONFIG_FILE), "Preamp: -1 dB").unwrap();
        let before = status(Some(&dir));
        assert!(before.installed && !before.linked);

        write_config(&dir, &[entry("Cascos", "rock", true)]).unwrap();
        write_config(&dir, &[entry("Cascos", "pop", true)]).unwrap();

        let config = std::fs::read_to_string(dir.join(APO_CONFIG_FILE)).unwrap();
        assert_eq!(config.matches(APO_INCLUDE_LINE).count(), 1);
        assert!(config.starts_with("Preamp: -1 dB"));
        assert!(status(Some(&dir)).linked);

        let generated = std::fs::read_to_string(dir.join(APO_AIRPOP_FILE)).unwrap();
        assert!(generated.contains("Device: Cascos"));
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn test_commented_include_is_not_treated_as_linked() {
        assert!(!config_links_airpop("# Include: airpop.txt"));
        assert!(config_links_airpop("Include: airpop.txt"));
        assert!(config_links_airpop("  include:AirPop.txt  "));
    }
}

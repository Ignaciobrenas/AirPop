use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub autostart: bool,
    pub do_not_disturb: bool,
    pub low_power_mode: bool,
    pub sound_enabled: bool,
    pub popup_enabled: bool,
    pub preferred_monitor: Option<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            autostart: false,
            do_not_disturb: false,
            low_power_mode: false,
            sound_enabled: true,
            popup_enabled: true,
            preferred_monitor: None,
        }
    }
}

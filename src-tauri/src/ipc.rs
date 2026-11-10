use crate::aap::ListeningMode;
use crate::ble::apple_proximity::{BatteryState, ChargingState};
use crate::device::classify::FormFactor;
use crate::eq::apo::ApoStatus;
use crate::eq::EqProfile;
use crate::settings::AppSettings;
use serde::{Deserialize, Serialize};

pub const EVENT_CASE_OPEN: &str = "device://case-open";
pub const EVENT_CONNECTED: &str = "device://connected";
pub const EVENT_BATTERY: &str = "device://battery";
pub const EVENT_LISTENING_MODE: &str = "device://listening-mode";
pub const EVENT_DISCONNECTED: &str = "device://disconnected";
pub const EVENT_SETTINGS: &str = "app://settings";
pub const EVENT_EQ: &str = "device://eq";
pub const EVENT_APO_STATUS: &str = "device://apo-status";
pub const COMMAND_HIDE_FLYOUT: &str = "hide_flyout";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CaseOpenEventPayload {
    pub model_id: String,
    pub display_name: String,
    pub color: String,
    pub battery: BatteryState,
    pub charging: ChargingState,
    pub rssi: i16,
    pub aap_supported: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectedEventPayload {
    pub name: String,
    pub model_id: String,
    pub color: String,
    pub battery: BatteryState,
    pub listening_mode: Option<ListeningMode>,
    pub aap_supported: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatteryEventPayload {
    pub left: Option<u8>,
    pub right: Option<u8>,
    pub case: Option<u8>,
    pub charging: ChargingState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListeningModeEventPayload {
    pub mode: ListeningMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DisconnectedEventPayload {}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SimulationScenario {
    CaseOpen,
    Connected,
    LowBattery,
    Charging,
}

impl SimulationScenario {
    pub fn from_str_name(value: &str) -> Self {
        match value.trim().to_ascii_lowercase().as_str() {
            "connected" => Self::Connected,
            "low-battery" => Self::LowBattery,
            "charging" => Self::Charging,
            _ => Self::CaseOpen,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimulateCommandArgs {
    pub model_id: String,
    pub color: String,
    pub scenario: SimulationScenario,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetListeningModeArgs {
    pub mode: ListeningMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsPayload {
    pub settings: AppSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EqEventPayload {
    pub profile: EqProfile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApoStatusEventPayload {
    pub status: ApoStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetFormFactorArgs {
    pub device_name: String,
    pub form_factor: FormFactor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetEqProfileArgs {
    pub profile: EqProfile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetEqGainArgs {
    pub band_index: usize,
    pub gain_db: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SelectEqPresetArgs {
    pub preset_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallAppArgs {
    pub autostart: bool,
    pub desktop_shortcut: bool,
    pub start_menu_shortcut: bool,
}

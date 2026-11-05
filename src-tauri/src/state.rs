use crate::ble::apple_proximity::{BatteryState, ChargingState};
use crate::bt::BtEvent;
use crate::device::registry::TrackedDevice;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub const RSSI_PROXIMITY_THRESHOLD_DBM: i16 = -60;
pub const POPUP_DEBOUNCE_MS: u64 = 12_000;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum PopupState {
    Idle,
    CaseOpenNearby,
    Connecting,
    Connected,
    Dismissed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "camelCase")]
pub enum StateOutput {
    None,
    ShowCaseOpenPopup {
        model_id: String,
        display_name: String,
        color: String,
        battery: BatteryState,
        charging: ChargingState,
        rssi: i16,
    },
    ShowConnectedPopup {
        name: String,
        model_id: String,
        color: String,
        battery: BatteryState,
    },
    UpdateBattery {
        battery: BatteryState,
        charging: ChargingState,
    },
    HidePopup,
    NotifyDisconnected,
}

pub struct StateMachine {
    state: PopupState,
    last_popup_ms_by_device: HashMap<String, u64>,
    active_device_id: Option<String>,
    fullscreen_exclusive: bool,
    do_not_disturb: bool,
}

impl Default for StateMachine {
    fn default() -> Self {
        Self::new()
    }
}

impl StateMachine {
    pub fn new() -> Self {
        Self {
            state: PopupState::Idle,
            last_popup_ms_by_device: HashMap::new(),
            active_device_id: None,
            fullscreen_exclusive: false,
            do_not_disturb: false,
        }
    }

    pub fn state(&self) -> PopupState {
        self.state
    }

    pub fn set_fullscreen_exclusive(&mut self, active: bool) {
        self.fullscreen_exclusive = active;
    }

    pub fn set_do_not_disturb(&mut self, dnd: bool) {
        self.do_not_disturb = dnd;
    }

    pub fn dismiss(&mut self) -> StateOutput {
        self.state = PopupState::Dismissed;
        StateOutput::HidePopup
    }

    pub fn on_ble_device(&mut self, device: &TrackedDevice, now_ms: u64) -> StateOutput {
        if !device.lid_open {
            if self.state == PopupState::CaseOpenNearby || self.state == PopupState::Dismissed {
                self.state = PopupState::Idle;
                return StateOutput::HidePopup;
            }
            return StateOutput::UpdateBattery {
                battery: device.battery.clone(),
                charging: device.charging.clone(),
            };
        }

        if self.state == PopupState::Connected {
            return StateOutput::UpdateBattery {
                battery: device.battery.clone(),
                charging: device.charging.clone(),
            };
        }

        if device.rssi < RSSI_PROXIMITY_THRESHOLD_DBM {
            return StateOutput::None;
        }

        if self.fullscreen_exclusive || self.do_not_disturb {
            return StateOutput::UpdateBattery {
                battery: device.battery.clone(),
                charging: device.charging.clone(),
            };
        }

        if let Some(&last_ts) = self.last_popup_ms_by_device.get(&device.logical_id) {
            if now_ms.saturating_sub(last_ts) < POPUP_DEBOUNCE_MS {
                return StateOutput::UpdateBattery {
                    battery: device.battery.clone(),
                    charging: device.charging.clone(),
                };
            }
        }

        self.state = PopupState::CaseOpenNearby;
        self.active_device_id = Some(device.logical_id.clone());
        self.last_popup_ms_by_device
            .insert(device.logical_id.clone(), now_ms);

        StateOutput::ShowCaseOpenPopup {
            model_id: device.catalog_model_id.clone(),
            display_name: device.display_name.clone(),
            color: device.color_id.clone(),
            battery: device.battery.clone(),
            charging: device.charging.clone(),
            rssi: device.rssi,
        }
    }

    pub fn on_bt_event(
        &mut self,
        event: &BtEvent,
        fallback_device: Option<&TrackedDevice>,
    ) -> StateOutput {
        match event {
            BtEvent::Connected {
                name, timestamp_ms, ..
            } => {
                self.state = PopupState::Connected;
                let (model_id, color, battery) = match fallback_device {
                    Some(dev) => (
                        dev.catalog_model_id.clone(),
                        dev.color_id.clone(),
                        dev.battery.clone(),
                    ),
                    None => (
                        "airpods-pro-3".to_string(),
                        "white".to_string(),
                        BatteryState {
                            left: Some(90),
                            right: Some(90),
                            case: Some(80),
                        },
                    ),
                };

                if let Some(dev) = fallback_device {
                    self.last_popup_ms_by_device
                        .insert(dev.logical_id.clone(), *timestamp_ms);
                }

                if self.fullscreen_exclusive || self.do_not_disturb {
                    return StateOutput::None;
                }

                StateOutput::ShowConnectedPopup {
                    name: name.clone(),
                    model_id,
                    color,
                    battery,
                }
            }
            BtEvent::Disconnected { .. } => {
                self.state = PopupState::Idle;
                StateOutput::NotifyDisconnected
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_device(rssi: i16, lid_open: bool) -> TrackedDevice {
        TrackedDevice {
            logical_id: "airpods-pro-3-00".to_string(),
            catalog_model_id: "airpods-pro-3".to_string(),
            display_name: "Pro 3".to_string(),
            color_id: "white".to_string(),
            battery: BatteryState {
                left: Some(80),
                right: Some(80),
                case: Some(60),
            },
            charging: ChargingState {
                left: false,
                right: false,
                case: false,
            },
            lid_open,
            rssi,
            last_seen_ms: 1000,
            lid_counter: 1,
        }
    }

    #[test]
    fn test_rssi_filter_and_debounce_sequence() {
        let mut sm = StateMachine::new();
        let far_dev = sample_device(-72, true);
        assert_eq!(sm.on_ble_device(&far_dev, 1000), StateOutput::None);
        assert_eq!(sm.state(), PopupState::Idle);

        let near_dev = sample_device(-48, true);
        let out = sm.on_ble_device(&near_dev, 2000);
        assert!(matches!(out, StateOutput::ShowCaseOpenPopup { .. }));
        assert_eq!(sm.state(), PopupState::CaseOpenNearby);

        let debounced = sm.on_ble_device(&near_dev, 5000);
        assert!(matches!(debounced, StateOutput::UpdateBattery { .. }));

        let after_debounce = sm.on_ble_device(&near_dev, 15_000);
        assert!(matches!(
            after_debounce,
            StateOutput::ShowCaseOpenPopup { .. }
        ));
    }

    #[test]
    fn test_lid_close_and_bt_connect_sequence() {
        let mut sm = StateMachine::new();
        let open_dev = sample_device(-50, true);
        sm.on_ble_device(&open_dev, 1000);
        assert_eq!(sm.state(), PopupState::CaseOpenNearby);

        let closed_dev = sample_device(-50, false);
        assert_eq!(sm.on_ble_device(&closed_dev, 2000), StateOutput::HidePopup);
        assert_eq!(sm.state(), PopupState::Idle);

        let bt_conn = BtEvent::Connected {
            device_id: "bt-1".to_string(),
            name: "Pro 3 de Ignacio".to_string(),
            timestamp_ms: 3000,
        };
        let conn_out = sm.on_bt_event(&bt_conn, Some(&open_dev));
        assert!(matches!(conn_out, StateOutput::ShowConnectedPopup { .. }));
        assert_eq!(sm.state(), PopupState::Connected);
    }

    #[test]
    fn test_fullscreen_suppresses_popup() {
        let mut sm = StateMachine::new();
        sm.set_fullscreen_exclusive(true);
        let near_dev = sample_device(-45, true);
        let out = sm.on_ble_device(&near_dev, 1000);
        assert!(matches!(out, StateOutput::UpdateBattery { .. }));
        assert_eq!(sm.state(), PopupState::Idle);
    }
}

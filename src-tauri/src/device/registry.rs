use crate::ble::apple_proximity::{BatteryState, ChargingState, ProximityPayload};
use crate::device::catalog::ModelCatalog;
use crate::device::classify::{guess_from_name, FormFactor};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub const MAX_TRACKED_DEVICES: usize = 32;
pub const DEVICE_TTL_MS: u64 = 30 * 60 * 1000;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackedDevice {
    pub logical_id: String,
    pub catalog_model_id: String,
    pub display_name: String,
    pub vendor: String,
    pub kind: String,
    pub silhouette: String,
    pub color_id: String,
    pub battery: BatteryState,
    pub charging: ChargingState,
    pub lid_open: bool,
    pub rssi: i16,
    pub last_seen_ms: u64,
    pub lid_counter: u8,
}

pub struct DeviceRegistry {
    catalog: ModelCatalog,
    devices: HashMap<String, TrackedDevice>,
    form_overrides: HashMap<String, FormFactor>,
}

impl DeviceRegistry {
    pub fn new(catalog: ModelCatalog) -> Self {
        Self {
            catalog,
            devices: HashMap::new(),
            form_overrides: HashMap::new(),
        }
    }

    pub fn catalog(&self) -> &ModelCatalog {
        &self.catalog
    }

    pub fn tracked_count(&self) -> usize {
        self.devices.len()
    }

    pub fn set_form_override(&mut self, device_name: &str, form: FormFactor) {
        self.form_overrides.insert(device_name.to_string(), form);
        for dev in self.devices.values_mut() {
            if dev.display_name == device_name {
                dev.kind = form.catalog_kind().to_string();
                if form == FormFactor::OverEar {
                    dev.silhouette = "over-ear-sculpted".to_string();
                    dev.battery.case = None;
                } else {
                    dev.silhouette = "bud-in-ear".to_string();
                    if dev.battery.case.is_none() {
                        dev.battery.case = Some(76);
                    }
                }
            }
        }
    }

    pub fn form_override(&self, device_name: &str) -> Option<FormFactor> {
        self.form_overrides.get(device_name).copied()
    }

    fn evict_stale_and_bound(&mut self, now_ms: u64) {
        self.devices
            .retain(|_, dev| now_ms.saturating_sub(dev.last_seen_ms) <= DEVICE_TTL_MS);

        while self.devices.len() >= MAX_TRACKED_DEVICES {
            if let Some(oldest_key) = self
                .devices
                .iter()
                .min_by_key(|(_, d)| d.last_seen_ms)
                .map(|(k, _)| k.clone())
            {
                self.devices.remove(&oldest_key);
            } else {
                break;
            }
        }
    }

    pub fn ingest_ble(
        &mut self,
        payload: &ProximityPayload,
        rssi: i16,
        timestamp_ms: u64,
    ) -> TrackedDevice {
        self.evict_stale_and_bound(timestamp_ms);

        let model_def = self.catalog.find_by_ble_model_id(payload.model_id);
        let (catalog_model_id, display_name, vendor, kind, silhouette, color_id) = match model_def {
            Some(def) => (
                def.id.clone(),
                def.display_name.clone(),
                def.vendor.clone(),
                def.kind.clone(),
                def.silhouette.clone(),
                self.catalog.resolve_color_id(def, payload.color),
            ),
            None => (
                "airpods-pro-3".to_string(),
                "Pro 3".to_string(),
                "GenericPro".to_string(),
                "earbuds".to_string(),
                "stem-earbuds".to_string(),
                "white".to_string(),
            ),
        };

        let logical_id = format!("{}-{:02x}", catalog_model_id, payload.color);
        let tracked = TrackedDevice {
            logical_id: logical_id.clone(),
            catalog_model_id,
            display_name,
            vendor,
            kind,
            silhouette,
            color_id,
            battery: payload.battery(),
            charging: payload.charging_state(),
            lid_open: payload.lid_open,
            rssi,
            last_seen_ms: timestamp_ms,
            lid_counter: payload.lid_counter,
        };

        self.devices.insert(logical_id, tracked.clone());
        tracked
    }

    pub fn ingest_bt_connection(&mut self, bt_name: &str, timestamp_ms: u64) -> TrackedDevice {
        self.evict_stale_and_bound(timestamp_ms);

        let override_form = self.form_overrides.get(bt_name).copied();
        let model_def = self
            .catalog
            .resolve_for_bt_name(bt_name, override_form)
            .or_else(|| self.catalog.find_by_id("airpods-pro-3"));

        let (catalog_model_id, display_name, vendor, kind, silhouette, color_id) = match model_def {
            Some(def) => {
                let disp = if def.generic {
                    bt_name.to_string()
                } else {
                    def.display_name.clone()
                };
                let vend = if def.generic {
                    guess_from_name(bt_name)
                        .vendor
                        .unwrap_or(&def.vendor)
                        .to_string()
                } else {
                    def.vendor.clone()
                };
                (
                    def.id.clone(),
                    disp,
                    vend,
                    def.kind.clone(),
                    def.silhouette.clone(),
                    def.colors
                        .first()
                        .map(|c| c.id.clone())
                        .unwrap_or_else(|| "black".to_string()),
                )
            }
            None => (
                "generic-earbuds".to_string(),
                bt_name.to_string(),
                guess_from_name(bt_name)
                    .vendor
                    .unwrap_or("Genérico")
                    .to_string(),
                "earbuds".to_string(),
                "bud-in-ear".to_string(),
                "graphite".to_string(),
            ),
        };

        let is_over_ear = kind == "over-ear";
        let logical_id = format!("{}-bt", catalog_model_id);
        let tracked = TrackedDevice {
            logical_id: logical_id.clone(),
            catalog_model_id,
            display_name,
            vendor,
            kind,
            silhouette,
            color_id,
            battery: BatteryState {
                left: Some(88),
                right: Some(88),
                case: if is_over_ear { None } else { Some(76) },
            },
            charging: ChargingState {
                left: false,
                right: false,
                case: false,
            },
            lid_open: true,
            rssi: -42,
            last_seen_ms: timestamp_ms,
            lid_counter: 1,
        };

        self.devices.insert(logical_id, tracked.clone());
        tracked
    }

    pub fn latest_device(&self) -> Option<&TrackedDevice> {
        self.devices.values().max_by_key(|d| d.last_seen_ms)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lru_and_ttl_eviction_bounds_memory() {
        let mut reg = DeviceRegistry::new(ModelCatalog::embedded());
        for i in 0..40u8 {
            let payload = ProximityPayload {
                model_id: 8231,
                color: i,
                battery_left: Some(80),
                battery_right: Some(80),
                battery_case: Some(80),
                charging_left: false,
                charging_right: false,
                charging_case: false,
                charging: false,
                lid_open: true,
                flipped: false,
                in_ear_left: false,
                in_ear_right: false,
                lid_counter: 1,
            };
            reg.ingest_ble(&payload, -45, 1000 + (i as u64) * 10);
        }
        assert!(reg.tracked_count() <= MAX_TRACKED_DEVICES);
    }

    #[test]
    fn test_ingest_generic_device_and_form_override() {
        let mut reg = DeviceRegistry::new(ModelCatalog::embedded());
        let dev = reg.ingest_bt_connection("Unknown TWS Pro", 2000);
        assert_eq!(dev.kind, "earbuds");
        assert_eq!(dev.catalog_model_id, "generic-earbuds");
        assert_eq!(dev.display_name, "Unknown TWS Pro");

        reg.set_form_override("Unknown TWS Pro", FormFactor::OverEar);
        let updated = reg.ingest_bt_connection("Unknown TWS Pro", 3000);
        assert_eq!(updated.kind, "over-ear");
        assert_eq!(updated.catalog_model_id, "generic-headphones");
        assert_eq!(updated.battery.case, None);
    }
}

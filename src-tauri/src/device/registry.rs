use crate::ble::apple_proximity::{BatteryState, ChargingState, ProximityPayload};
use crate::device::catalog::ModelCatalog;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackedDevice {
    pub logical_id: String,
    pub catalog_model_id: String,
    pub display_name: String,
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
}

impl DeviceRegistry {
    pub fn new(catalog: ModelCatalog) -> Self {
        Self {
            catalog,
            devices: HashMap::new(),
        }
    }

    pub fn catalog(&self) -> &ModelCatalog {
        &self.catalog
    }

    pub fn ingest_ble(
        &mut self,
        payload: &ProximityPayload,
        rssi: i16,
        timestamp_ms: u64,
    ) -> TrackedDevice {
        let model_def = self.catalog.find_by_ble_model_id(payload.model_id);
        let (catalog_model_id, display_name, color_id) = match model_def {
            Some(def) => (
                def.id.clone(),
                def.display_name.clone(),
                self.catalog.resolve_color_id(def, payload.color),
            ),
            None => (
                "airpods-pro-3".to_string(),
                "Pro 3".to_string(),
                "white".to_string(),
            ),
        };

        let logical_id = format!("{}-{:02x}", catalog_model_id, payload.color);
        let tracked = TrackedDevice {
            logical_id: logical_id.clone(),
            catalog_model_id,
            display_name,
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

    pub fn latest_device(&self) -> Option<&TrackedDevice> {
        self.devices.values().max_by_key(|d| d.last_seen_ms)
    }
}

use crate::ble::apple_proximity::{BatteryState, ChargingState};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub const TOAST_COOLDOWN_MS: u64 = 30 * 60 * 1000;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ToastKind {
    Battery20Percent,
    Battery10Percent,
    CaseCharged,
    ConnectedSilent,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToastMessage {
    pub kind: ToastKind,
    pub title: String,
    pub body: String,
}

#[derive(Default)]
pub struct ToastLimiter {
    last_sent_ms: HashMap<(String, ToastKind), u64>,
    previous_case_battery: HashMap<String, u8>,
}

impl ToastLimiter {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn can_send(&mut self, device_id: &str, kind: ToastKind, now_ms: u64) -> bool {
        let key = (device_id.to_string(), kind);
        if let Some(&last_ts) = self.last_sent_ms.get(&key) {
            if now_ms.saturating_sub(last_ts) < TOAST_COOLDOWN_MS {
                return false;
            }
        }
        self.last_sent_ms.insert(key, now_ms);
        true
    }

    pub fn evaluate_battery(
        &mut self,
        device_id: &str,
        device_name: &str,
        battery: &BatteryState,
        charging: &ChargingState,
        now_ms: u64,
    ) -> Vec<ToastMessage> {
        let mut messages = Vec::new();
        let min_pod = [battery.left, battery.right].into_iter().flatten().min();

        if let Some(level) = min_pod {
            if !charging.left && !charging.right {
                if level <= 10 && self.can_send(device_id, ToastKind::Battery10Percent, now_ms) {
                    messages.push(ToastMessage {
                        kind: ToastKind::Battery10Percent,
                        title: format!("{} — Batería crítica ({}%)", device_name, level),
                        body: "Coloca los auriculares en la caja para cargarlos.".to_string(),
                    });
                } else if level <= 20
                    && level > 10
                    && self.can_send(device_id, ToastKind::Battery20Percent, now_ms)
                {
                    messages.push(ToastMessage {
                        kind: ToastKind::Battery20Percent,
                        title: format!("{} — Batería baja ({}%)", device_name, level),
                        body: "Queda un 20 % de batería en tus auriculares.".to_string(),
                    });
                }
            }
        }

        if let Some(case_level) = battery.case {
            let prev = self
                .previous_case_battery
                .insert(device_id.to_string(), case_level);
            if case_level == 100
                && prev.map(|p| p < 100).unwrap_or(false)
                && self.can_send(device_id, ToastKind::CaseCharged, now_ms)
            {
                messages.push(ToastMessage {
                    kind: ToastKind::CaseCharged,
                    title: format!("Caja de {} cargada", device_name),
                    body: "La batería del estuche ha alcanzado el 100 %.".to_string(),
                });
            }
        }

        messages
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_toast_anti_spam_30_minutes() {
        let mut limiter = ToastLimiter::new();
        let bat_20 = BatteryState {
            left: Some(20),
            right: Some(50),
            case: Some(80),
        };
        let charging = ChargingState {
            left: false,
            right: false,
            case: false,
        };

        let first = limiter.evaluate_battery("dev-1", "Pro 3", &bat_20, &charging, 1_000);
        assert_eq!(first.len(), 1);
        assert_eq!(first[0].kind, ToastKind::Battery20Percent);

        let duplicate = limiter.evaluate_battery("dev-1", "Pro 3", &bat_20, &charging, 60_000);
        assert!(duplicate.is_empty());

        let after_30m = limiter.evaluate_battery(
            "dev-1",
            "Pro 3",
            &bat_20,
            &charging,
            1_000 + TOAST_COOLDOWN_MS + 1,
        );
        assert_eq!(after_30m.len(), 1);
    }
}

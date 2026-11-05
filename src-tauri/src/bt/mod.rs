pub mod linux;
pub mod macos;
pub mod windows;

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum BtEvent {
    Connected {
        device_id: String,
        name: String,
        timestamp_ms: u64,
    },
    Disconnected {
        device_id: String,
        name: String,
        timestamp_ms: u64,
    },
}

pub trait BtBackend: Send + Sync {
    fn start(&self, sender: mpsc::Sender<BtEvent>) -> Result<()>;
}

#[derive(Clone, Default)]
pub struct ConnectionDebouncer {
    last_emitted_ms: Arc<Mutex<HashMap<String, (bool, u64)>>>,
    debounce_window_ms: u64,
}

impl ConnectionDebouncer {
    pub fn new(debounce_window_ms: u64) -> Self {
        Self {
            last_emitted_ms: Arc::new(Mutex::new(HashMap::new())),
            debounce_window_ms,
        }
    }

    pub fn should_emit(&self, device_id: &str, connected: bool, timestamp_ms: u64) -> bool {
        if let Ok(mut map) = self.last_emitted_ms.lock() {
            if let Some(&(prev_connected, prev_ts)) = map.get(device_id) {
                if prev_connected == connected
                    && timestamp_ms.saturating_sub(prev_ts) < self.debounce_window_ms
                {
                    return false;
                }
            }
            map.insert(device_id.to_string(), (connected, timestamp_ms));
            true
        } else {
            false
        }
    }
}

#[derive(Clone, Default)]
pub struct FakeBackend {
    queued_events: Arc<Mutex<Vec<BtEvent>>>,
}

impl FakeBackend {
    pub fn new(events: Vec<BtEvent>) -> Self {
        Self {
            queued_events: Arc::new(Mutex::new(events)),
        }
    }

    pub fn push_event(&self, event: BtEvent) {
        if let Ok(mut guard) = self.queued_events.lock() {
            guard.push(event);
        }
    }
}

impl BtBackend for FakeBackend {
    fn start(&self, sender: mpsc::Sender<BtEvent>) -> Result<()> {
        let debouncer = ConnectionDebouncer::new(1500);
        if let Ok(guard) = self.queued_events.lock() {
            for evt in guard.iter() {
                let (id, is_conn, ts) = match evt {
                    BtEvent::Connected {
                        device_id,
                        timestamp_ms,
                        ..
                    } => (device_id.as_str(), true, *timestamp_ms),
                    BtEvent::Disconnected {
                        device_id,
                        timestamp_ms,
                        ..
                    } => (device_id.as_str(), false, *timestamp_ms),
                };
                if debouncer.should_emit(id, is_conn, ts) {
                    let _ = sender.try_send(evt.clone());
                }
            }
        }
        Ok(())
    }
}

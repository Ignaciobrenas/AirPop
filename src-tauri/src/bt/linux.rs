use crate::bt::{BtBackend, BtEvent, ConnectionDebouncer};
use anyhow::Result;
use tokio::sync::mpsc;

pub struct LinuxBtBackend {
    #[allow(dead_code)]
    debouncer: ConnectionDebouncer,
}

impl Default for LinuxBtBackend {
    fn default() -> Self {
        Self::new()
    }
}

impl LinuxBtBackend {
    pub fn new() -> Self {
        Self {
            debouncer: ConnectionDebouncer::new(2000),
        }
    }
}

impl BtBackend for LinuxBtBackend {
    #[cfg(target_os = "linux")]
    fn start(&self, sender: mpsc::Sender<BtEvent>) -> Result<()> {
        let debouncer = self.debouncer.clone();
        tokio::spawn(async move {
            if let Err(e) = run_linux_bluetooth(sender, debouncer).await {
                tracing::warn!("linux bluetooth backend error: {}", e);
            }
        });
        Ok(())
    }

    #[cfg(not(target_os = "linux"))]
    fn start(&self, _sender: mpsc::Sender<BtEvent>) -> Result<()> {
        Ok(())
    }
}

#[cfg(target_os = "linux")]
async fn run_linux_bluetooth(
    sender: mpsc::Sender<BtEvent>,
    debouncer: ConnectionDebouncer,
) -> Result<()> {
    use bluer::{AdapterEvent, DeviceEvent, DeviceProperty, Session};
    use futures_util::StreamExt;
    use std::time::{SystemTime, UNIX_EPOCH};

    let session = Session::new().await?;
    let adapter = session.default_adapter().await?;

    let device_addrs = adapter.device_addresses().await.unwrap_or_default();
    for addr in device_addrs {
        if let Ok(dev) = adapter.device(addr) {
            if dev.is_connected().await.unwrap_or(false) {
                let name = dev
                    .name()
                    .await
                    .ok()
                    .flatten()
                    .unwrap_or_else(|| "Bluetooth Audio".to_string());
                let now_ms = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .map(|d| d.as_millis() as u64)
                    .unwrap_or(0);
                let dev_id = addr.to_string();
                if debouncer.should_emit(&dev_id, true, now_ms) {
                    let _ = sender
                        .send(BtEvent::Connected {
                            device_id: dev_id,
                            name,
                            timestamp_ms: now_ms,
                        })
                        .await;
                }
            }
        }
    }

    let mut events = adapter.events().await?;
    while let Some(evt) = events.next().await {
        if let AdapterEvent::DeviceAdded(addr) = evt {
            let sender = sender.clone();
            let debouncer = debouncer.clone();
            let adapter = adapter.clone();
            tokio::spawn(async move {
                if let Ok(dev) = adapter.device(addr) {
                    if let Ok(mut dev_events) = dev.events().await {
                        while let Some(dev_evt) = dev_events.next().await {
                            if let DeviceEvent::PropertyChanged(DeviceProperty::Connected(
                                connected,
                            )) = dev_evt
                            {
                                let now_ms = SystemTime::now()
                                    .duration_since(UNIX_EPOCH)
                                    .map(|d| d.as_millis() as u64)
                                    .unwrap_or(0);
                                let dev_id = addr.to_string();
                                if debouncer.should_emit(&dev_id, connected, now_ms) {
                                    let name = dev
                                        .name()
                                        .await
                                        .ok()
                                        .flatten()
                                        .unwrap_or_else(|| "Bluetooth Audio".to_string());
                                    let bt_evt = if connected {
                                        BtEvent::Connected {
                                            device_id: dev_id,
                                            name,
                                            timestamp_ms: now_ms,
                                        }
                                    } else {
                                        BtEvent::Disconnected {
                                            device_id: dev_id,
                                            name,
                                            timestamp_ms: now_ms,
                                        }
                                    };
                                    let _ = sender.send(bt_evt).await;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    Ok(())
}

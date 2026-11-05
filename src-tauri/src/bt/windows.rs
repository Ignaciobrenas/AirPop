use crate::bt::{BtBackend, BtEvent, ConnectionDebouncer};
use anyhow::Result;
use tokio::sync::mpsc;

pub struct WindowsBtBackend {
    debouncer: ConnectionDebouncer,
}

impl Default for WindowsBtBackend {
    fn default() -> Self {
        Self::new()
    }
}

impl WindowsBtBackend {
    pub fn new() -> Self {
        Self {
            debouncer: ConnectionDebouncer::new(2000),
        }
    }
}

impl BtBackend for WindowsBtBackend {
    #[cfg(windows)]
    fn start(&self, sender: mpsc::Sender<BtEvent>) -> Result<()> {
        use tracing::info;
        use windows::Devices::Bluetooth::{BluetoothConnectionStatus, BluetoothDevice};
        use windows::Devices::Enumeration::{DeviceInformation, DeviceWatcher};
        use windows::Foundation::TypedEventHandler;

        let selector = BluetoothDevice::GetDeviceSelectorFromPairingState(true)?;
        let watcher: DeviceWatcher = DeviceInformation::CreateWatcherAqsFilter(&selector)?;
        let debouncer = self.debouncer.clone();

        let added_handler = TypedEventHandler::<DeviceWatcher, DeviceInformation>::new(
            move |_, device_info_opt| {
                if let Some(device_info) = device_info_opt {
                    if let Ok(id) = device_info.Id() {
                        if let Ok(async_op) = BluetoothDevice::FromIdAsync(&id) {
                            if let Ok(bt_device) = async_op.get() {
                                let tx = sender.clone();
                                let debouncer_inner = debouncer.clone();
                                let status_handler = TypedEventHandler::<
                                    BluetoothDevice,
                                    windows::core::IInspectable,
                                >::new(
                                    move |dev_opt, _| {
                                        if let Some(dev) = dev_opt {
                                            let dev_id = dev
                                                .DeviceId()
                                                .map(|s| s.to_string())
                                                .unwrap_or_default();
                                            let name = dev
                                                .Name()
                                                .map(|s| s.to_string())
                                                .unwrap_or_else(|_| "Auriculares".to_string());
                                            let status = dev
                                                .ConnectionStatus()
                                                .unwrap_or(BluetoothConnectionStatus::Disconnected);
                                            let connected =
                                                status == BluetoothConnectionStatus::Connected;
                                            let now_ms = std::time::SystemTime::now()
                                                .duration_since(std::time::UNIX_EPOCH)
                                                .map(|d| d.as_millis() as u64)
                                                .unwrap_or(0);

                                            if debouncer_inner
                                                .should_emit(&dev_id, connected, now_ms)
                                            {
                                                let evt = if connected {
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
                                                info!("bluetooth connection event: {:?}", evt);
                                                let _ = tx.try_send(evt);
                                            }
                                        }
                                        Ok(())
                                    },
                                );
                                let _ = bt_device.ConnectionStatusChanged(&status_handler);
                            }
                        }
                    }
                }
                Ok(())
            },
        );

        watcher.Added(&added_handler)?;
        watcher.Start()?;
        Ok(())
    }

    #[cfg(not(windows))]
    fn start(&self, _sender: mpsc::Sender<BtEvent>) -> Result<()> {
        Ok(())
    }
}

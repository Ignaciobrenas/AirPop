use crate::ble::apple_proximity::{parse, ProximityPayload, APPLE_COMPANY_ID};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use tracing::{debug, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BleAdvertisementEvent {
    pub payload: ProximityPayload,
    pub rssi: i16,
    pub timestamp_ms: u64,
}

pub struct BleScanner {
    sender: mpsc::Sender<BleAdvertisementEvent>,
}

impl BleScanner {
    pub fn new(sender: mpsc::Sender<BleAdvertisementEvent>) -> Self {
        Self { sender }
    }

    pub fn process_manufacturer_data(
        &self,
        company_id: u16,
        data: &[u8],
        rssi: i16,
        timestamp_ms: u64,
    ) -> Option<BleAdvertisementEvent> {
        if company_id != APPLE_COMPANY_ID {
            return None;
        }
        match parse(data) {
            Ok(payload) => {
                let evt = BleAdvertisementEvent {
                    payload,
                    rssi,
                    timestamp_ms,
                };
                if let Err(err) = self.sender.try_send(evt.clone()) {
                    warn!("ble channel full or closed: {}", err);
                }
                Some(evt)
            }
            Err(err) => {
                debug!("ignoring non-proximity apple ble frame: {}", err);
                None
            }
        }
    }

    #[cfg(windows)]
    pub fn start_windows_watcher(sender: mpsc::Sender<BleAdvertisementEvent>) -> Result<()> {
        use windows::Devices::Bluetooth::Advertisement::{
            BluetoothLEAdvertisementReceivedEventArgs, BluetoothLEAdvertisementWatcher,
            BluetoothLEScanningMode,
        };
        use windows::Foundation::TypedEventHandler;

        let watcher = BluetoothLEAdvertisementWatcher::new()?;
        watcher.SetScanningMode(BluetoothLEScanningMode::Active)?;

        let scanner = BleScanner::new(sender);
        let handler = TypedEventHandler::<
            BluetoothLEAdvertisementWatcher,
            BluetoothLEAdvertisementReceivedEventArgs,
        >::new(move |_, args| {
            if let Some(args) = args {
                let rssi = args.RawSignalStrengthInDBm().unwrap_or(-100);
                if let Ok(adv) = args.Advertisement() {
                    if let Ok(sections) = adv.ManufacturerData() {
                        let count = sections.Size().unwrap_or(0);
                        for i in 0..count {
                            if let Ok(section) = sections.GetAt(i) {
                                let company_id = section.CompanyId().unwrap_or(0);
                                if company_id == APPLE_COMPANY_ID {
                                    if let Ok(buffer) = section.Data() {
                                        if let Ok(reader) =
                                            windows::Storage::Streams::DataReader::FromBuffer(
                                                &buffer,
                                            )
                                        {
                                            let len = buffer.Length().unwrap_or(0) as usize;
                                            let mut bytes = vec![0u8; len];
                                            if reader.ReadBytes(&mut bytes).is_ok() {
                                                let now_ms = std::time::SystemTime::now()
                                                    .duration_since(std::time::UNIX_EPOCH)
                                                    .map(|d| d.as_millis() as u64)
                                                    .unwrap_or(0);
                                                scanner.process_manufacturer_data(
                                                    company_id, &bytes, rssi, now_ms,
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            Ok(())
        });

        watcher.Received(&handler)?;
        watcher.Start()?;
        Ok(())
    }

    #[cfg(not(windows))]
    pub fn start_windows_watcher(_sender: mpsc::Sender<BleAdvertisementEvent>) -> Result<()> {
        Ok(())
    }
}

use anyhow::{Context, Result};
use btleplug::api::{Central, CentralEvent, Manager as _, ScanFilter};
use btleplug::platform::Manager;
use clap::Parser;
use futures::StreamExt;
use std::time::Duration;

const APPLE_COMPANY_ID: u16 = 0x004C;
const PROXIMITY_PAIRING_TYPE: u8 = 0x07;

#[derive(Parser, Debug)]
#[command(name = "airpop-capture")]
#[command(about = "Captures Apple 0x004C BLE Proximity Pairing payloads in hexadecimal")]
struct Args {
    #[arg(short, long, default_value_t = 30)]
    duration_secs: u64,

    #[arg(long, default_value_t = false)]
    all_apple: bool,
}

#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();
    let manager = Manager::new().await.context("failed to initialize BLE manager")?;
    let adapters = manager.adapters().await.context("failed to list BLE adapters")?;
    let central = adapters
        .into_iter()
        .next()
        .context("no Bluetooth LE adapter found")?;

    println!("Scanning Apple BLE advertisements (0x004C) for {}s...", args.duration_secs);
    central.start_scan(ScanFilter::default()).await?;

    let mut events = central.events().await?;
    let deadline = tokio::time::Instant::now() + Duration::from_secs(args.duration_secs);

    while tokio::time::Instant::now() < deadline {
        tokio::select! {
            maybe_event = events.next() => {
                if let Some(CentralEvent::ManufacturerDataAdvertisement { id, manufacturer_data }) = maybe_event {
                    if let Some(payload) = manufacturer_data.get(&APPLE_COMPANY_ID) {
                        if args.all_apple || payload.first().copied() == Some(PROXIMITY_PAIRING_TYPE) {
                            let mut full = Vec::with_capacity(2 + payload.len());
                            full.extend_from_slice(&APPLE_COMPANY_ID.to_le_bytes());
                            full.extend_from_slice(payload);
                            println!("device={:?} hex={}", id, hex::encode(&full));
                        }
                    }
                }
            }
            _ = tokio::time::sleep_until(deadline) => {
                break;
            }
        }
    }

    central.stop_scan().await?;
    Ok(())
}

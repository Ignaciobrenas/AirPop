use crate::bt::{BtBackend, BtEvent};
use anyhow::Result;
use tokio::sync::mpsc;

#[derive(Default)]
pub struct LinuxBtBackend;

impl LinuxBtBackend {
    pub fn new() -> Self {
        Self
    }
}

impl BtBackend for LinuxBtBackend {
    fn start(&self, _sender: mpsc::Sender<BtEvent>) -> Result<()> {
        Ok(())
    }
}

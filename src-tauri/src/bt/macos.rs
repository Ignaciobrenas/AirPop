use crate::bt::{BtBackend, BtEvent};
use anyhow::Result;
use tokio::sync::mpsc;

#[derive(Default)]
pub struct MacOsBtBackend;

impl MacOsBtBackend {
    pub fn new() -> Self {
        Self
    }
}

impl BtBackend for MacOsBtBackend {
    fn start(&self, _sender: mpsc::Sender<BtEvent>) -> Result<()> {
        Ok(())
    }
}

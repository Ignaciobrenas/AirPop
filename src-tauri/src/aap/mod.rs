use serde::{Deserialize, Serialize};
use thiserror::Error;

pub const AAP_L2CAP_PSM: u16 = 0x1001;

pub const AAP_HANDSHAKE_PACKET: [u8; 16] = [
    0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];

pub const AAP_NOTIFICATION_SUBSCRIBE_PACKET: [u8; 10] =
    [0x04, 0x00, 0x04, 0x00, 0x0F, 0x00, 0xFF, 0xFF, 0xFE, 0xFF];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ListeningMode {
    Off,
    NoiseCancellation,
    Transparency,
    Adaptive,
}

impl ListeningMode {
    pub fn to_aap_byte(self) -> u8 {
        match self {
            ListeningMode::Off => 0x01,
            ListeningMode::NoiseCancellation => 0x02,
            ListeningMode::Transparency => 0x03,
            ListeningMode::Adaptive => 0x04,
        }
    }

    pub fn from_aap_byte(byte: u8) -> Option<Self> {
        match byte {
            0x01 => Some(ListeningMode::Off),
            0x02 => Some(ListeningMode::NoiseCancellation),
            0x03 => Some(ListeningMode::Transparency),
            0x04 => Some(ListeningMode::Adaptive),
            _ => None,
        }
    }

    pub fn encode_command(self) -> [u8; 11] {
        [
            0x04,
            0x00,
            0x04,
            0x00,
            0x09,
            0x00,
            0x0D,
            self.to_aap_byte(),
            0x00,
            0x00,
            0x00,
        ]
    }
}

pub fn decode_listening_mode_packet(packet: &[u8]) -> Option<ListeningMode> {
    if packet.len() >= 8
        && packet[0] == 0x04
        && packet[2] == 0x04
        && packet[4] == 0x09
        && packet[6] == 0x0D
    {
        ListeningMode::from_aap_byte(packet[7])
    } else {
        None
    }
}

#[derive(Debug, Error)]
pub enum AapError {
    #[error("L2CAP PSM 0x1001 is not supported on Windows user-mode Bluetooth stack")]
    UnsupportedPlatform,
    #[error("device not connected")]
    NotConnected,
}

pub struct AapController {
    simulated: bool,
    current_mode: Option<ListeningMode>,
}

impl AapController {
    pub fn new(simulated: bool) -> Self {
        Self {
            simulated,
            current_mode: if simulated {
                Some(ListeningMode::NoiseCancellation)
            } else {
                None
            },
        }
    }

    pub fn is_supported(&self) -> bool {
        if self.simulated {
            return true;
        }
        #[cfg(windows)]
        {
            false
        }
        #[cfg(not(windows))]
        {
            true
        }
    }

    pub fn current_mode(&self) -> Option<ListeningMode> {
        self.current_mode
    }

    pub fn set_listening_mode(&mut self, mode: ListeningMode) -> Result<[u8; 11], AapError> {
        if !self.is_supported() {
            return Err(AapError::UnsupportedPlatform);
        }
        self.current_mode = Some(mode);
        Ok(mode.encode_command())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_and_decode_listening_mode() {
        for mode in [
            ListeningMode::Off,
            ListeningMode::NoiseCancellation,
            ListeningMode::Transparency,
            ListeningMode::Adaptive,
        ] {
            let packet = mode.encode_command();
            assert_eq!(decode_listening_mode_packet(&packet), Some(mode));
        }
    }

    #[test]
    fn test_simulated_controller_supports_mode_switching() {
        let mut controller = AapController::new(true);
        assert!(controller.is_supported());
        let packet = controller
            .set_listening_mode(ListeningMode::Adaptive)
            .expect("simulated mode succeeds");
        assert_eq!(packet[7], 0x04);
        assert_eq!(controller.current_mode(), Some(ListeningMode::Adaptive));
    }
}

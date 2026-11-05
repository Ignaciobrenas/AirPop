use serde::{Deserialize, Serialize};
use thiserror::Error;

pub const APPLE_COMPANY_ID: u16 = 0x004C;
pub const PROXIMITY_PAIRING_TYPE: u8 = 0x07;
pub const MIN_PROXIMITY_PAYLOAD_LEN: usize = 11;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum ParseError {
    #[error("payload too short: expected at least {expected} bytes, got {actual}")]
    TooShort { expected: usize, actual: usize },
    #[error("unexpected message type: expected 0x07, got 0x{0:02X}")]
    InvalidMessageType(u8),
    #[error("invalid hex string: {0}")]
    InvalidHex(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatteryState {
    pub left: Option<u8>,
    pub right: Option<u8>,
    pub case: Option<u8>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChargingState {
    pub left: bool,
    pub right: bool,
    pub case: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProximityPayload {
    pub model_id: u16,
    pub color: u8,
    pub battery_left: Option<u8>,
    pub battery_right: Option<u8>,
    pub battery_case: Option<u8>,
    pub charging_left: bool,
    pub charging_right: bool,
    pub charging_case: bool,
    pub charging: bool,
    pub lid_open: bool,
    pub flipped: bool,
    pub in_ear_left: bool,
    pub in_ear_right: bool,
    pub lid_counter: u8,
}

impl ProximityPayload {
    pub fn battery(&self) -> BatteryState {
        BatteryState {
            left: self.battery_left,
            right: self.battery_right,
            case: self.battery_case,
        }
    }

    pub fn charging_state(&self) -> ChargingState {
        ChargingState {
            left: self.charging_left,
            right: self.charging_right,
            case: self.charging_case,
        }
    }

    pub fn correlation_signature(&self) -> u64 {
        let l = self.battery_left.unwrap_or(0xFF) as u64;
        let r = self.battery_right.unwrap_or(0xFF) as u64;
        let c = self.battery_case.unwrap_or(0xFF) as u64;
        ((self.model_id as u64) << 32)
            | ((self.color as u64) << 24)
            | (l << 16)
            | (r << 8)
            | c
    }
}

pub fn battery_from_nibble(nibble: u8) -> Option<u8> {
    match nibble {
        0..=10 => Some(nibble * 10),
        _ => None,
    }
}

pub fn parse(data: &[u8]) -> Result<ProximityPayload, ParseError> {
    let payload = if data.len() >= 2 && u16::from_le_bytes([data[0], data[1]]) == APPLE_COMPANY_ID {
        &data[2..]
    } else {
        data
    };

    if payload.len() < MIN_PROXIMITY_PAYLOAD_LEN {
        return Err(ParseError::TooShort {
            expected: MIN_PROXIMITY_PAYLOAD_LEN,
            actual: payload.len(),
        });
    }

    let msg_type = payload[0];
    if msg_type != PROXIMITY_PAIRING_TYPE {
        return Err(ParseError::InvalidMessageType(msg_type));
    }

    let model_id = u16::from_be_bytes([payload[3], payload[4]]);
    let status = payload[5];
    let pods_battery_byte = payload[6];
    let flags_and_case_byte = payload[7];
    let lid_byte = payload[8];
    let color = payload[9];

    let flipped = (status & 0x02) != 0;

    let first_nibble = (pods_battery_byte >> 4) & 0x0F;
    let second_nibble = pods_battery_byte & 0x0F;

    let (left_nibble, right_nibble) = if flipped {
        (second_nibble, first_nibble)
    } else {
        (first_nibble, second_nibble)
    };

    let case_nibble = flags_and_case_byte & 0x0F;
    let charging_flags = (flags_and_case_byte >> 4) & 0x0F;

    let (charging_left, charging_right) = if flipped {
        ((charging_flags & 0x01) != 0, (charging_flags & 0x02) != 0)
    } else {
        ((charging_flags & 0x02) != 0, (charging_flags & 0x01) != 0)
    };
    let charging_case = (charging_flags & 0x04) != 0;

    let (in_ear_left, in_ear_right) = if flipped {
        ((status & 0x08) != 0, (status & 0x02) != 0)
    } else {
        ((status & 0x02) != 0, (status & 0x08) != 0)
    };

    let lid_counter = lid_byte & 0x07;
    let lid_open = (lid_byte & 0x08) == 0;

    Ok(ProximityPayload {
        model_id,
        color,
        battery_left: battery_from_nibble(left_nibble),
        battery_right: battery_from_nibble(right_nibble),
        battery_case: battery_from_nibble(case_nibble),
        charging_left,
        charging_right,
        charging_case,
        charging: charging_left || charging_right || charging_case,
        lid_open,
        flipped,
        in_ear_left,
        in_ear_right,
        lid_counter,
    })
}

pub fn parse_hex(hex_str: &str) -> Result<ProximityPayload, ParseError> {
    let cleaned: String = hex_str.chars().filter(|c| !c.is_whitespace()).collect();
    let bytes = hex::decode(&cleaned).map_err(|e| ParseError::InvalidHex(e.to_string()))?;
    parse(&bytes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_battery_from_nibble() {
        assert_eq!(battery_from_nibble(0), Some(0));
        assert_eq!(battery_from_nibble(5), Some(50));
        assert_eq!(battery_from_nibble(10), Some(100));
        assert_eq!(battery_from_nibble(11), None);
        assert_eq!(battery_from_nibble(0x0F), None);
    }

    #[test]
    fn test_rejects_short_payload_and_invalid_type() {
        assert_eq!(
            parse(&[0x07, 0x19, 0x01]),
            Err(ParseError::TooShort {
                expected: MIN_PROXIMITY_PAYLOAD_LEN,
                actual: 3
            })
        );
        let invalid_type = [0x09, 0x19, 0x01, 0x20, 0x24, 0x00, 0x88, 0x06, 0x01, 0x00, 0x00];
        assert_eq!(parse(&invalid_type), Err(ParseError::InvalidMessageType(0x09)));
    }

    #[test]
    fn test_fixture_airpods_pro_3_case_open() {
        let raw = include_str!("../../../tests/fixtures/airpods-pro-3-case-open.hex");
        let parsed = parse_hex(raw).expect("valid fixture");
        assert_eq!(parsed.model_id, 0x2027);
        assert_eq!(parsed.color, 0x00);
        assert_eq!(parsed.battery_left, Some(80));
        assert_eq!(parsed.battery_right, Some(80));
        assert_eq!(parsed.battery_case, Some(60));
        assert!(!parsed.charging);
        assert!(parsed.lid_open);
        assert!(!parsed.flipped);
    }

    #[test]
    fn test_fixture_airpods_4_connected() {
        let raw = include_str!("../../../tests/fixtures/airpods-4-connected.hex");
        let parsed = parse_hex(raw).expect("valid fixture");
        assert_eq!(parsed.model_id, 0x2019);
        assert_eq!(parsed.color, 0x00);
        assert_eq!(parsed.battery_left, Some(90));
        assert_eq!(parsed.battery_right, Some(100));
        assert_eq!(parsed.battery_case, Some(70));
        assert!(!parsed.charging);
        assert!(!parsed.lid_open);
    }

    #[test]
    fn test_fixture_airpods_4_anc_charging() {
        let raw = include_str!("../../../tests/fixtures/airpods-4-anc-charging.hex");
        let parsed = parse_hex(raw).expect("valid fixture");
        assert_eq!(parsed.model_id, 0x201B);
        assert_eq!(parsed.battery_left, Some(50));
        assert_eq!(parsed.battery_right, Some(60));
        assert_eq!(parsed.battery_case, Some(80));
        assert!(parsed.charging_left);
        assert!(parsed.charging_right);
        assert!(parsed.charging_case);
        assert!(parsed.charging);
    }

    #[test]
    fn test_fixture_airpods_max_2_low_battery() {
        let raw = include_str!("../../../tests/fixtures/airpods-max-2-low-battery.hex");
        let parsed = parse_hex(raw).expect("valid fixture");
        assert_eq!(parsed.model_id, 0x202F);
        assert_eq!(parsed.color, 0x02);
        assert_eq!(parsed.battery_left, Some(10));
        assert_eq!(parsed.battery_right, Some(10));
        assert_eq!(parsed.battery_case, None);
    }

    #[test]
    fn test_fixture_airpods_pro_2_flipped() {
        let raw = include_str!("../../../tests/fixtures/airpods-pro-2-flipped.hex");
        let parsed = parse_hex(raw).expect("valid fixture");
        assert_eq!(parsed.model_id, 0x2014);
        assert!(parsed.flipped);
        assert_eq!(parsed.battery_left, Some(40));
        assert_eq!(parsed.battery_right, Some(90));
        assert_eq!(parsed.battery_case, Some(100));
    }
}

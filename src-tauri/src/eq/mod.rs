pub mod apo;

use serde::{Deserialize, Serialize};
use std::f32::consts::PI;

pub const BAND_COUNT: usize = 10;
pub const BAND_FREQUENCIES_HZ: [f32; BAND_COUNT] = [
    31.0, 62.0, 125.0, 250.0, 500.0, 1000.0, 2000.0, 4000.0, 8000.0, 16000.0,
];
pub const MAX_GAIN_DB: f32 = 12.0;
pub const BAND_Q: f32 = 1.41;
pub const SAMPLE_RATE_HZ: f32 = 48_000.0;
pub const CUSTOM_PRESET_ID: &str = "custom";
pub const FLAT_PRESET_ID: &str = "flat";
const NEGLIGIBLE_GAIN_DB: f32 = 0.05;
const RESPONSE_GRID_POINTS: usize = 256;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PresetDefinition {
    pub id: String,
    pub label: String,
    pub gains: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PresetFile {
    pub bands: Vec<f32>,
    pub max_gain_db: f32,
    pub q: f32,
    pub presets: Vec<PresetDefinition>,
}

#[derive(Debug, Clone)]
pub struct EqPresets {
    presets: Vec<PresetDefinition>,
}

impl Default for EqPresets {
    fn default() -> Self {
        Self::embedded()
    }
}

impl EqPresets {
    pub fn embedded() -> Self {
        let raw = include_str!("../../../catalog/eq-presets.json");
        Self::from_json_str(raw).unwrap_or(Self {
            presets: vec![PresetDefinition {
                id: FLAT_PRESET_ID.to_string(),
                label: "Plano".to_string(),
                gains: vec![0.0; BAND_COUNT],
            }],
        })
    }

    pub fn from_json_str(raw: &str) -> Result<Self, serde_json::Error> {
        let parsed: PresetFile = serde_json::from_str(raw)?;
        Ok(Self {
            presets: parsed.presets,
        })
    }

    pub fn all(&self) -> &[PresetDefinition] {
        &self.presets
    }

    pub fn find(&self, id: &str) -> Option<&PresetDefinition> {
        self.presets.iter().find(|p| p.id == id)
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Biquad {
    pub b0: f32,
    pub b1: f32,
    pub b2: f32,
    pub a1: f32,
    pub a2: f32,
}

impl Biquad {
    pub fn peaking(frequency_hz: f32, gain_db: f32, q: f32, sample_rate_hz: f32) -> Self {
        let a = 10f32.powf(gain_db / 40.0);
        let w0 = 2.0 * PI * frequency_hz / sample_rate_hz;
        let alpha = w0.sin() / (2.0 * q);
        let cos_w0 = w0.cos();
        let a0 = 1.0 + alpha / a;
        Self {
            b0: (1.0 + alpha * a) / a0,
            b1: (-2.0 * cos_w0) / a0,
            b2: (1.0 - alpha * a) / a0,
            a1: (-2.0 * cos_w0) / a0,
            a2: (1.0 - alpha / a) / a0,
        }
    }

    pub fn magnitude_db(&self, frequency_hz: f32, sample_rate_hz: f32) -> f32 {
        let w = 2.0 * PI * frequency_hz / sample_rate_hz;
        let (cos1, sin1) = (w.cos(), w.sin());
        let (cos2, sin2) = ((2.0 * w).cos(), (2.0 * w).sin());
        let num_re = self.b0 + self.b1 * cos1 + self.b2 * cos2;
        let num_im = -(self.b1 * sin1 + self.b2 * sin2);
        let den_re = 1.0 + self.a1 * cos1 + self.a2 * cos2;
        let den_im = -(self.a1 * sin1 + self.a2 * sin2);
        let num = num_re * num_re + num_im * num_im;
        let den = den_re * den_re + den_im * den_im;
        10.0 * (num / den.max(f32::MIN_POSITIVE))
            .max(f32::MIN_POSITIVE)
            .log10()
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct EqProfile {
    pub enabled: bool,
    pub preset_id: String,
    pub gains_db: Vec<f32>,
}

impl Default for EqProfile {
    fn default() -> Self {
        Self::flat()
    }
}

impl EqProfile {
    pub fn flat() -> Self {
        Self {
            enabled: false,
            preset_id: FLAT_PRESET_ID.to_string(),
            gains_db: vec![0.0; BAND_COUNT],
        }
    }

    pub fn from_preset(preset: &PresetDefinition, enabled: bool) -> Self {
        Self {
            enabled,
            preset_id: preset.id.clone(),
            gains_db: preset.gains.clone(),
        }
        .sanitized(&EqPresets::embedded())
    }

    pub fn sanitized(mut self, presets: &EqPresets) -> Self {
        self.gains_db.truncate(BAND_COUNT);
        self.gains_db.resize(BAND_COUNT, 0.0);
        for gain in &mut self.gains_db {
            *gain = if gain.is_finite() {
                (gain.clamp(-MAX_GAIN_DB, MAX_GAIN_DB) * 10.0).round() / 10.0
            } else {
                0.0
            };
        }
        if self.preset_id != CUSTOM_PRESET_ID {
            match presets.find(&self.preset_id) {
                Some(def) if def.gains == self.gains_db => {}
                _ => self.preset_id = CUSTOM_PRESET_ID.to_string(),
            }
        }
        self
    }

    pub fn is_flat(&self) -> bool {
        self.gains_db.iter().all(|g| g.abs() < NEGLIGIBLE_GAIN_DB)
    }

    pub fn response_db(&self, frequency_hz: f32) -> f32 {
        BAND_FREQUENCIES_HZ
            .iter()
            .zip(self.gains_db.iter())
            .map(|(&freq, &gain)| {
                Biquad::peaking(freq, gain, BAND_Q, SAMPLE_RATE_HZ)
                    .magnitude_db(frequency_hz, SAMPLE_RATE_HZ)
            })
            .sum()
    }

    pub fn peak_response_db(&self) -> f32 {
        let low = 20f32.ln();
        let high = 20_000f32.ln();
        (0..RESPONSE_GRID_POINTS)
            .map(|i| {
                let t = i as f32 / (RESPONSE_GRID_POINTS - 1) as f32;
                self.response_db((low + (high - low) * t).exp())
            })
            .fold(f32::MIN, f32::max)
    }

    pub fn preamp_db(&self) -> f32 {
        let peak = self.peak_response_db();
        if peak > 0.0 {
            -((peak * 10.0).ceil() / 10.0)
        } else {
            0.0
        }
    }

    pub fn active_filters(&self) -> Vec<(f32, f32)> {
        BAND_FREQUENCIES_HZ
            .iter()
            .copied()
            .zip(self.gains_db.iter().copied())
            .filter(|(_, gain)| gain.abs() >= NEGLIGIBLE_GAIN_DB)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn profile_with(gains: [f32; BAND_COUNT]) -> EqProfile {
        EqProfile {
            enabled: true,
            preset_id: CUSTOM_PRESET_ID.to_string(),
            gains_db: gains.to_vec(),
        }
    }

    #[test]
    fn test_embedded_presets_are_well_formed() {
        let presets = EqPresets::embedded();
        assert!(presets.all().len() >= 10);
        for preset in presets.all() {
            assert_eq!(preset.gains.len(), BAND_COUNT, "preset {}", preset.id);
            assert!(preset.gains.iter().all(|g| g.abs() <= MAX_GAIN_DB));
        }
        assert!(presets.find(FLAT_PRESET_ID).is_some());
        let mut ids: Vec<_> = presets.all().iter().map(|p| p.id.clone()).collect();
        ids.sort();
        ids.dedup();
        assert_eq!(ids.len(), presets.all().len());
    }

    #[test]
    fn test_single_band_gain_is_exact_at_center_frequency() {
        let mut gains = [0.0; BAND_COUNT];
        gains[5] = 6.0;
        let response = profile_with(gains).response_db(1000.0);
        assert!((response - 6.0).abs() < 0.05, "response {response}");

        let mut cut = [0.0; BAND_COUNT];
        cut[2] = -9.0;
        let response = profile_with(cut).response_db(125.0);
        assert!((response + 9.0).abs() < 0.05, "response {response}");
    }

    #[test]
    fn test_flat_profile_is_transparent() {
        let flat = EqProfile::flat();
        assert!(flat.is_flat());
        for freq in [20.0, 100.0, 1000.0, 10_000.0, 20_000.0] {
            assert!(flat.response_db(freq).abs() < 0.01);
        }
        assert_eq!(flat.preamp_db(), 0.0);
        assert!(flat.active_filters().is_empty());
    }

    #[test]
    fn test_preamp_prevents_clipping_for_boosted_curves() {
        let presets = EqPresets::embedded();
        for preset in presets.all() {
            let profile = EqProfile::from_preset(preset, true);
            let preamp = profile.preamp_db();
            assert!(preamp <= 0.0);
            assert!(
                profile.peak_response_db() + preamp <= 0.001,
                "preset {} still clips",
                preset.id
            );
        }
        let bass = EqProfile::from_preset(presets.find("bass-boost").unwrap(), true);
        assert!(bass.preamp_db() < -5.0);
    }

    #[test]
    fn test_sanitize_clamps_pads_and_flags_custom() {
        let presets = EqPresets::embedded();
        let dirty = EqProfile {
            enabled: true,
            preset_id: "rock".to_string(),
            gains_db: vec![99.0, f32::NAN, -99.0],
        }
        .sanitized(&presets);
        assert_eq!(dirty.gains_db.len(), BAND_COUNT);
        assert_eq!(dirty.gains_db[0], MAX_GAIN_DB);
        assert_eq!(dirty.gains_db[1], 0.0);
        assert_eq!(dirty.gains_db[2], -MAX_GAIN_DB);
        assert_eq!(dirty.preset_id, CUSTOM_PRESET_ID);

        let unknown = EqProfile {
            enabled: false,
            preset_id: "does-not-exist".to_string(),
            gains_db: vec![0.0; BAND_COUNT],
        }
        .sanitized(&presets);
        assert_eq!(unknown.preset_id, CUSTOM_PRESET_ID);

        let rock = EqProfile::from_preset(presets.find("rock").unwrap(), true);
        assert_eq!(rock.preset_id, "rock");
    }
}

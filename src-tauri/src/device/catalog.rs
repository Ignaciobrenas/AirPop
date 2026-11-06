use crate::aap::ListeningMode;
use crate::device::classify::{guess_from_name, FormFactor};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ListeningControl {
    #[default]
    None,
    Aap,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ColorVariant {
    pub id: String,
    pub label: String,
    pub hex: String,
    #[serde(default)]
    pub accent_hex: Option<String>,
    #[serde(default)]
    pub ble_color_code: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelAssets {
    pub glb: String,
    pub case_closed: String,
    pub case_open: String,
    pub buds: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelDefinition {
    pub id: String,
    pub display_name: String,
    #[serde(default = "default_vendor")]
    pub vendor: String,
    pub kind: String,
    #[serde(default = "default_silhouette")]
    pub silhouette: String,
    pub year: u16,
    #[serde(default)]
    pub generic: bool,
    #[serde(default)]
    pub listening_control: ListeningControl,
    #[serde(default)]
    pub ble_company_ids: Vec<u16>,
    #[serde(default)]
    pub ble_model_ids: Vec<u16>,
    #[serde(default)]
    pub bt_name_patterns: Vec<String>,
    pub colors: Vec<ColorVariant>,
    #[serde(default)]
    pub listening_modes: Vec<ListeningMode>,
    #[serde(default)]
    pub assets: Option<ModelAssets>,
}

fn default_vendor() -> String {
    "GenericPro".to_string()
}

fn default_silhouette() -> String {
    "stem-earbuds".to_string()
}

impl ModelDefinition {
    pub fn is_over_ear(&self) -> bool {
        self.kind == "over-ear"
    }

    pub fn form_factor(&self) -> FormFactor {
        FormFactor::from_catalog_kind(&self.kind)
    }

    pub fn supports_listening_control(&self) -> bool {
        self.listening_control == ListeningControl::Aap && !self.listening_modes.is_empty()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogFile {
    pub models: Vec<ModelDefinition>,
}

#[derive(Debug, Clone)]
pub struct ModelCatalog {
    models: Vec<ModelDefinition>,
}

impl Default for ModelCatalog {
    fn default() -> Self {
        Self::embedded()
    }
}

const SHORT_PATTERN_LEN: usize = 5;

fn pattern_matches(upper_name: &str, pattern: &str) -> bool {
    let pattern = pattern.trim().to_ascii_uppercase();
    if pattern.is_empty() {
        return false;
    }
    if pattern.len() >= SHORT_PATTERN_LEN {
        return upper_name.contains(&pattern);
    }
    upper_name
        .split(|c: char| !c.is_ascii_alphanumeric())
        .any(|token| token == pattern)
}

impl ModelCatalog {
    pub fn embedded() -> Self {
        let raw = include_str!("../../../catalog/models.json");
        Self::from_json_str(raw).unwrap_or(Self { models: Vec::new() })
    }

    pub fn from_json_str(raw: &str) -> Result<Self, serde_json::Error> {
        let parsed: CatalogFile = serde_json::from_str(raw)?;
        Ok(Self {
            models: parsed.models,
        })
    }

    pub fn models(&self) -> &[ModelDefinition] {
        &self.models
    }

    pub fn find_by_id(&self, id: &str) -> Option<&ModelDefinition> {
        self.models.iter().find(|m| m.id == id)
    }

    pub fn find_by_ble_model_id(&self, ble_id: u16) -> Option<&ModelDefinition> {
        self.models
            .iter()
            .find(|m| m.ble_model_ids.contains(&ble_id))
            .or_else(|| self.find_by_id("airpods-pro-3"))
    }

    pub fn find_by_company_and_model(
        &self,
        company_id: u16,
        ble_model_id: u16,
    ) -> Option<&ModelDefinition> {
        self.models
            .iter()
            .find(|m| {
                m.ble_model_ids.contains(&ble_model_id)
                    && (m.ble_company_ids.is_empty() || m.ble_company_ids.contains(&company_id))
            })
            .or_else(|| {
                self.models
                    .iter()
                    .find(|m| m.ble_company_ids.contains(&company_id))
            })
            .or_else(|| self.find_by_ble_model_id(ble_model_id))
    }

    pub fn find_generic(&self, form: FormFactor) -> Option<&ModelDefinition> {
        self.models
            .iter()
            .find(|m| m.generic && m.form_factor() == form)
    }

    pub fn find_by_bt_name(&self, bt_name: &str) -> Option<&ModelDefinition> {
        let upper = bt_name.trim().to_ascii_uppercase();
        if upper.is_empty() {
            return None;
        }
        let guessed_vendor = guess_from_name(bt_name).vendor;

        self.models
            .iter()
            .filter(|m| !m.generic)
            .filter(|m| match guessed_vendor {
                Some(vendor) => m.vendor.eq_ignore_ascii_case(vendor),
                None => true,
            })
            .filter_map(|m| {
                m.bt_name_patterns
                    .iter()
                    .filter(|pattern| pattern_matches(&upper, pattern))
                    .map(|pattern| pattern.trim().len())
                    .max()
                    .map(|score| (score, m))
            })
            .max_by_key(|(score, _)| *score)
            .map(|(_, model)| model)
    }

    pub fn resolve_for_bt_name(
        &self,
        bt_name: &str,
        form_override: Option<FormFactor>,
    ) -> Option<&ModelDefinition> {
        if let Some(model) = self.find_by_bt_name(bt_name) {
            if form_override.is_none_or(|form| form == model.form_factor()) {
                return Some(model);
            }
        }
        let form = form_override.unwrap_or_else(|| guess_from_name(bt_name).form_factor);
        self.find_generic(form)
    }

    pub fn resolve_color_id(&self, model: &ModelDefinition, ble_color: u8) -> String {
        model
            .colors
            .iter()
            .find(|c| c.ble_color_code == Some(ble_color))
            .or_else(|| model.colors.first())
            .map(|c| c.id.clone())
            .unwrap_or_else(|| "white".to_string())
    }

    pub fn is_valid_model_and_color(&self, model_id: &str, color_id: &str) -> bool {
        if let Some(model) = self.find_by_id(model_id) {
            model.colors.iter().any(|c| c.id == color_id)
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multi_brand_and_over_ear_detection() {
        let catalog = ModelCatalog::embedded();

        let xm5 = catalog
            .find_by_bt_name("LE-WH-1000XM5")
            .expect("detects Sony XM5");
        assert_eq!(xm5.id, "sony-wh-1000xm5");
        assert!(xm5.is_over_ear());
        assert_eq!(xm5.silhouette, "over-ear-sculpted");

        let bose = catalog
            .find_by_bt_name("Bose QC Ultra Headphones")
            .expect("detects Bose QC Ultra");
        assert_eq!(bose.id, "bose-qc-ultra-headphones");
        assert!(bose.is_over_ear());

        let wf = catalog
            .find_by_bt_name("WF-1000XM5")
            .expect("detects Sony WF earbuds");
        assert_eq!(wf.id, "sony-wf-1000xm5");
        assert!(!wf.is_over_ear());
        assert_eq!(wf.silhouette, "bud-in-ear");

        let senn = catalog
            .find_by_bt_name("MOMENTUM 4")
            .expect("detects Sennheiser");
        assert_eq!(senn.id, "sennheiser-momentum-4");
        assert!(senn.is_over_ear());
    }

    #[test]
    fn test_catalog_covers_requested_brands_and_wider_model_range() {
        let catalog = ModelCatalog::embedded();
        let expectations = [
            ("WH-1000XM6", "sony-wh-1000xm6"),
            ("WH-1000XM4", "sony-wh-1000xm4"),
            ("WH-1000XM3", "sony-wh-1000xm3"),
            ("WF-1000XM4", "sony-wf-1000xm4"),
            ("Bose QuietComfort 45", "bose-qc45"),
            ("Bose QC35 II", "bose-qc35-ii"),
            ("Bose QuietComfort Ultra Earbuds", "bose-qc-ultra-earbuds"),
            ("Beats Studio Pro", "beats-studio-pro"),
            ("Beats Solo 4", "beats-solo-4"),
            ("Powerbeats Pro 2", "beats-powerbeats-pro-2"),
            ("Beats Studio Buds +", "beats-studio-buds-plus"),
            ("JBL Tune 770NC", "jbl-tune-770nc"),
            ("Galaxy Buds2 Pro", "galaxy-buds2-pro"),
            ("Jabra Elite 85h", "jabra-elite-85h"),
            ("Pixel Buds Pro 2", "pixel-buds-pro-2"),
            ("Nothing Ear (2)", "nothing-ear-2"),
            ("Soundcore Space One", "soundcore-space-one"),
        ];
        for (name, expected) in expectations {
            let found = catalog
                .find_by_bt_name(name)
                .unwrap_or_else(|| panic!("no model for {name}"));
            assert_eq!(found.id, expected, "model for {name}");
        }
    }

    #[test]
    fn test_unknown_devices_resolve_to_generic_models_by_form_factor() {
        let catalog = ModelCatalog::embedded();

        let buds = catalog
            .resolve_for_bt_name("QCY T13 ANC", None)
            .expect("generic earbuds");
        assert!(buds.generic);
        assert_eq!(buds.id, "generic-earbuds");

        let headset = catalog
            .resolve_for_bt_name("Logitech Zone Vibe 125", None)
            .expect("generic headphones");
        assert_eq!(headset.id, "generic-headphones");

        let mystery = catalog
            .resolve_for_bt_name("BT-5000", Some(FormFactor::OverEar))
            .expect("override form factor");
        assert_eq!(mystery.id, "generic-headphones");

        let overridden = catalog
            .resolve_for_bt_name("WH-1000XM5", Some(FormFactor::Earbuds))
            .expect("override beats catalog match");
        assert_eq!(overridden.id, "generic-earbuds");

        assert!(catalog.find_by_bt_name("Maxell BT").is_none());
        assert!(catalog.find_by_bt_name("").is_none());
    }

    #[test]
    fn test_vendor_guard_prevents_cross_brand_matches() {
        let catalog = ModelCatalog::embedded();
        let jbl_max = catalog.find_by_bt_name("JBL Tour One Max");
        assert!(jbl_max.is_none_or(|m| m.vendor == "JBL"));
        let sony_pro = catalog.find_by_bt_name("Sony WH-CH720N Pro 3");
        assert!(sony_pro.is_none_or(|m| m.vendor == "Sony"));
    }

    #[test]
    fn test_only_apple_family_models_expose_listening_control() {
        let catalog = ModelCatalog::embedded();
        let pro3 = catalog.find_by_id("airpods-pro-3").expect("pro 3");
        assert!(pro3.supports_listening_control());
        let xm5 = catalog.find_by_id("sony-wh-1000xm5").expect("xm5");
        assert!(!xm5.supports_listening_control());
        assert!(!xm5.listening_modes.is_empty());
        for generic in catalog.models().iter().filter(|m| m.generic) {
            assert!(!generic.supports_listening_control());
        }
    }

    #[test]
    fn test_catalog_integrity() {
        let catalog = ModelCatalog::embedded();
        assert!(catalog.models().len() >= 30);
        assert!(catalog.find_generic(FormFactor::Earbuds).is_some());
        assert!(catalog.find_generic(FormFactor::OverEar).is_some());
        let mut ids: Vec<_> = catalog.models().iter().map(|m| m.id.clone()).collect();
        ids.sort();
        let before = ids.len();
        ids.dedup();
        assert_eq!(before, ids.len(), "duplicate model ids");
        for model in catalog.models() {
            assert!(!model.colors.is_empty(), "{} has no colors", model.id);
            let mut color_ids: Vec<_> = model.colors.iter().map(|c| c.id.clone()).collect();
            color_ids.sort();
            let n = color_ids.len();
            color_ids.dedup();
            assert_eq!(n, color_ids.len(), "duplicate colors in {}", model.id);
            assert!(
                model.kind == "earbuds" || model.kind == "over-ear",
                "bad kind in {}",
                model.id
            );
            assert!(
                [
                    "stem-earbuds",
                    "bud-in-ear",
                    "over-ear-oval",
                    "over-ear-sculpted"
                ]
                .contains(&model.silhouette.as_str()),
                "bad silhouette in {}",
                model.id
            );
        }
    }

    #[test]
    fn test_allowlist_validation() {
        let catalog = ModelCatalog::embedded();
        assert!(catalog.is_valid_model_and_color("sony-wh-1000xm5", "black"));
        assert!(catalog.is_valid_model_and_color("bose-qc-ultra-headphones", "sandstone"));
        assert!(!catalog.is_valid_model_and_color("unknown-model", "black"));
        assert!(!catalog.is_valid_model_and_color("sony-wh-1000xm5", "../../etc/passwd"));
    }
}

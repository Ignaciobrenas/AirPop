use crate::aap::ListeningMode;
use serde::{Deserialize, Serialize};

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
    pub ble_company_ids: Vec<u16>,
    pub ble_model_ids: Vec<u16>,
    #[serde(default)]
    pub bt_name_patterns: Vec<String>,
    pub colors: Vec<ColorVariant>,
    pub listening_modes: Vec<ListeningMode>,
    pub assets: ModelAssets,
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

    pub fn find_by_bt_name(&self, bt_name: &str) -> Option<&ModelDefinition> {
        let upper = bt_name.trim().to_ascii_uppercase();
        if upper.is_empty() {
            return None;
        }

        if let Some(exact) = self.models.iter().find(|m| {
            m.bt_name_patterns
                .iter()
                .any(|pat| upper.contains(&pat.to_ascii_uppercase()))
        }) {
            return Some(exact);
        }

        if upper.contains("SONY") || upper.contains("WH-") || upper.contains("1000X") {
            if upper.contains("WF-") {
                return self.find_by_id("sony-wf-1000xm5");
            }
            return self.find_by_id("sony-wh-1000xm5");
        }

        if upper.contains("BOSE") || upper.contains("QUIETCOMFORT") || upper.contains("QC") {
            if upper.contains("EARBUD") || upper.contains("BUDS") {
                return self.find_by_id("bose-qc-ultra-earbuds");
            }
            return self.find_by_id("bose-qc-ultra-headphones");
        }

        if upper.contains("SENNHEISER") || upper.contains("MOMENTUM") {
            return self.find_by_id("sennheiser-momentum-4");
        }

        if upper.contains("BEATS") || upper.contains("STUDIO") {
            return self.find_by_id("beats-studio-pro");
        }

        if upper.contains("GALAXY") || upper.contains("BUDS3") {
            return self.find_by_id("galaxy-buds3-pro");
        }

        if upper.contains("MAX")
            || upper.contains("HEADPHONE")
            || upper.contains("DIADEMA")
            || upper.contains("OVER-EAR")
        {
            return self.find_by_id("airpods-max-2");
        }

        None
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
    fn test_allowlist_validation() {
        let catalog = ModelCatalog::embedded();
        assert!(catalog.is_valid_model_and_color("sony-wh-1000xm5", "black"));
        assert!(catalog.is_valid_model_and_color("bose-qc-ultra-headphones", "sandstone"));
        assert!(!catalog.is_valid_model_and_color("unknown-model", "black"));
        assert!(!catalog.is_valid_model_and_color("sony-wh-1000xm5", "../../etc/passwd"));
    }
}

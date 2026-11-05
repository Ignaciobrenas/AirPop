use crate::aap::ListeningMode;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ColorVariant {
    pub id: String,
    pub label: String,
    pub hex: String,
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
    pub kind: String,
    pub year: u16,
    pub ble_model_ids: Vec<u16>,
    pub colors: Vec<ColorVariant>,
    pub listening_modes: Vec<ListeningMode>,
    pub assets: ModelAssets,
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

    pub fn resolve_color_id(&self, model: &ModelDefinition, ble_color: u8) -> String {
        model
            .colors
            .iter()
            .find(|c| c.ble_color_code == Some(ble_color))
            .or_else(|| model.colors.first())
            .map(|c| c.id.clone())
            .unwrap_or_else(|| "white".to_string())
    }
}

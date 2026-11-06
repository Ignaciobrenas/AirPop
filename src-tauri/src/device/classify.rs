use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum FormFactor {
    Earbuds,
    OverEar,
}

impl FormFactor {
    pub fn catalog_kind(self) -> &'static str {
        match self {
            FormFactor::Earbuds => "earbuds",
            FormFactor::OverEar => "over-ear",
        }
    }

    pub fn from_catalog_kind(kind: &str) -> Self {
        if kind == "over-ear" {
            FormFactor::OverEar
        } else {
            FormFactor::Earbuds
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct DeviceGuess {
    pub vendor: Option<&'static str>,
    pub form_factor: FormFactor,
    pub form_factor_known: bool,
}

const VENDORS: &[(&str, &[&str])] = &[
    (
        "Sony",
        &[
            "SONY", "WH-", "WF-", "WI-", "LINKBUDS", "INZONE", "ULT WEAR", "MDR-",
        ],
    ),
    (
        "Bose",
        &[
            "BOSE",
            "QUIETCOMFORT",
            "QC ULTRA",
            "NC 700",
            "NC700",
            "QC35",
            "QC45",
        ],
    ),
    (
        "Beats",
        &[
            "BEATS",
            "POWERBEATS",
            "STUDIO BUDS",
            "BEATS FIT",
            "SOLO 4",
            "SOLO3",
        ],
    ),
    ("JBL", &["JBL", "HARMAN", "AKG"]),
    (
        "Sennheiser",
        &[
            "SENNHEISER",
            "MOMENTUM",
            "ACCENTUM",
            "HD 450",
            "HD 350",
            "CX PLUS",
        ],
    ),
    ("Samsung", &["GALAXY", "SAMSUNG"]),
    ("Jabra", &["JABRA", "ELITE 85", "ELITE 10", "EVOLVE"]),
    (
        "Soundcore",
        &[
            "SOUNDCORE",
            "ANKER",
            "LIBERTY",
            "SPACE ONE",
            "LIFE Q",
            "LIFE P",
        ],
    ),
    ("Bang & Olufsen", &["BEOPLAY", "BANG", "B&O", "BEOCOM"]),
    ("Bowers & Wilkins", &["BOWERS", "PX7", "PX8", "PI7", "PI5"]),
    ("Marshall", &["MARSHALL", "MAJOR", "MOTIF"]),
    (
        "Skullcandy",
        &["SKULLCANDY", "CRUSHER", "HESH", "INDY", "SESH"],
    ),
    (
        "Audio-Technica",
        &["AUDIO-TECHNICA", "AUDIO TECHNICA", "ATH-"],
    ),
    ("Nothing", &["NOTHING", "CMF"]),
    ("OnePlus", &["ONEPLUS", "NORD BUDS"]),
    ("Xiaomi", &["XIAOMI", "REDMI", "MI TRUE"]),
    ("Huawei", &["HUAWEI", "FREEBUDS", "FREECLIP", "HONOR"]),
    ("Google", &["PIXEL BUDS"]),
    ("Logitech", &["LOGITECH", "ASTRO"]),
    ("Razer", &["RAZER", "BARRACUDA", "KRAKEN", "HAMMERHEAD"]),
    ("HyperX", &["HYPERX"]),
    ("SteelSeries", &["STEELSERIES", "ARCTIS"]),
    ("Corsair", &["CORSAIR", "VIRTUOSO"]),
    ("Poly", &["PLANTRONICS", "POLY ", "VOYAGER", "BACKBEAT"]),
    ("Shure", &["SHURE", "AONIC"]),
    ("Technics", &["TECHNICS", "EAH-"]),
    ("Panasonic", &["PANASONIC", "RZ-"]),
    ("Philips", &["PHILIPS"]),
    ("Edifier", &["EDIFIER"]),
    ("Realme", &["REALME"]),
    ("Oppo", &["OPPO", "ENCO"]),
    ("QCY", &["QCY"]),
    ("Soundpeats", &["SOUNDPEATS"]),
    ("1MORE", &["1MORE"]),
    ("JLab", &["JLAB"]),
    ("Baseus", &["BASEUS"]),
    ("Tribit", &["TRIBIT"]),
    ("Urbanista", &["URBANISTA"]),
    ("Fiio", &["FIIO"]),
    ("Master & Dynamic", &["MASTER & DYNAMIC"]),
    ("Motorola", &["MOTO BUDS", "MOTOROLA"]),
    ("Lenovo", &["LENOVO", "THINKPLUS"]),
    ("Asus", &["ROG "]),
];

const EARBUDS_TOKENS: &[&str] = &[
    "BUDS",
    "EARBUD",
    "EARPHONE",
    "WF-",
    "WI-",
    "LINKBUDS",
    "AIRDOTS",
    "PODS",
    "TWS",
    "TRUE WIRELESS",
    "IN-EAR",
    "IN EAR",
    "EAR (",
    "EAR(",
    "LIBERTY",
    "FREEBUDS",
    "FREECLIP",
    "POWERBEATS",
    "FIT PRO",
    "ELITE 3",
    "ELITE 4",
    "ELITE 5",
    "ELITE 7",
    "ELITE 10",
    "ENCO",
    "PI7",
    "PI5",
    "SHOKZ",
    "INDY",
    "SESH",
    "EAH-AZ",
    "MTW",
    "NECKBAND",
    "BEATS FLEX",
];

const OVER_EAR_TOKENS: &[&str] = &[
    "HEADPHONE",
    "HEADSET",
    "OVER-EAR",
    "OVER EAR",
    "ON-EAR",
    "ON EAR",
    "DIADEMA",
    "CASCO",
    "WH-",
    "MDR-",
    "STUDIO",
    "MAX",
    "MOMENTUM",
    "ACCENTUM",
    "QUIETCOMFORT",
    "QC35",
    "QC45",
    "NC 700",
    "NC700",
    "ARCTIS",
    "KRAKEN",
    "CLOUD",
    "BARRACUDA",
    "BACKBEAT",
    "ATH-M",
    "PX7",
    "PX8",
    "ELITE 85",
    "EVOLVE",
    "TUNE 5",
    "TUNE 6",
    "TUNE 7",
    "LIVE 6",
    "LIVE 4",
    "MAJOR",
    "HESH",
    "CRUSHER",
    "SOLO",
    "ZONE",
    "ASTRO",
    "VIRTUOSO",
    "INZONE H",
    "HD 4",
    "HD 3",
    "SPACE ONE",
    "LIFE Q",
    "MH-",
];

pub fn guess_from_name(name: &str) -> DeviceGuess {
    let upper = format!(" {} ", name.trim().to_ascii_uppercase());

    let vendor = VENDORS
        .iter()
        .find(|(_, tokens)| tokens.iter().any(|token| upper.contains(token)))
        .map(|(vendor, _)| *vendor);

    let earbuds = EARBUDS_TOKENS.iter().any(|token| upper.contains(token));
    let over_ear = OVER_EAR_TOKENS.iter().any(|token| upper.contains(token));

    let (form_factor, form_factor_known) = if earbuds {
        (FormFactor::Earbuds, true)
    } else if over_ear {
        (FormFactor::OverEar, true)
    } else {
        (FormFactor::Earbuds, false)
    };

    DeviceGuess {
        vendor,
        form_factor,
        form_factor_known,
    }
}

pub fn is_audio_class_of_device(raw_cod: u32) -> bool {
    let major = (raw_cod >> 8) & 0x1F;
    let minor = (raw_cod >> 2) & 0x3F;
    major == 0x04 && matches!(minor, 0 | 1 | 2 | 6 | 7)
}

pub fn slugify(name: &str) -> String {
    let mut slug = String::new();
    let mut last_dash = true;
    for c in name.trim().chars() {
        if c.is_ascii_alphanumeric() {
            slug.push(c.to_ascii_lowercase());
            last_dash = false;
        } else if !last_dash {
            slug.push('-');
            last_dash = true;
        }
    }
    while slug.ends_with('-') {
        slug.pop();
    }
    slug.chars().take(48).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_known_brands_are_identified() {
        let cases = [
            ("WH-1000XM5", "Sony", FormFactor::OverEar),
            ("LE_WF-1000XM4", "Sony", FormFactor::Earbuds),
            (
                "Bose QuietComfort Ultra Headphones",
                "Bose",
                FormFactor::OverEar,
            ),
            ("Bose QC Ultra Earbuds", "Bose", FormFactor::Earbuds),
            ("Beats Studio Pro", "Beats", FormFactor::OverEar),
            ("Powerbeats Pro", "Beats", FormFactor::Earbuds),
            ("Beats Studio Buds +", "Beats", FormFactor::Earbuds),
            ("JBL Tune 770NC", "JBL", FormFactor::OverEar),
            ("JBL Tune Buds", "JBL", FormFactor::Earbuds),
            ("Galaxy Buds2 Pro", "Samsung", FormFactor::Earbuds),
            ("Jabra Elite 85h", "Jabra", FormFactor::OverEar),
            ("Jabra Elite 7 Pro", "Jabra", FormFactor::Earbuds),
            ("Soundcore Space One", "Soundcore", FormFactor::OverEar),
            ("Soundcore Liberty 4 NC", "Soundcore", FormFactor::Earbuds),
            ("HyperX Cloud II Wireless", "HyperX", FormFactor::OverEar),
            ("Nothing Ear (2)", "Nothing", FormFactor::Earbuds),
            ("Marshall Major V", "Marshall", FormFactor::OverEar),
            ("Pixel Buds Pro", "Google", FormFactor::Earbuds),
            ("Sennheiser MOMENTUM 4", "Sennheiser", FormFactor::OverEar),
            (
                "Sennheiser Momentum True Wireless 4",
                "Sennheiser",
                FormFactor::Earbuds,
            ),
        ];
        for (name, vendor, form) in cases {
            let guess = guess_from_name(name);
            assert_eq!(guess.vendor, Some(vendor), "vendor for {name}");
            assert_eq!(guess.form_factor, form, "form factor for {name}");
            assert!(guess.form_factor_known, "known for {name}");
        }
    }

    #[test]
    fn test_unknown_names_fall_back_without_claiming_certainty() {
        let guess = guess_from_name("BT-5000");
        assert_eq!(guess.vendor, None);
        assert!(!guess.form_factor_known);
        assert_eq!(guess.form_factor, FormFactor::Earbuds);

        let generic = guess_from_name("Bluetooth Headset");
        assert_eq!(generic.form_factor, FormFactor::OverEar);
        assert!(generic.form_factor_known);
    }

    #[test]
    fn test_audio_class_of_device_filters_non_audio_peripherals() {
        assert!(is_audio_class_of_device(0x240404));
        assert!(is_audio_class_of_device(0x240418));
        assert!(is_audio_class_of_device(0x200404));
        assert!(!is_audio_class_of_device(0x240414));
        assert!(!is_audio_class_of_device(0x000540));
        assert!(!is_audio_class_of_device(0x5A020C));
        assert!(!is_audio_class_of_device(0x002580));
    }

    #[test]
    fn test_slugify_is_stable_and_bounded() {
        assert_eq!(slugify("  WH-1000XM5 (Ignacio)  "), "wh-1000xm5-ignacio");
        assert_eq!(slugify("¡¡¡"), "");
        assert!(slugify(&"a".repeat(200)).len() <= 48);
    }
}

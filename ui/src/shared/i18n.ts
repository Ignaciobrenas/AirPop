export type SupportedLanguage = "es" | "en" | "pt" | "fr" | "de";

export interface TranslationDictionary {
  appName: string;
  tabs: {
    device: string;
    equalizer: string;
    settings: string;
  };
  status: {
    connected: string;
    standby: string;
    caseOpen: string;
    charging: string;
    batteryLow: string;
  };
  formFactor: {
    inEar: string;
    overEar: string;
    earbuds: string;
    headband: string;
    switchToInEar: string;
    switchToOverEar: string;
  };
  battery: {
    left: string;
    right: string;
    case: string;
    headband: string;
    level: string;
  };
  modes: {
    noiseCancellation: string;
    transparency: string;
    adaptive: string;
    off: string;
    noiseCancellationDesc: string;
    transparencyDesc: string;
    adaptiveDesc: string;
    offDesc: string;
  };
  equalizer: {
    title: string;
    subtitle: string;
    enabled: string;
    disabled: string;
    reset: string;
    curveTitle: string;
    preamp: string;
    headroom: string;
    apoLinked: string;
    apoNotInstalled: string;
    apoSync: string;
    apoSyncSuccess: string;
    custom: string;
    presets: {
      plano: string;
      graves_plus: string;
      graves_minus: string;
      agudos_plus: string;
      voces: string;
      podcast: string;
      rock: string;
      pop: string;
      hiphop: string;
      electronica: string;
      jazz: string;
      clasica: string;
      acustica: string;
      loudness: string;
      gaming: string;
      nocturno: string;
    };
  };
  settings: {
    title: string;
    language: string;
    doNotDisturb: string;
    doNotDisturbDesc: string;
    lowPowerMode: string;
    lowPowerModeDesc: string;
    autostart: string;
    autostartDesc: string;
    soundEnabled: string;
    popupEnabled: string;
    preferredMonitor: string;
    allMonitors: string;
    simulateTest: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  es: {
    appName: "AirPop",
    tabs: {
      device: "Dispositivo",
      equalizer: "Ecualizador",
      settings: "Ajustes",
    },
    status: {
      connected: "Conectado",
      standby: "En espera",
      caseOpen: "Caja abierta",
      charging: "Cargando",
      batteryLow: "Batería baja",
    },
    formFactor: {
      inEar: "In-Ear",
      overEar: "Diadema · Over-Ear",
      earbuds: "Auriculares In-Ear",
      headband: "Cascos de diadema",
      switchToInEar: "Cambiar a In-Ear",
      switchToOverEar: "Cambiar a Diadema",
    },
    battery: {
      left: "Izquierdo",
      right: "Derecho",
      case: "Caja",
      headband: "Diadema",
      level: "Nivel",
    },
    modes: {
      noiseCancellation: "Cancelación de ruido",
      transparency: "Ambiente",
      adaptive: "Adaptativo",
      off: "Desactivado",
      noiseCancellationDesc: "Aísla el ruido exterior",
      transparencyDesc: "Deja pasar el sonido ambiental",
      adaptiveDesc: "Ajuste dinámico según el entorno",
      offDesc: "Sin procesamiento de audio",
    },
    equalizer: {
      title: "Ecualizador gráfico",
      subtitle: "10 bandas ISO · Control de picos y curvas",
      enabled: "Ecualizador activo",
      disabled: "Ecualizador apagado",
      reset: "Restablecer plano",
      curveTitle: "Curva de respuesta en frecuencia",
      preamp: "Preamplificador",
      headroom: "Margen anti-clipping",
      apoLinked: "Sincronizado con Equalizer APO",
      apoNotInstalled: "Equalizer APO no detectado",
      apoSync: "Sincronizar APO",
      apoSyncSuccess: "Filtros aplicados a Windows",
      custom: "Personalizado",
      presets: {
        plano: "Plano",
        graves_plus: "Graves +",
        graves_minus: "Graves −",
        agudos_plus: "Agudos +",
        voces: "Voces",
        podcast: "Podcast",
        rock: "Rock",
        pop: "Pop",
        hiphop: "Hip-hop",
        electronica: "Electrónica",
        jazz: "Jazz",
        clasica: "Clásica",
        acustica: "Acústica",
        loudness: "Loudness",
        gaming: "Gaming",
        nocturno: "Nocturno",
      },
    },
    settings: {
      title: "Preferencias de la aplicación",
      language: "Idioma",
      doNotDisturb: "No molestar",
      doNotDisturbDesc: "Oculta el popup si hay apps a pantalla completa",
      lowPowerMode: "Modo bajo consumo",
      lowPowerModeDesc: "Reduce la tasa de refresco 3D en batería",
      autostart: "Arranque con Windows",
      autostartDesc: "Inicia AirPop automáticamente al encender el PC",
      soundEnabled: "Efectos de sonido",
      popupEnabled: "Mostrar popup de proximidad",
      preferredMonitor: "Monitor preferido",
      allMonitors: "Principal predeterminado",
      simulateTest: "Probar animación popup",
    },
  },

  en: {
    appName: "AirPop",
    tabs: {
      device: "Device",
      equalizer: "Equalizer",
      settings: "Settings",
    },
    status: {
      connected: "Connected",
      standby: "Standby",
      caseOpen: "Case open",
      charging: "Charging",
      batteryLow: "Battery low",
    },
    formFactor: {
      inEar: "In-Ear",
      overEar: "Over-Ear · Headband",
      earbuds: "In-Ear Earbuds",
      headband: "Over-Ear Headphones",
      switchToInEar: "Switch to In-Ear",
      switchToOverEar: "Switch to Over-Ear",
    },
    battery: {
      left: "Left",
      right: "Right",
      case: "Case",
      headband: "Headband",
      level: "Level",
    },
    modes: {
      noiseCancellation: "Noise Cancellation",
      transparency: "Transparency",
      adaptive: "Adaptive",
      off: "Off",
      noiseCancellationDesc: "Blocks external ambient noise",
      transparencyDesc: "Allows natural ambient sound in",
      adaptiveDesc: "Dynamically adapts to surroundings",
      offDesc: "Audio processing turned off",
    },
    equalizer: {
      title: "Graphic Equalizer",
      subtitle: "10 ISO octave bands · Peaking filter control",
      enabled: "Equalizer active",
      disabled: "Equalizer off",
      reset: "Reset flat",
      curveTitle: "Frequency response curve",
      preamp: "Preamplifier",
      headroom: "Anti-clipping headroom",
      apoLinked: "Synced with Equalizer APO",
      apoNotInstalled: "Equalizer APO not detected",
      apoSync: "Sync APO",
      apoSyncSuccess: "Filters applied to Windows audio",
      custom: "Custom",
      presets: {
        plano: "Flat",
        graves_plus: "Bass Boost",
        graves_minus: "Bass Reduce",
        agudos_plus: "Treble Boost",
        voces: "Vocal Clarity",
        podcast: "Podcast",
        rock: "Rock",
        pop: "Pop",
        hiphop: "Hip-Hop",
        electronica: "Electronic",
        jazz: "Jazz",
        clasica: "Classical",
        acustica: "Acoustic",
        loudness: "Loudness",
        gaming: "Gaming",
        nocturno: "Night Mode",
      },
    },
    settings: {
      title: "Application Preferences",
      language: "Language",
      doNotDisturb: "Do Not Disturb",
      doNotDisturbDesc: "Mutes popups when fullscreen games or apps run",
      lowPowerMode: "Low Power Mode",
      lowPowerModeDesc: "Lowers 3D rendering rate when on battery",
      autostart: "Start with Windows",
      autostartDesc: "Launch AirPop automatically on system startup",
      soundEnabled: "Sound effects",
      popupEnabled: "Show proximity popup",
      preferredMonitor: "Preferred monitor",
      allMonitors: "Primary default",
      simulateTest: "Test popup animation",
    },
  },

  pt: {
    appName: "AirPop",
    tabs: {
      device: "Dispositivo",
      equalizer: "Equalizador",
      settings: "Definições",
    },
    status: {
      connected: "Conectado",
      standby: "Em espera",
      caseOpen: "Estojo aberto",
      charging: "A carregar",
      batteryLow: "Bateria fraca",
    },
    formFactor: {
      inEar: "Intra-auricular",
      overEar: "Auscultadores · Diadema",
      earbuds: "Auriculares In-Ear",
      headband: "Auscultadores de diadema",
      switchToInEar: "Mudar para In-Ear",
      switchToOverEar: "Mudar para Diadema",
    },
    battery: {
      left: "Esquerdo",
      right: "Direito",
      case: "Estojo",
      headband: "Diadema",
      level: "Nível",
    },
    modes: {
      noiseCancellation: "Cancelamento de ruído",
      transparency: "Ambiente",
      adaptive: "Adaptativo",
      off: "Desativado",
      noiseCancellationDesc: "Bloqueia o ruído exterior",
      transparencyDesc: "Permite ouvir o som ambiente",
      adaptiveDesc: "Ajuste dinâmico consoante o ambiente",
      offDesc: "Sem processamento de áudio",
    },
    equalizer: {
      title: "Equalizador gráfico",
      subtitle: "10 bandas ISO · Controlo de curvas e picos",
      enabled: "Equalizador ativo",
      disabled: "Equalizador desativado",
      reset: "Repor plano",
      curveTitle: "Curva de resposta de frequência",
      preamp: "Pré-amplificador",
      headroom: "Margem anti-saturação",
      apoLinked: "Sincronizado com Equalizer APO",
      apoNotInstalled: "Equalizer APO não detetado",
      apoSync: "Sincronizar APO",
      apoSyncSuccess: "Filtros aplicados ao Windows",
      custom: "Personalizado",
      presets: {
        plano: "Plano",
        graves_plus: "Graves +",
        graves_minus: "Graves −",
        agudos_plus: "Agudos +",
        voces: "Vozes",
        podcast: "Podcast",
        rock: "Rock",
        pop: "Pop",
        hiphop: "Hip-hop",
        electronica: "Eletrónica",
        jazz: "Jazz",
        clasica: "Clássica",
        acustica: "Acústica",
        loudness: "Loudness",
        gaming: "Gaming",
        nocturno: "Nocturno",
      },
    },
    settings: {
      title: "Preferências da aplicação",
      language: "Idioma",
      doNotDisturb: "Não incomodar",
      doNotDisturbDesc: "Oculta popups quando jogos em ecrã inteiro correm",
      lowPowerMode: "Modo poupança de energia",
      lowPowerModeDesc: "Reduz a taxa 3D quando em bateria",
      autostart: "Arrancar com o Windows",
      autostartDesc: "Inicia o AirPop automaticamente ao ligar o PC",
      soundEnabled: "Efeitos sonoros",
      popupEnabled: "Mostrar popup de proximidade",
      preferredMonitor: "Monitor preferido",
      allMonitors: "Principal predefinido",
      simulateTest: "Testar animação popup",
    },
  },

  fr: {
    appName: "AirPop",
    tabs: {
      device: "Appareil",
      equalizer: "Égaliseur",
      settings: "Réglages",
    },
    status: {
      connected: "Connecté",
      standby: "En attente",
      caseOpen: "Boîtier ouvert",
      charging: "En charge",
      batteryLow: "Batterie faible",
    },
    formFactor: {
      inEar: "Intra-auriculaire",
      overEar: "Casque arceau",
      earbuds: "Écouteurs sans fil",
      headband: "Casque audio",
      switchToInEar: "Passer en Intra",
      switchToOverEar: "Passer en Casque",
    },
    battery: {
      left: "Gauche",
      right: "Droit",
      case: "Boîtier",
      headband: "Casque",
      level: "Niveau",
    },
    modes: {
      noiseCancellation: "Réduction du bruit",
      transparency: "Transparence",
      adaptive: "Adaptatif",
      off: "Désactivé",
      noiseCancellationDesc: "Isole des bruits extérieurs",
      transparencyDesc: "Laisse passer les bruits ambiants",
      adaptiveDesc: "Ajustement automatique au milieu",
      offDesc: "Traitement audio inactif",
    },
    equalizer: {
      title: "Égaliseur graphique",
      subtitle: "10 bandes ISO · Filtres biquad de précision",
      enabled: "Égaliseur activé",
      disabled: "Égaliseur désactivé",
      reset: "Réinitialiser plat",
      curveTitle: "Courbe de réponse en fréquence",
      preamp: "Préamplificateur",
      headroom: "Marge anti-saturation",
      apoLinked: "Synchronisé avec Equalizer APO",
      apoNotInstalled: "Equalizer APO introuvable",
      apoSync: "Synchroniser APO",
      apoSyncSuccess: "Filtres appliqués au système",
      custom: "Personnalisé",
      presets: {
        plano: "Plat",
        graves_plus: "Basses +",
        graves_minus: "Basses −",
        agudos_plus: "Aigus +",
        voces: "Voix claire",
        podcast: "Podcast",
        rock: "Rock",
        pop: "Pop",
        hiphop: "Hip-hop",
        electronica: "Électro",
        jazz: "Jazz",
        clasica: "Classique",
        acustica: "Acoustique",
        loudness: "Loudness",
        gaming: "Gaming",
        nocturno: "Nuit",
      },
    },
    settings: {
      title: "Préférences système",
      language: "Langue",
      doNotDisturb: "Ne pas déranger",
      doNotDisturbDesc: "Masque le popup en mode plein écran",
      lowPowerMode: "Économie d'énergie",
      lowPowerModeDesc: "Diminue le taux de rafraîchissement 3D",
      autostart: "Démarrage automatique",
      autostartDesc: "Lancer AirPop au démarrage de Windows",
      soundEnabled: "Effets sonores",
      popupEnabled: "Afficher le popup de proximité",
      preferredMonitor: "Écran favori",
      allMonitors: "Écran principal",
      simulateTest: "Tester l'animation",
    },
  },

  de: {
    appName: "AirPop",
    tabs: {
      device: "Gerät",
      equalizer: "Equalizer",
      settings: "Einstellungen",
    },
    status: {
      connected: "Verbunden",
      standby: "Bereit",
      caseOpen: "Ladecase offen",
      charging: "Wird geladen",
      batteryLow: "Akku schwach",
    },
    formFactor: {
      inEar: "In-Ear",
      overEar: "Over-Ear · Bügel",
      earbuds: "In-Ear Kopfhörer",
      headband: "Bügelkopfhörer",
      switchToInEar: "Zu In-Ear wechseln",
      switchToOverEar: "Zu Over-Ear wechseln",
    },
    battery: {
      left: "Links",
      right: "Rechts",
      case: "Case",
      headband: "Kopfhörer",
      level: "Ladestand",
    },
    modes: {
      noiseCancellation: "Geräuschunterdrückung",
      transparency: "Transparenz",
      adaptive: "Adaptiv",
      off: "Aus",
      noiseCancellationDesc: "Schirmt Außengeräusche ab",
      transparencyDesc: "Lässt Umgebungsgeräusche durch",
      adaptiveDesc: "Dynamische Anpassung an die Umgebung",
      offDesc: "Keine Audioverarbeitung",
    },
    equalizer: {
      title: "Grafischer Equalizer",
      subtitle: "10 ISO-Oktavbänder · Biquad-Filterkurven",
      enabled: "Equalizer aktiv",
      disabled: "Equalizer ausgeschaltet",
      reset: "Auf Flat zurücksetzen",
      curveTitle: "Frequenzgangkurve",
      preamp: "Vorverstärker",
      headroom: "Clipping-Schutzreserve",
      apoLinked: "Mit Equalizer APO synchronisiert",
      apoNotInstalled: "Equalizer APO nicht installiert",
      apoSync: "APO synchronisieren",
      apoSyncSuccess: "Filter auf Windows-Audio angewendet",
      custom: "Benutzerdefiniert",
      presets: {
        plano: "Neutral",
        graves_plus: "Bass Boost",
        graves_minus: "Bass Cut",
        agudos_plus: "Höhen Boost",
        voces: "Stimmklarheit",
        podcast: "Podcast",
        rock: "Rock",
        pop: "Pop",
        hiphop: "Hip-Hop",
        electronica: "Elektronisch",
        jazz: "Jazz",
        clasica: "Klassik",
        acustica: "Akustik",
        loudness: "Loudness",
        gaming: "Gaming",
        nocturno: "Nachtmodus",
      },
    },
    settings: {
      title: "Anwendungseinstellungen",
      language: "Sprache",
      doNotDisturb: "Nicht stören",
      doNotDisturbDesc: "Popup im Vollbildmodus unterdrücken",
      lowPowerMode: "Energiesparmodus",
      lowPowerModeDesc: "Reduziert die 3D-Bildrate im Akkubetrieb",
      autostart: "Mit Windows starten",
      autostartDesc: "AirPop beim Systemstart automatisch starten",
      soundEnabled: "Soundeffekte",
      popupEnabled: "Näherungs-Popup anzeigen",
      preferredMonitor: "Bevorzugter Monitor",
      allMonitors: "Standard-Hauptmonitor",
      simulateTest: "Popup-Animation testen",
    },
  },
};

export function detectSystemLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined" || !navigator.language) {
    return "es";
  }
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("pt")) return "pt";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("de")) return "de";
  return "es";
}

export function getTranslation(lang: SupportedLanguage): TranslationDictionary {
  return translations[lang] ?? translations.es;
}

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
    soundEnabledDesc: string;
    popupEnabled: string;
    preferredMonitor: string;
    allMonitors: string;
    simulateTest: string;
    about: string;
    version: string;
    privacyLocal: string;
    privacyLocalDesc: string;
    termsAccepted: string;
    viewTerms: string;
    closeTerms: string;
    uninstallApp: string;
    uninstallConfirm: string;
    uninstallDesc: string;
    testPopup: string;
  };
  installer: {
    title: string;
    subtitle: string;
    tagline: string;
    localGuarantee: string;
    noTelemetry: string;
    universalBt: string;
    apoSupport: string;
    eulaTitle: string;
    acceptCheckbox: string;
    optionsTitle: string;
    autostart: string;
    desktopShortcut: string;
    startMenuShortcut: string;
    installButton: string;
    installing: string;
    successTitle: string;
    successMessage: string;
    launchNow: string;
    close: string;
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
      inEar: "In-Ear (Intraurales)",
      overEar: "Over-Ear (Diadema)",
      earbuds: "Auriculares",
      headband: "Diadema",
      switchToInEar: "Cambiar a In-Ear",
      switchToOverEar: "Cambiar a Diadema",
    },
    battery: {
      left: "Izquierdo",
      right: "Derecho",
      case: "Estuche",
      headband: "Diadema",
      level: "Nivel de batería",
    },
    modes: {
      noiseCancellation: "Cancelación de ruido",
      transparency: "Ambiente (Transparencia)",
      adaptive: "Audio adaptativo",
      off: "Desactivado",
      noiseCancellationDesc: "Aísla el ruido ambiental exterior",
      transparencyDesc: "Permite escuchar el entorno con naturalidad",
      adaptiveDesc: "Ajusta la cancelación según el ruido circundante",
      offDesc: "Sin procesamiento de cancelación de audio",
    },
    equalizer: {
      title: "Ecualizador Gráfico",
      subtitle: "10 bandas ISO de octava · Curvas biquad paramétricas",
      enabled: "Ecualizador activo",
      disabled: "Ecualizador desactivado",
      reset: "Restablecer a Plano",
      curveTitle: "Curva de respuesta en frecuencia",
      preamp: "Preamplificador",
      headroom: "Margen de seguridad contra distorsión",
      apoLinked: "Sincronizado con Equalizer APO",
      apoNotInstalled: "Equalizer APO no detectado",
      apoSync: "Sincronizar APO",
      apoSyncSuccess: "Filtros aplicados al audio de Windows",
      custom: "Personalizado",
      presets: {
        plano: "Plano (Neutro)",
        graves_plus: "Realce de graves",
        graves_minus: "Atenuación de graves",
        agudos_plus: "Claridad de agudos",
        voces: "Realce vocal",
        podcast: "Podcast y Diálogo",
        rock: "Rock & Guitarras",
        pop: "Pop Moderno",
        hiphop: "Hip-Hop & R&B",
        electronica: "Electrónica & Club",
        jazz: "Jazz Acústico",
        clasica: "Música Clásica",
        acustica: "Instrumental Acústico",
        loudness: "Sonoridad Dinámica",
        gaming: "Inmersión Gaming",
        nocturno: "Modo Nocturno",
      },
    },
    settings: {
      title: "Configuración del Sistema",
      language: "Idioma",
      doNotDisturb: "Modo No Molestar",
      doNotDisturbDesc: "Oculta el popup si hay un juego o app a pantalla completa",
      lowPowerMode: "Modo Bajo Consumo",
      lowPowerModeDesc: "Reduce la tasa de frames 3D al funcionar con batería",
      autostart: "Iniciar con Windows",
      autostartDesc: "Ejecutar AirPop silenciosamente en la bandeja al encender",
      soundEnabled: "Efectos de sonido",
      soundEnabledDesc: "Reproducir tono armónico al conectar o abrir la caja",
      popupEnabled: "Mostrar popup de proximidad",
      preferredMonitor: "Monitor preferido",
      allMonitors: "Monitor principal predeterminado",
      simulateTest: "Probar animación 3D",
      about: "Acerca de AirPop",
      version: "Versión 1.2.0",
      privacyLocal: "100% Local y Privado",
      privacyLocalDesc: "Cero telemetría, sin llamadas a internet y procesamiento exclusivamente en su equipo.",
      termsAccepted: "Términos y condiciones aceptados",
      viewTerms: "Ver Términos y Condiciones",
      closeTerms: "Cerrar",
      uninstallApp: "Desinstalar AirPop",
      uninstallConfirm: "¿Está seguro de que desea desinstalar AirPop por completo?",
      uninstallDesc: "Se eliminarán los archivos y entradas de registro del sistema.",
      testPopup: "Mostrar Popup 3D",
    },
    installer: {
      title: "Instalador de AirPop",
      subtitle: "Experiencia 3D y control para auriculares Bluetooth",
      tagline: "Diseñado para Windows 11 · 100% Local · Cero Telemetría",
      localGuarantee: "Privacidad 100% local sin conexiones externas",
      noTelemetry: "Cero telemetría ni recopilación de datos",
      universalBt: "Compatibilidad con auriculares universales",
      apoSupport: "Integración nativa con Equalizer APO",
      eulaTitle: "Términos y Condiciones de Uso (EULA)",
      acceptCheckbox: "He leído y acepto los Términos y Condiciones de Uso",
      optionsTitle: "Opciones de Instalación",
      autostart: "Iniciar AirPop automáticamente con Windows",
      desktopShortcut: "Crear acceso directo en el Escritorio",
      startMenuShortcut: "Crear acceso directo en el Menú Inicio",
      installButton: "Instalar AirPop",
      installing: "Instalando AirPop...",
      successTitle: "¡Instalación Completada!",
      successMessage: "AirPop se ha instalado correctamente y está listo para usarse.",
      launchNow: "Iniciar AirPop Ahora",
      close: "Cerrar",
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
      inEar: "In-Ear Earbuds",
      overEar: "Over-Ear Headphones",
      earbuds: "Earbuds",
      headband: "Headphones",
      switchToInEar: "Switch to In-Ear",
      switchToOverEar: "Switch to Over-Ear",
    },
    battery: {
      left: "Left",
      right: "Right",
      case: "Case",
      headband: "Headphones",
      level: "Battery Level",
    },
    modes: {
      noiseCancellation: "Noise Cancellation",
      transparency: "Transparency",
      adaptive: "Adaptive Audio",
      off: "Off",
      noiseCancellationDesc: "Blocks ambient outside noise",
      transparencyDesc: "Naturally allows ambient sound through",
      adaptiveDesc: "Dynamically adjusts cancellation to your environment",
      offDesc: "Standard audio without noise processing",
    },
    equalizer: {
      title: "Graphic Equalizer",
      subtitle: "10 ISO octave bands · Parametric biquad response curves",
      enabled: "Equalizer enabled",
      disabled: "Equalizer bypassed",
      reset: "Reset to Flat",
      curveTitle: "Frequency response curve",
      preamp: "Preamp Gain",
      headroom: "Clipping protection headroom",
      apoLinked: "Synchronized with Equalizer APO",
      apoNotInstalled: "Equalizer APO not detected",
      apoSync: "Sync to APO",
      apoSyncSuccess: "Filters applied to Windows audio stream",
      custom: "Custom",
      presets: {
        plano: "Flat (Neutral)",
        graves_plus: "Bass Boost",
        graves_minus: "Bass Cut",
        agudos_plus: "Treble Boost",
        voces: "Vocal Clarity",
        podcast: "Podcast & Speech",
        rock: "Rock & Guitars",
        pop: "Modern Pop",
        hiphop: "Hip-Hop & R&B",
        electronica: "Electronic & Club",
        jazz: "Acoustic Jazz",
        clasica: "Classical",
        acustica: "Acoustic",
        loudness: "Dynamic Loudness",
        gaming: "Gaming Immersion",
        nocturno: "Night Mode",
      },
    },
    settings: {
      title: "System Settings",
      language: "Language",
      doNotDisturb: "Do Not Disturb",
      doNotDisturbDesc: "Suppress popup when playing fullscreen games or apps",
      lowPowerMode: "Low Power Mode",
      lowPowerModeDesc: "Reduces 3D viewport framerate when running on battery",
      autostart: "Start on Windows Boot",
      autostartDesc: "Launch AirPop silently in the system tray on startup",
      soundEnabled: "Audio Chimes",
      soundEnabledDesc: "Play gentle harmonic chimes on connect or case open",
      popupEnabled: "Show proximity popup",
      preferredMonitor: "Preferred Monitor",
      allMonitors: "Primary Display (Default)",
      simulateTest: "Test 3D Popup Animation",
      about: "About AirPop",
      version: "Version 1.2.0",
      privacyLocal: "100% Local & Private",
      privacyLocalDesc: "Zero telemetry, zero remote network calls, and all processing strictly on-device.",
      termsAccepted: "License & terms active",
      viewTerms: "View Terms & Conditions",
      closeTerms: "Close",
      uninstallApp: "Uninstall AirPop",
      uninstallConfirm: "Are you sure you want to completely uninstall AirPop?",
      uninstallDesc: "All installed files and registry entries will be cleanly removed.",
      testPopup: "Show 3D Popup",
    },
    installer: {
      title: "AirPop Setup",
      subtitle: "3D companion experience for wireless earbuds",
      tagline: "Engineered for Windows 11 · 100% Local · Zero Telemetry",
      localGuarantee: "100% local privacy with zero external connections",
      noTelemetry: "Zero telemetry and no personal data collection",
      universalBt: "Universal wireless earbuds & headphones support",
      apoSupport: "Native Equalizer APO parametric integration",
      eulaTitle: "End User License Agreement (EULA)",
      acceptCheckbox: "I have read and accept the Terms and Conditions of Use",
      optionsTitle: "Installation Options",
      autostart: "Launch AirPop automatically on Windows startup",
      desktopShortcut: "Create Desktop shortcut",
      startMenuShortcut: "Create Start Menu shortcut",
      installButton: "Install AirPop",
      installing: "Installing AirPop...",
      successTitle: "Installation Complete!",
      successMessage: "AirPop has been successfully installed and is ready to use.",
      launchNow: "Launch AirPop Now",
      close: "Close",
    },
  },
  pt: {
    appName: "AirPop",
    tabs: {
      device: "Dispositivo",
      equalizer: "Equalizador",
      settings: "Ajustes",
    },
    status: {
      connected: "Conectado",
      standby: "Em espera",
      caseOpen: "Estojo aberto",
      charging: "Carregando",
      batteryLow: "Bateria fraca",
    },
    formFactor: {
      inEar: "Intra-auricular",
      overEar: "Headphone",
      earbuds: "Fones",
      headband: "Arco",
      switchToInEar: "Mudar para Intra-auricular",
      switchToOverEar: "Mudar para Headphone",
    },
    battery: {
      left: "Esquerdo",
      right: "Direito",
      case: "Estojo",
      headband: "Headphone",
      level: "Nível de bateria",
    },
    modes: {
      noiseCancellation: "Cancelamento de ruído",
      transparency: "Transparência",
      adaptive: "Áudio adaptativo",
      off: "Desativado",
      noiseCancellationDesc: "Bloqueia sons externos do ambiente",
      transparencyDesc: "Permite ouvir o ambiente naturalmente",
      adaptiveDesc: "Adapta o cancelamento de acordo com o ambiente",
      offDesc: "Áudio sem cancelamento ativo",
    },
    equalizer: {
      title: "Equalizador Gráfico",
      subtitle: "10 bandas ISO de oitava · Curvas biquad paramétricas",
      enabled: "Equalizador ativado",
      disabled: "Equalizador desativado",
      reset: "Restaurar para Plano",
      curveTitle: "Curva de resposta em frequência",
      preamp: "Pré-amplificador",
      headroom: "Margem contra distorção",
      apoLinked: "Sincronizado com Equalizer APO",
      apoNotInstalled: "Equalizer APO não detectado",
      apoSync: "Sincronizar APO",
      apoSyncSuccess: "Filtros aplicados ao áudio do Windows",
      custom: "Personalizado",
      presets: {
        plano: "Plano (Neutro)",
        graves_plus: "Reforço de graves",
        graves_minus: "Atenuação de graves",
        agudos_plus: "Clareza de agudos",
        voces: "Destaque vocal",
        podcast: "Podcast e Voz",
        rock: "Rock & Guitarras",
        pop: "Pop Moderno",
        hiphop: "Hip-Hop & R&B",
        electronica: "Eletrônica",
        jazz: "Jazz Acústico",
        clasica: "Clássica",
        acustica: "Acústica",
        loudness: "Loudness Dinâmico",
        gaming: "Imersão Gamer",
        nocturno: "Modo Noturno",
      },
    },
    settings: {
      title: "Configurações do Sistema",
      language: "Idioma",
      doNotDisturb: "Não Perturbe",
      doNotDisturbDesc: "Ocultar popup durante jogos ou vídeos em tela cheia",
      lowPowerMode: "Economia de Energia",
      lowPowerModeDesc: "Reduz taxa de quadros 3D ao usar bateria",
      autostart: "Iniciar com o Windows",
      autostartDesc: "Executar AirPop na bandeja ao ligar o computador",
      soundEnabled: "Efeitos sonoros",
      soundEnabledDesc: "Tocar acorde harmônico ao conectar ou abrir o estojo",
      popupEnabled: "Exibir popup de proximidade",
      preferredMonitor: "Monitor preferido",
      allMonitors: "Monitor principal padrão",
      simulateTest: "Testar animação 3D",
      about: "Sobre o AirPop",
      version: "Versão 1.2.0",
      privacyLocal: "100% Local e Seguro",
      privacyLocalDesc: "Zero telemetria e operação totalmente offline no computador.",
      termsAccepted: "Termos e condições ativos",
      viewTerms: "Ver Termos e Condições",
      closeTerms: "Fechar",
      uninstallApp: "Desinstalar AirPop",
      uninstallConfirm: "Tem certeza de que deseja desinstalar o AirPop?",
      uninstallDesc: "Todos os arquivos e chaves de registro serão removidos.",
      testPopup: "Mostrar Popup 3D",
    },
    installer: {
      title: "Instalador AirPop",
      subtitle: "Experiência 3D para fones Bluetooth no Windows",
      tagline: "Projetado para Windows 11 · 100% Local · Zero Telemetria",
      localGuarantee: "Privacidade 100% local sem conexões externas",
      noTelemetry: "Zero telemetria e nenhuma coleta de dados",
      universalBt: "Compatibilidade universal com fones Bluetooth",
      apoSupport: "Integração nativa com Equalizer APO",
      eulaTitle: "Contrato de Licença (EULA)",
      acceptCheckbox: "Li e aceito os Termos e Condições de Uso",
      optionsTitle: "Opções de Instalação",
      autostart: "Iniciar AirPop automaticamente com o Windows",
      desktopShortcut: "Criar atalho na Área de Trabalho",
      startMenuShortcut: "Criar atalho no Menu Iniciar",
      installButton: "Instalar AirPop",
      installing: "Instalando AirPop...",
      successTitle: "Instalação Concluída!",
      successMessage: "AirPop foi instalado com sucesso e está pronto para uso.",
      launchNow: "Iniciar AirPop Agora",
      close: "Fechar",
    },
  },
  fr: {
    appName: "AirPop",
    tabs: {
      device: "Appareil",
      equalizer: "Égaliseur",
      settings: "Paramètres",
    },
    status: {
      connected: "Connecté",
      standby: "En veille",
      caseOpen: "Boîtier ouvert",
      charging: "En charge",
      batteryLow: "Batterie faible",
    },
    formFactor: {
      inEar: "Écouteurs Intra",
      overEar: "Casque Arceau",
      earbuds: "Écouteurs",
      headband: "Casque",
      switchToInEar: "Passer aux Écouteurs",
      switchToOverEar: "Passer au Casque",
    },
    battery: {
      left: "Gauche",
      right: "Droit",
      case: "Boîtier",
      headband: "Casque",
      level: "Niveau de batterie",
    },
    modes: {
      noiseCancellation: "Réduction du bruit",
      transparency: "Transparence",
      adaptive: "Audio adaptatif",
      off: "Désactivé",
      noiseCancellationDesc: "Isole les bruits environnants",
      transparencyDesc: "Laisse passer naturellement les sons extérieurs",
      adaptiveDesc: "Adapte dynamiquement le traitement au bruit ambiant",
      offDesc: "Aucun traitement actif de réduction du bruit",
    },
    equalizer: {
      title: "Égaliseur Graphique",
      subtitle: "10 bandes d'octave ISO · Courbes paramétriques biquad",
      enabled: "Égaliseur activé",
      disabled: "Égaliseur désactivé",
      reset: "Réinitialiser à Plat",
      curveTitle: "Courbe de réponse en fréquence",
      preamp: "Préamplificateur",
      headroom: "Marge de protection contre l'écrêtage",
      apoLinked: "Synchronisé avec Equalizer APO",
      apoNotInstalled: "Equalizer APO non détecté",
      apoSync: "Synchroniser APO",
      apoSyncSuccess: "Filtres appliqués au flux audio de Windows",
      custom: "Personnalisé",
      presets: {
        plano: "Neutre (Plat)",
        graves_plus: "Basses renforcées",
        graves_minus: "Atténuation des basses",
        agudos_plus: "Clarté des aigus",
        voces: "Voix claire",
        podcast: "Podcast et Dialogue",
        rock: "Rock & Guitares",
        pop: "Pop Moderne",
        hiphop: "Hip-Hop & R&B",
        electronica: "Électronique & Club",
        jazz: "Jazz Acoustique",
        clasica: "Musique Classique",
        acustica: "Acoustique",
        loudness: "Sonie Dynamique",
        gaming: "Immersion Jeu",
        nocturno: "Mode Nuit",
      },
    },
    settings: {
      title: "Paramètres Système",
      language: "Langue",
      doNotDisturb: "Ne pas déranger",
      doNotDisturbDesc: "Masquer le popup pendant les jeux plein écran",
      lowPowerMode: "Mode Économie",
      lowPowerModeDesc: "Réduit la fréquence 3D sur batterie",
      autostart: "Démarrer avec Windows",
      autostartDesc: "Lancer AirPop discrètement au démarrage",
      soundEnabled: "Effets sonores",
      soundEnabledDesc: "Jouer un son harmonique à la connexion ou l'ouverture",
      popupEnabled: "Afficher le popup de proximité",
      preferredMonitor: "Écran préféré",
      allMonitors: "Écran principal par défaut",
      simulateTest: "Tester l'animation 3D",
      about: "À propos d'AirPop",
      version: "Version 1.2.0",
      privacyLocal: "100% Local & Privé",
      privacyLocalDesc: "Zéro télémétrie, aucun appel réseau extérieur et données conservées en local.",
      termsAccepted: "Conditions d'utilisation actives",
      viewTerms: "Voir les Conditions Générales",
      closeTerms: "Fermer",
      uninstallApp: "Désinstaller AirPop",
      uninstallConfirm: "Voulez-vous vraiment désinstaller AirPop ?",
      uninstallDesc: "Tous les fichiers et clés de registre seront nettoyés.",
      testPopup: "Afficher Popup 3D",
    },
    installer: {
      title: "Assistant d'Installation AirPop",
      subtitle: "Expérience 3D pour écouteurs sans fil sous Windows",
      tagline: "Conçu pour Windows 11 · 100% Local · Zéro Télémétrie",
      localGuarantee: "Confidentialité 100% locale sans requêtes externes",
      noTelemetry: "Zéro télémétrie et aucune collecte de données",
      universalBt: "Compatibilité universelle écouteurs & casques",
      apoSupport: "Intégration paramétrique avec Equalizer APO",
      eulaTitle: "Contrat de Licence Utilisateur Final (EULA)",
      acceptCheckbox: "J'ai lu et j'accepte les Conditions d'Utilisation",
      optionsTitle: "Options d'Installation",
      autostart: "Lancer AirPop automatiquement au démarrage de Windows",
      desktopShortcut: "Créer un raccourci sur le Bureau",
      startMenuShortcut: "Créer un raccourci dans le Menu Démarrer",
      installButton: "Installer AirPop",
      installing: "Installation d'AirPop en cours...",
      successTitle: "Installation Réussie !",
      successMessage: "AirPop a été installé avec succès et est prêt à l'emploi.",
      launchNow: "Lancer AirPop Maintenant",
      close: "Fermer",
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
      standby: "Standby",
      caseOpen: "Ladecase offen",
      charging: "Wird geladen",
      batteryLow: "Akku schwach",
    },
    formFactor: {
      inEar: "In-Ear Kopfhörer",
      overEar: "Over-Ear Kopfhörer",
      earbuds: "Ohrhörer",
      headband: "Kopfhörer",
      switchToInEar: "Zu In-Ear wechseln",
      switchToOverEar: "Zu Over-Ear wechseln",
    },
    battery: {
      left: "Links",
      right: "Rechts",
      case: "Ladecase",
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
      soundEnabledDesc: "Harmonischen Klang beim Verbinden abspielen",
      popupEnabled: "Näherungs-Popup anzeigen",
      preferredMonitor: "Bevorzugter Monitor",
      allMonitors: "Standard-Hauptmonitor",
      simulateTest: "Popup-Animation testen",
      about: "Über AirPop",
      version: "Version 1.2.0",
      privacyLocal: "100% Lokal & Sicher",
      privacyLocalDesc: "Keine Telemetrie, keine externen Netzwerkverbindungen und keine Datensammlung.",
      termsAccepted: "Nutzungsbedingungen (EULA) aktiv",
      viewTerms: "Nutzungsbedingungen anzeigen",
      closeTerms: "Schließen",
      uninstallApp: "AirPop deinstallieren",
      uninstallConfirm: "Möchten Sie AirPop wirklich vollständig deinstallieren?",
      uninstallDesc: "Alle Dateien und Registrierungseinträge werden entfernt.",
      testPopup: "3D-Popup anzeigen",
    },
    installer: {
      title: "AirPop Setup-Assistent",
      subtitle: "3D-Erlebnis für kabellose Kopfhörer unter Windows",
      tagline: "Optimiert für Windows 11 · 100% Lokal · Null Telemetrie",
      localGuarantee: "100% lokale Privatsphäre ohne externe Verbindungen",
      noTelemetry: "Keine Telemetrie oder Erfassung persönlicher Daten",
      universalBt: "Universelle Unterstützung für Bluetooth-Kopfhörer",
      apoSupport: "Parametrische Integration mit Equalizer APO",
      eulaTitle: "Endbenutzer-Lizenzvereinbarung (EULA)",
      acceptCheckbox: "Ich habe die Nutzungsbedingungen gelesen und akzeptiere sie",
      optionsTitle: "Installationsoptionen",
      autostart: "AirPop beim Windows-Start automatisch ausführen",
      desktopShortcut: "Desktop-Verknüpfung erstellen",
      startMenuShortcut: "Startmenü-Verknüpfung erstellen",
      installButton: "AirPop installieren",
      installing: "AirPop wird installiert...",
      successTitle: "Installation abgeschlossen!",
      successMessage: "AirPop wurde erfolgreich installiert und ist einsatzbereit.",
      launchNow: "AirPop jetzt starten",
      close: "Schließen",
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

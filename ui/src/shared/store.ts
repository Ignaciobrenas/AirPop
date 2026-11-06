import { create } from "zustand";
import catalogData from "../../../catalog/models.json";
import eqPresetsJson from "../../../catalog/eq-presets.json";
import { detectSystemLanguage, SupportedLanguage } from "./i18n";
import { playConnectionChime } from "./sound";
import {
  ApoStatus,
  AppSettings,
  BatteryState,
  CaseOpenEventPayload,
  ChargingState,
  ConnectedEventPayload,
  EqProfile,
  FormFactor,
  IPC_COMMANDS,
  invokeCommand,
  ListeningMode,
  PresetDefinition,
  SimulationScenario,
} from "./ipc";

export type ModelSilhouette =
  | "stem-earbuds"
  | "bud-in-ear"
  | "over-ear-oval"
  | "over-ear-sculpted";

export interface CatalogColor {
  id: string;
  label: string;
  hex: string;
  accentHex?: string;
  bleColorCode?: number;
}

export interface CatalogModel {
  id: string;
  displayName: string;
  vendor?: string;
  kind: "earbuds" | "over-ear";
  silhouette?: ModelSilhouette;
  year: number;
  bleCompanyIds?: number[];
  bleModelIds: number[];
  btNamePatterns?: string[];
  colors: CatalogColor[];
  listeningModes: ListeningMode[];
  assets: {
    glb: string;
    caseClosed: string;
    caseOpen: string;
    buds: string;
  };
}

export type PopupDisplayMode = "hidden" | "proximity" | "connected";

export interface AirPopState {
  models: CatalogModel[];
  popupMode: PopupDisplayMode;
  modelId: string;
  deviceName: string;
  colorId: string;
  battery: BatteryState;
  charging: ChargingState;
  rssi: number;
  listeningMode: ListeningMode;
  aapSupported: boolean;
  isHovered: boolean;
  connected: boolean;
  settings: AppSettings;
  language: SupportedLanguage;
  activeTab: "device" | "equalizer" | "settings";
  eqProfile: EqProfile;
  eqPresets: PresetDefinition[];
  apoStatus: ApoStatus;
  applyCaseOpen: (payload: CaseOpenEventPayload) => void;
  applyConnected: (payload: ConnectedEventPayload) => void;
  applyBattery: (battery: BatteryState, charging: ChargingState) => void;
  applyDisconnected: () => void;
  setListeningMode: (mode: ListeningMode) => void;
  setHovered: (hovered: boolean) => void;
  dismissPopup: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  triggerSimulation: (
    modelId: string,
    color: string,
    scenario: SimulationScenario
  ) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setActiveTab: (tab: "device" | "equalizer" | "settings") => void;
  setEqGain: (index: number, gain: number) => void;
  applyEqPreset: (presetId: string) => void;
  toggleEq: () => void;
  resetEq: () => void;
  syncApo: () => Promise<void>;
  checkApoStatus: () => Promise<void>;
  setFormFactor: (form: FormFactor) => void;
}

const defaultCatalog = (catalogData as { models: CatalogModel[] }).models;
const defaultPresets = (eqPresetsJson as { presets: PresetDefinition[] })
  .presets;

const initialLanguage = (): SupportedLanguage => {
  if (typeof window !== "undefined" && window.localStorage) {
    const saved = window.localStorage.getItem("airpop_lang");
    if (
      saved &&
      (saved === "es" ||
        saved === "en" ||
        saved === "pt" ||
        saved === "fr" ||
        saved === "de")
    ) {
      return saved as SupportedLanguage;
    }
  }
  return detectSystemLanguage();
};

export function findCatalogModel(
  models: CatalogModel[],
  modelId: string
): CatalogModel {
  return models.find((m) => m.id === modelId) ?? models[0];
}

export function resolveColorHex(model: CatalogModel, colorId: string): string {
  return (
    model.colors.find((c) => c.id === colorId)?.hex ??
    model.colors[0]?.hex ??
    "#F5F5F7"
  );
}

export function resolveAccentHex(model: CatalogModel, colorId: string): string {
  return (
    model.colors.find((c) => c.id === colorId)?.accentHex ??
    model.colors[0]?.accentHex ??
    "#8E95A5"
  );
}

export const useAirPopStore = create<AirPopState>((set, get) => ({
  models: defaultCatalog,
  popupMode: "proximity",
  modelId: "airpods-pro-3",
  deviceName: "Pro 3",
  colorId: "white",
  battery: { left: 82, right: 80, case: 64 },
  charging: { left: false, right: false, case: false },
  rssi: -46,
  listeningMode: "noise-cancellation",
  aapSupported: true,
  isHovered: false,
  connected: true,
  settings: {
    autostart: false,
    doNotDisturb: false,
    lowPowerMode: false,
    soundEnabled: true,
    popupEnabled: true,
    preferredMonitor: null,
  },
  language: initialLanguage(),
  activeTab: "device",
  eqProfile: {
    enabled: false,
    presetId: "flat",
    gainsDb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  eqPresets: defaultPresets,
  apoStatus: {
    installed: false,
    linked: false,
    configDir: null,
  },

  applyCaseOpen: (payload) => {
    const model = findCatalogModel(get().models, payload.modelId);
    set({
      popupMode: "proximity",
      modelId: model.id,
      deviceName: payload.displayName ?? model.displayName,
      colorId: payload.color,
      battery: payload.battery,
      charging: payload.charging,
      rssi: payload.rssi,
      aapSupported: payload.aapSupported ?? get().aapSupported,
    });
  },

  applyConnected: (payload) => {
    const model = findCatalogModel(get().models, payload.modelId);
    playConnectionChime(get().settings.soundEnabled);
    set({
      popupMode: "connected",
      connected: true,
      modelId: model.id,
      deviceName: payload.name || model.displayName,
      colorId: payload.color,
      battery: payload.battery,
      listeningMode: payload.listeningMode ?? get().listeningMode,
      aapSupported: payload.aapSupported ?? get().aapSupported,
    });
  },

  applyBattery: (battery, charging) => {
    set({ battery, charging });
  },

  applyDisconnected: () => {
    set({ connected: false, popupMode: "hidden" });
  },

  setListeningMode: (mode) => {
    set({ listeningMode: mode });
    void invokeCommand(IPC_COMMANDS.SET_LISTENING_MODE, { mode });
  },

  setHovered: (hovered) => {
    set({ isHovered: hovered });
    void invokeCommand(IPC_COMMANDS.SET_CURSOR_PASSTHROUGH, {
      ignore: !hovered,
    });
  },

  dismissPopup: () => {
    set({ popupMode: "hidden", isHovered: false });
    void invokeCommand(IPC_COMMANDS.DISMISS_POPUP);
  },

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    void invokeCommand(IPC_COMMANDS.SET_SETTINGS, { settings: updated });
  },

  triggerSimulation: (modelId, color, scenario) => {
    const model = findCatalogModel(get().models, modelId);
    const isOverEar = model.kind === "over-ear";
    if (scenario === "connected") {
      get().applyConnected({
        name: model.displayName,
        modelId: model.id,
        color,
        battery: {
          left: 82,
          right: 80,
          case: isOverEar ? null : 64,
        },
        listeningMode: "noise-cancellation",
        aapSupported: true,
      });
    } else if (scenario === "low-battery") {
      get().applyCaseOpen({
        modelId: model.id,
        displayName: model.displayName,
        color,
        battery: {
          left: 12,
          right: 14,
          case: isOverEar ? null : 10,
        },
        charging: { left: false, right: false, case: false },
        rssi: -48,
        aapSupported: true,
      });
    } else if (scenario === "charging") {
      get().applyCaseOpen({
        modelId: model.id,
        displayName: model.displayName,
        color,
        battery: {
          left: 55,
          right: 60,
          case: isOverEar ? null : 80,
        },
        charging: { left: true, right: true, case: !isOverEar },
        rssi: -44,
        aapSupported: true,
      });
    } else {
      get().applyCaseOpen({
        modelId: model.id,
        displayName: model.displayName,
        color,
        battery: {
          left: 82,
          right: 80,
          case: isOverEar ? null : 64,
        },
        charging: { left: false, right: false, case: false },
        rssi: -46,
        aapSupported: true,
      });
    }
    void invokeCommand(IPC_COMMANDS.SIMULATE, { modelId, color, scenario });
  },

  setLanguage: (lang) => {
    set({ language: lang });
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("airpop_lang", lang);
    }
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setEqGain: (index, gain) => {
    const current = get().eqProfile;
    const clamped = Math.max(-12, Math.min(12, Math.round(gain * 2) / 2));
    const nextGains = [...current.gainsDb];
    nextGains[index] = clamped;
    const nextProfile: EqProfile = {
      ...current,
      enabled: true,
      presetId: "custom",
      gainsDb: nextGains,
    };
    set({ eqProfile: nextProfile });
    void invokeCommand(IPC_COMMANDS.SET_EQ_PROFILE, { profile: nextProfile });
  },

  applyEqPreset: (presetId) => {
    const preset = get().eqPresets.find((p) => p.id === presetId);
    if (!preset) return;
    const nextProfile: EqProfile = {
      enabled: true,
      presetId: preset.id,
      gainsDb: [...preset.gains],
    };
    set({ eqProfile: nextProfile });
    void invokeCommand(IPC_COMMANDS.SET_EQ_PROFILE, { profile: nextProfile });
  },

  toggleEq: () => {
    const current = get().eqProfile;
    const nextProfile: EqProfile = {
      ...current,
      enabled: !current.enabled,
    };
    set({ eqProfile: nextProfile });
    void invokeCommand(IPC_COMMANDS.SET_EQ_PROFILE, { profile: nextProfile });
  },

  resetEq: () => {
    const nextProfile: EqProfile = {
      enabled: false,
      presetId: "flat",
      gainsDb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
    set({ eqProfile: nextProfile });
    void invokeCommand(IPC_COMMANDS.SET_EQ_PROFILE, { profile: nextProfile });
  },

  syncApo: async () => {
    try {
      const res = await invokeCommand<ApoStatus>(IPC_COMMANDS.SYNC_APO_CONFIG);
      if (res) {
        set({ apoStatus: res });
      }
    } catch {
      // ignore
    }
  },

  checkApoStatus: async () => {
    try {
      const res = await invokeCommand<ApoStatus>(IPC_COMMANDS.GET_APO_STATUS);
      if (res) {
        set({ apoStatus: res });
      }
    } catch {
      // ignore
    }
  },

  setFormFactor: (form) => {
    const name = get().deviceName;
    void invokeCommand(IPC_COMMANDS.SET_FORM_FACTOR, {
      deviceName: name,
      formFactor: form,
    });
    const genericId =
      form === "over-ear" ? "generic-headphones" : "generic-earbuds";
    const found = get().models.find((m) => m.id === genericId);
    if (found) {
      set({ modelId: found.id });
    }
  },
}));

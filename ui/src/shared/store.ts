import { create } from "zustand";
import catalogData from "../../../catalog/models.json";
import {
  AppSettings,
  BatteryState,
  CaseOpenEventPayload,
  ChargingState,
  ConnectedEventPayload,
  IPC_COMMANDS,
  invokeCommand,
  ListeningMode,
  SimulationScenario,
} from "./ipc";

export interface CatalogColor {
  id: string;
  label: string;
  hex: string;
  bleColorCode?: number;
}

export interface CatalogModel {
  id: string;
  displayName: string;
  kind: "earbuds" | "over-ear";
  year: number;
  bleModelIds: number[];
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
}

const defaultCatalog = (catalogData as { models: CatalogModel[] }).models;

export function findCatalogModel(
  models: CatalogModel[],
  modelId: string
): CatalogModel {
  return (
    models.find((m) => m.id === modelId) ??
    models[0]
  );
}

export function resolveColorHex(model: CatalogModel, colorId: string): string {
  return (
    model.colors.find((c) => c.id === colorId)?.hex ??
    model.colors[0]?.hex ??
    "#F5F5F7"
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
    if (scenario === "connected") {
      get().applyConnected({
        name: model.displayName,
        modelId: model.id,
        color,
        battery: { left: 82, right: 80, case: 64 },
        listeningMode: "noise-cancellation",
        aapSupported: true,
      });
    } else if (scenario === "low-battery") {
      get().applyCaseOpen({
        modelId: model.id,
        displayName: model.displayName,
        color,
        battery: { left: 12, right: 24, case: 10 },
        charging: { left: false, right: false, case: false },
        rssi: -48,
        aapSupported: true,
      });
    } else if (scenario === "charging") {
      get().applyCaseOpen({
        modelId: model.id,
        displayName: model.displayName,
        color,
        battery: { left: 55, right: 60, case: 80 },
        charging: { left: true, right: true, case: true },
        rssi: -44,
        aapSupported: true,
      });
    } else {
      get().applyCaseOpen({
        modelId: model.id,
        displayName: model.displayName,
        color,
        battery: { left: 82, right: 80, case: 64 },
        charging: { left: false, right: false, case: false },
        rssi: -46,
        aapSupported: true,
      });
    }
    void invokeCommand(IPC_COMMANDS.SIMULATE, { modelId, color, scenario });
  },
}));

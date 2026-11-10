export const IPC_EVENTS = {
  CASE_OPEN: "device://case-open",
  CONNECTED: "device://connected",
  BATTERY: "device://battery",
  LISTENING_MODE: "device://listening-mode",
  DISCONNECTED: "device://disconnected",
  SETTINGS: "app://settings",
  EQ: "device://eq",
  APO_STATUS: "device://apo-status",
} as const;

export const IPC_COMMANDS = {
  SET_LISTENING_MODE: "set_listening_mode",
  GET_SETTINGS: "get_settings",
  SET_SETTINGS: "set_settings",
  DISMISS_POPUP: "dismiss_popup",
  SIMULATE: "simulate",
  SET_CURSOR_PASSTHROUGH: "set_popup_cursor_passthrough",
  CONNECT_DEVICE: "connect_device",
  GET_EQ_PRESETS: "get_eq_presets",
  GET_EQ_PROFILE: "get_eq_profile",
  SET_EQ_PROFILE: "set_eq_profile",
  GET_APO_STATUS: "get_apo_status",
  SYNC_APO_CONFIG: "sync_apo_config",
  SET_FORM_FACTOR: "set_form_factor",
  INSTALL_APP: "install_app",
  UNINSTALL_APP: "uninstall_app",
  LAUNCH_INSTALLED_APP: "launch_installed_app",
  GET_EULA_TEXT: "get_eula_text",
  OPEN_TEST_POPUP: "open_test_popup",
  GET_AVAILABLE_MONITORS: "get_available_monitors",
  HIDE_FLYOUT: "hide_flyout",
} as const;

export interface InstallAppArgs {
  autostart: boolean;
  desktopShortcut: boolean;
  startMenuShortcut: boolean;
}

export type FormFactor = "earbuds" | "over-ear";

export interface PresetDefinition {
  id: string;
  label: string;
  gains: number[];
}

export interface EqProfile {
  enabled: boolean;
  presetId: string;
  gainsDb: number[];
}

export interface ApoStatus {
  installed: boolean;
  linked: boolean;
  configDir: string | null;
}

export type ListeningMode =
  | "noise-cancellation"
  | "transparency"
  | "adaptive"
  | "off";

export type SimulationScenario =
  | "case-open"
  | "connected"
  | "low-battery"
  | "charging";

export interface BatteryState {
  left: number | null;
  right: number | null;
  case: number | null;
}

export interface ChargingState {
  left: boolean;
  right: boolean;
  case: boolean;
}

export interface CaseOpenEventPayload {
  modelId: string;
  displayName?: string;
  color: string;
  battery: BatteryState;
  charging: ChargingState;
  rssi: number;
  aapSupported?: boolean;
}

export interface ConnectedEventPayload {
  name: string;
  modelId: string;
  color: string;
  battery: BatteryState;
  listeningMode?: ListeningMode | null;
  aapSupported?: boolean;
}

export interface BatteryEventPayload {
  left: number | null;
  right: number | null;
  case: number | null;
  charging: ChargingState;
}

export interface ListeningModeEventPayload {
  mode: ListeningMode;
}

export interface AppSettings {
  autostart: boolean;
  doNotDisturb: boolean;
  lowPowerMode: boolean;
  soundEnabled: boolean;
  popupEnabled: boolean;
  preferredMonitor: string | null;
}

export interface SimulateArgs {
  modelId: string;
  color: string;
  scenario: SimulationScenario;
}

type UnlistenFn = () => void;

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function invokeCommand<T = void>(
  command: string,
  args?: Record<string, unknown>
): Promise<T | undefined> {
  if (!isTauriRuntime()) {
    return undefined;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

export async function listenEvent<T>(
  event: string,
  handler: (payload: T) => void
): Promise<UnlistenFn> {
  if (!isTauriRuntime()) {
    const domHandler = (e: Event) => {
      const custom = e as CustomEvent<T>;
      handler(custom.detail);
    };
    window.addEventListener(event, domHandler);
    return () => window.removeEventListener(event, domHandler);
  }
  const { listen } = await import("@tauri-apps/api/event");
  return listen<T>(event, (evt) => handler(evt.payload));
}

export function emitSimulatedDomEvent<T>(event: string, payload: T): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(event, { detail: payload }));
  }
}

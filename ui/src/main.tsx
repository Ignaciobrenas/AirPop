import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Flyout } from "./flyout/Flyout";
import { Popup } from "./popup/Popup";
import {
  AppSettings,
  BatteryEventPayload,
  CaseOpenEventPayload,
  ConnectedEventPayload,
  IPC_EVENTS,
  listenEvent,
  ListeningModeEventPayload,
} from "./shared/ipc";
import { useAirPopStore } from "./shared/store";
import "./shared/tokens.css";

export const AppRoot: React.FC = () => {
  const [hash, setHash] = useState<string>(() => window.location.hash || "#popup");
  const {
    applyCaseOpen,
    applyConnected,
    applyBattery,
    applyDisconnected,
    setListeningMode,
    updateSettings,
  } = useAirPopStore();

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#popup");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const cleanups: Array<Promise<() => void>> = [
      listenEvent<CaseOpenEventPayload>(IPC_EVENTS.CASE_OPEN, applyCaseOpen),
      listenEvent<ConnectedEventPayload>(IPC_EVENTS.CONNECTED, applyConnected),
      listenEvent<BatteryEventPayload>(IPC_EVENTS.BATTERY, (p) =>
        applyBattery(
          { left: p.left, right: p.right, case: p.case },
          p.charging
        )
      ),
      listenEvent<ListeningModeEventPayload>(IPC_EVENTS.LISTENING_MODE, (p) =>
        setListeningMode(p.mode)
      ),
      listenEvent<Record<string, never>>(
        IPC_EVENTS.DISCONNECTED,
        applyDisconnected
      ),
      listenEvent<AppSettings>(IPC_EVENTS.SETTINGS, updateSettings),
    ];

    return () => {
      cleanups.forEach((promise) => {
        void promise.then((unlisten) => unlisten());
      });
    };
  }, [
    applyCaseOpen,
    applyConnected,
    applyBattery,
    applyDisconnected,
    setListeningMode,
    updateSettings,
  ]);

  if (hash === "#flyout") {
    return <Flyout />;
  }

  return <Popup />;
};

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <AppRoot />
    </React.StrictMode>
  );
}

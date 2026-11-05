import React, { Suspense, useEffect, useState } from "react";
import {
  AppSettings,
  BatteryEventPayload,
  CaseOpenEventPayload,
  ConnectedEventPayload,
  IPC_EVENTS,
  listenEvent,
  ListeningModeEventPayload,
} from "./shared/ipc";
import { playConnectionChime } from "./shared/sound";
import { useAirPopStore } from "./shared/store";
import "./shared/tokens.css";

const LazyPopup = React.lazy(() =>
  import("./popup/Popup").then((m) => ({ default: m.Popup }))
);
const LazyFlyout = React.lazy(() =>
  import("./flyout/Flyout").then((m) => ({ default: m.Flyout }))
);

export const AppRoot: React.FC = () => {
  const [hash, setHash] = useState<string>(() => window.location.hash || "#popup");
  const {
    settings,
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
      listenEvent<CaseOpenEventPayload>(IPC_EVENTS.CASE_OPEN, (payload) => {
        applyCaseOpen(payload);
        playConnectionChime(settings.soundEnabled);
      }),
      listenEvent<ConnectedEventPayload>(IPC_EVENTS.CONNECTED, (payload) => {
        applyConnected(payload);
        playConnectionChime(settings.soundEnabled);
      }),
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
    settings.soundEnabled,
    applyCaseOpen,
    applyConnected,
    applyBattery,
    applyDisconnected,
    setListeningMode,
    updateSettings,
  ]);

  return (
    <Suspense fallback={null}>
      {hash === "#flyout" ? <LazyFlyout /> : <LazyPopup />}
    </Suspense>
  );
};

const rootEl = document.getElementById("root");
if (rootEl) {
  import("react-dom/client").then(({ createRoot }) => {
    createRoot(rootEl).render(
      <React.StrictMode>
        <AppRoot />
      </React.StrictMode>
    );
  });
}

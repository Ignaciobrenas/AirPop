import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BatteryRing } from "../popup/BatteryRing";
import { getTranslation, SupportedLanguage } from "../shared/i18n";
import {
  CloseIcon,
  EarbudsGlyphIcon,
  HeadbandGlyphIcon,
  SignalBarsIcon,
} from "../shared/icons";
import { invokeCommand, IPC_COMMANDS } from "../shared/ipc";
import { resolveTransition } from "../shared/spring";
import {
  findCatalogModel,
  resolveColorHex,
  useAirPopStore,
} from "../shared/store";
import { Equalizer } from "./Equalizer";
import { ModeSelector } from "./ModeSelector";

export const Flyout: React.FC = () => {
  const {
    models,
    modelId,
    deviceName,
    colorId,
    battery,
    charging,
    rssi,
    listeningMode,
    aapSupported,
    connected,
    settings,
    language,
    activeTab,
    setListeningMode,
    updateSettings,
    triggerSimulation,
    setLanguage,
    setActiveTab,
    setFormFactor,
  } = useAirPopStore();

  const prefersReduced = useReducedMotion() ?? false;
  const t = getTranslation(language);

  const [showEula, setShowEula] = useState<boolean>(false);
  const [eulaText, setEulaText] = useState<string>("");
  const [monitors, setMonitors] = useState<string[]>([]);

  useEffect(() => {
    void invokeCommand<string[]>(IPC_COMMANDS.GET_AVAILABLE_MONITORS)
      .then((list) => {
        if (Array.isArray(list)) {
          setMonitors(list);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        void invokeCommand(IPC_COMMANDS.HIDE_FLYOUT);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const model = findCatalogModel(models, modelId);
  const colorHex = resolveColorHex(model, colorId);
  const isOverEar = model.kind === "over-ear";

  const tabs: Array<{ id: "device" | "equalizer" | "settings"; label: string }> = [
    { id: "device", label: t.tabs.device },
    { id: "equalizer", label: t.tabs.equalizer },
    { id: "settings", label: t.tabs.settings },
  ];

  return (
    <div
      className="airpop-flyout-card"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          width: "100%",
        }}
      >
        <div
          className="airpop-control"
          style={{
            flex: 1,
            display: "flex",
            padding: "3px",
            borderRadius: "var(--radius-pill)",
            position: "relative",
            background: "var(--surface-elevated)",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  fontSize: "12px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  background: "transparent",
                  border: "none",
                  borderRadius: "var(--radius-pill)",
                  cursor: "pointer",
                  position: "relative",
                  zIndex: 1,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="flyoutActiveTab"
                    transition={resolveTransition("soft", prefersReduced)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "var(--radius-pill)",
                      background: "var(--accent)",
                      zIndex: -1,
                    }}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={t.window.close}
          title={t.window.close}
          className="airpop-window-btn"
          onClick={() => void invokeCommand(IPC_COMMANDS.HIDE_FLYOUT)}
          style={{
            width: "28px",
            height: "28px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <CloseIcon size={12} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {activeTab === "device" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "var(--radius-control)",
                    background: colorHex,
                    border: "1px solid var(--surface-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent)",
                    flexShrink: 0,
                  }}
                >
                  {isOverEar ? (
                    <HeadbandGlyphIcon size={22} />
                  ) : (
                    <EarbudsGlyphIcon size={22} />
                  )}
                </div>

                <div>
                  <h1
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      lineHeight: 1.2,
                    }}
                  >
                    {deviceName}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      marginTop: "2px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        margin: 0,
                      }}
                    >
                      {isOverEar ? t.formFactor.overEar : t.formFactor.inEar} ·{" "}
                      {connected ? t.status.connected : t.status.standby}
                    </p>
                    <span
                      title={`${t.status.signal}: ${rssi} dBm`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        fontSize: "10px",
                        padding: "1px 6px",
                        borderRadius: "var(--radius-pill)",
                        background: "var(--surface-elevated)",
                        border: "1px solid var(--surface-border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <SignalBarsIcon size={11} rssi={rssi} />
                      <span className="airpop-tabular">{rssi} dBm</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormFactor(isOverEar ? "earbuds" : "over-ear")}
                className="airpop-control"
                title={
                  isOverEar
                    ? t.formFactor.switchToInEar
                    : t.formFactor.switchToOverEar
                }
                style={{
                  padding: "4px 8px",
                  fontSize: "10px",
                  color: "var(--text-secondary)",
                  borderRadius: "var(--radius-pill)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  whiteSpace: "nowrap",
                }}
              >
                {isOverEar ? "⇄ In-Ear" : "⇄ Over-Ear"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-1)",
              }}
            >
              <select
                aria-label="Seleccionar modelo"
                value={model.id}
                onChange={(e) => {
                  const nextModel = findCatalogModel(models, e.target.value);
                  triggerSimulation(
                    nextModel.id,
                    nextModel.colors[0]?.id ?? "white",
                    "case-open"
                  );
                }}
                className="airpop-control"
                style={{
                  padding: "7px 28px 7px 10px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName} (
                    {m.kind === "over-ear"
                      ? t.formFactor.headband
                      : t.formFactor.earbuds}
                    )
                  </option>
                ))}
              </select>

              {model.colors.length > 1 && (
                <select
                  aria-label={t.settings.selectColor}
                  value={colorId}
                  onChange={(e) =>
                    triggerSimulation(model.id, e.target.value, "case-open")
                  }
                  className="airpop-control"
                  style={{
                    padding: "7px 28px 7px 10px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {model.colors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div
              className="airpop-control"
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-control)",
              }}
            >
              {isOverEar ? (
                <BatteryRing
                  label={t.battery.headband}
                  percentage={battery.left ?? battery.right}
                  charging={charging.left || charging.right}
                  size={58}
                />
              ) : (
                <>
                  <BatteryRing
                    label={t.battery.left}
                    percentage={battery.left}
                    charging={charging.left}
                    size={50}
                  />
                  <BatteryRing
                    label={t.battery.right}
                    percentage={battery.right}
                    charging={charging.right}
                    size={50}
                  />
                  <BatteryRing
                    label={t.battery.case}
                    percentage={battery.case}
                    charging={charging.case}
                    size={50}
                  />
                </>
              )}
            </div>

            <ModeSelector
              supportedModes={model.listeningModes}
              activeMode={listeningMode}
              aapSupported={aapSupported}
              onSelect={setListeningMode}
            />
          </>
        )}

        {activeTab === "equalizer" && <Equalizer />}

        {activeTab === "settings" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div
              className="airpop-control"
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--radius-control)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {t.settings.language}
                  </span>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Idioma de la interfaz
                  </p>
                </div>

                <select
                  value={language}
                  aria-label={t.settings.language}
                  onChange={(e) =>
                    setLanguage(e.target.value as SupportedLanguage)
                  }
                  className="airpop-control"
                  style={{
                    padding: "6px 28px 6px 12px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-sans)",
                    borderRadius: "var(--radius-pill)",
                  }}
                >
                  <option value="es">Español (ES)</option>
                  <option value="en">English (EN)</option>
                  <option value="pt">Português (PT)</option>
                  <option value="fr">Français (FR)</option>
                  <option value="de">Deutsch (DE)</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "var(--space-2)",
                  borderTop: "1px solid var(--surface-border)",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Pantalla de popup
                  </span>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Monitor donde mostrar el popup
                  </p>
                </div>

                <select
                  value={settings.preferredMonitor ?? ""}
                  aria-label="Pantalla de popup"
                  onChange={(e) =>
                    updateSettings({
                      preferredMonitor: e.target.value || null,
                    })
                  }
                  className="airpop-control"
                  style={{
                    padding: "6px 28px 6px 12px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-sans)",
                    borderRadius: "var(--radius-pill)",
                    maxWidth: "150px",
                  }}
                >
                  <option value="">Automático</option>
                  {monitors.map((m, idx) => (
                    <option key={m} value={m}>
                      {m.replace(/^\\\\.\\/, "") || `Monitor ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="airpop-control"
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--radius-control)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                <div>
                  <span style={{ fontWeight: 500 }}>
                    {t.settings.doNotDisturb}
                  </span>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t.settings.doNotDisturbDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label={t.settings.doNotDisturb}
                  checked={settings.doNotDisturb}
                  onChange={(e) =>
                    updateSettings({ doNotDisturb: e.target.checked })
                  }
                  style={{ accentColor: "var(--accent)" }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                <div>
                  <span style={{ fontWeight: 500 }}>
                    {t.settings.lowPowerMode}
                  </span>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t.settings.lowPowerModeDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label={t.settings.lowPowerMode}
                  checked={settings.lowPowerMode}
                  onChange={(e) =>
                    updateSettings({ lowPowerMode: e.target.checked })
                  }
                  style={{ accentColor: "var(--accent)" }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                <div>
                  <span style={{ fontWeight: 500 }}>
                    {t.settings.autostart}
                  </span>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t.settings.autostartDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label={t.settings.autostart}
                  checked={settings.autostart}
                  onChange={(e) =>
                    updateSettings({ autostart: e.target.checked })
                  }
                  style={{ accentColor: "var(--accent)" }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                <div>
                  <span style={{ fontWeight: 500 }}>
                    {t.settings.soundEnabled}
                  </span>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t.settings.soundEnabledDesc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  aria-label={t.settings.soundEnabled}
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    updateSettings({ soundEnabled: e.target.checked })
                  }
                  style={{ accentColor: "var(--accent)" }}
                />
              </label>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              transition={resolveTransition("soft", prefersReduced)}
              onClick={() =>
                triggerSimulation(model.id, colorId, "connected")
              }
              style={{
                padding: "10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#ffffff",
                background: "var(--accent)",
                border: "none",
                borderRadius: "var(--radius-control)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              {t.settings.simulateTest}
            </motion.button>

            <div
              className="airpop-control"
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--radius-control)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  {t.settings.about}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--surface)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t.settings.version}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--ok)",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--ok)",
                  }}
                >
                  {t.settings.privacyLocal}
                </span>
              </div>
              <p
                style={{
                  fontSize: "10px",
                  lineHeight: "1.4",
                  color: "var(--text-secondary)",
                }}
              >
                {t.settings.privacyLocalDesc}
              </p>
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--text-secondary)",
                  borderTop: "1px solid var(--surface-border)",
                  paddingTop: "var(--space-1)",
                }}
              >
                ✓ {t.settings.termsAccepted}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (!eulaText) {
                    void invokeCommand<string>(IPC_COMMANDS.GET_EULA_TEXT)
                      .then((text) => setEulaText(text ?? ""))
                      .catch(() => {});
                  }
                  setShowEula(true);
                }}
                className="airpop-control"
                style={{
                  marginTop: "var(--space-1)",
                  padding: "6px var(--space-2)",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--accent)",
                  background: "transparent",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "var(--radius-control)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  textAlign: "center",
                }}
              >
                {t.settings.viewTerms}
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(t.settings.uninstallConfirm)) {
                    try {
                      await invokeCommand<void>(IPC_COMMANDS.UNINSTALL_APP);
                    } catch {}
                  }
                }}
                style={{
                  padding: "6px var(--space-2)",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--danger)",
                  background: "rgba(255, 69, 58, 0.08)",
                  border: "1px solid rgba(255, 69, 58, 0.2)",
                  borderRadius: "var(--radius-control)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  textAlign: "center",
                }}
              >
                {t.settings.uninstallApp}
              </button>
            </div>
          </div>
        )}
      </div>

      {showEula && (
        <motion.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={resolveTransition("soft", prefersReduced)}
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--surface)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid var(--surface-border)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            padding: "var(--space-3)",
            boxSizing: "border-box",
            borderRadius: "var(--radius-card)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-2)",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
              {t.installer.eulaTitle}
            </span>
            <button
              type="button"
              onClick={() => setShowEula(false)}
              aria-label={t.settings.closeTerms}
              className="airpop-window-btn"
              style={{
                width: "24px",
                height: "24px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <CloseIcon size={11} />
            </button>
          </div>
          <div
            tabIndex={0}
            role="region"
            aria-label={t.installer.eulaTitle}
            className="airpop-control"
            style={{
              flex: 1,
              padding: "var(--space-3)",
              borderRadius: "var(--radius-control)",
              fontSize: "11px",
              lineHeight: 1.45,
              color: "var(--text-secondary)",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-mono, monospace)",
              background: "var(--surface-elevated)",
              border: "1px solid var(--surface-border)",
            }}
          >
            {eulaText || "Cargando términos..."}
          </div>
          <button
            type="button"
            onClick={() => setShowEula(false)}
            style={{
              marginTop: "var(--space-2)",
              padding: "8px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#ffffff",
              background: "var(--accent)",
              border: "none",
              borderRadius: "var(--radius-control)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            {t.settings.closeTerms}
          </button>
        </motion.div>
      )}
    </div>
  );
};

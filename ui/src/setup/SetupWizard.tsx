import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getTranslation, SupportedLanguage } from "../shared/i18n";
import { CloseIcon } from "../shared/icons";
import { invokeCommand, IPC_COMMANDS } from "../shared/ipc";
import { resolveTransition } from "../shared/spring";
import { useAirPopStore } from "../shared/store";

export const SetupWizard: React.FC = () => {
  const { language, setLanguage } = useAirPopStore();
  const prefersReduced = useReducedMotion() ?? false;
  const t = getTranslation(language);

  const [eulaText, setEulaText] = useState<string>("");
  const [accepted, setAccepted] = useState<boolean>(false);
  const [autostart, setAutostart] = useState<boolean>(true);
  const [desktopShortcut, setDesktopShortcut] = useState<boolean>(true);
  const [startMenuShortcut, setStartMenuShortcut] = useState<boolean>(true);
  const [status, setStatus] = useState<"idle" | "installing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    void invokeCommand<string>(IPC_COMMANDS.GET_EULA_TEXT)
      .then((text) => setEulaText(text ?? ""))
      .catch(() => {
        setEulaText(
          "AirPop EULA & Privacy Policy\n\n1. 100% Local Processing\n2. Zero Telemetry & Zero Data Collection\n3. MIT License"
        );
      });
  }, []);

  const handleInstall = async () => {
    if (!accepted || status === "installing") return;
    setStatus("installing");
    setErrorMessage("");

    try {
      await invokeCommand<void>(IPC_COMMANDS.INSTALL_APP, {
        autostart,
        desktopShortcut,
        startMenuShortcut,
      });
      setTimeout(() => {
        setStatus("success");
      }, 700);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(typeof err === "string" ? err : "Installation failed");
    }
  };

  const handleLaunch = async () => {
    try {
      await invokeCommand<void>(IPC_COMMANDS.LAUNCH_INSTALLED_APP);
    } catch {
      await handleClose();
    }
  };

  const handleClose = async () => {
    try {
      const win = getCurrentWindow();
      await win.close();
    } catch {
      window.close();
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-3)",
        boxSizing: "border-box",
        background: "transparent",
        fontFamily: "var(--font-sans)",
        userSelect: "none",
      }}
    >
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={resolveTransition("soft", prefersReduced)}
        className="airpop-flyout-card"
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "640px",
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--radius-card)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          data-tauri-drag-region
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-3) var(--space-4)",
            borderBottom: "1px solid var(--surface-border)",
            background: "var(--surface-elevated)",
            cursor: "grab",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", pointerEvents: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
            </svg>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              {t.appName}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(0, 113, 227, 0.16)",
                color: "var(--accent)",
              }}
            >
              v1.2.0
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <select
              value={language}
              aria-label="Language"
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
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
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>

            <button
              type="button"
              onClick={handleClose}
              aria-label={t.installer.close}
              className="airpop-window-btn"
              style={{
                width: "26px",
                height: "26px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <CloseIcon size={12} />
            </button>
          </div>
        </div>

        {status === "success" ? (
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={resolveTransition("soft", prefersReduced)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-5)",
              textAlign: "center",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "rgba(52, 199, 89, 0.16)",
                border: "1px solid rgba(52, 199, 89, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ok)",
                fontSize: "32px",
                boxShadow: "0 8px 24px rgba(52, 199, 89, 0.25)",
              }}
            >
              ✓
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              {t.installer.successTitle}
            </h2>

            <p style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--text-secondary)", maxWidth: "360px", margin: 0 }}>
              {t.installer.successMessage}
            </p>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={resolveTransition("enter", prefersReduced)}
              onClick={handleLaunch}
              style={{
                marginTop: "var(--space-4)",
                padding: "12px 28px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                background: "var(--accent)",
                border: "none",
                borderRadius: "var(--radius-pill)",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(0, 113, 227, 0.35)",
              }}
            >
              {t.installer.launchNow}
            </motion.button>
          </motion.div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "var(--space-4)",
              gap: "var(--space-3)",
              overflowY: "auto",
            }}
          >
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                {t.installer.title}
              </h1>
              <p style={{ fontSize: "12px", margin: 0, color: "var(--text-secondary)" }}>
                {t.installer.subtitle}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-2)",
              }}
            >
              <div
                className="airpop-control"
                style={{
                  padding: "8px var(--space-3)",
                  borderRadius: "var(--radius-control)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <span style={{ color: "var(--ok)", fontSize: "14px" }}>🛡️</span>
                <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-primary)" }}>
                  {t.installer.localGuarantee}
                </span>
              </div>
              <div
                className="airpop-control"
                style={{
                  padding: "8px var(--space-3)",
                  borderRadius: "var(--radius-control)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <span style={{ color: "var(--accent)", fontSize: "14px" }}>🔒</span>
                <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-primary)" }}>
                  {t.installer.noTelemetry}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1, minHeight: "140px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
                {t.installer.eulaTitle}
              </span>
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
                  maxHeight: "150px",
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                {eulaText || t.installer.eulaLoading}
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  marginTop: "4px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  aria-label={t.installer.acceptCheckbox}
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  style={{ accentColor: "var(--accent)", cursor: "pointer" }}
                />
                <span style={{ fontSize: "12px", fontWeight: 600, color: accepted ? "var(--ok)" : "var(--text-primary)" }}>
                  {t.installer.acceptCheckbox}
                </span>
              </label>
            </div>

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
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
                {t.installer.optionsTitle}
              </span>

              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                  {t.installer.autostart}
                </span>
                <input
                  type="checkbox"
                  checked={autostart}
                  onChange={(e) => setAutostart(e.target.checked)}
                  style={{ accentColor: "var(--accent)" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                  {t.installer.desktopShortcut}
                </span>
                <input
                  type="checkbox"
                  checked={desktopShortcut}
                  onChange={(e) => setDesktopShortcut(e.target.checked)}
                  style={{ accentColor: "var(--accent)" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                  {t.installer.startMenuShortcut}
                </span>
                <input
                  type="checkbox"
                  checked={startMenuShortcut}
                  onChange={(e) => setStartMenuShortcut(e.target.checked)}
                  style={{ accentColor: "var(--accent)" }}
                />
              </label>
            </div>

            {status === "error" && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-control)",
                  background: "rgba(255, 69, 58, 0.15)",
                  color: "var(--danger)",
                  fontSize: "11px",
                }}
              >
                {errorMessage}
              </div>
            )}

            <div style={{ marginTop: "auto" }}>
              <motion.button
                type="button"
                whileHover={accepted ? { scale: 1.01 } : {}}
                whileTap={accepted ? { scale: 0.99 } : {}}
                transition={resolveTransition("enter", prefersReduced)}
                disabled={!accepted || status === "installing"}
                onClick={handleInstall}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: accepted ? "var(--accent)" : "var(--surface-elevated)",
                  color: accepted ? "#ffffff" : "var(--text-secondary)",
                  opacity: accepted ? 1 : 0.7,
                  border: accepted ? "none" : "1px solid var(--surface-border)",
                  borderRadius: "var(--radius-pill)",
                  cursor: accepted ? "pointer" : "not-allowed",
                  fontFamily: "var(--font-sans)",
                  boxShadow: accepted ? "0 4px 16px rgba(0, 113, 227, 0.3)" : "none",
                }}
              >
                {status === "installing" ? t.installer.installing : t.installer.installButton}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getTranslation } from "../shared/i18n";
import { EarbudsGlyphIcon, HeadbandGlyphIcon } from "../shared/icons";
import { resolveTransition } from "../shared/spring";
import {
  findCatalogModel,
  resolveAccentHex,
  resolveColorHex,
  useAirPopStore,
} from "../shared/store";
import { BatteryRing } from "./BatteryRing";
import { Scene } from "./Scene";

export const Popup: React.FC = () => {
  const {
    models,
    popupMode,
    modelId,
    deviceName,
    colorId,
    battery,
    charging,
    listeningMode,
    isHovered,
    language,
    setHovered,
    dismissPopup,
    applyConnected,
  } = useAirPopStore();

  const prefersReducedMotion = Boolean(useReducedMotion());
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const t = getTranslation(language);

  const model = findCatalogModel(models, modelId);
  const colorHex = resolveColorHex(model, colorId);
  const accentHex = resolveAccentHex(model, colorId);
  const isOverEar = model.kind === "over-ear";
  const minLevel = [battery.left, battery.right, battery.case]
    .filter((v): v is number => v !== null)
    .reduce((acc, v) => Math.min(acc, v), 100);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissPopup();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismissPopup]);

  useEffect(() => {
    if (popupMode === "hidden" || isHovered) {
      return;
    }
    const timeoutMs = popupMode === "proximity" ? 3500 : 3000;
    const timer = window.setTimeout(() => {
      dismissPopup();
    }, timeoutMs);
    return () => window.clearTimeout(timer);
  }, [popupMode, isHovered, dismissPopup]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointer({ x: nx, y: ny });
  };

  const listeningLabel =
    listeningMode === "noise-cancellation"
      ? t.modes.noiseCancellation
      : listeningMode === "transparency"
      ? t.modes.transparency
      : listeningMode === "adaptive"
      ? t.modes.adaptive
      : t.modes.off;

  return (
    <div
      aria-live="polite"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "var(--space-5)",
      }}
    >
      <AnimatePresence>
        {popupMode === "proximity" && (
          <motion.div
            key="popup-proximity"
            role="dialog"
            aria-label={`${deviceName} ${t.status.caseOpen}`}
            className="airpop-popup-card"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
              setHovered(false);
              setPointer({ x: 0, y: 0 });
            }}
            onMouseMove={handleMouseMove}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 36, scale: 0.96 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 18, scale: 0.96 }
            }
            transition={resolveTransition("enter", prefersReducedMotion)}
            style={{
              width: "364px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <div
              className="airpop-control"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-1) var(--space-3)",
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-pill)",
              }}
            >
              {isOverEar ? (
                <HeadbandGlyphIcon size={14} />
              ) : (
                <EarbudsGlyphIcon size={14} />
              )}
              <span>
                {isOverEar ? t.formFactor.overEar : t.formFactor.inEar}
              </span>
            </div>

            <Scene
              modelId={model.id}
              kind={model.kind}
              silhouette={model.silhouette}
              colorHex={colorHex}
              accentHex={accentHex}
              lidOpen={true}
              lowBattery={minLevel < 20}
              pointerX={pointer.x}
              pointerY={pointer.y}
              reducedMotion={prefersReducedMotion}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                ...resolveTransition("soft", prefersReducedMotion),
                delay: prefersReducedMotion ? 0 : 0.35,
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-4)",
                width: "100%",
              }}
            >
              <h2
                style={{
                  fontSize: "19px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  textAlign: "center",
                }}
              >
                {deviceName}
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "var(--space-5)",
                  width: "100%",
                }}
              >
                {isOverEar ? (
                  <BatteryRing
                    label={t.battery.headband}
                    percentage={battery.left ?? battery.right}
                    charging={charging.left || charging.right}
                  />
                ) : (
                  <>
                    <BatteryRing
                      label={t.battery.left}
                      percentage={battery.left}
                      charging={charging.left}
                    />
                    <BatteryRing
                      label={t.battery.right}
                      percentage={battery.right}
                      charging={charging.right}
                    />
                    <BatteryRing
                      label={t.battery.case}
                      percentage={battery.case}
                      charging={charging.case}
                    />
                  </>
                )}
              </div>

              <button
                type="button"
                className="airpop-pill-button"
                onClick={() =>
                  applyConnected({
                    name: deviceName,
                    modelId: model.id,
                    color: colorId,
                    battery,
                    listeningMode,
                    aapSupported: true,
                  })
                }
              >
                {t.status.connected.startsWith("C") ? "Conectar" : "Connect"}
              </button>
            </motion.div>
          </motion.div>
        )}

        {popupMode === "connected" && (
          <motion.div
            key="popup-connected"
            role="status"
            aria-label={`${deviceName} ${t.status.connected}`}
            className="airpop-compact-pill"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 24, scale: 0.96 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.96 }
            }
            transition={resolveTransition("enter", prefersReducedMotion)}
            style={{
              width: "348px",
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
                gap: "var(--space-3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--ok)",
                    display: "inline-block",
                  }}
                />
                {isOverEar ? (
                  <HeadbandGlyphIcon size={16} />
                ) : (
                  <EarbudsGlyphIcon size={16} />
                )}
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {deviceName}
                </span>
              </div>

              <span
                className="airpop-control"
                style={{
                  padding: "var(--space-1) var(--space-3)",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                {listeningLabel}
              </span>
            </div>

            <div
              className="airpop-tabular"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              {isOverEar ? (
                <span>
                  {t.battery.headband} {battery.left ?? battery.right ?? "—"}%
                </span>
              ) : (
                <>
                  <span>
                    {t.battery.left} {battery.left ?? "—"}%
                  </span>
                  <span>
                    {t.battery.right} {battery.right ?? "—"}%
                  </span>
                  <span>
                    {t.battery.case} {battery.case ?? "—"}%
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

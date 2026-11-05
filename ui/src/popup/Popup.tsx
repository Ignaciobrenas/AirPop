import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { resolveTransition } from "../shared/spring";
import {
  findCatalogModel,
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
    setHovered,
    dismissPopup,
    applyConnected,
  } = useAirPopStore();

  const prefersReducedMotion = Boolean(useReducedMotion());
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const model = findCatalogModel(models, modelId);
  const colorHex = resolveColorHex(model, colorId);
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
      ? "ANC"
      : listeningMode === "transparency"
      ? "Transparencia"
      : listeningMode === "adaptive"
      ? "Adaptativo"
      : "Desactivado";

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
      <AnimatePresence mode="wait">
        {popupMode === "proximity" && (
          <motion.div
            key="popup-proximity"
            role="dialog"
            aria-label={`Auriculares ${deviceName} cerca`}
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
              width: "356px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-4)",
            }}
          >
            <Scene
              modelId={model.id}
              kind={model.kind}
              colorHex={colorHex}
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
                delay: prefersReducedMotion ? 0 : 0.8,
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
                <BatteryRing
                  label="L"
                  percentage={battery.left}
                  charging={charging.left}
                />
                <BatteryRing
                  label="R"
                  percentage={battery.right}
                  charging={charging.right}
                />
                <BatteryRing
                  label="Caja"
                  percentage={battery.case}
                  charging={charging.case}
                />
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
                Conectar
              </button>
            </motion.div>
          </motion.div>
        )}

        {popupMode === "connected" && (
          <motion.div
            key="popup-connected"
            role="status"
            aria-label={`${deviceName} conectado`}
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
              width: "340px",
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
              <span>L {battery.left ?? "—"}%</span>
              <span>R {battery.right ?? "—"}%</span>
              <span>Caja {battery.case ?? "—"}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

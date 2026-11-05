import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AdaptiveModeIcon,
  NoiseCancellationIcon,
  OffModeIcon,
  TransparencyModeIcon,
} from "../shared/icons";
import { ListeningMode } from "../shared/ipc";
import { resolveTransition } from "../shared/spring";

export interface ModeSelectorProps {
  supportedModes: ListeningMode[];
  activeMode: ListeningMode;
  aapSupported: boolean;
  onSelect: (mode: ListeningMode) => void;
}

const MODE_LABELS: Record<ListeningMode, string> = {
  "noise-cancellation": "Cancelación",
  transparency: "Transparencia",
  adaptive: "Adaptativo",
  off: "Desactivado",
};

const ModeIcon: React.FC<{ mode: ListeningMode }> = ({ mode }) => {
  if (mode === "noise-cancellation") {
    return <NoiseCancellationIcon />;
  }
  if (mode === "transparency") {
    return <TransparencyModeIcon />;
  }
  if (mode === "adaptive") {
    return <AdaptiveModeIcon />;
  }
  return <OffModeIcon />;
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  supportedModes,
  activeMode,
  aapSupported,
  onSelect,
}) => {
  const prefersReducedMotion = Boolean(useReducedMotion());

  if (!aapSupported || supportedModes.length === 0) {
    return null;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Modo de escucha"
      className="airpop-control"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${supportedModes.length}, minmax(0, 1fr))`,
        padding: "var(--space-1)",
        gap: "var(--space-1)",
        width: "100%",
      }}
    >
      {supportedModes.map((mode) => {
        const selected = mode === activeMode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(mode)}
            style={{
              position: "relative",
              border: "none",
              background: "transparent",
              padding: "var(--space-2) var(--space-1)",
              borderRadius: "var(--radius-control)",
              cursor: "pointer",
              color: selected ? "#ffffff" : "var(--text-primary)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-1)",
              fontFamily: "var(--font-sans)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            {selected && (
              <motion.div
                layoutId="active-listening-mode-pill"
                transition={resolveTransition("soft", prefersReducedMotion)}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "var(--radius-control)",
                  background: "var(--accent)",
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>
              <ModeIcon mode={mode} />
            </span>
            <span style={{ position: "relative", zIndex: 1 }}>
              {MODE_LABELS[mode]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
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
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          cx="10"
          cy="12"
          r="5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M17.5 8.5C19 10 19 14 17.5 15.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M16 7L21 17"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (mode === "transparency") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          cx="9.5"
          cy="12"
          r="4.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M16.5 8.5C18.2 10.2 18.2 13.8 16.5 15.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M19.5 6.5C22 9.5 22 14.5 19.5 17.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (mode === "adaptive") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="adaptiveWave" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--ok)" />
          </linearGradient>
        </defs>
        <path
          d="M4 12V10M8 15V9M12 18V6M16 15V9M20 13V11"
          stroke="url(#adaptiveWave)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
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

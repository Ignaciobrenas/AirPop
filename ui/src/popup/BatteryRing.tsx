import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { resolveTransition } from "../shared/spring";

export interface BatteryRingProps {
  label: string;
  percentage: number | null;
  charging?: boolean;
  size?: number;
}

export function getBatteryColorToken(percentage: number | null): string {
  if (percentage === null) {
    return "var(--text-secondary)";
  }
  if (percentage < 15) {
    return "var(--danger)";
  }
  if (percentage <= 30) {
    return "var(--warn)";
  }
  return "var(--ok)";
}

export const BatteryRing: React.FC<BatteryRingProps> = ({
  label,
  percentage,
  charging = false,
  size = 54,
}) => {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = percentage === null ? 0 : Math.max(0, Math.min(100, percentage));
  const dashOffset = circumference - (clamped / 100) * circumference;
  const ringColor = getBatteryColorToken(percentage);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-1)",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label={`${label}: ${percentage ?? "desconocido"}%`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-border)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={resolveTransition("soft", prefersReducedMotion)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
          }}
        >
          <span
            className="airpop-tabular"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {percentage === null ? "—" : `${clamped}`}
          </span>
          {charging && (
            <svg
              width="11"
              height="13"
              viewBox="0 0 12 14"
              fill="none"
              aria-label="Cargando"
            >
              <path
                d="M7 1L2 8H6L5 13L10 6H6L7 1Z"
                stroke="var(--ok)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="var(--ok)"
              />
            </svg>
          )}
        </div>
      </div>

      <span
        style={{
          fontSize: "11px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </span>
    </div>
  );
};

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getTranslation } from "../shared/i18n";
import { resolveTransition } from "../shared/spring";
import { useAirPopStore } from "../shared/store";

const BANDS = [
  { freq: 31, label: "31" },
  { freq: 62, label: "62" },
  { freq: 125, label: "125" },
  { freq: 250, label: "250" },
  { freq: 500, label: "500" },
  { freq: 1000, label: "1k" },
  { freq: 2000, label: "2k" },
  { freq: 4000, label: "4k" },
  { freq: 8000, label: "8k" },
  { freq: 16000, label: "16k" },
];

const PRESET_KEY_MAP: Record<string, string> = {
  flat: "plano",
  "bass-boost": "graves_plus",
  "bass-reducer": "graves_minus",
  "treble-boost": "agudos_plus",
  vocal: "voces",
  podcast: "podcast",
  rock: "rock",
  pop: "pop",
  "hip-hop": "hiphop",
  electronic: "electronica",
  jazz: "jazz",
  classical: "clasica",
  acoustic: "acustica",
  loudness: "loudness",
  gaming: "gaming",
  night: "nocturno",
};

export const Equalizer: React.FC = () => {
  const {
    language,
    eqProfile,
    eqPresets,
    apoStatus,
    setEqGain,
    applyEqPreset,
    toggleEq,
    resetEq,
    syncApo,
  } = useAirPopStore();

  const prefersReduced = useReducedMotion() ?? false;
  const t = getTranslation(language);

  const maxGain = Math.max(0, ...eqProfile.gainsDb);
  const preamp = -maxGain;

  const curvePath = useMemo(() => {
    const width = 296;
    const height = 64;
    const pad = 14;
    const usableW = width - pad * 2;
    const midY = height / 2;
    const step = usableW / (BANDS.length - 1);

    const points = eqProfile.gainsDb.map((g, i) => {
      const x = pad + i * step;
      const y = midY - (g / 12) * (midY - 8);
      return { x, y };
    });

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i != points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const fillD = `${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    return { stroke: d, fill: fillD, points };
  }, [eqProfile.gainsDb]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        height: "100%",
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
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {t.equalizer.title}
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
            }}
          >
            {eqProfile.enabled ? t.equalizer.enabled : t.equalizer.disabled} ·{" "}
            {t.equalizer.preamp}: {preamp.toFixed(1)} dB
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            type="button"
            onClick={resetEq}
            className="airpop-control"
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              borderRadius: "var(--radius-pill)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {t.equalizer.reset}
          </button>
          <button
            type="button"
            onClick={toggleEq}
            style={{
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: 500,
              color: eqProfile.enabled ? "#ffffff" : "var(--text-primary)",
              background: eqProfile.enabled
                ? "var(--accent)"
                : "var(--surface-elevated)",
              border: eqProfile.enabled
                ? "1px solid var(--accent)"
                : "1px solid var(--surface-border)",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            {eqProfile.enabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div
        className="airpop-control"
        style={{
          padding: "var(--space-2)",
          borderRadius: "var(--radius-control)",
          background: "var(--surface-elevated)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 296 64"
          style={{ width: "100%", height: "64px", display: "block" }}
        >
          <defs>
            <linearGradient id="eqFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line
            x1="14"
            y1="32"
            x2="282"
            y2="32"
            stroke="var(--surface-border)"
            strokeDasharray="2 3"
            strokeWidth="1"
          />
          <path d={curvePath.fill} fill="url(#eqFillGrad)" />
          <path
            d={curvePath.stroke}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {curvePath.points.map((pt, i) => (
            <circle
              key={BANDS[i].freq}
              cx={pt.x}
              cy={pt.y}
              r={eqProfile.gainsDb[i] !== 0 ? "3.5" : "2"}
              fill={eqProfile.gainsDb[i] !== 0 ? "var(--accent)" : "var(--text-secondary)"}
            />
          ))}
        </svg>
      </div>

      <div
        className="airpop-control"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: "var(--space-2) var(--space-2) var(--space-1)",
          borderRadius: "var(--radius-control)",
          height: "135px",
        }}
      >
        {BANDS.map((band, i) => {
          const gain = eqProfile.gainsDb[i] ?? 0;
          return (
            <div
              key={band.freq}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: gain !== 0 ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {gain > 0 ? `+${gain}` : gain}
              </span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={gain}
                aria-label={`${band.label} Hz`}
                disabled={!eqProfile.enabled}
                onChange={(e) => setEqGain(i, parseFloat(e.target.value))}
                style={{
                  writingMode: "vertical-lr",
                  direction: "rtl",
                  width: "20px",
                  height: "82px",
                  accentColor: "var(--accent)",
                  cursor: eqProfile.enabled ? "ns-resize" : "default",
                  opacity: eqProfile.enabled ? 1 : 0.45,
                }}
              />
              <span
                style={{
                  fontSize: "9px",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                }}
              >
                {band.label}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            paddingLeft: "2px",
          }}
        >
          {t.equalizer.curveTitle}
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "4px",
            maxHeight: "105px",
            overflowY: "auto",
            paddingRight: "2px",
          }}
        >
          {eqPresets.map((preset) => {
            const isActive = eqProfile.presetId === preset.id;
            const transKey = PRESET_KEY_MAP[preset.id];
            const localizedLabel =
              (transKey &&
                (t.equalizer.presets as Record<string, string>)[transKey]) ||
              preset.label;

            return (
              <motion.button
                key={preset.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                transition={resolveTransition("soft", prefersReduced)}
                onClick={() => applyEqPreset(preset.id)}
                style={{
                  padding: "4px 6px",
                  fontSize: "10px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#ffffff" : "var(--text-primary)",
                  background: isActive
                    ? "var(--accent)"
                    : "var(--surface-elevated)",
                  border: isActive
                    ? "1px solid var(--accent)"
                    : "1px solid var(--surface-border)",
                  borderRadius: "var(--radius-pill)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  textAlign: "center",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {localizedLabel}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-2) var(--space-3)",
          background: "var(--surface-elevated)",
          borderRadius: "var(--radius-control)",
          border: "1px solid var(--surface-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: apoStatus.linked
                ? "var(--ok)"
                : apoStatus.installed
                ? "var(--warn)"
                : "var(--text-secondary)",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-primary)",
            }}
          >
            {apoStatus.linked
              ? t.equalizer.apoLinked
              : apoStatus.installed
              ? t.equalizer.apoDetected
              : t.equalizer.apoNotInstalled}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void syncApo()}
          className="airpop-control"
          style={{
            padding: "3px 8px",
            fontSize: "10px",
            color: "var(--text-primary)",
            cursor: "pointer",
            borderRadius: "var(--radius-pill)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {t.equalizer.apoSync}
        </button>
      </div>
    </div>
  );
};

import React from "react";
import { BatteryRing } from "../popup/BatteryRing";
import { EarbudsGlyphIcon, HeadbandGlyphIcon } from "../shared/icons";
import {
  findCatalogModel,
  resolveColorHex,
  useAirPopStore,
} from "../shared/store";
import { ModeSelector } from "./ModeSelector";

export const Flyout: React.FC = () => {
  const {
    models,
    modelId,
    deviceName,
    colorId,
    battery,
    charging,
    listeningMode,
    aapSupported,
    connected,
    settings,
    setListeningMode,
    updateSettings,
    triggerSimulation,
  } = useAirPopStore();

  const model = findCatalogModel(models, modelId);
  const colorHex = resolveColorHex(model, colorId);
  const isOverEar = model.kind === "over-ear";

  return (
    <div
      className="airpop-flyout-card"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "var(--space-3)",
      }}
    >
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
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {deviceName}
            </h1>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
              }}
            >
              {isOverEar ? "Diadema · Over-Ear" : "In-Ear"} ·{" "}
              {connected ? "Conectado" : "En espera"}
            </p>
          </div>
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
              padding: "var(--space-1) var(--space-2)",
              fontSize: "11px",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName} ({m.kind === "over-ear" ? "Diadema" : "In-Ear"})
              </option>
            ))}
          </select>

          {model.colors.length > 1 && (
            <select
              aria-label="Seleccionar color"
              value={colorId}
              onChange={(e) =>
                triggerSimulation(model.id, e.target.value, "case-open")
              }
              className="airpop-control"
              style={{
                padding: "var(--space-1) var(--space-2)",
                fontSize: "11px",
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
      </div>

      <div
        className="airpop-control"
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "var(--space-3)",
        }}
      >
        {isOverEar ? (
          <BatteryRing
            label="Diadema"
            percentage={battery.left ?? battery.right}
            charging={charging.left || charging.right}
            size={54}
          />
        ) : (
          <>
            <BatteryRing
              label="Izquierdo"
              percentage={battery.left}
              charging={charging.left}
              size={50}
            />
            <BatteryRing
              label="Derecho"
              percentage={battery.right}
              charging={charging.right}
              size={50}
            />
            <BatteryRing
              label="Caja"
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

      <div
        className="airpop-control"
        style={{
          padding: "var(--space-3)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
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
          <span>No molestar</span>
          <input
            type="checkbox"
            checked={settings.doNotDisturb}
            onChange={(e) =>
              updateSettings({ doNotDisturb: e.target.checked })
            }
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
          <span>Modo bajo consumo</span>
          <input
            type="checkbox"
            checked={settings.lowPowerMode}
            onChange={(e) =>
              updateSettings({ lowPowerMode: e.target.checked })
            }
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
          <span>Arranque con Windows</span>
          <input
            type="checkbox"
            checked={settings.autostart}
            onChange={(e) => updateSettings({ autostart: e.target.checked })}
          />
        </label>
      </div>
    </div>
  );
};

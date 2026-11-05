import React from "react";
import { BatteryRing } from "../popup/BatteryRing";
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
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-control)",
              background: colorHex,
              border: "1px solid var(--surface-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "var(--radius-pill)",
                background: connected ? "var(--ok)" : "var(--text-secondary)",
              }}
            />
          </div>

          <div>
            <h1
              style={{
                fontSize: "17px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {deviceName}
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              {connected ? "Conectado" : "En espera de proximidad"}
            </p>
          </div>
        </div>

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
            fontSize: "12px",
            color: "var(--text-primary)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName} ({m.year})
            </option>
          ))}
        </select>
      </div>

      <div
        className="airpop-control"
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "var(--space-3)",
        }}
      >
        <BatteryRing
          label="Izquierdo"
          percentage={battery.left}
          charging={charging.left}
          size={52}
        />
        <BatteryRing
          label="Derecho"
          percentage={battery.right}
          charging={charging.right}
          size={52}
        />
        <BatteryRing
          label="Caja"
          percentage={battery.case}
          charging={charging.case}
          size={52}
        />
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

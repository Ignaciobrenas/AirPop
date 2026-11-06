import { fireEvent, render, screen } from "@testing-library/react";
import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { Flyout } from "../flyout/Flyout";
import { ModeSelector } from "../flyout/ModeSelector";
import { BatteryRing, getBatteryColorToken } from "../popup/BatteryRing";
import { Popup } from "../popup/Popup";
import { disposeObject3D } from "../popup/Scene";
import { resolveTransition, spring } from "../shared/spring";
import { findCatalogModel, useAirPopStore } from "../shared/store";

describe("AirPop Design System, Multi-Brand, EQ & Resource Suite", () => {
  beforeEach(() => {
    useAirPopStore.setState({
      language: "es",
      activeTab: "device",
      popupMode: "proximity",
      modelId: "airpods-pro-3",
      deviceName: "Pro 3",
      colorId: "white",
      battery: { left: 82, right: 80, case: 64 },
      charging: { left: false, right: false, case: false },
      listeningMode: "noise-cancellation",
      aapSupported: true,
      isHovered: false,
      connected: true,
      settings: {
        autostart: false,
        doNotDisturb: false,
        lowPowerMode: false,
        soundEnabled: true,
        popupEnabled: true,
        preferredMonitor: null,
      },
      eqProfile: {
        enabled: false,
        presetId: "flat",
        gainsDb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    });
  });

  it("maps battery percentage thresholds to semantic tokens", () => {
    expect(getBatteryColorToken(85)).toBe("var(--ok)");
    expect(getBatteryColorToken(25)).toBe("var(--warn)");
    expect(getBatteryColorToken(10)).toBe("var(--danger)");
    expect(getBatteryColorToken(null)).toBe("var(--text-secondary)");
  });

  it("respects prefers-reduced-motion in spring transitions", () => {
    expect(resolveTransition("enter", false)).toEqual(spring.enter);
    expect(resolveTransition("enter", true)).toEqual({ duration: 0.15 });
  });

  it("renders BatteryRing with percentage and charging bolt", () => {
    render(<BatteryRing label="L" percentage={55} charging={true} />);
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByLabelText("Cargando")).toBeInTheDocument();
  });

  it("renders Popup in State A (proximity), transitions to State B (connected), and dismisses on Escape", () => {
    render(<Popup />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Pro 3")).toBeInTheDocument();
    expect(screen.getByText("In-Ear")).toBeInTheDocument();

    const connectBtn = screen.getByRole("button", { name: "Conectar" });
    fireEvent.click(connectBtn);

    expect(useAirPopStore.getState().popupMode).toBe("connected");
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Cancelación de ruido")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(useAirPopStore.getState().popupMode).toBe("hidden");
  });

  it("detects and renders Over-Ear (Diadema) headphones for Sony WH-1000XM5 and Bose QC Ultra", () => {
    const models = useAirPopStore.getState().models;
    const xm5 = findCatalogModel(models, "sony-wh-1000xm5");
    expect(xm5.kind).toBe("over-ear");
    expect(xm5.silhouette).toBe("over-ear-sculpted");

    const bose = findCatalogModel(models, "bose-qc-ultra-headphones");
    expect(bose.kind).toBe("over-ear");

    useAirPopStore.getState().triggerSimulation("sony-wh-1000xm5", "black", "case-open");
    render(<Popup />);
    expect(screen.getByText("Sony WH-1000XM5")).toBeInTheDocument();
    expect(screen.getByText("Diadema · Over-Ear")).toBeInTheDocument();
    expect(screen.getByText("Diadema")).toBeInTheDocument();
  });

  it("disposes Three.js geometries and materials cleanly to prevent GPU memory leaks", () => {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial()
    );
    group.add(mesh);
    const disposed = disposeObject3D(group);
    expect(disposed).toBe(2);
  });

  it("hides ModeSelector when AAP is unsupported on Windows or model lacks modes", () => {
    const { container, rerender } = render(
      <ModeSelector
        supportedModes={["noise-cancellation", "transparency"]}
        activeMode="noise-cancellation"
        aapSupported={false}
        onSelect={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();

    rerender(
      <ModeSelector
        supportedModes={["noise-cancellation", "transparency", "adaptive", "off"]}
        activeMode="noise-cancellation"
        aapSupported={true}
        onSelect={() => {}}
      />
    );
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByText("Adaptativo")).toBeInTheDocument();
  });

  it("renders Flyout with device, equalizer and settings tabs", () => {
    render(<Flyout />);
    expect(screen.getByText("Dispositivo")).toBeInTheDocument();
    expect(screen.getByText("Ecualizador")).toBeInTheDocument();
    expect(screen.getByText("Ajustes")).toBeInTheDocument();

    const eqTabBtn = screen.getByRole("button", { name: "Ecualizador" });
    fireEvent.click(eqTabBtn);
    expect(screen.getByText("Curva de respuesta en frecuencia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Graves +" })).toBeInTheDocument();

    const settingsTabBtn = screen.getByRole("button", { name: "Ajustes" });
    fireEvent.click(settingsTabBtn);
    expect(screen.getByText("No molestar")).toBeInTheDocument();
    expect(screen.getByText("Modo bajo consumo")).toBeInTheDocument();

    const dndCheckbox = screen.getByLabelText("No molestar") as HTMLInputElement;
    expect(dndCheckbox.checked).toBe(false);
    fireEvent.click(dndCheckbox);
    expect(useAirPopStore.getState().settings.doNotDisturb).toBe(true);
  });
});

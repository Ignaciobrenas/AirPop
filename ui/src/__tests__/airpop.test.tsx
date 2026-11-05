import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Flyout } from "../flyout/Flyout";
import { ModeSelector } from "../flyout/ModeSelector";
import { BatteryRing, getBatteryColorToken } from "../popup/BatteryRing";
import { Popup } from "../popup/Popup";
import { resolveTransition, spring } from "../shared/spring";
import { useAirPopStore } from "../shared/store";

describe("AirPop Design System & UI Suite", () => {
  beforeEach(() => {
    useAirPopStore.setState({
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
    render(
      <BatteryRing label="L" percentage={55} charging={true} />
    );
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByLabelText("Cargando")).toBeInTheDocument();
  });

  it("renders Popup in State A (proximity), transitions to State B (connected), and dismisses on Escape", () => {
    render(<Popup />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Pro 3")).toBeInTheDocument();

    const connectBtn = screen.getByRole("button", { name: "Conectar" });
    fireEvent.click(connectBtn);

    expect(useAirPopStore.getState().popupMode).toBe("connected");
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("ANC")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(useAirPopStore.getState().popupMode).toBe("hidden");
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

  it("renders Flyout with battery rings, model selector and settings", () => {
    render(<Flyout />);
    expect(screen.getByText("No molestar")).toBeInTheDocument();
    expect(screen.getByText("Modo bajo consumo")).toBeInTheDocument();

    const dndCheckbox = screen.getByLabelText("No molestar") as HTMLInputElement;
    expect(dndCheckbox.checked).toBe(false);
    fireEvent.click(dndCheckbox);
    expect(useAirPopStore.getState().settings.doNotDisturb).toBe(true);
  });
});

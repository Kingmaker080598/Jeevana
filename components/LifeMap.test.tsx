import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "./LanguageProvider";
import { LIFE_MAP_STORAGE_KEY, LifeMap } from "./LifeMap";

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

function renderMap() {
  return render(<LanguageProvider><LifeMap today={new Date("2026-09-05T12:00:00Z")} /></LanguageProvider>);
}

describe("LifeMap", () => {
  it("starts empty and loads the exact sample family", () => {
    renderMap();
    expect(screen.getByRole("heading", { name: "Map the household once" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try a sample family" }));
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tab", { name: /Sravani/ })).toBeInTheDocument();
    expect(window.localStorage.getItem(LIFE_MAP_STORAGE_KEY)).toContain("Sravani");
  });

  it("cycles papers through have, missing and not sure", () => {
    renderMap();
    fireEvent.click(screen.getByRole("button", { name: "Try a sample family" }));
    fireEvent.click(screen.getByRole("tab", { name: /Sravani/ }));
    const birth = screen.getByRole("button", { name: /Birth certificate.*have/i });
    fireEvent.click(birth);
    expect(screen.getByRole("button", { name: /Birth certificate.*missing/i })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: /Birth certificate.*missing/i }));
    expect(screen.getByRole("button", { name: /Birth certificate.*not sure/i })).toBeInTheDocument();
  });

  it("renders an ordered accessible map and a bilingual path card", () => {
    renderMap();
    fireEvent.click(screen.getByRole("button", { name: "Try a sample family" }));
    fireEvent.click(screen.getByRole("tab", { name: /Sravani/ }));
    expect(within(screen.getByRole("region", { name: "Sravani's life map" })).getAllByRole("listitem")).toHaveLength(16);
    expect(screen.getByLabelText("Printable path card")).toHaveTextContent("మార్గ కార్డు");
    expect(screen.getByRole("button", { name: /Print this card/ })).toBeInTheDocument();
  });

  it("clears stored household after confirmation", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderMap();
    fireEvent.click(screen.getByRole("button", { name: "Try a sample family" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear household" }));
    expect(screen.getByRole("heading", { name: "Map the household once" })).toBeInTheDocument();
    expect(window.localStorage.getItem(LIFE_MAP_STORAGE_KEY)).toBeNull();
  });

  it("renders a read-only sample without storage controls", () => {
    render(<LanguageProvider><LifeMap readOnly compact today={new Date("2026-09-05T12:00:00Z")} /></LanguageProvider>);
    expect(screen.getByRole("region", { name: "Sravani's life map" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear household" })).not.toBeInTheDocument();
  });
});

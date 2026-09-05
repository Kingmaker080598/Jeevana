import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "./LanguageProvider";
import { LifeMapPage } from "./LifeMapPage";

afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("LifeMapPage", () => {
  it("shows privacy and first-draft concept notices", () => {
    render(<LanguageProvider><LifeMapPage /></LanguageProvider>);
    expect(screen.getByRole("note")).toHaveTextContent("Preview — dependency data across the 13 planned stages is a first draft. Confirm at the office.");
    expect(screen.getByText(/Nothing leaves this browser/)).toBeInTheDocument();
  });

  it("follows the Telugu language toggle", () => {
    function Toggle() {
      const { toggleLanguage } = useLanguage();
      return <button onClick={toggleLanguage}>Toggle Telugu</button>;
    }
    vi.stubEnv("NEXT_PUBLIC_ENABLE_TE", "true");
    render(<LanguageProvider><Toggle /><LifeMapPage /></LanguageProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Toggle Telugu" }));
    expect(screen.getByRole("heading", { level: 1, name: "కుటుంబ జీవన పటం" })).toBeInTheDocument();
    expect(screen.getByText(/ఈ బ్రౌజర్‌ను దాటి ఏ సమాచారం వెళ్లదు/)).toBeInTheDocument();
  });
});

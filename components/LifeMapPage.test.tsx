import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "./LanguageProvider";
import { LifeMapPage } from "./LifeMapPage";

afterEach(cleanup);

describe("LifeMapPage", () => {
  it("shows privacy and first-draft concept notices", () => {
    render(<LanguageProvider><LifeMapPage /></LanguageProvider>);
    expect(screen.getByRole("note")).toHaveTextContent("Preview — dependency data across the 13 planned stages is a first draft. Confirm at the office.");
    expect(screen.getByText(/Nothing leaves this browser/)).toBeInTheDocument();
  });
});

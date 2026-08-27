import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadJourneys } from "@/lib/journey/loadJourneys";
import { STORAGE_KEY } from "@/lib/state/journeyState";
import { JourneyRoadmapLayout } from "./JourneyRoadmapLayout";
import { JourneyStateProvider } from "./JourneyStateProvider";
import { LanguageProvider } from "./LanguageProvider";

const { pathname } = vi.hoisted(() => ({
  pathname: "/journey/birth/step/get-certificate-copy",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

const birth = loadJourneys().find(({ id }) => id === "birth")!;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("JourneyRoadmapLayout", () => {
  it("renders a deep-linked active step with persistent navigation and blockers", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        selectedJourneyId: "birth",
        journeys: {
          birth: {
            answers: { "birth-timing": "after-one-year", gender: "boy" },
            completedStepIds: ["late-register-birth"],
          },
        },
      }),
    );

    render(
      <LanguageProvider>
        <JourneyStateProvider>
          <JourneyRoadmapLayout journey={birth}>
            <p>Selected detail</p>
          </JourneyRoadmapLayout>
        </JourneyStateProvider>
      </LanguageProvider>,
    );

    expect(await screen.findByText("Selected detail")).toBeInTheDocument();
    screen.getAllByRole("link", { name: /Download the birth certificate/ }).forEach(
      (link) => expect(link).toHaveAttribute("aria-current", "step"),
    );
    screen.getAllByRole("link", { name: /Change answers/ }).forEach((link) =>
      expect(link).toHaveAttribute("href", "/journey/birth?edit=1"),
    );
    expect(screen.getByText("Step 2 of 6")).toBeInTheDocument();
    expect(screen.getByText("All steps")).toBeInTheDocument();
    expect(screen.getAllByText(/Blocked by Download the birth certificate/).length).toBeGreaterThan(0);
  });
});

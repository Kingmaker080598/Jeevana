import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadJourneys } from "@/lib/journey/loadJourneys";
import { STORAGE_KEY } from "@/lib/state/journeyState";
import { JourneyStateProvider } from "./JourneyStateProvider";
import { LanguageProvider } from "./LanguageProvider";
import { StepDetail } from "./StepDetail";

const death = loadJourneys().find(({ id }) => id === "death")!;
const insurance = death.steps.find(({ id }) => id === "insurance-claim")!;
const deathCertificate = death.steps.find(({ id }) => id === "death-certificate")!;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllEnvs();
});

describe("StepDetail", () => {
  it("shows service details and marks an unlocked step done", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_FUTURE_SECTIONS", "true");
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        selectedJourneyId: "death",
        journeys: {
          death: {
            answers: { "nominee-registered": "yes" },
            completedStepIds: ["register-death", "death-certificate"],
          },
        },
      }),
    );
    render(
      <LanguageProvider>
        <JourneyStateProvider>
          <StepDetail journey={death} step={insurance} />
        </JourneyStateProvider>
      </LanguageProvider>,
    );

    expect(await screen.findByRole("heading", { name: "LIC/insurance claim intimation" })).toBeInTheDocument();
    expect(screen.getByText("LIC/insurance provider")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nearest office" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Letter generator" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Mark incomplete" })).toBeInTheDocument(),
    );
  });

  it("hides reserved future sections by default", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        selectedJourneyId: "death",
        journeys: {
          death: {
            answers: { "nominee-registered": "yes" },
            completedStepIds: ["register-death", "death-certificate"],
          },
        },
      }),
    );
    render(
      <LanguageProvider>
        <JourneyStateProvider>
          <StepDetail journey={death} step={insurance} />
        </JourneyStateProvider>
      </LanguageProvider>,
    );

    expect(await screen.findByRole("heading", { name: "LIC/insurance claim intimation" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Nearest office" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Letter generator" })).not.toBeInTheDocument();
  });

  it("does not allow a blocked stored completion to be toggled", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        selectedJourneyId: "death",
        journeys: {
          death: {
            answers: { "nominee-registered": "yes" },
            completedStepIds: ["death-certificate"],
          },
        },
      }),
    );

    render(
      <LanguageProvider>
        <JourneyStateProvider>
          <StepDetail journey={death} step={deathCertificate} />
        </JourneyStateProvider>
      </LanguageProvider>,
    );

    expect(await screen.findByText(/Complete first: Register the death/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mark/ })).not.toBeInTheDocument();
  });
});

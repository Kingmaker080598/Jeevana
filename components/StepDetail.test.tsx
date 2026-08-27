import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadJourneys } from "@/lib/journey/loadJourneys";
import { STORAGE_KEY } from "@/lib/state/journeyState";
import { JourneyStateProvider } from "./JourneyStateProvider";
import { LanguageProvider } from "./LanguageProvider";
import { StepDetail } from "./StepDetail";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const death = loadJourneys().find(({ id }) => id === "death")!;
const insurance = death.steps.find(({ id }) => id === "insurance-claim")!;

afterEach(() => {
  cleanup();
  push.mockReset();
  window.localStorage.clear();
});

describe("StepDetail", () => {
  it("shows service details and marks an unlocked step done", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
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
    await waitFor(() => expect(push).toHaveBeenCalledWith("/journey/death"));
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadJourneys } from "@/lib/journey/loadJourneys";
import { STORAGE_KEY } from "@/lib/state/journeyState";
import { JourneyFlow } from "./JourneyFlow";
import { JourneyStateProvider } from "./JourneyStateProvider";
import { LanguageProvider } from "./LanguageProvider";

const birth = loadJourneys().find(({ id }) => id === "birth")!;
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

afterEach(() => {
  cleanup();
  replace.mockReset();
  window.localStorage.clear();
});

function renderFlow() {
  return render(
    <LanguageProvider>
      <JourneyStateProvider>
        <JourneyFlow journey={birth} />
      </JourneyStateProvider>
    </LanguageProvider>,
  );
}

describe("JourneyFlow", () => {
  it("collects intake one question at a time and redirects to the first incomplete step", async () => {
    renderFlow();

    expect(await screen.findByRole("heading", { name: "When was the baby born?" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "What is the baby's gender?" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /More than 1 year ago/ }));
    expect(screen.getByRole("heading", { name: "What is the baby's gender?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Boy/ }));

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
      "/journey/birth/step/late-register-birth",
      ),
    );
  });

  it("reloads completed intake directly at the first incomplete roadmap step", async () => {
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
    renderFlow();

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/journey/birth/step/get-certificate-copy",
      ),
    );
  });

  it("preselects stored answers when changing intake", async () => {
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
          <JourneyFlow journey={birth} forceEdit />
        </JourneyStateProvider>
      </LanguageProvider>,
    );

    expect(await screen.findByRole("button", { name: /More than 1 year ago/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("uses the Telugu question as the accessible name in Telugu mode", async () => {
    window.localStorage.setItem("jeevana:language:v1", "te");
    renderFlow();

    expect(await screen.findByRole("heading", { name: "బిడ్డ ఎప్పుడు పుట్టింది?" })).toBeInTheDocument();
  });
});

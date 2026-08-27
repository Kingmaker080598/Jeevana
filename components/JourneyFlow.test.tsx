import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { loadJourneys } from "@/lib/journey/loadJourneys";
import { STORAGE_KEY } from "@/lib/state/journeyState";
import { JourneyFlow } from "./JourneyFlow";
import { JourneyStateProvider } from "./JourneyStateProvider";
import { LanguageProvider } from "./LanguageProvider";

const birth = loadJourneys().find(({ id }) => id === "birth")!;

afterEach(() => {
  cleanup();
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
  it("collects intake one question at a time and renders the resolved roadmap", async () => {
    renderFlow();

    expect(await screen.findByRole("heading", { name: "When was the baby born?" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "What is the baby's gender?" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /More than 1 year ago/ }));
    expect(screen.getByRole("heading", { name: "What is the baby's gender?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Boy/ }));

    expect(screen.getByRole("heading", { name: /Your roadmap/ })).toBeInTheDocument();
    expect(screen.queryByText("Register the birth")).not.toBeInTheDocument();
    expect(screen.getByText("Late Registration of Birth")).toBeInTheDocument();
    expect(screen.getByText(/Waiting on: Late Registration of Birth/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Late Registration of Birth/ })).toHaveAttribute(
      "href",
      "/journey/birth/step/late-register-birth",
    );
  });

  it("opens completed intake on the roadmap and preselects answers when editing", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        journeys: {
          birth: {
            answers: { "birth-timing": "after-one-year", gender: "boy" },
            completedStepIds: ["late-register-birth"],
          },
        },
      }),
    );
    renderFlow();

    expect(await screen.findByText("DONE")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Change answers" }));

    expect(screen.getByRole("button", { name: /More than 1 year ago/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

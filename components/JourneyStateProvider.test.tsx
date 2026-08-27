import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY } from "@/lib/state/journeyState";
import { JourneyStateProvider, useJourneyState } from "./JourneyStateProvider";

function Probe() {
  const { state, setAnswer } = useJourneyState();
  const progress = state.journeys.birth;

  return (
    <div>
      <output data-testid="answer">{progress?.answers.gender ?? "empty"}</output>
      <output data-testid="completed">
        {progress?.completedStepIds.join(",") || "empty"}
      </output>
      <button type="button" onClick={() => setAnswer("birth", "gender", "girl")}>
        Set answer
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("JourneyStateProvider", () => {
  it("falls back safely when reading storage throws", async () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new DOMException("Storage blocked");
    });

    render(
      <JourneyStateProvider>
        <Probe />
      </JourneyStateProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("completed")).toHaveTextContent("empty"));
  });

  it("keeps state usable when writing storage throws", async () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("Storage blocked");
    });

    render(
      <JourneyStateProvider>
        <Probe />
      </JourneyStateProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Set answer" }));

    await waitFor(() => expect(screen.getByTestId("answer")).toHaveTextContent("girl"));
  });

  it("hydrates stored progress before persisting", async () => {
    const stored = {
      journeys: {
        birth: {
          answers: { gender: "girl" },
          completedStepIds: ["benefit"],
        },
      },
    };
    vi.spyOn(window.localStorage, "getItem").mockReturnValue(JSON.stringify(stored));
    const setItem = vi.spyOn(window.localStorage, "setItem");

    render(
      <JourneyStateProvider>
        <Probe />
      </JourneyStateProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("completed")).toHaveTextContent("benefit"),
    );
    await waitFor(() => expect(setItem).toHaveBeenCalled());
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(stored));
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY } from "@/lib/state/journeyState";
import { JourneyStateProvider, useJourneyState } from "./JourneyStateProvider";

function Probe() {
  const { state, isHydrated, setAnswer, selectJourney, reset } = useJourneyState();
  const progress = state.journeys.birth;

  return (
    <div>
      <output data-testid="answer">{progress?.answers.gender ?? "empty"}</output>
      <output data-testid="completed">
        {progress?.completedStepIds.join(",") || "empty"}
      </output>
      <output data-testid="selected">{state.selectedJourneyId ?? "empty"}</output>
      <output data-testid="hydrated">{String(isHydrated)}</output>
      <button type="button" onClick={() => setAnswer("birth", "gender", "girl")}>
        Set answer
      </button>
      <button type="button" onClick={() => selectJourney("birth")}>Select journey</button>
      <button type="button" onClick={reset}>Start over</button>
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
    const getItem = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new DOMException("Storage blocked");
    });

    render(
      <JourneyStateProvider>
        <Probe />
      </JourneyStateProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("completed")).toHaveTextContent("empty"));
    expect(getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it("keeps state usable when writing storage throws", async () => {
    const setItem = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("Storage blocked");
    });

    render(
      <JourneyStateProvider>
        <Probe />
      </JourneyStateProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Set answer" }));

    await waitFor(() => expect(screen.getByTestId("answer")).toHaveTextContent("girl"));
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
  });

  it("hydrates stored progress before persisting", async () => {
    const stored = {
      version: 1,
      selectedJourneyId: "birth",
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
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem.mock.calls[0]).toEqual([STORAGE_KEY, JSON.stringify(stored)]);
  });

  it("restores the selected journey and progress after a reload", async () => {
    const stored = {
      version: 1,
      selectedJourneyId: "birth",
      journeys: {
        birth: {
          answers: { "birth-timing": "after-one-year", gender: "boy" },
          completedStepIds: ["late-register-birth"],
        },
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    render(
      <JourneyStateProvider>
        <Probe />
      </JourneyStateProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    expect(screen.getByTestId("selected")).toHaveTextContent("birth");
    expect(screen.getByTestId("completed")).toHaveTextContent("late-register-birth");
  });

  it("clears the persisted key when starting over", async () => {
    render(
      <JourneyStateProvider>
        <Probe />
      </JourneyStateProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    fireEvent.click(screen.getByRole("button", { name: "Select journey" }));
    await waitFor(() => expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Start over" }));

    await waitFor(() => expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull());
    expect(screen.getByTestId("selected")).toHaveTextContent("empty");
  });
});

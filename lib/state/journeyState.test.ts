import { describe, expect, it } from "vitest";
import {
  EMPTY_JOURNEY_STATE,
  journeyStateReducer,
  parseJourneyState,
  serializeJourneyState,
  type JourneyState,
} from "./journeyState";

const state: JourneyState = {
  selectedJourneyId: "birth",
  journeys: {
    birth: {
      answers: { gender: "girl" },
      completedStepIds: [],
    },
  },
};

describe("journey state", () => {
  it("does not remove completion when an answer changes", () => {
    const initial: JourneyState = {
      selectedJourneyId: "birth",
      journeys: {
        birth: {
          answers: { gender: "girl" },
          completedStepIds: ["benefit"],
        },
      },
    };

    const result = journeyStateReducer(initial, {
      type: "setAnswer",
      journeyId: "birth",
      questionId: "gender",
      optionId: "boy",
    });

    expect(result.journeys.birth).toEqual({
      answers: { gender: "boy" },
      completedStepIds: ["benefit"],
    });
    expect(initial.journeys.birth.completedStepIds).toEqual(["benefit"]);
  });

  it("round-trips the persisted payload", () => {
    expect(parseJourneyState(serializeJourneyState(state))).toEqual(state);
    expect(JSON.parse(serializeJourneyState(state))).toMatchObject({
      version: 1,
      selectedJourneyId: "birth",
    });
  });

  it("falls back to empty state for absent or malformed storage", () => {
    expect(parseJourneyState(null)).toEqual(EMPTY_JOURNEY_STATE);
    expect(parseJourneyState("not-json")).toEqual(EMPTY_JOURNEY_STATE);
  });

  it("rejects structurally invalid JSON", () => {
    expect(
      parseJourneyState('{"journeys":{"birth":{"completedStepIds":"benefit"}}}'),
    ).toEqual(EMPTY_JOURNEY_STATE);
    expect(
      parseJourneyState(
        '{"journeys":{"birth":{"answers":{"gender":1},"completedStepIds":[]}}}',
      ),
    ).toEqual(EMPTY_JOURNEY_STATE);
  });

  it("rejects a version-mismatched payload", () => {
    expect(
      parseJourneyState(
        '{"version":2,"selectedJourneyId":"birth","journeys":{}}',
      ),
    ).toEqual(EMPTY_JOURNEY_STATE);
  });

  it("toggles completion without changing answers", () => {
    const completed = journeyStateReducer(state, {
      type: "toggleCompleted",
      journeyId: "birth",
      stepId: "benefit",
    });

    expect(completed.journeys.birth).toEqual({
      answers: { gender: "girl" },
      completedStepIds: ["benefit"],
    });
    expect(
      journeyStateReducer(completed, {
        type: "toggleCompleted",
        journeyId: "birth",
        stepId: "benefit",
      }).journeys.birth.completedStepIds,
    ).toEqual([]);
  });

  it("creates missing journey state when updating it", () => {
    const answered = journeyStateReducer(EMPTY_JOURNEY_STATE, {
      type: "setAnswer",
      journeyId: "death",
      questionId: "location",
      optionId: "hospital",
    });

    expect(answered.journeys.death).toEqual({
      answers: { location: "hospital" },
      completedStepIds: [],
    });
  });

  it("hydrates and resets the complete payload", () => {
    expect(
      journeyStateReducer(EMPTY_JOURNEY_STATE, { type: "hydrate", state }),
    ).toEqual(state);
    expect(journeyStateReducer(state, { type: "reset" })).toEqual(EMPTY_JOURNEY_STATE);
  });
});

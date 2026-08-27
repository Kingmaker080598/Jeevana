export const STORAGE_KEY = "jeevana:journey-state:v1";

export interface JourneyProgress {
  answers: Record<string, string>;
  completedStepIds: string[];
}

export interface JourneyState {
  journeys: Record<string, JourneyProgress>;
}

export const EMPTY_JOURNEY_STATE: JourneyState = { journeys: {} };

export type JourneyStateAction =
  | {
      type: "setAnswer";
      journeyId: string;
      questionId: string;
      optionId: string;
    }
  | { type: "toggleCompleted"; journeyId: string; stepId: string }
  | { type: "hydrate"; state: JourneyState }
  | { type: "reset" };

function progressFor(state: JourneyState, journeyId: string): JourneyProgress {
  return state.journeys[journeyId] ?? { answers: {}, completedStepIds: [] };
}

export function journeyStateReducer(
  state: JourneyState,
  action: JourneyStateAction,
): JourneyState {
  switch (action.type) {
    case "setAnswer": {
      const current = progressFor(state, action.journeyId);
      return {
        journeys: {
          ...state.journeys,
          [action.journeyId]: {
            answers: {
              ...current.answers,
              [action.questionId]: action.optionId,
            },
            completedStepIds: [...current.completedStepIds],
          },
        },
      };
    }
    case "toggleCompleted": {
      const current = progressFor(state, action.journeyId);
      const isCompleted = current.completedStepIds.includes(action.stepId);
      return {
        journeys: {
          ...state.journeys,
          [action.journeyId]: {
            answers: { ...current.answers },
            completedStepIds: isCompleted
              ? current.completedStepIds.filter((stepId) => stepId !== action.stepId)
              : [...current.completedStepIds, action.stepId],
          },
        },
      };
    }
    case "hydrate":
      return action.state;
    case "reset":
      return EMPTY_JOURNEY_STATE;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJourneyState(value: unknown): value is JourneyState {
  if (!isRecord(value) || !isRecord(value.journeys)) return false;

  return Object.values(value.journeys).every((progress) => {
    if (!isRecord(progress) || !isRecord(progress.answers)) return false;
    if (!Array.isArray(progress.completedStepIds)) return false;

    return (
      Object.values(progress.answers).every((answer) => typeof answer === "string") &&
      progress.completedStepIds.every((stepId) => typeof stepId === "string")
    );
  });
}

export function parseJourneyState(serialized: string | null): JourneyState {
  if (serialized === null) return EMPTY_JOURNEY_STATE;

  try {
    const parsed: unknown = JSON.parse(serialized);
    return isJourneyState(parsed) ? parsed : EMPTY_JOURNEY_STATE;
  } catch {
    return EMPTY_JOURNEY_STATE;
  }
}

export function serializeJourneyState(state: JourneyState): string {
  return JSON.stringify(state);
}

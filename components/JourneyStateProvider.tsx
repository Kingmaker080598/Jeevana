"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  EMPTY_JOURNEY_STATE,
  STORAGE_KEY,
  journeyStateReducer,
  parseJourneyState,
  serializeJourneyState,
  type JourneyState,
} from "@/lib/state/journeyState";

interface JourneyStateContextValue {
  state: JourneyState;
  setAnswer: (
    journeyId: string,
    questionId: string,
    optionId: string,
  ) => void;
  toggleCompleted: (journeyId: string, stepId: string) => void;
  reset: () => void;
}

const JourneyStateContext = createContext<JourneyStateContextValue | undefined>(
  undefined,
);

export function JourneyStateProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(journeyStateReducer, EMPTY_JOURNEY_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let storedState = EMPTY_JOURNEY_STATE;

    try {
      storedState = parseJourneyState(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      storedState = EMPTY_JOURNEY_STATE;
    }

    dispatch({ type: "hydrate", state: storedState });
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, serializeJourneyState(state));
    } catch {
      // Browser privacy settings and storage quotas must not break the prototype.
    }
  }, [isHydrated, state]);

  const value = useMemo<JourneyStateContextValue>(
    () => ({
      state,
      setAnswer: (journeyId, questionId, optionId) =>
        dispatch({ type: "setAnswer", journeyId, questionId, optionId }),
      toggleCompleted: (journeyId, stepId) =>
        dispatch({ type: "toggleCompleted", journeyId, stepId }),
      reset: () => dispatch({ type: "reset" }),
    }),
    [state],
  );

  return (
    <JourneyStateContext.Provider value={value}>{children}</JourneyStateContext.Provider>
  );
}

export function useJourneyState(): JourneyStateContextValue {
  const context = useContext(JourneyStateContext);

  if (!context) {
    throw new Error("useJourneyState must be used inside JourneyStateProvider.");
  }

  return context;
}

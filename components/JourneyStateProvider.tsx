"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
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
  isHydrated: boolean;
  setAnswer: (
    journeyId: string,
    questionId: string,
    optionId: string,
  ) => void;
  toggleCompleted: (journeyId: string, stepId: string) => void;
  selectJourney: (journeyId: string) => void;
  reset: () => void;
}

const JourneyStateContext = createContext<JourneyStateContextValue | undefined>(
  undefined,
);

export function JourneyStateProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(journeyStateReducer, EMPTY_JOURNEY_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const skipNextPersist = useRef(false);

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
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, serializeJourneyState(state));
    } catch {
      // Browser privacy settings and storage quotas must not break the prototype.
    }
  }, [isHydrated, state]);

  const setAnswer = useCallback(
    (journeyId: string, questionId: string, optionId: string) =>
      dispatch({ type: "setAnswer", journeyId, questionId, optionId }),
    [],
  );
  const toggleCompleted = useCallback(
    (journeyId: string, stepId: string) =>
      dispatch({ type: "toggleCompleted", journeyId, stepId }),
    [],
  );
  const selectJourney = useCallback(
    (journeyId: string) => dispatch({ type: "selectJourney", journeyId }),
    [],
  );
  const reset = useCallback(() => {
    skipNextPersist.current = true;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Reset still clears in-memory state when storage is unavailable.
    }
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo<JourneyStateContextValue>(
    () => ({
      state,
      isHydrated,
      setAnswer,
      toggleCompleted,
      selectJourney,
      reset,
    }),
    [isHydrated, reset, selectJourney, setAnswer, state, toggleCompleted],
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

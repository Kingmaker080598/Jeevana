import type { Journey } from "./types";

export interface JourneyEvidence {
  steps: number;
  departments: number;
  portals: number;
  documentedSequences: number;
}

export function summarizeJourneyEvidence(journey: Journey): JourneyEvidence {
  const departments = new Set(journey.steps.map((step) => step.authority));
  const portals = new Set(
    journey.steps.map((step) => step.portal).filter((portal) => portal.length > 0),
  );

  return {
    steps: journey.steps.length,
    departments: departments.size,
    portals: portals.size,
    documentedSequences: 0,
  };
}

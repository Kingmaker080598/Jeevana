import birth from "@/data/journeys/birth.json";
import death from "@/data/journeys/death.json";
import turning18 from "@/data/journeys/turning18.json";
import type { Journey } from "./types";

type VisitState = "visiting" | "visited";

export function validateJourney(journey: Journey): void {
  const stepIds = new Set<string>();

  for (const step of journey.steps) {
    if (stepIds.has(step.id)) {
      throw new Error(`Journey "${journey.id}" has duplicate step id "${step.id}".`);
    }
    stepIds.add(step.id);
  }

  const questionsById = new Map(
    journey.intakeQuestions.map((question) => [question.id, question]),
  );

  for (const step of journey.steps) {
    for (const dependencyId of step.dependsOn) {
      if (!stepIds.has(dependencyId)) {
        throw new Error(
          `Step "${step.id}" depends on unknown step id "${dependencyId}" in journey "${journey.id}".`,
        );
      }
    }

    for (const condition of step.conditions ?? []) {
      const question = questionsById.get(condition.questionId);
      if (!question) {
        throw new Error(
          `Step "${step.id}" references unknown question id "${condition.questionId}" in journey "${journey.id}".`,
        );
      }

      if (!question.options.some((option) => option.id === condition.equals)) {
        throw new Error(
          `Step "${step.id}" references unknown option id "${condition.equals}" for question "${condition.questionId}" in journey "${journey.id}".`,
        );
      }
    }
  }

  const stepsById = new Map(journey.steps.map((step) => [step.id, step]));
  const visitStates = new Map<string, VisitState>();

  function visit(stepId: string, path: string[]): void {
    const state = visitStates.get(stepId);

    if (state === "visited") return;

    if (state === "visiting") {
      const cycleStart = path.indexOf(stepId);
      const cycle = [...path.slice(cycleStart), stepId];
      throw new Error(
        `Dependency cycle in journey "${journey.id}": ${cycle.join(" -> ")}.`,
      );
    }

    visitStates.set(stepId, "visiting");
    const step = stepsById.get(stepId);

    if (step) {
      for (const dependencyId of step.dependsOn) {
        visit(dependencyId, [...path, stepId]);
      }
    }

    visitStates.set(stepId, "visited");
  }

  for (const step of journey.steps) {
    visit(step.id, []);
  }
}

const journeys: Journey[] = [birth, death, turning18];

export function loadJourneys(): Journey[] {
  journeys.forEach(validateJourney);
  return journeys;
}

import type { IntakeAnswers, Journey, ResolvedStep } from "./types";

export function resolveJourney(
  journey: Journey,
  answers: IntakeAnswers,
  completedStepIds: ReadonlySet<string>,
): ResolvedStep[] {
  const visibleStepIds = new Set(
    journey.steps
      .filter((step) =>
        (step.conditions ?? []).every(
          ({ questionId, equals }) => answers[questionId] === equals,
        ),
      )
      .map((step) => step.id),
  );

  return journey.steps.map((step) => {
    const isConditional = (step.conditions?.length ?? 0) > 0;

    if (!visibleStepIds.has(step.id)) {
      return {
        step,
        state: "HIDDEN",
        blockingDependencyIds: [],
        isConditional,
      };
    }

    const blockingDependencyIds = step.dependsOn.filter(
      (dependencyId) =>
        visibleStepIds.has(dependencyId) && !completedStepIds.has(dependencyId),
    );

    if (blockingDependencyIds.length > 0) {
      return {
        step,
        state: "LOCKED",
        blockingDependencyIds,
        isConditional,
      };
    }

    if (completedStepIds.has(step.id)) {
      return {
        step,
        state: "DONE",
        blockingDependencyIds: [],
        isConditional,
      };
    }

    return {
      step,
      state: "UNLOCKED",
      blockingDependencyIds: [],
      isConditional,
    };
  });
}

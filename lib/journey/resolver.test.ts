import { describe, expect, it } from "vitest";
import { resolveJourney } from "./resolver";
import type { Journey, ResolvedStep, Step } from "./types";

function step(id: string, overrides: Partial<Step> = {}): Step {
  return {
    id,
    name: id,
    name_te: id,
    authority: "Test authority",
    portal: "https://example.test",
    fee: "Free",
    sla: "One day",
    whyPlain: "Required for testing",
    whyPlain_te: "పరీక్ష కోసం అవసరం",
    officialSource: null,
    lastVerified: "2026-08-28",
    documents: [],
    dependsOn: [],
    ...overrides,
  };
}

function journey(steps: Step[]): Journey {
  return {
    id: "test",
    name: "Test journey",
    name_te: "పరీక్ష ప్రయాణం",
    intakeQuestions: [
      {
        id: "gender",
        prompt: "Gender",
        prompt_te: "లింగం",
        options: [
          { id: "girl", label: "Girl", label_te: "బాలిక" },
          { id: "boy", label: "Boy", label_te: "బాలుడు" },
        ],
      },
      {
        id: "resident",
        prompt: "Resident of Andhra Pradesh?",
        prompt_te: "ఆంధ్రప్రదేశ్ నివాసి?",
        options: [
          { id: "yes", label: "Yes", label_te: "అవును" },
          { id: "no", label: "No", label_te: "కాదు" },
        ],
      },
    ],
    steps,
  };
}

function byId(results: ResolvedStep[], id: string): ResolvedStep {
  const result = results.find(({ step: resolvedStep }) => resolvedStep.id === id);
  if (!result) throw new Error(`Missing resolved step: ${id}`);
  return result;
}

function states(results: ResolvedStep[]): Record<string, string> {
  return Object.fromEntries(results.map((result) => [result.step.id, result.state]));
}

describe("resolveJourney", () => {
  it("unlocks dependencies in a completion cascade", () => {
    const subject = journey([
      step("apply"),
      step("verify", { dependsOn: ["apply"] }),
      step("collect", { dependsOn: ["verify"] }),
    ]);

    expect(states(resolveJourney(subject, {}, new Set()))).toEqual({
      apply: "UNLOCKED",
      verify: "LOCKED",
      collect: "LOCKED",
    });
    expect(states(resolveJourney(subject, {}, new Set(["apply"])))).toEqual({
      apply: "DONE",
      verify: "UNLOCKED",
      collect: "LOCKED",
    });
    expect(states(resolveJourney(subject, {}, new Set(["apply", "verify"])))).toEqual({
      apply: "DONE",
      verify: "DONE",
      collect: "UNLOCKED",
    });
  });

  it("shows a conditional step only when every answer matches", () => {
    const subject = journey([
      step("benefit", {
        conditions: [
          { questionId: "gender", equals: "girl" },
          { questionId: "resident", equals: "yes" },
        ],
      }),
    ]);

    expect(byId(resolveJourney(subject, {}, new Set()), "benefit")).toMatchObject({
      state: "HIDDEN",
      isConditional: true,
    });
    expect(
      byId(resolveJourney(subject, { gender: "girl" }, new Set()), "benefit").state,
    ).toBe("HIDDEN");
    expect(
      byId(
        resolveJourney(subject, { gender: "girl", resident: "no" }, new Set()),
        "benefit",
      ).state,
    ).toBe("HIDDEN");
    expect(
      byId(
        resolveJourney(subject, { gender: "girl", resident: "yes" }, new Set()),
        "benefit",
      ).state,
    ).toBe("UNLOCKED");
  });

  it("reports every incomplete visible dependency", () => {
    const subject = journey([
      step("one"),
      step("two"),
      step("three", { dependsOn: ["one", "two"] }),
    ]);

    expect(byId(resolveJourney(subject, {}, new Set()), "three")).toMatchObject({
      state: "LOCKED",
      blockingDependencyIds: ["one", "two"],
    });
    expect(byId(resolveJourney(subject, {}, new Set(["one"])), "three")).toMatchObject({
      state: "LOCKED",
      blockingDependencyIds: ["two"],
    });
  });

  it("does not let hidden dependencies block a visible dependent", () => {
    const subject = journey([
      step("optional", {
        conditions: [{ questionId: "gender", equals: "girl" }],
      }),
      step("follow-up", { dependsOn: ["optional"] }),
    ]);

    expect(byId(resolveJourney(subject, {}, new Set()), "optional").state).toBe("HIDDEN");
    expect(byId(resolveJourney(subject, {}, new Set()), "follow-up")).toMatchObject({
      state: "UNLOCKED",
      blockingDependencyIds: [],
    });
  });

  it("does not badge absent or empty conditions as conditional", () => {
    const subject = journey([step("absent"), step("empty", { conditions: [] })]);

    expect(resolveJourney(subject, {}, new Set()).map((result) => result.isConditional)).toEqual([
      false,
      false,
    ]);
  });

  it("does not mutate completion when a completed step becomes hidden", () => {
    const subject = journey([
      step("benefit", {
        conditions: [{ questionId: "gender", equals: "girl" }],
      }),
    ]);
    const completed = new Set(["benefit"]);

    expect(byId(resolveJourney(subject, {}, completed), "benefit").state).toBe("HIDDEN");
    expect([...completed]).toEqual(["benefit"]);
    expect(
      byId(resolveJourney(subject, { gender: "girl" }, completed), "benefit").state,
    ).toBe("DONE");
  });

  it("does not resolve a stored completion as done while its dependency is incomplete", () => {
    const subject = journey([
      step("prerequisite"),
      step("dependent", { dependsOn: ["prerequisite"] }),
    ]);

    expect(
      byId(resolveJourney(subject, {}, new Set(["dependent"])), "dependent"),
    ).toMatchObject({
      state: "LOCKED",
      blockingDependencyIds: ["prerequisite"],
    });
  });

  it("recomputes a downstream completion when its prerequisite is undone and redone", () => {
    const subject = journey([
      step("prerequisite"),
      step("dependent", { dependsOn: ["prerequisite"] }),
    ]);
    const bothCompleted = new Set(["prerequisite", "dependent"]);

    expect(byId(resolveJourney(subject, {}, bothCompleted), "dependent").state).toBe("DONE");

    bothCompleted.delete("prerequisite");
    expect(byId(resolveJourney(subject, {}, bothCompleted), "dependent").state).toBe("LOCKED");

    bothCompleted.add("prerequisite");
    expect(byId(resolveJourney(subject, {}, bothCompleted), "dependent").state).toBe("DONE");
  });
});

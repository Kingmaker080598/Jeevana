import { describe, expect, it } from "vitest";
import { loadJourneys, validateJourney } from "./loadJourneys";
import type { Journey, Step } from "./types";

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
    documents: [],
    dependsOn: [],
    ...overrides,
  };
}

function validJourney(overrides: Partial<Journey> = {}): Journey {
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
    ],
    steps: [step("one"), step("two", { dependsOn: ["one"] })],
    ...overrides,
  };
}

describe("validateJourney", () => {
  it("accepts a valid journey", () => {
    expect(() => validateJourney(validJourney())).not.toThrow();
  });

  it("rejects duplicate step ids", () => {
    const subject = validJourney({ steps: [step("same"), step("same")] });

    expect(() => validateJourney(subject)).toThrow(/duplicate step id.*same/i);
  });

  it("rejects dependencies on unknown step ids", () => {
    const subject = validJourney({
      steps: [step("known", { dependsOn: ["missing"] })],
    });

    expect(() => validateJourney(subject)).toThrow(/unknown step.*missing/i);
  });

  it("rejects conditions on unknown question ids", () => {
    const subject = validJourney({
      steps: [
        step("conditional", {
          conditions: [{ questionId: "missing", equals: "girl" }],
        }),
      ],
    });

    expect(() => validateJourney(subject)).toThrow(/unknown question.*missing/i);
  });

  it("rejects conditions on unknown option ids", () => {
    const subject = validJourney({
      steps: [
        step("conditional", {
          conditions: [{ questionId: "gender", equals: "missing" }],
        }),
      ],
    });

    expect(() => validateJourney(subject)).toThrow(/unknown option.*missing/i);
  });

  it("rejects dependency cycles and reports the cycle path", () => {
    const subject = validJourney({
      steps: [
        step("one", { dependsOn: ["two"] }),
        step("two", { dependsOn: ["one"] }),
      ],
    });

    expect(() => validateJourney(subject)).toThrow(/dependency cycle.*one.*two.*one/i);
  });

  it("rejects a self-cycle", () => {
    const subject = validJourney({
      steps: [step("one", { dependsOn: ["one"] })],
    });

    expect(() => validateJourney(subject)).toThrow(/dependency cycle.*one.*one/i);
  });

  it("rejects a cycle in a disconnected component", () => {
    const subject = validJourney({
      steps: [
        step("root"),
        step("island-one", { dependsOn: ["island-two"] }),
        step("island-two", { dependsOn: ["island-one"] }),
      ],
    });

    expect(() => validateJourney(subject)).toThrow(/dependency cycle/i);
  });
});

describe("loadJourneys", () => {
  it("loads the three explicitly imported placeholder journeys", () => {
    expect(loadJourneys().map(({ id }) => id)).toEqual(["birth", "death", "turning18"]);
  });
});

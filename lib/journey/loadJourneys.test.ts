import { describe, expect, it } from "vitest";
import { loadJourneys, validateJourney } from "./loadJourneys";
import { resolveJourney } from "./resolver";
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
  it("loads and validates the three explicitly imported journeys", () => {
    const journeys = loadJourneys();

    expect(loadJourneys().map(({ id }) => id)).toEqual(["birth", "death", "turning18"]);
    expect(() => journeys.forEach(validateJourney)).not.toThrow();
  });

  it("routes birth registration tracks and personalized benefits", () => {
    const birth = loadJourneys().find(({ id }) => id === "birth");
    const register = birth?.steps.find(({ id }) => id === "register-birth");
    const lateRegister = birth?.steps.find(({ id }) => id === "late-register-birth");
    const certificate = birth?.steps.find(({ id }) => id === "get-certificate-copy");
    const sukanya = birth?.steps.find(({ id }) => id === "sukanya");

    expect(register?.conditions).toEqual([
      { questionId: "birth-timing", equals: "within-one-year" },
    ]);
    expect(lateRegister?.conditions).toEqual([
      { questionId: "birth-timing", equals: "after-one-year" },
    ]);
    expect(certificate?.dependsOn).toEqual(["register-birth", "late-register-birth"]);
    expect(sukanya).toMatchObject({
      dependsOn: ["baby-aadhaar"],
      conditions: [{ questionId: "gender", equals: "girl" }],
    });
  });

  it("ignores the hidden registration track on the after-one-year path", () => {
    const birth = loadJourneys().find(({ id }) => id === "birth");
    if (!birth) throw new Error("Birth journey was not loaded.");

    const incompleteResults = resolveJourney(
      birth,
      { "birth-timing": "after-one-year" },
      new Set(),
    );
    const incompleteStates = Object.fromEntries(
      incompleteResults.map((result) => [result.step.id, result.state]),
    );

    expect(incompleteStates["late-register-birth"]).toBe("UNLOCKED");
    expect(incompleteStates["register-birth"]).toBe("HIDDEN");
    expect(incompleteStates["get-certificate-copy"]).toBe("LOCKED");

    const completedResults = resolveJourney(
      birth,
      { "birth-timing": "after-one-year" },
      new Set(["late-register-birth"]),
    );
    const completedStates = Object.fromEntries(
      completedResults.map((result) => [result.step.id, result.state]),
    );

    expect(completedStates["late-register-birth"]).toBe("DONE");
    expect(completedStates["register-birth"]).toBe("HIDDEN");
    expect(completedStates["get-certificate-copy"]).toBe("UNLOCKED");
  });

  it("routes bank settlement by nominee status", () => {
    const death = loadJourneys().find(({ id }) => id === "death");
    const nominee = death?.steps.find(({ id }) => id === "bank-settlement");
    const noNominee = death?.steps.find(
      ({ id }) => id === "bank-settlement-no-nominee",
    );

    expect(nominee).toMatchObject({
      dependsOn: ["death-certificate"],
      conditions: [{ questionId: "nominee-registered", equals: "yes" }],
      letterTemplateId: "deceased-bank-claim",
    });
    expect(noNominee).toMatchObject({
      dependsOn: ["death-certificate", "family-member-certificate"],
      conditions: [{ questionId: "nominee-registered", equals: "no" }],
      letterTemplateId: "deceased-bank-claim",
    });
  });

  it("personalizes turning-18 bank and driving steps", () => {
    const turning18 = loadJourneys().find(({ id }) => id === "turning18");
    const bank = turning18?.steps.find(({ id }) => id === "bank-major");
    const driving = turning18?.steps.find(({ id }) => id === "driving-licence");

    expect(bank?.conditions).toEqual([
      { questionId: "minor-bank-account", equals: "yes" },
    ]);
    expect(driving).toMatchObject({
      dependsOn: ["aadhaar-biometric"],
      conditions: [{ questionId: "wants-to-drive", equals: "yes" }],
    });
  });
});

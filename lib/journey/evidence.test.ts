import { describe, expect, it } from "vitest";
import { loadJourneys } from "./loadJourneys";

describe("summarizeJourneyEvidence", () => {
  it("derives death-journey counts from step authorities and portals", async () => {
    const evidenceModule = await import("./evidence").catch(() => null);
    expect(evidenceModule).not.toBeNull();

    if (!evidenceModule) return;

    const death = loadJourneys().find((journey) => journey.id === "death");
    expect(death).toBeDefined();

    if (!death) return;

    expect(evidenceModule.summarizeJourneyEvidence(death)).toEqual({
      steps: 8,
      departments: 7,
      portals: 6,
      documentedSequences: 0,
    });
  });
});

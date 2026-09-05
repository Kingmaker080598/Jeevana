import { describe, expect, it } from "vitest";
import { ageInCompletedYears, createSampleFamily } from "./sampleFamily";

describe("createSampleFamily", () => {
  it("derives stable demonstration ages from the supplied date", () => {
    const today = new Date("2026-09-05T12:00:00.000Z");
    const family = createSampleFamily(today);
    expect(family.map((member) => ageInCompletedYears(member.birthDate, today))).toEqual([68, 34, 17, 0]);
    expect(family[3].birthDate).toBe("2026-08-24");
  });
});

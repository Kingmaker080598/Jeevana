import { describe, expect, it } from "vitest";
import { DOCUMENTS } from "@/data/documents";
import { LIFE_STAGES } from "@/data/lifeStages";
import { STAGE_DEPENDENCIES } from "@/data/stageDependencies";
import { analyseHousehold, analyseMember } from "./engine";
import { createSampleFamily } from "./sampleFamily";
import type { Member } from "./types";

const TODAY = new Date("2026-09-05T12:00:00.000Z");

describe("life-map data", () => {
  it("references only registered documents and known life stages", () => {
    const documentIds = new Set(DOCUMENTS.map((document) => document.id));
    const stageIds = new Set(LIFE_STAGES.map((stage) => stage.id));

    expect(STAGE_DEPENDENCIES).toHaveLength(LIFE_STAGES.length);
    for (const stage of STAGE_DEPENDENCIES) {
      expect(stageIds.has(stage.stageId)).toBe(true);
      for (const documentId of [...stage.coreDocuments, ...stage.requiredDocuments]) {
        expect(documentIds.has(documentId)).toBe(true);
      }
    }
  });
});

describe("analyseMember", () => {
  it("analyses the four-person sample family", () => {
    const family = createSampleFamily(TODAY);
    expect(family.map((member) => [member.name, member.role])).toEqual([
      ["Venkata Rao", "Grandfather"],
      ["Lakshmi", "Mother"],
      ["Sravani", "Daughter"],
      ["Baby boy", "Born 12 days ago"],
    ]);
    expect(family.map((member) => analyseMember(member, TODAY).rows)).toSatisfy(
      (rows: unknown[][]) => rows.every((memberRows) => memberRows.length === 16),
    );
    expect(analyseHousehold(family, TODAY).members).toBe(4);
  });

  it("makes birth the late-track priority when Sravani's certificate is removed", () => {
    const sravani = createSampleFamily(TODAY).find((member) => member.name === "Sravani")!;
    const changed: Member = { ...sravani, docs: { ...sravani.docs, birth: "no" } };
    const analysis = analyseMember(changed, TODAY);

    expect(analysis.rows.filter((row) => row.missing.includes("birth"))).toHaveLength(3);
    expect(analysis.doFirst?.document.id).toBe("birth");
    expect(analysis.doFirst?.lateTrack).toBe(true);
  });

  it("ranks nominee first for Venkata Rao instead of his old missing birth record", () => {
    const venkata = createSampleFamily(TODAY).find((member) => member.name === "Venkata Rao")!;
    expect(analyseMember(venkata, TODAY).doFirst?.document.id).toBe("nominee");
  });

  it("gives a 12-day-old baby nine days to register", () => {
    const baby = createSampleFamily(TODAY).find((member) => member.name === "Baby boy")!;
    const analysis = analyseMember(baby, TODAY);
    expect(analysis.rows.find((row) => row.stage.id === "birth")?.deadlineDaysLeft).toBe(9);
    expect(analysis.upcoming[0]).toMatchObject({ kind: "deadline", daysUntil: 9 });
  });

  it("treats unsure papers as missing", () => {
    const member = createSampleFamily(TODAY)[1];
    const analysis = analyseMember({ ...member, docs: { ...member.docs, nominee: "unsure" } }, TODAY);
    expect(analysis.rows.some((row) => row.missing.includes("nominee"))).toBe(true);
  });

  it("returns no first action when every paper is held", () => {
    const docs = Object.fromEntries(DOCUMENTS.map((document) => [document.id, "have"] as const));
    const member: Member = {
      id: "complete",
      name: "Complete Person",
      role: "Resident",
      birthDate: "1990-01-01",
      docs,
    };
    expect(analyseMember(member, TODAY).doFirst).toBeNull();
  });
});

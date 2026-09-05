import { DOCUMENTS, DOCUMENT_BY_ID } from "@/data/documents";
import { LIFE_STAGES, type LifeStage } from "@/data/lifeStages";
import { STAGE_DEPENDENCY_BY_ID, type StageDependency } from "@/data/stageDependencies";
import { ageInCompletedYears } from "./sampleFamily";
import type { FirstAction, HouseholdAnalysis, LifeMapRow, Member, MemberAnalysis, StageStatus, UpcomingItem } from "./types";

const DAY_MS = 86_400_000;

function birthDate(member: Member): Date {
  return new Date(`${member.birthDate}T00:00:00.000Z`);
}

export function ageInDays(member: Member, today: Date): number {
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.max(0, Math.floor((utcToday - birthDate(member).getTime()) / DAY_MS));
}

function monthsToAge(member: Member, age: number, today: Date): number {
  const birth = birthDate(member);
  const target = new Date(Date.UTC(birth.getUTCFullYear() + age, birth.getUTCMonth(), birth.getUTCDate()));
  const months = (target.getUTCFullYear() - today.getUTCFullYear()) * 12 + target.getUTCMonth() - today.getUTCMonth();
  return Math.max(0, months - (target.getUTCDate() < today.getUTCDate() ? 1 : 0));
}

function holds(member: Member, documentId: string): boolean {
  return member.docs[documentId] === "have";
}

function dependencyFor(stage: LifeStage): StageDependency {
  const dependency = STAGE_DEPENDENCY_BY_ID.get(stage.id);
  if (!dependency) throw new Error(`Missing dependency data for life stage "${stage.id}".`);
  return dependency;
}

function names(ids: string[]): string {
  return ids.map((id) => DOCUMENT_BY_ID.get(id)?.label.toLowerCase() ?? id).join(", ");
}

export function stageStatus(member: Member, stage: LifeStage, today: Date): LifeMapRow {
  const dependency = dependencyFor(stage);
  const age = ageInCompletedYears(member.birthDate, today);

  if (dependency.coreDocuments.length > 0 && dependency.coreDocuments.every((id) => holds(member, id))) {
    return { stage, status: "done", missing: [], reason: "Done" };
  }

  if (stage.id === "birth" && !holds(member, "birth")) {
    const daysOld = ageInDays(member, today);
    const deadlineDaysLeft = daysOld < 21 ? 21 - daysOld : undefined;
    const lateTrack = age >= 1;
    return {
      stage,
      status: "blocked",
      missing: ["birth"],
      reason: deadlineDaysLeft !== undefined ? `Not registered · ${deadlineDaysLeft} days left free` : lateTrack ? "Birth never registered · late registration is possible" : "Birth registration is overdue",
      ...(deadlineDaysLeft !== undefined ? { deadlineDaysLeft } : {}),
      ...(lateTrack ? { lateTrack: true } : {}),
    };
  }

  if (dependency.ageFrom !== null && age < dependency.ageFrom) {
    const monthsUntil = monthsToAge(member, dependency.ageFrom, today);
    return monthsUntil <= 24
      ? { stage, status: "upcoming", missing: [], monthsUntil, reason: `In ${monthsUntil} months` }
      : { stage, status: "future", missing: [], reason: `At ${dependency.ageFrom}` };
  }

  if (dependency.ageFrom !== null && dependency.coreDocuments.length > 0 && age > dependency.ageFrom + 12) {
    return { stage, status: "past", missing: [], reason: "Passed" };
  }

  const missing = dependency.requiredDocuments.filter((id) => !holds(member, id));
  if (missing.length > 0) {
    return { stage, status: "blocked", missing, reason: `Needs ${names(missing)}` };
  }

  return { stage, status: "ready", missing: [], reason: dependency.ageFrom !== null && dependency.coreDocuments.length > 0 ? "Open now" : "Papers in place" };
}

function chooseFirst(member: Member, rows: LifeMapRow[], today: Date): FirstAction | null {
  const scores = new Map<string, { count: number; stageIds: string[] }>();
  for (const row of rows.filter((candidate) => candidate.status === "blocked")) {
    for (const id of row.missing) {
      const score = scores.get(id) ?? { count: 0, stageIds: [] };
      score.count += 1;
      score.stageIds.push(row.stage.id);
      scores.set(id, score);
    }
  }
  if (scores.size === 0) return null;

  const daysOld = ageInDays(member, today);
  const age = ageInCompletedYears(member.birthDate, today);
  let id: string | undefined;
  // The brief's acceptance examples make an unregistered minor's legal identity
  // foundational, while a senior's old missing record must not outrank a nominee.
  if (age < 18 && !holds(member, "birth")) id = "birth";
  if (age >= 60 && !holds(member, "nominee") && scores.has("nominee")) id = "nominee";
  if (!id) {
    const ranked = DOCUMENTS.filter((document) => scores.has(document.id)).sort((a, b) => {
      const difference = scores.get(b.id)!.count - scores.get(a.id)!.count;
      if (difference !== 0) return difference;
      if (age >= 60 && a.id === "birth") return 1;
      if (age >= 60 && b.id === "birth") return -1;
      return 0;
    });
    id = ranked[0]?.id;
  }
  if (daysOld < 21 && !holds(member, "birth")) id = "birth";
  if (!id) return null;
  const document = DOCUMENT_BY_ID.get(id);
  const score = scores.get(id);
  if (!document || !score) return null;
  return { document, count: score.count, stageIds: score.stageIds, lateTrack: id === "birth" && age >= 1 };
}

export function analyseMember(member: Member, today: Date): MemberAnalysis {
  const rows = LIFE_STAGES.map((stage) => stageStatus(member, stage, today));
  const upcoming: UpcomingItem[] = [];
  const birth = rows.find((row) => row.stage.id === "birth");
  if (birth?.deadlineDaysLeft !== undefined) {
    upcoming.push({ kind: "deadline", stageId: "birth", daysUntil: birth.deadlineDaysLeft, label: "Free birth registration ends", prepNow: "After 21 days a late fee and extra paperwork apply." });
  }
  for (const row of rows.filter((candidate) => candidate.status === "upcoming")) {
    const dependency = dependencyFor(row.stage);
    upcoming.push({ kind: "stage", stageId: row.stage.id, monthsUntil: row.monthsUntil!, label: row.stage.title, prepNow: dependency.prepNow, prepNow_te: dependency.prepNow_te });
  }
  upcoming.sort((a, b) => (a.kind === "deadline" ? a.daysUntil : a.monthsUntil * 30) - (b.kind === "deadline" ? b.daysUntil : b.monthsUntil * 30));

  const counts = { done: 0, ready: 0, blocked: 0, upcoming: 0, future: 0, past: 0 } satisfies Record<StageStatus, number>;
  for (const row of rows) counts[row.status] += 1;
  return { rows, doFirst: chooseFirst(member, rows, today), upcoming, counts };
}

export function analyseHousehold(members: readonly Member[], today: Date): HouseholdAnalysis {
  const analyses = members.map((member) => analyseMember(member, today));
  return {
    members: members.length,
    blockedStages: analyses.reduce((sum, analysis) => sum + analysis.counts.blocked, 0),
    dueWithin24Months: analyses.reduce((sum, analysis) => sum + analysis.upcoming.filter((item) => item.kind === "stage").length, 0),
    deadlines: analyses.reduce((sum, analysis) => sum + analysis.upcoming.filter((item) => item.kind === "deadline").length, 0),
  };
}

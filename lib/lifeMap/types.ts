import type { DocumentDefinition } from "@/data/documents";
import type { LifeStage } from "@/data/lifeStages";

export type DocState = "have" | "no" | "unsure";
export type StageStatus = "done" | "ready" | "blocked" | "upcoming" | "future" | "past";

export interface Member {
  id: string;
  name: string;
  role: string;
  birthDate: string;
  docs: Record<string, DocState>;
}

export interface LifeMapRow {
  stage: LifeStage;
  status: StageStatus;
  missing: string[];
  reason: string;
  deadlineDaysLeft?: number;
  lateTrack?: boolean;
  monthsUntil?: number;
}

export interface FirstAction {
  document: DocumentDefinition;
  count: number;
  stageIds: string[];
  lateTrack: boolean;
}

export type UpcomingItem =
  | { kind: "deadline"; stageId: "birth"; daysUntil: number; label: string; prepNow: string }
  | { kind: "stage"; stageId: string; monthsUntil: number; label: string; prepNow: string; prepNow_te: string };

export interface MemberAnalysis {
  rows: LifeMapRow[];
  doFirst: FirstAction | null;
  upcoming: UpcomingItem[];
  counts: Record<StageStatus, number>;
}

export interface HouseholdAnalysis {
  members: number;
  blockedStages: number;
  dueWithin24Months: number;
  deadlines: number;
}

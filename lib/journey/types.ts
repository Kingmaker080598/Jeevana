export interface Journey {
  id: string;
  name: string;
  name_te: string;
  intakeQuestions: Question[];
  steps: Step[];
}

export interface Question {
  id: string;
  prompt: string;
  prompt_te: string;
  options: Array<{
    id: string;
    label: string;
    label_te: string;
  }>;
}

export interface Step {
  id: string;
  name: string;
  name_te: string;
  authority: string;
  portal: string;
  fee: string;
  sla: string;
  whyPlain: string;
  whyPlain_te: string;
  officialSource: string | null;
  lastVerified: string;
  documents: string[];
  dependsOn: string[];
  conditions?: Condition[];
  letterTemplateId?: string;
  deadline?: string;
}

export interface Condition {
  questionId: string;
  equals: string;
}

export type IntakeAnswers = Record<string, string>;

export type StepState = "DONE" | "UNLOCKED" | "LOCKED" | "HIDDEN";

export interface ResolvedStep {
  step: Step;
  state: StepState;
  blockingDependencyIds: string[];
  isConditional: boolean;
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { resolveJourney } from "@/lib/journey/resolver";
import type { Journey, ResolvedStep, StepState } from "@/lib/journey/types";
import { useJourneyState } from "./JourneyStateProvider";
import { useLanguage, type Language } from "./LanguageProvider";

const stateTone: Record<Exclude<StepState, "HIDDEN">, string> = {
  DONE: "border-[var(--leaf)] bg-emerald-50 text-[var(--leaf)]",
  UNLOCKED: "border-[var(--marigold)] bg-[var(--marigold-soft)] text-[var(--ink)]",
  LOCKED: "border-[var(--line)] bg-stone-100 text-[var(--muted)]",
};

const stateLabel: Record<Language, Record<Exclude<StepState, "HIDDEN">, string>> = {
  en: { DONE: "DONE", UNLOCKED: "UNLOCKED", LOCKED: "LOCKED" },
  te: { DONE: "పూర్తయింది", UNLOCKED: "అందుబాటులో ఉంది", LOCKED: "లాక్ అయింది" },
};

function isVisibleStep(
  result: ResolvedStep,
): result is ResolvedStep & { state: Exclude<StepState, "HIDDEN"> } {
  return result.state !== "HIDDEN";
}

export function JourneyFlow({ journey }: Readonly<{ journey: Journey }>) {
  const { language } = useLanguage();
  const { state, isHydrated, selectJourney, setAnswer } = useJourneyState();
  const [isEditing, setIsEditing] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const isTelugu = language === "te";
  const progress = state.journeys[journey.id] ?? { answers: {}, completedStepIds: [] };
  const intakeComplete = journey.intakeQuestions.every(
    (question) => progress.answers[question.id],
  );
  const showIntake = journey.intakeQuestions.length > 0 && (!intakeComplete || isEditing);

  const resolvedSteps = useMemo(
    () => resolveJourney(journey, progress.answers, new Set(progress.completedStepIds)),
    [journey, progress.answers, progress.completedStepIds],
  );
  const stepNames = useMemo(
    () => new Map(journey.steps.map((step) => [step.id, isTelugu ? step.name_te : step.name])),
    [isTelugu, journey.steps],
  );

  useEffect(() => {
    selectJourney(journey.id);
  }, [journey.id, selectJourney]);

  if (!isHydrated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--muted)]">
        {isTelugu ? "మీ దశలను సిద్ధం చేస్తున్నాం…" : "Preparing your journey…"}
      </main>
    );
  }

  if (showIntake) {
    const question = journey.intakeQuestions[questionIndex];
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <Link href="/" className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--leaf)]">
          ← {isTelugu ? "అన్ని జీవిత దశలు" : "All life events"}
        </Link>
        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--marigold-dark)]">
            {isTelugu ? journey.name_te : journey.name}
          </p>
          <p className="font-mono text-xs text-[var(--muted)]">
            {questionIndex + 1} / {journey.intakeQuestions.length}
          </p>
        </div>
        <div className="mt-3 h-1 bg-[var(--line)]">
          <div
            className="h-full bg-[var(--marigold)] transition-[width]"
            style={{ width: `${((questionIndex + 1) / journey.intakeQuestions.length) * 100}%` }}
          />
        </div>
        <h1
          className="mt-10 font-serif text-4xl font-bold leading-tight text-[var(--ink)]"
          aria-label={isTelugu ? question.prompt_te : question.prompt}
        >
          {isTelugu ? question.prompt_te : question.prompt}
        </h1>
        <div className="mt-8 grid gap-3">
          {question.options.map((option) => {
            const selected = progress.answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setAnswer(journey.id, question.id, option.id);
                  if (questionIndex < journey.intakeQuestions.length - 1) {
                    setQuestionIndex((current) => current + 1);
                  } else {
                    setIsEditing(false);
                  }
                }}
                className={`min-h-14 border px-5 py-4 text-left text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2 ${
                  selected
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--ink)]"
                }`}
              >
                {isTelugu ? option.label_te : option.label}
                <span className="ml-2 text-sm opacity-60">
                  {isTelugu ? option.label : option.label_te}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--leaf)]">
        ← {isTelugu ? "అన్ని జీవిత దశలు" : "All life events"}
      </Link>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-5 border-b-4 border-[var(--ink)] pb-5">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--marigold-dark)]">
            {isTelugu ? journey.name_te : journey.name}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-[var(--ink)]">
            {isTelugu ? "మీ రోడ్‌మ్యాప్" : "Your roadmap"}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setQuestionIndex(0);
            setIsEditing(true);
          }}
          className="min-h-11 border border-[var(--ink)] bg-white px-4 font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
        >
          {isTelugu ? "సమాధానాలు మార్చండి" : "Change answers"}
        </button>
      </div>

      <ol className="mt-7 grid gap-4">
        {resolvedSteps
          .filter(isVisibleStep)
          .map((result, index) => {
            const name = isTelugu ? result.step.name_te : result.step.name;
            const blockers = result.blockingDependencyIds
              .map((id) => stepNames.get(id) ?? id)
              .join(", ");
            const card = (
              <div className="flex gap-4 border border-[var(--line)] bg-white p-4 sm:p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--ink)] font-mono text-xs font-bold">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl font-bold text-[var(--ink)]">{name}</h2>
                    {result.isConditional ? (
                      <span className="bg-[var(--leaf)] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                        {isTelugu ? "మీ కోసం చేర్చాం" : "Added for you"}
                      </span>
                    ) : null}
                  </div>
                  <span className={`mt-3 inline-block border px-2 py-1 font-mono text-[10px] font-bold tracking-wider ${stateTone[result.state]}`}>
                    {stateLabel[language][result.state]}
                  </span>
                  {result.state === "LOCKED" ? (
                    <p className="mt-3 text-sm text-[var(--muted)]">
                      {isTelugu ? "దీనికోసం వేచి ఉంది: " : "Waiting on: "}{blockers}
                    </p>
                  ) : null}
                </div>
                {result.state !== "LOCKED" ? <span aria-hidden="true">→</span> : null}
              </div>
            );

            return (
              <li key={result.step.id}>
                {result.state === "UNLOCKED" || result.state === "DONE" ? (
                  <Link
                    href={`/journey/${journey.id}/step/${result.step.id}`}
                    className="block transition-colors hover:outline hover:outline-2 hover:outline-[var(--marigold)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]"
                  >
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </li>
            );
          })}
      </ol>
    </main>
  );
}

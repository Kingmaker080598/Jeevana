"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { resolveJourney } from "@/lib/journey/resolver";
import { isTeluguEnabled } from "@/lib/features";
import type { Journey } from "@/lib/journey/types";
import { useJourneyState } from "./JourneyStateProvider";
import { useLanguage } from "./LanguageProvider";

function firstStepPath(journey: Journey, answers: Record<string, string>, completed: string[]) {
  const resolved = resolveJourney(journey, answers, new Set(completed));
  const destination =
    resolved.find(({ state }) => state === "UNLOCKED") ??
    resolved.find(({ state }) => state !== "HIDDEN");

  return destination ? `/journey/${journey.id}/step/${destination.step.id}` : "/";
}

export function JourneyFlow({
  journey,
  forceEdit = false,
}: Readonly<{ journey: Journey; forceEdit?: boolean }>) {
  const router = useRouter();
  const { language } = useLanguage();
  const { state, isHydrated, selectJourney, setAnswer } = useJourneyState();
  const [isEditing, setIsEditing] = useState(forceEdit);
  const [questionIndex, setQuestionIndex] = useState(0);
  const enableTelugu = isTeluguEnabled();
  const isTelugu = enableTelugu && language === "te";
  const progress = state.journeys[journey.id] ?? { answers: {}, completedStepIds: [] };
  const intakeComplete = journey.intakeQuestions.every(
    (question) => progress.answers[question.id],
  );
  const destination = useMemo(
    () => firstStepPath(journey, progress.answers, progress.completedStepIds),
    [journey, progress.answers, progress.completedStepIds],
  );

  useEffect(() => {
    if (isHydrated) selectJourney(journey.id);
  }, [isHydrated, journey.id, selectJourney]);

  useEffect(() => {
    if (isHydrated && intakeComplete && !isEditing) router.replace(destination);
  }, [destination, intakeComplete, isEditing, isHydrated, router]);

  if (!isHydrated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--muted)]">
        {isTelugu ? "మీ దశలను సిద్ధం చేస్తున్నాం…" : "Preparing your journey…"}
      </main>
    );
  }

  if (intakeComplete && !isEditing) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--muted)]">
        {isTelugu ? "మీ రోడ్‌మ్యాప్ తెరుస్తున్నాం…" : "Opening your roadmap…"}
      </main>
    );
  }

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
              {enableTelugu ? <span className="ml-2 text-sm opacity-60">
                {isTelugu ? option.label : option.label_te}
              </span> : null}
            </button>
          );
        })}
      </div>
    </main>
  );
}

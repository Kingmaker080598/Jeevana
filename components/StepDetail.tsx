"use client";

import { useEffect, useMemo } from "react";
import { resolveJourney } from "@/lib/journey/resolver";
import { isTeluguEnabled } from "@/lib/features";
import type { Journey, Step } from "@/lib/journey/types";
import { useJourneyState } from "./JourneyStateProvider";
import { useLanguage } from "./LanguageProvider";

export function StepDetail({ journey, step }: Readonly<{ journey: Journey; step: Step }>) {
  const { language } = useLanguage();
  const { state, isHydrated, selectJourney, toggleCompleted } = useJourneyState();
  const isTelugu = isTeluguEnabled() && language === "te";
  const progress = state.journeys[journey.id] ?? { answers: {}, completedStepIds: [] };
  const resolved = useMemo(
    () =>
      resolveJourney(journey, progress.answers, new Set(progress.completedStepIds)).find(
        (result) => result.step.id === step.id,
      ),
    [journey, progress.answers, progress.completedStepIds, step.id],
  );

  useEffect(() => {
    selectJourney(journey.id);
  }, [journey.id, selectJourney]);

  if (!isHydrated || !resolved) {
    return (
      <div className="py-16 text-center text-[var(--muted)]">
        {isTelugu ? "దశ వివరాలు సిద్ధం చేస్తున్నాం…" : "Preparing step details…"}
      </div>
    );
  }

  const canToggle = resolved.state === "UNLOCKED" || resolved.state === "DONE";
  const blockers = resolved.blockingDependencyIds
    .map((id) => journey.steps.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is Step => Boolean(candidate))
    .map((candidate) => (isTelugu ? candidate.name_te : candidate.name));

  return (
    <div>
      <article className="border border-[var(--line)] bg-white">
        <header className="border-b-4 border-[var(--marigold)] p-5 sm:p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--marigold-dark)]">
            {isTelugu ? journey.name_te : journey.name} · {resolved.state}
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight text-[var(--ink)] sm:text-5xl">
            {isTelugu ? step.name_te : step.name}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            {isTelugu ? step.whyPlain_te : step.whyPlain}
          </p>
        </header>

        <div className="grid gap-px bg-[var(--line)] sm:grid-cols-3">
          {[
            [isTelugu ? "అధికారం" : "Authority", step.authority],
            [isTelugu ? "రుసుము" : "Fee", step.fee || "—"],
            [isTelugu ? "సమయం" : "SLA", step.sla || "—"],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-5">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                {label}
              </dt>
              <dd className="mt-2 font-semibold text-[var(--ink)]">{value}</dd>
            </div>
          ))}
        </div>

        <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-2">
          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">
              {isTelugu ? "అవసరమైన పత్రాలు" : "Documents"}
            </h2>
            {step.documents.length > 0 ? (
              <ul className="mt-4 grid gap-2">
                {step.documents.map((document) => (
                  <li key={document} className="border-l-4 border-[var(--marigold)] bg-[var(--paper)] px-4 py-3 text-sm">
                    {document}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">
                {isTelugu ? "పత్రాలు పేర్కొనలేదు." : "No documents listed."}
              </p>
            )}
          </section>

          <div className="grid content-start gap-5">
            {step.deadline ? (
              <section className="border border-[var(--marigold)] bg-[var(--marigold-soft)] p-4">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider">
                  {isTelugu ? "గడువు గమనిక" : "Deadline note"}
                </h2>
                <p className="mt-2 text-sm leading-6">{step.deadline}</p>
              </section>
            ) : null}
            <section className="border border-dashed border-[var(--line)] bg-stone-50 p-4">
              <h2 className="font-serif text-xl font-bold text-[var(--ink)]">Nearest office</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Office lookup will appear here.</p>
            </section>
            {step.letterTemplateId ? (
              <section className="border border-dashed border-[var(--line)] bg-stone-50 p-4">
                <h2 className="font-serif text-xl font-bold text-[var(--ink)]">Letter generator</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Template: {step.letterTemplateId}. Generator controls will appear here.
                </p>
              </section>
            ) : null}
          </div>
        </div>
      </article>

      {resolved.state === "LOCKED" ? (
        <div className="mt-5 border border-[var(--line)] bg-stone-100 p-4 text-sm text-[var(--muted)]">
          {isTelugu ? "ముందుగా పూర్తి చేయాలి: " : "Complete first: "}
          {blockers.join(", ")}
        </div>
      ) : null}

      {canToggle ? (
        <button
          type="button"
          onClick={() => {
            toggleCompleted(journey.id, step.id);
          }}
          className="mt-6 min-h-14 w-full bg-[var(--ink)] px-6 text-base font-bold text-white transition-colors hover:bg-[var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2 sm:w-auto"
        >
          {resolved.state === "DONE"
            ? isTelugu
              ? "పూర్తి కాలేదని గుర్తించండి"
              : "Mark incomplete"
            : isTelugu
              ? "పూర్తయిందిగా గుర్తించండి"
              : "Mark done"}
        </button>
      ) : null}
    </div>
  );
}

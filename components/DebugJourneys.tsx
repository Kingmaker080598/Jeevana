"use client";

import { useMemo } from "react";
import { resolveJourney } from "@/lib/journey/resolver";
import { isTeluguEnabled } from "@/lib/features";
import type { Journey, StepState } from "@/lib/journey/types";
import type { JourneyProgress } from "@/lib/state/journeyState";
import { useJourneyState } from "./JourneyStateProvider";

const EMPTY_PROGRESS: JourneyProgress = { answers: {}, completedStepIds: [] };

const stateStyles: Record<StepState, string> = {
  DONE: "border-emerald-300 bg-emerald-50 text-emerald-800",
  UNLOCKED: "border-sky-300 bg-sky-50 text-sky-800",
  LOCKED: "border-amber-300 bg-amber-50 text-amber-900",
  HIDDEN: "border-slate-300 bg-slate-100 text-slate-600",
};

interface JourneyCardProps {
  journey: Journey;
  progress: JourneyProgress;
  setAnswer: (journeyId: string, questionId: string, optionId: string) => void;
  toggleCompleted: (journeyId: string, stepId: string) => void;
}

function JourneyCard({
  journey,
  progress,
  setAnswer,
  toggleCompleted,
}: JourneyCardProps) {
  const resolvedSteps = useMemo(
    () => resolveJourney(journey, progress.answers, new Set(progress.completedStepIds)),
    [journey, progress.answers, progress.completedStepIds],
  );
  const enableTelugu = isTeluguEnabled();

  return (
    <section className="overflow-hidden rounded-sm border border-slate-300 bg-white shadow-sm">
      <div className="border-b-4 border-emerald-700 bg-slate-950 px-5 py-4 text-white">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-300">
          Journey / {journey.id}
        </p>
        <h2 className="mt-2 font-serif text-2xl leading-tight">
          {journey.name} {enableTelugu ? <><span className="text-slate-400">/</span> {journey.name_te}</> : null}
        </h2>
      </div>

      <div className="space-y-6 p-5">
        {journey.intakeQuestions.length > 0 ? (
          <fieldset className="grid gap-4 border border-slate-200 bg-slate-50 p-4">
            <legend className="px-2 font-mono text-xs font-semibold uppercase tracking-widest text-slate-600">
              Intake answers
            </legend>
            {journey.intakeQuestions.map((question) => {
              const inputId = `${journey.id}-${question.id}`;
              return (
                <label key={question.id} htmlFor={inputId} className="grid gap-2 text-sm">
                  <span className="font-semibold text-slate-800">
                    {question.prompt} {enableTelugu ? ` / ${question.prompt_te}` : null}
                  </span>
                  <select
                    id={inputId}
                    className="min-h-11 rounded-sm border border-slate-400 bg-white px-3 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
                    value={progress.answers[question.id] ?? ""}
                    onChange={(event) =>
                      setAnswer(journey.id, question.id, event.target.value)
                    }
                  >
                    <option value="">Choose an answer</option>
                    {question.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label} {enableTelugu ? ` / ${option.label_te}` : null}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </fieldset>
        ) : null}

        {resolvedSteps.length > 0 ? (
          <ol className="grid gap-4">
            {resolvedSteps.map((result, index) => {
              const canToggle = result.state === "UNLOCKED" || result.state === "DONE";
              return (
                <li key={result.step.id}>
                  <article className="border-l-4 border-l-slate-800 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-slate-500">
                          STEP {String(index + 1).padStart(2, "0")} · {result.step.id}
                        </p>
                        <h3 className="mt-1 font-serif text-xl text-slate-950">
                          {result.step.name} {enableTelugu ? ` / ${result.step.name_te}` : null}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.isConditional ? (
                          <span className="border border-fuchsia-300 bg-fuchsia-50 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-fuchsia-800">
                            Personalized
                          </span>
                        ) : null}
                        <span
                          className={`border px-2 py-1 font-mono text-[11px] font-bold tracking-wide ${stateStyles[result.state]}`}
                        >
                          {result.state}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
                      {result.step.whyPlain}
                    </p>
                    <dl className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                      <div>
                        <dt className="font-mono uppercase text-slate-400">Authority</dt>
                        <dd className="mt-1 text-slate-700">{result.step.authority}</dd>
                      </div>
                      <div>
                        <dt className="font-mono uppercase text-slate-400">Fee</dt>
                        <dd className="mt-1 text-slate-700">{result.step.fee}</dd>
                      </div>
                      <div>
                        <dt className="font-mono uppercase text-slate-400">SLA</dt>
                        <dd className="mt-1 text-slate-700">{result.step.sla}</dd>
                      </div>
                    </dl>

                    {result.blockingDependencyIds.length > 0 ? (
                      <p className="mt-4 font-mono text-xs text-amber-800">
                        Blocked by: {result.blockingDependencyIds.join(", ")}
                      </p>
                    ) : null}

                    {canToggle ? (
                      <button
                        type="button"
                        className="mt-4 border border-slate-950 bg-slate-950 px-3 py-2 font-mono text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                        onClick={() => toggleCompleted(journey.id, result.step.id)}
                      >
                        {result.state === "DONE"
                          ? `Mark ${result.step.name} incomplete`
                          : `Mark ${result.step.name} complete`}
                      </button>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center font-mono text-sm text-slate-500">
            No steps supplied yet.
          </p>
        )}
      </div>
    </section>
  );
}

export function DebugJourneys({ journeys }: Readonly<{ journeys: Journey[] }>) {
  const { state, setAnswer, toggleCompleted, reset } = useJourneyState();

  return (
    <main className="min-h-screen bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-l-8 border-amber-500 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-emerald-800">
                Andhra Pradesh · Synthetic prototype
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Jeevana
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Journey graph debug console. Intake answers and completion are stored only
                in this browser.
              </p>
            </div>
            <button
              type="button"
              className="border border-slate-400 bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-wide text-slate-700 hover:border-red-700 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
              onClick={reset}
            >
              Reset local state
            </button>
          </div>
        </header>

        <div className="grid gap-6">
          {journeys.map((journey) => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              progress={state.journeys[journey.id] ?? EMPTY_PROGRESS}
              setAnswer={setAnswer}
              toggleCompleted={toggleCompleted}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

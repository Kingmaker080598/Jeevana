"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { resolveJourney } from "@/lib/journey/resolver";
import type { Journey, ResolvedStep } from "@/lib/journey/types";
import { useJourneyState } from "./JourneyStateProvider";
import { useLanguage } from "./LanguageProvider";

const statusLabel = { DONE: "Done", UNLOCKED: "Available", LOCKED: "Blocked" } as const;

function StepList({ journey, steps, pathname }: Readonly<{
  journey: Journey;
  steps: ResolvedStep[];
  pathname: string;
}>) {
  const names = new Map(journey.steps.map((step) => [step.id, step.name]));

  return (
    <ol className="grid gap-1 py-2">
      {steps.map((result, index) => {
        const href = `/journey/${journey.id}/step/${result.step.id}`;
        const isActive = pathname === href;
        const blockers = result.blockingDependencyIds.map((id) => names.get(id) ?? id).join(", ");
        const content = (
          <>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current font-mono text-[10px] font-bold">{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-5">{result.step.name}</span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                {statusLabel[result.state as keyof typeof statusLabel]}
              </span>
              {result.state === "LOCKED" ? (
                <span className="mt-1 block text-xs leading-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">Blocked by {blockers}</span>
              ) : null}
            </span>
          </>
        );

        return (
          <li key={result.step.id}>
            {result.state === "LOCKED" ? (
              <div tabIndex={0} title={`Blocked by ${blockers}`} className="group flex cursor-not-allowed gap-3 border-l-4 border-transparent px-3 py-3 text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--marigold)]">
                {content}
              </div>
            ) : (
              <Link href={href} aria-current={isActive ? "step" : undefined} className={`group flex gap-3 border-l-4 px-3 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--marigold)] ${isActive ? "border-[var(--marigold)] bg-[var(--marigold-soft)] text-[var(--ink)]" : "border-transparent text-[var(--ink)] hover:bg-white"}`}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function JourneyRoadmapLayout({ journey, children }: Readonly<{ journey: Journey; children: ReactNode }>) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { state, isHydrated } = useJourneyState();
  const progress = state.journeys[journey.id] ?? { answers: {}, completedStepIds: [] };
  const steps = useMemo(
    () => resolveJourney(journey, progress.answers, new Set(progress.completedStepIds)).filter(({ state: stepState }) => stepState !== "HIDDEN"),
    [journey, progress.answers, progress.completedStepIds],
  );
  const activeIndex = steps.findIndex(({ step }) => pathname === `/journey/${journey.id}/step/${step.id}`);

  if (!isHydrated) {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--muted)]">Preparing your roadmap…</main>;
  }

  const navigation = <StepList journey={journey} steps={steps} pathname={pathname} />;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-5 flex items-center justify-between gap-4 lg:hidden">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Step {activeIndex + 1} of {steps.length}</p>
        <Link href="/" className="text-sm font-semibold text-[var(--leaf)]">All journeys</Link>
      </div>
      <details className="mb-5 border border-[var(--line)] bg-white lg:hidden">
        <summary className="cursor-pointer px-4 py-3 font-serif text-xl font-bold focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--marigold)]">All steps</summary>
        <div className="border-t border-[var(--line)] px-2">
          {navigation}
          <Link href={`/journey/${journey.id}?edit=1`} className="mb-3 block px-3 py-2 text-sm font-bold text-[var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]">Change answers</Link>
        </div>
      </details>
      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="hidden border border-[var(--line)] bg-[var(--paper)] lg:sticky lg:top-4 lg:block lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <div className="border-b border-[var(--line)] px-4 py-4">
            <Link href="/" className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--leaf)]">← All journeys</Link>
            <h1 className="mt-2 font-serif text-2xl font-bold text-[var(--ink)]">{language === "te" ? journey.name_te : journey.name}</h1>
          </div>
          <nav aria-label="Journey steps" className="px-2">{navigation}</nav>
          <div className="border-t border-[var(--line)] p-3">
            <Link href={`/journey/${journey.id}?edit=1`} className="block px-3 py-2 text-sm font-bold text-[var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]">Change answers</Link>
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}

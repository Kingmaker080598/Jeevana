"use client";

import Link from "next/link";
import type { LifeStage } from "@/data/lifeStages";
import type { JourneyEvidence } from "@/lib/journey/evidence";

interface HomeContentProps {
  stages: readonly LifeStage[];
  evidence: JourneyEvidence;
}

const EVIDENCE_CAPTIONS: ReadonlyArray<{
  key: keyof JourneyEvidence;
  caption: string;
}> = [
  { key: "steps", caption: "Steps" },
  { key: "departments", caption: "Departments involved" },
  { key: "portals", caption: "Separate portals" },
  { key: "documentedSequences", caption: "Places the sequence is documented" },
];

export function HomeContent({ stages, evidence }: Readonly<HomeContentProps>) {
  const liveStages = stages.filter((stage) => stage.status === "live");
  const plannedStages = stages.filter((stage) => stage.status === "planned");

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
      <section className="max-w-5xl border-l-8 border-[var(--marigold)] pl-5 sm:pl-8">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[var(--leaf)]">
          Built for India. Piloted in Andhra Pradesh.
        </p>
        <h1 className="mt-3 max-w-5xl font-serif text-4xl font-bold leading-[1.04] tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
          After a birth or a death, no one tells you what comes next.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg">
          Government portals exist for each department, but nothing publishes the order. People rely on relatives, agents, and search.
        </p>
      </section>

      <section className="mt-7 border-y border-[var(--line)]" aria-label="Evidence from the death journey">
        <dl className="grid grid-cols-4 divide-x divide-[var(--line)]">
          {EVIDENCE_CAPTIONS.map(({ key, caption }) => (
            <div key={key} className="px-2 py-4 sm:px-5">
              <dd className="font-serif text-3xl font-bold leading-none text-[var(--ink)] sm:text-4xl">
                {evidence[key]}
              </dd>
              <dt className="mt-2 max-w-32 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-[var(--muted)] sm:text-[10px]">
                {caption}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8" aria-labelledby="open-now-heading">
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-[var(--ink)] pb-2">
          <h2 id="open-now-heading" className="font-serif text-3xl font-bold text-[var(--ink)]">
            Open now
          </h2>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">
            3 guided journeys
          </p>
        </div>

        <ol className="mt-4 grid gap-4 lg:grid-cols-3">
          {liveStages.map((stage) => (
            <li key={stage.id} aria-label={stage.title}>
              <Link
                href={`/journey/${stage.journeyId}`}
                className="group flex h-full min-h-52 flex-col border border-[var(--ink)] bg-white p-5 shadow-[5px_5px_0_var(--marigold)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--marigold)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
              >
                <span className="font-mono text-xs font-bold tracking-[0.18em] text-[var(--leaf)]">
                  {String(stage.order).padStart(2, "0")}
                </span>
                <span className="mt-4 font-serif text-2xl font-bold leading-tight text-[var(--ink)] sm:text-3xl">
                  {stage.title}
                </span>
                <span className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">
                  {stage.description}
                </span>
                <span className="mt-4 border-t border-[var(--line)] pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">
                  Open journey <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14" aria-labelledby="planned-heading">
        <div className="border-b border-[var(--line)] pb-3">
          <h2 id="planned-heading" className="font-serif text-2xl font-bold text-[var(--ink)] sm:text-3xl">
            Thirteen more stages mapped, not yet built.
          </h2>
        </div>

        <ol className="mt-4 grid gap-x-10 md:grid-cols-2">
          {plannedStages.map((stage) => (
            <li key={stage.id} className="border-b border-[var(--line)]">
              <div
                role="group"
                aria-label={stage.title}
                aria-disabled="true"
                className="flex min-h-12 items-center gap-3 py-3 text-stone-500"
              >
                <span className="w-7 shrink-0 font-mono text-[10px] font-bold tracking-wider text-stone-400">
                  {String(stage.order).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate font-serif text-base font-bold sm:text-lg">
                  {stage.title}
                </span>
                <span className="border border-[var(--line)] px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Planned
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

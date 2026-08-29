"use client";

import Link from "next/link";
import type { LifeStage } from "@/data/lifeStages";
import type { JourneyEvidence } from "@/lib/journey/evidence";
import { JourneyPathArt } from "./JourneyPathArt";

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

function FrameMark({ position }: Readonly<{ position: "tl" | "tr" | "bl" | "br" }>) {
  const classes = {
    tl: "left-0 top-0 border-l-2 border-t-2",
    tr: "right-0 top-0 border-r-2 border-t-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  }[position];

  return <span aria-hidden="true" className={`absolute h-5 w-5 border-[var(--ink)] ${classes}`} />;
}

export function HomeContent({ stages, evidence }: Readonly<HomeContentProps>) {
  const liveStages = stages.filter((stage) => stage.status === "live");

  return (
    <main className="relative">
      {/* ——— Hero, framed like the brand plate ——— */}
      <section className="border-b border-[var(--line)]" aria-labelledby="hero-heading">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8">
          <div className="relative border border-[var(--line)] px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
            <FrameMark position="tl" />
            <FrameMark position="tr" />
            <FrameMark position="bl" />
            <FrameMark position="br" />

            <div className="relative">
              <JourneyPathArt className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto lg:block" />

              <div className="relative z-10">
                <p
                  className="rise-in font-serif text-4xl font-bold tracking-tight text-[var(--leaf)] sm:text-5xl"
                  style={{ animationDelay: "0.05s" }}
                >
                  Jeevana
                </p>
                <span
                  aria-hidden="true"
                  className="rise-in mt-3 block h-1 w-28 bg-[var(--marigold)]"
                  style={{ animationDelay: "0.1s" }}
                />

                <h1
                  id="hero-heading"
                  className="rise-in mt-8 max-w-4xl font-serif text-[2.35rem] font-bold leading-[1.08] tracking-tight text-[var(--ink)] sm:text-6xl lg:text-[4rem]"
                  style={{ animationDelay: "0.15s" }}
                >
                  Life doesn&apos;t happen{" "}
                  <br className="hidden lg:block" aria-hidden="true" />
                  department by department.
                </h1>

                <div
                  aria-hidden="true"
                  className="hero-rule relative mt-8 h-0 max-w-2xl border-t border-dotted border-[var(--marigold)]"
                >
                  <span className="absolute -left-1 -top-[4.5px] h-2 w-2 rounded-full bg-[var(--marigold)]" />
                </div>

                <p
                  className="rise-in mt-6 font-sans text-lg font-medium text-[var(--leaf)] sm:text-xl"
                  style={{ animationDelay: "0.25s" }}
                >
                  Built for India. Piloted in Andhra Pradesh.
                </p>

                <p
                  className="rise-in mt-4 max-w-xl text-base leading-7 text-[var(--muted)]"
                  style={{ animationDelay: "0.35s" }}
                >
                  After a birth or a death, no one tells you what comes next. Government portals
                  exist for each department, but nothing publishes the order. Jeevana turns
                  scattered services into one guided path.
                </p>

                <div className="rise-in mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.45s" }}>
                  <a
                    href="#journeys"
                    className="inline-flex min-h-12 items-center gap-2 border-2 border-[var(--ink)] bg-[var(--ink)] px-6 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_var(--marigold)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--marigold)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
                  >
                    Start a journey <span aria-hidden="true">↓</span>
                  </a>
                  <a
                    href="#roadmap"
                    className="inline-flex min-h-12 items-center border-2 border-[var(--ink)] bg-transparent px-6 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
                  >
                    See the roadmap
                  </a>
                </div>

                <JourneyPathArt className="mx-auto mt-10 h-64 w-auto sm:h-72 lg:hidden" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        {/* ——— Evidence strip ——— */}
        <section className="mt-8 border-y border-[var(--line)]" aria-label="Evidence from the death journey">
          <dl className="grid grid-cols-4 divide-x divide-[var(--line)]">
            {EVIDENCE_CAPTIONS.map(({ key, caption }) => (
              <div key={key} className="px-2 py-4 sm:px-5">
                <dd
                  className={`font-serif text-3xl font-black leading-none sm:text-4xl ${
                    key === "documentedSequences" ? "text-[var(--marigold-dark)]" : "text-[var(--ink)]"
                  }`}
                >
                  {evidence[key]}
                </dd>
                <dt className="mt-2 max-w-32 font-mono text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-[var(--muted)] sm:text-[10px]">
                  {caption}
                </dt>
              </div>
            ))}
          </dl>
          <p className="border-t border-[var(--line)] px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] sm:px-5">
            What one family faces after a death — before Jeevana.
          </p>
        </section>

        {/* ——— Live journeys ——— */}
        <section id="journeys" className="mt-12 scroll-mt-24" aria-labelledby="open-now-heading">
          <div className="flex items-baseline justify-between gap-4 border-b-2 border-[var(--ink)] pb-2">
            <h2 id="open-now-heading" className="font-serif text-3xl font-bold text-[var(--ink)]">
              Open now
            </h2>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">
              3 guided journeys
            </p>
          </div>

          <ol className="mt-5 grid gap-4 lg:grid-cols-3">
            {liveStages.map((stage, index) => (
              <li key={stage.id} aria-label={stage.title}>
                <Link
                  href={`/journey/${stage.journeyId}`}
                  className="group flex h-full min-h-52 flex-col border border-[var(--ink)] bg-white p-5 shadow-[5px_5px_0_var(--marigold)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--marigold)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 font-serif text-lg font-bold ${
                      index === liveStages.length - 1
                        ? "border-[var(--marigold)] bg-[var(--marigold)] text-white"
                        : "border-[var(--leaf)] text-[var(--leaf)]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="mt-4 font-serif text-2xl font-bold leading-tight text-[var(--ink)] sm:text-3xl">
                    {stage.title}
                  </span>
                  <span className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">
                    {stage.description}
                  </span>
                  <span className="mt-4 border-t border-[var(--line)] pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">
                    Open journey{" "}
                    <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* ——— How it works ——— */}
        <section id="how-it-works" className="mt-14 scroll-mt-24" aria-labelledby="how-it-works-heading">
          <div className="border-b border-[var(--line)] pb-3">
            <h2 id="how-it-works-heading" className="font-serif text-2xl font-bold text-[var(--ink)] sm:text-3xl">
              How Jeevana works
            </h2>
          </div>

          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[var(--leaf)]">01</span>
              <h3 className="mt-2 font-serif text-lg font-bold text-[var(--ink)]">Choose a life event</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Start with what changed, not the department that owns a form.</p>
            </li>

            <li className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[var(--leaf)]">02</span>
              <h3 className="mt-2 font-serif text-lg font-bold text-[var(--ink)]">Answer a few questions</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">See only the steps that match your situation.</p>
            </li>

            <li className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[var(--leaf)]">03</span>
              <h3 className="mt-2 font-serif text-lg font-bold text-[var(--ink)]">Receive an ordered path</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">What to do first, what follows, and what is blocked.</p>
            </li>

            <li className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[var(--leaf)]">04</span>
              <h3 className="mt-2 font-serif text-lg font-bold text-[var(--ink)]">Continue through official sources</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Verified government pages for the actual service.</p>
            </li>
          </ol>
        </section>

        {/* ——— Roadmap ——— */}
        <section id="roadmap" className="mt-14 scroll-mt-24" aria-labelledby="planned-heading">
          <div className="border-b border-[var(--line)] pb-3">
            <h2 id="planned-heading" className="font-serif text-2xl font-bold text-[var(--ink)] sm:text-3xl">
              A roadmap for the whole of life
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-[var(--muted)]">
              The pilot begins with three journeys. The same event-first model can make the rest of life&apos;s administrative moments easier to navigate.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="h-4 w-4 rounded-full bg-[var(--leaf)]" /> Open now
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="h-4 w-4 rounded-full border-2 border-dashed border-[var(--line)] bg-white" /> Planned
            </span>
          </div>

          <ol className="mt-6 grid gap-x-14 gap-y-7 lg:grid-cols-2">
            {[stages.slice(0, 8), stages.slice(8)].map((column, columnIndex) => (
              <li key={columnIndex} className="list-none">
                <ol>
                  {column.map((stage, rowIndex) => {
                    const isLive = stage.status === "live";
                    const isLastStop = stage.order === stages.length;
                    const isColumnEnd = rowIndex === column.length - 1;
                    const node = (
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full font-serif text-base font-bold transition-transform ${
                          isLive
                            ? isLastStop
                              ? "bg-[var(--marigold)] text-white shadow-[2px_2px_0_var(--leaf)] group-hover:-translate-y-0.5"
                              : "bg-[var(--leaf)] text-white shadow-[2px_2px_0_var(--marigold)] group-hover:-translate-y-0.5"
                            : "border-2 border-dashed border-[var(--line)] bg-white text-[var(--muted)]"
                        }`}
                      >
                        {stage.order}
                      </span>
                    );
                    const spine = !isColumnEnd && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-5 top-11 -ml-px border-l-2 border-dotted border-[var(--line)]"
                      />
                    );

                    if (isLive) {
                      return (
                        <li key={stage.id} className="relative pb-7 pl-14 last:pb-0">
                          {spine}
                          <Link
                            href={`/journey/${stage.journeyId}`}
                            className="group block focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
                          >
                            {node}
                            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <span className="font-serif text-lg font-bold text-[var(--ink)] underline decoration-[var(--marigold)] decoration-2 underline-offset-4">
                                {stage.title}
                              </span>
                              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--leaf)]">
                                Open journey{" "}
                                <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
                                  →
                                </span>
                              </span>
                            </span>
                            <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{stage.description}</span>
                          </Link>
                        </li>
                      );
                    }

                    return (
                      <li key={stage.id} className="relative pb-7 pl-14 last:pb-0">
                        {spine}
                        <div role="group" aria-label={stage.title} aria-disabled="true">
                          {node}
                          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-serif text-lg font-bold text-[var(--ink)]">{stage.title}</span>
                            <span className="border border-[var(--line)] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-[var(--muted)]">
                              Planned
                            </span>
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{stage.description}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </li>
            ))}
          </ol>
        </section>

        {/* ——— Why ——— */}
        <section id="why" className="mt-12 scroll-mt-24" aria-labelledby="why-heading">
          <div className="border-b border-[var(--line)] pb-3">
            <h2 id="why-heading" className="font-serif text-2xl font-bold text-[var(--ink)] sm:text-3xl">
              Why Jeevana
            </h2>
          </div>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            Government services are published by department. People experience them as a sequence. Jeevana does not replace official portals. It supplies the connective tissue: what comes first, what depends on it, and where to continue officially.
          </p>
        </section>

        <footer className="mt-12 border-t border-[var(--line)] pt-6">
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Jeevana is an independent demonstration, not an official government service. Requirements, fees, and timelines can change; always confirm details through the official sources linked inside each journey.
          </p>
        </footer>
      </div>
    </main>
  );
}

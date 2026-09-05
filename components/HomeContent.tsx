"use client";

import Link from "next/link";
import type { LifeStage } from "@/data/lifeStages";
import type { JourneyEvidence } from "@/lib/journey/evidence";
import { JourneyPathArt } from "./JourneyPathArt";
import { LifeMap } from "./LifeMap";
import { VerifiedSmsMock } from "./VerifiedSmsMock";

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
                  className="rise-in mt-6 max-w-3xl font-serif text-2xl font-bold leading-snug text-[var(--leaf)] sm:text-3xl"
                  style={{ animationDelay: "0.25s" }}
                >
                  Jeevana tells you what to do next, what you missed, and what&apos;s coming.
                </p>

                <p
                  className="rise-in mt-4 max-w-xl text-base leading-7 text-[var(--muted)]"
                  style={{ animationDelay: "0.35s" }}
                >
                  <strong className="mb-2 block font-medium text-[var(--leaf)]">Built for India. Piloted in Andhra Pradesh.</strong>
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
                  <Link
                    href="/life-map"
                    className="inline-flex min-h-12 items-center border-2 border-[var(--ink)] bg-transparent px-6 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
                  >
                    Map your household
                  </Link>
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

        {/* ——— Household Life Map ——— */}
        <section id="life-map-preview" className="mt-16 scroll-mt-24" aria-labelledby="life-map-preview-heading">
          <div className="grid gap-7 lg:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <span className="inline-block bg-[var(--marigold)] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]">New</span>
              <h2 id="life-map-preview-heading" className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl">One map for the whole household</h2>
              <span aria-hidden="true" className="mt-4 block h-1 w-20 bg-[var(--marigold)]" />
              <p className="mt-5 text-sm leading-7 text-[var(--muted)]">Describe your household once. Jeevana maps all 16 life stages for each person, showing what is done, blocked, coming up, or still far away.</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">It then finds the one missing paper that unlocks the most — and turns the next actions into a bilingual card you can print.</p>
              <Link href="/life-map" className="mt-6 inline-flex min-h-11 items-center border-2 border-[var(--ink)] bg-[var(--ink)] px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_var(--marigold)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--marigold)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2">Open the Life Map <span aria-hidden="true" className="ml-2">→</span></Link>
            </div>
            <div className="min-w-0 border border-[var(--ink)] bg-[var(--paper)] p-2 shadow-[6px_6px_0_var(--marigold)] sm:p-4">
              <p className="mb-2 text-center font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Sample family · Concept, not live</p>
              <LifeMap readOnly compact />
            </div>
          </div>
        </section>

        {/* ——— Multi-channel delivery ——— */}
        <section id="reach" className="mt-16 border-y border-[var(--line)] py-12" aria-labelledby="reach-heading">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-center">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--marigold-dark)]">One engine · many ways to reach people</p>
              <h2 id="reach-heading" className="mt-3 max-w-xl font-serif text-3xl font-bold leading-tight sm:text-4xl">Jeevana reaches you where you are</h2>
              <span aria-hidden="true" className="mt-4 block h-1 w-20 bg-[var(--marigold)]" />
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">The same dependency engine can deliver an ordered path on a screen, on paper, or one plain text message at a time. A smartphone should never be the price of knowing what comes next.</p>
              <Link href="/sms-demo" className="mt-6 inline-flex font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--leaf)] underline decoration-[var(--marigold)] decoration-2 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2">Try the interactive SMS preview <span aria-hidden="true" className="ml-2">→</span></Link>
            </div>
            <div className="mx-auto w-full max-w-sm"><VerifiedSmsMock compact /><div className="mt-5 flex flex-wrap justify-center gap-2"><span className="border border-[var(--line)] bg-white px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-wider">SMS · planned</span><span className="border border-[var(--line)] bg-white px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-wider">WhatsApp · planned</span><span className="border border-[var(--line)] bg-white px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-wider">Printable card · in the Life Map</span></div></div>
          </div>
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
              <h3 className="mt-2 font-serif text-lg font-bold text-[var(--ink)]">Choose an event or household</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Choose a life event or describe the people who share your home.</p>
            </li>

            <li className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[var(--leaf)]">02</span>
              <h3 className="mt-2 font-serif text-lg font-bold text-[var(--ink)]">Tell us what you hold</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Answer a few questions or tick the papers already in your folder.</p>
            </li>

            <li className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[var(--leaf)]">03</span>
              <h3 className="mt-2 font-serif text-lg font-bold text-[var(--ink)]">Get the order</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Receive an ordered path, what is blocked, and the one thing to fix first.</p>
            </li>

            <li className="flex flex-col">
              <span className="font-mono text-xs font-bold text-[var(--leaf)]">04</span>
              <h3 className="mt-2 font-serif text-lg font-bold text-[var(--ink)]">Continue officially</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Continue through official sources for the actual service.</p>
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

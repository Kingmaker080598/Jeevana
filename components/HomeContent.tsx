"use client";

import Link from "next/link";
import type { LifeStage } from "@/data/lifeStages";
import { isTeluguEnabled } from "@/lib/features";
import { useLanguage } from "./LanguageProvider";

export function HomeContent({ stages }: Readonly<{ stages: readonly LifeStage[] }>) {
  const { language } = useLanguage();
  const isTelugu = isTeluguEnabled() && language === "te";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="max-w-3xl border-l-8 border-[var(--marigold)] pl-5 sm:pl-8">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[var(--leaf)]">
          {isTelugu ? "ఆంధ్రప్రదేశ్ ప్రజా సేవల మార్గదర్శి" : "Andhra Pradesh public-service guide"}
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-tight text-[var(--ink)] sm:text-6xl">
          {isTelugu ? "జీవితంలోని ముఖ్య దశలకు స్పష్టమైన దారి." : "A clear path through life's important moments."}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          {isTelugu
            ? "జీవన మీ పరిస్థితికి సరిపోయే ప్రభుత్వ సేవల దశలను సరైన క్రమంలో చూపిస్తుంది. కొన్ని ప్రశ్నలకు సమాధానం చెప్పండి; మీకు అవసరమైన రోడ్‌మ్యాప్‌ను పొందండి."
            : "Jeevana puts public-service steps in the right order for your situation. Follow the life spine to see what is available now and what is coming next."}
        </p>
      </section>

      <section className="mt-12" aria-labelledby="life-spine-heading">
        <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-3">
          <h2 id="life-spine-heading" className="font-serif text-2xl font-bold text-[var(--ink)]">
            Life-stage navigator
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            {stages.length} stages · 3 live
          </span>
        </div>

        <ol className="relative mt-6 grid gap-3 before:absolute before:bottom-7 before:left-[1.42rem] before:top-7 before:w-px before:bg-[var(--line)] sm:before:left-[1.67rem]">
          {stages.map((stage) => {
            const number = String(stage.order).padStart(2, "0");
            const content = (
              <>
                <span className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold sm:h-12 sm:w-12 ${stage.status === "live" ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-[var(--paper)] text-[var(--muted)]"}`}>
                  {number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`font-serif text-xl font-bold sm:text-2xl ${stage.status === "live" ? "text-[var(--ink)]" : "text-stone-500"}`}>
                      {stage.title}
                    </span>
                    <span className={`px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${stage.status === "live" ? "bg-[var(--marigold-soft)] text-[var(--marigold-dark)]" : "border border-[var(--line)] text-[var(--muted)]"}`}>
                      {stage.status === "live" ? "Live" : "Planned"}
                    </span>
                  </span>
                  <span className={`mt-1 block text-sm leading-6 ${stage.status === "live" ? "text-[var(--muted)]" : "text-stone-400"}`}>
                    {stage.description}
                  </span>
                </span>
                {stage.status === "live" ? <span aria-hidden="true" className="text-xl text-[var(--leaf)]">→</span> : null}
              </>
            );

            return stage.status === "live" ? (
              <li key={stage.id} aria-label={stage.title}>
                <Link
                  href={`/journey/${stage.journeyId}`}
                  className="flex items-center gap-4 border border-[var(--line)] bg-white p-4 shadow-[3px_3px_0_var(--marigold)] transition-colors hover:border-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2 sm:gap-5"
                >
                  {content}
                </Link>
              </li>
            ) : (
              <li key={stage.id}>
                <div
                  role="group"
                  aria-label={stage.title}
                  aria-disabled="true"
                  className="flex items-center gap-4 border border-stone-200 bg-stone-50/70 p-4 sm:gap-5"
                >
                  {content}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

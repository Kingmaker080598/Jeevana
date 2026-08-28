"use client";

import Link from "next/link";
import type { Journey } from "@/lib/journey/types";
import { isTeluguEnabled } from "@/lib/features";
import { useLanguage } from "./LanguageProvider";

export function HomeContent({ journeys }: Readonly<{ journeys: Journey[] }>) {
  const { language } = useLanguage();
  const enableTelugu = isTeluguEnabled();
  const isTelugu = enableTelugu && language === "te";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
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
            : "Jeevana puts public-service steps in the right order for your situation. Answer a few questions and get a roadmap shaped around what you need."}
        </p>
      </section>

      <section className="mt-12" aria-labelledby="choose-event">
        <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-3">
          <h2 id="choose-event" className="font-serif text-2xl font-bold text-[var(--ink)]">
            {isTelugu ? "ఎక్కడ మొదలుపెట్టాలి?" : "Where do you want to begin?"}
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            {journeys.length} {isTelugu ? "జీవిత దశలు" : "life events"}
          </span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {journeys.map((journey, index) => (
            <Link
              key={journey.id}
              href={`/journey/${journey.id}`}
              className="group flex min-h-56 flex-col justify-between border border-[var(--line)] bg-white p-5 shadow-[4px_4px_0_var(--marigold)] transition-colors hover:border-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
            >
              <span className="font-mono text-xs font-bold text-[var(--marigold-dark)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-serif text-3xl font-bold text-[var(--ink)]">
                  {isTelugu ? journey.name_te : journey.name}
                </h3>
                {enableTelugu ? <p className="mt-2 text-sm text-[var(--muted)]">
                  {isTelugu ? journey.name : journey.name_te}
                </p> : null}
                <p className="mt-5 font-mono text-xs font-bold uppercase tracking-wider text-[var(--leaf)]">
                  {isTelugu ? "దశలను చూడండి →" : "See your steps →"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

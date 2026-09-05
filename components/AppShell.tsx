"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { isTeluguEnabled } from "@/lib/features";
import { JourneyStateProvider } from "./JourneyStateProvider";
import { useJourneyState } from "./JourneyStateProvider";
import { LanguageProvider, useLanguage } from "./LanguageProvider";

function SharedHeader() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const { reset } = useJourneyState();
  const enableTelugu = isTeluguEnabled();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Jeevana — home"
          className="group flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--leaf)] bg-[var(--leaf)] font-serif text-xl font-bold text-[var(--paper)] shadow-[2px_2px_0_var(--marigold)] transition-[transform,box-shadow] group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0_var(--marigold)]"
          >
            J
          </span>
          {enableTelugu ? <span className="font-serif text-lg font-bold text-[var(--marigold-dark)]">జీవన</span> : null}
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-6 lg:flex">
          <Link href="/life-map" className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2">
            Life Map
          </Link>
          <Link href="/#journeys" className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2">
            Journeys
          </Link>
          <Link href="/#how-it-works" className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2">
            How it works
          </Link>
          <Link href="/#roadmap" className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2">
            Roadmap
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden border border-[var(--marigold)] bg-[var(--marigold-soft)] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] sm:inline-block">
            DEMO — synthetic data, independent hackathon prototype
          </span>
          {enableTelugu ? <button
            type="button"
            onClick={toggleLanguage}
            className="min-h-10 border border-[var(--ink)] bg-white px-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
            aria-label={language === "en" ? "Switch to Telugu" : "Switch to English"}
          >
            EN <span className="text-[var(--marigold-dark)]">/</span> తె
          </button> : null}
          <button
            type="button"
            onClick={() => {
              reset();
              router.push("/");
            }}
            className="min-h-10 border border-[var(--line)] bg-transparent px-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
          >
            Start over
          </button>
        </div>
        <span className="w-full border border-[var(--marigold)] bg-[var(--marigold-soft)] px-2 py-1 text-center font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--ink)] sm:hidden">
          DEMO — synthetic data, independent hackathon prototype
        </span>
      </div>
    </header>
  );
}

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <LanguageProvider>
      <JourneyStateProvider>
        <SharedHeader />
        {children}
      </JourneyStateProvider>
    </LanguageProvider>
  );
}

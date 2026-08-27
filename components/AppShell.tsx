"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { JourneyStateProvider } from "./JourneyStateProvider";
import { useJourneyState } from "./JourneyStateProvider";
import { LanguageProvider, useLanguage } from "./LanguageProvider";

function SharedHeader() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const { reset } = useJourneyState();

  return (
    <header className="border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-[var(--ink)]">
          Jeevana <span className="text-[var(--marigold-dark)]">జీవన</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden border border-[var(--marigold)] bg-[var(--marigold-soft)] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] sm:inline-block">
            DEMO — synthetic data, independent hackathon prototype
          </span>
          <button
            type="button"
            onClick={toggleLanguage}
            className="min-h-10 border border-[var(--ink)] bg-white px-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
            aria-label={language === "en" ? "Switch to Telugu" : "Switch to English"}
          >
            EN <span className="text-[var(--marigold-dark)]">/</span> తె
          </button>
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

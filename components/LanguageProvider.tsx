"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isTeluguEnabled } from "@/lib/features";

export type Language = "en" | "te";

interface LanguageContextValue {
  language: Language;
  isHydrated: boolean;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [language, setLanguage] = useState<Language>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setLanguage("en");
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.lang = language;
  }, [isHydrated, language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isHydrated,
      toggleLanguage: () => {
        if (isTeluguEnabled()) {
          setLanguage((current) => (current === "en" ? "te" : "en"));
        }
      },
    }),
    [isHydrated, language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider.");
  return context;
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "te";

const LANGUAGE_STORAGE_KEY = "jeevana:language:v1";

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
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === "en" || stored === "te") setLanguage(stored);
    } catch {
      // A blocked storage API should not prevent the app from loading in English.
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Language selection still works for the current session without persistence.
    }
  }, [isHydrated, language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isHydrated,
      toggleLanguage: () => setLanguage((current) => (current === "en" ? "te" : "en")),
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

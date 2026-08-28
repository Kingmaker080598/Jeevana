import type { Metadata } from "next";
import { DebugJourneys } from "@/components/DebugJourneys";
import { loadJourneys } from "@/lib/journey/loadJourneys";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DebugPage() {
  const journeys = loadJourneys();

  return <DebugJourneys journeys={journeys} />;
}

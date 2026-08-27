import { DebugJourneys } from "@/components/DebugJourneys";
import { loadJourneys } from "@/lib/journey/loadJourneys";

export default function DebugPage() {
  const journeys = loadJourneys();

  return <DebugJourneys journeys={journeys} />;
}

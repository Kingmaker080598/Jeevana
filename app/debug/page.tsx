import { DebugJourneys } from "@/components/DebugJourneys";
import { JourneyStateProvider } from "@/components/JourneyStateProvider";
import { loadJourneys } from "@/lib/journey/loadJourneys";

export default function DebugPage() {
  const journeys = loadJourneys();

  return (
    <JourneyStateProvider>
      <DebugJourneys journeys={journeys} />
    </JourneyStateProvider>
  );
}

import { HomeContent } from "@/components/HomeContent";
import { loadJourneys } from "@/lib/journey/loadJourneys";

export default function HomePage() {
  const journeys = loadJourneys();

  return <HomeContent journeys={journeys} />;
}

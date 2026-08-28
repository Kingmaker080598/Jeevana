import { HomeContent } from "@/components/HomeContent";
import { LIFE_STAGES } from "@/data/lifeStages";
import { summarizeJourneyEvidence } from "@/lib/journey/evidence";
import { loadJourneys } from "@/lib/journey/loadJourneys";

export default function HomePage() {
  const deathJourney = loadJourneys().find((journey) => journey.id === "death");

  if (!deathJourney) {
    throw new Error('Required journey "death" is missing.');
  }

  return (
    <HomeContent
      stages={LIFE_STAGES}
      evidence={summarizeJourneyEvidence(deathJourney)}
    />
  );
}

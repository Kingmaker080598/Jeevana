import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { JourneyRoadmapLayout } from "@/components/JourneyRoadmapLayout";
import { loadJourneys } from "@/lib/journey/loadJourneys";

export default function StepLayout({ children, params }: Readonly<{ children: ReactNode; params: { id: string } }>) {
  const journey = loadJourneys().find(({ id }) => id === params.id);
  if (!journey) notFound();
  return <JourneyRoadmapLayout journey={journey}>{children}</JourneyRoadmapLayout>;
}

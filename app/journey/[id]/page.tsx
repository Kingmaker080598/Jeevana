import { notFound } from "next/navigation";
import { JourneyFlow } from "@/components/JourneyFlow";
import { loadJourneys } from "@/lib/journey/loadJourneys";

export function generateStaticParams() {
  return loadJourneys().map((journey) => ({ id: journey.id }));
}

export default function JourneyPage({ params }: Readonly<{ params: { id: string } }>) {
  const journey = loadJourneys().find(({ id }) => id === params.id);
  if (!journey) notFound();

  return <JourneyFlow journey={journey} />;
}

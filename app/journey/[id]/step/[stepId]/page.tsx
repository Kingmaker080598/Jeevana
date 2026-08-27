import { notFound } from "next/navigation";
import { StepDetail } from "@/components/StepDetail";
import { loadJourneys } from "@/lib/journey/loadJourneys";

export function generateStaticParams() {
  return loadJourneys().flatMap((journey) =>
    journey.steps.map((step) => ({ id: journey.id, stepId: step.id })),
  );
}

export default function StepPage({
  params,
}: Readonly<{ params: { id: string; stepId: string } }>) {
  const journey = loadJourneys().find(({ id }) => id === params.id);
  const step = journey?.steps.find(({ id }) => id === params.stepId);
  if (!journey || !step) notFound();

  return <StepDetail journey={journey} step={step} />;
}

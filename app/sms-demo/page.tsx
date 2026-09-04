import type { Metadata } from "next";
import { SmsDemo } from "@/components/SmsDemo";
import { loadJourneys } from "@/lib/journey/loadJourneys";

export const metadata: Metadata = {
  title: "Jeevana over SMS — concept preview",
  description:
    "A scripted mockup of how Jeevana's guided journeys could work over plain SMS for people without a smartphone or internet access.",
};

export default function SmsDemoPage() {
  return <SmsDemo journeys={loadJourneys()} />;
}

import { HomeContent } from "@/components/HomeContent";
import { LIFE_STAGES } from "@/data/lifeStages";

export default function HomePage() {
  return <HomeContent stages={LIFE_STAGES} />;
}

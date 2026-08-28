import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LIFE_STAGES, LIVE_STAGES, PLANNED_STAGES } from "@/data/lifeStages";
import { LanguageProvider } from "./LanguageProvider";
import { HomeContent } from "./HomeContent";

afterEach(cleanup);

describe("HomeContent", () => {
  it("renders only the three live stages as journey links", () => {
    render(
      <LanguageProvider>
        <HomeContent stages={LIFE_STAGES} />
      </LanguageProvider>,
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/journey/birth",
      "/journey/turning18",
      "/journey/death",
    ]);
    expect(LIVE_STAGES).toHaveLength(3);
    expect(LIFE_STAGES.map((stage) => stage.order)).toEqual(
      Array.from({ length: 16 }, (_, index) => index + 1),
    );
  });

  it("renders planned stages as disabled, non-interactive rows without routes", () => {
    render(
      <LanguageProvider>
        <HomeContent stages={LIFE_STAGES} />
      </LanguageProvider>,
    );

    const plannedStages = PLANNED_STAGES;
    expect(plannedStages).toHaveLength(13);
    expect(plannedStages.every((stage) => !("journeyId" in stage))).toBe(true);

    for (const stage of plannedStages) {
      const row = screen.getByRole("group", { name: stage.title });
      expect(row).toHaveAttribute("aria-disabled", "true");
      expect(row).not.toHaveAttribute("tabindex");
      expect(within(row).queryByRole("link")).not.toBeInTheDocument();
      expect(within(row).getByText("Planned")).toBeInTheDocument();
    }
  });
});

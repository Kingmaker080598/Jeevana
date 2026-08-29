import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LIFE_STAGES, LIVE_STAGES, PLANNED_STAGES } from "@/data/lifeStages";
import { LanguageProvider } from "./LanguageProvider";
import { HomeContent } from "./HomeContent";

afterEach(cleanup);

const deathEvidence = {
  steps: 8,
  departments: 7,
  portals: 6,
  documentedSequences: 0,
};

describe("HomeContent", () => {
  it("renders only the three live stages as journey links", () => {
    render(
      <LanguageProvider>
        <HomeContent stages={LIFE_STAGES} evidence={deathEvidence} />
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
        <HomeContent stages={LIFE_STAGES} evidence={deathEvidence} />
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
      expect(within(row).getByText(stage.description)).toBeInTheDocument();
    }
  });

  it("presents the problem, death-journey evidence, and live journeys in the required order", () => {
    render(
      <LanguageProvider>
        <HomeContent stages={LIFE_STAGES} evidence={deathEvidence} />
      </LanguageProvider>,
    );

    expect(screen.getByText("Built for India. Piloted in Andhra Pradesh.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "After a birth or a death, no one tells you what comes next.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Open now" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "A roadmap for the whole of life",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("The pilot begins with three journeys. The same event-first model can make the rest of life\'s administrative moments easier to navigate.")).toBeInTheDocument();

    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Steps")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Departments involved")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Separate portals")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Places the sequence is documented")).toBeInTheDocument();
  });
});

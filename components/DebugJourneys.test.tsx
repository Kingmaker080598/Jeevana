import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Journey } from "@/lib/journey/types";
import { STORAGE_KEY } from "@/lib/state/journeyState";
import { DebugJourneys } from "./DebugJourneys";
import { JourneyStateProvider } from "./JourneyStateProvider";

const conditionalJourney: Journey = {
  id: "birth",
  name: "Birth",
  name_te: "జననం",
  intakeQuestions: [
    {
      id: "gender",
      prompt: "Gender",
      prompt_te: "లింగం",
      options: [
        { id: "girl", label: "Girl", label_te: "బాలిక" },
        { id: "boy", label: "Boy", label_te: "బాలుడు" },
      ],
    },
  ],
  steps: [
    {
      id: "scholarship",
      name: "Scholarship",
      name_te: "విద్యార్థి వేతనం",
      authority: "Department of Education",
      portal: "https://example.test/scholarship",
      fee: "Free",
      sla: "14 days",
      whyPlain: "Financial support for eligible students.",
      whyPlain_te: "అర్హులైన విద్యార్థులకు ఆర్థిక సహాయం.",
      documents: ["Birth certificate"],
      dependsOn: [],
      conditions: [{ questionId: "gender", equals: "girl" }],
    },
  ],
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("DebugJourneys", () => {
  it("shows resolver output and preserves completion across visibility changes", async () => {
    render(
      <JourneyStateProvider>
        <DebugJourneys journeys={[conditionalJourney]} />
      </JourneyStateProvider>,
    );
    await waitFor(() => expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull());

    expect(screen.getByRole("heading", { name: /Birth/ })).toBeInTheDocument();
    expect(screen.getByText("HIDDEN")).toBeInTheDocument();
    expect(screen.getByText("Personalized")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: /Gender/ }), {
      target: { value: "girl" },
    });
    expect(screen.getByText("UNLOCKED")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Mark Scholarship complete/i }));
    expect(screen.getByText("DONE")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: /Gender/ }), {
      target: { value: "boy" },
    });
    expect(screen.getByText("HIDDEN")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: /Gender/ }), {
      target: { value: "girl" },
    });
    expect(screen.getByText("DONE")).toBeInTheDocument();
  });

  it("renders an explicit empty message for placeholder journeys", () => {
    const placeholder: Journey = {
      id: "death",
      name: "Death",
      name_te: "మరణం",
      intakeQuestions: [],
      steps: [],
    };

    render(
      <JourneyStateProvider>
        <DebugJourneys journeys={[placeholder]} />
      </JourneyStateProvider>,
    );

    expect(screen.getByText("No steps supplied yet.")).toBeInTheDocument();
  });
});

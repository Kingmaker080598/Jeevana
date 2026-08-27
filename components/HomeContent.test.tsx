import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { loadJourneys } from "@/lib/journey/loadJourneys";
import { LanguageProvider } from "./LanguageProvider";
import { HomeContent } from "./HomeContent";

afterEach(cleanup);

describe("HomeContent", () => {
  it("renders all three journeys as entry links", () => {
    render(
      <LanguageProvider>
        <HomeContent journeys={loadJourneys()} />
      </LanguageProvider>,
    );

    expect(screen.getByRole("link", { name: /Birth/ })).toHaveAttribute(
      "href",
      "/journey/birth",
    );
    expect(screen.getByRole("link", { name: /Death/ })).toHaveAttribute(
      "href",
      "/journey/death",
    );
    expect(screen.getByRole("link", { name: /Turning 18/ })).toHaveAttribute(
      "href",
      "/journey/turning18",
    );
  });
});

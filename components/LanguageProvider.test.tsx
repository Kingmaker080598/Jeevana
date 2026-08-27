import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageProvider, useLanguage } from "./LanguageProvider";

function Probe() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button type="button" onClick={toggleLanguage}>
      {language}
    </button>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("LanguageProvider", () => {
  it("persists the selected language", async () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("en");
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("te");
    await waitFor(() =>
      expect(window.localStorage.getItem("jeevana:language:v1")).toBe("te"),
    );
  });

  it("hydrates a stored Telugu preference", async () => {
    window.localStorage.setItem("jeevana:language:v1", "te");
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("te"));
  });
});

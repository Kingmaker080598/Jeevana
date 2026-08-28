import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  document.documentElement.lang = "en";
  vi.unstubAllEnvs();
});

beforeEach(() => vi.stubEnv("NEXT_PUBLIC_ENABLE_TE", "true"));

describe("LanguageProvider", () => {
  it("changes the selected language for the current session", async () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("en");
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("te");
    expect(document.documentElement).toHaveAttribute("lang", "te");
    expect(window.localStorage.getItem("jeevana:language:v1")).toBeNull();
  });

  it("does not hydrate a legacy stored Telugu preference", async () => {
    window.localStorage.setItem("jeevana:language:v1", "te");
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("en"));
  });

  it("forces English and ignores a stored Telugu preference when disabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_TE", "false");
    window.localStorage.setItem("jeevana:language:v1", "te");

    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("en"));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("en");
    expect(document.documentElement).toHaveAttribute("lang", "en");
  });
});

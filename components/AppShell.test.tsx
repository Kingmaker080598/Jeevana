import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllEnvs();
});

describe("AppShell", () => {
  it("hides the language toggle and Telugu brand when Telugu is disabled", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_TE", "false");

    render(<AppShell><p>Citizen content</p></AppShell>);

    expect(screen.queryByRole("button", { name: /Switch to Telugu/ })).not.toBeInTheDocument();
    expect(screen.queryByText("జీవన")).not.toBeInTheDocument();
    expect(screen.getByText("Citizen content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Life Map" })).toHaveAttribute("href", "/life-map");
  });
});

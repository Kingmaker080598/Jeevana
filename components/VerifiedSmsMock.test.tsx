import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { VerifiedSmsMock } from "./VerifiedSmsMock";

afterEach(cleanup);

describe("VerifiedSmsMock", () => {
  it("shows the DLT sender, verification treatment, concept label, and offline signal", () => {
    render(<VerifiedSmsMock />);
    expect(screen.getByText("JD-JEEVNA")).toBeInTheDocument();
    expect(screen.getByText("Verified · Jeevana")).toBeInTheDocument();
    expect(screen.getByText("Concept, not live")).toBeInTheDocument();
    expect(screen.getByLabelText("Signal: 2G, no Wi-Fi")).toBeInTheDocument();
  });

  it("renders the required two-day transactional thread", () => {
    render(<VerifiedSmsMock />);
    expect(screen.getByText("28 Aug 2026")).toBeInTheDocument();
    expect(screen.getByText("29 Aug 2026")).toBeInTheDocument();
    expect(screen.getByText(/You are registered for the Birth journey\. 6 steps in order/)).toBeInTheDocument();
    expect(screen.getByText(/Free birth registration ends in 9 days/)).toBeInTheDocument();
    expect(screen.getByText(/Sravani turns 18 in 9 months/)).toBeInTheDocument();
    expect(screen.getByText("DONE")).toBeInTheDocument();
    expect(screen.getByText(/Step 1 marked done\. Step 2 of 6/)).toHaveTextContent("…");
  });

  it("includes the required DLT registration disclosure", () => {
    render(<VerifiedSmsMock compact />);
    expect(screen.getByText(/Real headers need TRAI DLT registration, which is planned/)).toBeInTheDocument();
  });
});

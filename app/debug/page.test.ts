import { describe, expect, it } from "vitest";
import { metadata } from "./page";

describe("debug route metadata", () => {
  it("prevents search indexing", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

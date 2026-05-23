import { describe, it, expect } from "vitest";
import { formatTravelDate } from "./format";

describe("formatTravelDate", () => {
  it("turns a long-form month and year into MM/YYYY", () => {
    expect(formatTravelDate("April 2026")).toBe("04/2026");
    expect(formatTravelDate("January 2020")).toBe("01/2020");
    expect(formatTravelDate("December 1999")).toBe("12/1999");
  });

  it("is case-insensitive and tolerant of extra whitespace", () => {
    expect(formatTravelDate("april 2026")).toBe("04/2026");
    expect(formatTravelDate("  March   2026 ")).toBe("03/2026");
  });

  it("returns the input unchanged when it isn't a 'Month YYYY' pair", () => {
    expect(formatTravelDate("Spring 2026")).toBe("Spring 2026");
    expect(formatTravelDate("April")).toBe("April");
    expect(formatTravelDate("2026")).toBe("2026");
  });

  it("returns an empty string for empty or missing input", () => {
    expect(formatTravelDate("")).toBe("");
    expect(formatTravelDate(undefined)).toBe("");
    expect(formatTravelDate(null)).toBe("");
  });
});

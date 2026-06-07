import { describe, it, expect } from "vitest";
import { srcsetUrl } from "./srcset";

describe("srcsetUrl", () => {
  it("leaves a plain URL untouched", () => {
    expect(srcsetUrl("/memories/2026/04/australia/01.JPG")).toBe(
      "/memories/2026/04/australia/01.JPG"
    );
  });

  // The bug: a space in the path is a srcset delimiter, so the <source> silently
  // fails and the cover falls back to the AVIF <img> on desktop. Spaces must be
  // percent-encoded for the JPG <source> to match.
  it("percent-encodes spaces so a 'united states' path stays one candidate", () => {
    expect(srcsetUrl("/memories/2025/03/united states/01.JPG")).toBe(
      "/memories/2025/03/united%20states/01.JPG"
    );
  });

  it("encodes every space, not just the first", () => {
    expect(srcsetUrl("/a b/c d/e f.JPG")).toBe("/a%20b/c%20d/e%20f.JPG");
  });

  // Commas separate srcset candidates, so a comma in the URL would split it into
  // two malformed candidates — encode it too.
  it("percent-encodes commas", () => {
    expect(srcsetUrl("/memories/x,y/01.JPG")).toBe("/memories/x%2Cy/01.JPG");
  });

  it("produces a value that parses back to the original path", () => {
    const original = "/memories/2025/03/united states/01.JPG";
    expect(decodeURIComponent(srcsetUrl(original))).toBe(original);
  });
});

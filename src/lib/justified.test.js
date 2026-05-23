import { describe, it, expect } from "vitest";
import { buildJustifiedRows } from "./justified";

// The horizontal space a row actually occupies: its photo widths plus the
// gutters between them. A "full" row equals the container width.
const rowSpan = (row, gutter) =>
  row.photos.reduce((sum, p) => sum + p.width, 0) + gutter * (row.photos.length - 1);

describe("buildJustifiedRows", () => {
  const WIDTH = 1000;
  const TARGET = 200;
  const GUTTER = 20;

  // A deliberately mixed strip — portraits (ratio < 1) and landscapes (> 1) —
  // so the packer has to break it into more than one row.
  const photos = [
    { src: "a", ratio: 1.5 },
    { src: "b", ratio: 0.6667 },
    { src: "c", ratio: 1.5 },
    { src: "d", ratio: 0.6667 },
    { src: "e", ratio: 1.5 },
    { src: "f", ratio: 1.5 },
    { src: "g", ratio: 0.6667 },
  ];

  it("returns no rows for an empty photo list", () => {
    expect(buildJustifiedRows([], WIDTH, TARGET, GUTTER)).toEqual([]);
  });

  it("lays out every photo exactly once, in the original order", () => {
    const rows = buildJustifiedRows(photos, WIDTH, TARGET, GUTTER);
    const laidOut = rows.flatMap((row) => row.photos.map((p) => p.src));
    expect(laidOut).toEqual(photos.map((p) => p.src));
  });

  it("gives every photo in a row the same height", () => {
    const rows = buildJustifiedRows(photos, WIDTH, TARGET, GUTTER);
    for (const row of rows) {
      for (const p of row.photos) expect(p.height).toBeCloseTo(row.height);
    }
  });

  it("preserves each photo's aspect ratio after scaling", () => {
    const rows = buildJustifiedRows(photos, WIDTH, TARGET, GUTTER);
    for (const row of rows) {
      for (const p of row.photos) expect(p.width / p.height).toBeCloseTo(p.ratio);
    }
  });

  it("fills the container width exactly on every row except the last", () => {
    const rows = buildJustifiedRows(photos, WIDTH, TARGET, GUTTER);
    expect(rows.length).toBeGreaterThan(1); // guard: there *is* a non-last row
    for (const row of rows.slice(0, -1)) {
      expect(rowSpan(row, GUTTER)).toBeCloseTo(WIDTH);
    }
  });

  it("never stretches the last row past the container or the target height", () => {
    const rows = buildJustifiedRows(photos, WIDTH, TARGET, GUTTER);
    const last = rows.at(-1);
    expect(rowSpan(last, GUTTER)).toBeLessThanOrEqual(WIDTH + 0.01);
    expect(last.height).toBeLessThanOrEqual(TARGET + 0.01);
  });

  it("keeps a single narrow photo at the target height instead of blowing it up", () => {
    // One landscape far narrower than the container. The last-row rule means it
    // sits at the target height rather than scaling up to fill the width.
    const [row] = buildJustifiedRows([{ src: "x", ratio: 1.5 }], WIDTH, TARGET, GUTTER);
    expect(row.height).toBeCloseTo(TARGET);
    expect(row.photos[0].width).toBeCloseTo(TARGET * 1.5);
  });

  it("treats a photo with no measured ratio as square", () => {
    const [row] = buildJustifiedRows([{ src: "x" }], WIDTH, TARGET, GUTTER);
    expect(row.photos[0].width).toBeCloseTo(row.photos[0].height);
  });
});

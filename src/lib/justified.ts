// Justified gallery layout (Flickr / Squarespace "Strips" style).
// Group photos into rows that fill `containerWidth` exactly at roughly a
// constant `targetRowHeight`. Returns rows: [{ photos: [{...p, width, height}], height }].
//
// Each row's photos are scaled together so their summed widths + gutters equal
// the container width exactly. The last incomplete row is allowed to be SHORTER
// than the target (it never stretches up), so a row of 1–2 photos doesn't run
// absurdly tall. (SPEC §7.2)

// The layout adds a rendered width/height to each input photo.
export interface LaidOut {
  width: number;
  height: number;
}

export interface JustifiedRow<T> {
  photos: Array<T & LaidOut>;
  height: number;
}

export function buildJustifiedRows<T extends { src: string; ratio?: number }>(
  photos: T[],
  containerWidth: number,
  targetRowHeight: number,
  gutter: number
): Array<JustifiedRow<T>> {
  const rows: Array<JustifiedRow<T>> = [];
  let buf: Array<{ p: T; w0: number }> = []; // photos buffered for the current row
  let sumWidths = 0; // sum of photo widths at target row height (no gutters)

  const flush = (final: boolean) => {
    if (buf.length === 0) return;
    const totalGutter = gutter * (buf.length - 1);
    const availableWidth = containerWidth - totalGutter;
    const scale = final
      ? Math.min(1, availableWidth / sumWidths)
      : availableWidth / sumWidths;
    const height = targetRowHeight * scale;
    const items = buf.map(({ p, w0 }) => ({ ...p, width: w0 * scale, height }));
    rows.push({ photos: items, height });
    buf = [];
    sumWidths = 0;
  };

  for (const p of photos) {
    const w0 = targetRowHeight * (p.ratio || 1);
    buf.push({ p, w0 });
    sumWidths += w0;
    const projectedTotal = sumWidths + gutter * (buf.length - 1);
    if (projectedTotal >= containerWidth) flush(false);
  }
  flush(true);
  return rows;
}

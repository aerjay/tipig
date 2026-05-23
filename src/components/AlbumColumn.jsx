import { useEffect, useMemo, useRef, useState } from "react";
import { D2 } from "../theme";
import { Placeholder } from "./Placeholder";
import { buildJustifiedRows } from "../lib/justified";

// The core album layout (SPEC §7.2). On tablet+ it runs the justified-strips
// algorithm against the live container width (measured via ResizeObserver, so
// the layout recomputes on viewport resize). On mobile it falls back to a
// plain single column at natural aspect.
export function AlbumColumn({ album, size, tweaks }) {
  const compact = size === "mobile";
  const mid = size === "tablet";
  const padX = compact ? 22 : mid ? 36 : 56;
  const padTop = compact ? 28 : mid ? 36 : 48;
  const colWidth = compact ? "100%" : mid ? "100%" : "min(1500px, 92%)";

  const tight = tweaks.density === "tight";
  const targetRowHeight = compact ? 360 : mid ? 340 : tight ? 360 : 460;
  const gutter = compact ? 26 : mid ? 38 : tight ? 32 : 64;

  // Aspect tweak: "uniform" coerces every photo to 3:2 landscape.
  const photos = useMemo(
    () =>
      album.photos.map((p) =>
        tweaks.aspect === "uniform" ? { ...p, ratio: 1.5 } : p
      ),
    [album, tweaks.aspect]
  );

  const containerRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    setMeasuredWidth(node.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setMeasuredWidth(e.contentRect.width);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <section style={{ padding: `${padTop}px ${padX}px 0` }}>
      <div ref={containerRef} style={{ width: colWidth, margin: "0 auto" }}>
        {compact ? (
          <MobileColumn photos={photos} gutter={gutter} album={album} />
        ) : measuredWidth > 0 ? (
          <JustifiedRows
            photos={photos}
            width={measuredWidth}
            targetRowHeight={targetRowHeight}
            gutter={gutter}
            album={album}
          />
        ) : null}
      </div>
    </section>
  );
}

// Justified rows for tablet+ widths. Photos sit shoulder-to-shoulder at a
// shared row height; each row fills the container width exactly. Gutters
// within a row equal gutters between rows.
function JustifiedRows({ photos, width, targetRowHeight, gutter, album }) {
  const rows = buildJustifiedRows(photos, width, targetRowHeight, gutter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: gutter }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: gutter, height: row.height }}>
          {row.photos.map((p, pi) => (
            <div
              key={pi}
              style={{
                width: p.width,
                height: p.height,
                flex: "0 0 auto",
                boxShadow: "0 24px 60px -30px rgba(0,0,0,0.75)",
                overflow: "hidden",
              }}
            >
              <Placeholder src={p.src} ratio={p.ratio} alt={album.title} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Mobile fallback: single column of photos at natural aspect, no justification.
function MobileColumn({ photos, gutter, album }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: gutter }}>
      {photos.map((p, i) => (
        <div key={i} style={{ boxShadow: "0 24px 60px -30px rgba(0,0,0,0.75)" }}>
          <Placeholder src={p.src} ratio={p.ratio} alt={album.title} />
        </div>
      ))}
    </div>
  );
}

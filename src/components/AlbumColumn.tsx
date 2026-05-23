import { useEffect, useRef, useState } from "react";
import { D2 } from "../theme";
import { Placeholder } from "./Placeholder";
import { buildJustifiedRows } from "../lib/justified";
import { bySize, pageX } from "../lib/responsive";
import type { Album, Photo, Size } from "../types";

interface AlbumColumnProps {
  album: Album;
  size: Size;
}

// The core album layout (SPEC §7.2). On tablet+ it runs the justified-strips
// algorithm against the live container width (measured via ResizeObserver, so
// the layout recomputes on viewport resize). On mobile it falls back to a
// plain single column at natural aspect.
export function AlbumColumn({ album, size }: AlbumColumnProps) {
  const compact = size === "mobile";
  const colWidth = bySize(size, "100%", "100%", "min(1500px, 92%)");
  const targetRowHeight = bySize(size, 360, 340, 460);
  const gutter = bySize(size, 26, 38, 64);

  const containerRef = useRef<HTMLDivElement>(null);
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
    <section style={{ padding: `${bySize(size, 28, 36, 48)}px ${pageX(size)}px 0` }}>
      <div ref={containerRef} style={{ width: colWidth, margin: "0 auto" }}>
        {compact ? (
          <PhotoColumn photos={album.photos} gutter={gutter} alt={album.title} />
        ) : measuredWidth > 0 ? (
          <JustifiedRows
            photos={album.photos}
            width={measuredWidth}
            targetRowHeight={targetRowHeight}
            gutter={gutter}
            alt={album.title}
          />
        ) : null}
      </div>
    </section>
  );
}

interface JustifiedRowsProps {
  photos: Photo[];
  width: number;
  targetRowHeight: number;
  gutter: number;
  alt: string;
}

// Justified rows for tablet+ widths. Photos sit shoulder-to-shoulder at a
// shared row height; each row fills the container width exactly. Gutters
// within a row equal gutters between rows.
function JustifiedRows({ photos, width, targetRowHeight, gutter, alt }: JustifiedRowsProps) {
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
                boxShadow: D2.photoShadow,
                overflow: "hidden",
              }}
            >
              <Placeholder src={p.src} ratio={p.ratio} alt={alt} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

interface PhotoColumnProps {
  photos: Photo[];
  gutter: number;
  alt: string;
}

// Mobile fallback: single column of photos at natural aspect, no justification.
function PhotoColumn({ photos, gutter, alt }: PhotoColumnProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: gutter }}>
      {photos.map((p, i) => (
        <div key={i} style={{ boxShadow: D2.photoShadow }}>
          <Placeholder src={p.src} ratio={p.ratio} alt={alt} />
        </div>
      ))}
    </div>
  );
}

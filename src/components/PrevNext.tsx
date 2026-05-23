import { D2 } from "../theme";
import { bySize, pageX } from "../lib/responsive";
import type { CSSProperties } from "react";
import type { Album, Size } from "../types";

interface PrevNextProps {
  prev: Album;
  next: Album;
  size: Size;
  onPrev: () => void;
  onNext: () => void;
}

// Previous / Next album row above the footer, with a hairline divider above
// (SPEC §7.3). Wrap-around neighbours are resolved by the caller.
export function PrevNext({ prev, next, size, onPrev, onNext }: PrevNextProps) {
  const compact = size === "mobile";

  const eyebrow: CSSProperties = {
    font: `400 ${compact ? "10px" : "11px"}/1 ${D2.mono}`,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    color: D2.inkSoft,
  };
  const title: CSSProperties = {
    font: `400 ${bySize(size, "20px", "26px", "32px")}/1 ${D2.serif}`,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: D2.ink,
  };

  return (
    <section style={{ padding: `${bySize(size, 56, 80, 110)}px ${pageX(size)}px 0` }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: compact ? 18 : 40,
          alignItems: "baseline",
          borderTop: `1px solid ${D2.rule}`,
          paddingTop: compact ? 26 : 40,
        }}
      >
        <div
          onClick={onPrev}
          style={{
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: compact ? 6 : 10,
          }}
        >
          <div style={eyebrow}>← Previous</div>
          <div style={title}>{prev.title}</div>
        </div>
        <div
          onClick={onNext}
          style={{
            cursor: "pointer",
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
            gap: compact ? 6 : 10,
          }}
        >
          <div style={eyebrow}>Next →</div>
          <div style={title}>{next.title}</div>
        </div>
      </div>
    </section>
  );
}

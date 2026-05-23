import { D2 } from "../theme";
import { Placeholder } from "./Placeholder";
import { formatTravelDate } from "../lib/format";
import type { Album, Size } from "../types";

interface TravelCardProps {
  album: Album;
  size: Size;
  onOpen: () => void;
}

// One album card: uniform 4:5 cover image + a quiet label row beneath. The
// uniform cover aspect is intentional — it gives the home grid a salon-hang
// regularity (SPEC §6, §13). Whole card is clickable.
export function TravelCard({ album, size, onOpen }: TravelCardProps) {
  const compact = size === "mobile";
  const coverSrc = album.cover || album.photos[0]?.src;

  return (
    <article
      onClick={onOpen}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: compact ? 12 : 16,
      }}
    >
      <div style={{ boxShadow: D2.coverShadow }}>
        <Placeholder src={coverSrc} aspect="4/5" alt={album.title} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 14,
          paddingTop: 2,
        }}
      >
        <div
          style={{
            font: `400 ${compact ? "16px" : "18px"}/1.1 ${D2.serif}`,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: D2.ink,
          }}
        >
          {album.title}
        </div>
        <div
          style={{
            font: `400 ${compact ? "11px" : "12px"}/1 ${D2.mono}`,
            letterSpacing: "0.18em",
            color: D2.inkSoft,
            whiteSpace: "nowrap",
          }}
        >
          {formatTravelDate(album.when)}
        </div>
      </div>
    </article>
  );
}

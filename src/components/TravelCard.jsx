import { D2 } from "../theme";
import { Placeholder } from "./Placeholder";
import { formatTravelDate } from "../lib/format";

// One album card: uniform cover image + a quiet label row beneath.
// Uniform cover aspect across all cards is intentional — it gives the home
// grid a salon-hang regularity (SPEC §6, §13). Whole card is clickable.
export function TravelCard({ album, size, tweaks, onOpen }) {
  const compact = size === "mobile";
  const coverAspect = tweaks.aspect === "uniform" ? "3/2" : "4/5";
  const coverSrc = album.cover || (album.photos[0] && album.photos[0].src);
  const date = formatTravelDate(album.when);

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
      <div style={{ boxShadow: "0 28px 70px -30px rgba(0,0,0,0.85)" }}>
        <Placeholder src={coverSrc} aspect={coverAspect} alt={album.title} />
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
          {date}
        </div>
      </div>
    </article>
  );
}

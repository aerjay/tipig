import { D2 } from "../theme";
import { bySize, pageX } from "../lib/responsive";

// The compact 3-tier title block: Country / Cities / Date (SPEC §7.1).
// Centered and deliberately small — the photos are the focus, not the title.
export function AlbumTitle({ album, size }) {
  const compact = size === "mobile";
  return (
    <section
      style={{
        padding: `${bySize(size, 28, 36, 44)}px ${pageX(size)}px ${compact ? 6 : 10}px`,
        textAlign: "center",
      }}
    >
      <h1
        style={{
          font: `400 ${bySize(size, "24px", "30px", "34px")}/1 ${D2.serif}`,
          margin: 0,
          letterSpacing: "0.22em",
          color: D2.ink,
          textTransform: "uppercase",
        }}
      >
        {album.title}
      </h1>
      <div
        style={{
          marginTop: compact ? 10 : 12,
          font: `italic 400 ${compact ? "13px" : "14.5px"}/1.3 ${D2.serifBody}`,
          color: D2.inkSoft,
          letterSpacing: "0.01em",
        }}
      >
        {album.places}
      </div>
      <div
        style={{
          marginTop: compact ? 8 : 10,
          font: `400 ${compact ? "9.5px" : "10.5px"}/1 ${D2.mono}`,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: D2.inkSoft,
        }}
      >
        {album.when}
      </div>
    </section>
  );
}

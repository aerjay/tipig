import { D2 } from "../theme";

// The compact 3-tier title block: Country / Cities / Date (SPEC §7.1).
// Centered and deliberately small — the photos are the focus, not the title.
export function AlbumTitle({ album, size }) {
  const compact = size === "mobile";
  const mid = size === "tablet";
  const padX = compact ? 22 : mid ? 36 : 56;
  return (
    <section
      style={{
        padding: `${compact ? 28 : mid ? 36 : 44}px ${padX}px ${compact ? 6 : 10}px`,
        textAlign: "center",
      }}
    >
      <h1
        style={{
          font: `400 ${compact ? "24px" : mid ? "30px" : "34px"}/1 ${D2.serif}`,
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
